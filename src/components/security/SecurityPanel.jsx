import { useState } from "react";
import { useGameStore } from "../gameStore";
import SecurityStatus from "./SecurityStatus";
import SecurityCrafting from "./SecurityCrafting";
import "../../styles/security/SecurityPanel.css";

const SecurityPanel = () => {
  const isCraftingUnlocked = useGameStore((state) => state.isCraftingUnlocked);
  const [activeView, setActiveView] = useState("status");

  const unlockClass = isCraftingUnlocked ? "is-unlocked" : "";

  return (
    <>
      <div className="security-content">
        <h1 className="tier-title">Security</h1>

        {isCraftingUnlocked ? (
          // The toggle buttons are displayed if crafting has been unlocked.
          <div className={`view-toggle-container ${unlockClass}`}>
            <button
              className={`view-toggle-btn ${activeView === "status" ? "active" : ""}`}
              onClick={() => setActiveView("status")}
            >
              Status
            </button>
            <button
              className={`view-toggle-btn ${activeView === "crafting" ? "active" : ""}`}
              onClick={() => setActiveView("crafting")}
            >
              Crafting
            </button>
          </div>
        ) : (
          // Render a placeholder if crafting is locked to stabilize the layout.
          <div className="view-toggle-container" />
        )}

        {/* Always show status view if crafting isn't unlocked, otherwise show based on active view */}
        {!isCraftingUnlocked || activeView === "status" ? <SecurityStatus /> : <SecurityCrafting />}
      </div>
    </>
  );
};

export default SecurityPanel;
