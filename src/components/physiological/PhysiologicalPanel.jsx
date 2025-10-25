import { useState } from "react";
import { useGameStore } from "../gameStore";
import PhysiologicalNeeds from "./PhysiologicalNeeds";
import PhysiologicalUpgrades from "./PhysiologicalUpgrades";
import "../../styles/physiological/PhysiologicalPanel.css";

const PhysiologicalPanel = () => {
  const isUpgradePanelUnlocked = useGameStore((state) => state.isUpgradePanelUnlocked);
  const [activeView, setActiveView] = useState("drives");

  const unlockClass = isUpgradePanelUnlocked ? "is-unlocked" : "";

  return (
    <>
      <div className="physiological-content">
        <h1 className="tier-title">Physiological Needs</h1>

        {isUpgradePanelUnlocked ? (
          // The toggle buttons are displayed if the upgrade has been purchased.
          <div className={`view-toggle-container ${unlockClass}`}>
            <button
              className={`view-toggle-btn ${activeView === "drives" ? "active" : ""}`}
              onClick={() => setActiveView("drives")}
            >
              Drives
            </button>
            <button
              className={`view-toggle-btn ${activeView === "improvements" ? "active" : ""}`}
              onClick={() => setActiveView("improvements")}
            >
              Improvements
            </button>
          </div>
        ) : (
          // Render a placeholder if the upgrade is locked to stabilize the layout.
          <div className="view-toggle-container" />
        )}

        {/* The content view is conditional on the active toggle button. */}
        {activeView === "drives" ? <PhysiologicalNeeds /> : <PhysiologicalUpgrades />}
      </div>
    </>
  );
};

export default PhysiologicalPanel;
