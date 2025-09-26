import { useGameStore } from "../gameStore";
import { useStatusStore } from "../statusStore";
import VerticalProgressBar from "./VerticalProgressBar";
import "../../styles/ProgressBars.css";

const PhysiologicalNeeds = () => {
  const {
    thirst,
    hunger,
    fatigue,
    thirstCapacity,
    hungerCapacity,
    fatigueCapacity,
    drinkUnlocked,
    eatUnlocked,
    restUnlocked,
  } = useGameStore();

  const {
    activeStatuses,
    cooldowns,
    startStatus,
    cancelStatus,
    calculateVolitionCost,
  } = useStatusStore();

  // Helper functions
  const isStatusActive = (type) => !!activeStatuses[type];
  const getStatusDuration = (type) => activeStatuses[type]?.duration || 0;
  const getCooldownRemaining = (type) => cooldowns[type] || 0;

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
        } (${cost} 💪)`,
        disabled: false,
        className: `action-button ${actionType}-button`,
      };
    }
  };

  // Need configurations for cleaner rendering
  const needs = [
    {
      type: "drink",
      current: thirst,
      capacity: thirstCapacity,
      label: "Thirst",
      colorClass: "thirst-bar",
      unlocked: drinkUnlocked,
    },
    {
      type: "eat",
      current: hunger,
      capacity: hungerCapacity,
      label: "Hunger",
      colorClass: "hunger-bar",
      unlocked: eatUnlocked,
    },
    {
      type: "rest",
      current: fatigue,
      capacity: fatigueCapacity,
      label: "Fatigue",
      colorClass: "fatigue-bar",
      unlocked: restUnlocked,
    },
  ];

  const hasSynergyBonus = isStatusActive("drink") && isStatusActive("eat");

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
              {need.unlocked && (
                <button
                  {...buttonState}
                  onClick={() => handleAction(need.type)}
                >
                  {buttonState.text}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="tier-note">
        <p>Fulfill your physiological needs to generate Volition.</p>
        {hasSynergyBonus && (
          <p className="bonus-indicator">
            🌟 Synergy Bonus Active! +20% efficiency
          </p>
        )}
      </div>
    </>
  );
};

export default PhysiologicalNeeds;
