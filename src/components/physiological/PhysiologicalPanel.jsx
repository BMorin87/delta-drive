import { useGameStore } from "../gameStore";
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
  } = useGameStore();

  const handleDrink = () => {
    // For now, just a placeholder - you can implement the actual drink logic later
    console.log("Drink button clicked!");
    // Future implementation might look like:
    // useGameStore.getState().reduceThirst(amount);
  };

  return (
    <div className="physiological-ui-container">
      <div className="physiological-content">
        <h1 className="tier-title">Physiological Needs</h1>
        <div className="bars-container">
          <div className="bar-with-action">
            <VerticalProgressBar
              current={thirst}
              max={thirstCapacity}
              label="Thirst"
              colorClass="thirst-bar"
              height={250}
            />
            {drinkUnlocked && (
              <button
                className="action-button drink-button"
                onClick={handleDrink}
              >
                Drink
              </button>
            )}
          </div>
          <VerticalProgressBar
            current={hunger}
            max={hungerCapacity}
            label="Hunger"
            colorClass="hunger-bar"
            height={250}
          />
          <VerticalProgressBar
            current={fatigue}
            max={fatigueCapacity}
            label="Fatigue"
            colorClass="fatigue-bar"
            height={250}
          />
        </div>
        <div className="tier-note">
          <p>Fulfill your physiological needs to generate Volition.</p>
        </div>
      </div>
    </div>
  );
};

export default PhysiologicalUI;
