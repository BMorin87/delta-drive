import React, { useEffect } from "react";
import { useGameStore } from "./gameStore";
import GoldGame from "./GoldGame";

function App() {
  const tick = useGameStore((state) => state.tick);
  const isRunning = useGameStore((state) => state.isRunning);

  // Single game loop
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(tick, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tick, isRunning]);

  return <GoldGame />;
}

export default App;
