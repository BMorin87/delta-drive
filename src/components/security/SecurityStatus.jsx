import { useThreatStore } from "../threatStore";
import { useGameStore } from "../gameStore";

const SecurityStatus = () => {
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const shelters = useThreatStore((state) => state.shelters);
  const threatConfigs = useThreatStore((state) => state.threatConfigs);
  const shelterConfigs = useThreatStore((state) => state.shelterConfigs);
  const calculateProtection = useThreatStore((state) => state.calculateProtection);
  const getActiveThreatInfo = useThreatStore((state) => state.getActiveThreatInfo);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const getResourceIcon = (resource) => {
    switch (resource) {
      case "water":
        return "💧";
      case "food":
        return "🎃";
      case "fibers":
        return "🌾";
      case "volition":
        return "✨";
      default:
        return "";
    }
  };

  // Calculate overall health/protection status
  const calculateOverallHealth = () => {
    const totalShelters = Object.keys(shelterConfigs).length;
    const builtShelters = Object.keys(shelters).length;

    if (builtShelters === 0) return 0;

    let totalDurabilityPercent = 0;
    Object.entries(shelters).forEach(([type, shelter]) => {
      const config = shelterConfigs[type];
      if (config) {
        totalDurabilityPercent += (shelter.durability / config.durability) * 100;
      }
    });

    return totalDurabilityPercent / builtShelters;
  };

  const overallHealth = calculateOverallHealth();

  return (
    <div className="security-status">
      {/* Overall Health Indicator */}
      <div className="health-indicator">
        <h3>Overall Protection</h3>
        <div className="health-bar-container">
          <div className="health-bar-fill" style={{ width: `${overallHealth}%` }} />
          <span className="health-percentage">{overallHealth.toFixed(0)}%</span>
        </div>
        <p className="health-description">
          {overallHealth >= 75
            ? "Your defenses are strong"
            : overallHealth >= 50
            ? "Your defenses need attention"
            : overallHealth > 0
            ? "Your defenses are deteriorating"
            : "You have no protection"}
        </p>
      </div>

      {/* Active Threats Display */}
      <div className="threats-section">
        <h3>Active Threats</h3>
        {Object.keys(activeThreats).filter((t) => activeThreats[t]).length === 0 ? (
          <div className="no-threats">
            <p>No active threats detected</p>
          </div>
        ) : (
          <div className="threats-list">
            {Object.entries(activeThreats)
              .filter(([_, threat]) => threat)
              .map(([threatType, _]) => {
                const info = getActiveThreatInfo(threatType);
                if (!info) return null;

                const protection = calculateProtection(threatType);
                const effectiveDrain = info.effects[0].drainPerSecond * (1 - protection);

                return (
                  <div key={threatType} className="threat-card active">
                    <div className="threat-header">
                      <span className="threat-icon">⚠️</span>
                      <div className="threat-info">
                        <h4>{info.name}</h4>
                        <p className="threat-description">{info.description}</p>
                      </div>
                    </div>
                    <div className="threat-effects">
                      {info.effects.map((effect, idx) => (
                        <div key={idx} className="effect-item">
                          <span className="resource-drain">
                            {getResourceIcon(effect.targetResource)}{" "}
                            <span className={protection > 0 ? "reduced" : ""}>
                              -{effectiveDrain.toFixed(2)}/s
                            </span>
                            {protection > 0 && (
                              <span className="protection-indicator">
                                {" "}
                                ({(protection * 100).toFixed(0)}% protected)
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Equipment/Shelter Status Display */}
      <div className="equipment-section">
        <h3>Equipped Shelters</h3>
        {Object.keys(shelters).length === 0 ? (
          <div className="no-equipment">
            <p>No shelters built yet</p>
          </div>
        ) : (
          <div className="equipment-list">
            {Object.entries(shelters).map(([shelterType, shelter]) => {
              const config = shelterConfigs[shelterType];
              if (!config) return null;

              const durabilityPercent = (shelter.durability / config.durability) * 100;
              const isBroken = shelter.durability === 0;

              return (
                <div key={shelterType} className={`equipment-card ${isBroken ? "broken" : ""}`}>
                  <div className="equipment-header">
                    <span className="equipment-icon">🏠</span>
                    <h4>{config.name}</h4>
                  </div>

                  <div className="equipment-stats">
                    <div className="stat-row">
                      <span className="stat-label">Protects against:</span>
                      <span className="stat-value">
                        {config.protectsAgainst.map((t) => threatConfigs[t]?.name).join(", ")}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Protection:</span>
                      <span className="stat-value">
                        {(config.protectionAmount * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Durability:</span>
                      <div className="durability-bar">
                        <div
                          className="durability-fill"
                          style={{ width: `${durabilityPercent}%` }}
                        />
                        <span className="durability-text">
                          {formatTime(shelter.durability)} / {formatTime(config.durability)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isBroken && (
                    <div className="broken-warning">
                      ⚠️ This shelter is broken and provides no protection
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityStatus;
