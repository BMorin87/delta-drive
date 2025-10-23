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
          description="Increases base volition generation rate"
        />

        <UpgradeItem
          upgradeId="volitionCapacity"
          title="Reservoir"
          description="Increases volition capacity"
        />

        <UpgradeItem
          upgradeId="hedonicReward"
          title="Hedonic Reward"
          description="Increases volition rewarded from satisfying drives"
        />
      </div>
    </div>
  );
};

export default PhysiologicalUpgradesPanel;
