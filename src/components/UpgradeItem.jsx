import { useUpgradeStore } from "./upgradeStore";
import "../styles/UpgradeItem.css";

const UpgradeItem = ({ upgradeId, title, description, onPurchase }) => {
  const {
    upgrades,
    getUpgradeCost,
    canAffordUpgrade,
    getUpgradeEffectAtLevel,
  } = useUpgradeStore();

  const upgrade = upgrades[upgradeId];
  console.log(upgrades);
  const cost = getUpgradeCost(upgradeId);
  const canAfford = canAffordUpgrade(upgradeId);
  const effect = getUpgradeEffectAtLevel(upgradeId, upgrade.level);

  // TODO: Create dictionary for upgrade costs and effects based on upgradeId.

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
          <div className="upgrade-cost">{cost} 👑</div>
        </div>
      </button>

      {/* The tooltip is a sibling of the button so it doesn't inherit a greyed-out button's opacity. */}
      <div className="upgrade-tooltip">
        <p className="tooltip-description">{description}</p>
        <p>
          Current Effect: <strong>+{effect}</strong>
        </p>
        <p>
          Next Level:{" "}
          <strong>
            +
            {/* TODO: Use a lookup table to get upgrade effects. This is not extensible. */}
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
    </div>
  );
};

export default UpgradeItem;
