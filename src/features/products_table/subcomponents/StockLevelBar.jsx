import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const StockLevelBar = memo(({ levelPercentage, quantity, threshold }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    let barColorClass = 'bg-blue-500 dark:bg-blue-400'; // >30%
    if (levelPercentage <= 10) {
        barColorClass = 'bg-red-500 dark:bg-red-400'; // <10%
    } else if (levelPercentage <= 30) {
        barColorClass = 'bg-orange-500 dark:bg-orange-400'; // 10-30%
    }

    return (
        <div
            className="flex items-center space-x-2 relative group"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2.5">
                <motion.div
                    className={`h-2.5 rounded-full ${barColorClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${levelPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md text-white ${barColorClass}`}>
                {quantity} left
            </span>
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-neutral-700 text-white text-xs rounded shadow-lg whitespace-nowrap"
                    >
                        Low-stock threshold: {threshold}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-neutral-700"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

StockLevelBar.propTypes = {
    levelPercentage: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    threshold: PropTypes.number.isRequired,
};

export default StockLevelBar;