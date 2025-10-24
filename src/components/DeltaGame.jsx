import { useEffect, useState } from "react";
import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import { gameEngine } from "./gameEngine";
import GameHeader from "./GameHeader";
import VolitionCrown from "./VolitionCrown";
import DiscoveryPanel from "./DiscoveryPanel";
import HierarchyNavigation from "./HierarchyNavigation";
import DebugPanel from "./DebugPanel";
import "../styles/DeltaGame.css";

const DeltaGame = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const isFirstLoad = useGameStore((state) => state.isFirstLoad);
  const markFirstLoadComplete = useGameStore((state) => state.markFirstLoadComplete);

  // Register the initial game systems with the game engine using a useEffect hook.
  useGameSystems();

  // Wait a couple seconds on first load, then mark it complete. Used for initial animations.
  useEffect(() => {
    if (isFirstLoad) {
      const timer = setTimeout(() => {
        markFirstLoadComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad, markFirstLoadComplete]);

  // Listen for Shift+D to toggle the debug panel display.
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setShowDebugPanel((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Animate the DiscoveryPanel's first load.
  const introClass = isFirstLoad ? "first-load" : "";

  return (
    <div className="game-layout">
      <GameHeader />
      <VolitionCrown />
      <DiscoveryPanel introClass={introClass} />
      <HierarchyNavigation />
      {showDebugPanel && <DebugPanel />}
    </div>
  );
};

function useGameSystems() {
  const baseVolitionRate = useGameStore((state) => state.baseVolitionRate);
  const baseThirstRate = useGameStore((state) => state.baseThirstRate);
  const baseHungerRate = useGameStore((state) => state.baseHungerRate);
  const baseFatigueRate = useGameStore((state) => state.baseFatigueRate);

  // Register the systems individually.
  useRegisterSystem("volition", "volitionCapacity", "volitionRate", baseVolitionRate);
  useRegisterSystem("thirst", "thirstCapacity", "thirstRate", baseThirstRate);
  useRegisterSystem("hunger", "hungerCapacity", "hungerRate", baseHungerRate);
  useRegisterSystem("fatigue", "fatigueCapacity", "fatigueRate", baseFatigueRate);
}

function useRegisterSystem(statName, capacityName, upgradeRateName, baseRate) {
  useEffect(() => {
    const systemName = statName.charAt(0).toUpperCase() + statName.slice(1);
    gameEngine.registerSystem(
      systemName,
      createUpdateFunction(statName, capacityName, upgradeRateName, baseRate)
    );
    return () => gameEngine.unregisterSystem(systemName);
    // Only the baseRate can actually change at the moment. Being explicit kept the linter happy though.
  }, [statName, capacityName, upgradeRateName, baseRate]);
}

function createUpdateFunction(statName, capacityName, upgradeRateName, baseRate) {
  return (state) => {
    if (state[statName] == null) {
      return {};
    }
    const totalGrowth =
      baseRate * useUpgradeStore.getState().getUpgradeEffectAtLevel(upgradeRateName);
    const cappedValue = Math.min(state[capacityName], state[statName] + totalGrowth);
    return { [statName]: cappedValue };
  };
}

export default DeltaGame;
