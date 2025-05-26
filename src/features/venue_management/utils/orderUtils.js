// src/features/venue_management/utils/orderUtils.js

// These defaults are for the LiveOrderDashboard's initial state if no layout is saved
export const DEFAULT_LIVE_VIEW_GRID_ROWS = 10;
export const DEFAULT_LIVE_VIEW_GRID_COLS = 15;
export const VENDOR_VIEW_GRID_TRACK_SIZE = '1fr'; // Used for styling the grid

export const initialTableLayoutData = {
    tables: [
        // Example, should be empty or loaded from localStorage
        // { id: 't1', number: 1, status: 'empty', order: null, gridPosition: { rowStart: 1, colStart: 1 }, size: 'square' },
    ],
    gridDimensions: {
        rows: DEFAULT_LIVE_VIEW_GRID_ROWS,
        cols: DEFAULT_LIVE_VIEW_GRID_COLS,
    },
    kitchenArea: null,
};

export const sampleOrders = [
    { items: [{ name: 'Croissant', qty: 2 }, { name: 'Coffee', qty: 1 }], totalPrice: 12.50, people: 2 },
    { items: [{ name: 'Cake Slice', qty: 1 }, { name: 'Tea', qty: 1 }], totalPrice: 8.00, people: 1 },
    { items: [{ name: 'Muffin', qty: 3 }, { name: 'Latte', qty: 2 }], totalPrice: 18.75, people: 3 },
];

export const generateOrderId = () => `ORD-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

export const timeSince = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + "m ago";
    if (seconds < 10) return "just now";
    return Math.floor(seconds) + "s ago";
};