import { create } from "zustand";
import { gameEngine } from "./gameEngine";

export const useGameStore = create((set, get) => ({
  // Game state variables are highly fragile to refactoring and prototyping!
  TICKS_PER_SECOND: 60,
  isRunning: true,

  volition: 1,
  thirst: 1,
  hunger: 1,
  fatigue: 1,

  volitionCapacity: 100,
  thirstCapacity: 100,
  hungerCapacity: 100,
  fatigueCapacity: 100,

  initialVolitionRate: 4 / 60, // 4 per second
  initialThirstRate: 3 / 60,
  initialHungerRate: 2 / 60,
  initialFatigueRate: 1 / 60,

  initialVolitionCapacity: 100,
  initialThirstCapacity: 100,
  initialHungerCapacity: 100,
  initialFatigueCapacity: 100,

  drinkUnlocked: false,
  eatUnlocked: false,
  restUnlocked: false,

  // Stores the change since last tick times TICKS_PER_SECOND.
  resourceRates: {
    volition: 0,
    thirst: 0,
    hunger: 0,
    fatigue: 0,
  },

  // Previous resource values for rate calculation.
  _previousValues: {
    volition: 1,
    thirst: 1,
    hunger: 1,
    fatigue: 1,
  },

  // Actions
  tick: () => gameEngine.tick(),

  spendVolition: (amount) => {
    const state = get();
    if (state.volition >= amount) {
      set({ volition: state.volition - amount });
      return true;
    }
    return false;
  },

  setCapacity: (prop, value) => {
    if (!prop) return;
    set((prev) => ({ ...prev, [prop]: value }));
  },

  togglePause: () =>
    set((state) => ({
      isRunning: !state.isRunning,
    })),

  _updateResourceRates: (oldState, newState) => {
    const resources = ["volition", "thirst", "hunger", "fatigue"];
    const ticksPerSecond = oldState.TICKS_PER_SECOND || 60;
    const newRates = {};

    resources.forEach((resource) => {
      const oldValue = oldState[resource] || 0;
      const newValue = newState[resource] || 0;
      const changePerTick = newValue - oldValue;
      const changePerSecond = changePerTick * ticksPerSecond;
      newRates[resource] = changePerSecond;
    });

    return {
      resourceRates: newRates,
      _previousValues: {
        volition: newState.volition || oldState.volition,
        thirst: newState.thirst || oldState.thirst,
        hunger: newState.hunger || oldState.hunger,
        fatigue: newState.fatigue || oldState.fatigue,
      },
    };
  },
}));

// gameEngine is a singleton that needs access to the store.
gameEngine.setStore(useGameStore);
