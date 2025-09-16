import { useUpgradeStore } from "../upgradeStore";
import UpgradeItem from "../UpgradeItem";

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
        {/* Volition Upgrades */}
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

        {/* Thirst Upgrades */}
        <UpgradeItem
          upgradeId="thirstCapacity"
          title="Hydration Efficiency"
          description="Increases maximum thirst capacity"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        <UpgradeItem
          upgradeId="thirstRate"
          title="Thirst Resistance"
          description="Reduces how quickly you become thirsty"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        {/* Hunger Upgrades */}
        <UpgradeItem
          upgradeId="hungerCapacity"
          title="Metabolic Enhancement"
          description="Increases maximum hunger capacity"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        <UpgradeItem
          upgradeId="hungerRate"
          title="Hunger Resistance"
          description="Reduces how quickly you become hungry"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        {/* Fatigue Upgrades */}
        <UpgradeItem
          upgradeId="fatigueCapacity"
          title="Endurance Training"
          description="Increases maximum fatigue capacity"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        <UpgradeItem
          upgradeId="fatigueRate"
          title="Fatigue Resistance"
          description="Reduces how quickly you become fatigued"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  );
};

export default PhysiologicalUpgradesPanel;
