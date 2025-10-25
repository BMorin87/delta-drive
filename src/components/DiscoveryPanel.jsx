import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import UpgradeItem from "./UpgradeItem";
import "../styles/DiscoveryPanel.css";

const DiscoveryPanel = ({ introClass = "" }) => {
  const isAwarenessUnlocked = useGameStore((state) => state.isAwarenessUnlocked);
  const isAgencyUnlocked = useGameStore((state) => state.isAgencyUnlocked);
  const isUpgradePanelUnlocked = useGameStore((state) => state.isUpgradePanelUnlocked);
  const isNavigationUnlocked = useGameStore((state) => state.isNavigationUnlocked);
  const isForageUnlocked = useGameStore((state) => state.isForageUnlocked);
  // Subscribe to the intro upgrade's level.
  const introUpgradeLevel = useUpgradeStore((state) => state.getUpgradeLevel("baseVolitionRate"));
  const isAtLeastLevelTwo = introUpgradeLevel >= 2;
  const isBelowLevelFive = introUpgradeLevel < 5;

  return (
    <div className={`discovery-panel ${introClass}`}>
      <h2 className="discovery-title">Upgrades</h2>

      <div className="discovery-grid">
        {isBelowLevelFive && (
          <UpgradeItem
            upgradeId="baseVolitionRate"
            title="Determination"
            description="Grit your teeth and try harder."
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
            description="Form a plan to satisfy your needs"
          />
        )}

        {!isNavigationUnlocked && (
          // TODO: Show for the first time when there's a threat active.
          <UpgradeItem
            upgradeId="pyramidNav"
            title="Hierarchy Navigation"
            description="Operate on multiple levels."
          />
        )}

        {!isForageUnlocked && (
          // TODO: Show for the first time when materials run low.
          <UpgradeItem
            upgradeId="foraging"
            title="Foraging"
            description="Explore your environment to find resources."
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
