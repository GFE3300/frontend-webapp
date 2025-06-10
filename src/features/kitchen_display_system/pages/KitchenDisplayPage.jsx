import React, { useState, useMemo } from 'react';
import KitchenHeader from '../components/KitchenHeader';
import OrderCard from '../components/OrderCard';
import useKitchenOrders from '../hooks/useKitchenOrders';
import Icon from '../../../components/common/Icon';
import { KITCHEN_VIEW_MODE } from '../constants/kitchenConstants';

import { scriptLines_kitchenDisplaySystem } from '../utils/script_lines';
import i18n from '../../../i18n';

const sl = scriptLines_kitchenDisplaySystem.page;

const KDS_PAGE_STYLE = {
    container: "h-screen w-full flex flex-col bg-neutral-100 dark:bg-neutral-900 antialiased font-montserrat",
    mainContent: "flex-1 overflow-y-auto p-4 md:p-6",
    orderGrid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6",
    groupedTableContainer: "mb-8 p-4 bg-white dark:bg-neutral-800/50 rounded-xl shadow-md",
    groupedTableHeader: "font-semibold text-lg text-neutral-700 dark:text-neutral-200 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700",
    groupedOrderGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
    loadingContainer: "flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400",
    loadingIcon: "w-12 h-12 text-rose-500 dark:text-rose-400 animate-spin mb-4",
    loadingText: "text-lg font-semibold",
    noOrdersIcon: "w-16 h-16 text-neutral-400 dark:text-neutral-500 mb-4",
};


const KitchenDisplayPage = ({ onUpdateStatus }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState(KITCHEN_VIEW_MODE.INDIVIDUAL);

    const { data: orders = [], isLoading, error } = useKitchenOrders();

    const handleUpdateAction = (payload) => {
        onUpdateStatus(payload);
    };

    const toggleGroupByTable = () => {
        setViewMode(prevMode =>
            prevMode === KITCHEN_VIEW_MODE.INDIVIDUAL ? KITCHEN_VIEW_MODE.GROUP_BY_TABLE : KITCHEN_VIEW_MODE.INDIVIDUAL
        );
    };

    const processedOrders = useMemo(() => {
        if (activeFilter === 'all') {
            return orders;
        }
        const statusMap = {
            new: ['PENDING_CONFIRMATION', 'CONFIRMED'],
            preparing: ['PREPARING'],
            ready: ['READY_FOR_PICKUP'],
            served: ['SERVED'],
        };
        const targetStatuses = statusMap[activeFilter] || [];
        return orders.filter(order => targetStatuses.includes(order.status));
    }, [orders, activeFilter]);

    const orderCounts = useMemo(() => ({
        all: orders.length,
        new: orders.filter(o => ['PENDING_CONFIRMATION', 'CONFIRMED'].includes(o.status)).length,
        preparing: orders.filter(o => o.status === 'PREPARING').length,
        ready: orders.filter(o => o.status === 'READY_FOR_PICKUP').length,
        served: orders.filter(o => o.status === 'SERVED').length,
        paid: 0, // 'paid' is a payment status, not an order status. Not tracked here.
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
                orderCounts={orderCounts} // Pass calculated counts
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

                {viewMode === KITCHEN_VIEW_MODE.INDIVIDUAL && processedOrders.length > 0 && (
                    <div className={KDS_PAGE_STYLE.orderGrid}>
                        {processedOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateAction}
                            />
                        ))}
                    </div>
                )}

                {viewMode === KITCHEN_VIEW_MODE.GROUP_BY_TABLE && groupedByTableOrders && Object.keys(groupedByTableOrders).length > 0 && (
                    <div>
                        {Object.entries(groupedByTableOrders)
                            .sort(([tableA], [tableB]) => String(tableA).localeCompare(String(tableB), undefined, { numeric: true }))
                            .map(([tableNumber, tableOrders]) => (
                                <div key={tableNumber} className={KDS_PAGE_STYLE.groupedTableContainer}>
                                    <h2 className={KDS_PAGE_STYLE.groupedTableHeader}>
                                        {tableNumber === 'Takeout/Pickup' ? (sl.takeoutPickup || 'Takeout / Pickup') : i18n.t(sl.tableLabel, { tableNumber })}
                                        <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">{i18n.t(sl.orderCount, { count: tableOrders.length })}</span>
                                    </h2>
                                    <div className={KDS_PAGE_STYLE.groupedOrderGrid}>
                                        {tableOrders.map(order => (
                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                onUpdateStatus={handleUpdateAction}
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