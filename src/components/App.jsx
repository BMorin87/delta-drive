import { useEffect } from "react";
import { useGameStore } from "./gameStore";
import "../styles/App.css";
import DeltaGame from "./DeltaGame";

function App() {
  const { TICKS_PER_SECOND, isRunning, tick } = useGameStore();

  // The game loop.
  useEffect(() => {
    let interval;
    if (isRunning) {
      const tickInterval = 1000 / TICKS_PER_SECOND; // in milliseconds.
      interval = setInterval(tick, tickInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [TICKS_PER_SECOND, isRunning, tick]);

  return <DeltaGame />;
}

export default App;
