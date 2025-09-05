import { create } from "zustand";
import { gameEngine } from "./gameEngine";

export const useGameStore = create((set, get) => ({
  // Game state.
  volition: 0,
  thirst: 0,
  hunger: 0,
  fatigue: 0,

  volitionCapacity: 100,
  thirstCapacity: 100,
  hungerCapacity: 100,
  fatigueCapacity: 100,

  baseVolitionCapacity: 100,
  baseThirstCapacity: 100,
  baseHungerCapacity: 100,
  baseFatigueCapacity: 100,

  isRunning: true,

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
}));

gameEngine.setStore(useGameStore);
