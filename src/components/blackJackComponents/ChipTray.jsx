import Chip from "./Chip.jsx";
import {motion} from 'motion/react';
import putAllChips from "../../helperFunctions/putAllChips.jsx";

function ChipTray({allIn, bankroll, disabled, isAllIn, bettedChips}) {
    // Definuj všetky možné hodnoty žetónov
    const ALL_CHIP_VALUES = [1, 10, 25, 50, 100, 500];

    // Získaj žetóny z putAllChips (optimálny rozklad)
    const normalChips = putAllChips(bankroll);

    // Pridaj aj všetky menšie hodnoty, ktoré nie sú v normalChips
    const existingValues = new Set(normalChips);
    const additionalChips = ALL_CHIP_VALUES
        .filter(value => value <= bankroll && !existingValues.has(value))
        .map(value => value); // Pridaj jeden žetón každej chýbajúcej hodnoty

    // Kombinuj obe skupiny
    const allChips = [...normalChips, ...additionalChips];

    // Pri All In používame bettedChips ako zdroj žetónov pre animáciu
    const allInChips = Object.entries(bettedChips ?? {}).flatMap(([v, count]) =>
        Array(count).fill(Number(v))
    );

    const chipsToRender = isAllIn ? allInChips : allChips;

    const chipCounts = chipsToRender.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {});

    const uniqueValues = [...new Set(chipsToRender)].sort((a, b) => a - b);

    const MAX_VISIBLE_CHIPS = 5;

    return (
        <div>
            <div className="d-flex flex-column align-items-start gap-2">
                <div className="d-flex justify-content-start flex-wrap">
                    {!isAllIn && (
                        <>
                            {uniqueValues.map((value) => {
                                const count = chipCounts[value] || 0;
                                const visibleCount = Math.min(count, MAX_VISIBLE_CHIPS);

                                return (
                                    <div key={value} className="chip-stack">
                                        {Array.from({length: visibleCount}).map((_, i) => {
                                            const isTop = i === visibleCount - 1;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    className="chip-position"
                                                    style={{
                                                        transform: `translateY(-${i * 8}px) rotate(${(i % 2 === 0 ? -1 : 1) * (i * 1.5)}deg)`,
                                                        zIndex: i + 1,
                                                    }}
                                                >
                                                    <Chip value={value} draggable={!disabled && isTop}/>
                                                </motion.div>
                                            );
                                        })}

                                        {count > MAX_VISIBLE_CHIPS && (
                                            <div className="text-light text-center mt-2 fw-bold"
                                                 style={{fontSize: '0.8rem', marginTop: '50px'}}>
                                                +{count - MAX_VISIBLE_CHIPS}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {isAllIn && (
                        <div className="d-flex gap-4 flex-wrap">
                            {Object.entries(bettedChips ?? {}).flatMap(([v, count]) =>
                                Array.from({length: count}).map((_, i) => (
                                    <motion.div
                                        key={`tray-allin-${v}-${i}`}
                                        layoutId={`allin-chip-${v}-${i}`}
                                        layout
                                        className="chip-position"
                                        transition={{type: "spring", stiffness: 300, damping: 30}}
                                    >
                                        <Chip value={Number(v)} draggable={false}/>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <button
                type="button"
                className="btn btn-secondary mt-2 mybutton"
                onClick={allIn}
                disabled={disabled || bankroll === 0}
            >
                ALL IN
            </button>
        </div>
    );
}

export default ChipTray;