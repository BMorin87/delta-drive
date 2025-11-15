import { useState, useEffect } from "react";
import { useGameStore } from "./gameStore";
import ResourcePanel from "./physiological/ResourcePanel";
import DiscoveryPanel from "./DiscoveryPanel";
import PhysiologicalPanel from "./physiological/PhysiologicalPanel";
import SecurityPanel from "./security/SecurityPanel";
import "../styles/HierarchyNavigation.css";

const HierarchyNavigation = () => {
  const isAwarenessUnlocked = useGameStore((state) => state.isAwarenessUnlocked);
  const isAgencyUnlocked = useGameStore((state) => state.isAgencyUnlocked);
  const isNavigationUnlocked = useGameStore((state) => state.isNavigationUnlocked);
  const isFirstLoad = useGameStore((state) => state.isFirstLoad);
  const markFirstLoadComplete = useGameStore((state) => state.markFirstLoadComplete);
  const [activeTier, setActiveTier] = useState("physiological");

  // Define the tiers in pyramid order (bottom to top).
  const tiers = [
    {
      id: "physiological",
      name: "Physiological",
      description: "Basic survival needs",
      unlocked: true, // Always unlocked
      color: "#dc2626",
    },
    {
      id: "security",
      name: "Security",
      description: "Safety and stability",
      unlocked: true,
      color: "#ea580c",
    },
    {
      id: "belonging",
      name: "Belonging",
      description: "Love and connection",
      unlocked: false,
      color: "#ca8a04",
    },
    {
      id: "esteem",
      name: "Esteem",
      description: "Recognition and respect",
      unlocked: false,
      color: "#16a34a",
    },
    {
      id: "self-actualization",
      name: "Self-Actualization",
      description: "Personal growth and fulfillment",
      unlocked: false,
      color: "#2563eb",
    },
  ];

  const handleTierClick = (tierId) => {
    const tier = tiers.find((t) => t.id === tierId);
    if (tier && tier.unlocked) {
      setActiveTier(tierId);
    }
  };

  // Wait a couple seconds on first load, then mark the load complete. Used for initial animations.
  useEffect(() => {
    if (isFirstLoad) {
      const timer = setTimeout(() => {
        markFirstLoadComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad, markFirstLoadComplete]);

  const renderActiveContent = () => {
    switch (activeTier) {
      case "physiological":
        return <PhysiologicalPanel />;
      case "security":
        return <SecurityPanel />;
      default:
        return <PhysiologicalPanel />;
    }
  };

  // Animate the DiscoveryPanel's first load.
  const introClass = isFirstLoad ? "first-load" : "";

  return (
    <>
      {isNavigationUnlocked ? (
        <div className="pyramid-nav is-unlocked">
          <div className="pyramid-wrapper">
            {/* Render tiers from top to bottom for visual pyramid */}
            {tiers.map((tier, index) => {
              const isActive = activeTier === tier.id;
              const displayOrder = tiers.length - index;

              return (
                <div
                  key={tier.id}
                  className={`pyramid-tier tier-${tier.id} ${isActive ? "active" : ""} ${
                    tier.unlocked ? "unlocked" : "locked"
                  }`}
                  style={{ order: displayOrder }}
                  onClick={() => handleTierClick(tier.id)}
                  title={tier.unlocked ? tier.description : "Locked - progress further to unlock"}
                >
                  <div className="tier-name">{tier.name}</div>
                  {!tier.unlocked && <div className="lock-icon">🔒</div>}
                </div>
              );
            })}
          </div>

          <div className="current-tier-info">
            <p>{tiers.find((t) => t.id === activeTier)?.description}</p>
          </div>
        </div>
      ) : (
        <div className="pyramid-nav" />
      )}

      <DiscoveryPanel introClass={introClass} activeTier={activeTier} />

      {isAwarenessUnlocked ? (
        // Render the current content or a blank placeholder.
        <div className={`tier-content-container is-unlocked`}>{renderActiveContent()}</div>
      ) : (
        <div className={`tier-content-container`} />
      )}

      {isAgencyUnlocked && <ResourcePanel />}
    </>
  );
};

export default HierarchyNavigation;
