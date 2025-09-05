import "../styles/VolitionCrown.css";

const VolitionCrown = ({ current, max }) => {
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const percentage = Math.min((safeCurrent / safeMax) * 100, 100);

  return (
    <div className="volition-crown-container">
      <div className="volition-label">Volition</div>
      <div className="crown-wrapper">
        <svg
          width="160"
          height="140"
          viewBox="0 0 160 140"
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
              <stop offset={`${percentage}%`} stopColor="#8b5cf6" />
              <stop offset={`${percentage}%`} stopColor="#374151" />
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
          {/* Crown shape path with straight diagonal lines to outer peaks */}
          <path
            d="M20 110 L50 10 L70 55 L80 15 L100 55 L110 10 L140 110 Z"
            fill="url(#crownGradient)"
            stroke="#8b5cf6"
            strokeWidth="3"
            filter="url(#crownGlow)"
          />
          {/* Crown gems - positioned exactly at the peak tops */}
          <circle cx="50" cy="10" r="5" fill="#c4b5fd" opacity="0.9" />
          <circle cx="80" cy="15" r="4" fill="#c4b5fd" opacity="0.7" />
          <circle cx="110" cy="10" r="5" fill="#c4b5fd" opacity="0.9" />
        </svg>
      </div>
      <div className="volition-values">
        <span className="volition-current">{Math.round(current)}</span>
        <span className="volition-max">/{max}</span>
      </div>
      <div className="volition-percentage">{percentage.toFixed(1)}%</div>
    </div>
  );
};

export default VolitionCrown;
