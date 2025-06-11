// src/features/dashboard/pages/OverviewPage.jsx
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useCommandBarSummary } from '../hooks/useOverviewData';

// Skeletons
import CommandBarSkeleton from '../cards/skeletons/CommandBarSkeleton';
import LiveVenueCardSkeleton from '../cards/skeletons/LiveVenueCardSkeleton';
import ActionItemsCardSkeleton from '../cards/skeletons/ActionItemsCardSkeleton';
import RevenueCardSkeleton from '../../data_cards/revenue_card/skeletons/RevenueCardSkeleton';
import HeatmapCardSkeleton from '../../data_cards/heatmap/skeletons/HeatmapCardSkeleton';


// Cards
import RevenueCard from '../../data_cards/revenue_card';
import HeatmapCard from '../../data_cards/heatmap';

// Command Bar Cards
import LiveOrdersCard from '../cards/command_bar/LiveOrdersCard';
import DailyRevenueCard from '../cards/command_bar/RevenueCard';
import OccupancyCard from '../cards/command_bar/OccupancyCard';
import GuestsCard from '../cards/command_bar/GuestsCard';

// Other page sections
import LiveVenueCard from '../cards/LiveVenueCard';
import ProductMoversCard from '../cards/ProductMoversCard';
import ActionItemsCard from '../cards/ActionItemsCard';

// NEW: Import the greeting component
import DashboardGreeting from '../subcomponents/DashboardGreeting';

// Animation variants for the container to orchestrate staggered animations
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15, // Delay between each child animation
        },
    },
};

// Animation variants for each card item
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeInOut",
        },
    },
};


const CommandBar = () => {
    const { data } = useCommandBarSummary();
    if (!data) {
        return <CommandBarSkeleton />;
    }
    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <LiveOrdersCard data={data.snapshot_mode.live_orders} insightData={data.insight_mode.order_funnel} />
            </motion.div>
            <motion.div variants={itemVariants}>
                <DailyRevenueCard data={data.snapshot_mode.revenue_today} insightData={data.insight_mode.revenue_engine} />
            </motion.div>
            <motion.div variants={itemVariants}>
                <OccupancyCard data={data.snapshot_mode.occupancy} insightData={data.insight_mode.venue_hotspots} />
            </motion.div>
            <motion.div variants={itemVariants}>
                <GuestsCard data={data.snapshot_mode.guests_today} insightData={data.insight_mode.guest_flow} />
            </motion.div>
        </motion.div>
    );
};

const OverviewPage = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 h-full">
            {/* The old header is replaced with the new dynamic greeting component */}
            <DashboardGreeting />

            <Suspense fallback={<CommandBarSkeleton />}>
                <CommandBar />
            </Suspense>

            {/* Action Zone */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="lg:col-span-1" variants={itemVariants}>
                    <Suspense fallback={<HeatmapCardSkeleton />}>
                        <HeatmapCard />
                    </Suspense>
                </motion.div>
                <motion.div className="lg:col-span-2" variants={itemVariants}>
                    <Suspense fallback={<RevenueCardSkeleton />}>
                        <RevenueCard />
                    </Suspense>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default OverviewPage;