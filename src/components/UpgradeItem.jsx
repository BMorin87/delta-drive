import { useMemo } from "react";
import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import "../styles/UpgradeItem.css";

// Resource icons for display
const RESOURCE_ICONS = {
  volition: "👑",
  water: "💧",
  food: "🍎",
  fibers: "🌿",
};

const UpgradeItem = ({ upgradeId, title, description }) => {
  // Subscribe to upgrade level (triggers re-render when purchased)
  const upgradeLevel = useUpgradeStore((state) => state.upgrades[upgradeId]?.level ?? 0);
  const cost = useUpgradeStore((state) => {
    return state._costCache[upgradeId] || state.getUpgradeCost(upgradeId);
  });
  const purchaseUpgrade = useUpgradeStore((state) => state.purchaseUpgrade);
  // Calculate current and next level effects for tooltips.
  const effect = useUpgradeStore((state) => state.getUpgradeEffectAtLevel(upgradeId, upgradeLevel));
  const nextEffect = useUpgradeStore((state) =>
    state.getUpgradeEffectAtLevel(upgradeId, upgradeLevel + 1)
  );

  const volition = useGameStore((state) => state.volition);
  const water = useGameStore((state) => state.water);
  const food = useGameStore((state) => state.food);
  const fibers = useGameStore((state) => state.fibers);

  // Check affordability
  const canAfford = useMemo(() => {
    const resources = { volition, water, food, fibers };

    for (const [resource, amount] of Object.entries(cost)) {
      if ((resources[resource] ?? 0) < amount) {
        return false;
      }
    }
    return true;
  }, [cost, volition, water, food, fibers]);

  const handlePurchase = () => {
    if (canAfford) {
      purchaseUpgrade(upgradeId);
    }
  };

  // Format cost for display
  const costDisplay = useMemo(() => {
    const parts = [];
    for (const [resource, amount] of Object.entries(cost)) {
      const icon = RESOURCE_ICONS[resource] || "❓";
      parts.push(`${amount} ${icon}`);
    }
    return parts.length > 0 ? parts.join(", ") : "Free";
  }, [cost]);

  return (
    <div className="upgrade-wrapper">
      <button
        className={`upgrade-item ${canAfford ? "affordable" : "expensive"}`}
        onClick={handlePurchase}
        disabled={!canAfford}
      >
        <div className="upgrade-icon">🎯</div>

        <div className="upgrade-main">
          <div className="upgrade-title">{title}</div>
          <div className="upgrade-cost">{costDisplay}</div>
        </div>
      </button>

      <div className="upgrade-tooltip">
        <p className="tooltip-description">{description}</p>
        <p>
          Current Effect: <strong>+{effect}</strong>
        </p>
        <p>
          Next Level: <strong>+{nextEffect}</strong>
        </p>
        <p>Level: {upgradeLevel}</p>
      </div>
    </div>
  );
};

export default UpgradeItem;
