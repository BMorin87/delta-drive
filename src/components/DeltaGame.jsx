import { useEffect } from "react";
import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import { gameEngine } from "./gameEngine";
import VolitionCrown from "./VolitionCrown";
import PhysiologicalUI from "./physiological/PhysiologicalUI";
import UpgradesPanel from "./physiological/UpgradesPanel";

const DeltaGame = () => {
  const { volition, volitionCapacity, isRunning, togglePause, spendVolition } =
    useGameStore();

  // Register global game systems.
  useEffect(() => {
    const baseVolitionRate = 4;
    const baseThirstRate = 3;
    const baseHungerRate = 2;
    const baseFatigueRate = 1;

    const thirstSystem = (state) => {
      if (state.thirst == null) return {};
      const upgradeState = useUpgradeStore.getState();
      const growthBonus = upgradeState.getUpgradeEffectAtLevel("thirstRate");
      const totalGrowth = baseThirstRate + growthBonus;
      return {
        thirst: Math.min(state.thirstCapacity, state.thirst + totalGrowth),
      };
    };
    gameEngine.registerSystem("Thirst", thirstSystem);

    const hungerSystem = (state) => {
      if (state.hunger == null) return {};
      const upgradeState = useUpgradeStore.getState();
      const growthBonus = upgradeState.getUpgradeEffectAtLevel("hungerRate");
      const totalGrowth = baseHungerRate + growthBonus;
      return {
        hunger: Math.min(state.hungerCapacity, state.hunger + totalGrowth),
      };
    };
    gameEngine.registerSystem("Hunger", hungerSystem);

    const fatigueSystem = (state) => {
      if (state.fatigue == null) return {};
      const upgradeState = useUpgradeStore.getState();
      const growthBonus = upgradeState.getUpgradeEffectAtLevel("fatigueRate");
      const totalGrowth = baseFatigueRate + growthBonus;
      return {
        fatigue: Math.min(state.fatigueCapacity, state.fatigue + totalGrowth),
      };
    };
    gameEngine.registerSystem("Fatigue", fatigueSystem);

    const volitionSystem = (state) => {
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
    };
    gameEngine.registerSystem("Volition", volitionSystem);
    return () => {
      gameEngine.unregisterSystem?.("Thirst");
      gameEngine.unregisterSystem?.("Hunger");
      gameEngine.unregisterSystem?.("Fatigue");
      gameEngine.unregisterSystem?.("Volition");
    };
  }, []);

  return (
    <div className="game-layout">
      <div className="volition-hud">
        <VolitionCrown current={volition} max={volitionCapacity} />
        <button onClick={togglePause} className="pause-btn">
          {isRunning ? "Pause Game" : "Resume Game"}
        </button>
      </div>
      <div className="main-content">
        <PhysiologicalUI />
      </div>
      <div className="upgrades-hud">
        <UpgradesPanel
          currentVolition={volition}
          onSpendVolition={spendVolition}
        />
      </div>
    </div>
  );
};

export default DeltaGame;
