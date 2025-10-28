import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "../gameStore";
import { useStatusStore } from "../statusStore";
import "../../styles/physiological/ForagePanel.css";

const PAIR_COUNT = 3;
const EXTRA_CARD_COUNT = 1;

const RESOURCE_TYPES = {
  WATER: { emoji: "💧", name: "water" },
  FOOD: { emoji: "🍎", name: "food" },
  FIBERS: { emoji: "🌿", name: "fibers" },
  NOTHING: { emoji: "🤷", name: "nothing" },
};

const RESOURCE_CONFIG = [
  { type: RESOURCE_TYPES.WATER, pairs: PAIR_COUNT },
  { type: RESOURCE_TYPES.FOOD, pairs: PAIR_COUNT },
  { type: RESOURCE_TYPES.FIBERS, pairs: PAIR_COUNT },
  { type: RESOURCE_TYPES.NOTHING, pairs: PAIR_COUNT },
];

const INITIAL_RESOURCES_STATE = { water: 0, food: 0, fibers: 0 };

const ForagePanel = ({ isOpen, onClose }) => {
  const awardMaterials = useGameStore((state) => state.awardMaterials);
  const calculateVolitionCost = useStatusStore((state) => state.calculateVolitionCost);
  const startStatus = useStatusStore((state) => state.startStatus);
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState(new Set());
  const [isChecking, setIsChecking] = useState(false);
  // A running tally of all the materials found this foraging session.
  const [foundResources, setFoundResources] = useState({
    water: 0,
    food: 0,
    fibers: 0,
  });

  // The game's done when all but one cards are matched.
  const gameComplete = matchedCards.size === cards.length - 1;
  useEffect(() => {
    if (gameComplete && gameStarted) {
      setTimeout(() => {
        finishForaging();
      }, 1500);
    }
  }, [gameComplete, gameStarted, finishForaging]);

  const finishForaging = useCallback(() => {
    awardMaterials(foundResources);
    setGameStarted(false);
    onClose();
  }, [foundResources, awardMaterials, onClose]);

  if (!isOpen) return null;

  const initializeGame = () => {
    // Add pairs of resources to the pool based on the config.
    const resourcePool = RESOURCE_CONFIG.reduce((pool, config) => {
      for (let i = 0; i < config.pairs; i++) {
        pool.push(config.type, config.type);
      }
      return pool;
    }, []);

    // Add an extra card to make resourcePool.count a pleasant 25 for the 5x5 display.
    for (let i = 0; i < EXTRA_CARD_COUNT; i++) {
      resourcePool.push(RESOURCE_TYPES.NOTHING);
    }

    const shuffled = resourcePool.sort(() => Math.random() - 0.5);
    const gameCards = shuffled.map((resource, index) => ({
      id: index,
      resource: resource,
      isFlipped: false,
      isMatched: false,
    }));

    // Initialize the board state.
    setCards(gameCards);
    setFlippedCards([]);
    setMatchedCards(new Set());
    setFoundResources(INITIAL_RESOURCES_STATE);
  };

  const handleStartForage = () => {
    if (startStatus("forage")) {
      setGameStarted(true);
      initializeGame();
    } else {
      console.log("Foraging could not start: Not enough volition or other requirement failed.");
    }
  };

  const handleCardClick = (cardId) => {
    // Prevent clicking if already checking, card is matched, or card is already flipped
    if (isChecking || matchedCards.has(cardId) || flippedCards.includes(cardId)) {
      return;
    }

    // Flip the card
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Check if we have two cards flipped
    if (newFlippedCards.length === 2) {
      setIsChecking(true);

      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find((c) => c.id === firstCardId);
      const secondCard = cards.find((c) => c.id === secondCardId);

      // Check for match
      if (firstCard.resource.name === secondCard.resource.name) {
        // Match found!
        setTimeout(() => {
          const newMatchedCards = new Set(matchedCards);
          newMatchedCards.add(firstCardId);
          newMatchedCards.add(secondCardId);
          setMatchedCards(newMatchedCards);

          // Award resources
          const resourceType = firstCard.resource.name;
          if (resourceType !== "nothing") {
            setFoundResources((prev) => ({ ...prev, [resourceType]: prev[resourceType] + 1 }));
          }

          setFlippedCards([]);
          setIsChecking(false);
        }, 600);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const handleOverlayClick = () => {
    if (!gameStarted) {
      onClose();
    }
  };

  const isCardFlipped = (cardId) => {
    return flippedCards.includes(cardId) || matchedCards.has(cardId);
  };

  const forageCost = calculateVolitionCost("forage");

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="forage-panel" onClick={(e) => e.stopPropagation()}>
        <div className="forage-header">
          <h2>🌲 Forage for Resources</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="forage-content">
          {!gameStarted ? (
            <>
              <div className="forage-description">
                <p>Venture into the wilderness to search for valuable resources.</p>
                <p>Match pairs of cards to find food, water, and wood!</p>
              </div>

              <div className="forage-cost">
                <span className="cost-label">Volition Cost: </span>
                <span className="cost-value">{forageCost} 💪</span>
              </div>

              <div className="forage-actions">
                <button className="start-forage-btn" onClick={handleStartForage}>
                  Start Foraging
                </button>
                <button className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="resource-counter">
                <span>💧 Water: {foundResources.water}</span>
                <span>🍎 Food: {foundResources.food}</span>
                <span>🌿 Fibers: {foundResources.fibers}</span>
              </div>

              <div className="memory-game-grid">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className={`memory-card ${isCardFlipped(card.id) ? "flipped" : ""} ${
                      matchedCards.has(card.id) ? "matched" : ""
                    }`}
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div className="card-inner">
                      <div className="card-front">?</div>
                      <div className="card-back">{card.resource.emoji}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="forage-actions">
                <button className="cancel-btn" onClick={finishForaging}>
                  Finish Foraging
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForagePanel;
