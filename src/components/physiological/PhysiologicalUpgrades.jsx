import { useUpgradeStore } from "../upgradeStore";
import UpgradeItem from "../UpgradeItem";
import "../../styles/physiological/PhysiologicalUpgrades.css";

const PhysiologicalUpgradesPanel = ({ currentVolition, onSpendVolition }) => {
  const { purchaseUpgrade } = useUpgradeStore();

  const handlePurchase = (upgradeId) => {
    return purchaseUpgrade(upgradeId, onSpendVolition);
  };

  return (
    <div className="physiological-upgrades-panel">
      <h2 className="upgrades-title">Physiological Upgrades</h2>
      <p className="upgrades-subtitle">Enhance your basic capabilities</p>

      <div className="upgrades-grid">
        <UpgradeItem
          upgradeId="volitionRate"
          title="Mental Focus"
          description="Increases volition generation rate"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        <UpgradeItem
          upgradeId="volitionCapacity"
          title="Willpower Reservoir"
          description="Increases maximum volition capacity"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        <UpgradeItem
          upgradeId="thirstReward"
          title="Hydration Reward"
          description="Increases volition gained from drinking"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        <UpgradeItem
          upgradeId="hungerReward"
          title="Nourishment Reward"
          description="Increases volition gained from eating"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        <UpgradeItem
          upgradeId="fatigueReward"
          title="Restoration Reward"
          description="Increases volition gained from resting"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  );
};

export default PhysiologicalUpgradesPanel;
