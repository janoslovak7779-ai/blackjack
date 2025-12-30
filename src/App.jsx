import BlackJack from "./components/BlackJack.jsx";
import scenarios from "./data/scenarios.json"
import {useEffect, useMemo, useState} from "react";
import {shuffle} from "./helperFunctions/shuffleArray.jsx";
import { GameMenu } from "./components/GameMenu.jsx";
import { StartMenu } from "./components/StartMenu.jsx";
import "./App.css";
import Modal from "./components/blackJackComponents/Modal.jsx";

const STORAGE_KEY = "blackJack:run:v1";
const CAMPAIGN_ORDER_KEY = "blackJack:campaignOrder:v1";
const FIRST_RUN_MODAL_KEY = "blackJack:firstRunModalSeen:v1";

function App() {

    const blackjackScenarios = useMemo(() => scenarios.filter((s) => s.type === "blackjack"), []);

    const initialOrderedScenarios = useMemo(() => {
        const easy = [];
        const medium = [];
        const hard = [];

        for (const v of blackjackScenarios) {
            if (v.difficulty === "easy") easy.push(v);
            else if (v.difficulty === "medium") medium.push(v);
            else if (v.difficulty === "hard") hard.push(v);
        }

        // First pass: grouped by difficulty, but randomized inside each group
        return [...shuffle(easy), ...shuffle(medium), ...shuffle(hard)];
    }, [blackjackScenarios]);

    // Save campaign order ONCE (first initialization only)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(CAMPAIGN_ORDER_KEY);
            const parsed = raw ? JSON.parse(raw) : null;

            const isValid =
                Array.isArray(parsed) &&
                parsed.length > 0 &&
                parsed.every((id) => typeof id === "string" || typeof id === "number");

            if (isValid) return; // never overwrite once set

            const ids = initialOrderedScenarios
                .map((s) => s?.id)
                .filter((id) => typeof id === "string" || typeof id === "number");

            if (ids.length > 0) {
                localStorage.setItem(CAMPAIGN_ORDER_KEY, JSON.stringify(ids));
            }
        } catch {
            // ignore storage/parse errors
        }
    }, [initialOrderedScenarios]);

    // Hydrate from cache on first render (prevents order changing on refresh)
    const [scenarioList, setScenarioList] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return initialOrderedScenarios;

            const saved = JSON.parse(raw);
            const savedIds = Array.isArray(saved?.scenarioIds) ? saved.scenarioIds : null;
            if (!savedIds || savedIds.length === 0) return initialOrderedScenarios;

            const byId = new Map(blackjackScenarios.map((s) => [s.id, s]));
            const restoredList = savedIds.map((id) => byId.get(id)).filter(Boolean);

            // If scenarios changed (missing/added), fall back to fresh order.
            if (restoredList.length !== blackjackScenarios.length) return initialOrderedScenarios;

            return restoredList;
        } catch {
            return initialOrderedScenarios;
        }
    });

    const [index, setIndex] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return 0;

            const saved = JSON.parse(raw);
            const savedIndex = Number.isFinite(saved?.index) ? saved.index : 0;
            return Math.max(0, savedIndex);
        } catch {
            return 0;
        }
    });

    // Hydrate `allLevelsBeaten` from cache on first render
    const [allLevelsBeaten, setAllLevelsBeaten] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return false;

            const saved = JSON.parse(raw);
            return Boolean(saved?.allLevelsBeaten);
        } catch {
            return false;
        }
    });

    // Clamp index if list length differs
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIndex((i) => Math.min(Math.max(0, i), scenarioList.length - 1));
    }, [scenarioList.length]);

    // Persist scenario order + index
    useEffect(() => {
        try {
            const payload = {
                scenarioIds: scenarioList.map((s) => s.id),
                index,
                savedAt: Date.now(),
                allLevelsBeaten: allLevelsBeaten
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch {
            // ignore quota / disabled storage
        }
    }, [scenarioList, index, allLevelsBeaten]);

    const handleMovingToNextScenario = () => {
        setIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;

            // After finishing all scenarios once, reshuffle fully random and restart
            if (nextIndex >= scenarioList.length) {
                setScenarioList(shuffle(blackjackScenarios));
                setAllLevelsBeaten(true);
                return 0;
            }
            return nextIndex;
        });

    };

    const [hasStarted, setHasStarted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // One-time first-run modal (using existing Modal component)
    const [isFirstRunModalOpen, setIsFirstRunModalOpen] = useState(() => {
        try {
            return localStorage.getItem(FIRST_RUN_MODAL_KEY) !== "1";
        } catch {
            return true;
        }
    });

    const hideFirstRunModal = () => {
        setIsFirstRunModalOpen(false);
        try {
            localStorage.setItem(FIRST_RUN_MODAL_KEY, "1");
        } catch {
            // ignore storage errors
        }
    };

    if (!scenarioList[index]) return <div className="container mt-3 text-white">No scenarios.</div>;

    const firstRunModalResult = {
        type: "",
        message:
            "Welcome to Blackjack! Beat the dealer by getting as close to 21 as possible without going over. " +
            "For more info, check out the rules in the menu. " +
            "Good luck!"
    };
    
    return (
        <>
            {isFirstRunModalOpen ?
                <Modal
                    result={firstRunModalResult}
                    hideModalDisplay={hideFirstRunModal} />
                : null}

            <GameMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                allLevelsBeaten={allLevelsBeaten}
                currentIndex={index}
                scenarioList={scenarioList}
            />

            {!hasStarted ? (
                <StartMenu onPlay={() => setHasStarted(true)} onOpenMenu={() => setIsMenuOpen(true)} />
            ) : (
                <div className="container mt-3 text-white text-center d-flex flex-column min-vh">
                    <BlackJack
                        scenario={scenarioList[index]}
                        index={index}
                        handleMovingToNextScenario={handleMovingToNextScenario}
                        allLevelsBeaten={allLevelsBeaten}
                        scenarioList={scenarioList}
                    />
                </div>
            )}
        </>
    );
}

export default App;