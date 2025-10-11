import { useState } from "react";
import "../styles/SettingsMenu.css";

const SettingsMenu = ({ isOpen, onClose }) => {
  const [importError, setImportError] = useState("");

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the game? All progress will be lost."
      )
    ) {
      localStorage.removeItem("game-storage");
      localStorage.removeItem("upgrade-storage");
      window.location.reload();
    }
  };

  const handleExport = () => {
    try {
      const gameData = localStorage.getItem("game-storage");
      const upgradeData = localStorage.getItem("upgrade-storage");

      const saveData = {
        game: gameData ? JSON.parse(gameData) : null,
        upgrades: upgradeData ? JSON.parse(upgradeData) : null,
        exportedAt: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(saveData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `delta-game-save-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export save data");
    }
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target.result);

        if (!saveData.game && !saveData.upgrades) {
          throw new Error("Invalid save file format");
        }

        if (saveData.game) {
          localStorage.setItem("game-storage", JSON.stringify(saveData.game));
        }
        if (saveData.upgrades) {
          localStorage.setItem(
            "upgrade-storage",
            JSON.stringify(saveData.upgrades)
          );
        }

        window.location.reload();
      } catch (error) {
        console.error("Import failed:", error);
        setImportError(
          "Failed to import save file. Please check the file format."
        );
        setTimeout(() => setImportError(""), 3000);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Save Management</h3>
            <div className="settings-actions">
              <button
                onClick={handleExport}
                className="settings-action-btn export-btn"
              >
                💾 Export Save
              </button>

              <label className="settings-action-btn import-btn">
                📂 Import Save
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="file-input"
                />
              </label>

              {importError && <div className="import-error">{importError}</div>}

              <button
                onClick={handleReset}
                className="settings-action-btn reset-btn"
              >
                🔄 Reset Game
              </button>
            </div>
          </div>

          <div className="settings-footer">
            <button onClick={onClose} className="close-settings-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
