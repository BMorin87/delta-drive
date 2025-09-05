import { useUpgradeStore } from "./DeltaGame";

const UpgradeItem = ({
  upgradeId,
  title,
  description,
  currentVolition,
  onPurchase,
}) => {
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

  const handlePurchase = () => {
    if (canAfford) {
      const success = onPurchase(upgradeId);
    }
  };
  return (
    <div className={`upgrade-item ${canAfford ? "affordable" : "expensive"}`}>
      <div className="upgrade-header">
        <h3 className="upgrade-title">{title}</h3>
        <div className="upgrade-level">Level {upgrade.level}</div>
      </div>

      <div className="upgrade-description">{description}</div>

      <div className="upgrade-stats">
        <div className="upgrade-effect">
          Current Effect: <span className="effect-value">+{effect}</span>
        </div>
        <div className="upgrade-next">
          Next Level:{" "}
          <span className="next-effect">
            +
            {getUpgradeEffectAtLevel(upgradeId, upgrade.level) +
              (upgradeId === "volitionRate"
                ? 2
                : upgradeId === "volitionCapacity"
                ? 25
                : upgradeId === "fatigueRate"
                ? 0.5
                : 1)}
          </span>
        </div>
      </div>

      <button
        className={`upgrade-button ${
          canAfford ? "can-afford" : "cannot-afford"
        }`}
        onClick={handlePurchase}
        disabled={!canAfford}
      >
        <span className="upgrade-cost">{cost} Volition</span>
      </button>
    </div>
  );
};

export default UpgradeItem;
