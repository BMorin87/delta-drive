import { useThreatStore } from "../threatStore";
import { useGameStore } from "../gameStore";
import "../../styles/security/SecurityCrafting.css";

const SecurityCrafting = () => {
  const shelter = useThreatStore((state) => state.shelter);
  const threatConfigs = useThreatStore((state) => state.threatConfigs);
  const shelterConfig = useThreatStore((state) => state.shelterConfig); // Changed from shelterConfigs
  const buildShelter = useThreatStore((state) => state.buildShelter);
  const upgradeShelter = useThreatStore((state) => state.upgradeShelter);
  const repairShelter = useThreatStore((state) => state.repairShelter);
  const canAffordShelter = useThreatStore((state) => state.canAffordShelter);
  const canAffordUpgrade = useThreatStore((state) => state.canAffordUpgrade);
  const canAffordRepair = useThreatStore((state) => state.canAffordRepair);

  const volition = useGameStore((state) => state.volition);
  const fibers = useGameStore((state) => state.fibers);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const getResourceIcon = (resource) => {
    switch (resource) {
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
      case "fibers":
        return fibers;
      case "volition":
        return volition;
      default:
        return 0;
    }
  };

  const isBuilt = !!shelter;
  const canAfford = canAffordShelter();
  const canUpgrade = canAffordUpgrade();
  const canRepair = canAffordRepair();
  const needsRepair = isBuilt && shelter.durability < shelter.maxDurability;
  const isBroken = isBuilt && shelter.durability === 0;
  const isMaxLevel = isBuilt && shelter.level >= shelterConfig.maxLevel;

  return (
    <div className="security-crafting">
      <div className="crafting-header">
        <p>Build and maintain your shelter to protect against environmental threats</p>
      </div>

      <div className="shelters-grid">
        <div className={`shelter-card ${isBuilt ? "built" : ""} ${isBroken ? "broken" : ""}`}>
          <div className="shelter-header">
            <h4>{shelterConfig.name}</h4>
            <span className="shelter-icon">🏠</span>
          </div>

          <p className="shelter-description">{shelterConfig.description}</p>

          <div className="shelter-info">
            <div className="info-row">
              <span className="info-label">Protects against:</span>
              <span className="info-value">
                All threats (Level {isBuilt ? shelter.level : 1} and below)
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Max Level:</span>
              <span className="info-value">{shelterConfig.maxLevel}</span>
            </div>
            {isBuilt && (
              <>
                <div className="info-row">
                  <span className="info-label">Current Level:</span>
                  <span className="info-value">{shelter.level}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Durability:</span>
                  <div className="durability-bar">
                    <div
                      className="durability-fill"
                      style={{
                        width: `${(shelter.durability / shelter.maxDurability) * 100}%`,
                      }}
                    />
                    <span className="durability-text">
                      {formatTime(shelter.durability)} / {formatTime(shelter.maxDurability)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isBuilt ? (
            <>
              <div className="cost-display">
                <span className="cost-label">Build Cost:</span>
                <div className="cost-items">
                  {Object.entries(shelterConfig.getCost(1)).map(([resource, amount]) => {
                    const currentAmount = getResourceAmount(resource);
                    const canAffordResource = currentAmount >= amount;

                    return (
                      <span
                        key={resource}
                        className={`cost-item ${canAffordResource ? "affordable" : "unaffordable"}`}
                      >
                        {getResourceIcon(resource)} {amount}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button className="craft-button" onClick={buildShelter} disabled={!canAfford}>
                Build Shelter
              </button>
            </>
          ) : (
            <>
              {!isMaxLevel && (
                <>
                  <div className="cost-display">
                    <span className="cost-label">Upgrade to Level {shelter.level + 1}:</span>
                    <div className="cost-items">
                      {Object.entries(shelterConfig.getCost(shelter.level + 1)).map(
                        ([resource, amount]) => {
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
                        }
                      )}
                    </div>
                  </div>
                  <button className="craft-button" onClick={upgradeShelter} disabled={!canUpgrade}>
                    Upgrade Shelter
                  </button>
                </>
              )}

              {needsRepair && (
                <>
                  <div className="cost-display">
                    <span className="cost-label">Repair cost:</span>
                    <div className="cost-items">
                      {Object.entries(shelterConfig.getRepairCost(shelter.level)).map(
                        ([resource, amount]) => {
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
                        }
                      )}
                    </div>
                  </div>
                  <button className="repair-button" onClick={repairShelter} disabled={!canRepair}>
                    {isBroken ? "Rebuild" : "Repair"}
                  </button>
                </>
              )}

              {!needsRepair && isMaxLevel && (
                <div className="shelter-status">✓ Max level, fully maintained</div>
              )}
              {!needsRepair && !isMaxLevel && (
                <div className="shelter-status">✓ Fully maintained</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityCrafting;
