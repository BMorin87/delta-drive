import { describe, it, expect, beforeEach, vi } from "vitest";
import { gameEngine } from "../src/components/gameEngine";

describe("Game Systems Integration", () => {
  beforeEach(() => {
    gameEngine.systems.clear();
  });

  it("should simulate thirst system behavior", () => {
    const mockState = {
      thirst: 10,
      thirstCapacity: 100,
    };
    const mockStore = {
      getState: vi.fn().mockReturnValue(mockState),
      setState: vi.fn(),
    };

    // Mock the upgrade store call
    const mockUpgradeStore = {
      getUpgradeEffectAtLevel: vi.fn().mockReturnValue(5),
    };

    const thirstSystem = (state) => {
      if (state.thirst == null) return {};
      const totalGrowth =
        3 + mockUpgradeStore.getUpgradeEffectAtLevel("thirstRate"); // 3 + 5 = 8
      const cappedValue = Math.min(
        state.thirstCapacity,
        state.thirst + totalGrowth
      );
      return { thirst: cappedValue };
    };

    gameEngine.setStore(mockStore);
    gameEngine.registerSystem("Thirst", thirstSystem);

    gameEngine.tick();

    expect(mockStore.setState).toHaveBeenCalledWith(expect.any(Function));

    // Test the state update function
    const stateUpdateFn = mockStore.setState.mock.calls[0][0];
    const newState = stateUpdateFn(mockState);
    expect(newState.thirst).toBe(18); // 10 + 8 = 18
  });

  it("should respect capacity limits", () => {
    const mockState = {
      volition: 95,
      volitionCapacity: 100,
    };
    const mockStore = {
      getState: vi.fn().mockReturnValue(mockState),
      setState: vi.fn(),
    };

    const volitionSystem = (state) => {
      const totalGrowth = 10; // Would exceed capacity
      const cappedValue = Math.min(
        state.volitionCapacity,
        state.volition + totalGrowth
      );
      return { volition: cappedValue };
    };

    gameEngine.setStore(mockStore);
    gameEngine.registerSystem("Volition", volitionSystem);

    gameEngine.tick();

    const stateUpdateFn = mockStore.setState.mock.calls[0][0];
    const newState = stateUpdateFn(mockState);
    expect(newState.volition).toBe(100); // Capped at capacity
  });
});
