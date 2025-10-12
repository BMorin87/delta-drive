import { useEffect, useState } from "react";
import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import { gameEngine } from "./gameEngine";
import VolitionCrown from "./VolitionCrown";
import DiscoveryPanel from "./DiscoveryPanel";
import HierarchyNavigation from "./HierarchyNavigation";
import DebugPanel from "./DebugPanel";
import SettingsMenu from "./SettingsMenu";
import "../styles/DeltaGame.css";

const DeltaGame = () => {
  const { isRunning, togglePause } = useGameStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Register the initial game systems with the game engine.
  useGameSystems();

  const handleSettingsToggle = () => {
    if (!isSettingsOpen) {
      if (isRunning) {
        togglePause();
      }
    }
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div className="game-layout">
      <div className="volition-container">
        <VolitionCrown />
        <div className="button-group">
          <button onClick={togglePause} className="pause-btn">
            {isRunning ? "Pause" : "Resume"}
          </button>
          <button onClick={handleSettingsToggle} className="settings-btn">
            ⚙️ Settings
          </button>
        </div>
      </div>

      <SettingsMenu isOpen={isSettingsOpen} onClose={handleSettingsToggle} />

      <div className="discovery-container">
        <DiscoveryPanel />
      </div>
      <HierarchyNavigation />
      <DebugPanel />
    </div>
  );
};

function useGameSystems() {
  // TODO: I don't think these need to consume the initial rates.
  const {
    initialVolitionRate,
    initialThirstRate,
    initialHungerRate,
    initialFatigueRate,
  } = useGameStore();

  useEffect(() => {
    registerGlobalGameSystems(
      initialThirstRate,
      initialHungerRate,
      initialFatigueRate,
      initialVolitionRate
    );

    return () => {
      gameEngine.unregisterSystem("Thirst");
      gameEngine.unregisterSystem("Hunger");
      gameEngine.unregisterSystem("Fatigue");
      gameEngine.unregisterSystem("Volition");
    };
  }, [
    initialThirstRate,
    initialHungerRate,
    initialFatigueRate,
    initialVolitionRate,
  ]);
}

function registerGlobalGameSystems(
  initialThirstRate,
  initialHungerRate,
  initialFatigueRate,
  initialVolitionRate
) {
  const keys = createUpdateFunctionKeys(
    initialThirstRate,
    initialHungerRate,
    initialFatigueRate,
    initialVolitionRate
  );

  gameEngine.registerSystem("Thirst", createUpdateFunction(keys.thirst));
  gameEngine.registerSystem("Hunger", createUpdateFunction(keys.hunger));
  gameEngine.registerSystem("Fatigue", createUpdateFunction(keys.fatigue));
  gameEngine.registerSystem("Volition", createUpdateFunction(keys.volition));
}

function createUpdateFunctionKeys(
  initialThirstRate,
  initialHungerRate,
  initialFatigueRate,
  initialVolitionRate
) {
  return {
    thirst: {
      stat: "thirst",
      capacity: "thirstCapacity",
      upgradeRate: "thirstRate",
      initialRate: initialThirstRate,
    },
    hunger: {
      stat: "hunger",
      capacity: "hungerCapacity",
      upgradeRate: "hungerRate",
      initialRate: initialHungerRate,
    },
    fatigue: {
      stat: "fatigue",
      capacity: "fatigueCapacity",
      upgradeRate: "fatigueRate",
      initialRate: initialFatigueRate,
    },
    volition: {
      stat: "volition",
      capacity: "volitionCapacity",
      upgradeRate: "volitionRate",
      initialRate: initialVolitionRate,
    },
  };
}

function createUpdateFunction(statKeys) {
  const { stat, capacity, upgradeRate, initialRate } = statKeys;
  return (state) => {
    if (state[stat] == null) {
      return {};
    }
    const totalGrowth =
      initialRate +
      useUpgradeStore.getState().getUpgradeEffectAtLevel(upgradeRate);
    const cappedValue = Math.min(state[capacity], state[stat] + totalGrowth);
    return {
      [stat]: cappedValue,
    };
  };
}

export default DeltaGame;
