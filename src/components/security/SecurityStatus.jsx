import { useThreatStore } from "../threatStore";

const SecurityStatus = () => {
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const shelter = useThreatStore((state) => state.shelter);
  const threatConfigs = useThreatStore((state) => state.threatConfigs);
  const shelterConfig = useThreatStore((state) => state.shelterConfig);
  const isThreatNullified = useThreatStore((state) => state.isThreatNullified);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const getResourceIcon = (resource) => {
    switch (resource) {
      case "water":
        return "💧";
      case "food":
        return "🍎";
      default:
        return "";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Security Status</h2>

      {/* Shelter Display */}
      <div
        style={{
          background: "#2a2a2a",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: shelter ? "2px solid #4a9eff" : "2px solid #666",
        }}
      >
        <h3>🏠 Shelter</h3>
        {shelter ? (
          <>
            <div style={{ marginBottom: "10px" }}>
              <strong>Level {shelter.level}</strong>
              <span style={{ marginLeft: "10px", color: "#888" }}>
                (Max Level: {shelterConfig.maxLevel})
              </span>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "14px", color: "#aaa", marginBottom: "5px" }}>
                Durability: {formatTime(shelter.durability)} / {formatTime(shelter.maxDurability)}
              </div>
              <div
                style={{
                  width: "100%",
                  height: "20px",
                  background: "#1a1a1a",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(shelter.durability / shelter.maxDurability) * 100}%`,
                    height: "100%",
                    background:
                      shelter.durability > shelter.maxDurability * 0.3 ? "#4a9eff" : "#ff4444",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
            {shelter.durability === 0 && (
              <div style={{ color: "#ff4444", marginTop: "10px" }}>
                ⚠️ Shelter is broken and provides no protection!
              </div>
            )}
          </>
        ) : (
          <p style={{ color: "#888" }}>No shelter built</p>
        )}
      </div>

      {/* Active Threats Display */}
      <div
        style={{
          background: "#2a2a2a",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h3>⚠️ Active Threats</h3>
        {Object.keys(activeThreats).length === 0 ? (
          <p style={{ color: "#888" }}>No active threats</p>
        ) : (
          <div>
            {Object.entries(activeThreats).map(([threatType, threat]) => {
              const config = threatConfigs[threatType];
              const isNullified = isThreatNullified(threatType);

              return (
                <div
                  key={threatType}
                  style={{
                    background: isNullified ? "#1a3a1a" : "#3a1a1a",
                    padding: "15px",
                    borderRadius: "6px",
                    marginBottom: "10px",
                    border: isNullified ? "1px solid #4a9e4a" : "1px solid #9e4a4a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 5px 0" }}>
                        {config.name} (Level {threat.level})
                      </h4>
                      <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#aaa" }}>
                        {config.description}
                      </p>
                      <div style={{ fontSize: "14px" }}>
                        {getResourceIcon(config.targetResource)}
                        <span style={{ marginLeft: "5px" }}>
                          -{config.drainPerSecond.toFixed(2)}/s to {config.targetResource}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {isNullified ? (
                        <div style={{ color: "#4a9e4a", fontWeight: "bold" }}>✓ NULLIFIED</div>
                      ) : (
                        <div style={{ color: "#9e4a4a", fontWeight: "bold" }}>✗ ACTIVE</div>
                      )}
                      {shelter && (
                        <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
                          Shelter Lv.{shelter.level} vs Threat Lv.{threat.level}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityStatus;
