import { useGameStore } from "./gameStore";
import { gameEngine } from "./gameEngine";
import VolitionCrown from "./VolitionCrown";
import "../styles/ProgressBars.css";

const thirstCapacity = 100;
const hungerCapacity = 100;
const fatigueCapacity = 100;
const volitionCapacity = 100;

const VerticalProgressBars = () => {
  const { volition, thirst, hunger, fatigue, isRunning, togglePause } =
    useGameStore();

  const VerticalProgressBar = ({
    current,
    max,
    label,
    colorClass,
    height = 200,
  }) => {
    const percentage = Math.min((current / max) * 100, 100);

    return (
      <div className="progress-container">
        <div className="progress-label">{label}</div>
        <div className="progress-bar-wrapper" style={{ height: `${height}px` }}>
          <div className="progress-bar-background">
            <div
              className={`progress-bar-fill ${colorClass}`}
              style={{ height: `${percentage}%` }}
            >
              <div className="progress-shine"></div>
            </div>
          </div>
        </div>
        <div className="progress-values">
          <div className="progress-current">{Math.round(current)}</div>
          <div className="progress-max">/{max}</div>
        </div>
        <div className="progress-percentage">{percentage.toFixed(1)}% full</div>
      </div>
    );
  };

  return (
    <div className="game-layout">
      {/* Fixed Volition Crown in top left */}
      <div className="volition-hud">
        <VolitionCrown current={volition} max={volitionCapacity} />
      </div>

      {/* Main game content */}
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

        <button
          onClick={togglePause}
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
        >
          {isRunning ? "Pause Game" : "Resume Game"}
        </button>

        <div className="demo-note">
          <p>
            Resources update automatically to demonstrate the vertical
            indicators
          </p>
        </div>
      </div>
    </div>
  );
};

const thirstGrowth = 3;
const hungerGrowth = 2;
const fatigueGrowth = 1;
const volitionGrowth = 4;

gameEngine.registerSystem("Thirst", (state) => {
  if (state.thirst == null) return {};

  return {
    thirst: Math.min(thirstCapacity, state.thirst + thirstGrowth),
  };
});

gameEngine.registerSystem("Hunger", (state) => {
  if (state.hunger == null) return {};

  return {
    hunger: Math.min(hungerCapacity, state.hunger + hungerGrowth),
  };
});

gameEngine.registerSystem("Fatigue", (state) => {
  if (state.fatigue == null) return {};

  return {
    fatigue: Math.min(fatigueCapacity, state.fatigue + fatigueGrowth),
  };
});

gameEngine.registerSystem("Volition", (state) => {
  if (state.volition == null) return {};

  return {
    volition: Math.min(volitionCapacity, state.volition + volitionGrowth),
  };
});

export default VerticalProgressBars;
