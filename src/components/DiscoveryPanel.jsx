import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import UpgradeItem from "./UpgradeItem";
import "../styles/DiscoveryPanel.css";

const DiscoveryPanel = ({ introClass = "" }) => {
  const water = useGameStore((state) => state.water);
  const food = useGameStore((state) => state.food);
  const fibers = useGameStore((state) => state.fibers);
  const isAwarenessUnlocked = useGameStore((state) => state.isAwarenessUnlocked);
  const isAgencyUnlocked = useGameStore((state) => state.isAgencyUnlocked);
  const isUpgradePanelUnlocked = useGameStore((state) => state.isUpgradePanelUnlocked);
  const isNavigationUnlocked = useGameStore((state) => state.isNavigationUnlocked);
  const isForageUnlocked = useGameStore((state) => state.isForageUnlocked);
  const hasLowResources = water <= 1 || food <= 1 || fibers <= 1;
  const introUpgradeLevel = useUpgradeStore((state) => state.getUpgradeLevel("baseVolitionRate"));
  const isAtLeastLevelTwo = introUpgradeLevel >= 2;
  const isBelowLevelFive = introUpgradeLevel < 5;
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

        {!isNavigationUnlocked && (
          // TODO: Show for the first time when there's a threat active.
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

        {/* Show message when all discoveries are unlocked */}
        {isAwarenessUnlocked &&
          isAgencyUnlocked &&
          isForageUnlocked &&
          isNavigationUnlocked &&
          isUpgradePanelUnlocked && (
            <div className="all-discovered">
              <div className="discovery-complete-icon">🎉</div>
              <p>All basic abilities discovered!</p>
              <p className="discovery-hint">More discoveries coming soon...</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default DiscoveryPanel;
