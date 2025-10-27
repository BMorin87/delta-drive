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
    let freshestState = { ...oldState };

    // Run all registered update functions.
    this.systems.forEach((updateFunction, name) => {
      try {
        // Update functions return objects with key-value pairs that will get assigned to the gameStore's canonical state.
        const newStateUpdate = updateFunction(freshestState);
        if (newStateUpdate && typeof newStateUpdate === "object") {
          // Keep track of the updates performed this tick.
          Object.assign(updates, newStateUpdate);
          Object.assign(freshestState, newStateUpdate);
        }
      } catch (error) {
        console.error(`Error in system ${name}:`, error);
      }
    });

    // Calculate resource rates, then apply this tick's updates to the gameStore.
    if (Object.keys(updates).length > 0) {
      const newState = { ...oldState, ...updates };
      const rateUpdates = oldState._updateResourceRates(oldState, newState);

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
