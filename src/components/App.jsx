import { useEffect } from "react";
import { useGameStore } from "./gameStore";
import DeltaGame from "./DeltaGame";

const TICK_INTERVAL = 1000; // milliseconds

function App() {
  const { tick, isRunning } = useGameStore();

  // Single game loop
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(tick, TICK_INTERVAL);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tick, isRunning]);

  return <DeltaGame />;
}

export default App;
