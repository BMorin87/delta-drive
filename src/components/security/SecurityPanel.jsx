import { useThreatStore } from "../threatStore";
import { useGameStore } from "../gameStore";
import "../../styles/security/SecurityPanel.css";

const SecurityPanel = () => {
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const shelters = useThreatStore((state) => state.shelters);
  const threatConfigs = useThreatStore((state) => state.threatConfigs);
  const shelterConfigs = useThreatStore((state) => state.shelterConfigs);
  const craftShelter = useThreatStore((state) => state.craftShelter);
  const repairShelter = useThreatStore((state) => state.repairShelter);
  const canAffordShelter = useThreatStore((state) => state.canAffordShelter);
  const canAffordRepair = useThreatStore((state) => state.canAffordRepair);
  const calculateProtection = useThreatStore((state) => state.calculateProtection);
  const getActiveThreatInfo = useThreatStore((state) => state.getActiveThreatInfo);

  const volition = useGameStore((state) => state.volition);
  const water = useGameStore((state) => state.water);
  const food = useGameStore((state) => state.food);
  const fibers = useGameStore((state) => state.fibers);

  const handleCraft = (shelterType) => {
    craftShelter(shelterType);
  };

  const handleRepair = (shelterType) => {
    repairShelter(shelterType);
  };

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
        return "🍎";
      case "fibers":
        return "🌾";
      case "volition":
        return "✨";
      default:
        return "";
    }
  };

  return (
    <div className="security-panel">
      <div className="security-header">
        <h2>Security</h2>
        <p className="tier-description">Protect your resources from environmental threats</p>
      </div>

      {/* Active Threats Section */}
      <div className="threats-section">
        <h3>Active Threats</h3>
        {Object.keys(activeThreats).filter((t) => activeThreats[t]).length === 0 ? (
          <div className="no-threats">
            <p>No active threats. Enjoy the peace while it lasts...</p>
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

      {/* Shelters Section */}
      <div className="shelters-section">
        <h3>Shelters</h3>
        <div className="shelters-grid">
          {Object.entries(shelterConfigs).map(([shelterType, config]) => {
            const shelter = shelters[shelterType];
            const isBuilt = !!shelter;
            const canAfford = canAffordShelter(shelterType);
            const canRepair = canAffordRepair(shelterType);
            const needsRepair = isBuilt && shelter.durability < config.durability;
            const isBroken = isBuilt && shelter.durability === 0;

            return (
              <div
                key={shelterType}
                className={`shelter-card ${isBuilt ? "built" : ""} ${isBroken ? "broken" : ""}`}
              >
                <div className="shelter-header">
                  <h4>{config.name}</h4>
                  <span className="shelter-icon">🏠</span>
                </div>

                <p className="shelter-description">{config.description}</p>

                <div className="shelter-stats">
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
                  {isBuilt && (
                    <div className="stat-row">
                      <span className="stat-label">Durability:</span>
                      <div className="durability-bar">
                        <div
                          className="durability-fill"
                          style={{
                            width: `${(shelter.durability / config.durability) * 100}%`,
                          }}
                        />
                        <span className="durability-text">
                          {formatTime(shelter.durability)} / {formatTime(config.durability)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {!isBuilt ? (
                  <>
                    <div className="cost-display">
                      <span className="cost-label">Cost:</span>
                      <div className="cost-items">
                        {Object.entries(config.cost).map(([resource, amount]) => (
                          <span
                            key={resource}
                            className={`cost-item ${
                              resource === "volition"
                                ? volition >= amount
                                  ? "affordable"
                                  : "unaffordable"
                                : (resource === "water"
                                    ? water
                                    : resource === "food"
                                    ? food
                                    : fibers) >= amount
                                ? "affordable"
                                : "unaffordable"
                            }`}
                          >
                            {getResourceIcon(resource)} {amount}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="craft-button"
                      onClick={() => handleCraft(shelterType)}
                      disabled={!canAfford}
                    >
                      Build
                    </button>
                  </>
                ) : (
                  <>
                    {needsRepair && (
                      <>
                        <div className="cost-display">
                          <span className="cost-label">Repair cost:</span>
                          <div className="cost-items">
                            {Object.entries(config.repairCost).map(([resource, amount]) => (
                              <span
                                key={resource}
                                className={`cost-item ${
                                  resource === "volition"
                                    ? volition >= amount
                                      ? "affordable"
                                      : "unaffordable"
                                    : (resource === "water"
                                        ? water
                                        : resource === "food"
                                        ? food
                                        : fibers) >= amount
                                    ? "affordable"
                                    : "unaffordable"
                                }`}
                              >
                                {getResourceIcon(resource)} {amount}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          className="repair-button"
                          onClick={() => handleRepair(shelterType)}
                          disabled={!canRepair}
                        >
                          {isBroken ? "Rebuild" : "Repair"}
                        </button>
                      </>
                    )}
                    {!needsRepair && <div className="shelter-status">✓ Fully maintained</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;
