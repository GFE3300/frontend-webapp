// FILE: src/features/dashboard/pages/OverviewPage.jsx
// ACTION: MODIFIED

import React, { Suspense } from 'react';

// New Card Components
import AtAGlanceCard from '../cards/AtAGlanceCard';
import ActionItemsCard from '../cards/ActionItemsCard';
import ProductMoversCard from '../cards/ProductMoversCard';
import LiveVenueCard from '../cards/LiveVenueCard';

// Skeleton Loaders for Suspense Fallback
import AtAGlanceCardSkeleton from '../cards/skeletons/AtAGlanceCardSkeleton';
import ActionItemsCardSkeleton from '../cards/skeletons/ActionItemsCardSkeleton';
import LiveVenueCardSkeleton from '../cards/skeletons/LiveVenueCardSkeleton';

// Existing Advanced Card Components
import RevenueCard from '../../data_cards/revenue_card';
import HeatmapCard from '../../data_cards/heatmap';

const OverviewPage = () => {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header Section: At a Glance Metrics */}
            <Suspense fallback={<AtAGlanceCardSkeleton />}>
                <AtAGlanceCard />
            </Suspense>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Row 1 in the main grid (Row 2 of the page) */}
                <div className="lg:col-span-1 h-full">
                    <Suspense fallback={<ActionItemsCardSkeleton />}>
                        <HeatmapCard />
                    </Suspense>
                </div>
                <div className="lg:col-span-2 h-full">
                    {/* RevenueCard handles its own internal loading state */}
                    <RevenueCard />
                </div>

                {/* Row 2 in the main grid (Row 3 of the page) */}
                <div className="lg:col-span-1 h-full">
                    <Suspense fallback={<LiveVenueCardSkeleton />}>
                        <LiveVenueCard />
                    </Suspense>
                </div>
                <div className="lg:col-span-2 h-full">
                    {/* ProductMoversCard has its own internal Suspense for content */}
                    <ProductMoversCard />
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;