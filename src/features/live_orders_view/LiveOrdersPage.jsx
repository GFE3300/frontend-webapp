import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Hooks and services
import { useLiveOrders } from './hooks/useLiveOrders';
import { useLayoutData } from './hooks/useLayoutData';
import { useKitchenOrders } from '../kitchen_display_system/hooks/useKitchenOrders';
import { useToast } from '../../contexts/ToastContext';
import { queryKeys } from '../../services/queryKeys';
import apiService from '../../services/api';
import { useBusinessCurrency } from '../../hooks/useCurrency';
import { formatCurrency } from '../../utils/formatCurrency';

// Components
import Spinner from '../../components/common/Spinner';
import Icon from '../../components/common/Icon';
import StatCard from '../../components/common/StatCard';
import SegmentedControl from '../../components/common/SegmentedControl';
import VenueLayoutDisplay from './components/VenueLayoutDisplay';
import TableOrdersModal from './components/TableOrdersModal';
import KitchenDisplayPage from '../kitchen_display_system/pages/KitchenDisplayPage';

// Text content
import { scriptLines_liveOrders } from './utils/script_lines';
import i18n from '../../i18n';

/**
 * Renders the main page for the Orders Dashboard, switching between Venue and Kitchen views.
 * It fetches live data, handles loading/error states, and manages table selection and order updates.
 */
