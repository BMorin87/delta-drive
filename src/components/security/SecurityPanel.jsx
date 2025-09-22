import { useState } from "react";
import { useGameStore } from "../gameStore";

const SecurityPanel = () => {
  const [activeView, setActiveView] = useState("progress");

  const { volition, spendVolition } = useGameStore();

  // Placeholder security-related stats - you'll want to add these to your game store
  const [shelter, setShelter] = useState(50);
  const [income, setIncome] = useState(25);
  const [health, setHealth] = useState(75);

  const shelterCapacity = 100;
  const incomeCapacity = 100;
  const healthCapacity = 100;

  const handleImproveAction = (type) => {
    const cost = 10; // Example cost
    if (volition >= cost) {
      spendVolition(cost);

      switch (type) {
        case "shelter":
          setShelter((prev) => Math.min(shelterCapacity, prev + 15));
          break;
        case "income":
          setIncome((prev) => Math.min(incomeCapacity, prev + 10));
          break;
        case "health":
          setHealth((prev) => Math.min(healthCapacity, prev + 12));
          break;
      }
    }
  };

  return (
    <div className="security-panel">
      <div className="security-content">
        <h1 className="tier-title">Security & Safety</h1>
        <p className="tier-subtitle">
          Build stability and protection in your life
        </p>

        {/* Toggle buttons */}
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
            Improvements
          </button>
        </div>

        {activeView === "progress" ? (
          <>
            <div className="security-stats-container">
              {/* Shelter Security */}
              <div className="security-stat-item">
                <h3>🏠 Shelter</h3>
                <div className="progress-bar-horizontal">
                  <div
                    className="progress-fill shelter-fill"
                    style={{ width: `${(shelter / shelterCapacity) * 100}%` }}
                  />
                </div>
                <div className="stat-value">
                  {shelter}/{shelterCapacity}
                </div>
                <button
                  className="improve-button"
                  onClick={() => handleImproveAction("shelter")}
                  disabled={volition < 10}
                >
                  Improve Housing (10 💭)
                </button>
              </div>

              {/* Financial Security */}
              <div className="security-stat-item">
                <h3>💰 Financial Stability</h3>
                <div className="progress-bar-horizontal">
                  <div
                    className="progress-fill income-fill"
                    style={{ width: `${(income / incomeCapacity) * 100}%` }}
                  />
                </div>
                <div className="stat-value">
                  {income}/{incomeCapacity}
                </div>
                <button
                  className="improve-button"
                  onClick={() => handleImproveAction("income")}
                  disabled={volition < 10}
                >
                  Seek Opportunities (10 💭)
                </button>
              </div>

              {/* Health Security */}
              <div className="security-stat-item">
                <h3>⚕️ Health & Wellness</h3>
                <div className="progress-bar-horizontal">
                  <div
                    className="progress-fill health-fill"
                    style={{ width: `${(health / healthCapacity) * 100}%` }}
                  />
                </div>
                <div className="stat-value">
                  {health}/{healthCapacity}
                </div>
                <button
                  className="improve-button"
                  onClick={() => handleImproveAction("health")}
                  disabled={volition < 10}
                >
                  Health Check (10 💭)
                </button>
              </div>
            </div>

            <div className="tier-note">
              <p>
                Establish security and stability to unlock higher tiers of
                growth.
              </p>
              <p>
                Current Security Level:{" "}
                {Math.floor((shelter + income + health) / 3)}%
              </p>
            </div>
          </>
        ) : (
          <div className="security-upgrades">
            <h3>Security Improvements</h3>
            <p>Upgrade options coming soon...</p>
            <div className="upgrade-placeholder">
              <div className="upgrade-item-placeholder">
                <h4>🔒 Enhanced Security</h4>
                <p>Improve your overall safety measures</p>
                <button disabled>Coming Soon</button>
              </div>
              <div className="upgrade-item-placeholder">
                <h4>📊 Financial Planning</h4>
                <p>Better manage your resources</p>
                <button disabled>Coming Soon</button>
              </div>
              <div className="upgrade-item-placeholder">
                <h4>🏥 Health Insurance</h4>
                <p>Protect against unexpected health costs</p>
                <button disabled>Coming Soon</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPanel;
