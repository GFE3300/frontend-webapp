const PRODUCTS_BASE_KEY = 'products';

export const queryKeys = {
    // Product related data for dropdowns, selectors, etc. in AddProductModal
    categories: 'categories',
    productAttributes: 'productAttributes',
    inventoryItems: 'inventoryItems',
    masterDiscountCodes: 'masterDiscountCodes',
    taxRates: 'taxRates',

    // Products table
    products: PRODUCTS_BASE_KEY, 
    productsList: (params) => [PRODUCTS_BASE_KEY, 'list', params],
    productDetails: (productId) => [PRODUCTS_BASE_KEY, 'details', productId],
    productLastTemplate: [PRODUCTS_BASE_KEY, 'last-template'],
};