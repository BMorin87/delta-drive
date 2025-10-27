import { useStatusStore } from "../statusStore";
import "../../styles/physiological/ForageButton.css";

const ForageButton = ({ onOpenForage }) => {
  // This subscribes to all statuses and cooldowns instead of just Forage.
  const activeStatuses = useStatusStore((state) => state.activeStatuses ?? {});
  const cooldowns = useStatusStore((state) => state.cooldowns ?? {});
  const calculateVolitionCost = useStatusStore((state) => state.calculateVolitionCost);

  const isStatusActive = (type) => !!activeStatuses[type];
  const getStatusDuration = (type) => activeStatuses[type]?.duration ?? 0;
  const getCooldownRemaining = (type) => cooldowns[type] ?? 0;

  const getButtonState = () => {
    const isActive = isStatusActive("forage");
    const cooldownRemaining = getCooldownRemaining("forage");
    const duration = getStatusDuration("forage");

    if (isActive) {
      return {
        text: `Foraging... ${Math.ceil(duration)}s`,
        disabled: false,
        className: "forage-button active",
      };
    } else if (cooldownRemaining > 0) {
      return {
        text: `Cooldown ${Math.ceil(cooldownRemaining)}s`,
        disabled: true,
        className: "forage-button cooldown",
      };
    } else {
      const cost = calculateVolitionCost("forage");
      return {
        text: `Forage (${cost} 👑)`,
        disabled: false,
        className: "forage-button",
      };
    }
  };

  const buttonState = getButtonState();

  return (
    <>
      <h3>Foraging</h3>
      <div className="forage-button-container">
        <button
          className={buttonState.className}
          onClick={onOpenForage}
          disabled={buttonState.disabled}
        >
          {buttonState.text}
        </button>
      </div>
      <p className="forage-description">Explore your environment to find resources.</p>
    </>
  );
};

export default ForageButton;
