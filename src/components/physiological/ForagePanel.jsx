import { useStatusStore } from "../statusStore";
import "../../styles/ForagePanel.css";

const ForagePanel = ({ isOpen, onClose }) => {
  const { calculateVolitionCost, startStatus } = useStatusStore();

  if (!isOpen) return null;

  const forageCost = calculateVolitionCost("forage");

  const handleStartForage = () => {
    if (startStatus("forage")) {
      onClose(); // Close the modal after successfully starting foraging
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="forage-panel" onClick={(e) => e.stopPropagation()}>
        <div className="forage-header">
          <h2>🌲 Forage for Resources</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="forage-content">
          <div className="forage-description">
            <p>Venture into the wilderness to search for valuable resources.</p>
            <p>You might find food, water, or crafting materials!</p>
          </div>

          <div className="forage-cost">
            <span className="cost-label">Volition Cost: </span>
            <span className="cost-value">{forageCost} 💪</span>
          </div>

          <div className="forage-placeholder">
            <div className="memory-game-placeholder">
              <p>🎴 Memory Card Game Coming Soon!</p>
              <p>Match pairs to find resources</p>
            </div>
          </div>

          <div className="forage-actions">
            <button className="start-forage-btn" onClick={handleStartForage}>
              Start Foraging
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForagePanel;
