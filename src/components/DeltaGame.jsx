import { useGameStore } from "./gameStore";
import { createUpgradeStore } from "./upgradeStore";
import { gameEngine } from "./gameEngine";
import UpgradesPanel from "./UpgradesPanel";
import VolitionCrown from "./VolitionCrown";
import "../styles/ProgressBars.css";

export const useUpgradeStore = createUpgradeStore(useGameStore);

const VerticalProgressBars = () => {
  const {
    volition,
    thirst,
    hunger,
    fatigue,
    volitionCapacity,
    thirstCapacity,
    hungerCapacity,
    fatigueCapacity,
    isRunning,
    spendVolition,
    togglePause,
  } = useGameStore();

  const getUpgradeEffectAtLevel = useUpgradeStore(
    (state) => state.getUpgradeEffectAtLevel
  );

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

        <UpgradesPanel
          currentVolition={volition}
          onSpendVolition={spendVolition}
        />

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

const baseVolitionRate = 4;
const baseThirstRate = 3;
const baseHungerRate = 2;
const baseFatigueRate = 1;

gameEngine.registerSystem("Thirst", (state) => {
  if (state.thirst == null) return {};

  const upgradeState = useUpgradeStore.getState();
  const growthBonus = upgradeState.getUpgradeEffectAtLevel("thirstRate");
  const totalGrowth = baseThirstRate + growthBonus;

  return {
    thirst: Math.min(state.thirstCapacity, state.thirst + totalGrowth),
  };
});

gameEngine.registerSystem("Hunger", (state) => {
  if (state.hunger == null) return {};

  const upgradeState = useUpgradeStore.getState();
  const growthBonus = upgradeState.getUpgradeEffectAtLevel("hungerRate");
  const totalGrowth = baseHungerRate + growthBonus;

  return {
    hunger: Math.min(state.hungerCapacity, state.hunger + totalGrowth),
  };
});

gameEngine.registerSystem("Fatigue", (state) => {
  if (state.fatigue == null) return {};

  const upgradeState = useUpgradeStore.getState();
  const growthBonus = upgradeState.getUpgradeEffectAtLevel("fatigueRate");
  const totalGrowth = baseFatigueRate + growthBonus;

  return {
    fatigue: Math.min(state.fatigueCapacity, state.fatigue + totalGrowth),
  };
});

gameEngine.registerSystem("Volition", (state) => {
  if (state.volition == null) return {};

  const upgradeState = useUpgradeStore.getState();
  const growthBonus = upgradeState.getUpgradeEffectAtLevel("volitionRate");
  const totalGrowth = baseVolitionRate + growthBonus;

  return {
    volition: Math.min(
      state.volitionCapacity ?? 100,
      (state.volition ?? 0) + totalGrowth
    ),
  };
});

export default VerticalProgressBars;
