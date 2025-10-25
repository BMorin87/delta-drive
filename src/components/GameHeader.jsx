import { useState } from "react";
import { useGameStore } from "./gameStore";
import SettingsMenu from "./SettingsMenu";
import "../styles/GameHeader.css";

const GameHeader = () => {
  const isRunning = useGameStore((state) => state.isRunning);
  const togglePause = useGameStore((state) => state.togglePause);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <>
      <header className="game-header">
        <div className="header-content">
          <div className="header-controls">
            <button onClick={togglePause} className="header-btn pause-btn">
              {isRunning ? "⏸️" : "▶️"}
            </button>
            <button onClick={handleSettingsToggle} className="header-btn settings-btn">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </header>

      <SettingsMenu isOpen={isSettingsOpen} onClose={handleSettingsToggle} />
    </>
  );
};

export default GameHeader;
