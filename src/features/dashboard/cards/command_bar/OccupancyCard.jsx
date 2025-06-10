// C:\Users\Gilberto F\Desktop\Smore\frontend\src/features/dashboard/cards/command_bar/OccupancyCard.jsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import { formatDuration } from '../../../../utils/formatCurrency';
import AnimatedNumber from '../../../../components/animated_number/animated-number';
import QuarterCircleGauge from './subcomponents/QuarterCircleGauge';
import InsightRow from './subcomponents/InsightRow';
import { scriptLines_dashboard as sl } from '../../utils/script_lines'; // I18N
import { t, interpolate } from '../../../../i18n'; // I18N Helper

// Flipper animation variants (as seen in LiveOrdersCard)
const flipperVariants = {
    initial: { rotateY: -90, opacity: 0, scale: 0.9 },
    animate: { rotateY: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { rotateY: 90, opacity: 0, scale: 0.9, transition: { duration: 0.3, ease: "easeIn" } },
};

const SnapshotView = ({ data, isHovered }) => {
    const { active_tables = 0, total_tables = 0 } = data || {};
    const occupancyPercentage = total_tables > 0 ? Math.round((active_tables / total_tables) * 100) : 0;

    const color = useMemo(() => {
        if (occupancyPercentage >= 85) return '#ef4444'; // red-500
        if (occupancyPercentage >= 60) return '#f59e0b'; // amber-500
        return '#818cf8'; // indigo-500
    }, [occupancyPercentage]);

    return (
        <motion.div
            key="snapshot"
            variants={flipperVariants}
            initial="initial" animate="animate" exit="exit"
            className="flex flex-col h-full justify-between"
        >
            {/* Top section: Numbers */}
            <div className="flex-grow flex items-center">
                <div className="flex items-baseline">
                    <div className="text-6xl font-bold text-gray-800 dark:text-white font-montserrat">
                        <AnimatedNumber value={active_tables} />
                    </div>
                    {total_tables > 0 && (
                        <p className="text-xl font-medium text-gray-400 dark:text-gray-500 ml-1">
                            / {total_tables}
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom section: Label and Hover text */}
            <div className="h-10 w-[calc(100%-40px)] border-t border-neutral-200 dark:border-neutral-700 flex items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isHovered ? 'percentage' : 'label'}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isHovered ? (
                            <p className="text-sm font-semibold" style={{ color }}>{interpolate(sl.occupancyCard.occupancyPercentage || '{{percentage}}% Occupancy', { percentage: occupancyPercentage })}</p>
                        ) : (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{sl.occupancyCard.activeTables || 'Active Tables'}</p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* The Gauge - Positioned absolutely to overflow */}
            <div className="absolute -bottom-4 -right-4">
                <QuarterCircleGauge percentage={occupancyPercentage} color={color} size={80} strokeWidth={20} />
            </div>
        </motion.div>
    );
};


const InsightView = ({ data }) => {
    const { avg_turn_time_minutes = 0, busiest_tables = [] } = data || {};
    const maxOrders = useMemo(() => Math.max(1, ...busiest_tables.map(t => t.order_count)), [busiest_tables]);

    return (
        <motion.div
            key="insight"
            variants={flipperVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col h-full justify-center space-y-2"
        >
            {busiest_tables.length > 0 ? (
                busiest_tables.slice(0, 3).map((table, index) => (
                    <InsightRow
                        key={table.table_number}
                        label={interpolate(sl.occupancyCard.tableLabel || 'Table #{{tableNumber}}', { tableNumber: table.table_number })}
                        iconName="restaurant"
                        count={table.order_count}
                        metricValue={t(sl.occupancyCard.orderCount, { count: table.order_count, defaultValue: '{{count}} orders' })}
                        maxValue={maxOrders}
                        colorClass="text-blue-500"
                        delay={index * 0.1}
                    />
                ))
            ) : (
                <p className="text-xs text-center text-gray-400 italic">{sl.occupancyCard.noActivity || 'No table activity yet to rank hotspots.'}</p>
            )}
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400">{sl.occupancyCard.avgTurnTime || 'Avg. Turn Time'}</span>
                <span className="font-semibold text-gray-800 dark:text-white">{formatDuration(avg_turn_time_minutes * 60)}</span>
            </div>
        </motion.div>
    );
};

const OccupancyCard = ({ data, insightData }) => {
    const [isInsightMode, setInsightMode] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // The logic to derive color is now inside the SnapshotView, but we can keep it here for the icon
    const occupancyPercentage = useMemo(() => {
        const { active_tables = 0, total_tables = 0 } = data || {};
        return total_tables > 0 ? Math.round((active_tables / total_tables) * 100) : 0;
    }, [data]);

    const color = useMemo(() => {
        if (occupancyPercentage >= 85) return '#ef4444';
        if (occupancyPercentage >= 60) return '#f59e0b';
        return '#818cf8';
    }, [occupancyPercentage]);

    return (
        <motion.div
            layout
            onClick={() => setInsightMode(!isInsightMode)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="rounded-3xl bg-gradient-to-br from-white to-blue-50 dark:from-neutral-800 dark:to-blue-900/20 shadow-lg h-48 w-full cursor-pointer flex flex-col p-4 relative overflow-hidden" // Key changes: relative and overflow-hidden
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            transition={{ duration: 0.2 }}
        >
            <div className="relative z-10 flex flex-col h-full">
                {/* Header Section */}
                <div className="flex w-full justify-between items-start text-neutral-500 dark:text-neutral-300 mb-2">
                    <h3 className="font-medium text-lg font-montserrat">
                        {isInsightMode ? (sl.occupancyCard.titleInsight || 'Venue Hotspots') : (sl.occupancyCard.title || 'Occupancy')}
                    </h3>
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-700 shrink-0">
                        <Icon name="table_bar" className="w-4 h-4" style={{ color, fontSize: '1rem' }} variations={{ fill: 1, weight: 800, grade: 0, opsz: 48 }} />
                    </div>
                </div>

                {/* Animated Content Area */}
                <div className="flex-grow flex flex-col" style={{ perspective: '1000px' }}>
                    <AnimatePresence mode="wait" initial={false}>
                        {isInsightMode ? <InsightView data={insightData} /> : <SnapshotView data={data} isHovered={isHovered} />}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default OccupancyCard;