import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { gameEngine } from "./gameEngine";

// Threat configurations
const THREAT_CONFIGS = {
  drought: {
    name: "Drought",
    description: "The air is dry, water evaporates quickly",
    severity: 1.0,
    spawnWeight: 1.0,
    effects: [
      {
        targetResource: "water",
        drainPerSecond: 0.15,
      },
    ],
  },
  blight: {
    name: "Blight",
    description: "Pests and mold threaten your food stores",
    severity: 1.0,
    spawnWeight: 1.0,
    effects: [
      {
        targetResource: "food",
        drainPerSecond: 0.12,
      },
    ],
  },
  decay: {
    name: "Decay",
    description: "Materials deteriorate from exposure",
    severity: 1.0,
    spawnWeight: 1.0,
    effects: [
      {
        targetResource: "fibers",
        drainPerSecond: 0.1,
      },
    ],
  },
};

// Shelter configurations
const SHELTER_CONFIGS = {
  waterCache: {
    name: "Water Cache",
    description: "Protected storage for water",
    protectsAgainst: ["drought"],
    protectionAmount: 0.7, // Reduces threat drain by 70%
    cost: {
      water: 3,
      fibers: 5,
      volition: 20,
    },
    durability: 180, // seconds before needing repair
    repairCost: {
      fibers: 2,
      volition: 10,
    },
  },
  foodPreserve: {
    name: "Food Preserve",
    description: "Keeps food safe from spoilage",
    protectsAgainst: ["blight"],
    protectionAmount: 0.7,
    cost: {
      food: 3,
      fibers: 5,
      volition: 20,
    },
    durability: 180,
    repairCost: {
      fibers: 2,
      volition: 10,
    },
  },
  reinforcedStorage: {
    name: "Reinforced Storage",
    description: "Sturdy container protects materials",
    protectsAgainst: ["decay"],
    protectionAmount: 0.7,
    cost: {
      fibers: 10,
      volition: 25,
    },
    durability: 240,
    repairCost: {
      fibers: 3,
      volition: 12,
    },
  },
};

export const INITIAL_THREAT_STATE = {
  activeThreats: {},
  shelters: {},
  threatConfigs: THREAT_CONFIGS,
  shelterConfigs: SHELTER_CONFIGS,
  maxActiveThreats: 3, // Allow multiple threats to stack
};

