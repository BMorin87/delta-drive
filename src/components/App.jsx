import React, { useState, useEffect, useRef } from "react";

function GoldGame() {
  const [gold, setGold] = useState(0);
  const [goldPerSecond, setGoldPerSecond] = useState(1);
  const [miners, setMiners] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const intervalRef = useRef(null);

  // Game tick.
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setGold((prevGold) => prevGold + goldPerSecond);
      }, 1000); // 1000ms = 1 second.
    } else {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [goldPerSecond, isRunning]);

  const handleClick = () => {
    setGold((prevGold) => prevGold + 1);
  };

  const buyMiner = () => {
    const cost = (miners + 1) * 10;
    if (gold >= cost) {
      setGold((prevGold) => prevGold - cost);
      setMiners((prevMiners) => prevMiners + 1);
      setGoldPerSecond((prevGPS) => prevGPS + 1);
    }
  };

  const minerCost = (miners + 1) * 10;

  return (
    <div className="p-6 max-w-md mx-auto bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Gold Miner</h1>

      <div className="mb-4 text-center">
        <div className="text-lg">
          Gold:{" "}
          <span className="font-bold text-yellow-600">{Math.floor(gold)}</span>
        </div>
        <div className="text-sm text-gray-600">Per second: {goldPerSecond}</div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleClick}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Mine Gold (+1)
        </button>

        <button
          onClick={buyMiner}
          disabled={gold < minerCost}
          className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded"
        >
          Buy Miner ({minerCost} gold)
        </button>

        <div className="text-sm text-center">Miners: {miners}</div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
        >
          {isRunning ? "Pause Game" : "Resume Game"}
        </button>
      </div>
    </div>
  );
}

export default GoldGame;
