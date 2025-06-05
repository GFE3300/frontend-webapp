export const PRODUCTS_BASE_KEY = 'products';
export const VENUE_BASE_KEY = 'venue';
export const PAYMENTS_BASE_KEY = 'payments'; // Existing or ensure it's here
export const SUBSCRIPTIONS_BASE_KEY = 'subscriptions'; // New or ensure it's here

export const queryKeys = {
    // Product related data for dropdowns, selectors, etc. in AddProductModal
    productAttributes: 'productAttributes',
    inventoryItems: 'inventoryItems',
    masterDiscountCodes: 'masterDiscountCodes',
    taxRates: 'taxRates',

    // Products table (Admin Dashboard)
    products: (params) => [PRODUCTS_BASE_KEY, params], // General products list, potentially for admin
    product: (id) => [PRODUCTS_BASE_KEY, id],          // Single product by ID
    categories: () => ['categories'],                   // Admin categories
    productsList: (params) => [PRODUCTS_BASE_KEY, 'list', params], // Parameterized products list (Admin)
    productDetails: (productId) => [PRODUCTS_BASE_KEY, 'details', productId], // Detailed single product
    productLastTemplate: [PRODUCTS_BASE_KEY, 'last-template'],
    productSearchSuggestions: [PRODUCTS_BASE_KEY, 'search-suggestions'], // Admin search suggestions

    // Admin Menu Preview (might be specific to an admin context of a business)
    adminMenuPreviewProducts: (businessId) => [PRODUCTS_BASE_KEY, 'admin-preview', businessId],

    // Venue Layout Management (Admin)
    activeVenueLayout: (businessId) => [VENUE_BASE_KEY, 'layout', 'active', businessId],

    // Public Venue/Menu Data (Customer Facing)
    publicTableInfo: (tableLayoutItemId) => [VENUE_BASE_KEY, 'public-table-info', tableLayoutItemId],
    publicProductsList: (businessIdentifier, filters, paginationParams) =>
        [PRODUCTS_BASE_KEY, 'public-list', businessIdentifier, { ...filters, ...paginationParams }],
    publicCategories: (businessIdentifier) => [PRODUCTS_BASE_KEY, 'public-categories', businessIdentifier],
    publicProductTags: (businessIdentifier) => [PRODUCTS_BASE_KEY, 'public-tags', businessIdentifier],

    // Public Product Suggestions (Customer Facing)
    publicProductSuggestions: (businessIdentifier, query) =>
        [PRODUCTS_BASE_KEY, 'public-search-suggestions', businessIdentifier, query],

    // Subscription related keys
    subscriptionStatus: [SUBSCRIPTIONS_BASE_KEY, 'status'], // For fetching current user's subscription status
    // Example: subscriptionDetails: (subscriptionId) => [SUBSCRIPTIONS_BASE_KEY, 'details', subscriptionId],
};