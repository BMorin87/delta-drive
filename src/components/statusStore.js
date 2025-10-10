import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { gameEngine } from "./gameEngine";
import { useUpgradeStore } from "./upgradeStore";
import { STATUS_CONFIGS } from "./statusConfigs";

export const useStatusStore = create(
  persist(
    (set, get) => ({
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

        // TODO: Make dependency on gameStore more explicit and move calculateVolitionCost to gameStore.
        const gameStore = gameEngine.store;
        const cost = myState.calculateVolitionCost(statusType);
        if (!gameStore.getState().spendVolition(cost)) return false;

        // If the status is already active, reset it.
        if (myState.activeStatuses[statusType]) {
          myState.cancelStatus(statusType);
        }

        // Activate the status.
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

        // Register the status update function with the game engine.
        gameEngine.registerSystem(
          `Status_${statusType}`,
          get().createStatusUpdate(statusType)
        );

        // Register the cooldown system, but only if it's not already there.
        const systems = gameEngine.getRegisteredSystems();
        if (!systems.includes("CooldownManager")) {
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

          const deltaTime = 1 / 12;
          const newDuration = status.duration - deltaTime;

          // If status duration has expired, clean up and set cooldown.
          if (newDuration <= 0) {
            gameEngine.unregisterSystem(`Status_${statusType}`);
            const config = statusStoreState.statusConfigs[statusType];
            set((prev) => ({
              activeStatuses: {
                ...prev.activeStatuses,
                [statusType]: undefined,
              },
              cooldowns: {
                ...prev.cooldowns,
                [statusType]: config.cooldown,
              },
            }));
            return {};
          }

          // Otherwise update the duration.
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
              const rewardMultiplier = useUpgradeStore
                .getState()
                .getRewardMultiplier(statusType);
              effect.rewards.forEach(({ resource, perUnit, capacityKey }) => {
                const gain =
                  satisfied * perUnit * rewardMultiplier * multiplier;
                const currentValue =
                  newUpdates[resource] ?? gameState[resource];
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
          const deltaTime = 1 / 12;
          set((prev) => {
            const updated = {};
            let changed = false;

            Object.entries(prev.cooldowns).forEach(([statusType, value]) => {
              if (value > 0) {
                updated[statusType] = Math.max(0, value - deltaTime);
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
    }),
    {
      name: "status-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        activeStatuses: state.activeStatuses,
        cooldowns: state.cooldowns,
      }),

      // Re-register active statuses with the gameEngine after rehydration.
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error || !state) return;

          Object.keys(state.activeStatuses).forEach((statusType) => {
            if (state.activeStatuses[statusType]) {
              gameEngine.registerSystem(
                `Status_${statusType}`,
                state.createStatusUpdate(statusType)
              );
            }
          });

          const hasCooldowns = Object.values(state.cooldowns).some(
            (cd) => cd > 0
          );
          if (hasCooldowns) {
            const systems = gameEngine.getRegisteredSystems();
            if (!systems.includes("CooldownManager")) {
              state.registerCooldownSystem();
            }
          }
        };
      },
    }
  )
);
