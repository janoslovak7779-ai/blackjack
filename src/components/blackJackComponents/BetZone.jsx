import './BetZone.css'
import {useDroppable} from "@dnd-kit/core";
import Chip from "./Chip.jsx";
import "./Chip.css"
import {motion} from 'motion/react';
import putAllChips from "../../helperFunctions/putAllChips.jsx";

function BetZone({onClear, disabled, bettedChips, isAllIn, bet}) {
    // Vždy optimalizujeme žetóny podľa celkovej stávky (bet)
    const optimizedChips = putAllChips(bet);

    const chipCounts = optimizedChips.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {});

    const uniqueValues = [...new Set(optimizedChips)].sort((a, b) => b - a);

    const {isOver, setNodeRef} = useDroppable({id: "bet-zone", disabled});

    const MAX_VISIBLE_CHIPS = 5;

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
            <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center gap-3 mb-2">
                    <button
                        type="button"
                        className="btn btn-sm"
                        onClick={onClear}
                        disabled={disabled}
                    >
                        CLEAR
                    </button>
                </div>

                <div className="d-flex gap-4 justify-content-center flex-wrap py-3" style={{ minHeight: '120px' }}>
                    {/* Zobrazenie žetónov v stĺpcoch presne ako v ChipTray */}
                    {uniqueValues.length > 0 && uniqueValues.map((value) => {
                        const count = chipCounts[value] || 0;
                        const visibleCount = Math.min(count, MAX_VISIBLE_CHIPS);

                        return (
                            <div key={value} style={{ position: 'relative', width: '51px', height: '80px' }}>
                                {Array.from({length: visibleCount}).map((_, i) => {
                                    const yOffset = -i * 8;
                                    const rotation = (i % 2 === 0 ? -1 : 1) * (i * 1.5);

                                    return (
                                        <motion.div
                                            key={i}
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                bottom: 0,
                                                width: '51px',
                                                height: '51px',
                                                zIndex: i + 1,
                                            }}
                                            initial={isAllIn ? {
                                                opacity: 0,
                                                scale: 0.5,
                                                y: 50 + yOffset,
                                                rotate: -180 + rotation
                                            } : {
                                                opacity: 0,
                                                scale: 0.8,
                                                y: 20 + yOffset,
                                                rotate: rotation
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                y: yOffset,
                                                rotate: rotation
                                            }}
                                            transition={{
                                                delay: i * 0.05,
                                                duration: 0.5,
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 25
                                            }}
                                        >
                                            <Chip value={value} draggable={false}/>
                                        </motion.div>
                                    );
                                })}

                                {count > MAX_VISIBLE_CHIPS && (
                                    <div
                                        className="text-light text-center fw-bold"
                                        style={{
                                            fontSize: '0.8rem',
                                            position: 'absolute',
                                            bottom: '-25px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        +{count - MAX_VISIBLE_CHIPS}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Prázdna zóna ak ešte nič nie je vsadené */}
                    {uniqueValues.length === 0 && (
                        <span className="text-secondary fs-4 opacity-50">
                            Drag chips here to bet
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BetZone;