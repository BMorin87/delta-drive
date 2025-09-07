import { useGameStore } from "../gameStore";
import UpgradesPanel from "./UpgradesPanel";
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
  } = useGameStore();

  return (
    <div className="physiological-content">
      <h1 className="tier-title">Physiological Needs</h1>
      <div className="bars-container">
        <VerticalProgressBar
          current={thirst}
          max={thirstCapacity}
          label="Thirst"
          colorClass="thirst-bar"
          height={250}
        />
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
  );
};

export default PhysiologicalUI;
