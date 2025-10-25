import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import "../styles/UpgradeItem.css";

const UpgradeItem = ({ upgradeId, title, description }) => {
  const upgrade = useUpgradeStore((state) => state.upgrades[upgradeId]);
  const cost = useUpgradeStore((state) => state.getUpgradeCost(upgradeId));
  const effect = useUpgradeStore((state) =>
    state.getUpgradeEffectAtLevel(upgradeId, state.upgrades[upgradeId].level)
  );
  const purchaseUpgrade = useUpgradeStore((state) => state.purchaseUpgrade);

  // Subscribe to volition and calculate affordability
  const canAfford = useGameStore((state) => state.volition >= cost);

  const handlePurchase = () => {
    if (canAfford) {
      purchaseUpgrade(upgradeId);
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
          <strong>+{/* TODO: Display sensible information about the next level. */}</strong>
        </p>
        <p>Level: {upgrade.level}</p>
      </div>
    </div>
  );
};

export default UpgradeItem;
