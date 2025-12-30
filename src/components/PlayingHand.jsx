import PlayingCard from "./PlayingCard";
import { motion, AnimatePresence } from 'motion/react';

function PlayingHand({cards, handValue, type}) {

    return (
        <div className="p-4">
            <h2 className="mb-3">
                {type}: {handValue}
            </h2>

            <div className="d-flex flex-column flex-sm-row flex-wrap gap-2">
                <AnimatePresence mode="popLayout">  {/* Zachová layout pri odchode kariet */}
                    {cards.map((card, index) => (
                        <motion.div
                            key={`${card.rank}${card.suit}${index}`}  // Lepší key ako len index (stabilný pri zmene poradia)
                            layout  // Pekne animuje posun kariet pri zmene poradia
                            initial={{ opacity: 0, scale: 0.7, y: 60, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.7, y: -60, rotate: 10 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,        // Postupné rozdaníe (stagger efekt)
                                type: "spring",
                                stiffness: 300,
                                damping: 25
                            }}
                            style={{ originY: 1 }}  // Otočenie okolo spodného okraja
                        >
                            <PlayingCard card={card} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );

}

export default PlayingHand;
