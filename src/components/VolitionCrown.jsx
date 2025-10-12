import { useGameStore } from "./gameStore";
import "../styles/VolitionCrown.css";

const VolitionCrown = () => {
  const { volition, volitionCapacity, resourceRates } = useGameStore();

  const safeCurrent = Number.isFinite(volition) ? volition : 0;
  const isPositive = Number.isFinite(volitionCapacity) && volitionCapacity > 0;
  const safeMax = isPositive ? volitionCapacity : 1;
  const percentFull = Math.min((safeCurrent / safeMax) * 100, 100);

  // Format the rate display.
  const formatRate = (rate) => {
    const sign = rate >= 0 ? "+" : "";
    return `${sign}${rate.toFixed(1)}/s`;
  };

  return (
    <div className="volition-crown-container">
      <h2 className="volition-label">Volition</h2>
      <div className="crown-wrapper">
        <svg
          width="150"
          height="140"
          viewBox="0 0 150 140"
          className="crown-svg"
        >
          <defs>
            <linearGradient
              id="crownGradient"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#581c87" />
              <stop offset={`${percentFull}%`} stopColor="#8b5cf6" />
              <stop offset={`${percentFull}%`} stopColor="#374151" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
            <filter id="crownGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Crown shape path. */}
          <path
            d="M25 120 L15 30 L45 60 L75 20 L105 60 L135 30 L125 120 Z"
            fill="url(#crownGradient)"
            stroke="#8b5cf6"
            strokeWidth="3"
            filter="url(#crownGlow)"
          />
          {/* Crown gems. */}
          <circle cx="15" cy="30" r="5" fill="#c4b5fd" opacity="0.9" />
          <circle cx="75" cy="20" r="4" fill="#c4b5fd" opacity="0.7" />
          <circle cx="135" cy="30" r="5" fill="#c4b5fd" opacity="0.9" />

          {/* Current volition value - positioned in the crown center */}
          <text
            x="75"
            y="80"
            textAnchor="middle"
            className="crown-text-current"
            fill="#ffffff"
            fontSize="24"
            fontWeight="700"
          >
            {Math.round(safeCurrent)}
            <tspan fill="#c4b5fd" fontSize="16" fontWeight="500">
              /{safeMax}
            </tspan>
          </text>

          {/* Rate display - positioned below current value */}
          <text
            x="75"
            y="100"
            textAnchor="middle"
            className="crown-text-rate"
            fill="#c4b5fd"
            fontSize="12"
            fontWeight="500"
          >
            {formatRate(resourceRates.volition)}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default VolitionCrown;
