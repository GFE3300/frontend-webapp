// src/contexts/ProductDataContext.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api'; // Adjust path if needed
import { queryKeys } from '../services/queryKeys'; // Adjust path if needed
import { useAuth } from './AuthContext';

import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 10;

// --- Custom Hooks for Data Fetching ---


/**
 * Fetches product search suggestions.
 * @param {string} query - The search query from debounced input.
 * @param {object} options - TanStack Query options.
 */
export const useProductSearchSuggestions = (debouncedQuery, options = {}) => {
    const { user } = useAuth();

    return useQuery({
        // Use a distinct queryKey for suggestions
        queryKey: [queryKeys.productSearchSuggestions, debouncedQuery],
        queryFn: async () => {
            // Only fetch if query is valid (e.g., length >= 2)
            if (!debouncedQuery || debouncedQuery.length < 2) {
                return []; // Return empty array, no API call
            }
            // console.log(`Fetching suggestions for: '${debouncedQuery}'`);
            const response = await apiService.get('/products/suggestions/', { q: debouncedQuery, limit: 7 });
            return response.data; // Backend should return an array of suggestions
        },
        // Enable the query only when the user is authenticated, has an active business,
        // and the debounced query is long enough.
        enabled: !!user && !!user.activeBusinessId && debouncedQuery.length >= 2 && (options.enabled !== false),
        staleTime: 1000 * 60 * 1, // Cache suggestions for 1 minute
        keepPreviousData: false, // We want fresh suggestions based on current typing
        ...options,
    });
};


/**
 * Fetches categories for the active business.
 * @param {object} options - TanStack Query options.
 */
export const useCategories = (options = {}) => {
    return useQuery({
        queryKey: [queryKeys.categories],
        queryFn: () => apiService.get('/products/categories/').then(res => res.data.results || res.data),
        staleTime: 1000 * 60 * 10,
        ...options,
    });
};

/**
 * Updates an existing product.
 * @param {object} options - TanStack Query mutation options.
 */
export const useUpdateProduct = (options = {}) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ productId, data, requestHeaders }) =>
            apiService.patch(`/products/${productId}/`, data, { headers: requestHeaders }),

        onSuccess: (responseData, variables, context) => {
            console.log("Product update success. Response:", responseData, "Variables:", variables);

            // Invalidate the specific product details query (good for detail pages)
            queryClient.invalidateQueries({ queryKey: queryKeys.productDetails(variables.productId) });

            // Invalidate ALL product lists to ensure the table refreshes.
            // The key ['products', 'list'] will match all queries starting with it,
            // such as ['products', 'list', { page: 1, ... }]
            queryClient.invalidateQueries({ queryKey: [queryKeys.PRODUCTS_BASE_KEY, 'list'] });
            // queryKeys.PRODUCTS_BASE_KEY is 'products'

            // If there was a global onSuccess passed when calling useUpdateProduct (not common for this setup)
            if (options.onSuccess) {
                options.onSuccess(responseData, variables, context);
            }
        },

        onError: (error, variables, context) => {
            console.error("Error updating product in useUpdateProduct:", error);
            if (options.onError) {
                options.onError(error, variables, context);
            }
        },

        ...options,
    });
};

/**
 * Fetches products for the active business, with pagination, filtering, searching, and sorting.
 * @param {object} queryParams - Object containing page, search, filters (e.g., category, status), sort.
 * @param {object} options - TanStack Query options.
 */

export const useProducts = (queryParams = {}, options = {}) => {
    const { user } = useAuth(); // Get user to check for activeBusinessId

    // Destructure all potential query params from the input object
    const {
        page = 1,
        search = '',
        category = '',
        status = '', // 'active' or 'inactive'
        sort = '',
        tags = '', // Expected to be comma-separated string of IDs if used
        product_type = '', // e.g., 'made_in_house', 'resold_item'
        // pageSize is fixed by PAGE_SIZE constant
    } = queryParams;

    // Construct the apiParams object carefully, only including params that have a value.
    const apiParams = {
        page,
        page_size: PAGE_SIZE,
    };

    if (search) apiParams.search = search;
    if (category) apiParams.category__id = category; // Backend expects category ID
    if (status) apiParams.is_active = status === 'active'; // Convert to boolean for backend
    if (product_type) apiParams.product_type = product_type;
    if (tags) apiParams.product_tags__id__in = tags; // Backend needs to support 'in' lookup for M2M
    if (sort) apiParams.ordering = sort;

    // console.log('[useProducts] Query Params Received:', queryParams);
    // console.log('[useProducts] API Params to be sent:', apiParams);
    // console.log('[useProducts] User for context check:', user);

    return useQuery({
        queryKey: queryKeys.productsList(apiParams), // Parameterized query key
        queryFn: async () => {
            // console.log('[useProducts] Fetching products with params:', apiParams); // You have this
            const response = await apiService.get('/products/', { params: apiParams }); // Make sure to pass params correctly

            console.log('[useProducts] API Response:', response);

            const responseData = typeof response.data === 'object' && response.data !== null ? response.data : {};
            const { results = [], count = 0, next = null, previous = null } = responseData;

            // THIS IS ALSO VERY IMPORTANT
            // console.log('[useProducts] Extracted data:', { results, count, next, previous }); 

            return {
                items: results,
                count: count,
                next,
                previous,
                totalPages: Math.ceil(count / PAGE_SIZE),
                currentPage: page,
                pageSize: PAGE_SIZE,
            };
        },
        staleTime: 1000 * 60 * 1, // Cache for 1 minute
        keepPreviousData: true, // Good for pagination
        // Only enable the query if the user is authenticated and has an active business ID.
        // This prevents requests if the necessary context for backend scoping is missing.
        enabled: !!user && !!user.activeBusinessId && (options.enabled !== false),
        ...options, // Allow overriding default options
    });
};
/**
 * Deletes a product.
 * @param {object} options - TanStack Query mutation options.
 */
