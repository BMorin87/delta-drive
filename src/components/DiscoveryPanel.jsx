import { useGameStore } from "./gameStore";
import { useUpgradeStore } from "./upgradeStore";
import UpgradeItem from "./UpgradeItem";
import "../styles/DiscoveryPanel.css";

const DiscoveryPanel = ({ introClass = "" }) => {
  const {
    isAwarenessUnlocked,
    isAgencyUnlocked,
    isUpgradePanelUnlocked,
    isNavigationUnlocked,
    isForageUnlocked,
  } = useGameStore();
  const { getUpgradeLevel } = useUpgradeStore();

  const introLevel = getUpgradeLevel("baseVolitionRate");
  const isAtLeastLevelTwo = introLevel >= 2;
  const isBelowLevelFive = introLevel < 5;

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
          // TODO: Show for the first time when
          <UpgradeItem
            upgradeId="foraging"
            title="Foraging"
            description="Explore your environment to find resources."
          />
        )}

        {/* Show message when all discoveries are unlocked */}
        {isAwarenessUnlocked &&
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
