import { create } from "zustand";
import { useGameStore } from "./gameStore";

export const useUpgradeStore = create((set, get) => ({
  // The state.
  upgrades: {
    volitionRate: { level: 0, baseCost: 10, type: "rate" },
    volitionCapacity: { level: 0, baseCost: 15, type: "capacity" },
    thirstRate: { level: 0, baseCost: 8, type: "rate" },
    hungerRate: { level: 0, baseCost: 12, type: "rate" },
    fatigueRate: { level: 0, baseCost: 6, type: "rate" },
    thirstCapacity: { level: 0, baseCost: 20, type: "capacity" },
    hungerCapacity: { level: 0, baseCost: 25, type: "capacity" },
    fatigueCapacity: { level: 0, baseCost: 18, type: "capacity" },
    drinkButton: { level: 0, baseCost: 10, type: "unlock", unlocks: "drink" },
    eatButton: { level: 0, baseCost: 40, type: "unlock", unlocks: "eat" },
    restButton: { level: 0, baseCost: 90, type: "unlock", unlocks: "rest" },
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
    const fps = useGameStore.getState().TICKS_PER_SECOND;
    switch (upgradeId) {
      case "volitionRate":
        return (level * 2) / fps; // +2 volition per second per level
      case "volitionCapacity":
        return level * 25; // +25 capacity per level
      case "thirstRate":
        return (level * 1) / fps;
      case "hungerRate":
        return (level * 1) / fps;
      case "fatigueRate":
        return (level * 0.5) / fps;
      case "thirstCapacity":
        return level * 20; // +20 capacity per level
      case "hungerCapacity":
        return level * 15; // +15 capacity per level
      case "fatigueCapacity":
        return level * 25; // +25 capacity per level
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
        } else if (upgrade.unlocks === "eat") {
          useGameStore.setState({ eatUnlocked: true });
        } else if (upgrade.unlocks === "rest") {
          useGameStore.setState({ restUnlocked: true });
        }
        break;
      }

      // "rate" upgrades don't need special handling;
      // their effect is calculated dynamically in getUpgradeEffectAtLevel
    }

    return true;
  },
}));
