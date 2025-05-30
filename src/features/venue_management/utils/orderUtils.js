// These defaults are for the LiveOrderDashboard's initial state if no layout is saved
// and also historically for useLayoutData.js.
// useLayoutData.js will now primarily use constants from layoutConstants.jsx for its defaults.
export const DEFAULT_LIVE_VIEW_GRID_ROWS = 10; // Remains as a fallback reference if needed elsewhere
export const DEFAULT_LIVE_VIEW_GRID_COLS = 15; // Remains as a fallback reference if needed elsewhere
export const VENDOR_VIEW_GRID_TRACK_SIZE = '1fr'; // Used for styling the grid

/**
 * @deprecated initialTableLayoutData is mostly deprecated for initial layout structure
 * in favor of API-driven data or defaults from layoutConstants.jsx used by useLayoutData.
 * It primarily serves as a fallback structure or for non-editor contexts.
 */
export const initialTableLayoutData = {
    tables: [], // MODIFIED: Should be empty. Primary data comes from API or localStorage.
    gridDimensions: {
        rows: DEFAULT_LIVE_VIEW_GRID_ROWS,
        cols: DEFAULT_LIVE_VIEW_GRID_COLS,
        // gridSubdivision is usually sourced from layoutConstants.js by useLayoutData
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