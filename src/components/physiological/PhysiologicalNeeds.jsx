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
  // --- 1. STATE SUBSCRIPTIONS ---
  // Game Store Slices (bar data)
  const thirst = useGameStore((state) => state.thirst);
  const hunger = useGameStore((state) => state.hunger);
  const fatigue = useGameStore((state) => state.fatigue);
  const thirstCapacity = useGameStore((state) => state.thirstCapacity);
  const hungerCapacity = useGameStore((state) => state.hungerCapacity);
  const fatigueCapacity = useGameStore((state) => state.fatigueCapacity);
  const isAgencyUnlocked = useGameStore((state) => state.isAgencyUnlocked);
  const isForageUnlocked = useGameStore((state) => state.isForageUnlocked);

  // Status Store Slices (status/cooldown data)
  const activeStatuses = useStatusStore((state) => state.activeStatuses ?? {});
  const cooldowns = useStatusStore((state) => state.cooldowns ?? {});

  // Status Store Functions (Actions/Getters) - Stable References
  const startStatus = useStatusStore((state) => state.startStatus);
  const cancelStatus = useStatusStore((state) => state.cancelStatus);
  const getCostDisplay = useStatusStore((state) => state.getCostDisplay);
  const canAfford = useStatusStore((state) => state.canAfford);

  const [isForagePanelOpen, setIsForagePanelOpen] = useState(false);

  // --- 2. MEMOIZED HELPERS (useCallback) ---
  // Create stable references for simple functions that read status/cooldown data.
  const isStatusActive = useCallback((type) => !!activeStatuses[type], [activeStatuses]);
  const getStatusDuration = useCallback(
    (type) => activeStatuses[type]?.duration ?? 0,
    [activeStatuses]
  );
  const getCooldownRemaining = useCallback((type) => cooldowns[type] ?? 0, [cooldowns]);

  // Create a stable handler for the main button action.
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

  // Create a stable function to compute the full button state.
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
    [
      // Dependencies needed for logic inside this function:
      isStatusActive,
      getStatusDuration,
      getCooldownRemaining, // Memoized helpers (stable)
      getCostDisplay,
      canAfford, // Store functions (stable)
    ]
  );

  // --- 3. MEMOIZED RENDER DATA (useMemo) ---
  // The needsWithMemoizedButtonState array is now clean and easy to read.
  const needsWithMemoizedButtonState = useMemo(() => {
    // 1. Define the base needs data.
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
  }, [
    // Dependencies that affect the result: bar data (current/capacity) and the button state function.
    thirst,
    hunger,
    fatigue,
    thirstCapacity,
    hungerCapacity,
    fatigueCapacity,
    getButtonState,
  ]);

  // Synergy check uses the stable helper
  const hasSynergyBonus = isStatusActive("drink") && isStatusActive("eat");

  // --- 4. RENDER ---
  return (
    <>
      <div className="bars-container">
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

      <div className="tier-note">
        <p>Satisfy physiological needs to generate more 👑&nbsp;Volition.</p>
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
