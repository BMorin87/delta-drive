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
            title="Determination"
            description="Increases 👑 Volition generation rate ever further."
          />
        )}

        <UpgradeItem
          upgradeId="volitionCapacity"
          title="Resilience"
          description="Increases 👑 Volition capacity."
        />

        {isAgencyUnlocked && (
          <UpgradeItem
            upgradeId="hedonicReward"
            title="Hedonism"
            description="Increases 👑 Volition rewarded from satisfying physiological drives."
          />
        )}
      </div>
    </div>
  );
};

export default PhysiologicalUpgradesPanel;
