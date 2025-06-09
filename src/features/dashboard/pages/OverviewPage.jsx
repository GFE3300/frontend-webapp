import React, { useState, Suspense } from 'react';

// Common Components
import Toggle from '../../../components/common/Toggle';

// Page-specific sections and cards
import LiveVenueCard from '../cards/LiveVenueCard';
import ProductMoversCard from '../cards/ProductMoversCard';
import ActionItemsCard from '../cards/ActionItemsCard';
import CommandBarSkeleton from '../cards/skeletons/CommandBarSkeleton';
import LiveOrdersCard from '../cards/command_bar/LiveOrdersCard';
import RevenueCard from '../cards/command_bar/RevenueCard';
import OccupancyCard from '../cards/command_bar/OccupancyCard';
import GuestsCard from '../cards/command_bar/GuestsCard';

// Skeletons for other sections
import LiveVenueCardSkeleton from '../cards/skeletons/LiveVenueCardSkeleton';
import ActionItemsCardSkeleton from '../cards/skeletons/ActionItemsCardSkeleton';

// Hooks
import { useCommandBarSummary } from '../hooks/useOverviewData';

/**
 * A dedicated component to handle the data fetching and rendering of the command bar.
 * This component is wrapped in Suspense, ensuring that it only renders once the
 * `useCommandBarSummary` hook has successfully returned data.
 */
const CommandBarContent = ({ isInsightMode }) => {
    // The useCommandBarSummary hook is likely returning the entire query object.
    const queryResult = useCommandBarSummary();

    // Defensively extract the 'data' property. This handles cases where the hook
    // returns the full query object OR just the data payload.
    const data = queryResult && queryResult.data ? queryResult.data : queryResult;

    // Add a guard clause. Even with Suspense, if the hook is misbehaving,
    // this prevents a crash before the component can be suspended.
    if (!data || !data.snapshot_mode || !data.insight_mode) {
        // This should not be reached if suspense works perfectly, but it's a robust failsafe.
        // Returning null allows React to continue trying to render/suspend without crashing.
        return null;
    }

    // By this point, `data` is guaranteed to have the correct nested structure.
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <LiveOrdersCard
                data={{ live_orders: data.snapshot_mode.live_orders, order_funnel: data.insight_mode.order_funnel }}
                isInsightMode={isInsightMode}
            />
            <RevenueCard
                data={{ revenue_today: data.snapshot_mode.revenue_today, revenue_engine: data.insight_mode.revenue_engine }}
                isInsightMode={isInsightMode}
            />
            <OccupancyCard
                data={{ occupancy: data.snapshot_mode.occupancy, venue_hotspots: data.insight_mode.venue_hotspots }}
                isInsightMode={isInsightMode}
            />
            <GuestsCard
                data={{ guests_today: data.snapshot_mode.guests_today, guest_flow: data.insight_mode.guest_flow }}
                isInsightMode={isInsightMode}
            />
        </div>
    );
};

const OverviewPage = () => {
    const [isInsightMode, setInsightMode] = useState(false);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        A real-time pulse of your business operations.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {isInsightMode ? 'Insight Mode' : 'Snapshot Mode'}
                    </span>
                    <Toggle
                        checked={isInsightMode}
                        onChange={() => setInsightMode(!isInsightMode)}
                    />
                </div>
            </div>

            {/* Command Bar */}
            <Suspense fallback={<CommandBarSkeleton />}>
                <CommandBarContent isInsightMode={isInsightMode} />
            </Suspense>


            {/* Action Zone */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 space-y-6">
                    <Suspense fallback={<LiveVenueCardSkeleton />}>
                        <LiveVenueCard />
                    </Suspense>
                    <Suspense fallback={<div>Loading Movers...</div>}>
                        <ProductMoversCard />
                    </Suspense>
                </div>
                <div className="lg:col-span-1">
                    <Suspense fallback={<ActionItemsCardSkeleton />}>
                        <ActionItemsCard />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;