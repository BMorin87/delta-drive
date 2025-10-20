import { useState, useEffect } from "react";
import { useGameStore } from "../gameStore";
import { useStatusStore } from "../statusStore";
import VerticalProgressBar from "./VerticalProgressBar";
import ForageButton from "./ForageButton";
import ForagePanel from "./ForagePanel";
import "../../styles/physiological/PhysiologicalNeeds.css";

const PhysiologicalNeeds = () => {
  const {
    thirst,
    hunger,
    fatigue,
    thirstCapacity,
    hungerCapacity,
    fatigueCapacity,
    isAwarenessUnlocked,
    isForageUnlocked,
  } = useGameStore();

  const {
    activeStatuses,
    cooldowns,
    startStatus,
    cancelStatus,
    calculateVolitionCost,
  } = useStatusStore();

  const [isForagePanelOpen, setIsForagePanelOpen] = useState(false);
  const [showActionButtons, setShowActionButtons] =
    useState(isAwarenessUnlocked);

  // Helper functions to manage state data from the statusStore.
  const isStatusActive = (type) => !!activeStatuses[type];
  const getStatusDuration = (type) => activeStatuses[type]?.duration || 0;
  const getCooldownRemaining = (type) => cooldowns[type] || 0;

  useEffect(() => {
    if (isAwarenessUnlocked) {
      setShowActionButtons(true);
    }
  }, [isAwarenessUnlocked]);

  const handleAction = (actionType) => {
    if (isStatusActive(actionType)) {
      cancelStatus(actionType);
    } else {
      startStatus(actionType);
    }
  };

  const getButtonState = (actionType) => {
    const isActive = isStatusActive(actionType);
    const cooldownRemaining = getCooldownRemaining(actionType);
    const duration = getStatusDuration(actionType);

    // Determine an action button's text, disabled state, and styling based on status.
    if (isActive) {
      return {
        text: `${
          actionType.charAt(0).toUpperCase() + actionType.slice(1)
        }ing... ${Math.ceil(duration)}s`,
        disabled: false,
        className: `action-button ${actionType}-button active`,
      };
    } else if (cooldownRemaining > 0) {
      return {
        text: `Cooldown ${Math.ceil(cooldownRemaining)}s`,
        disabled: true,
        className: `action-button ${actionType}-button cooldown`,
      };
    } else {
      const cost = calculateVolitionCost(actionType);
      return {
        text: `${
          actionType.charAt(0).toUpperCase() + actionType.slice(1)
        } (${cost} 👑)`,
        disabled: false,
        className: `action-button ${actionType}-button`,
      };
    }
  };

  // The physiological data organized for easy rendering.
  const needs = [
    {
      type: "drink",
      current: thirst,
      capacity: thirstCapacity,
      label: "Thirst",
      colorClass: "thirst-bar",
      unlocked: isAwarenessUnlocked,
    },
    {
      type: "eat",
      current: hunger,
      capacity: hungerCapacity,
      label: "Hunger",
      colorClass: "hunger-bar",
      unlocked: isAwarenessUnlocked,
    },
    {
      type: "rest",
      current: fatigue,
      capacity: fatigueCapacity,
      label: "Fatigue",
      colorClass: "fatigue-bar",
      unlocked: isAwarenessUnlocked,
    },
  ];

  const hasSynergyBonus = isStatusActive("drink") && isStatusActive("eat");

  const unlockClass = showActionButtons ? "is-unlocked" : "";

  return (
    <>
      <div className="bars-container">
        {needs.map((need) => {
          const buttonState = getButtonState(need.type);

          return (
            <div key={need.type} className="bar-with-action">
              <VerticalProgressBar
                current={need.current}
                max={need.capacity}
                label={need.label}
                colorClass={need.colorClass}
                height={250}
              />

              {need.unlocked ? (
                // Render the action buttons if they're unlocked.
                <div className={`action-button-wrapper ${unlockClass}`}>
                  <button
                    {...buttonState}
                    onClick={() => handleAction(need.type)}
                  >
                    {buttonState.text}
                  </button>
                </div>
              ) : (
                // Otherwise render a placeholder to stabilize the layout.
                <div className="action-button-wrapper" />
              )}
            </div>
          );
        })}
      </div>

      <div className="tier-note">
        <p>Satisfying physiological needs generates Volition.</p>
        {hasSynergyBonus ? (
          <p className="bonus-indicator is-active">
            🌟 Synergy Bonus Active! +20% efficiency
          </p>
        ) : (
          <p className="bonus-indicator" />
        )}
      </div>

      {isForageUnlocked ? (
        // An optional forage button.
        <div className="forage-section is-unlocked">
          <ForageButton onOpenForage={() => setIsForagePanelOpen(true)} />
        </div>
      ) : (
        <div className="forage-section" />
      )}

      <ForagePanel
        isOpen={isForagePanelOpen}
        onClose={() => setIsForagePanelOpen(false)}
      />
    </>
  );
};

export default PhysiologicalNeeds;
