import { useGameStore } from "../gameStore";
import UpgradeItem from "../UpgradeItem";
import "../../styles/physiological/PhysiologicalUpgrades.css";

const PhysiologicalUpgradesPanel = () => {
  const { volition } = useGameStore();

  return (
    <div className="physiological-upgrades-panel">
      <p className="upgrades-subtitle">Enhance your basic capabilities</p>

      <div className="upgrades-grid">
        <UpgradeItem
          upgradeId="volitionRate"
          title="Determination"
          description="Increases volition generation rate"
          currentVolition={volition}
        />

        <UpgradeItem
          upgradeId="volitionCapacity"
          title="Resilience"
          description="Increases volition capacity"
          currentVolition={volition}
        />

        <UpgradeItem
          upgradeId="thirstReward"
          title="Hydration Reward"
          description="Increases volition gained from drinking"
          currentVolition={volition}
        />

        <UpgradeItem
          upgradeId="hungerReward"
          title="Nourishment Reward"
          description="Increases volition gained from eating"
          currentVolition={volition}
        />

        <UpgradeItem
          upgradeId="fatigueReward"
          title="Restoration Reward"
          description="Increases volition gained from resting"
          currentVolition={volition}
        />
      </div>
    </div>
  );
};

export default PhysiologicalUpgradesPanel;
