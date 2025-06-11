// src/features/dashboard/pages/OverviewPage.jsx
import React, { Suspense } from 'react';
import { useCommandBarSummary } from '../hooks/useOverviewData';

// Skeletons
import CommandBarSkeleton from '../cards/skeletons/CommandBarSkeleton';
import LiveVenueCardSkeleton from '../cards/skeletons/LiveVenueCardSkeleton';
import ActionItemsCardSkeleton from '../cards/skeletons/ActionItemsCardSkeleton';
// --- ADD THIS ---
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


const CommandBar = () => {
    // ... (no changes here)
    const { data } = useCommandBarSummary();
    if (!data) {
        return <CommandBarSkeleton />;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LiveOrdersCard data={data.snapshot_mode.live_orders} insightData={data.insight_mode.order_funnel} />
            <DailyRevenueCard data={data.snapshot_mode.revenue_today} insightData={data.insight_mode.revenue_engine} />
            <OccupancyCard data={data.snapshot_mode.occupancy} insightData={data.insight_mode.venue_hotspots} />
            <GuestsCard data={data.snapshot_mode.guests_today} insightData={data.insight_mode.guest_flow} />
        </div>
    );
};

const OverviewPage = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-neutral-100 dark:bg-neutral-900 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        A real-time pulse of your business operations.
                    </p>
                </div>
            </div>

            <Suspense fallback={<CommandBarSkeleton />}>
                <CommandBar />
            </Suspense>

            {/* Action Zone */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-1">
                    <Suspense fallback={<HeatmapCardSkeleton />}>
                        <HeatmapCard />
                    </Suspense>
                </div>
                <div className="lg:col-span-2">
                    <Suspense fallback={<RevenueCardSkeleton />}>
                        <RevenueCard />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;