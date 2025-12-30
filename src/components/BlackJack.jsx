import ChipTray from "./blackJackComponents/ChipTray.jsx";
import BetZone from "./blackJackComponents/BetZone.jsx";
import PlayingHand from "./blackJackComponents/PlayingHand.jsx";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import { createDeck } from "../helperFunctions/CreateDeck.jsx";
import putAllChips from "../helperFunctions/putAllChips.jsx";
import "./blackJackComponents/BlackJack.css";
import Modal from "./blackJackComponents/Modal.jsx";
import { GameMenu, MenuButton } from "./GameMenu.jsx";
import Waitress from "./blackJackComponents/Waitress.jsx";

function BlackJack({ scenario, index, handleMovingToNextScenario, allLevelsBeaten, scenarioList }) {
    // Hlavné herné stavy
    const [deck, setDeck] = useState(createDeck);
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameResult, setGameResult] = useState({ message: "", type: "" }); // success | danger | warning
    const [hasStood, setHasStood] = useState(false);

    // Stávkovanie
    const [currentBet, setCurrentBet] = useState(0);
    const [bankroll, setBankroll] = useState(scenario.startingAmount);
    const [isBetPlaced, setIsBetPlaced] = useState(false);
    const [chipsInBetZone, setChipsInBetZone] = useState({}); // { value: count }
    const [isAllIn, setIsAllIn] = useState(false);

    // UI a pomocné stavy
    const [draggedChip, setDraggedChip] = useState(null);
    const [isResultModalHidden, setIsResultModalHidden] = useState(false);
    const [toast, setToast] = useState(null); // { type, message }

    // Waitress (rozptýlenie na medium/hard)
    const [showWaitress, setShowWaitress] = useState(false);
    const [waitressCount, setWaitressCount] = useState(0);
    const [lastWaitressTime, setLastWaitressTime] = useState(0);

    // Menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Časovač
    const initialTimeLimit = useMemo(() => scenario.timeLimit ?? null, [scenario.timeLimit]);
    const [timeRemaining, setTimeRemaining] = useState(initialTimeLimit);

    // Sledovanie času levelu a jednej hry
    const [levelStartTime] = useState(() => Date.now()); // zostáva fixný pri štarte levelu
    const [currentGameStartTime, setCurrentGameStartTime] = useState(() => Date.now());

    // Pomocné funkcie
    const formatElapsedTime = (ms) => {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    };

    const calculateHandValue = (cards) => {
        let total = 0;
        let aceCount = 0;

        for (const card of cards) {
            total += card.valueMin;
            if (card.valueMax - card.valueMin > 0) aceCount += 1;
        }

        while (aceCount > 0 && total + 10 <= 21) {
            total += 10;
            aceCount -= 1;
        }
        return total;
    };

    const drawCard = () => {
        const randomIndex = Math.floor(Math.random() * deck.length);
        const card = deck[randomIndex];
        setDeck((prev) => prev.filter((_, i) => i !== randomIndex));
        return card;
    };

    const endGame = (message, type) => {
        setIsGameOver(true);
        setGameResult({ message, type });
    };

    // Aktualizácia štatistík v localStorage
    const updateStats = (resultType, levelMeta = null) => {
        try {
            const saved = localStorage.getItem("blackJack:stats:v1");
            let stats = {
                totalGamesPlayed: 0,
                totalWins: 0,
                totalTimeSpent: 0,
                bestStreak: 0,
                currentStreak: 0,
                levels: {},
            };

            if (saved) {
                stats = JSON.parse(saved);
                stats.currentStreak ??= 0;
                stats.levels ??= {};
            }

            stats.totalGamesPlayed += 1;

            if (resultType === "success") {
                stats.totalWins += 1;
                stats.currentStreak = (stats.currentStreak || 0) + 1;
                stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);

                if (levelMeta?.scenarioId != null) {
                    const key = String(levelMeta.scenarioId);
                    const prev = stats.levels[key] ?? { wins: 0, bestTimeMs: null };
                    const newBestTime = Number.isFinite(levelMeta.elapsedMs)
                        ? prev.bestTimeMs == null
                            ? levelMeta.elapsedMs
                            : Math.min(prev.bestTimeMs, levelMeta.elapsedMs)
                        : prev.bestTimeMs;

                    stats.levels[key] = {
                        ...prev,
                        wins: (prev.wins ?? 0) + 1,
                        bestTimeMs: newBestTime,
                    };
                }
            } else if (resultType === "danger") {
                stats.currentStreak = 0;
            }

            const gameDurationSeconds = Math.floor((Date.now() - currentGameStartTime) / 1000);
            stats.totalTimeSpent = (stats.totalTimeSpent || 0) + gameDurationSeconds;

            localStorage.setItem("blackJack:stats:v1", JSON.stringify(stats));
        } catch {
            // silent fail
        }
    };

    const startNewGame = () => {
        let nextBankroll = bankroll;

        if (gameResult.type === "success") {
            nextBankroll = bankroll + currentBet * 2;
        } else if (gameResult.type === "warning") {
            nextBankroll = bankroll + currentBet; // push (tie)
        } else if (bankroll === 0 || timeRemaining === 0) {
            // Fail levelu → reset
            setTimeRemaining(initialTimeLimit);
            nextBankroll = scenario.startingAmount;
            updateStats(gameResult.type);
            setCurrentGameStartTime(Date.now());
            setToast({ type: "warning", message: "OOPS.... You FAILED! Resetting level..." });
        }

        setBankroll(nextBankroll);
        setDeck(createDeck);
        setPlayerCards([]);
        setDealerCards([]);
        setIsGameOver(false);
        setGameResult({ message: "", type: "" });
        setHasStood(false);
        setCurrentBet(0);
        setIsBetPlaced(false);
        setChipsInBetZone({});
        setIsAllIn(false);
        setIsResultModalHidden(false);
        setShowWaitress(false);
        setWaitressCount(0);
        setLastWaitressTime(Date.now());

        // Ak hráč dosiahol cieľ levelu
        if (nextBankroll >= scenario.endWithAmount) {
            const elapsedMs = Date.now() - levelStartTime;
            updateStats(gameResult.type, { scenarioId: scenario?.id, elapsedMs });
            setCurrentGameStartTime(Date.now());
            setToast({
                type: "success",
                message: `Congrats! You beat this level in ${formatElapsedTime(elapsedMs)}. Proceeding to the next level!`,
            });
            handleMovingToNextScenario();
        }
    };

    // Timer efekt
    useEffect(() => {
        if (initialTimeLimit == null || isMenuOpen || isGameOver) return;

        if (timeRemaining === 0) {
            startNewGame();
            return;
        }

        const interval = setInterval(() => {
            setTimeRemaining((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
        }, 1000);

        return () => clearInterval(interval);
    }, [initialTimeLimit, timeRemaining, isGameOver, isMenuOpen]);

    // Waitress efekt (len medium/hard)
    useEffect(() => {
        const shouldEnable = scenario.difficulty === "medium" || scenario.difficulty === "hard";
        const isActive = isBetPlaced && !isGameOver;

        if (!shouldEnable || !isActive || showWaitress) return;

        const config = scenario.difficulty === "hard"
            ? { minInterval: 2000, maxInterval: 4000, chance: 0.9 }
            : { minInterval: 2000, maxInterval: 4000, chance: 0.9 };

        const delay = Math.random() * (config.maxInterval - config.minInterval) + config.minInterval;
        const appear = Math.random() < config.chance;

        const timeout = setTimeout(() => {
            const sinceLast = Date.now() - lastWaitressTime;
            if (appear && sinceLast > config.minInterval) {
                setShowWaitress(true);
                setWaitressCount((c) => c + 1);
                setLastWaitressTime(Date.now());
            }
        }, delay);

        return () => clearTimeout(timeout);
    }, [scenario.difficulty, isBetPlaced, isGameOver, showWaitress, lastWaitressTime]);

    // Reset bankrollu a času pri zmene scenára
    useEffect(() => {
        setBankroll(scenario.startingAmount);
        setTimeRemaining(scenario.timeLimit ?? null);
    }, [scenario]);

    // Akcie hráča
    const hit = () => {
        const newHand = [...playerCards, drawCard()];
        setPlayerCards(newHand);
        const value = calculateHandValue(newHand);

        if (value > 21) endGame("You went over 21! YOU LOSE!", "danger");
        else if (value === 21) endGame(`You have Blackjack! YOU WIN ${currentBet * 2}!`, "success");
    };

    const stand = () => setHasStood(true);

    const deal = () => setIsBetPlaced(true);

    const goAllIn = () => {
        if (bankroll <= 0) return;
        setIsAllIn(true);

        setTimeout(() => {
            const allInAmount = bankroll;
            const chips = putAllChips(allInAmount);

            setCurrentBet((prev) => prev + allInAmount);
            setBankroll(0);

            setChipsInBetZone((prev) => {
                const updated = { ...prev };
                for (const value of chips) {
                    updated[value] = (updated[value] ?? 0) + 1;
                }
                return updated;
            });
        }, 50);
    };

    // Rozdanie kariet po stávke
    useEffect(() => {
        if (!isBetPlaced || playerCards.length > 0 || dealerCards.length > 0) return;

        const playerInitial = [drawCard(), drawCard()];
        const dealerInitial = [drawCard()];

        setPlayerCards(playerInitial);
        setDealerCards(dealerInitial);

        const playerValue = calculateHandValue(playerInitial);
        const dealerValue = calculateHandValue(dealerInitial);

        if (playerValue === 21) endGame(`You have Blackjack! YOU WIN ${currentBet * 2}!`, "success");
        else if (dealerValue === 21) endGame("Dealer has Blackjack! YOU LOSE!", "danger");
    }, [isBetPlaced]);

    // Dealer ťahá po stande
    useEffect(() => {
        if (!hasStood || isGameOver || !isBetPlaced || playerCards.length === 0) return;

        let dealerHand = [...dealerCards];
        let dealerValue = calculateHandValue(dealerHand);

        while (dealerValue < 17) {
            dealerHand.push(drawCard());
            dealerValue = calculateHandValue(dealerHand);
        }

        setDealerCards(dealerHand);

        const playerValue = calculateHandValue(playerCards);

        if (dealerValue > 21) endGame(`Dealer went over 21! YOU WIN ${currentBet * 2}!`, "success");
        else if (dealerValue > playerValue) endGame("Dealer wins! YOU LOSE!", "danger");
        else if (dealerValue < playerValue) endGame(`YOU WIN ${currentBet * 2}!`, "success");
        else endGame("It's a tie! Your bet RETURNS!", "warning");
    }, [hasStood]);

    // Drag & Drop žetónov
    const handleDragStart = (event) => {
        setDraggedChip(event.active.data.current);
    };

    const handleDragEnd = (event) => {
        setDraggedChip(null);
        const { active, over } = event;
        if (!over || over.id !== "bet-zone") return;

        const chipValue = Number(active.data.current?.value);
        if (!Number.isFinite(chipValue) || bankroll < chipValue) return;

        setCurrentBet((prev) => prev + chipValue);
        setBankroll((prev) => prev - chipValue);
        setChipsInBetZone((prev) => ({
            ...prev,
            [chipValue]: (prev[chipValue] ?? 0) + 1,
        }));
    };

    const clearBet = () => {
        setBankroll((prev) => prev + currentBet);
        setCurrentBet(0);
        setChipsInBetZone({});
        setIsAllIn(false);
    };

    const hideResultModal = () => setIsResultModalHidden(true);

    // Automatické zmiznutie toastu
    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(id);
    }, [toast]);

    const dismissWaitress = () => setShowWaitress(false);

    return (
        <>
            <GameMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                allLevelsBeaten={allLevelsBeaten}
                currentIndex={index}
                scenarioList={scenarioList}
            />

            <div className="bj-header">
                <div className="bj-header__left">
                    {!allLevelsBeaten ? (
                        <span className="bj-header__meta">Level: {index + 1}/{scenarioList.length}</span>
                    ) : (
                        <span className="bj-header__meta">All levels beaten! Freeplay mode is on.</span>
                    )}
                </div>
                <h1 className="bj-header__title">{scenario.title}</h1>
                <div className="bj-header__right">
          <span className="bj-header__meta bj-header__time me-2">
            {scenario.timeLimit ? `Time left: ${timeRemaining}s` : "No timer"}
          </span>
                    <MenuButton onClick={() => setIsMenuOpen(true)} />
                </div>
            </div>

            <div className="container mt-3 text-white text-center d-flex flex-column min-vh">
                <div className="bj-objective">
                    <span className="bj-objective__label">Objective</span>
                    <span className="bj-objective__text">
            Reach <span className="bj-objective__amount">${scenario.endWithAmount}</span> bankroll
          </span>
                </div>

                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="row align-items-center g-3 py-4">
                        <div className="col-12 col-lg-4 d-flex justify-content-lg-start justify-content-center mt-0">
                            <ChipTray allIn={goAllIn} bankroll={bankroll} disabled={isBetPlaced} bettedChips={chipsInBetZone} />
                        </div>

                        <div className="col-12 col-lg-4 mt-0">
                            <div className="bj-stats">
                                <div className="bj-stat">
                                    <span className="bj-stat__label">Bankroll</span>
                                    <span className="bj-stat__value">${bankroll}</span>
                                </div>
                                <div className="bj-stat">
                                    <span className="bj-stat__label">Bet</span>
                                    <span className="bj-stat__value">${currentBet}</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-4 d-flex justify-content-lg-end justify-content-center mt-0">
                            <BetZone
                                onClear={clearBet}
                                disabled={isBetPlaced}
                                bettedChips={chipsInBetZone}
                                isAllIn={isAllIn}
                                bet={currentBet}
                            />
                        </div>
                    </div>

                    <DragOverlay dropAnimation={null}>
                        {draggedChip && (
                            <div className="chip" data-value={draggedChip.value}>
                                <span>{draggedChip.value}</span>
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>

                <div className="d-flex justify-content-center gap-2 mb-3">
                    {!isBetPlaced ? (
                        <button type="button" className="btn btn-success" onClick={deal} disabled={currentBet === 0}>
                            Deal
                        </button>
                    ) : !isGameOver ? (
                        <>
                            <button type="button" className="btn btn-secondary" onClick={hit}>
                                Hit
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={stand}>
                                Stand
                            </button>
                        </>
                    ) : (
                        <button type="button" className="btn btn-success" onClick={startNewGame}>
                            New Game
                        </button>
                    )}
                </div>

                <div className="row g-4 justify-content-center mt-2">
                    <div className="card-deck">
                        <PlayingHand
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                scale: { type: "spring", bounce: 0.5 },
                            }}
                            cards={playerCards}
                            handValue={calculateHandValue(playerCards)}
                            type="Player"
                        />
                    </div>

                    <div className="card-deck">
                        <PlayingHand
                            cards={dealerCards}
                            handValue={calculateHandValue(dealerCards)}
                            type="Dealer"
                        />
                    </div>
                </div>

                {isGameOver && !isResultModalHidden && (
                    <Modal result={gameResult} hideModalDisplay={hideResultModal} />
                )}

                {toast && (
                    <div className="bj-toast-wrap" role="status" aria-live="polite">
                        <div className={`bj-toast bj-toast--${toast.type}`}>
                            <div className="bj-toast__glow" aria-hidden="true" />
                            <div className="bj-toast__content">
                <span className="bj-toast__label">
                  {toast.type === "success" ? "WIN" : toast.type === "warning" ? "FAILED" : "Info"}
                </span>
                                <span className="bj-toast__message">{toast.message}</span>
                            </div>
                        </div>
                    </div>
                )}

                {showWaitress && <Waitress onDismiss={dismissWaitress} />}
            </div>
        </>
    );
}

export default BlackJack;