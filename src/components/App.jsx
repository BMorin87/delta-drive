import { useEffect } from "react";
import { useGameStore } from "./gameStore";
import "../styles/App.css";
import DeltaGame from "./DeltaGame";

const TICK_INTERVAL = 20; // milliseconds

function App() {
  const { tick, isRunning } = useGameStore();

  // The game loop.
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
