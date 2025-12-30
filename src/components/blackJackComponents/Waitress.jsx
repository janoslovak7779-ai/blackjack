// src/components/blackJackComponents/Waitress.jsx
import { motion, useMotionValue, useTransform } from 'motion/react';
import './Waitress.css';

function Waitress({ onDismiss }) {
    const y = useMotionValue(0);
    const opacity = useTransform(y, [-150, 0, 150], [0, 1, 0]);

    const handleDragEnd = (event, info) => {
        const threshold = 120;
        const velocity = Math.abs(info.velocity.y);

        // Swipe hore alebo dole
        if (Math.abs(info.offset.y) > threshold || velocity > 500) {
            onDismiss();
        } else {
            y.set(0); // Vráť späť na miesto
        }
    };

    return (
        <>
            {/* Backdrop overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="waitress-backdrop"
            />

            {/* Waitress Card - Center Screen */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{
                    scale: 0.5,
                    opacity: 0,
                    y: -100,
                    transition: { duration: 0.3 }
                }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    duration: 0.4
                }}
                className="waitress-center-container"
                style={{ y, opacity }}
            >
                <motion.div
                    drag="y"
                    dragConstraints={{ top: -200, bottom: 200 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    style={{ y }}
                    whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
                    className="waitress-card-center"
                >
                    {/* Waitress Image */}
                    <div className="waitress-image-center">
                        {/* Sem vlož svoj obrázok čašníčky */}
                        <img src="/waitress.png" alt="Waitress" />
                    </div>

                    {/* Message */}
                    <div className="waitress-message">
                        <h3>Oops! Interruption!</h3>
                        <p>Quick! Swipe me away!</p>
                    </div>

                    {/* Swipe Instruction */}
                    <motion.div
                        animate={{ y: [-8, 8, -8] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="waitress-instruction-center"
                    >
                        <span>↑</span>
                        Swipe Up or Down
                        <span>↓</span>
                    </motion.div>

                    {/* Glow effect */}
                    <div className="waitress-glow-center" />
                </motion.div>
            </motion.div>
        </>
    );
}

export default Waitress;