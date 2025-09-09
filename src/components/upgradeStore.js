import { create } from "zustand";
import { useGameStore } from "./gameStore";

// Factory function for creating the upgrade store
export const useUpgradeStore = create((set, get) => ({
  // The state.
  upgrades: {
    volitionRate: { level: 0, baseCost: 10, type: "rate" },
    volitionCapacity: { level: 0, baseCost: 15, type: "capacity" },
    thirstRate: { level: 0, baseCost: 8, type: "rate" },
    hungerRate: { level: 0, baseCost: 12, type: "rate" },
    fatigueRate: { level: 0, baseCost: 6, type: "rate" },
    drinkButton: { level: 0, baseCost: 20, type: "unlock", unlocks: "drink" },
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
        return (level * 2) / 60; // +2 volition per second per level
      case "volitionCapacity":
        return level * 25; // +25 capacity per level
      case "thirstRate":
        return (level * 1) / 60;
      case "hungerRate":
        return (level * 1) / 60;
      case "fatigueRate":
        return (level * 0.5) / 60;
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

    // Handle special upgrade types
    const upgrade = get().upgrades[upgradeId];

    switch (upgrade.type) {
      case "capacity": {
        const newLevel = upgradeStore.getUpgradeLevel(upgradeId);
        const bonus = upgradeStore.getUpgradeEffectAtLevel(upgradeId, newLevel);

        useGameStore.setState((prev) => ({
          ...prev,
          [upgradeId]: (prev[upgradeId] ?? 100) + bonus,
        }));
        break;
      }

      case "unlock": {
        if (upgrade.unlocks === "drink") {
          useGameStore.setState({ drinkUnlocked: true });
        }
        break;
      }

      // "rate" upgrades don’t need special handling;
      // their effect is calculated dynamically in getUpgradeEffectAtLevel
    }

    return true;
  },
}));
