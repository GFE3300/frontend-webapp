export const PRODUCTS_BASE_KEY = 'products';

export const queryKeys = {
    // Product related data for dropdowns, selectors, etc. in AddProductModal
    productAttributes: 'productAttributes',
    inventoryItems: 'inventoryItems',
    masterDiscountCodes: 'masterDiscountCodes',
    taxRates: 'taxRates',

    // Products table
    products: (params) => [PRODUCTS_BASE_KEY, params],
    product: (id) => [PRODUCTS_BASE_KEY, id],
    categories: () => ['categories'],
    productsList: (params) => [PRODUCTS_BASE_KEY, 'list', params], // This uses the constant correctly
    productDetails: (productId) => [PRODUCTS_BASE_KEY, 'details', productId],
    productLastTemplate: [PRODUCTS_BASE_KEY, 'last-template'],
    productSearchSuggestions: [PRODUCTS_BASE_KEY, 'search-suggestions'],
};