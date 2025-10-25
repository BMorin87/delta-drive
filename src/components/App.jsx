import { useEffect } from "react";
import { useGameStore } from "./gameStore";
import DeltaGame from "./DeltaGame";

function App() {
  const TICKS_PER_SECOND = useGameStore((state) => state.TICKS_PER_SECOND);
  const isRunning = useGameStore((state) => state.isRunning);
  const tick = useGameStore((state) => state.tick);

  // The game loop. Tells the gameEngine to tick at the desired interval. Can be paused.
  useEffect(() => {
    let interval;
    if (isRunning) {
      const tickInterval = 1000 / TICKS_PER_SECOND;
      interval = setInterval(tick, tickInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [TICKS_PER_SECOND, isRunning, tick]);

  // DeltaGame contains top-level game UI components and also registers the initial game systems with the gameEngine.
  return <DeltaGame />;
}

export default App;
