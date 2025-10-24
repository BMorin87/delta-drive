import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { gameEngine } from "./gameEngine";
import { useUpgradeStore } from "./upgradeStore";
import { STATUS_CONFIGS } from "./statusConfigs";

export const INITIAL_STATUS_STATE = {
  activeStatuses: {},
  cooldowns: {},
  statusConfigs: STATUS_CONFIGS,
};

export const useStatusStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_STATUS_STATE,

      resetStatuses: () => {
        useStatusStore.persist.clearStorage();
        set(INITIAL_STATUS_STATE, true);
      },

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
          myState.createStatusUpdate(statusType)
        );

        // Register the cooldown system if it's not already there.
        const systems = gameEngine.getRegisteredSystems();
        if (!systems.includes("CooldownManager")) {
          myState.registerCooldownSystem();
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

      // System registration. This is the function that runs every tick for the active status!
      createStatusUpdate: (statusType) => {
        return (gameState) => {
          const myState = get();
          const status = myState.activeStatuses[statusType];
          if (!status) return {};

          const deltaTime = 1 / 12;
          const newDuration = status.duration - deltaTime;

          // If the status timer has expired, clean up and reset cooldown.
          if (newDuration <= 0) {
            gameEngine.unregisterSystem(`Status_${statusType}`);
            const config = myState.statusConfigs[statusType];
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

          // Otherwise update the status's timer...
          set((prev) => ({
            activeStatuses: {
              ...prev.activeStatuses,
              [statusType]: { ...status, duration: newDuration },
            },
          }));

          // ...And return an update object for the gameEngine to apply.
          return status.effects.reduce((updates, effect) => {
            // The stat to be drained by the effect.
            const statValue = gameState[effect.targetStat];
            // Drain speed is calculated using the stat's initial fill rate and the config.
            const maxReduction =
              (gameState[effect.rateID] || 0) * effect.statDrainMultiplier;
            // Don't drain more than is available.
            const actualDrain = Math.min(maxReduction, statValue);
            const newValue = Math.max(0, statValue - actualDrain);

            let newUpdates = { ...updates };

            // Apply the drain.
            if (actualDrain > 0) {
              newUpdates[effect.targetStat] = newValue;
            }

            // If there's an active synergic effect, get the synergy multiplier.
            let synergyMultiplier = 1.0;
            if (
              effect.synergy?.with &&
              myState.activeStatuses[effect.synergy.with]
            ) {
              synergyMultiplier = effect.synergy.multiplier;
            }

            // Now calculate the rewards from the status.
            if (effect.rewards) {
              const rewardMultiplier = useUpgradeStore
                .getState()
                .getRewardMultiplier(statusType);
              // Statuses don't have more than one reward yet, but it's ready for extension.
              effect.rewards.forEach(({ resource, perUnit, capacityId }) => {
                const gain =
                  actualDrain * perUnit * rewardMultiplier * synergyMultiplier;
                const currentValue =
                  newUpdates[resource] ?? gameState[resource];
                const capped = capacityId
                  ? Math.min(gameState[capacityId], currentValue + gain)
                  : currentValue + gain;

                // Apply the reward.
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
      version: 2,
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

          // If there are some active cooldowns, create the Cooldown manager safely.
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
