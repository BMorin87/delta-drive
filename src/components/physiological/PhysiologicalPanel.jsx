import { useState, useEffect } from "react";
import { useGameStore } from "../gameStore";
import PhysiologicalNeeds from "./PhysiologicalNeeds";
import PhysiologicalUpgrades from "./PhysiologicalUpgrades";
import "../../styles/physiological/PhysiologicalPanel.css";

const PhysiologicalPanel = () => {
  const { isUpgradePanelUnlocked } = useGameStore();
  const [activeView, setActiveView] = useState("drives");
  const [showToggleButtons, setShowToggleButtons] = useState(
    isUpgradePanelUnlocked
  );

  useEffect(() => {
    if (isUpgradePanelUnlocked) {
      setShowToggleButtons(true);
    }
  }, [isUpgradePanelUnlocked]);

  const unlockClass = showToggleButtons ? "is-unlocked" : "";

  return (
    <>
      <div className="physiological-content">
        <h1 className="tier-title">Physiological Needs</h1>

        {/* The toggle buttons display conditionally depending on the upgrade being unlocked. */}
        {showToggleButtons ? (
          <div className={`view-toggle-container ${unlockClass}`}>
            <button
              className={`view-toggle-btn ${
                activeView === "drives" ? "active" : ""
              }`}
              onClick={() => setActiveView("drives")}
            >
              Drives
            </button>
            <button
              className={`view-toggle-btn ${
                activeView === "improvements" ? "active" : ""
              }`}
              onClick={() => setActiveView("improvements")}
            >
              Improvements
            </button>
          </div>
        ) : (
          // Render a placeholder if the upgrade is locked to stabilize the layout.
          <div className="view-toggle-container" />
        )}

        {/* Conditional content view based on active toggle. */}
        {activeView === "drives" ? (
          <PhysiologicalNeeds />
        ) : (
          <PhysiologicalUpgrades />
        )}
      </div>
    </>
  );
};

export default PhysiologicalPanel;
