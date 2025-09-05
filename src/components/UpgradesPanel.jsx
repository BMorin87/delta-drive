import { useUpgradeStore } from "./DeltaGame";
import UpgradeItem from "./UpgradeItem";

const UpgradesPanel = ({ currentVolition, onSpendVolition }) => {
  const { purchaseUpgrade } = useUpgradeStore();

  const handlePurchase = (upgradeId) => {
    return purchaseUpgrade(upgradeId, onSpendVolition);
  };

  return (
    <div className="upgrades-panel">
      <h2 className="upgrades-title">Upgrades</h2>

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
      </div>

      <div className="upgrades-info">
        <p>
          Spend volition to improve your physiological awareness and capacity.
        </p>
        <div className="current-volition">
          Available Volition:{" "}
          <span className="volition-amount">{Math.floor(currentVolition)}</span>
        </div>
      </div>
    </div>
  );
};

export default UpgradesPanel;
