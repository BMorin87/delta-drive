class GameEngine {
  constructor() {
    // Use a Map to store systems by name and enforce uniqueness.
    this.systems = new Map();
    this.store = null;
  }

  registerSystem(name, updateFunction) {
    this.systems.set(name, updateFunction);
  }

  unregisterSystem(name) {
    const removed = this.systems.delete(name);
    return removed;
  }

  tick() {
    if (!this.store) return;

    const oldState = this.store.getState();
    const updates = {};

    // Run all registered systems.
    this.systems.forEach((updateFunction, name) => {
      try {
        // Use "current" game state, including any previous updates from the current tick.
        const newStateUpdate = updateFunction({ ...oldState, ...updates });
        if (newStateUpdate && typeof newStateUpdate === "object") {
          Object.assign(updates, newStateUpdate);
        }
      } catch (error) {
        console.error(`Error in system ${name}:`, error);
      }
    });

    // Only update if there are changes to the game state.
    if (Object.keys(updates).length > 0) {
      // Calculate resource rates before updating state
      const newState = { ...oldState, ...updates };
      const rateUpdates = oldState._updateResourceRates
        ? oldState._updateResourceRates(oldState, newState)
        : {};

      this.store.setState((prevState) => ({
        ...prevState,
        ...updates,
        ...rateUpdates,
      }));
    }
  }

  setStore(store) {
    this.store = store;
  }

  getRegisteredSystems() {
    return Array.from(this.systems.keys());
  }
}

// gameEngine is a singleton.
export const gameEngine = new GameEngine();
