import { useGameStore } from "../gameStore";
import { useUpgradeStore } from "../upgradeStore";
import UpgradeItem from "../UpgradeItem";
import "../../styles/physiological/PhysiologicalUpgrades.css";

const PhysiologicalUpgradesPanel = () => {
  const isAgencyUnlocked = useGameStore((state) => state.isAgencyUnlocked);
  const introLevel = useUpgradeStore((state) => state.getUpgradeLevel("baseVolitionRate"));
  const isBelowLevelFive = introLevel < 5;

  return (
    <div className="physiological-upgrades-panel">
      <div className="upgrades-grid">
        {!isBelowLevelFive && (
          <UpgradeItem
            upgradeId="volitionRate"
            title="True Grit"
            description="Increases 👑 volition generation rate ever further."
          />
        )}

        <UpgradeItem
          upgradeId="volitionCapacity"
          title="Reserves"
          description="Increases 👑 volition capacity"
        />

        {isAgencyUnlocked && (
          <UpgradeItem
            upgradeId="hedonicReward"
            title="Hedonism"
            description="Increases 👑 volition rewarded from satisfying drives."
          />
        )}
      </div>
    </div>
  );
};

export default PhysiologicalUpgradesPanel;
