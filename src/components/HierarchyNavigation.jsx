import { useState } from "react";
import PhysiologicalPanel from "./physiological/PhysiologicalPanel";
import SecurityPanel from "./security/SecurityPanel";
import "../styles/HierarchyNavigation.css";

const HierarchyNavigation = () => {
  const [activeTier, setActiveTier] = useState("physiological");

  // Define the tiers in pyramid order (bottom to top)
  const tiers = [
    {
      id: "physiological",
      name: "Physiological",
      description: "Basic survival needs",
      unlocked: true, // Always unlocked
      color: "#dc2626", // Red
    },
    {
      id: "security",
      name: "Security",
      description: "Safety and stability",
      unlocked: true, // You can add unlock conditions later
      color: "#ea580c", // Orange
    },
    {
      id: "belonging",
      name: "Belonging",
      description: "Love and connection",
      unlocked: false, // Example: unlock when security is progressed
      color: "#ca8a04", // Yellow
    },
    {
      id: "esteem",
      name: "Esteem",
      description: "Recognition and respect",
      unlocked: false,
      color: "#16a34a", // Green
    },
    {
      id: "self-actualization",
      name: "Self-Actualization",
      description: "Personal growth and fulfillment",
      unlocked: false,
      color: "#2563eb", // Blue
    },
  ];

  const handleTierClick = (tierId) => {
    const tier = tiers.find((t) => t.id === tierId);
    if (tier && tier.unlocked) {
      setActiveTier(tierId);
    }
  };

  const renderActivePanel = () => {
    switch (activeTier) {
      case "physiological":
        return <PhysiologicalPanel />;
      case "security":
        return <SecurityPanel />;
      default:
        return <PhysiologicalPanel />;
    }
  };

  return (
    <>
      {/* Pyramid Navigation - positioned as sidebar on desktop */}
      <div className="pyramid-nav">
        <div className="pyramid-wrapper">
          {/* Render tiers from top to bottom for visual pyramid */}
          {tiers.map((tier, index) => {
            const isActive = activeTier === tier.id;
            // Display order: self-actualization at top, physiological at bottom
            const displayOrder = tiers.length - index;

            return (
              <div
                key={tier.id}
                className={`pyramid-tier tier-${tier.id} ${
                  isActive ? "active" : ""
                } ${tier.unlocked ? "unlocked" : "locked"}`}
                style={{
                  backgroundColor: tier.unlocked ? tier.color : "#374151",
                  opacity: tier.unlocked ? (isActive ? 1 : 0.7) : 0.3,
                  cursor: tier.unlocked ? "pointer" : "not-allowed",
                  order: displayOrder,
                }}
                onClick={() => handleTierClick(tier.id)}
                title={
                  tier.unlocked
                    ? tier.description
                    : "Locked - progress further to unlock"
                }
              >
                <div className="tier-name">{tier.name}</div>
                {!tier.unlocked && <div className="lock-icon">🔒</div>}
              </div>
            );
          })}
        </div>

        {/* Current tier description */}
        <div className="current-tier-info">
          <h3>{tiers.find((t) => t.id === activeTier)?.name}</h3>
          <p>{tiers.find((t) => t.id === activeTier)?.description}</p>
        </div>
      </div>

      {/* Active Panel Content - centered on screen */}
      <div className="tier-panel-container">{renderActivePanel()}</div>
    </>
  );
};

export default HierarchyNavigation;
