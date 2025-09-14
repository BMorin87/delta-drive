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

  // Run on first mount only.
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
    // Re-register if initial rates change for some reason.
    initialThirstRate,
    initialHungerRate,
    initialFatigueRate,
    initialVolitionRate,
  ]);

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

// Initial rates are passed in to allow re-registration if they ever change.
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
  // "Magic" names used to refer to state variables in the gameStore and upgradeStore.
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
      useUpgradeStore.getState().getUpgradeEffectAtLevel(state[upgradeRate]);
    const cappedValue = Math.min(state[capacity], state[stat] + totalGrowth);
    return {
      [stat]: cappedValue,
    };
  };
}

export default DeltaGame;
