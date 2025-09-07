import { create } from "zustand";
import { useGameStore } from "./gameStore";

// Factory function for creating the upgrade store
export const useUpgradeStore = create((set, get) => ({
  // The state.
  upgrades: {
    volitionRate: { level: 0, baseCost: 10 },
    volitionCapacity: { level: 0, baseCost: 15 },
    thirstRate: { level: 0, baseCost: 8 },
    hungerRate: { level: 0, baseCost: 12 },
    fatigueRate: { level: 0, baseCost: 6 },
  },

  // Actions
  getUpgradeCost: (upgradeId) => {
    const upgrade = get().upgrades[upgradeId];
    if (!upgrade) return 0;
    return Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
  },

  getUpgradeLevel: (upgradeId) => get().upgrades[upgradeId]?.level ?? 0,

  canAffordUpgrade: (upgradeId) => {
    const cost = get().getUpgradeCost(upgradeId);
    return useGameStore.getState().volition >= cost;
  },

  getUpgradeEffectAtLevel: (upgradeId, requestedLevel) => {
    const level = requestedLevel ?? get().upgrades[upgradeId]?.level ?? 0;
    switch (upgradeId) {
      case "volitionRate":
        return level * 2; // +2 volition per tick per level
      case "volitionCapacity":
        return level * 25; // +25 capacity per level
      case "thirstRate":
        return level * 1;
      case "hungerRate":
        return level * 1;
      case "fatigueRate":
        return level * 0.5;
      default:
        return 0;
    }
  },

  purchaseUpgrade: (upgradeId) => {
    const upgradeStore = get();
    const cost = upgradeStore.getUpgradeCost(upgradeId);

    if (!upgradeStore.canAffordUpgrade(upgradeId)) return false;

    // Spend volition
    useGameStore.getState().spendVolition(cost);

    // Increment upgrade level
    set((prev) => ({
      upgrades: {
        ...prev.upgrades,
        [upgradeId]: {
          ...prev.upgrades[upgradeId],
          level: (prev.upgrades[upgradeId]?.level ?? 0) + 1,
        },
      },
    }));

    // Apply capacity upgrades immediately using base + bonus
    if (upgradeId.toLowerCase().includes("capacity")) {
      const baseProp = "base" + upgradeId[0].toUpperCase() + upgradeId.slice(1);
      const baseValue = useGameStore.getState()[baseProp] ?? 100;

      // Use optional-level getUpgradeEffectAtLevel
      const newLevel = upgradeStore.getUpgradeLevel(upgradeId); // current level after increment
      const bonus = upgradeStore.getUpgradeEffectAtLevel(upgradeId, newLevel);

      useGameStore.setState((prev) => ({
        ...prev,
        [upgradeId]: baseValue + bonus,
      }));
    }

    return true;
  },
}));
