import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import AnimatedNumber from '../../../../components/animated_number/animated-number';
import InteractiveLineChart from './subcomponents/InteractiveLineChart';
import { scriptLines_dashboard as sl } from '../../utils/script_lines'; // I18N

// --- Animation Variants ---
const cardTransition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };
const flipperVariants = {
    initial: { rotateY: -90, opacity: 0, scale: 0.9 },
    animate: { rotateY: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { rotateY: 90, opacity: 0, scale: 0.9, transition: { duration: 0.3, ease: "easeIn" } },
};

const SnapshotView = ({ data, isHovered }) => {
    const { current_value = 0, comparison_percentage = 0 } = data || {};
    const isPositive = comparison_percentage >= 0;
    const trendIcon = isPositive ? 'trending_up' : 'trending_down';
    const [showVsYesterday, setShowVsYesterday] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowVsYesterday(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            key="snapshot"
            variants={flipperVariants}
            initial="initial" animate="animate" exit="exit"
            className="flex font-montserrat flex-col h-full justify-between"
        >
            <div className="flex-grow flex items-center justify-start">
                <div className="text-6xl font-bold text-gray-800 dark:text-white font-montserrat">
                    <AnimatedNumber value={current_value} />
                </div>
            </div>
            <div className="h-10 border-t border-neutral-200 dark:border-neutral-700 flex items-center">
                <motion.div
                    layout
                    className={`flex items-center text-sm font-semibold rounded-full px-2 py-0.5 ${isPositive ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-500/20' : 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-500/20'}`}
                >
                    <Icon name={trendIcon} className="w-4 h-4 mr-1" style={{ fontSize: '1rem' }} />
                    <span>{Math.abs(comparison_percentage).toFixed(0)}%</span>
                    <AnimatePresence>
                        {isHovered && showVsYesterday && (
                            <motion.p
                                className="ml-1 h-4 flex items-center overflow-hidden truncate max-w-[200px]"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto', transition: { delay: 0.1 } }}
                                exit={{ opacity: 0, width: 0 }}
                            >
                                {sl.guestsCard.vsYesterday || 'vs yesterday'}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
};

const InsightView = ({ data }) => {
    const { peak_hour = "N/A", today_hourly_counts = [], comparison_hourly_counts = [] } = data || {};

    return (
        <motion.div
            key="insight"
            variants={flipperVariants}
            initial="initial" animate="animate" exit="exit"
            className="flex flex-col h-full justify-between font-montserrat"
        >
            <div className="flex-grow w-full">
                <InteractiveLineChart todayData={today_hourly_counts} yesterdayData={comparison_hourly_counts} onHoverDataChange={() => { }} onHoverEnd={() => { }} />
            </div>
            <div className="mt-2 pt-2 flex items-start border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">{sl.guestsCard.peakHour || 'Peak Hour'}</span>
                <span className="font-semibold text-neutral-800 dark:text-white">{peak_hour}</span>
            </div>
        </motion.div>
    );
};

const GuestsCard = ({ data, insightData }) => {
    const [isInsightMode, setInsightMode] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layout
            onClick={() => setInsightMode(!isInsightMode)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="rounded-3xl bg-gradient-to-br from-white to-rose-50 dark:from-neutral-800 dark:to-rose-900/20 shadow-lg h-48 w-full cursor-pointer flex flex-col p-4 relative overflow-hidden"
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            transition={cardTransition}
        >
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex w-full justify-between items-start text-neutral-500 dark:text-neutral-300 mb-2">
                    <h3 className="font-medium text-lg font-montserrat">
                        {isInsightMode ? (sl.guestsCard.titleInsight || 'Guest Flow') : (sl.guestsCard.title || 'Guests Today')}
                    </h3>
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-700 shrink-0">
                        <Icon name="groups" className="w-4 h-4 text-rose-500" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 600, grade: 0, opsz: 48 }} />
                    </div>
                </div>

                <div className="flex-grow flex flex-col" style={{ perspective: '1000px' }}>
                    <AnimatePresence mode="wait" initial={false}>
                        {isInsightMode ? <InsightView data={insightData} /> : <SnapshotView data={data} isHovered={isHovered} />}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default GuestsCard;