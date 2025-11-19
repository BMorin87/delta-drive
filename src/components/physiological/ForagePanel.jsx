import { useState, useEffect, useCallback, useRef } from "react";
import { useGameStore } from "../gameStore";
import { useStatusStore } from "../statusStore";
import { useThreatStore } from "../threatStore";
import "../../styles/physiological/ForagePanel.css";

const PAIR_COUNT = 3;
const TOTAL_CARD_COUNT = 25;
const THREAT_SPAWN_CHANCE = 0.5; // 50% chance to spawn a threat card
const MATCH_ANIMATION_DELAY = 600;
const MISMATCH_FLIP_DELAY = 1000;
const GAME_COMPLETE_DELAY = 1500;
const THREAT_REVEAL_DELAY = 800;

const RESOURCE_TYPES = {
  WATER: { emoji: "💧", name: "water" },
  FOOD: { emoji: "🍎", name: "food" },
  FIBERS: { emoji: "🌿", name: "fibers" },
  NOTHING: { emoji: "🤷", name: "nothing" },
  THREAT: { emoji: "⚠️", name: "threat" },
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
  const spawnThreat = useThreatStore((state) => state.spawnThreat);
  const threatConfigs = useThreatStore((state) => state.threatConfigs);
  const activeThreats = useThreatStore((state) => state.activeThreats);

  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState(new Set());
  const [revealedNothingCards, setRevealedNothingCards] = useState(new Set());
  const [revealedThreatCard, setRevealedThreatCard] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [foundResources, setFoundResources] = useState(INITIAL_RESOURCES_STATE);
  const [encounteredThreat, setEncounteredThreat] = useState(null);

  const completionHandledRef = useRef(false);

  const finishForaging = useCallback(() => {
    awardMaterials(foundResources);
    setGameStarted(false);
    setEncounteredThreat(null);
    onClose();
  }, [foundResources, awardMaterials, onClose]);

  const gameComplete =
    matchedCards.size + revealedNothingCards.size + (revealedThreatCard ? 1 : 0) === cards.length;

  useEffect(() => {
    if (gameComplete && gameStarted && !completionHandledRef.current) {
      completionHandledRef.current = true;
      setTimeout(finishForaging, GAME_COMPLETE_DELAY);
    }
  }, [gameComplete, gameStarted, finishForaging]);

  const createShuffledDeck = () => {
    const resourcePool = RESOURCE_CONFIG.reduce((pool, config) => {
      for (let i = 0; i < config.pairs; i++) {
        pool.push(config.type, config.type);
      }
      return pool;
    }, []);

    // Randomly decide if a threat card should spawn
    const shouldSpawnThreat = Math.random() < THREAT_SPAWN_CHANCE;
    if (shouldSpawnThreat) {
      resourcePool.push(RESOURCE_TYPES.THREAT);
    }

    // Fill remaining slots with "nothing" cards to reach TOTAL_CARD_COUNT
    const remainingSlots = TOTAL_CARD_COUNT - resourcePool.length;
    for (let i = 0; i < remainingSlots; i++) {
      resourcePool.push(RESOURCE_TYPES.NOTHING);
    }

    const shuffled = resourcePool.sort(() => Math.random() - 0.5);
    return shuffled.map((resource, index) => ({
      id: index,
      resource: resource,
    }));
  };

  const initializeGame = () => {
    setCards(createShuffledDeck());
    setFlippedCards([]);
    setMatchedCards(new Set());
    setRevealedNothingCards(new Set());
    setRevealedThreatCard(null);
    setFoundResources(INITIAL_RESOURCES_STATE);
    setEncounteredThreat(null);
    completionHandledRef.current = false;
  };

  const handleStartForage = () => {
    if (startStatus("forage")) {
      setGameStarted(true);
      initializeGame();
    } else {
      console.log("Foraging could not start: Not enough volition or other requirement failed.");
    }
  };

  const isNothingCard = (card) => card.resource.name === "nothing";
  const isThreatCard = (card) => card.resource.name === "threat";

  const handleThreatReveal = (cardId) => {
    setTimeout(() => {
      setRevealedThreatCard(cardId);
      setFlippedCards([]);
      setIsChecking(false);

      // Get available threats (ones not currently active)
      const availableThreats = Object.keys(threatConfigs).filter(
        (threatType) => !activeThreats[threatType]
      );

      if (availableThreats.length > 0) {
        // Pick a random threat from available ones
        const randomThreat = availableThreats[Math.floor(Math.random() * availableThreats.length)];

        // Spawn threat at level 1 (you can make this random too if you want)
        const level = 1;
        const spawned = spawnThreat(randomThreat, level);

        if (spawned) {
          setEncounteredThreat(`${threatConfigs[randomThreat].name} (Level ${level})`);
        }
      } else {
        // All threats are already active
        setEncounteredThreat("Additional threat avoided (all threats active)");
      }
    }, THREAT_REVEAL_DELAY);
  };

  const handleNothingMatch = (firstCardId, secondCardId) => {
    const newRevealedNothing = new Set(revealedNothingCards);
    newRevealedNothing.add(firstCardId);
    newRevealedNothing.add(secondCardId);
    setRevealedNothingCards(newRevealedNothing);
    setFlippedCards([]);
    setIsChecking(false);
  };

  const handleResourceMatch = (firstCardId, secondCardId, resourceType) => {
    setTimeout(() => {
      const newMatchedCards = new Set(matchedCards);
      newMatchedCards.add(firstCardId);
      newMatchedCards.add(secondCardId);
      setMatchedCards(newMatchedCards);

      setFoundResources((prev) => ({
        ...prev,
        [resourceType]: prev[resourceType] + 1,
      }));

      setFlippedCards([]);
      setIsChecking(false);
    }, MATCH_ANIMATION_DELAY);
  };

  const handleMismatch = (firstCard, secondCard) => {
    setTimeout(() => {
      const newRevealedNothing = new Set(revealedNothingCards);

      if (isNothingCard(firstCard)) {
        newRevealedNothing.add(firstCard.id);
      }
      if (isNothingCard(secondCard)) {
        newRevealedNothing.add(secondCard.id);
      }

      setRevealedNothingCards(newRevealedNothing);
      setFlippedCards([]);
      setIsChecking(false);
    }, MISMATCH_FLIP_DELAY);
  };

  const processCardPair = (firstCard, secondCard) => {
    // If either card is a threat, reveal it immediately
    if (isThreatCard(firstCard)) {
      handleThreatReveal(firstCard.id);
      // The second card gets flipped back
      setTimeout(() => {
        setFlippedCards([]);
      }, THREAT_REVEAL_DELAY);
      return;
    }
    if (isThreatCard(secondCard)) {
      handleThreatReveal(secondCard.id);
      // The first card gets flipped back
      setTimeout(() => {
        setFlippedCards([]);
      }, THREAT_REVEAL_DELAY);
      return;
    }

    const isMatch = firstCard.resource.name === secondCard.resource.name;

    if (isMatch) {
      if (isNothingCard(firstCard)) {
        handleNothingMatch(firstCard.id, secondCard.id);
      } else {
        handleResourceMatch(firstCard.id, secondCard.id, firstCard.resource.name);
      }
    } else {
      handleMismatch(firstCard, secondCard);
    }
  };

  const handleCardClick = (cardId) => {
    const isCardInteractable =
      !isChecking &&
      !matchedCards.has(cardId) &&
      !revealedNothingCards.has(cardId) &&
      revealedThreatCard !== cardId &&
      !flippedCards.includes(cardId);

    if (!isCardInteractable) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Process pair when two cards are flipped
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find((c) => c.id === firstCardId);
      const secondCard = cards.find((c) => c.id === secondCardId);
      processCardPair(firstCard, secondCard);
    }
  };

  const handleOverlayClick = () => {
    if (!gameStarted) {
      onClose();
    }
  };

  const isCardFlipped = (cardId) => {
    return (
      flippedCards.includes(cardId) ||
      matchedCards.has(cardId) ||
      revealedNothingCards.has(cardId) ||
      revealedThreatCard === cardId
    );
  };

  if (!isOpen) return null;

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
                <p>Match pairs of cards to find food, water, and fibers!</p>
                <p className="warning-text">⚠️ Beware: you may encounter threats...</p>
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

              {encounteredThreat && (
                <div className="threat-encounter-banner">
                  <span className="threat-icon">⚠️</span>
                  <span>Threat encountered: {encounteredThreat}!</span>
                </div>
              )}

              <div className="memory-game-grid">
                {cards.map((card) => {
                  return (
                    <div
                      key={card.id}
                      className={`memory-card ${isCardFlipped(card.id) ? "flipped" : ""} ${
                        matchedCards.has(card.id) ? "matched" : ""
                      } ${revealedThreatCard === card.id ? "threat-revealed" : ""}`}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <div className="card-inner">
                        <div className="card-front">?</div>
                        <div className="card-back">{card.resource.emoji}</div>
                      </div>
                    </div>
                  );
                })}
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
