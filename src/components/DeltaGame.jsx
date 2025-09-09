import { useEffect } from "react";
import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import { gameEngine } from "./gameEngine";
import VolitionCrown from "./VolitionCrown";
import PhysiologicalPanel from "./physiological/PhysiologicalPanel";
import UpgradesPanel from "./physiological/UpgradesPanel";

const DeltaGame = () => {
  // Consume game state from the gameStore.
  const {
    volition,
    volitionCapacity,
    initialVolitionRate,
    initialThirstRate,
    initialHungerRate,
    initialFatigueRate,
    isRunning,
    togglePause,
    spendVolition,
  } = useGameStore();

  // Register global game systems.
  useEffect(() => {
    const thirstSystem = (state) => {
      if (state.thirst == null) return {};
      const totalGrowth =
        initialThirstRate +
        useUpgradeStore.getState().getUpgradeEffectAtLevel("thirstRate");
      const cappedValue = Math.min(
        state.thirstCapacity,
        state.thirst + totalGrowth
      );
      return {
        thirst: cappedValue,
      };
    };
    gameEngine.registerSystem("Thirst", thirstSystem);

    const hungerSystem = (state) => {
      if (state.hunger == null) return {};
      const totalGrowth =
        initialHungerRate +
        useUpgradeStore.getState().getUpgradeEffectAtLevel("hungerRate");
      const cappedValue = Math.min(
        state.hungerCapacity,
        state.hunger + totalGrowth
      );
      return {
        hunger: cappedValue,
      };
    };
    gameEngine.registerSystem("Hunger", hungerSystem);

    const fatigueSystem = (state) => {
      if (state.fatigue == null) return {};
      const totalGrowth =
        initialFatigueRate +
        useUpgradeStore.getState().getUpgradeEffectAtLevel("fatigueRate");
      const cappedValue = Math.min(
        state.fatigueCapacity,
        state.fatigue + totalGrowth
      );
      return {
        fatigue: cappedValue,
      };
    };
    gameEngine.registerSystem("Fatigue", fatigueSystem);

    const volitionSystem = (state) => {
      if (state.volition == null) return {};
      const totalGrowth =
        initialVolitionRate +
        useUpgradeStore.getState().getUpgradeEffectAtLevel("volitionRate");
      const cappedValue = Math.min(
        state.volitionCapacity,
        state.volition + totalGrowth
      );
      return {
        volition: cappedValue,
      };
    };
    gameEngine.registerSystem("Volition", volitionSystem);
    return () => {
      gameEngine.unregisterSystem("Thirst");
      gameEngine.unregisterSystem("Hunger");
      gameEngine.unregisterSystem("Fatigue");
      gameEngine.unregisterSystem("Volition");
    };
  });

  return (
    <div className="game-layout">
      {/* Top row for volition and upgrades on smaller screens */}
      <div className="top-row">
        <div className="volition-hud">
          <VolitionCrown current={volition} max={volitionCapacity} />
          <button onClick={togglePause} className="pause-btn">
            {isRunning ? "Pause Game" : "Resume Game"}
          </button>
        </div>
        <div className="upgrades-hud">
          <UpgradesPanel
            currentVolition={volition}
            onSpendVolition={spendVolition}
          />
        </div>
      </div>

      {/* Main content area with progress bars */}
      <div className="tier-content">
        <PhysiologicalPanel />
      </div>
    </div>
  );
};

export default DeltaGame;
