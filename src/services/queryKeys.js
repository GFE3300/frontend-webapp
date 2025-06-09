export const PRODUCTS_BASE_KEY = 'products';
export const VENUE_BASE_KEY = 'venue';
export const PAYMENTS_BASE_KEY = 'payments';
export const SUBSCRIPTIONS_BASE_KEY = 'subscriptions';
export const ORDERS_BASE_KEY = 'orders';
export const DASHBOARD_BASE_KEY = 'dashboard';

export const queryKeys = {
    // Product related data
    productAttributes: 'productAttributes',
    inventoryItems: 'inventoryItems',
    masterDiscountCodes: 'masterDiscountCodes',
    taxRates: 'taxRates',
    products: (params) => [PRODUCTS_BASE_KEY, params],
    product: (id) => [PRODUCTS_BASE_KEY, id],
    categories: () => ['categories'],
    productsList: (params) => [PRODUCTS_BASE_KEY, 'list', params],
    productDetails: (productId) => [PRODUCTS_BASE_KEY, 'details', productId],
    productLastTemplate: [PRODUCTS_BASE_KEY, 'last-template'],
    productSearchSuggestions: [PRODUCTS_BASE_KEY, 'search-suggestions'],
    adminMenuPreviewProducts: (businessId) => [PRODUCTS_BASE_KEY, 'admin-preview', businessId],

    // Venue Layout Management
    activeVenueLayout: (businessId) => [VENUE_BASE_KEY, 'layout', 'active', businessId],

    // Public Venue/Menu Data
    publicTableInfo: (tableLayoutItemId) => [VENUE_BASE_KEY, 'public-table-info', tableLayoutItemId],
    publicProductsList: (businessIdentifier, filters, paginationParams) =>
        [PRODUCTS_BASE_KEY, 'public-list', businessIdentifier, { ...filters, ...paginationParams }],
    publicCategories: (businessIdentifier) => [PRODUCTS_BASE_KEY, 'public-categories', businessIdentifier],
    publicProductTags: (businessIdentifier) => [PRODUCTS_BASE_KEY, 'public-tags', businessIdentifier],
    publicProductSuggestions: (businessIdentifier, query) =>
        [PRODUCTS_BASE_KEY, 'public-search-suggestions', businessIdentifier, query],

    // Subscription related keys
    subscriptionStatus: [SUBSCRIPTIONS_BASE_KEY, 'status'],

    // --- Orders ---
    liveOrdersView: [ORDERS_BASE_KEY, 'live-view'],
    order: (orderId) => [ORDERS_BASE_KEY, 'detail', orderId],
    kitchenActiveOrders: [ORDERS_BASE_KEY, 'kitchen-view', 'active'],


    // --- Dashboard / Overview ---
    commandBarSummary: [DASHBOARD_BASE_KEY, 'commandBarSummary'],
    actionItems: [DASHBOARD_BASE_KEY, 'actionItems'],
    productMovers: (period) => [DASHBOARD_BASE_KEY, 'productMovers', period],
    revenueSummary: [DASHBOARD_BASE_KEY, 'revenueSummary'],
    occupancySummary: [DASHBOARD_BASE_KEY, 'occupancySummary'],
    guestsSummary: [DASHBOARD_BASE_KEY, 'guestsSummary'],
};