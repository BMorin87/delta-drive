import { create } from "zustand";
import { gameEngine } from "./gameEngine";

export const useStatusStore = create((set, get) => ({
  // Active statuses - each status has: duration, maxDuration, effects
  activeStatuses: {},

  // Cooldowns - tracks when actions can be used again
  cooldowns: {
    drink: 0,
    eat: 0,
    rest: 0,
  },

  // Status configurations
  statusConfigs: {
    drink: {
      duration: 5, // seconds
      cooldown: 15, // seconds
      effects: {
        thirstReduction: 3, // 3x natural rate
        volitionPerThirst: 2, // 2 volition per 1 thirst satisfied
      },
    },
    eat: {
      duration: 8, // seconds
      cooldown: 20, // seconds
      effects: {
        hungerReduction: 3,
        volitionPerHunger: 1.5,
      },
    },
    rest: {
      duration: 10, // seconds
      cooldown: 25, // seconds
      effects: {
        fatigueReduction: 2,
        volitionPerFatigue: 1,
      },
    },
  },

  // Actions
  startStatus: (statusType) => {
    const state = get();
    const gameStore = gameEngine.store;

    // Check if on cooldown
    if (state.cooldowns[statusType] > 0) {
      return false;
    }

    // Calculate and spend volition cost
    const cost = state.calculateVolitionCost(statusType);
    if (!gameStore.getState().spendVolition(cost)) {
      return false;
    }

    // Cancel existing status if active
    if (state.activeStatuses[statusType]) {
      state.cancelStatus(statusType);
    }

    const config = state.statusConfigs[statusType];

    // Add to active statuses
    set((prev) => ({
      activeStatuses: {
        ...prev.activeStatuses,
        [statusType]: {
          duration: config.duration,
          maxDuration: config.duration,
          effects: { ...config.effects },
        },
      },
    }));

    // Register system with game engine
    get().registerStatusSystem(statusType);

    return true;
  },

  cancelStatus: (statusType) => {
    // Unregister system first
    gameEngine.unregisterSystem(`Status_${statusType}`);

    // Remove from active statuses and start cooldown
    set((prev) => ({
      activeStatuses: {
        ...prev.activeStatuses,
        [statusType]: undefined,
      },
      cooldowns: {
        ...prev.cooldowns,
        [statusType]: prev.statusConfigs[statusType].cooldown,
      },
    }));
  },

  // Calculate volition cost based on need level (lower cost when need is higher)
  calculateVolitionCost: (statusType) => {
    const gameState = gameEngine.store.getState();

    let baseCost = 10;
    let needLevel = 0;
    let maxNeed = 100;

    switch (statusType) {
      case "drink": {
        needLevel = gameState.thirst;
        maxNeed = gameState.thirstCapacity;
        break;
      }
      case "eat": {
        needLevel = gameState.hunger;
        maxNeed = gameState.hungerCapacity;
        break;
      }
      case "rest": {
        needLevel = gameState.fatigue;
        maxNeed = gameState.fatigueCapacity;
        break;
      }
    }

    // Cost decreases as need increases (0.2 to 1.0 multiplier)
    const needRatio = needLevel / maxNeed;
    const costMultiplier = 1.0 - needRatio * 0.8; // High need = low cost

    return Math.max(1, Math.floor(baseCost * costMultiplier));
  },

  // Register a status system with the game engine
  registerStatusSystem: (statusType) => {
    const systemName = `Status_${statusType}`;

    const statusSystem = (gameState) => {
      const statusState = get();
      const status = statusState.activeStatuses[statusType];

      if (!status) return {};

      // Update duration
      const newDuration = status.duration - 1 / 60;

      // If expired, cancel status
      if (newDuration <= 0) {
        setTimeout(() => statusState.cancelStatus(statusType), 0);
        return {};
      }

      // Update duration in status store
      set((prev) => ({
        activeStatuses: {
          ...prev.activeStatuses,
          [statusType]: {
            ...prev.activeStatuses[statusType],
            duration: newDuration,
          },
        },
      }));

      const updates = {};

      // Apply status effects based on type
      switch (statusType) {
        case "drink": {
          const thirstReduction =
            status.effects.thirstReduction *
            (gameState.initialThirstRate || 3 / 60);
          const newThirst = Math.max(0, gameState.thirst - thirstReduction);
          const thirstSatisfied = gameState.thirst - newThirst;

          // Bonus if eating while drinking
          const eatingBonus = statusState.activeStatuses.eat ? 1.2 : 1.0;
          const volitionGain =
            thirstSatisfied * status.effects.volitionPerThirst * eatingBonus;

          updates.thirst = newThirst;
          updates.volition = Math.min(
            gameState.volitionCapacity,
            gameState.volition + volitionGain
          );
          break;
        }

        case "eat": {
          const hungerReduction =
            status.effects.hungerReduction *
            (gameState.initialHungerRate || 2 / 60);
          const newHunger = Math.max(0, gameState.hunger - hungerReduction);
          const hungerSatisfied = gameState.hunger - newHunger;

          // Bonus if drinking while eating
          const drinkingBonus = statusState.activeStatuses.drink ? 1.2 : 1.0;
          const hungerVolitionGain =
            hungerSatisfied * status.effects.volitionPerHunger * drinkingBonus;

          updates.hunger = newHunger;
          updates.volition = Math.min(
            gameState.volitionCapacity,
            gameState.volition + hungerVolitionGain
          );
          break;
        }

        case "rest": {
          const fatigueReduction =
            status.effects.fatigueReduction *
            (gameState.initialFatigueRate || 1 / 60);
          const newFatigue = Math.max(0, gameState.fatigue - fatigueReduction);
          const fatigueSatisfied = gameState.fatigue - newFatigue;

          const fatigueVolitionGain =
            fatigueSatisfied * status.effects.volitionPerFatigue;

          updates.fatigue = newFatigue;
          updates.volition = Math.min(
            gameState.volitionCapacity,
            gameState.volition + fatigueVolitionGain
          );
          break;
        }
      }

      return updates;
    };

    gameEngine.registerSystem(systemName, statusSystem);

    // Also register cooldown system if it doesn't exist
    if (!gameEngine.systems.has("CooldownManager")) {
      get().registerCooldownSystem();
    }
  },

  // Register cooldown system
  registerCooldownSystem: () => {
    const cooldownSystem = () => {
      const deltaTime = 1 / 60;
      set((prev) => {
        const newCooldowns = { ...prev.cooldowns };
        let hasChanges = false;

        Object.keys(newCooldowns).forEach((statusType) => {
          if (newCooldowns[statusType] > 0) {
            newCooldowns[statusType] = Math.max(
              0,
              newCooldowns[statusType] - deltaTime
            );
            hasChanges = true;
          }
        });

        return hasChanges ? { cooldowns: newCooldowns } : prev;
      });

      return {}; // No game state updates needed
    };

    gameEngine.registerSystem("CooldownManager", cooldownSystem);
  },

  // Remove the standalone updateCooldowns method since it's now handled by the system

  // Helper methods for UI
  isStatusActive: (statusType) => {
    const state = get();
    return !!state.activeStatuses[statusType];
  },

  getStatusDuration: (statusType) => {
    const state = get();
    return state.activeStatuses[statusType]?.duration || 0;
  },

  getStatusProgress: (statusType) => {
    const state = get();
    const status = state.activeStatuses[statusType];
    if (!status) return 0;
    return (status.maxDuration - status.duration) / status.maxDuration;
  },

  getCooldownRemaining: (statusType) => {
    const state = get();
    return state.cooldowns[statusType] || 0;
  },

  getCooldownProgress: (statusType) => {
    const state = get();
    const remaining = state.cooldowns[statusType] || 0;
    const total = state.statusConfigs[statusType].cooldown;
    return remaining > 0 ? 1 - remaining / total : 1;
  },
}));
