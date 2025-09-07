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
    <div className="main-content">
      <h1 className="app-title">Physiological Needs</h1>
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
      <div className="demo-note">
        <p>
          Resources update automatically to demonstrate the vertical indicators
        </p>
      </div>
    </div>
  );
};

export default PhysiologicalUI;
