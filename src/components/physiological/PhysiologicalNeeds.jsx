import { useState, useEffect } from "react";
import { useGameStore } from "../gameStore";
import { useStatusStore } from "../statusStore";
import VerticalProgressBar from "./VerticalProgressBar";
import ForageButton from "./ForageButton";
import ForagePanel from "./ForagePanel";
import "../../styles/physiological/PhysiologicalNeeds.css";
import "../../styles/ProgressBars.css";

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

  // The physiological needs data organized for easy rendering.
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

          // If the forage window is open, cull the bars by returning a placeholder div. Otherwise render the bar with optional action button.
          if (isForagePanelOpen) {
            return <div key={need.type} style={{ height: 376 }} />;
          } else {
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
                  <div className={`action-button-wrapper ${unlockClass}`}>
                    <button
                      {...buttonState}
                      onClick={() => handleAction(need.type)}
                    >
                      {buttonState.text}
                    </button>
                  </div>
                ) : (
                  // Placeholder to reserve space while actions are locked
                  <div className="action-button-wrapper" />
                )}
              </div>
            );
          }
        })}
      </div>

      <div className="tier-note">
        <p>Satisfying physiological needs generates Volition.</p>
        {hasSynergyBonus && (
          <p className="bonus-indicator">
            🌟 Synergy Bonus Active! +20% efficiency
          </p>
        )}
      </div>

      {isForageUnlocked && (
        // An optional forage button below the bars.
        <div className="forage-section">
          <h3>Exploration</h3>
          <div className="forage-container">
            <ForageButton onOpenForage={() => setIsForagePanelOpen(true)} />
            <p className="forage-description">
              Search for resources in the wilderness
            </p>
          </div>
        </div>
      )}

      <ForagePanel
        isOpen={isForagePanelOpen}
        onClose={() => setIsForagePanelOpen(false)}
      />
    </>
  );
};

export default PhysiologicalNeeds;
