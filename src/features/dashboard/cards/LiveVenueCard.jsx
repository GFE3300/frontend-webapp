import React from 'react';
import { Link } from 'react-router-dom';
import { useLiveOrders } from '../../live_orders_view/hooks/useLiveOrders';
import VenueLayoutDisplay from '../../live_orders_view/components/VenueLayoutDisplay';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';

const LiveVenueCard = () => {
    // This hook suspends, so it will be wrapped in <Suspense> in OverviewPage
    const { tablesWithStatus, venueLayout } = useLiveOrders();

    return (
        <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                    The Watchtower
                </h2>
                <Button
                    as={Link}
                    to="/dashboard/business/orders"
                    variant="ghost"
                    size="sm"
                    className="!px-2 !py-1" // More compact button
                >
                    Full View
                    <Icon name="arrow_forward" className="ml-1.5 h-4 w-4" />
                </Button>
            </div>
            <div className="flex-grow bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-2 overflow-hidden">
                {venueLayout && venueLayout.items ? (
                    <VenueLayoutDisplay
                        layout={venueLayout}
                        tablesWithStatus={tablesWithStatus}
                        isReadOnly={true} // IMPORTANT: Pass prop to prevent interactions
                        simplified={true} // Pass prop for simplified rendering (no order details)
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 dark:text-neutral-400">
                        <Icon name="map" className="h-10 w-10 text-neutral-400 mb-2" />
                        <p className="font-semibold">No Venue Layout Found</p>
                        <p className="text-xs mt-1">
                            Go to the <Link to="/dashboard/business/venue" className="text-primary-500 hover:underline">Venue Designer</Link> to create one.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveVenueCard;