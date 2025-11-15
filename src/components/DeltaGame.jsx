import { useEffect, useState } from "react";
import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import { gameEngine } from "./gameEngine";
import GameHeader from "./GameHeader";
import VolitionCrown from "./VolitionCrown";
import HierarchyNavigation from "./HierarchyNavigation";
import DebugPanel from "./DebugPanel";
import "../styles/DeltaGame.css";

const DeltaGame = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Register the initial game systems with the engine.
  useRegisterGameSystem("volition", "baseVolitionRate", "volitionCapacity", "volitionRate");
  useRegisterGameSystem("thirst", "baseThirstRate", "thirstCapacity", "thirstRate");
  useRegisterGameSystem("hunger", "baseHungerRate", "hungerCapacity", "hungerRate");
  useRegisterGameSystem("fatigue", "baseFatigueRate", "fatigueCapacity", "fatigueRate");

  // Listen for Shift+D to toggle the debug panel display.
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.shiftKey && event.key === "D") {
        event.preventDefault();
        setShowDebugPanel((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="game-layout">
      <GameHeader />
      <VolitionCrown />
      <HierarchyNavigation />
      {showDebugPanel && <DebugPanel />}
    </div>
  );
};

function useRegisterGameSystem(statName, baseRateName, capacityName, upgradeRateName) {
  useEffect(() => {
    const update = createUpdateFunction(statName, baseRateName, capacityName, upgradeRateName);
    gameEngine.registerSystem(statName, update);
    return () => gameEngine.unregisterSystem(statName);
    // These are hardcoded strings but the linter requires the dependency array.
  }, [statName, baseRateName, capacityName, upgradeRateName]);
}

// This is the function called for each system (volition, thirst, etc.) when the gameEngine ticks.
function createUpdateFunction(statName, baseRateName, capacityName, upgradeRateName) {
  return (state) => {
    if (state[statName] == null) return {};

    const baseRate = useGameStore.getState()[baseRateName];
    const upgradeEffect = useUpgradeStore.getState().getUpgradeEffectAtLevel(upgradeRateName);
    const totalGrowth = baseRate * upgradeEffect;

    const cappedValue = Math.min(state[capacityName], state[statName] + totalGrowth);
    return { [statName]: cappedValue };
  };
}

export default DeltaGame;
