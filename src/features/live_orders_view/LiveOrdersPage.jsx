import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Hooks and services
import { useLiveOrders } from './hooks/useLiveOrders';
import { useLayoutData } from './hooks/useLayoutData';
import { useToast } from '../../contexts/ToastContext';
import { queryKeys } from '../../services/queryKeys';
import apiService from '../../services/api';

// Components
import Spinner from '../../components/common/Spinner';
import Icon from '../../components/common/Icon';
import VenueLayoutDisplay from './components/VenueLayoutDisplay';
import TableOrdersModal from './components/TableOrdersModal'; // This component will be created next.

// Text content
import { scriptLines_liveOrders } from './utils/script_lines';

/**
 * Renders the main page for the Live Orders Dashboard.
 * It fetches live data, handles loading/error states, and manages table selection and order updates.
 */
const LiveOrdersPage = () => {
    // --- Data Fetching ---
    const { data: liveTableData, isLoading: isLoadingLive, isError: isErrorLive, error: errorLive } = useLiveOrders();
    const { data: layoutData, isLoading: isLoadingLayout, isError: isErrorLayout, error: errorLayout } = useLayoutData();

    // --- State Management ---
    const [selectedTableId, setSelectedTableId] = useState(null);
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    // --- Mutation for Updating Order Status ---
    const orderUpdateMutation = useMutation({
        mutationFn: ({ orderId, status }) => apiService.updateOrderStatus(orderId, { status }),
        onSuccess: (data, variables) => {
            addToast(`Order ${variables.orderId.substring(0, 8)} status updated successfully!`, 'success');
            // Invalidate the query to trigger a refetch of the live data
            queryClient.invalidateQueries({ queryKey: queryKeys.liveOrdersView });
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || 'Failed to update order status.';
            addToast(errorMessage, 'error');
        },
    });

    // --- Event Handlers ---
    const handleUpdateOrderStatus = (orderId, newStatus) => {
        orderUpdateMutation.mutate({ orderId, status: newStatus });
    };

    const handleSelectTable = (layoutItemId) => {
        setSelectedTableId(layoutItemId);
    };

    const handleCloseModal = () => {
        setSelectedTableId(null);
    };

    // --- Derived State ---
    // From the live data array, find the full data object for the selected table.
    // This derived state is clean and prevents duplicating data in state.
    const selectedTableData = selectedTableId
        ? (liveTableData || []).find(table => table.layout_item_id === selectedTableId)
        : null;

    // --- Content Rendering Logic ---
    const renderContent = () => {
        if (isLoadingLayout || isLoadingLive) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Spinner size="lg" />
                    <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">
                        {isLoadingLayout ? "Loading venue layout..." : scriptLines_liveOrders.loadingText}
                    </span>
                </div>
            );
        }

        if (isErrorLayout || isErrorLive) {
            const error = isErrorLayout ? errorLayout : errorLive;
            const title = isErrorLayout ? "Could not load venue layout" : scriptLines_liveOrders.errorTitle;
            const body = isErrorLayout ? "There was a problem fetching the static venue design." : scriptLines_liveOrders.errorBody;

            return (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Icon name="error_outline" className="w-16 h-16 text-red-400" />
                    <h2 className="mt-4 text-xl font-bold text-red-700 dark:text-red-400">{title}</h2>
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
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-gray-100 dark:bg-gray-900">
            <header className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {scriptLines_liveOrders.pageTitle}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    A real-time overview of your venue's table activity.
                </p>
            </header>

            <main className="flex-grow h-full overflow-hidden relative">
                {renderContent()}
            </main>

            {/* Modal for Phase 2, rendered conditionally */}
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

export default LiveOrdersPage;