export const useThreatStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_THREAT_STATE,

      resetThreats: () => {
        useThreatStore.persist.clearStorage();
        set(INITIAL_THREAT_STATE, true);
      },

      // Spawns a random threat (called from ForagePanel)
      spawnRandomThreat: () => {
        const state = get();
        const activeCount = Object.keys(state.activeThreats).filter(
          (key) => state.activeThreats[key]
        ).length;

        // Don't spawn if at max capacity
        if (activeCount >= state.maxActiveThreats) {
          return null;
        }

        // Get available threats (not currently active)
        const availableThreats = Object.keys(state.threatConfigs).filter(
          (threatType) => !state.activeThreats[threatType]
        );

        if (availableThreats.length === 0) {
          return null;
        }

        // Weighted random selection
        const weights = availableThreats.map((t) => state.threatConfigs[t].spawnWeight);
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        let selectedThreat = availableThreats[0];
        for (let i = 0; i < availableThreats.length; i++) {
          random -= weights[i];
          if (random <= 0) {
            selectedThreat = availableThreats[i];
            break;
          }
        }

        return state.spawnThreat(selectedThreat);
      },

      // Spawns a specific threat
      spawnThreat: (threatType) => {
        const state = get();
        const config = state.threatConfigs[threatType];

        if (!config) return null;
        if (state.activeThreats[threatType]) return null;

        // Add to active threats
        set((prev) => ({
          activeThreats: {
            ...prev.activeThreats,
            [threatType]: {
              severity: config.severity,
              effects: config.effects,
            },
          },
        }));

        // Register with game engine
        gameEngine.registerSystem(`Threat_${threatType}`, state.createThreatUpdate(threatType));

        return threatType;
      },

      // Removes a threat (used for testing or special events)
      removeThreat: (threatType) => {
        gameEngine.unregisterSystem(`Threat_${threatType}`);
        set((prev) => ({
          activeThreats: { ...prev.activeThreats, [threatType]: undefined },
        }));
      },

      // Creates the update function for a specific threat
      createThreatUpdate: (threatType) => {
        return (gameState) => {
          const state = get();
          const threat = state.activeThreats[threatType];
          if (!threat) return {};

          const deltaTime = 1 / 12;
          const updates = {};

          threat.effects.forEach((effect) => {
            const { targetResource, drainPerSecond } = effect;
            const currentAmount = gameState[targetResource] || 0;

            // Calculate protection from shelters
            const protection = state.calculateProtection(threatType);
            const effectiveDrain = drainPerSecond * (1 - protection) * deltaTime;

            // Only drain if there's something to drain
            if (currentAmount > 0 && effectiveDrain > 0) {
              updates[targetResource] = Math.max(0, currentAmount - effectiveDrain);
            }
          });

          return updates;
        };
      },

      // Calculates total protection against a threat from all shelters
      calculateProtection: (threatType) => {
        const state = get();
        let totalProtection = 0;

        Object.entries(state.shelters).forEach(([shelterType, shelter]) => {
          const config = state.shelterConfigs[shelterType];
          if (!config) return;

          // Check if shelter protects against this threat and isn't broken
          if (config.protectsAgainst.includes(threatType) && shelter.durability > 0) {
            totalProtection += config.protectionAmount;
          }
        });

        // Cap at 95% protection (threats always have some effect)
        return Math.min(0.95, totalProtection);
      },

      // Craft a shelter
      craftShelter: (shelterType) => {
        const state = get();
        const config = state.shelterConfigs[shelterType];

        if (!config) return false;
        if (state.shelters[shelterType]) return false; // Already built

        const gameStore = gameEngine.store;
        const gameState = gameStore.getState();

        // Check costs
        for (const [resource, amount] of Object.entries(config.cost)) {
          if (resource === "volition") {
            if (gameState.volition < amount) return false;
          } else {
            if ((gameState[resource] || 0) < amount) return false;
          }
        }

        // Spend resources
        const updates = {};
        for (const [resource, amount] of Object.entries(config.cost)) {
          if (resource === "volition") {
            if (!gameState.spendVolition(amount)) return false;
          } else {
            updates[resource] = gameState[resource] - amount;
          }
        }

        gameStore.setState(updates);

        // Create shelter
        set((prev) => ({
          shelters: {
            ...prev.shelters,
            [shelterType]: {
              durability: config.durability,
              maxDurability: config.durability,
            },
          },
        }));

        // Register durability system if not already registered
        const systems = gameEngine.getRegisteredSystems();
        if (!systems.includes("ShelterDurability")) {
          state.registerDurabilitySystem();
        }

        return true;
      },

      // Repair a shelter
      repairShelter: (shelterType) => {
        const state = get();
        const shelter = state.shelters[shelterType];
        const config = state.shelterConfigs[shelterType];

        if (!shelter || !config) return false;
        if (shelter.durability === config.durability) return false; // Already full

        const gameStore = gameEngine.store;
        const gameState = gameStore.getState();

        // Check repair costs
        for (const [resource, amount] of Object.entries(config.repairCost)) {
          if (resource === "volition") {
            if (gameState.volition < amount) return false;
          } else {
            if ((gameState[resource] || 0) < amount) return false;
          }
        }

        // Spend resources
        const updates = {};
        for (const [resource, amount] of Object.entries(config.repairCost)) {
          if (resource === "volition") {
            if (!gameState.spendVolition(amount)) return false;
          } else {
            updates[resource] = gameState[resource] - amount;
          }
        }

        gameStore.setState(updates);

        // Restore durability
        set((prev) => ({
          shelters: {
            ...prev.shelters,
            [shelterType]: {
              ...shelter,
              durability: config.durability,
            },
          },
        }));

        return true;
      },

      // System that ticks down shelter durability
      registerDurabilitySystem: () => {
        const durabilitySystem = () => {
          const deltaTime = 1 / 12;

          set((prev) => {
            const updatedShelters = {};
            let changed = false;

            Object.entries(prev.shelters).forEach(([shelterType, shelter]) => {
              if (shelter.durability > 0) {
                updatedShelters[shelterType] = {
                  ...shelter,
                  durability: Math.max(0, shelter.durability - deltaTime),
                };
                changed = true;
              }
            });

            return changed ? { shelters: { ...prev.shelters, ...updatedShelters } } : prev;
          });

          return {};
        };

        gameEngine.registerSystem("ShelterDurability", durabilitySystem);
      },

      // Helper to check if player can afford a shelter
      canAffordShelter: (shelterType) => {
        const config = get().shelterConfigs[shelterType];
        if (!config) return false;

        const gameState = gameEngine.store.getState();

        for (const [resource, amount] of Object.entries(config.cost)) {
          if (resource === "volition") {
            if (gameState.volition < amount) return false;
          } else {
            if ((gameState[resource] || 0) < amount) return false;
          }
        }

        return true;
      },

      // Helper to check if player can afford a repair
      canAffordRepair: (shelterType) => {
        const config = get().shelterConfigs[shelterType];
        if (!config) return false;

        const gameState = gameEngine.store.getState();

        for (const [resource, amount] of Object.entries(config.repairCost)) {
          if (resource === "volition") {
            if (gameState.volition < amount) return false;
          } else {
            if ((gameState[resource] || 0) < amount) return false;
          }
        }

        return true;
      },

      // Get active threat info for UI
      getActiveThreatInfo: (threatType) => {
        const state = get();
        const threat = state.activeThreats[threatType];
        const config = state.threatConfigs[threatType];

        if (!threat || !config) return null;

        return {
          ...config,
          ...threat,
          protection: state.calculateProtection(threatType),
        };
      },
    }),
    {
      name: "threat-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        activeThreats: state.activeThreats,
        shelters: state.shelters,
      }),

      // Re-register active threats and systems after rehydration
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error || !state) return;

          // Re-register threat systems
          Object.keys(state.activeThreats).forEach((threatType) => {
            if (state.activeThreats[threatType]) {
              gameEngine.registerSystem(
                `Threat_${threatType}`,
                state.createThreatUpdate(threatType)
              );
            }
          });

          // Re-register durability system if there are shelters
          if (Object.keys(state.shelters).length > 0) {
            const systems = gameEngine.getRegisteredSystems();
            if (!systems.includes("ShelterDurability")) {
              state.registerDurabilitySystem();
            }
          }
        };
      },
    }
  )
);
