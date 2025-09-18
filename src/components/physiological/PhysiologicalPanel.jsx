import { useState } from "react";
import { useGameStore } from "../gameStore";
import { useStatusStore } from "../statusStore";
import VerticalProgressBar from "./VerticalProgressBar";
import PhysiologicalUpgradesPanel from "./PhysiologicalUpgradesPanel";
import "../../styles/ProgressBars.css";

const PhysiologicalPanel = () => {
  const [activeView, setActiveView] = useState("progress"); // "progress" or "upgrades"

  const {
    thirst,
    hunger,
    fatigue,
    volition,
    thirstCapacity,
    hungerCapacity,
    fatigueCapacity,
    drinkUnlocked,
    eatUnlocked,
    restUnlocked,
    spendVolition,
  } = useGameStore();

  const {
    activeStatuses,
    cooldowns,
    startStatus,
    cancelStatus,
    calculateVolitionCost,
  } = useStatusStore();

  // Consume the subscribed status variables to ensure re-renders on change.
  const isStatusActive = (type) => !!activeStatuses[type];
  const getStatusDuration = (type) => activeStatuses[type]?.duration || 0;
  const getCooldownRemaining = (type) => cooldowns[type] || 0;

  const handleDrink = () => {
    if (isStatusActive("drink")) {
      cancelStatus("drink");
    } else {
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

  const drinkButtonState = getButtonState("drink");
  const eatButtonState = getButtonState("eat");
  const restButtonState = getButtonState("rest");

  return (
    <div className="physiological-ui-container">
      <div className="physiological-content">
        <h1 className="tier-title">Physiological Needs</h1>

        {/* Toggle buttons */}
        <div className="view-toggle-container">
          <button
            className={`view-toggle-btn ${
              activeView === "progress" ? "active" : ""
            }`}
            onClick={() => setActiveView("progress")}
          >
            Progress
          </button>
          <button
            className={`view-toggle-btn ${
              activeView === "upgrades" ? "active" : ""
            }`}
            onClick={() => setActiveView("upgrades")}
          >
            Upgrades
          </button>
        </div>

        {/* Conditional content based on active view */}
        {activeView === "progress" ? (
          <>
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
                  <button {...drinkButtonState} onClick={handleDrink}>
                    {drinkButtonState.text}
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
                  <button {...eatButtonState} onClick={handleEat}>
                    {eatButtonState.text}
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
                {restUnlocked && (
                  <button {...restButtonState} onClick={handleRest}>
                    {restButtonState.text}
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
          </>
        ) : (
          <PhysiologicalUpgradesPanel
            currentVolition={volition}
            onSpendVolition={spendVolition}
          />
        )}
      </div>
    </div>
  );
};

export default PhysiologicalPanel;
