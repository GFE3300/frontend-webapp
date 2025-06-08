import React, { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { queryKeys } from '../../services/queryKeys';
import apiService from '../../services/api';

import { useLiveOrders } from './hooks/useLiveOrders';
import VenueLayoutDisplay from './components/VenueLayoutDisplay';
import Spinner from '../../components/common/Spinner';
import { scriptLines_liveOrders } from './utils/script_lines';
// This component will be created in the next step.
// For now, its usage is commented out to prevent errors.
// import TableOrdersModal from './components/TableOrdersModal'; 

/**
 * Renders the main page for the Live Orders Dashboard.
 * It fetches live data, handles loading and error states, and manages table selection.
 */
const LiveOrdersPage = () => {
    const { data: liveTableData, isLoading, isError, error } = useLiveOrders();

    // State to keep track of which table layout item is currently selected.
    const [selectedTableId, setSelectedTableId] = useState(null);

    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const orderUpdateMutation = useMutation({
        mutationFn: ({ orderId, status }) => apiService.updateOrderStatus(orderId, { status }),
        onSuccess: () => {
            addToast('Order status updated successfully!', 'success');
            // Invalidate the query to trigger a refetch of the live data
            queryClient.invalidateQueries({ queryKey: queryKeys.liveOrdersView });
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || 'Failed to update order status.';
            addToast(errorMessage, 'error');
        },
    });

    const handleUpdateOrderStatus = (orderId, newStatus) => {
        orderUpdateMutation.mutate({ orderId, status: newStatus });
    };

    /**
     * Sets the selected table ID when a table is clicked in the layout.
     * @param {string} layoutItemId - The UUID of the selected table layout item.
     */
    const handleSelectTable = (layoutItemId) => {
        setSelectedTableId(layoutItemId);
    };

    /**
     * Clears the selected table ID, intended to be used to close the modal.
     */
    const handleCloseModal = () => {
        setSelectedTableId(null);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Spinner size="lg" />
                    <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">
                        {scriptLines_liveOrders.loadingText}
                    </span>
                </div>
            );
        }

        if (isError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
                        {scriptLines_liveOrders.errorTitle}
                    </h2>
                    <p className="mt-2 text-red-600 dark:text-red-300">
                        {scriptLines_liveOrders.errorBody}
                    </p>
                    {error && (
                        <pre className="mt-4 text-xs text-left text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded w-full max-w-md overflow-auto">
                            {error.message}
                        </pre>
                    )}
                </div>
            );
        }

        // The VenueLayoutDisplay expects the live data to be keyed by layout_item_id
        // for efficient lookups. We still do this, but the full array is needed below.
        const liveDataMap = (liveTableData || []).reduce((acc, table) => {
            acc[table.layout_item_id] = table;
            return acc;
        }, {});

        return (
            // Pass the handler function down to the layout display
            <VenueLayoutDisplay
                liveDataMap={liveDataMap}
                onSelectTable={handleSelectTable}
            />
        );
    };

    // From the live data array, find the full data object for the selected table.
    // This derived state is clean and prevents duplicating data in state.
    const selectedTableData = selectedTableId 
        ? (liveTableData || []).find(table => table.layout_item_id === selectedTableId)
        : null;

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
            {/* ... (no change to header) */}
            <main className="flex-grow h-full overflow-hidden relative">
                {renderContent()}
            </main>
            
            {selectedTableData && (
                <TableOrdersModal
                    tableData={selectedTableData}
                    onClose={handleCloseModal}
                    // highlight-start
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    isUpdating={orderUpdateMutation.isPending}
                    // highlight-end
                />
            )}
        </div>
    );
};

export default LiveOrdersPage;