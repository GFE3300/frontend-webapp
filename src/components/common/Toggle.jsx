import React from 'react';
import { motion } from 'framer-motion';

const spring = {
    type: 'spring',
    stiffness: 700,
    damping: 30,
};

/**
 * A sleek, animated toggle switch component.
 * @param {object} props
 * @param {boolean} props.isOn - The current state of the toggle.
 * @param {function} props.onToggle - The function to call when the toggle is clicked.
 * @param {string} [props.offLabel="Snapshot"] - The label for the 'off' state.
 * @param {string} [props.onLabel="Insight"] - The label for the 'on' state.
 */
const Toggle = ({ isOn, onToggle, offLabel = 'Snapshot', onLabel = 'Insight' }) => {
    return (
        <div
            className={`relative flex items-center w-40 h-9 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${isOn ? 'bg-purple-600/80 dark:bg-purple-700/80' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
            onClick={onToggle}
            data-ison={isOn}
        >
            <motion.div
                className="absolute top-1 left-1 w-[7.25rem] h-7 bg-white dark:bg-neutral-900 rounded-full shadow-md"
                layout
                transition={spring}
                style={{ x: isOn ? 'calc(100% - 0.5rem)' : '0%' }}
            />
            <span className="flex-1 text-center text-xs font-bold z-10 transition-colors duration-200">
                {offLabel}
            </span>
            <span className="flex-1 text-center text-xs font-bold z-10 transition-colors duration-200">
                {onLabel}
            </span>
        </div>
    );
};

export default Toggle;