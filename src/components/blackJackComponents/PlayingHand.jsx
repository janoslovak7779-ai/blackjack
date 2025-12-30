// `src/src/components/blackJackComponents/PlayingHand.jsx`
import PlayingCard from "./PlayingCard.jsx";
import { AnimatePresence, motion } from "motion/react";
import "./PlayingHand.css";

function PlayingHand({ cards, handValue, type }) {
    return (
        <section className="playing-hand">
            <header className="playing-hand__header">
                <h2 className="playing-hand__title">{type}</h2>
                <div className="playing-hand__meta">
                    <span>Value</span>
                    <span className="playing-hand__value">{handValue}</span>
                </div>
            </header>

            <div className="playing-hand__cards">
                <AnimatePresence mode="popLayout">
                    {cards.map((card, index) => (
                        <motion.div
                            className="playing-hand__card"
                            key={`${card.rank}${card.suit}${index}`}
                            layout
                            initial={{ opacity: 0, scale: 0.7, y: 60, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.7, y: -60, rotate: 10 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                            }}
                            style={{ originY: 1 }}
                        >
                            <PlayingCard card={card} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}

export default PlayingHand;
