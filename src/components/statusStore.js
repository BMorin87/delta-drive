import { create } from "zustand";
import { gameEngine } from "./gameEngine";

export const useStatusStore = create((set, get) => ({
  activeStatuses: {},
  cooldowns: {},

  // ========================
  // Status Configurations
  // ========================
  statusConfigs: {
    drink: {
      duration: 5,
      cooldown: 15,
      cost: { base: 10, need: "thirst", capacity: "thirstCapacity" },
      effects: [
        {
          target: "thirst",
          rateKey: "initialThirstRate",
          reductionMultiplier: 3,
          rewards: [
            {
              resource: "volition",
              perUnit: 2,
              capacityKey: "volitionCapacity",
            },
          ],
          synergy: { with: "eat", multiplier: 1.2 },
        },
      ],
    },
    eat: {
      duration: 8,
      cooldown: 20,
      cost: { base: 10, need: "hunger", capacity: "hungerCapacity" },
      effects: [
        {
          target: "hunger",
          rateKey: "initialHungerRate",
          reductionMultiplier: 3,
          rewards: [
            {
              resource: "volition",
              perUnit: 1.5,
              capacityKey: "volitionCapacity",
            },
          ],
          synergy: { with: "drink", multiplier: 1.2 },
        },
      ],
    },
    rest: {
      duration: 10,
      cooldown: 25,
      cost: { base: 10, need: "fatigue", capacity: "fatigueCapacity" },
      effects: [
        {
          target: "fatigue",
          rateKey: "initialFatigueRate",
          reductionMultiplier: 2,
          rewards: [
            {
              resource: "volition",
              perUnit: 1,
              capacityKey: "volitionCapacity",
            },
          ],
        },
      ],
    },
  },

  // ========================
  // Actions
  // ========================

  startStatus: (statusType) => {
    const state = get();
    const gameStore = gameEngine.store;
    const config = state.statusConfigs[statusType];

    if (!config) return false;
    if (state.cooldowns[statusType] > 0) return false;

    const cost = state.calculateVolitionCost(statusType);
    if (!gameStore.getState().spendVolition(cost)) return false;

    // Cancel existing if already active
    if (state.activeStatuses[statusType]) {
      state.cancelStatus(statusType);
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

    get().registerStatusSystem(statusType);
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

  calculateVolitionCost: (statusType) => {
    const { cost } = get().statusConfigs[statusType];
    const gameState = gameEngine.store.getState();

    const needLevel = gameState[cost.need];
    const maxNeed = gameState[cost.capacity];
    const needRatio = needLevel / maxNeed;

    // Cost decreases as need increases (0.2x–1.0x multiplier)
    const costMultiplier = 1.0 - needRatio * 0.8;
    return Math.max(1, Math.floor(cost.base * costMultiplier));
  },

  // ========================
  // System Registration
  // ========================

  registerStatusSystem: (statusType) => {
    const statusSystem = (gameState) => {
      const { activeStatuses } = get();
      const status = activeStatuses[statusType];
      if (!status) return {};

      const newDuration = status.duration - 1 / 60;
      if (newDuration <= 0) {
        setTimeout(() => get().cancelStatus(statusType), 0);
        return {};
      }

      set((prev) => ({
        activeStatuses: {
          ...prev.activeStatuses,
          [statusType]: { ...status, duration: newDuration },
        },
      }));

      // ========================
      // Apply effects generically
      // ========================
      return status.effects.reduce((updates, effect) => {
        const reduction =
          effect.reductionMultiplier * (gameState[effect.rateKey] || 0);
        const newValue = Math.max(0, gameState[effect.target] - reduction);
        const satisfied = gameState[effect.target] - newValue;

        // Start with resource update
        let newUpdates = {
          ...updates,
          [effect.target]: newValue,
        };

        // Synergy multiplier
        let multiplier = 1.0;
        if (effect.synergy?.with && activeStatuses[effect.synergy.with]) {
          multiplier = effect.synergy.multiplier;
        }

        // Rewards (optional per effect)
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

    gameEngine.registerSystem(`Status_${statusType}`, statusSystem);

    if (!gameEngine.systems.has("CooldownManager")) {
      get().registerCooldownSystem();
    }
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

  // ========================
  // UI Helpers
  // ========================

  isStatusActive: (type) => !!get().activeStatuses[type],
  getStatusDuration: (type) => get().activeStatuses[type]?.duration || 0,
  getStatusProgress: (type) => {
    const s = get().activeStatuses[type];
    return s ? (s.maxDuration - s.duration) / s.maxDuration : 0;
  },
  getCooldownRemaining: (type) => get().cooldowns[type] || 0,
  getCooldownProgress: (type) => {
    const { cooldowns, statusConfigs } = get();
    const total = statusConfigs[type].cooldown;
    const remaining = cooldowns[type] || 0;
    return remaining > 0 ? 1 - remaining / total : 1;
  },
}));
