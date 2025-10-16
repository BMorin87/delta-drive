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

  // Register the initial game systems with the game engine using a useEffect hook.
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
  // The "base" rates are consumed here in case the base values change via upgrades or other means.
  const {
    initialVolitionRate,
    initialThirstRate,
    initialHungerRate,
    initialFatigueRate,
  } = useGameStore();

  // Hook the initial game systems to the engine once, and re-register if the base rates change.
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
  // The keys have "magic words" to generate the update functions. This balances fragility with extensibility.
  const keys = createUpdateFunctionKeys(
    initialThirstRate,
    initialHungerRate,
    initialFatigueRate,
    initialVolitionRate
  );

  // Hook the update functions to the game engine.
  console.log("Registering game systems with engine.");
  console.log(keys);
  console.log(createUpdateFunction(keys.thirst));
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
      capacityName: "thirstCapacity",
      upgradeRateName: "thirstRate",
      initialRate: initialThirstRate,
    },
    hunger: {
      stat: "hunger",
      capacityName: "hungerCapacity",
      upgradeRateName: "hungerRate",
      initialRate: initialHungerRate,
    },
    fatigue: {
      stat: "fatigue",
      capacityName: "fatigueCapacity",
      upgradeRateName: "fatigueRate",
      initialRate: initialFatigueRate,
    },
    volition: {
      stat: "volition",
      capacityName: "volitionCapacity",
      upgradeRateName: "volitionRate",
      initialRate: initialVolitionRate,
    },
  };
}

function createUpdateFunction(statKeys) {
  const { stat, capacityName, rateName, initialRate } = statKeys;
  return (state) => {
    if (state[stat] == null) {
      return {};
    }
    // Calculate the total growth rate for the current stat by reading the upgradeStore's state.
    const totalGrowth =
      initialRate +
      useUpgradeStore.getState().getUpgradeEffectAtLevel(rateName);
    const cappedValue = Math.min(
      state[capacityName],
      state[stat] + totalGrowth
    );
    return {
      [stat]: cappedValue,
    };
  };
}

export default DeltaGame;
