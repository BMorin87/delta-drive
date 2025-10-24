import { useGameStore } from "../gameStore";
import { useUpgradeStore } from "../upgradeStore";
import UpgradeItem from "../UpgradeItem";
import "../../styles/physiological/PhysiologicalUpgrades.css";

const PhysiologicalUpgradesPanel = () => {
  // TODO: Only show the Hedonic Reward upgrade when forage resources are low.
  const { getUpgradeLevel } = useUpgradeStore();
  const isAgencyUnlocked = useGameStore((state) => state.isAgencyUnlocked);

  const introLevel = getUpgradeLevel("baseVolitionRate");
  const isBelowLevelFive = introLevel < 5;

  return (
    <div className="physiological-upgrades-panel">
      <p className="upgrades-subtitle">Enhance your basic capabilities</p>

      <div className="upgrades-grid">
        {!isBelowLevelFive && (
          <UpgradeItem
            upgradeId="volitionRate"
            title="Determination"
            description="Increases base volition generation rate"
          />
        )}

        <UpgradeItem
          upgradeId="volitionCapacity"
          title="Reservoir"
          description="Increases volition capacity"
        />

        {isAgencyUnlocked && (
          <UpgradeItem
            upgradeId="hedonicReward"
            title="Hedonic Reward"
            description="Increases volition rewarded from satisfying drives"
          />
        )}
      </div>
    </div>
  );
};

export default PhysiologicalUpgradesPanel;
