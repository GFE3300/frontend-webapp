import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import ViewModeToggle from '../time_selector/ViewToggle';

// Variants for header entrance
const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } }
};

// Legend item animation
const legendItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.1, type: 'spring', stiffness: 300, damping: 20 } })
};

const HeatmapHeader = ({
    viewMode,
    onViewChange,
    indexLabels,
    colorRanges,
    dateRange,
    additionalControls
}) => {
    return (
        <motion.header
            className=""
            initial="hidden"
            animate="show"
            variants={headerVariants}
        >
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between mb-4 md:mb-6 space-y-3 md:space-y-0">
                {/* Right group: legend */}
                <div className="flex flex-wrap items-center gap-4">
                    <AnimatePresence>
                        {indexLabels?.map((label, idx) => (
                            <motion.div
                                key={label}
                                className="flex items-center gap-2"
                                custom={idx}
                                initial="hidden"
                                animate="show"
                                variants={legendItemVariants}
                            >
                                <div
                                    className={`w-3 h-3 rounded-sm ${colorRanges[idx]} overflow-hidden`}
                                >
                                    {colorRanges[idx] === 'waving-lines' && (
                                        <>
                                            <div className="relative top-0 w-5 h-1 rounded-sm bg-rose-400/60 transform rotate-45" />
                                            <div className="relative top-0.5 -left-0.75 w-5 h-1 rounded-sm bg-rose-400/60 transform rotate-45" />
                                            <div className="relative top-1 -left-1.5 w-5 h-1 rounded-sm bg-rose-400/60 transform rotate-45" />
                                        </>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 font-montserrat">
                                    {label}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Left group: toggle, date, additional */}
                <div className="flex flex-wrap items-center gap-4">
                    <ViewModeToggle currentView={viewMode} onChange={onViewChange} />

                    <motion.h2
                        className="text-xl font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap"
                        key={dateRange}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
                        exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                    >
                        {dateRange}
                    </motion.h2>

                    {additionalControls && (
                        <div className="flex items-center">{additionalControls}</div>
                    )}
                </div>
            </div>
        </motion.header>
    );
};

HeatmapHeader.propTypes = {
    viewMode: PropTypes.oneOf(['week', 'month']).isRequired,
    onViewChange: PropTypes.func.isRequired,
    indexLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
    colorRanges: PropTypes.arrayOf(PropTypes.string).isRequired,
    dateRange: PropTypes.string,
    additionalControls: PropTypes.node
};

export default HeatmapHeader;
