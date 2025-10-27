import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "../gameStore";
import { useStatusStore } from "../statusStore";
import "../../styles/physiological/ForagePanel.css";

const RESOURCE_TYPES = {
  WATER: { emoji: "💧", name: "water" },
  FOOD: { emoji: "🍎", name: "food" },
  FIBERS: { emoji: "🌿", name: "fibers" },
  NOTHING: { emoji: "🤷", name: "nothing" },
};

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

  const forageCost = calculateVolitionCost("forage");

  // Initialize the game board
  const initializeGame = () => {
    const resourcePool = [];

    // Create pairs of resources (3 pairs each)
    const waterPairs = 3;
    const foodPairs = 3;
    const fibersPairs = 3;
    const nothingPairs = 3; // 3 pairs of nothing (bad luck!)

    for (let i = 0; i < waterPairs; i++) {
      resourcePool.push(RESOURCE_TYPES.WATER, RESOURCE_TYPES.WATER);
    }
    for (let i = 0; i < foodPairs; i++) {
      resourcePool.push(RESOURCE_TYPES.FOOD, RESOURCE_TYPES.FOOD);
    }
    for (let i = 0; i < fibersPairs; i++) {
      resourcePool.push(RESOURCE_TYPES.FIBERS, RESOURCE_TYPES.FIBERS);
    }
    for (let i = 0; i < nothingPairs; i++) {
      resourcePool.push(RESOURCE_TYPES.NOTHING, RESOURCE_TYPES.NOTHING);
    }

    // Add one extra card to fill the 5x5 grid
    resourcePool.push(RESOURCE_TYPES.NOTHING);

    // Shuffle the cards
    const shuffled = resourcePool.sort(() => Math.random() - 0.5);

    // Create card objects with unique IDs
    const gameCards = shuffled.map((resource, index) => ({
      id: index,
      resource: resource,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(gameCards);
    setFlippedCards([]);
    setMatchedCards(new Set());
    setFoundResources({ water: 0, food: 0, fibers: 0 });
  };

  const handleStartForage = () => {
    if (startStatus("forage")) {
      setGameStarted(true);
      initializeGame();
    } else {
      console.log("Foraging could not start: Not enough volition or other requirement failed.");
    }
  };

  // Wrap the function in useCallback to avoid re-creation on each render.
  const finishForaging = useCallback(() => {
    awardMaterials(foundResources);
    setGameStarted(false);
    onClose();
  }, [foundResources, awardMaterials, onClose]);

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
            // Update the running tally of resources found.
            setFoundResources((prev) => ({
              ...prev,
              [resourceType]: prev[resourceType] + 1,
            }));
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

  const isCardFlipped = (cardId) => {
    return flippedCards.includes(cardId) || matchedCards.has(cardId);
  };

  const gameComplete = matchedCards.size === cards.length - 1; // -1 because one card has no pair

  useEffect(() => {
    if (gameComplete && gameStarted) {
      setTimeout(() => {
        finishForaging();
      }, 1500);
    }
  }, [gameComplete, gameStarted, finishForaging]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (!gameStarted) {
      onClose();
    }
  };

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
                <span>🍃 Food: {foundResources.food}</span>
                <span>💧 Water: {foundResources.water}</span>
                <span>🌿 Fibers: {foundResources.wood}</span>
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
