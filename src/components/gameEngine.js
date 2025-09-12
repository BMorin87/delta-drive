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

    const state = this.store.getState();
    const updates = {};

    // Run all registered systems.
    this.systems.forEach((updateFunction, name) => {
      try {
        const stateWithUpdates = { ...state, ...updates };
        const systemUpdate = updateFunction(stateWithUpdates);
        if (systemUpdate && typeof systemUpdate === "object") {
          Object.assign(updates, systemUpdate);
        }
      } catch (error) {
        console.error(`Error in system ${name}:`, error);
      }
    });

    // Only update if there are changes to the game state.
    if (Object.keys(updates).length > 0) {
      this.store.setState((prevState) => ({
        ...prevState,
        ...updates,
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
