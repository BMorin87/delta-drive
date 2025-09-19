import { useState, useEffect } from "react";
import { gameEngine } from "./gameEngine";
import { useGameStore } from "./gameStore";
import { useStatusStore } from "./statusStore";
import "../styles/DebugPanel.css";

const GameDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [systemOutputs, setSystemOutputs] = useState({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [resourceRates, setResourceRates] = useState({});

  const gameState = useGameStore();
  const statusState = useStatusStore();

  // Capture system outputs by wrapping the tick function
  useEffect(() => {
    if (!isCapturing) return;

    const originalTick = gameEngine.tick.bind(gameEngine);
    let capturedOutputs = {};

    gameEngine.tick = function () {
      if (!this.store) return;

      const state = this.store.getState();
      const updates = {};
      capturedOutputs = {};

      // Run all registered systems and capture their outputs
      this.systems.forEach((updateFunction, name) => {
        try {
          const newStateUpdate = updateFunction({ ...state, ...updates });
          if (newStateUpdate && typeof newStateUpdate === "object") {
            // Store the output for debugging
            capturedOutputs[name] = newStateUpdate;
            Object.assign(updates, newStateUpdate);
          }
        } catch (error) {
          console.error(`Error in system ${name}:`, error);
          capturedOutputs[name] = { error: error.message };
        }
      });

      // Calculate rates for each system
      setResourceRates((prevRates) => {
        const newRates = { ...prevRates };

        Object.entries(capturedOutputs).forEach(([systemName, output]) => {
          if (output.error) return;

          if (!newRates[systemName]) {
            newRates[systemName] = {};
          }

          Object.entries(output).forEach(([resource, newValue]) => {
            if (typeof newValue === "number") {
              // Get previous value for this resource
              const prevValue = state[resource] || 0;
              const change = newValue - prevValue;
              const ratePerSecond = change * 60; // Convert from per-tick to per-second

              newRates[systemName][resource] = ratePerSecond;
            }
          });
        });

        return newRates;
      });

      // Update the captured outputs state
      setSystemOutputs({ ...capturedOutputs });

      // Only update if there are changes to the game state
      if (Object.keys(updates).length > 0) {
        this.store.setState((prevState) => ({
          ...prevState,
          ...updates,
        }));
      }
    };

    return () => {
      gameEngine.tick = originalTick;
    };
  }, [isCapturing]);

  // Clear rate tracking data when capture stops
  const toggleCapture = () => {
    setIsCapturing(!isCapturing);
    if (!isCapturing) {
      setSystemOutputs({});
      setResourceRates({});
    }
  };

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

  const formatValue = (value) => {
    if (typeof value === "number") {
      return value.toFixed(3);
    }
    return String(value);
  };

  const formatRate = (rate) => {
    if (typeof rate === "number") {
      const sign = rate >= 0 ? "+" : "";
      return `${sign}${rate.toFixed(2)}/s`;
    }
    return "";
  };

  const getRateForSystemResource = (systemName, resourceName) => {
    return resourceRates[systemName]?.[resourceName] || 0;
  };

  const registeredSystems = gameEngine.getRegisteredSystems();

  return (
    <div className="debug-panel">
      <div className="debug-panel-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="debug-panel-title">
          🐛 Debug Panel [{registeredSystems.length} systems]
        </span>
        <span className="debug-panel-toggle">{isOpen ? "▼" : "▲"}</span>
      </div>

      {isOpen && (
        <div className="debug-panel-content">
          <div className="debug-capture-controls">
            <button
              onClick={toggleCapture}
              className={`debug-capture-btn ${isCapturing ? "capturing" : ""}`}
            >
              {isCapturing ? "⏹ Stop Capture" : "▶ Start Capture"}
            </button>
            <span className="debug-capture-status">
              {isCapturing
                ? "Capturing system outputs..."
                : "Click to monitor system outputs"}
            </span>
          </div>

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

          {/* System Outputs */}
          {isCapturing && Object.keys(systemOutputs).length > 0 && (
            <div className="debug-outputs-section">
              <h4 className="debug-section-title">Live System Outputs</h4>

              {/* Always-on Systems */}
              <div style={{ marginBottom: "12px" }}>
                <h5 className="debug-subsection-title always-on">
                  Always-On Systems
                </h5>
                {Object.entries(systemOutputs)
                  .filter(([name]) => getSystemType(name) === "always-on")
                  .map(([systemName, output]) => (
                    <div
                      key={systemName}
                      className="debug-system-output always-on"
                    >
                      <div className="debug-system-name">{systemName}</div>
                      {output.error ? (
                        <div className="debug-output-value error">
                          Error: {output.error}
                        </div>
                      ) : (
                        Object.entries(output).map(([key, value]) => {
                          const rate = getRateForSystemResource(
                            systemName,
                            key
                          );
                          return (
                            <div key={key} className="debug-output-value">
                              {key}: {formatValue(value)}{" "}
                              <span style={{ color: "#888", fontSize: "10px" }}>
                                ({formatRate(rate)})
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ))}
              </div>

              <div>
                <h5 className="debug-subsection-title temporary-status">
                  Temporary Status Systems
                </h5>
                {Object.entries(systemOutputs)
                  .filter(
                    ([name]) => getSystemType(name) === "temporary-status"
                  )
                  .map(([systemName, output]) => {
                    const statusInfo = getStatusInfo(systemName);
                    return (
                      <div
                        key={systemName}
                        className="debug-system-output temporary-status"
                      >
                        <div className="debug-system-name">
                          {systemName}
                          {statusInfo && (
                            <span className="debug-system-duration">
                              ({statusInfo.activeStatus.duration.toFixed(1)}s
                              remaining)
                            </span>
                          )}
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

                        {/* System outputs (rewards/changes) */}
                        {output.error ? (
                          <div className="debug-output-value error">
                            Error: {output.error}
                          </div>
                        ) : (
                          Object.entries(output).map(([key, value]) => {
                            const rate = getRateForSystemResource(
                              systemName,
                              key
                            );
                            return (
                              <div
                                key={key}
                                className={`debug-output-value ${
                                  key === "volition" ? "reward" : ""
                                }`}
                              >
                                {key}: {formatValue(value)}{" "}
                                <span
                                  style={{ color: "#888", fontSize: "10px" }}
                                >
                                  ({formatRate(rate)})
                                </span>
                                {key === "volition" && " (reward)"}
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Other Systems */}
              {Object.entries(systemOutputs).filter(
                ([name]) => getSystemType(name) === "other"
              ).length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <h5 className="debug-subsection-title other">
                    Other Systems
                  </h5>
                  {Object.entries(systemOutputs)
                    .filter(([name]) => getSystemType(name) === "other")
                    .map(([systemName, output]) => (
                      <div
                        key={systemName}
                        className="debug-system-output other"
                      >
                        <div className="debug-system-name">{systemName}</div>
                        {output.error ? (
                          <div className="debug-output-value error">
                            Error: {output.error}
                          </div>
                        ) : (
                          Object.entries(output).map(([key, value]) => {
                            const rate = getRateForSystemResource(
                              systemName,
                              key
                            );
                            return (
                              <div key={key} className="debug-output-value">
                                {key}: {formatValue(value)}{" "}
                                <span
                                  style={{ color: "#888", fontSize: "10px" }}
                                >
                                  ({formatRate(rate)})
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {!isCapturing && (
            <div className="debug-helper-text">
              Start capture to see live system outputs. The debug panel will
              intercept game engine ticks and display what each registered
              system returns.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameDebugPanel;
