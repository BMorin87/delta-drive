import { useState, useEffect } from "react";
import { useGameStore } from "../gameStore";
import PhysiologicalNeeds from "./PhysiologicalNeeds";
import PhysiologicalUpgrades from "./PhysiologicalUpgrades";
import "../../styles/physiological/PhysiologicalPanel.css";

const PhysiologicalPanel = () => {
  const { volition, spendVolition, isUpgradePanelUnlocked } = useGameStore();
  const [activeView, setActiveView] = useState("progress");
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
    <div className="physiological-ui-container">
      <div className="physiological-content">
        <h1 className="tier-title">Physiological Needs</h1>

        {/* The toggle buttons display conditionally depending on the upgrade being unlocked. */}
        {showToggleButtons ? (
          <div className={`view-toggle-container ${unlockClass}`}>
            <button
              className={`view-toggle-btn ${
                activeView === "progress" ? "active" : ""
              }`}
              onClick={() => setActiveView("progress")}
            >
              Progress
            </button>
            <button
              className={`view-toggle-btn ${
                activeView === "upgrades" ? "active" : ""
              }`}
              onClick={() => setActiveView("upgrades")}
            >
              Upgrades
            </button>
          </div>
        ) : (
          // Render a fixed-height placeholder if the upgrade is locked to stabilize the layout.
          <div className="view-toggle-container" style={{ height: "50px" }} />
        )}

        {/* Conditional content view based on active toggle. */}
        {activeView === "progress" ? (
          <PhysiologicalNeeds />
        ) : (
          <PhysiologicalUpgrades
            currentVolition={volition}
            onSpendVolition={spendVolition}
          />
        )}
      </div>
    </div>
  );
};

export default PhysiologicalPanel;
