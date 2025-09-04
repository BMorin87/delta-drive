class GameEngine {
  constructor() {
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
    if (!this.store) {
      console.warn("GameEngine: No store attached.");
      return;
    }

    const state = this.store.getState();
    const updates = {};

    // Run all registered systems.
    this.systems.forEach((updateFunction, name) => {
      try {
        const systemUpdate = updateFunction(state);
        if (systemUpdate && typeof systemUpdate === "object") {
          Object.assign(updates, systemUpdate);
        }
      } catch (error) {
        console.error(`Error in system ${name}:`, error);
      }
    });

    // Only update if there are changes.
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

export const gameEngine = new GameEngine();
