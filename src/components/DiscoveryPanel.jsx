import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import UpgradeItem from "./UpgradeItem";
import "../styles/DiscoveryPanel.css";

const DiscoveryPanel = () => {
  const {
    spendVolition,
    isAwarenessUnlocked,
    isUpgradingPanelUnlocked,
    isNavigationUnlocked,
    isForageUnlocked,
  } = useGameStore();
  const { purchaseUpgrade } = useUpgradeStore();

  const handlePurchase = (upgradeId) => {
    return purchaseUpgrade(upgradeId, spendVolition);
  };

  return (
    <div className="discovery-panel">
      <h2 className="discovery-title">Discovery</h2>
      <p className="discovery-subtitle">Unlock new abilities and features</p>

      <div className="discovery-grid">
        {!isAwarenessUnlocked && (
          <UpgradeItem
            upgradeId="basicNeeds"
            title="Awareness"
            description="Satisfy your basic physiological needs."
            onPurchase={handlePurchase}
          />
        )}

        {!isUpgradingPanelUnlocked && (
          <UpgradeItem
            upgradeId="upgradePanel"
            title="Upgrade Panel"
            description="Enhance your mental qualities."
            onPurchase={handlePurchase}
          />
        )}

        {!isNavigationUnlocked && (
          <UpgradeItem
            upgradeId="pyramidNav"
            title="Hierarchy Navigation"
            description="Operate on multiple levels."
            onPurchase={handlePurchase}
          />
        )}

        {!isForageUnlocked && (
          <UpgradeItem
            upgradeId="foraging"
            title="Foraging"
            description="Explore your environment to find resources."
            onPurchase={handlePurchase}
          />
        )}

        {/* Show message when all discoveries are unlocked */}
        {isAwarenessUnlocked && (
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
