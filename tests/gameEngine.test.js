import { describe, it, expect, beforeEach, vi } from "vitest";
import { gameEngine } from "../src/components/gameEngine";

describe("GameEngine", () => {
  beforeEach(() => {
    // Clear all systems before each test
    gameEngine.systems.clear();
    gameEngine.store = null;
  });

  describe("system registration", () => {
    it("should register and track systems", () => {
      const mockSystem = vi.fn();

      gameEngine.registerSystem("testSystem", mockSystem);

      expect(gameEngine.getRegisteredSystems()).toContain("testSystem");
    });

    it("should unregister systems", () => {
      const mockSystem = vi.fn();
      gameEngine.registerSystem("testSystem", mockSystem);

      const wasRemoved = gameEngine.unregisterSystem("testSystem");

      expect(wasRemoved).toBe(true);
      expect(gameEngine.getRegisteredSystems()).not.toContain("testSystem");
    });

    it("should return false when unregistering non-existent system", () => {
      const wasRemoved = gameEngine.unregisterSystem("nonExistent");

      expect(wasRemoved).toBe(false);
    });
  });

  describe("tick behavior", () => {
    it("should not tick when no store is set", () => {
      const mockSystem = vi.fn();
      gameEngine.registerSystem("testSystem", mockSystem);

      gameEngine.tick();

      expect(mockSystem).not.toHaveBeenCalled();
    });

    it("should update store with system changes", () => {
      const mockState = { volition: 50 };
      const mockStore = {
        getState: vi.fn().mockReturnValue(mockState),
        setState: vi.fn(),
      };

      const system = vi.fn().mockReturnValue({ volition: 55, thirst: 30 });

      gameEngine.setStore(mockStore);
      gameEngine.registerSystem("testSystem", system);

      gameEngine.tick();

      expect(mockStore.setState).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should not update store when no systems return changes", () => {
      const mockState = { volition: 50 };
      const mockStore = {
        getState: vi.fn().mockReturnValue(mockState),
        setState: vi.fn(),
      };

      const system1 = vi.fn().mockReturnValue(null);
      const system2 = vi.fn().mockReturnValue(undefined);
      const system3 = vi.fn().mockReturnValue({});

      gameEngine.setStore(mockStore);
      gameEngine.registerSystem("system1", system1);
      gameEngine.registerSystem("system2", system2);
      gameEngine.registerSystem("system3", system3);

      gameEngine.tick();

      expect(mockStore.setState).not.toHaveBeenCalled();
    });

    it("should handle system errors gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockState = { volition: 50 };
      const mockStore = {
        getState: vi.fn().mockReturnValue(mockState),
        setState: vi.fn(),
      };

      const brokenSystem = vi.fn().mockImplementation(() => {
        throw new Error("System crashed");
      });
      const workingSystem = vi.fn().mockReturnValue({ volition: 55 });

      gameEngine.setStore(mockStore);
      gameEngine.registerSystem("broken", brokenSystem);
      gameEngine.registerSystem("working", workingSystem);

      gameEngine.tick();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in system broken:",
        expect.any(Error)
      );
      expect(mockStore.setState).toHaveBeenCalled(); // Working system still updates

      consoleSpy.mockRestore();
    });
  });
});
