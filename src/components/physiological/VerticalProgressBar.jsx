import "../../styles/ProgressBars.css";

const VerticalProgressBar = ({
  current,
  max,
  label,
  colorClass,
  height = 200,
}) => {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="progress-container">
      <div className="progress-label">{label}</div>
      <div className="progress-bar-wrapper" style={{ height: `${height}px` }}>
        <div className="progress-bar-background">
          <div
            className={`progress-bar-fill ${colorClass}`}
            style={{ height: `${percentage}%` }}
          >
            <div className="progress-shine"></div>
          </div>
        </div>
      </div>
      <div className="progress-percentage">{percentage.toFixed(0)}%</div>
    </div>
  );
};

export default VerticalProgressBar;
