import { useThreatStore } from "../threatStore";
import { useGameStore } from "../gameStore";

const SecurityCrafting = () => {
  const shelters = useThreatStore((state) => state.shelters);
  const threatConfigs = useThreatStore((state) => state.threatConfigs);
  const shelterConfigs = useThreatStore((state) => state.shelterConfigs);
  const craftShelter = useThreatStore((state) => state.craftShelter);
  const repairShelter = useThreatStore((state) => state.repairShelter);
  const canAffordShelter = useThreatStore((state) => state.canAffordShelter);
  const canAffordRepair = useThreatStore((state) => state.canAffordRepair);

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
        return "🎃";
      case "fibers":
        return "🌾";
      case "volition":
        return "✨";
      default:
        return "";
    }
  };

  const getResourceAmount = (resource) => {
    switch (resource) {
      case "water":
        return water;
      case "food":
        return food;
      case "fibers":
        return fibers;
      case "volition":
        return volition;
      default:
        return 0;
    }
  };

  return (
    <div className="security-crafting">
      <div className="crafting-header">
        <p>Build and maintain shelters to protect against environmental threats</p>
      </div>

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

              <div className="shelter-info">
                <div className="info-row">
                  <span className="info-label">Protects against:</span>
                  <span className="info-value">
                    {config.protectsAgainst.map((t) => threatConfigs[t]?.name).join(", ")}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Protection:</span>
                  <span className="info-value">{(config.protectionAmount * 100).toFixed(0)}%</span>
                </div>
                {isBuilt && (
                  <div className="info-row">
                    <span className="info-label">Durability:</span>
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
                      {Object.entries(config.cost).map(([resource, amount]) => {
                        const currentAmount = getResourceAmount(resource);
                        const canAffordResource = currentAmount >= amount;

                        return (
                          <span
                            key={resource}
                            className={`cost-item ${
                              canAffordResource ? "affordable" : "unaffordable"
                            }`}
                          >
                            {getResourceIcon(resource)} {amount}
                          </span>
                        );
                      })}
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
                          {Object.entries(config.repairCost).map(([resource, amount]) => {
                            const currentAmount = getResourceAmount(resource);
                            const canAffordResource = currentAmount >= amount;

                            return (
                              <span
                                key={resource}
                                className={`cost-item ${
                                  canAffordResource ? "affordable" : "unaffordable"
                                }`}
                              >
                                {getResourceIcon(resource)} {amount}
                              </span>
                            );
                          })}
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
  );
};

export default SecurityCrafting;
