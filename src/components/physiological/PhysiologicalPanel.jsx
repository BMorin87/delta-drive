import { useState } from "react";
import { useGameStore } from "../gameStore";
import PhysiologicalNeeds from "./PhysiologicalNeeds";
import PhysiologicalUpgrades from "./PhysiologicalUpgrades";
import "../../styles/physiological/PhysiologicalPanel.css";

const PhysiologicalPanel = () => {
  const [activeView, setActiveView] = useState("progress");
  const { volition, spendVolition, isUpgradePanelUnlocked } = useGameStore();

  return (
    <div className="physiological-ui-container">
      <div className="physiological-content">
        <h1 className="tier-title">Physiological Needs</h1>

        {/* Conditional display on toggle buttons to go to the Upgrades page. */}
        {isUpgradePanelUnlocked ? (
          <div className="view-toggle-container">
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
          <div
            className="toggle-button-placeholder"
            style={{ height: "66px" }}
          />
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
