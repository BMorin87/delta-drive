import { useGameStore } from "../gameStore";
import { useStatusStore } from "../statusStore";
import VerticalProgressBar from "./VerticalProgressBar";
import "../../styles/ProgressBars.css";

const PhysiologicalUI = () => {
  const {
    thirst,
    hunger,
    fatigue,
    thirstCapacity,
    hungerCapacity,
    fatigueCapacity,
    drinkUnlocked,
    eatUnlocked,
    nestUnlocked,
  } = useGameStore();

  // Subscribe to statusStore state to trigger re-renders
  const {
    startStatus,
    cancelStatus,
    calculateVolitionCost,
    isStatusActive,
    getStatusDuration,
    getCooldownRemaining,
  } = useStatusStore();

  const handleDrink = () => {
    if (isStatusActive("drink")) {
      // Cancel if active
      cancelStatus("drink");
    } else {
      // Start drinking
      startStatus("drink");
    }
  };

  const handleEat = () => {
    if (isStatusActive("eat")) {
      cancelStatus("eat");
    } else {
      startStatus("eat");
    }
  };

  const handleRest = () => {
    if (isStatusActive("rest")) {
      cancelStatus("rest");
    } else {
      startStatus("rest");
    }
  };

  // Helper function to get button text and state
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
        } (${cost}v)`,
        disabled: false,
        className: `action-button ${actionType}-button`,
      };
    }
  };

  return (
    <div className="physiological-ui-container">
      <div className="physiological-content">
        <h1 className="tier-title">Physiological Needs</h1>
        <div className="bars-container">
          {/* Thirst Bar with Drink Action */}
          <div className="bar-with-action">
            <VerticalProgressBar
              current={thirst}
              max={thirstCapacity}
              label="Thirst"
              colorClass="thirst-bar"
              height={250}
            />
            {drinkUnlocked && (
              <button {...getButtonState("drink")} onClick={handleDrink}>
                {getButtonState("drink").text}
              </button>
            )}
          </div>

          {/* Hunger Bar with Eat Action */}
          <div className="bar-with-action">
            <VerticalProgressBar
              current={hunger}
              max={hungerCapacity}
              label="Hunger"
              colorClass="hunger-bar"
              height={250}
            />
            {eatUnlocked && (
              <button {...getButtonState("eat")} onClick={handleEat}>
                {getButtonState("eat").text}
              </button>
            )}
          </div>

          {/* Fatigue Bar with Rest Action */}
          <div className="bar-with-action">
            <VerticalProgressBar
              current={fatigue}
              max={fatigueCapacity}
              label="Fatigue"
              colorClass="fatigue-bar"
              height={250}
            />
            {nestUnlocked && (
              <button {...getButtonState("rest")} onClick={handleRest}>
                {getButtonState("rest").text}
              </button>
            )}
          </div>
        </div>
        <div className="tier-note">
          <p>Fulfill your physiological needs to generate Volition.</p>
          {isStatusActive("drink") && isStatusActive("eat") && (
            <p className="bonus-indicator">
              🌟 Synergy Bonus Active! +20% efficiency
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhysiologicalUI;
