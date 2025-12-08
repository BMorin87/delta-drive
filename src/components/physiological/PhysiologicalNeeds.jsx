import { useState, useCallback, useMemo } from "react";
import { useGameStore } from "../gameStore";
import { useStatusStore } from "../statusStore";
import VerticalProgressBar from "./VerticalProgressBar";
import ForageButton from "./ForageButton";
import ForagePanel from "./ForagePanel";
import "../../styles/physiological/PhysiologicalNeeds.css";

const MATERIAL_ICONS = {
  water: "💧",
  food: "🍎",
  fibers: "🌿",
};

const PhysiologicalNeeds = () => {
  const thirst = useGameStore((state) => state.thirst);
  const hunger = useGameStore((state) => state.hunger);
  const fatigue = useGameStore((state) => state.fatigue);
  const thirstCapacity = useGameStore((state) => state.thirstCapacity);
  const hungerCapacity = useGameStore((state) => state.hungerCapacity);
  const fatigueCapacity = useGameStore((state) => state.fatigueCapacity);
  const isAgencyUnlocked = useGameStore((state) => state.isAgencyUnlocked);
  const isForageUnlocked = useGameStore((state) => state.isForageUnlocked);

  const activeStatuses = useStatusStore((state) => state.activeStatuses ?? {});
  const cooldowns = useStatusStore((state) => state.cooldowns ?? {});

  const startStatus = useStatusStore((state) => state.startStatus);
  const cancelStatus = useStatusStore((state) => state.cancelStatus);
  const getCostDisplay = useStatusStore((state) => state.getCostDisplay);
  const canAfford = useStatusStore((state) => state.canAfford);

  const [isForagePanelOpen, setIsForagePanelOpen] = useState(false);

  // Create stable references for simple functions that read status/cooldown data.
  const isStatusActive = useCallback((type) => !!activeStatuses[type], [activeStatuses]);
  const getStatusDuration = useCallback(
    (type) => activeStatuses[type]?.duration ?? 0,
    [activeStatuses]
  );
  const getCooldownRemaining = useCallback((type) => cooldowns[type] ?? 0, [cooldowns]);

  // Create a generic click handler for the action buttons.
  const handleAction = useCallback(
    (actionType) => {
      if (isStatusActive(actionType)) {
        cancelStatus(actionType);
      } else {
        startStatus(actionType);
      }
    },
    [isStatusActive, cancelStatus, startStatus]
  );

  // Compute the full button state and return button text, an isDisabled bool, and class data.
  const getButtonState = useCallback(
    (actionType) => {
      const isActive = isStatusActive(actionType);
      const duration = getStatusDuration(actionType);
      const cooldownRemaining = getCooldownRemaining(actionType);

      // Store functions are stable references.
      const costDisplay = getCostDisplay(actionType);
      const affordable = canAfford(actionType);
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

      // Determine an action button's text, disabled state, and styling based on status.
      if (isActive) {
        return {
          text: `${capitalize(actionType)}ing... ${Math.ceil(duration)}s`,
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
        // Build cost display text
        let costText = "";
        if (costDisplay.material) {
          const icon = MATERIAL_ICONS[costDisplay.material] || "";
          costText = `${icon}${costDisplay.materialAmount}`;
          if (costDisplay.volition > 0) {
            costText += ` + 👑${costDisplay.volition}`;
          }
        } else if (costDisplay.volition > 0) {
          costText = `👑${costDisplay.volition}`;
        }

        return {
          text: `${capitalize(actionType)} (${costText})`,
          disabled: !affordable,
          className: `action-button ${actionType}-button${!affordable ? " insufficient" : ""}`,
        };
      }
    },
    [isStatusActive, getStatusDuration, getCooldownRemaining, getCostDisplay, canAfford]
  );

  // Define the data and button state for each displayed need.
  const needsWithMemoizedButtonState = useMemo(() => {
    // 1. Define the "needs" data.
    const needs = [
      {
        type: "drink",
        current: thirst,
        capacity: thirstCapacity,
        label: "Thirst",
        colorClass: "thirst-bar",
      },
      {
        type: "eat",
        current: hunger,
        capacity: hungerCapacity,
        label: "Hunger",
        colorClass: "hunger-bar",
      },
      {
        type: "rest",
        current: fatigue,
        capacity: fatigueCapacity,
        label: "Fatigue",
        colorClass: "fatigue-bar",
      },
    ];

    // 2. Map over the array and call the stable `getButtonState` function.
    return needs.map((need) => ({
      ...need,
      buttonState: getButtonState(need.type),
    }));
  }, [thirst, hunger, fatigue, thirstCapacity, hungerCapacity, fatigueCapacity, getButtonState]);

  const hasSynergyBonus = isStatusActive("drink") && isStatusActive("eat");

  return (
    <>
      <div className="bars-container">
        {/* NEW: Container for the three bars to maintain their spacing */}
        <div className="bars-row">
          {needsWithMemoizedButtonState.map((need) => {
            const { buttonState } = need;

            return (
              <div key={need.type} className="bar-with-action">
                <VerticalProgressBar
                  current={need.current}
                  max={need.capacity}
                  label={need.label}
                  colorClass={need.colorClass}
                  height={250}
                />

                {isAgencyUnlocked ? (
                  <div className={`action-button-wrapper is-unlocked`}>
                    <button {...buttonState} onClick={() => handleAction(need.type)}>
                      {buttonState.text}
                    </button>
                  </div>
                ) : (
                  <div className="action-button-wrapper" />
                )}
              </div>
            );
          })}
        </div>
        {isAgencyUnlocked && (
          <p className="volition-note">
            Satisfy physiological needs to generate more 👑&nbsp;Volition.
          </p>
        )}
      </div>

      <div className="tier-note">
        {hasSynergyBonus ? (
          <p className="bonus-indicator is-active">🌟 Synergy Bonus Active! +20% efficiency</p>
        ) : (
          <p className="bonus-indicator" />
        )}
      </div>

      {isForageUnlocked ? (
        <div className="forage-section is-unlocked">
          <ForageButton onOpenForage={() => setIsForagePanelOpen(true)} />
        </div>
      ) : (
        <div className="forage-section" />
      )}

      <ForagePanel isOpen={isForagePanelOpen} onClose={() => setIsForagePanelOpen(false)} />
    </>
  );
};

export default PhysiologicalNeeds;
