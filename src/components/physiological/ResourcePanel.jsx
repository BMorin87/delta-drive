import { useGameStore } from "../gameStore";
import "../../styles/physiological/ResourcePanel.css";

const ResourcePanel = () => {
  const water = useGameStore((state) => state.water);
  const food = useGameStore((state) => state.food);
  const fibers = useGameStore((state) => state.fibers);

  const resources = [
    { name: "Water", emoji: "💧", quantity: water },
    { name: "Food", emoji: "🍎", quantity: food },
    { name: "Fibers", emoji: "🌿", quantity: fibers },
  ];

  return (
    <div className="resource-panel">
      <h3>Materials</h3>
      <ul className="resource-list">
        {resources.map((resource) => (
          <li key={resource.name}>
            <span className="resource-name">
              {resource.emoji} {resource.name}:{" "}
            </span>
            <span className="resource-quantity">{resource.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourcePanel;
