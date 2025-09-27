import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import UpgradeItem from "./UpgradeItem";
import "../styles/DiscoveryPanel.css";

const DiscoveryPanel = () => {
  const { volition, spendVolition } = useGameStore();
  const { purchaseUpgrade, getUpgradeLevel } = useUpgradeStore();

  const handlePurchase = (upgradeId) => {
    return purchaseUpgrade(upgradeId, spendVolition);
  };

  // Check if the button upgrades have been purchased
  const drinkButtonLevel = getUpgradeLevel("drinkButton");
  const isDrinkUnlocked = drinkButtonLevel > 0;

  const eatButtonLevel = getUpgradeLevel("eatButton");
  const isEatUnlocked = eatButtonLevel > 0;

  const restButtonLevel = getUpgradeLevel("restButton");
  const isRestUnlocked = restButtonLevel > 0;

  return (
    <div className="discovery-panel">
      <h2 className="discovery-title">Discovery</h2>
      <p className="discovery-subtitle">Unlock new abilities and features</p>

      <div className="discovery-grid">
        {/* Only show the unlock upgrades if they haven't been purchased yet */}
        {!isDrinkUnlocked && (
          <UpgradeItem
            upgradeId="drinkButton"
            title="Hydration Awareness"
            description="Unlock the ability to actively manage your thirst"
            currentVolition={volition}
            onPurchase={handlePurchase}
          />
        )}

        {!isEatUnlocked && (
          <UpgradeItem
            upgradeId="eatButton"
            title="Nutritional Awareness"
            description="Unlock the ability to actively manage your hunger"
            currentVolition={volition}
            onPurchase={handlePurchase}
          />
        )}

        {!isRestUnlocked && (
          <UpgradeItem
            upgradeId="restButton"
            title="Restfulness Awareness"
            description="Unlock the ability to actively manage your fatigue"
            currentVolition={volition}
            onPurchase={handlePurchase}
          />
        )}

        {/* Show message when all discoveries are unlocked */}
        {isDrinkUnlocked && isEatUnlocked && isRestUnlocked && (
          <div className="all-discovered">
            <div className="discovery-complete-icon">🎉</div>
            <p>All basic abilities discovered!</p>
            <p className="discovery-hint">More discoveries coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryPanel;
