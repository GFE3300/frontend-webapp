// src/features/kitchen_display_system/pages/KitchenDisplayPage.jsx
import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // NEW: Import mutation hooks
import KitchenHeader from '../components/KitchenHeader';
import OrderCard from '../components/OrderCard';
import useKitchenOrders from '../hooks/useKitchenOrders';
import Icon from '../../../components/common/Icon';
import { KITCHEN_VIEW_MODE } from '../constants/kitchenConstants';
import OrderDetailModal from '../components/OrderDetailModal';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext'; // NEW: For error feedback
import kitchenOrderService from '../services/kitchenOrderService'; // NEW: Import the service
import { queryKeys } from '../../../services/queryKeys'; // NEW: Import query keys

import { scriptLines_kitchenDisplaySystem } from '../utils/script_lines';
import i18n from '../../../i18n';

const sl = scriptLines_kitchenDisplaySystem.page;

const KDS_PAGE_STYLE = {
    container: "h-screen w-full flex flex-col bg-neutral-100 dark:bg-neutral-900 antialiased font-montserrat",
    mainContent: "flex-1 overflow-y-auto p-4 md:p-6",
    orderGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6",
    groupedTableContainer: "mb-8 p-4 bg-white dark:bg-neutral-800/50 rounded-xl shadow-md",
    groupedTableHeader: "font-semibold text-lg text-neutral-700 dark:text-neutral-200 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700",
    groupedOrderGrid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
    loadingContainer: "flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400",
    loadingIcon: "w-12 h-12 text-rose-500 dark:text-rose-400 animate-spin mb-4",
    loadingText: "text-lg font-semibold",
    noOrdersIcon: "w-16 h-16 text-neutral-400 dark:text-neutral-500 mb-4",
};

// MODIFIED: Removed onUpdateStatus prop. This component is now self-contained.
const KitchenDisplayPage = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState(KITCHEN_VIEW_MODE.INDIVIDUAL);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const queryKey = queryKeys.kitchenActiveOrders(activeFilter); // Define queryKey for reuse

    const { data: orders = [], isLoading, error } = useKitchenOrders({ status: activeFilter !== 'all' ? activeFilter : undefined });

    // --- NEW: Optimistic Update Mutation ---
    const updateOrderStatusMutation = useMutation({
        mutationFn: ({ orderId, status }) => kitchenOrderService.updateOrderStatus(orderId, { status }),
        onMutate: async ({ orderId, status: newStatus }) => {
            // 1. Cancel any outgoing refetches to prevent them from overwriting our optimistic update.
            await queryClient.cancelQueries({ queryKey });

            // 2. Snapshot the previous value.
            const previousOrders = queryClient.getQueryData(queryKey);

            // 3. Optimistically update to the new value.
            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) return [];
                return oldData.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus, last_updated_timestamp: new Date().toISOString() }
                        : order
                );
            });
            
            // 4. Return a context object with the snapshotted value.
            return { previousOrders };
        },
        onError: (err, variables, context) => {
            // 5. If the mutation fails, roll back to the previous state.
            addToast('Failed to update order. Please try again.', 'error');
            if (context?.previousOrders) {
                queryClient.setQueryData(queryKey, context.previousOrders);
            }
        },
        onSettled: () => {
            // 6. Always refetch after error or success to ensure data consistency.
            queryClient.invalidateQueries({ queryKey });
        },
    });


    // MODIFIED: This now triggers the mutation.
    const handleUpdateAction = (payload) => {
        updateOrderStatusMutation.mutate(payload);
        if (selectedOrder && selectedOrder.id === payload.orderId) {
            setSelectedOrder(null);
        }
    };

    const handleSelectOrder = (order) => setSelectedOrder(order);
    const handleCloseModal = () => setSelectedOrder(null);

    const toggleGroupByTable = () => {
        setViewMode(prevMode =>
            prevMode === KITCHEN_VIEW_MODE.INDIVIDUAL ? KITCHEN_VIEW_MODE.GROUP_BY_TABLE : KITCHEN_VIEW_MODE.INDIVIDUAL
        );
    };

    const processedOrders = useMemo(() => {
        if (activeFilter === 'all') return orders;
        const statusMap = {
            pending: ['PENDING_CONFIRMATION'],
            confirmed: ['CONFIRMED'],
            preparing: ['PREPARING'],
            served: ['SERVED', 'READY_FOR_PICKUP'], // Group 'Ready' into 'Served' for filtering
        };
        const targetStatuses = statusMap[activeFilter] || [];
        return orders.filter(order => targetStatuses.includes(order.status));
    }, [orders, activeFilter]);

    const orderCounts = useMemo(() => ({
        all: orders.length,
        pending: orders.filter(o => o.status === 'PENDING_CONFIRMATION').length,
        confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
        preparing: orders.filter(o => o.status === 'PREPARING').length,
        served: orders.filter(o => ['SERVED', 'READY_FOR_PICKUP'].includes(o.status)).length,
    }), [orders]);

    const groupedByTableOrders = useMemo(() => {
        if (viewMode !== KITCHEN_VIEW_MODE.GROUP_BY_TABLE) return null;
        return processedOrders.reduce((acc, order) => {
            const tableKey = order.table_number || 'Takeout/Pickup';
            if (!acc[tableKey]) acc[tableKey] = [];
            acc[tableKey].push(order);
            return acc;
        }, {});
    }, [processedOrders, viewMode]);

    if (isLoading && !orders.length) {
        return (
            <div className={KDS_PAGE_STYLE.container}>
                <div className={KDS_PAGE_STYLE.loadingContainer}>
                    <Icon name="restaurant_menu" className={KDS_PAGE_STYLE.loadingIcon} />
                    <p className={KDS_PAGE_STYLE.loadingText}>{sl.loadingOrders}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={KDS_PAGE_STYLE.container}>
            <KitchenHeader
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                orderCounts={orderCounts}
                groupByTable={viewMode === KITCHEN_VIEW_MODE.GROUP_BY_TABLE}
                onToggleGroupByTable={toggleGroupByTable}
            />
            <main className={KDS_PAGE_STYLE.mainContent}>
                {/* ... (rest of the rendering logic is the same) ... */}
                {viewMode === KITCHEN_VIEW_MODE.INDIVIDUAL && processedOrders.length > 0 && (
                     <div className={KDS_PAGE_STYLE.orderGrid}>
                         {processedOrders.map(order => (
                             <OrderCard
                                 key={order.id}
                                 order={order}
                                 onUpdateStatus={handleUpdateAction}
                                 onSelectOrder={() => handleSelectOrder(order)}
                             />
                         ))}
                     </div>
                 )}
            </main>
            
            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        onClose={handleCloseModal}
                        onUpdateStatus={handleUpdateAction}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default KitchenDisplayPage;