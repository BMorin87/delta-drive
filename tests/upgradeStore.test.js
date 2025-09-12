import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUpgradeStore } from "../src/components/upgradeStore";

// Mock the game store - define the mock object directly in the factory function
vi.mock("../src/components/gameStore", () => ({
  useGameStore: {
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

// Import the mocked module after the mock declaration
import { useGameStore } from "../src/components/gameStore";

describe("upgradeStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useUpgradeStore.setState({
      upgrades: {
        volitionRate: { level: 0, baseCost: 10 },
        volitionCapacity: { level: 0, baseCost: 15 },
        thirstRate: { level: 0, baseCost: 8 },
        hungerRate: { level: 0, baseCost: 12 },
        fatigueRate: { level: 0, baseCost: 6 },
      },
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  describe("cost calculation", () => {
    it("should calculate base cost correctly", () => {
      const { getUpgradeCost } = useUpgradeStore.getState();

      expect(getUpgradeCost("volitionRate")).toBe(10);
      expect(getUpgradeCost("thirstRate")).toBe(8);
    });

    it("should scale cost with level", () => {
      // Set volitionRate to level 2
      useUpgradeStore.setState({
        upgrades: {
          ...useUpgradeStore.getState().upgrades,
          volitionRate: { level: 2, baseCost: 10 },
        },
      });

      const { getUpgradeCost } = useUpgradeStore.getState();

      // Cost should be 10 * 1.5^2 = 22.5, floored to 22
      expect(getUpgradeCost("volitionRate")).toBe(22);
    });

    it("should return 0 for non-existent upgrades", () => {
      const { getUpgradeCost } = useUpgradeStore.getState();

      expect(getUpgradeCost("nonExistent")).toBe(0);
    });
  });

  describe("affordability checks", () => {
    it("should correctly identify affordable upgrades", () => {
      useGameStore.getState.mockReturnValue({ volition: 50 });

      const { canAffordUpgrade } = useUpgradeStore.getState();

      expect(canAffordUpgrade("volitionRate")).toBe(true); // costs 10
      expect(canAffordUpgrade("volitionCapacity")).toBe(true); // costs 15
    });

    it("should correctly identify unaffordable upgrades", () => {
      useGameStore.getState.mockReturnValue({ volition: 5 });

      const { canAffordUpgrade } = useUpgradeStore.getState();

      expect(canAffordUpgrade("volitionRate")).toBe(false); // costs 10
      expect(canAffordUpgrade("volitionCapacity")).toBe(false); // costs 15
    });
  });

  describe("upgrade effects", () => {
    it("should calculate volition rate effects correctly", () => {
      const { getUpgradeEffectAtLevel } = useUpgradeStore.getState();

      expect(getUpgradeEffectAtLevel("volitionRate", 0)).toBe(0);
      expect(getUpgradeEffectAtLevel("volitionRate", 3)).toBeCloseTo(0.1, 5); // (3 * 2) / 60
    });

    it("should calculate capacity effects correctly", () => {
      const { getUpgradeEffectAtLevel } = useUpgradeStore.getState();

      expect(getUpgradeEffectAtLevel("volitionCapacity", 2)).toBe(50); // 2 * 25
    });

    it("should use current level when no level specified", () => {
      // Set current level to 3
      useUpgradeStore.setState({
        upgrades: {
          ...useUpgradeStore.getState().upgrades,
          volitionRate: { level: 3, baseCost: 10 },
        },
      });

      const { getUpgradeEffectAtLevel } = useUpgradeStore.getState();

      expect(getUpgradeEffectAtLevel("volitionRate")).toBeCloseTo(0.1, 5); // (3 * 2) / 60 = 0.1
    });
  });

  describe("purchase behavior", () => {
    it("should successfully purchase affordable upgrades", () => {
      useGameStore.getState.mockReturnValue({
        volition: 50,
        spendVolition: vi.fn().mockReturnValue(true),
      });

      const { purchaseUpgrade } = useUpgradeStore.getState();

      const success = purchaseUpgrade("volitionRate");

      expect(success).toBe(true);
      expect(useUpgradeStore.getState().upgrades.volitionRate.level).toBe(1);
    });

    it("should fail to purchase unaffordable upgrades", () => {
      useGameStore.getState.mockReturnValue({
        volition: 5,
        spendVolition: vi.fn(),
      });

      const { purchaseUpgrade } = useUpgradeStore.getState();

      const success = purchaseUpgrade("volitionRate");

      expect(success).toBe(false);
      expect(useUpgradeStore.getState().upgrades.volitionRate.level).toBe(0);
    });
  });
});
