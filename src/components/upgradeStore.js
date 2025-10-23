import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useGameStore } from "./gameStore";

export const INITIAL_UPGRADE_STATE = {
  upgrades: {
    volitionRate: { level: 0, baseCost: 10, type: "rate" },
    volitionCapacity: { level: 0, baseCost: 15, type: "capacity" },
    hedonicReward: {
      level: 0,
      baseCost: 25,
      type: "reward",
      affects: "rest",
    },
    basicNeeds: {
      level: 0,
      baseCost: 1,
      type: "unlock",
      unlocks: "awareness",
    },
    upgradePanel: {
      level: 0,
      baseCost: 2,
      type: "unlock",
      unlocks: "upgradePanel",
    },
    pyramidNav: {
      level: 0,
      baseCost: 3,
      type: "unlock",
      unlocks: "navigation",
    },
    foraging: {
      level: 0,
      baseCost: 4,
      type: "unlock",
      unlocks: "forage",
    },
  },
};

export const useUpgradeStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_UPGRADE_STATE,

      // Actions
      resetUpgrades: () => {
        useUpgradeStore.persist.clearStorage();
        set(INITIAL_UPGRADE_STATE, true);
      },

      getUpgradeCost: (upgradeId) => {
        const upgrade = get().upgrades[upgradeId];
        if (!upgrade) return 0;
        return Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
      },

      getUpgradeLevel: (upgradeId) => get().upgrades[upgradeId]?.level ?? 0,

      canAffordUpgrade: (upgradeId) => {
        const isAffordable =
          useGameStore.getState().volition >= get().getUpgradeCost(upgradeId);
        return isAffordable;
      },

      // The requestedLevel parameter is optional, so that the function can be easily used to preview the next level's effect.
      getUpgradeEffectAtLevel: (upgradeId, requestedLevel) => {
        // By default, use the upgrade's current level. Fallback to zero if the upgrade doesn't exist.
        const level = requestedLevel ?? get().upgrades[upgradeId]?.level ?? 0;
        const fps = useGameStore.getState().TICKS_PER_SECOND;
        // The upgrade effects are hardcoded here. Fragile!
        switch (upgradeId) {
          case "volitionRate":
            return (level * 2) / fps; // +2 volition per second per level.
          case "volitionCapacity":
            return level * 25; // +25 capacity per level.
          case "hedonicReward":
            return 1 + level * 0.1; // The multiplier is 1 at level zero, 0.1 increase per level.
          default:
            return 0;
        }
      },

      // Used by the statusStore to apply reward multipliers from temporary statuses.
      getRewardMultiplier: (statusType) => {
        let multiplier = 1.0;
        if (
          statusType === "drink" ||
          statusType === "eat" ||
          statusType === "rest"
        ) {
          multiplier = get().getUpgradeEffectAtLevel("hedonicReward");
        }
        return multiplier;
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
            const bonus = upgradeStore.getUpgradeEffectAtLevel(
              upgradeId,
              newLevel
            );

            useGameStore.setState((prev) => ({
              ...prev,
              [upgradeId]: (prev[upgradeId] ?? 100) + bonus,
            }));
            break;
          }

          case "unlock": {
            if (upgrade.unlocks === "awareness") {
              useGameStore.setState({ isAwarenessUnlocked: true });
            } else if (upgrade.unlocks === "upgradePanel") {
              useGameStore.setState({ isUpgradePanelUnlocked: true });
            } else if (upgrade.unlocks === "navigation") {
              useGameStore.setState({ isNavigationUnlocked: true });
            } else if (upgrade.unlocks === "forage") {
              useGameStore.setState({ isForageUnlocked: true });
            }
            break;
          }

          // "Rate" upgrades don't need special handling; their effect is calculated generically using getUpgradeEffectAtLevel.
        }

        return true;
      },
    }),
    {
      name: "upgrade-storage",
      version: 2,
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        upgrades: state.upgrades,
      }),
    }
  )
);
