import './BetZone.css'
import { useDroppable } from "@dnd-kit/core";
import Chip from "./Chip.jsx";
import "./Chip.css"
import { motion , AnimatePresence } from 'motion/react';

function BetZone({ onClear, disabled, bettedChips, isAllIn }) {
    const entries = Object.entries(bettedChips ?? {})
        .map(([value, count]) => ({ value: Number(value), count: Number(count) }))
        .sort((a, b) => a.value - b.value);

    const { isOver, setNodeRef } = useDroppable({ id: "bet-zone", disabled });

    return (
        <div
            ref={setNodeRef}
            className={`d-flex justify-content-center bet-zone ${disabled ? "opacity-50" : ""}`}
            style={{
                outline: !disabled && isOver ? "2px dashed rgba(255,255,255,0.7)" : "none",
                pointerEvents: disabled ? "none" : "auto",
            }}
            aria-disabled={disabled}
        >
            <div className="d-flex flex-column align-items-center gap-2">
                <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold fs-5">
                        {disabled ? "Betting disabled" : "Place your bet HERE"}
                    </span>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-light"
                        onClick={onClear}
                        disabled={disabled}
                    >
                        CLEAR
                    </button>
                </div>

                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap min-h-100">
                    {/* Bežný stav – drag & drop žetóny bez layoutId */}
                    {!isAllIn && entries.map(({ value, count }) => (
                        <motion.div
                            key={value}
                            className="d-flex flex-column align-items-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                        >
                            <Chip value={value} draggable={false} />
                            <span className="fw-bold fs-6 text-light">{count}x</span>
                        </motion.div>
                    ))}

                    {/* ALL IN – celý stack príde s animáciou presunu */}
                    {isAllIn && (
                        <motion.div
                            layoutId="allin-chips-stack"
                            layout
                            className="d-flex gap-5 flex-wrap justify-content-center align-items-center bg-dark bg-opacity-70 p-5 rounded-5 shadow-2xl"
                            initial={{ scale: 0.8, rotate: -10 }}
                            animate={{ scale: 1.15, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 180, damping: 20 }}
                        >
                            {Object.entries(bettedChips ?? {}).sort(([a], [b]) => b - a).map(([value, count]) => (
                                <motion.div key={value} className="d-flex flex-column align-items-center">
                                    <Chip value={Number(value)} draggable={false} />
                                    <span className="text-warning fw-bold fs-6">{count}x</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BetZone;