const OrdersDashboardPage = () => {
    // --- State Management ---
    const [viewMode, setViewMode] = useState('venue'); // 'venue' or 'kitchen'
    const [selectedTableId, setSelectedTableId] = useState(null);
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const { currency } = useBusinessCurrency();

    // --- Data Fetching ---
    const { data: liveTableData, isLoading: isLoadingLive, isError: isErrorLive, error: errorLive } = useLiveOrders({ enabled: viewMode === 'venue' });
    const { data: layoutData, isLoading: isLoadingLayout, isError: isErrorLayout, error: errorLayout } = useLayoutData({ enabled: viewMode === 'venue' });
    const { data: kitchenOrders, isLoading: isLoadingKitchen, isError: isErrorKitchen, error: errorKitchen } = useKitchenOrders({ enabled: viewMode === 'kitchen' });

    // --- Mutation for updating orders ---
    const orderUpdateMutation = useMutation({
        mutationFn: (payload) => apiService.updateOrderStatus(payload.orderId, payload),
        onSuccess: (data, variables) => {
            addToast(`Order ${variables.orderId.substring(0, 8)} updated successfully!`, 'success');
            // Invalidate queries to refetch live data immediately after an update
            queryClient.invalidateQueries({ queryKey: queryKeys.liveOrdersView });
            queryClient.invalidateQueries({ queryKey: queryKeys.kitchenActiveOrders });
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || 'Failed to update order status.';
            addToast(errorMessage, 'error');
        },
    });

    // --- Event Handlers ---
    const handleUpdateOrderStatus = (payload) => {
        orderUpdateMutation.mutate(payload);
    };

    const handleSelectTable = (layoutItemId) => {
        setSelectedTableId(layoutItemId);
    };

    const handleCloseModal = () => {
        setSelectedTableId(null);
    };

    // --- Memoized calculations for Commander's View stats ---
    const commanderStats = useMemo(() => {
        if (!liveTableData) {
            return { activeTables: 0, totalGuests: 0, pendingOrders: 0, totalSales: 0 };
        }
        let totalSales = 0;
        let pendingOrders = 0;
        const activeTables = liveTableData.filter(table => table.aggregate_status !== 'IDLE');

        activeTables.forEach(table => {
            table.orders.forEach(order => {
                totalSales += parseFloat(order.total_amount_payable || 0);
                if (order.status === 'PENDING_CONFIRMATION') {
                    pendingOrders++;
                }
            });
        });

        const totalGuests = activeTables.reduce((sum, table) => sum + (table.total_guests || 0), 0);

        return {
            activeTables: activeTables.length,
            totalGuests,
            pendingOrders,
            totalSales,
        };
    }, [liveTableData]);

    const selectedTableData = useMemo(() => {
        return selectedTableId
            ? (liveTableData || []).find(table => table.layout_item_id === selectedTableId)
            : null;
    }, [selectedTableId, liveTableData]);

    // --- Content Rendering Logic ---
    const renderContent = () => {
        if (viewMode === 'venue') {
            if (isLoadingLayout || isLoadingLive) {
                return (
                    <div className="flex items-center justify-center h-full">
                        <Spinner size="lg" />
                        <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">
                            {isLoadingLayout ? i18n.t(scriptLines_liveOrders.layoutErrorTitle) : i18n.t(scriptLines_liveOrders.loadingText)}
                        </span>
                    </div>
                );
            }

            if (isErrorLayout || isErrorLive) {
                const error = isErrorLayout ? errorLayout : errorLive;
                const title = isErrorLayout ? i18n.t(scriptLines_liveOrders.layoutErrorTitle) : i18n.t(scriptLines_liveOrders.errorTitle);
                const body = isErrorLayout ? i18n.t(scriptLines_liveOrders.layoutErrorBody) : i18n.t(scriptLines_liveOrders.errorBody);

                return (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <Icon name="error_outline" style={{ fontSize: '4rem' }} className="text-red-400" />
                        <h2 className="mt-4 text-xl font-bold font-montserrat text-red-700 dark:text-red-400">{title}</h2>
                        <p className="mt-2 text-red-600 dark:text-red-300">{body}</p>
                        {error && (
                            <pre className="mt-4 text-xs text-left text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded w-full max-w-md overflow-auto">
                                {error.message}
                            </pre>
                        )}
                    </div>
                );
            }

            const liveDataMap = (liveTableData || []).reduce((acc, table) => {
                acc[table.layout_item_id] = table;
                return acc;
            }, {});

            return (
                <VenueLayoutDisplay
                    layoutData={layoutData}
                    liveDataMap={liveDataMap}
                    onSelectTable={handleSelectTable}
                />
            );
        }

        if (viewMode === 'kitchen') {
            if (isLoadingKitchen && !kitchenOrders) { // Show initial loader
                return (
                    <div className="flex items-center justify-center h-full">
                        <Spinner size="lg" />
                        <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Loading Kitchen View...</span>
                    </div>
                );
            }

            if (isErrorKitchen) {
                 return (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <Icon name="error_outline" style={{ fontSize: '4rem' }} className="text-red-400" />
                        <h2 className="mt-4 text-xl font-bold font-montserrat text-red-700 dark:text-red-400">Error Loading Kitchen Data</h2>
                        <p className="mt-2 text-red-600 dark:text-red-300">Could not fetch the active orders for the kitchen.</p>
                        {errorKitchen && (
                            <pre className="mt-4 text-xs text-left text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded w-full max-w-md overflow-auto">
                                {errorKitchen.message}
                            </pre>
                        )}
                    </div>
                );
            }

            return <KitchenDisplayPage
               orders={kitchenOrders || []}
               isLoading={isLoadingKitchen} // Pass loading state for refetches
               error={errorKitchen}
               onUpdateStatus={(orderId, newStatus) => handleUpdateOrderStatus({ orderId, status: newStatus })}
            />;
        }

        return null;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-gray-100 dark:bg-neutral-900 font-inter">
            {/* Header */}
            <header className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                <h1 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white">
                    {i18n.t(scriptLines_liveOrders.pageTitle)}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {i18n.t(scriptLines_liveOrders.pageSubtitle)}
                </p>
                 <div className="mt-2 mb-4">
                    <SegmentedControl
                        name="orderViewMode"
                        options={[
                            { label: 'Venue View', value: 'venue', icon: 'map' },
                            { label: 'Kitchen View', value: 'kitchen', icon: 'kitchen' }
                        ]}
                        value={viewMode}
                        onChange={(value) => setViewMode(value)}
                    />
                </div>
            </header>

            {/* Commander's View Stats Panel (only for venue view) */}
            {viewMode === 'venue' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <StatCard title={i18n.t(scriptLines_liveOrders.stats.activeTables)} value={commanderStats.activeTables} icon="table_restaurant" />
                    <StatCard title={i18n.t(scriptLines_liveOrders.stats.totalGuests)} value={commanderStats.totalGuests} icon="group" />
                    <StatCard title={i18n.t(scriptLines_liveOrders.stats.pendingOrders)} value={commanderStats.pendingOrders} icon="pending_actions" color="text-yellow-500" />
                    <StatCard title={i18n.t(scriptLines_liveOrders.stats.totalSales)} value={formatCurrency(commanderStats.totalSales, currency)} icon="monitoring" />
                </div>
            )}
            
            <main className="flex-grow h-full overflow-hidden relative rounded-lg shadow-inner bg-gray-200 dark:bg-gray-800">
                {renderContent()}
            </main>

            {/* Modal for viewing a table's orders */}
            {selectedTableData && (
                <TableOrdersModal
                    tableData={selectedTableData}
                    onClose={handleCloseModal}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    isUpdating={orderUpdateMutation.isPending}
                />
            )}
        </div>
    );
};

export default OrdersDashboardPage;