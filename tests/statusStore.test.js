import { describe, it, expect, beforeEach } from "vitest";
import { useStatusStore } from "../src/components/statusStore";
import { useGameStore } from "../src/components/gameStore";
import { gameEngine } from "../src/components/gameEngine";

// Reset stores between tests
beforeEach(() => {
  // Reset game state to known baseline
  useGameStore.setState({
    volition: 50,
    thirst: 50,
    hunger: 50,
    fatigue: 50,
    volitionCapacity: 100,
    thirstCapacity: 100,
    hungerCapacity: 100,
    fatigueCapacity: 100,
    initialVolitionRate: 4 / 60,
    initialThirstRate: 3 / 60,
    initialHungerRate: 2 / 60,
    initialFatigueRate: 1 / 60,
    drinkUnlocked: false,
    eatUnlocked: false,
    nestUnlocked: false,
    isRunning: true,
  });

  // Reset status store to clean state
  useStatusStore.setState({
    activeStatuses: {},
    cooldowns: {},
    // statusConfigs should remain as they're the configuration, not state
  });

  // Ensure gameEngine has no systems
  gameEngine.systems.clear();
});

describe("statusStore", () => {
  it("should start a status when conditions are met", () => {
    const statusStore = useStatusStore.getState();

    const started = statusStore.startStatus("drink");
    expect(started).toBe(true);

    const active = statusStore.isStatusActive("drink");
    expect(active).toBe(true);

    const duration = statusStore.getStatusDuration("drink");
    expect(duration).toBeGreaterThan(0);
  });

  it("should put a status on cooldown when cancelled", () => {
    const statusStore = useStatusStore.getState();
    statusStore.startStatus("drink");
    statusStore.cancelStatus("drink");

    expect(statusStore.isStatusActive("drink")).toBe(false);
    expect(statusStore.getCooldownRemaining("drink")).toBeGreaterThan(0);
  });

  it("should prevent starting a status while on cooldown", () => {
    const statusStore = useStatusStore.getState();
    statusStore.startStatus("drink");
    statusStore.cancelStatus("drink");

    const restarted = statusStore.startStatus("drink");
    expect(restarted).toBe(false);
  });

  it("should reduce the target resource each tick", () => {
    const statusStore = useStatusStore.getState();
    statusStore.startStatus("drink");

    const thirstBefore = useGameStore.getState().thirst;

    // Simulate ticks
    for (let i = 0; i < 10; i++) {
      gameEngine.tick();
    }

    const thirstAfter = useGameStore.getState().thirst;
    expect(thirstAfter).toBeLessThan(thirstBefore);
  });

  it("should reward volition when resource is satisfied", () => {
    const statusStore = useStatusStore.getState();

    // Start thirsty with low volition
    useGameStore.setState({ thirst: 80, volition: 10 });
    statusStore.startStatus("drink");

    const volitionBefore = useGameStore.getState().volition;

    // Simulate ticks
    for (let i = 0; i < 20; i++) {
      gameEngine.tick();
    }

    const volitionAfter = useGameStore.getState().volition;
    expect(volitionAfter).toBeGreaterThan(volitionBefore);
  });

  it("should expire a status after its duration", () => {
    const statusStore = useStatusStore.getState();
    statusStore.startStatus("drink");

    // Simulate enough ticks for duration to expire
    for (let i = 0; i < 60 * 6; i++) {
      gameEngine.tick();
    }

    expect(statusStore.isStatusActive("drink")).toBe(false);
  });

  it("should apply synergy effects when two statuses are active", () => {
    const statusStore = useStatusStore.getState();

    // Make sure both resources are high enough to allow start
    useGameStore.setState({ thirst: 80, hunger: 80, volition: 50 });

    statusStore.startStatus("drink");
    statusStore.startStatus("eat");

    const volitionBefore = useGameStore.getState().volition;

    // Run ticks
    for (let i = 0; i < 30; i++) {
      gameEngine.tick();
    }

    const volitionAfter = useGameStore.getState().volition;
    const volitionGain = volitionAfter - volitionBefore;

    expect(volitionGain).toBeGreaterThan(0);
  });
});
