import './Chip.css'
import {useDraggable} from "@dnd-kit/core";
import {motion} from 'motion/react';

function Chip({value, draggable = true}) {

    // Non-draggable chips should not register with dnd-kit at all.
    if (!draggable) {
        return (
            <div className="chip" data-value={value}>
                <span>{value}</span>
            </div>
        );
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
        id: `chip-${value}`,
        data: {value},
    });

    const style = {
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <motion.div
            initial={{opacity: 0, scale: 0}}
            animate={{opacity: 1, scale: 1}}
            transition={{
                duration: 0.4,
                scale: {type: "spring", visualDuration: 0.4, bounce: 0.5},
            }}>
            <div ref={setNodeRef} className="chip" data-value={value} style={style} {...listeners} {...attributes}>
                <span>{value}</span>
            </div>
        </motion.div>

    );
}

export default Chip;