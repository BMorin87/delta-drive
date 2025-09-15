import { useUpgradeStore } from "../upgradeStore";
import UpgradeItem from "./UpgradeItem";

const UpgradesPanel = ({ currentVolition, onSpendVolition }) => {
  const { purchaseUpgrade, getUpgradeLevel } = useUpgradeStore();

  const handlePurchase = (upgradeId) => {
    return purchaseUpgrade(upgradeId, onSpendVolition);
  };

  // Check if the drink button upgrade has been purchased
  const drinkButtonLevel = getUpgradeLevel("drinkButton");
  const isDrinkUnlocked = drinkButtonLevel > 0;

  const eatButtonLevel = getUpgradeLevel("eatButton");
  const isEatUnlocked = eatButtonLevel > 0;

  const restButtonLevel = getUpgradeLevel("restButton");
  const isRestUnlocked = restButtonLevel > 0;

  return (
    <div className="upgrades-panel">
      <h2 className="upgrades-title">Upgrades</h2>

      <div className="upgrades-grid">
        <UpgradeItem
          upgradeId="volitionRate"
          title="Mental Focus"
          description="Increases volition generation rate"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        <UpgradeItem
          upgradeId="volitionCapacity"
          title="Willpower Reservoir"
          description="Increases maximum volition capacity"
          currentVolition={currentVolition}
          onPurchase={handlePurchase}
        />

        {/* Only show the unlock upgrade if it hasn't been purchased yet. */}
        {!isDrinkUnlocked && (
          <UpgradeItem
            upgradeId="drinkButton"
            title="Hydration Awareness"
            description="Unlock the ability to actively manage your thirst"
            currentVolition={currentVolition}
            onPurchase={handlePurchase}
          />
        )}

        {!isEatUnlocked && (
          <UpgradeItem
            upgradeId="eatButton"
            title="Nutritional Awareness"
            description="Unlock the ability to actively manage your hunger"
            currentVolition={currentVolition}
            onPurchase={handlePurchase}
          />
        )}

        {!isRestUnlocked && (
          <UpgradeItem
            upgradeId="restButton"
            title="Restfulness Awareness"
            description="Unlock the ability to actively manage your fatigue"
            currentVolition={currentVolition}
            onPurchase={handlePurchase}
          />
        )}
      </div>
    </div>
  );
};

export default UpgradesPanel;
