import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import { useThreatStore } from "./threatStore";
import UpgradeItem from "./UpgradeItem";
import "../styles/DiscoveryPanel.css";

const DiscoveryPanel = ({ introClass = "", activeTier }) => {
  const water = useGameStore((state) => state.water);
  const food = useGameStore((state) => state.food);
  const fibers = useGameStore((state) => state.fibers);
  const isAwarenessUnlocked = useGameStore((state) => state.isAwarenessUnlocked);
  const isAgencyUnlocked = useGameStore((state) => state.isAgencyUnlocked);
  const isUpgradePanelUnlocked = useGameStore((state) => state.isUpgradePanelUnlocked);
  const isNavigationUnlocked = useGameStore((state) => state.isNavigationUnlocked);
  const isForageUnlocked = useGameStore((state) => state.isForageUnlocked);
  const isCraftingUnlocked = useGameStore((state) => state.isCraftingUnlocked);
  const introUpgradeLevel = useUpgradeStore((state) => state.getUpgradeLevel("baseVolitionRate"));
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const hasLowResources = water <= 1 || food <= 1 || fibers <= 1;
  const isAtLeastLevelTwo = introUpgradeLevel >= 2;
  const isBelowLevelFive = introUpgradeLevel < 5;
  const isThreatActive = Object.keys(activeThreats).length > 0;

  return (
    <div className={`discovery-panel ${introClass}`}>
      <h2 className="discovery-title">Discovery</h2>

      <div className="discovery-grid">
        {isBelowLevelFive && (
          <UpgradeItem
            upgradeId="baseVolitionRate"
            title="Motivation"
            description="Increase your base&nbsp;👑Volition generation rate."
          />
        )}

        {!isAwarenessUnlocked && isAtLeastLevelTwo && (
          <UpgradeItem
            upgradeId="basicNeeds"
            title="Awareness"
            description="Notice your basic physiological needs."
          />
        )}

        {!isUpgradePanelUnlocked && isAwarenessUnlocked && (
          <UpgradeItem
            upgradeId="upgradePanel"
            title="Mental Improvement"
            description="Enhance your mental qualities."
          />
        )}

        {!isAgencyUnlocked && isAwarenessUnlocked && (
          <UpgradeItem
            upgradeId="basicActions"
            title="Agency"
            description="Form a plan to satisfy your needs."
          />
        )}

        {!isNavigationUnlocked && isThreatActive && (
          <UpgradeItem
            upgradeId="pyramidNav"
            title="Hierarchy Navigation"
            description="Rise to meet new challenges."
          />
        )}

        {!isForageUnlocked && hasLowResources && (
          <UpgradeItem
            upgradeId="foraging"
            title="Foraging"
            description="Explore your environment to find materials."
          />
        )}

        {!isCraftingUnlocked && activeTier === "security" && (
          <UpgradeItem
            upgradeId="crafting"
            title="Crafting"
            description="Alter your environment to suit your needs."
          />
        )}

        {/* Show message when all discoveries are unlocked */}
        {isAwarenessUnlocked &&
          isAgencyUnlocked &&
          isForageUnlocked &&
          isNavigationUnlocked &&
          isUpgradePanelUnlocked &&
          isCraftingUnlocked && (
            <div className="all-discovered">
              <div className="discovery-complete-icon">🎉</div>
              <p>All basic abilities discovered!</p>
              <p className="discovery-hint">More development time needed...</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default DiscoveryPanel;
