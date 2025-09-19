import { useState } from "react";
import { gameEngine } from "./gameEngine";
import { useGameStore } from "./gameStore";
import { useStatusStore } from "./statusStore";
import "../styles/DebugPanel.css";

const GameDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const gameState = useGameStore();
  const statusState = useStatusStore();

  // Subscribe to the rates from gameStore instead of calculating our own
  const resourceRates = useGameStore((state) => state.resourceRates);

  const getSystemType = (systemName) => {
    const alwaysOnSystems = ["Thirst", "Hunger", "Fatigue", "Volition"];
    if (alwaysOnSystems.includes(systemName)) return "always-on";
    if (systemName.startsWith("Status_")) return "temporary-status";
    return "other";
  };

  const getStatusInfo = (statusName) => {
    const statusType = statusName.replace("Status_", "");
    const config = statusState.statusConfigs[statusType];
    const activeStatus = statusState.activeStatuses[statusType];

    if (!config || !activeStatus) return null;

    // Calculate cost information
    const cost = statusState.calculateVolitionCost(statusType);
    const needLevel = gameState[config.cost.need];
    const maxNeed = gameState[config.cost.capacity];

    return {
      config,
      activeStatus,
      cost: {
        volition: cost,
        need: config.cost.need,
        needLevel: needLevel,
        maxNeed: maxNeed,
        needRatio: needLevel / maxNeed,
      },
    };
  };

  const formatRate = (rate) => {
    if (typeof rate === "number") {
      const sign = rate >= 0 ? "+" : "";
      return `${sign}${rate.toFixed(2)}/s`;
    }
    return "0.0/s";
  };

  const registeredSystems = gameEngine.getRegisteredSystems();

  return (
    <div className="debug-panel">
      <div className="debug-panel-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="debug-panel-title">
          🛠 Debug Panel [{registeredSystems.length} systems]
        </span>
        <span className="debug-panel-toggle">{isOpen ? "▼" : "▲"}</span>
      </div>

      {isOpen && (
        <div className="debug-panel-content">
          <div className="debug-systems-list">
            <h4 className="debug-section-title">
              Registered Systems ({registeredSystems.length})
            </h4>
            <div>
              {registeredSystems.map((name) => (
                <div
                  key={name}
                  className={`debug-system-item ${getSystemType(name).replace(
                    "-",
                    "-"
                  )}`}
                >
                  • {name} ({getSystemType(name)})
                </div>
              ))}
            </div>
          </div>

          {/* Resource Rates from Game Store */}
          <div className="debug-outputs-section">
            <h4 className="debug-section-title">
              Resource Rates (from Game Store)
            </h4>

            <div style={{ marginBottom: "12px" }}>
              <h5 className="debug-subsection-title always-on">
                Always-On Resource Rates
              </h5>
              {Object.entries(resourceRates).map(([resource, rate]) => (
                <div key={resource} className="debug-system-output always-on">
                  <div className="debug-system-name">{resource}</div>
                  <div className="debug-output-value">
                    Current: {gameState[resource]?.toFixed(2) || "0.00"}
                    <span
                      style={{
                        color: "#888",
                        fontSize: "10px",
                        marginLeft: "8px",
                      }}
                    >
                      ({formatRate(rate)})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Status Systems */}
            <div>
              <h5 className="debug-subsection-title temporary-status">
                Active Status Systems
              </h5>
              {Object.entries(statusState.activeStatuses || {})
                .filter(([, status]) => status && status.duration > 0)
                .map(([statusType, status]) => {
                  const systemName = `Status_${statusType}`;
                  const statusInfo = getStatusInfo(systemName);

                  return (
                    <div
                      key={systemName}
                      className="debug-system-output temporary-status"
                    >
                      <div className="debug-system-name">
                        {systemName}
                        <span className="debug-system-duration">
                          ({status.duration.toFixed(1)}s remaining)
                        </span>
                      </div>

                      {/* Status cost info */}
                      {statusInfo && (
                        <div className="debug-system-cost">
                          Cost: {statusInfo.cost.volition} volition, Need:{" "}
                          {statusInfo.cost.need} (
                          {statusInfo.cost.needLevel.toFixed(1)}/
                          {statusInfo.cost.maxNeed})
                        </div>
                      )}

                      {/* Note: Individual system outputs would require tick interception */}
                      <div className="debug-output-value">
                        System active - contributing to resource rates above
                      </div>
                    </div>
                  );
                })}

              {Object.keys(statusState.activeStatuses || {}).filter(
                (key) => statusState.activeStatuses[key]?.duration > 0
              ).length === 0 && (
                <div className="debug-helper-text">
                  No active status systems
                </div>
              )}
            </div>
          </div>

          <div className="debug-helper-text">
            Resource rates are calculated by the game engine and stored in the
            game state. This shows the true combined rate from all systems
            including temporary statuses.
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDebugPanel;
