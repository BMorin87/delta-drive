import { useUpgradeStore } from "../upgradeStore";
import "../../styles/UpgradeItem.css";

const UpgradeItem = ({ upgradeId, title, description, onPurchase }) => {
  const {
    upgrades,
    getUpgradeCost,
    canAffordUpgrade,
    getUpgradeEffectAtLevel,
  } = useUpgradeStore();

  const upgrade = upgrades[upgradeId];
  const cost = getUpgradeCost(upgradeId);
  const canAfford = canAffordUpgrade(upgradeId);
  const effect = getUpgradeEffectAtLevel(upgradeId, upgrade.level);

  // TODO: Create lookup for upgrade costs and effects based on upgradeId.

  const handlePurchase = () => {
    if (canAfford) {
      onPurchase(upgradeId);
    }
  };

  return (
    <div className="upgrade-wrapper">
      <button
        className={`upgrade-item ${canAfford ? "affordable" : "expensive"}`}
        onClick={handlePurchase}
        disabled={!canAfford}
      >
        {/* Placeholder icon box */}
        <div className="upgrade-icon">🎯</div>

        <div className="upgrade-main">
          <div className="upgrade-title">{title}</div>
          <div className="upgrade-cost">{cost} Volition</div>
        </div>

        {/* Tooltip container */}
        <div className="upgrade-tooltip">
          <p className="tooltip-description">{description}</p>
          <p>
            Current Effect: <strong>+{effect}</strong>
          </p>
          <p>
            Next Level:{" "}
            <strong>
              +
              {getUpgradeEffectAtLevel(upgradeId, upgrade.level) +
                (upgradeId === "volitionRate"
                  ? 2
                  : upgradeId === "volitionCapacity"
                  ? 25
                  : upgradeId === "fatigueRate"
                  ? 0.5
                  : 1)}
            </strong>
          </p>
          <p>Level: {upgrade.level}</p>
        </div>
      </button>
    </div>
  );
};

export default UpgradeItem;
