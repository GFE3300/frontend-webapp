export const OrderStatus = {
    NEW: 'new',
    PREPARING: 'preparing',
    READY: 'ready',
    PAID: 'paid', // New status
    SERVED: 'served', // Or COMPLETED
    CANCELLED: 'cancelled',
};

export const KITCHEN_ORDER_FILTERS = [
    { key: 'all', labelKey: 'filterAll' }, // labelKey refers to script_lines.js
    { key: OrderStatus.NEW, labelKey: 'filterNew' },
    { key: OrderStatus.PREPARING, labelKey: 'filterPreparing' },
    { key: OrderStatus.READY, labelKey: 'filterReady' },
    // You might add 'paid' to the filter list if you want a dedicated filter for it
];

export const KITCHEN_VIEW_MODE = {
    INDIVIDUAL: 'individual',
    GROUP_BY_TABLE: 'groupByTable',
};