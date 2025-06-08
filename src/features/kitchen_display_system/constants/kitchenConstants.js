export const OrderStatus = {
    NEW: 'new',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
    PAID: 'paid', // New status
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

export const KITCHEN_ORDER_FILTERS = [
    { key: 'all', labelKey: 'filterAll' }, // labelKey refers to script_lines.js
    { key: OrderStatus.NEW, labelKey: 'filterNew' },
    { key: OrderStatus.PREPARING, labelKey: 'filterPreparing' },
    { key: OrderStatus.READY, labelKey: 'filterReady' },
    { key: OrderStatus.SERVED, labelKey: 'filterServed' },
    { key: OrderStatus.PAID, labelKey: 'filterPaid' }, // New filter for paid orders
];

export const KITCHEN_VIEW_MODE = {
    INDIVIDUAL: 'individual',
    GROUP_BY_TABLE: 'groupByTable',
};