import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { gameEngine } from "./gameEngine";

const THREAT_CONFIGS = {
  drought: {
    name: "Drought",
    description: "The air is dry, water evaporates quickly",
    targetResource: "water",
    drainPerSecond: 0.15,
  },
  blight: {
    name: "Blight",
    description: "Pests threaten your food stores",
    targetResource: "food",
    drainPerSecond: 0.12,
  },
};

// Single shelter configuration with upgrade levels
const SHELTER_CONFIG = {
  name: "Shelter",
  description: "Protects against environmental threats",
  maxLevel: 5,
  baseCost: {
    fibers: 5,
    volition: 15,
  },
  baseRepairCost: {
    fibers: 2,
    volition: 8,
  },
  baseDurability: 120, // seconds
  // Costs increase by 50% per level
  getCost: (level) => ({
    fibers: Math.floor(5 * Math.pow(1.5, level - 1)),
    volition: Math.floor(15 * Math.pow(1.5, level - 1)),
  }),
  getRepairCost: (level) => ({
    fibers: Math.floor(2 * Math.pow(1.5, level - 1)),
    volition: Math.floor(8 * Math.pow(1.5, level - 1)),
  }),
  getDurability: (level) => Math.floor(120 * Math.pow(1.2, level - 1)),
};

export const useThreatStore = create(
  persist(
    (set, get) => ({
      activeThreats: {}, // { threatType: { level: 2, severity: 1.0 } }
      shelter: null, // { level: 1, durability: 120, maxDurability: 120 }
      threatConfigs: THREAT_CONFIGS,
      shelterConfig: SHELTER_CONFIG,

      // Spawn a threat with a specific level
      spawnThreat: (threatType, level = 1) => {
        const state = get();
        const config = state.threatConfigs[threatType];

        if (!config) return null;
        if (state.activeThreats[threatType]) return null;

        set((prev) => ({
          activeThreats: {
            ...prev.activeThreats,
            [threatType]: { level, severity: 1.0 },
          },
        }));

        gameEngine.registerSystem(`Threat_${threatType}`, state.createThreatUpdate(threatType));
        return threatType;
      },

      removeThreat: (threatType) => {
        gameEngine.unregisterSystem(`Threat_${threatType}`);
        set((prev) => {
          const newThreats = { ...prev.activeThreats };
          delete newThreats[threatType];
          return { activeThreats: newThreats };
        });
      },

      createThreatUpdate: (threatType) => {
        return (gameState) => {
          const state = get();
          const threat = state.activeThreats[threatType];
          const config = state.threatConfigs[threatType];

          if (!threat || !config) return {};

          // Check if threat is nullified by shelter
          const isNullified = state.isThreatNullified(threatType);
          if (isNullified) return {};

          const deltaTime = 1 / 12;
          const { targetResource, drainPerSecond } = config;
          const currentAmount = gameState[targetResource] || 0;
          const drain = drainPerSecond * threat.severity * deltaTime;

          if (currentAmount > 0 && drain > 0) {
            return {
              [targetResource]: Math.max(0, currentAmount - drain),
            };
          }

          return {};
        };
      },

      // Check if a threat is nullified by the shelter
      isThreatNullified: (threatType) => {
        const state = get();
        const threat = state.activeThreats[threatType];
        const shelter = state.shelter;

        if (!threat || !shelter) return false;
        if (shelter.durability <= 0) return false;

        // Shelter nullifies threat if shelter level >= threat level
        return shelter.level >= threat.level;
      },

      // Build initial shelter
      buildShelter: () => {
        const state = get();
        if (state.shelter) return false;

        const cost = state.shelterConfig.getCost(1);
        const gameStore = gameEngine.store;
        const gameState = gameStore.getState();

        // Check costs
        if (gameState.fibers < cost.fibers || gameState.volition < cost.volition) {
          return false;
        }

        // Spend resources
        gameState.spendVolition(cost.volition);
        gameStore.setState({ fibers: gameState.fibers - cost.fibers });

        // Create shelter
        const durability = state.shelterConfig.getDurability(1);
        set({
          shelter: {
            level: 1,
            durability: durability,
            maxDurability: durability,
          },
        });

        state.registerDurabilitySystem();
        return true;
      },

      // Upgrade shelter to next level
      upgradeShelter: () => {
        const state = get();
        const shelter = state.shelter;

        if (!shelter) return false;
        if (shelter.level >= state.shelterConfig.maxLevel) return false;

        const nextLevel = shelter.level + 1;
        const cost = state.shelterConfig.getCost(nextLevel);
        const gameStore = gameEngine.store;
        const gameState = gameStore.getState();

        // Check costs
        if (gameState.fibers < cost.fibers || gameState.volition < cost.volition) {
          return false;
        }

        // Spend resources
        gameState.spendVolition(cost.volition);
        gameStore.setState({ fibers: gameState.fibers - cost.fibers });

        // Upgrade shelter
        const newDurability = state.shelterConfig.getDurability(nextLevel);
        set({
          shelter: {
            level: nextLevel,
            durability: newDurability,
            maxDurability: newDurability,
          },
        });

        return true;
      },

      // Repair shelter
      repairShelter: () => {
        const state = get();
        const shelter = state.shelter;

        if (!shelter) return false;
        if (shelter.durability >= shelter.maxDurability) return false;

        const cost = state.shelterConfig.getRepairCost(shelter.level);
        const gameStore = gameEngine.store;
        const gameState = gameStore.getState();

        // Check costs
        if (gameState.fibers < cost.fibers || gameState.volition < cost.volition) {
          return false;
        }

        // Spend resources
        gameState.spendVolition(cost.volition);
        gameStore.setState({ fibers: gameState.fibers - cost.fibers });

        // Restore durability
        set((prev) => ({
          shelter: {
            ...prev.shelter,
            durability: prev.shelter.maxDurability,
          },
        }));

        return true;
      },

      registerDurabilitySystem: () => {
        const durabilitySystem = () => {
          const deltaTime = 1 / 12;

          set((prev) => {
            if (!prev.shelter || prev.shelter.durability <= 0) return prev;

            return {
              shelter: {
                ...prev.shelter,
                durability: Math.max(0, prev.shelter.durability - deltaTime),
              },
            };
          });

          return {};
        };

        gameEngine.registerSystem("ShelterDurability", durabilitySystem);
      },

      canAffordShelter: () => {
        const gameState = gameEngine.store.getState();
        const cost = SHELTER_CONFIG.getCost(1);
        return gameState.fibers >= cost.fibers && gameState.volition >= cost.volition;
      },

      canAffordUpgrade: () => {
        const state = get();
        if (!state.shelter || state.shelter.level >= SHELTER_CONFIG.maxLevel) return false;

        const gameState = gameEngine.store.getState();
        const cost = SHELTER_CONFIG.getCost(state.shelter.level + 1);
        return gameState.fibers >= cost.fibers && gameState.volition >= cost.volition;
      },

      canAffordRepair: () => {
        const state = get();
        if (!state.shelter) return false;

        const gameState = gameEngine.store.getState();
        const cost = SHELTER_CONFIG.getRepairCost(state.shelter.level);
        return gameState.fibers >= cost.fibers && gameState.volition >= cost.volition;
      },
      resetThreats: () => {
        // Unregister all active threat systems
        const state = get();
        Object.keys(state.activeThreats).forEach((threatType) => {
          gameEngine.unregisterSystem(`Threat_${threatType}`);
        });

        // Unregister durability system
        gameEngine.unregisterSystem("ShelterDurability");

        // Clear storage and reset to initial state
        useThreatStore.persist.clearStorage();
        set(
          {
            activeThreats: {},
            shelter: null,
          },
          true
        );
      },
    }),
    {
      name: "threat-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeThreats: state.activeThreats,
        shelter: state.shelter,
      }),
    }
  )
);
