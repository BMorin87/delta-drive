import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { gameEngine } from "./gameEngine";

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Game state variables are highly fragile to refactoring and prototyping! E.g. statusStore doesn't read TICKS_PER_SECOND from here. :-(
      TICKS_PER_SECOND: 12,
      isRunning: true,

      // Actual canonical resource values.
      volition: 1,
      thirst: 1,
      hunger: 1,
      fatigue: 1,

      volitionCapacity: 100,
      thirstCapacity: 100,
      hungerCapacity: 100,
      fatigueCapacity: 100,

      // Volition's initial rate is 4 per second. Another fragile piece! Can't read another part of the store here, so no TICKS_PER_SECOND.
      initialVolitionRate: 4 / 12,
      initialThirstRate: 3 / 12,
      initialHungerRate: 2 / 12,
      initialFatigueRate: 1 / 12,

      initialVolitionCapacity: 100,
      initialThirstCapacity: 100,
      initialHungerCapacity: 100,
      initialFatigueCapacity: 100,

      isAwarenessUnlocked: false,
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

      // Called in App.jsx with useEffect and setInterval.
      tick: () => gameEngine.tick(),

      spendVolition: (amount) => {
        const state = get();
        if (state.volition >= amount) {
          set({ volition: state.volition - amount });
          return true;
        }
        return false;
      },

      // Bad function name, this will actually set any property in the store. Initially used for the Volition capacity upgrade.
      setCapacity: (prop, value) => {
        if (!prop) return;
        set((prev) => ({ ...prev, [prop]: value }));
      },

      togglePause: () =>
        set((state) => ({
          isRunning: !state.isRunning,
        })),

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
      version: 1,
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        volition: state.volition,
        thirst: state.thirst,
        hunger: state.hunger,
        fatigue: state.fatigue,
        volitionCapacity: state.volitionCapacity,
        thirstCapacity: state.thirstCapacity,
        hungerCapacity: state.hungerCapacity,
        fatigueCapacity: state.fatigueCapacity,
        isAwarenessUnlocked: state.isAwarenessUnlocked,
        isNavigationUnlocked: state.isNavigationUnlocked,
        isForageUnlocked: state.isForageUnlocked,
      }),
    }
  )
);

// gameEngine is a singleton that needs access to the store.
gameEngine.setStore(useGameStore);
