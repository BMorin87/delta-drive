import { create } from "zustand";
import { gameEngine } from "./gameEngine";
import { STATUS_CONFIGS } from "./statusConfigs";

export const useStatusStore = create((set, get) => ({
  // The state of temporary statuses.
  activeStatuses: {},
  cooldowns: {},
  statusConfigs: STATUS_CONFIGS,

  // ========================
  // Actions
  // ========================

  startStatus: (statusType) => {
    const myState = get();
    const config = myState.statusConfigs[statusType];

    if (!config) return false;
    if (myState.cooldowns[statusType] > 0) return false;

    // TODO: Make dependency on gameStore explicit and move calculateVolitionCost to gameStore.
    const gameStore = gameEngine.store;
    const cost = myState.calculateVolitionCost(statusType);
    if (!gameStore.getState().spendVolition(cost)) return false;

    // Cancel existing if already active
    if (myState.activeStatuses[statusType]) {
      myState.cancelStatus(statusType);
    }

    set((prev) => ({
      activeStatuses: {
        ...prev.activeStatuses,
        [statusType]: {
          duration: config.duration,
          maxDuration: config.duration,
          effects: config.effects,
        },
      },
    }));

    gameEngine.registerSystem(
      `Status_${statusType}`,
      get().createStatusUpdate(statusType)
    );

    // Ensure the cooldown manager is registered only once
    if (!gameEngine.systems.has("CooldownManager")) {
      get().registerCooldownSystem();
    }

    return true;
  },

  cancelStatus: (statusType) => {
    gameEngine.unregisterSystem(`Status_${statusType}`);
    const config = get().statusConfigs[statusType];
    set((prev) => ({
      activeStatuses: { ...prev.activeStatuses, [statusType]: undefined },
      cooldowns: {
        ...prev.cooldowns,
        [statusType]: config.cooldown,
      },
    }));
  },

  // This accesses game state through the gameEngine and should be moved to gameStore.
  calculateVolitionCost: (statusType) => {
    const config = get().statusConfigs[statusType];
    if (!config) {
      console.error(`Status config for "${statusType}" is undefined.`);
      return 0;
    }
    const { cost } = config;
    const gameState = gameEngine.store.getState();

    const needLevel = gameState[cost.need];
    const maxNeed = gameState[cost.capacity];
    const needRatio = needLevel / maxNeed;

    const costMultiplier = 1.0 - needRatio * 0.8;
    return Math.max(1, Math.floor(cost.base * costMultiplier));
  },

  // ========================
  // System Registration
  // ========================

  createStatusUpdate: (statusType) => {
    return (gameState) => {
      const statusStoreState = get();
      const status = statusStoreState.activeStatuses[statusType];
      if (!status) return {};

      const newDuration = status.duration - 1 / 60;

      if (newDuration <= 0) {
        gameEngine.unregisterSystem(`Status_${statusType}`);
        const config = statusStoreState.statusConfigs[statusType];
        set((prev) => ({
          activeStatuses: { ...prev.activeStatuses, [statusType]: undefined },
          cooldowns: {
            ...prev.cooldowns,
            [statusType]: config.cooldown,
          },
        }));
        return {};
      }

      set((prev) => ({
        activeStatuses: {
          ...prev.activeStatuses,
          [statusType]: { ...status, duration: newDuration },
        },
      }));

      // Apply effects generically.
      return status.effects.reduce((updates, effect) => {
        const maxReduction =
          effect.reductionMultiplier * (gameState[effect.rateKey] || 0);
        const currentNeed = gameState[effect.target];

        const actualReduction = Math.min(maxReduction, currentNeed);
        const newValue = Math.max(0, currentNeed - actualReduction);
        const satisfied = actualReduction;

        let newUpdates = { ...updates };

        if (actualReduction > 0) {
          newUpdates[effect.target] = newValue;
        }

        let multiplier = 1.0;
        if (
          effect.synergy?.with &&
          statusStoreState.activeStatuses[effect.synergy.with]
        ) {
          multiplier = effect.synergy.multiplier;
        }

        if (effect.rewards) {
          effect.rewards.forEach(({ resource, perUnit, capacityKey }) => {
            const gain = satisfied * perUnit * multiplier;
            const currentValue = newUpdates[resource] ?? gameState[resource];
            const capped = capacityKey
              ? Math.min(gameState[capacityKey], currentValue + gain)
              : currentValue + gain;

            newUpdates[resource] = capped;
          });
        }

        return newUpdates;
      }, {});
    };
  },

  registerCooldownSystem: () => {
    const cooldownSystem = () => {
      const delta = 1 / 60;
      set((prev) => {
        const updated = {};
        let changed = false;

        Object.entries(prev.cooldowns).forEach(([statusType, value]) => {
          if (value > 0) {
            updated[statusType] = Math.max(0, value - delta);
            changed = true;
          }
        });

        return changed
          ? { cooldowns: { ...prev.cooldowns, ...updated } }
          : prev;
      });
      return {};
    };

    gameEngine.registerSystem("CooldownManager", cooldownSystem);
  },

  // Helper functions for tests.
  isStatusActive: (statusType) => {
    return !!get().activeStatuses[statusType];
  },

  getStatusDuration: (statusType) => {
    return get().activeStatuses[statusType]?.duration || 0;
  },

  getCooldownRemaining: (statusType) => {
    return get().cooldowns[statusType] || 0;
  },
}));
