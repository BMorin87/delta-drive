import UpgradeItem from "../UpgradeItem";
import "../../styles/physiological/PhysiologicalUpgrades.css";

const PhysiologicalUpgradesPanel = () => {
  return (
    <div className="physiological-upgrades-panel">
      <p className="upgrades-subtitle">Enhance your basic capabilities</p>

      <div className="upgrades-grid">
        <UpgradeItem
          upgradeId="volitionRate"
          title="Determination"
          description="Increases volition generation rate"
        />

        <UpgradeItem
          upgradeId="volitionCapacity"
          title="Resilience"
          description="Increases volition capacity"
        />

        <UpgradeItem
          upgradeId="thirstReward"
          title="Hydration Reward"
          description="Increases volition gained from drinking"
        />

        <UpgradeItem
          upgradeId="hungerReward"
          title="Nourishment Reward"
          description="Increases volition gained from eating"
        />

        <UpgradeItem
          upgradeId="fatigueReward"
          title="Restoration Reward"
          description="Increases volition gained from resting"
        />
      </div>
    </div>
  );
};

export default PhysiologicalUpgradesPanel;
