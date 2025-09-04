import { useGameStore } from "./gameStore";
import { gameEngine } from "./gameEngine";

function GoldGame() {
  const { gold, miners, isRunning, mineGold, buyMiner, togglePause } =
    useGameStore();

  const goldPerSecond = miners;
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
          onClick={mineGold}
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
          onClick={togglePause}
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
        >
          {isRunning ? "Pause Game" : "Resume Game"}
        </button>
      </div>
    </div>
  );
}

gameEngine.registerSystem("GoldMiner", (state) => {
  if (!state.miners) return {};

  return {
    gold: state.gold + state.miners,
  };
});

export default GoldGame;
