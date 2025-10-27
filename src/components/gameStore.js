import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { gameEngine } from "./gameEngine";

// This reference is to help reset the game now that there's a base rate upgrade for volition.
const INITIAL_BASE_VOLITION_RATE = 10 / 12;

export const INITIAL_GAME_STATE = {
  // Game state variables are highly fragile to refactoring and prototyping! E.g. statusStore doesn't read TICKS_PER_SECOND from here. :-(
  TICKS_PER_SECOND: 12,
  isRunning: true,
  isFirstLoad: true,

  // Actual canonical resource values.
  volition: 1,
  thirst: 1,
  hunger: 1,
  fatigue: 1,

  water: 5,
  food: 5,
  fibers: 5,

  // TODO: Remove "magic numbers" by referencing TICKS_PER_SECOND in all rate definitions. Possibly outside the store itself?
  baseVolitionRate: INITIAL_BASE_VOLITION_RATE,
  baseThirstRate: 1 / 12,
  baseHungerRate: 0.5 / 12,
  baseFatigueRate: 0.2 / 12,

  volitionCapacity: 100,
  thirstCapacity: 100,
  hungerCapacity: 100,
  fatigueCapacity: 100,

  // TODO: Refactor to remove these and use an INITIAL_BASE_... constant if needed as I did for the volition rate.
  initialVolitionCapacity: 100,
  initialThirstCapacity: 100,
  initialHungerCapacity: 100,
  initialFatigueCapacity: 100,

  isAwarenessUnlocked: false,
  isAgencyUnlocked: false,
  isUpgradePanelUnlocked: false,
  isNavigationUnlocked: false,
  isForageUnlocked: false,

  // Used by _updateResourceRates to store the per-second rate value, i.e. the change since last tick multiplied by the TICKS_PER_SECOND.
  resourceRates: {
    volition: 0,
    thirst: 0,
    hunger: 0,
    fatigue: 0,
  },

  // The previous tick's resource values used for rate calculation.
  _previousValues: {
    volition: 1,
    thirst: 1,
    hunger: 1,
    fatigue: 1,
  },
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_GAME_STATE,

      resetGame: () => {
        useGameStore.persist.clearStorage();
        set({ INITIAL_GAME_STATE, baseVolitionRate: INITIAL_BASE_VOLITION_RATE }, true);
      },

      // Called in App.jsx with useEffect and setInterval.
      tick: () => gameEngine.tick(),

      togglePause: () => set((state) => ({ isRunning: !state.isRunning })),

      markFirstLoadComplete: () => set({ isFirstLoad: false }),

      spendVolition: (amount) => {
        const state = get();
        if (state.volition >= amount) {
          set({ volition: state.volition - amount });
          return true;
        }
        return false;
      },

      awardMaterials: (resources) => {
        set((state) => {
          // Destructure the keys with zero as the default value.
          const { water = 0, food = 0, fibers = 0 } = resources;
          return {
            water: state.water + water,
            food: state.food + food,
            fibers: state.fibers + fibers,
          };
        });
      },

      // Internal function used by the gameEngine to update resource rates used by UI components.
      _updateResourceRates: (oldState, newState) => {
        // The resources currently being tracked.
        const resources = ["volition", "thirst", "hunger", "fatigue"];
        const ticksPerSecond = oldState.TICKS_PER_SECOND || 12;
        const newRates = {};

        // Set the per-second rate for each resource.
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
            // Preserve the old values if the new ones are undefined or falsy (e.g. during initial load).
            volition: newState.volition || oldState.volition,
            thirst: newState.thirst || oldState.thirst,
            hunger: newState.hunger || oldState.hunger,
            fatigue: newState.fatigue || oldState.fatigue,
          },
        };
      },
    }),
    // Persist the game state in localStorage. Other stores handle their own persistence.
    {
      name: "game-storage",
      version: 2,
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        isFirstLoad: state.isFirstLoad,
        volition: state.volition,
        thirst: state.thirst,
        hunger: state.hunger,
        fatigue: state.fatigue,
        water: state.water,
        food: state.food,
        fibers: state.fibers,
        baseVolitionRate: state.baseVolitionRate,
        volitionCapacity: state.volitionCapacity,
        thirstCapacity: state.thirstCapacity,
        hungerCapacity: state.hungerCapacity,
        fatigueCapacity: state.fatigueCapacity,
        isAwarenessUnlocked: state.isAwarenessUnlocked,
        isAgencyUnlocked: state.isAgencyUnlocked,
        isNavigationUnlocked: state.isNavigationUnlocked,
        isForageUnlocked: state.isForageUnlocked,
        isUpgradePanelUnlocked: state.isUpgradePanelUnlocked,
      }),
    }
  )
);

// gameEngine is a singleton that needs access to the store.
gameEngine.setStore(useGameStore);
