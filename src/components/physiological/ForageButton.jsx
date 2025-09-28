import { useStatusStore } from "../statusStore";

const ForageButton = ({ onOpenForage }) => {
  const { activeStatuses, cooldowns, calculateVolitionCost } = useStatusStore();

  const isStatusActive = (type) => !!activeStatuses[type];
  const getStatusDuration = (type) => activeStatuses[type]?.duration || 0;
  const getCooldownRemaining = (type) => cooldowns[type] || 0;

  const getButtonState = () => {
    const isActive = isStatusActive("forage");
    const cooldownRemaining = getCooldownRemaining("forage");
    const duration = getStatusDuration("forage");

    if (isActive) {
      return {
        text: `Foraging... ${Math.ceil(duration)}s`,
        disabled: false,
        className: "action-button forage-button active",
      };
    } else if (cooldownRemaining > 0) {
      return {
        text: `Cooldown ${Math.ceil(cooldownRemaining)}s`,
        disabled: true,
        className: "action-button forage-button cooldown",
      };
    } else {
      const cost = calculateVolitionCost("forage");
      return {
        text: `Forage (${cost} 💪)`,
        disabled: false,
        className: "action-button forage-button",
      };
    }
  };

  const buttonState = getButtonState();

  return (
    <button
      className={buttonState.className}
      onClick={onOpenForage}
      disabled={buttonState.disabled}
    >
      {buttonState.text}
    </button>
  );
};

export default ForageButton;
