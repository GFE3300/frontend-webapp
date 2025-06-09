// src/features/dashboard/cards/AtAGlanceCard.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCommandBarSummary } from '../hooks/useOverviewData';
import Toggle from '../../../components/common/Toggle';
import AtAGlanceCardSkeleton from './skeletons/AtAGlanceCardSkeleton'; // Import skeleton

// --- Import all real components ---
import OrderSnapshot from './at_a_glance/OrderSnapshot';
import OrderInsight from './at_a_glance/OrderInsight';
import RevenueSnapshot from './at_a_glance/RevenueSnapshot';
import RevenueInsight from './at_a_glance/RevenueInsight';
import OccupancySnapshot from './at_a_glance/OccupancySnapshot';
import OccupancyInsight from './at_a_glance/OccupancyInsight';
import GuestsSnapshot from './at_a_glance/GuestsSnapshot';
import GuestsInsight from './at_a_glance/GuestsInsight';

const cardTransition = { duration: 0.4, ease: 'easeInOut' };

const Quadrant = ({ isInsightMode, snapshotData, insightData, SnapshotComponent, InsightComponent, linkTo }) => {
    const content = (
        <motion.div layout transition={cardTransition} className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden h-40">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={isInsightMode ? 'insight' : 'snapshot'}
                    initial={{ opacity: 0, x: isInsightMode ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isInsightMode ? -20 : 20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                >
                    {isInsightMode ? <InsightComponent data={insightData} /> : <SnapshotComponent data={snapshotData} />}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );

    return linkTo ? <Link to={linkTo} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl">{content}</Link> : content;
};


const AtAGlanceCard = () => {
    const [isInsightMode, setInsightMode] = useState(false);
    const summaryData = useCommandBarSummary();

    // --- NEW: Robustness check. If data isn't ready, show skeleton. ---
    if (!summaryData) {
        return <AtAGlanceCardSkeleton />;
    }

    const { snapshot_mode = {}, insight_mode = {} } = summaryData;
    const {
        live_orders = {},
        revenue_today = {},
        occupancy = {},
        guests_today = {}
    } = snapshot_mode;
    const {
        order_funnel = {},
        revenue_engine = {},
        venue_hotspots = {},
        guest_flow = {}
    } = insight_mode;

    return (
        <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 min-h-[500px]">
            <header className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                    Mission Control
                </h2>
                <Toggle isOn={isInsightMode} onToggle={() => setInsightMode(!isInsightMode)} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Quadrant
                    isInsightMode={isInsightMode}
                    snapshotData={live_orders}
                    insightData={order_funnel}
                    SnapshotComponent={OrderSnapshot}
                    InsightComponent={OrderInsight}
                    linkTo="/dashboard/business/orders"
                />
                <Quadrant
                    isInsightMode={isInsightMode}
                    snapshotData={revenue_today}
                    insightData={revenue_engine}
                    SnapshotComponent={RevenueSnapshot}
                    InsightComponent={RevenueInsight}
                    linkTo="/dashboard/business/analytics"
                />
                <Quadrant
                    isInsightMode={isInsightMode}
                    snapshotData={occupancy}
                    insightData={venue_hotspots}
                    SnapshotComponent={OccupancySnapshot}
                    InsightComponent={OccupancyInsight}
                    linkTo="/dashboard/business/venue"
                />
                <Quadrant
                    isInsightMode={isInsightMode}
                    snapshotData={guests_today}
                    insightData={guest_flow}
                    SnapshotComponent={GuestsSnapshot}
                    InsightComponent={GuestsInsight}
                    linkTo="/dashboard/business/analytics"
                />
            </div>
        </div>
    );
};

export default AtAGlanceCard;