import { create } from "zustand";

export const useGameStore = create((set, get) => ({
  // Game state.
  gold: 0,
  miners: 0,
  isRunning: true,

  // Actions
  tick: () =>
    set((state) => ({
      gold: state.gold + state.miners,
    })),

  mineGold: () =>
    set((state) => ({
      gold: state.gold + 1,
    })),

  buyMiner: () => {
    const state = get();
    const cost = (state.miners + 1) * 10;
    if (state.gold >= cost) {
      set({
        gold: state.gold - cost,
        miners: state.miners + 1,
      });
    }
  },

  togglePause: () =>
    set((state) => ({
      isRunning: !state.isRunning,
    })),
}));
