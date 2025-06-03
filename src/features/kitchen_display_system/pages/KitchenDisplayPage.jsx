import React, { useState, useEffect, useMemo } from 'react';
import KitchenHeader from '../components/KitchenHeader';
import OrderCard from '../components/OrderCard';
import useKitchenOrders from '../hooks/useKitchenOrders';
import Icon from '../../../components/common/Icon';
import { KITCHEN_VIEW_MODE, OrderStatus} from '../constants/kitchenConstants';


import slRaw from '../../venue_management/utils/script_lines.js';
const sl = slRaw.kitchenDisplaySystem;
const slCommon = slRaw;

const KDS_PAGE_STYLE = {
    container: "h-screen w-full flex flex-col bg-neutral-100 dark:bg-neutral-900 antialiased font-montserrat",
    mainContent: "flex-1 overflow-y-auto p-4 md:p-6",
    orderGrid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6",
    groupedTableContainer: "mb-8 p-4 bg-white dark:bg-neutral-800/50 rounded-xl shadow-md",
    groupedTableHeader: "font-semibold text-lg text-neutral-700 dark:text-neutral-200 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700",
    groupedOrderGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", // Grid for orders within a table group
    loadingContainer: "flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400",
    loadingIcon: "w-12 h-12 text-rose-500 dark:text-rose-400 animate-spin mb-4",
    loadingText: "text-lg font-semibold",
    noOrdersIcon: "w-16 h-16 text-neutral-400 dark:text-neutral-500 mb-4",
};

const KitchenDisplayPage = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState(KITCHEN_VIEW_MODE.INDIVIDUAL);
    const { orders, isLoading, error, updateOrderStatus } = useKitchenOrders();

    const handleUpdateStatus = async (orderId, newStatus) => {
        const success = await updateOrderStatus(orderId, newStatus);
        if (success) {
            console.log(`Order ${orderId} status updated to ${newStatus}`);
        } else {
            console.error(`Failed to update order ${orderId} status`);
        }
    };

    const toggleGroupByTable = () => {
        setViewMode(prevMode =>
            prevMode === KITCHEN_VIEW_MODE.INDIVIDUAL ? KITCHEN_VIEW_MODE.GROUP_BY_TABLE : KITCHEN_VIEW_MODE.INDIVIDUAL
        );
    };

    const processedOrders = useMemo(() => {
        let tempOrders = [...orders];

        // Apply status filter
        if (activeFilter !== 'all') {
            tempOrders = tempOrders.filter(order => order.status === activeFilter);
        }

        // Sort: Newest first generally, but can be more complex
        tempOrders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
        
        return tempOrders;
    }, [orders, activeFilter]);


    const groupedByTableOrders = useMemo(() => {
        if (viewMode !== KITCHEN_VIEW_MODE.GROUP_BY_TABLE) {
            return null;
        }
        return processedOrders.reduce((acc, order) => {
            const tableKey = order.tableNumber;
            if (!acc[tableKey]) {
                acc[tableKey] = [];
            }
            acc[tableKey].push(order);
            return acc;
        }, {});
    }, [processedOrders, viewMode]);


    if (isLoading && !orders.length) {
        return (
            <div className={KDS_PAGE_STYLE.container}>
                <div className={KDS_PAGE_STYLE.loadingContainer}>
                    <Icon name="restaurant_menu" className={KDS_PAGE_STYLE.loadingIcon} />
                    <p className={KDS_PAGE_STYLE.loadingText}>{sl.loadingOrders || "Loading Orders..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={KDS_PAGE_STYLE.container}>
            <KitchenHeader
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                orderCounts={{
                    all: orders.length, // Total active orders before filtering
                    new: orders.filter(o => o.status === 'new').length,
                    preparing: orders.filter(o => o.status === 'preparing').length,
                    ready: orders.filter(o => o.status === 'ready').length,
                }}
                groupByTable={viewMode === KITCHEN_VIEW_MODE.GROUP_BY_TABLE}
                onToggleGroupByTable={toggleGroupByTable}
            />
            <main className={KDS_PAGE_STYLE.mainContent}>
                {error && (
                    <div className="text-center text-red-500 dark:text-red-400 p-4 bg-red-100 dark:bg-red-900/30 rounded-md">
                        {sl.errorFetchingOrders || "Error fetching orders."}
                    </div>
                )}
                {!isLoading && !error && processedOrders.length === 0 && (
                     <div className={KDS_PAGE_STYLE.loadingContainer}>
                        <Icon name="ramen_dining" className={KDS_PAGE_STYLE.noOrdersIcon} />
                        <p className={`${KDS_PAGE_STYLE.loadingText} mb-2`}>{sl.noOrdersTitle || "No Active Orders"}</p>
                        <p className="text-sm">{sl.noOrdersMessage || "New orders will appear here."}</p>
                    </div>
                )}

                {/* Individual View */}
                {viewMode === KITCHEN_VIEW_MODE.INDIVIDUAL && processedOrders.length > 0 && (
                    <div className={KDS_PAGE_STYLE.orderGrid}>
                        {processedOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))}
                    </div>
                )}

                {/* Grouped by Table View */}
                {viewMode === KITCHEN_VIEW_MODE.GROUP_BY_TABLE && groupedByTableOrders && Object.keys(groupedByTableOrders).length > 0 && (
                    <div>
                        {Object.entries(groupedByTableOrders)
                            // Optional: Sort tables by table number if they are numeric/alphanumeric
                            .sort(([tableA], [tableB]) => String(tableA).localeCompare(String(tableB), undefined, { numeric: true }))
                            .map(([tableNumber, tableOrders]) => (
                            <div key={tableNumber} className={KDS_PAGE_STYLE.groupedTableContainer}>
                                <h2 className={KDS_PAGE_STYLE.groupedTableHeader}>
                                    {sl.orderCard.tableLabel ? sl.orderCard.tableLabel.replace('{tableNumber}', tableNumber) : `Table ${tableNumber}`}
                                    <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">({tableOrders.length} order{tableOrders.length > 1 ? 's' : ''})</span>
                                </h2>
                                <div className={KDS_PAGE_STYLE.groupedOrderGrid}>
                                    {tableOrders.map(order => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onUpdateStatus={handleUpdateStatus}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default KitchenDisplayPage;