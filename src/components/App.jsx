import { useEffect } from "react";
import { useGameStore } from "./gameStore";
import "../styles/App.css";
import DeltaGame from "./DeltaGame";

function App() {
  const { TICKS_PER_SECOND, isRunning, tick } = useGameStore();

  // The game loop. Tells the gameStore to trigger a tick on the gameEngine at the desired interval. Can be paused.
  useEffect(() => {
    let interval;
    if (isRunning) {
      // The interval duration in milliseconds. TICKS_PER_SECOND is set in the gameStore.
      const tickInterval = 1000 / TICKS_PER_SECOND;
      interval = setInterval(tick, tickInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [TICKS_PER_SECOND, isRunning, tick]);

  // DeltaGame contains top-level game UI components and handles registration of initial game systems with the engine.
  return <DeltaGame />;
}

export default App;