export const useDeleteProduct = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (productId) => apiService.delete(`/products/${productId}/`).then(res => res.data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.products, 'list'] });
            if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        ...options,
    });
};

/**
 * Fetches product attribute tags for the active business.
 * @param {object} options - TanStack Query options.
 */
export const useProductAttributeTags = (options = {}) => {
    return useQuery({
        queryKey: [queryKeys.productAttributes],
        queryFn: () => apiService.get('/products/attribute-tags/').then(res => res.data.results || res.data),
        staleTime: 1000 * 60 * 10,
        ...options,
    });
};

/**
 * Fetches inventory items for the active business.
 * @param {object} options - TanStack Query options.
 */
export const useInventoryItems = (options = {}) => {
    return useQuery({
        queryKey: [queryKeys.inventoryItems],
        queryFn: () => apiService.get('/inventory/items/').then(res => res.data.results || res.data),
        staleTime: 1000 * 60 * 5, // Inventory might change more often
        ...options,
    });
};

/**
 * Fetches master discount codes for the active business.
 * @param {object} options - TanStack Query options.
 */
export const useMasterDiscountCodes = (options = {}) => {
    return useQuery({
        queryKey: [queryKeys.masterDiscountCodes],
        queryFn: () => apiService.get('/discounts/master-codes/').then(res => res.data.results || res.data),
        staleTime: 1000 * 60 * 10,
        ...options,
    });
};

/**
 * Fetches tax rates for the active business.
 * @param {object} options - TanStack Query options.
 */
export const useTaxRates = (options = {}) => {
    return useQuery({
        queryKey: [queryKeys.taxRates],
        queryFn: () => apiService.get('/products/tax-rates/').then(res => res.data.results || res.data),
        staleTime: 1000 * 60 * 15, // Tax rates change infrequently
        ...options,
    });
};


// --- Custom Hooks for Mutations (Create operations) ---

/**
 * Creates a new category.
 * @param {object} options - TanStack Query mutation options.
 */
export const useCreateCategory = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newCategoryData) => apiService.post('/products/categories/', newCategoryData).then(res => res.data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.categories] });
            // Or, for optimistic updates:
            // queryClient.setQueryData([queryKeys.categories], (oldData) => oldData ? [...oldData, data] : [data]);
            if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        ...options,
    });
};

/**
 * Creates a new product attribute tag.
 * @param {object} options - TanStack Query mutation options.
 */
export const useCreateProductAttributeTag = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newTagData) => apiService.post('/products/attribute-tags/', newTagData).then(res => res.data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.productAttributes] });
            if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        ...options,
    });
};

/**
 * Creates a new inventory item.
 * @param {object} options - TanStack Query mutation options.
 */
export const useCreateInventoryItem = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newItemData) => apiService.post('/inventory/items/', newItemData).then(res => res.data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.inventoryItems] });
            if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        ...options,
    });
};

/**
 * Creates a new master discount code.
 * @param {object} options - TanStack Query mutation options.
 */
export const useCreateMasterDiscountCode = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newDiscountData) => apiService.post('/discounts/master-codes/', newDiscountData).then(res => res.data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.masterDiscountCodes] });
            if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        ...options,
    });
};

/**
 * Creates a new tax rate.
 * @param {object} options - TanStack Query mutation options.
 */
export const useCreateTaxRate = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newTaxRateData) => apiService.post('/products/tax-rates/', newTaxRateData).then(res => res.data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.taxRates] });
            if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        ...options,
    });
};

// Note: No actual <ProductDataContext.Provider> is needed here.
// TanStack Query's <QueryClientProvider> at the app root handles the context.
// These hooks are then imported and used directly in components.