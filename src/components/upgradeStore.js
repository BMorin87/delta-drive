import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useGameStore } from "./gameStore";

// Helper function to scale costs based on upgrade level.
export const computeScaledCost = (upgrade) => {
  if (!upgrade?.costs) return {};

  const multiplier = Math.pow(2, upgrade.level);
  const scaledCosts = {};

  for (const [resource, baseCost] of Object.entries(upgrade.costs)) {
    scaledCosts[resource] = Math.floor(baseCost * multiplier);
  }

  return scaledCosts;
};

export const INITIAL_UPGRADE_STATE = {
  upgrades: {
    baseVolitionRate: {
      level: 0,
      type: "intro",
      costs: { volition: 25 },
    },
    volitionRate: {
      level: 0,
      type: "rate",
      costs: { volition: 500 },
    },
    volitionCapacity: {
      level: 0,
      type: "capacity",
      costs: { volition: 50 },
    },
    hedonicReward: {
      level: 0,
      type: "rate",
      costs: { water: 2, food: 2, fibers: 2 },
    },
    basicNeeds: {
      level: 0,
      type: "unlock",
      unlocks: "awareness",
      costs: { volition: 100 },
    },
    basicActions: {
      level: 0,
      type: "unlock",
      unlocks: "agency",
      costs: { volition: 250 },
    },
    upgradePanel: {
      level: 0,
      type: "unlock",
      unlocks: "upgradePanel",
      costs: { volition: 100 },
    },
    pyramidNav: {
      level: 0,
      type: "unlock",
      unlocks: "navigation",
      costs: { volition: 800 },
    },
    foraging: {
      level: 0,
      type: "unlock",
      unlocks: "forage",
      costs: { volition: 600 },
    },
  },
  // Provides stable objects for current upgrade costs. Stable objects prevent render loops on cost displays.
  _costCache: {},
};

export const useUpgradeStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_UPGRADE_STATE,

      resetUpgrades: () => {
        useUpgradeStore.persist.clearStorage();
        set(INITIAL_UPGRADE_STATE, true);
      },

      getUpgradeCost: (upgradeId) => {
        // Return cached cost if available (provides stable reference).
        const cached = get()._costCache[upgradeId];
        if (cached) return cached;

        // Compute and cache the cost.
        const upgrade = get().upgrades[upgradeId];
        const cost = computeScaledCost(upgrade);

        set((state) => ({
          _costCache: {
            ...state._costCache,
            [upgradeId]: cost,
          },
        }));

        return cost;
      },

      getUpgradeLevel: (upgradeId) => {
        return get().upgrades[upgradeId]?.level ?? 0;
      },

      canAffordUpgrade: (upgradeId) => {
        const cost = get().getUpgradeCost(upgradeId);
        const gameState = useGameStore.getState();

        // Check player has enough of every required resource
        for (const [resource, amount] of Object.entries(cost)) {
          if ((gameState[resource] ?? 0) < amount) {
            return false;
          }
        }

        return true;
      },

      getUpgradeEffectAtLevel: (upgradeId, requestedLevel) => {
        const level = requestedLevel ?? get().getUpgradeLevel(upgradeId);

        switch (upgradeId) {
          case "volitionRate":
            return 1.1 ** level;
          case "hedonicReward":
            return 1.1 ** level;
          case "volitionCapacity":
            return level * 110;
          default:
            return 1;
        }
      },

      getRewardMultiplier: (statusType) => {
        if (statusType === "drink" || statusType === "eat" || statusType === "rest") {
          return get().getUpgradeEffectAtLevel("hedonicReward");
        }
        return 1.0;
      },

      purchaseUpgrade: (upgradeId) => {
        const cost = get().getUpgradeCost(upgradeId);

        if (!get().canAffordUpgrade(upgradeId)) {
          return false;
        }

        // TODO: Don't set game state directly, do it through a gameStore function.
        useGameStore.setState((prev) => {
          const updates = {};
          for (const [resource, amount] of Object.entries(cost)) {
            updates[resource] = (prev[resource] ?? 0) - amount;
          }
          return updates;
        });

        // Increment the upgrade's level.
        set((prev) => ({
          upgrades: {
            ...prev.upgrades,
            [upgradeId]: {
              ...prev.upgrades[upgradeId],
              level: (prev.upgrades[upgradeId]?.level ?? 0) + 1,
            },
          },
        }));

        // Update the cost cache with the new level.
        const upgrade = get().upgrades[upgradeId];
        const newCost = computeScaledCost(upgrade);
        set((state) => ({
          _costCache: {
            ...state._costCache,
            [upgradeId]: newCost,
          },
        }));

        // Handle special upgrade types
        get()._applySpecialEffects(upgradeId);

        return true;
      },

      // Internal helper to apply upgrade effects based on type.
      _applySpecialEffects: (upgradeId) => {
        const upgrade = get().upgrades[upgradeId];

        switch (upgrade.type) {
          case "intro": {
            if (upgradeId === "baseVolitionRate") {
              const fps = useGameStore.getState().TICKS_PER_SECOND;
              useGameStore.setState((prev) => ({
                // Increase the per-second rate by 2.
                baseVolitionRate: prev.baseVolitionRate + 2 / fps,
              }));
            }
            break;
          }

          case "capacity": {
            const level = get().getUpgradeLevel(upgradeId);
            const bonus = get().getUpgradeEffectAtLevel(upgradeId, level);

            useGameStore.setState((prev) => ({
              [upgradeId]: (prev[upgradeId] ?? 100) + bonus,
            }));
            break;
          }

          case "unlock": {
            // The possible UI "unlocks" so far.
            const unlockMap = {
              awareness: "isAwarenessUnlocked",
              agency: "isAgencyUnlocked",
              upgradePanel: "isUpgradePanelUnlocked",
              navigation: "isNavigationUnlocked",
              forage: "isForageUnlocked",
            };

            const stateKey = unlockMap[upgrade.unlocks];
            if (stateKey) {
              useGameStore.setState({ [stateKey]: true });
            }
            break;
          }
        }
      },
    }),
    {
      name: "upgrade-storage",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        upgrades: state.upgrades,
        // Cost cache is intentionally not persisted - rebuilt on load
      }),
    }
  )
);
