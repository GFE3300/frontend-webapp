// src/contexts/ProductDataContext.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api'; // Adjust path if needed
import { queryKeys, PRODUCTS_BASE_KEY } from '../services/queryKeys'; // Adjust path if needed
import { useAuth } from './AuthContext';

const PAGE_SIZE = 10;

// --- Custom Hooks for Data Fetching ---


/**
 * Mutation hook to validate a promo code against the current order context.
 * @param {object} options - TanStack Query mutation options.
 * @returns {MutationResult} The result of the TanStack Query mutation operation.
 *                          On success, `data` will be the API response for the validated promo code:
 *                          e.g., { valid: true, code_name, type, value, public_display_name, message, applicability: { scope, product_ids, ... } }
 *                          or { valid: false, message, code_name }
 */
export const useValidatePromoCode = (options = {}) => {
    // const queryClient = useQueryClient(); // Not strictly needed unless invalidating other queries on promo validation

    return useMutation({
        mutationFn: async (payload) => {
            // Expected payload: { code_name: string, business_identifier: string, context_product_ids: string[] }
            console.log('[useValidatePromoCode] Attempting to validate promo code. Payload:', payload);
            if (!payload.code_name || !payload.business_identifier) {
                // Basic client-side validation, more robust validation might be in the calling component
                const error = new Error("Promo code name and business identifier are required for validation.");
                error.isClientValidationError = true; // Custom flag
                throw error;
            }
            // The API endpoint is POST /api/discounts/validate-promo-code/
            // apiService.post will prepend /api/
            const response = await apiService.post('discounts/validate-promo-code/', payload);
            console.log('[useValidatePromoCode] Promo code validation API response:', response.data);
            return response.data; // Return the data part of the response
        },
        onSuccess: (data, variables, context) => {
            console.log('[useValidatePromoCode] Promo code validation successful. Data:', data, 'Variables:', variables);
            // Invalidation logic can be added here if promo validation affects other cached data.
            // For now, Userpage.jsx will handle UI updates based on this success.
            if (options.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            // Log the full error structure for better debugging
            console.error(
                '[useValidatePromoCode] Promo code validation failed.',
                'Variables:', variables,
                'Error status:', error.response?.status,
                'Error data:', error.response?.data,
                'Error message:', error.message,
                'Full error object:', error
            );
            // Error handling will be primarily done in the component using this hook (Userpage.jsx)
            // to show appropriate UI feedback (toasts, messages).
            if (options.onError) {
                options.onError(error, variables, context);
            }
        },
        ...options, // Spread any additional mutation options provided by the caller
    });
};

/**
 * Fetches publicly available product search suggestions for a given business.
 * Suggestions can include products, categories, or tags.
 *
 * @param {string} businessIdentifier - The slug or UUID of the business.
 * @param {string} debouncedQuery - The debounced search query.
 * @param {object} options - Optional TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *                        On success, `data` will be an array of suggestion objects:
 *                        Array<{ id: string, name: string, type: 'product'|'category'|'tag', details: { image_url?: string, [key:string]: any } }>
 */
export const usePublicProductSuggestions = (businessIdentifier, debouncedQuery, options = {}) => {
    return useQuery({
        queryKey: queryKeys.publicProductSuggestions(businessIdentifier, debouncedQuery),
        queryFn: async () => {
            // Prevent API call if query is too short or businessIdentifier is missing
            if (!businessIdentifier || !debouncedQuery || debouncedQuery.trim().length < 2) {
                return []; // Return empty array, TanStack Query won't treat this as an error
            }
            // console.log(`[usePublicProductSuggestions] Fetching suggestions for business: ${businessIdentifier}, query: '${debouncedQuery}'`);
            try {
                // Backend endpoint: GET /api/products/public/menu/{business_identifier}/suggestions/?q={searchQuery}
                // apiService.get will prepend /api/
                const response = await apiService.get(`products/public/menu/${businessIdentifier}/suggestions/`, { q: debouncedQuery.trim(), limit: 7 });
                // console.log('[usePublicProductSuggestions] Successfully fetched suggestions:', response.data);
                // Backend might return { results: [] } or just []
                return Array.isArray(response.data) ? response.data : response.data.results || [];
            } catch (error) {
                console.error(`[usePublicProductSuggestions] Error fetching suggestions for business ${businessIdentifier}, query ${debouncedQuery}:`, error.response?.data || error.message);
                const errorMessage = error.response?.data?.detail || "Could not load search suggestions.";
                // Throw a custom error or rethrow to let TanStack Query handle it
                const customError = new Error(errorMessage);
                customError.status = error.response?.status;
                throw customError;
            }
        },
        // Query is enabled only if businessIdentifier and a valid debouncedQuery (min 2 chars) are provided.
        // The options.enabled check allows callers to further control enabling/disabling.
        enabled: !!businessIdentifier && !!debouncedQuery && debouncedQuery.trim().length >= 2 && (options.enabled !== false),
        staleTime: 1000 * 60 * 1, // Cache suggestions for 1 minute
        keepPreviousData: false,  // We want fresh suggestions based on current typing, not stale ones
        refetchOnWindowFocus: false, // Suggestions likely don't need to refetch on window focus
        retry: (failureCount, error) => {
            // Don't retry for 404 (e.g., business not found) or typical client errors
            if (error.status === 404 || error.status === 400) return false;
            // Retry once for other transient errors (e.g., network issues)
            return failureCount < 1;
        },
        ...options, // Spread any additional options passed by the caller
    });
};

/**
 * Fetches a paginated list of publicly available active products for a given business.
 *
 * @param {string} businessIdentifier - The slug or UUID of the business.
 * @param {object} filters - Optional filters ({ category_id: string|null, tag_ids: string[]|null, search_query: string|null }).
 * @param {object} paginationParams - Pagination parameters ({ page: number, page_size: number }).
 * @param {object} options - Optional TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *                        On success, `data` will be the API response structure,
 *                        typically { results: Product[], count: number, next: string|null, previous: string|null }.
 */
export const usePublicProductsList = (businessIdentifier, filters = {}, paginationParams = { page: 1, page_size: 20 }, options = {}) => {
    const queryParams = {
        ...filters, // category_id, tag_ids (comma-separated string), search_query
        page: paginationParams.page,
        page_size: paginationParams.page_size,
        // is_active: true, // Backend should enforce this for public/menu endpoint
    };

    // Clean up undefined/null filters to avoid sending them as empty query params
    Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
            delete queryParams[key];
        }
    });
    if (queryParams.tag_ids && Array.isArray(queryParams.tag_ids)) {
        queryParams.tag_ids = queryParams.tag_ids.join(','); // Convert array to comma-separated string if needed by backend
        if (!queryParams.tag_ids) delete queryParams.tag_ids; // Remove if empty after join
    }


    return useQuery({
        queryKey: queryKeys.publicProductsList(businessIdentifier, filters, paginationParams),
        queryFn: async () => {
            console.log(`[usePublicProductsList] Fetching public products for business: ${businessIdentifier}`, queryParams);
            try {
                // Backend endpoint: /api/products/public/menu/{business_identifier}/products/
                const response = await apiService.get(`products/public/menu/${businessIdentifier}/products/`, queryParams);
                console.log('[usePublicProductsList] Successfully fetched public products:', response.data);
                return response.data; // Expects { results: [], count, next, previous }
            } catch (error) {
                console.error(`[usePublicProductsList] Error fetching public products for business ${businessIdentifier}:`, error.response?.data || error.message);
                const errorMessage = error.response?.data?.detail || "Could not load products for this menu.";
                const customError = new Error(errorMessage);
                customError.status = error.response?.status;
                throw customError;
            }
        },
        // Enable the query only when businessIdentifier is provided and any explicit enabled option is true.
        enabled: !!businessIdentifier && (options.enabled !== false),
        staleTime: 1000 * 60 * 2, // Cache products for 2 minutes
        keepPreviousData: true, // Good for pagination and filtering experience
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            if (error.status === 404) return false; // Business not found for products
            return failureCount < 2;
        },
        ...options,
    });
};

/**
 * Fetches publicly available categories for a given business.
 *
 * @param {string} businessIdentifier - The slug or UUID of the business.
 * @param {object} options - Optional TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *                        On success, `data` will be an array of category objects.
 */
export const usePublicCategories = (businessIdentifier, options = {}) => {
    return useQuery({
        queryKey: queryKeys.publicCategories(businessIdentifier),
        queryFn: async () => {
            console.log(`[usePublicCategories] Fetching public categories for business: ${businessIdentifier}`);
            try {
                // Backend endpoint: /api/products/public/menu/{business_identifier}/categories/
                const response = await apiService.get(`products/public/menu/${businessIdentifier}/categories/`);
                console.log('[usePublicCategories] Successfully fetched public categories:', response.data);
                // Assuming backend returns an array of categories directly, or { results: [] }
                return Array.isArray(response.data) ? response.data : response.data.results || [];
            } catch (error) {
                console.error(`[usePublicCategories] Error fetching public categories for business ${businessIdentifier}:`, error.response?.data || error.message);
                const errorMessage = error.response?.data?.detail || "Could not load categories for this menu.";
                 const customError = new Error(errorMessage);
                customError.status = error.response?.status;
                throw customError;
            }
        },
        enabled: !!businessIdentifier && (options.enabled !== false),
        staleTime: 1000 * 60 * 10, // Categories change less frequently
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            if (error.status === 404) return false;
            return failureCount < 1;
        },
        ...options,
    });
};

/**
 * Fetches publicly visible product attribute tags for a given business.
 *
 * @param {string} businessIdentifier - The slug or UUID of the business.
 * @param {object} options - Optional TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *                        On success, `data` will be an array of tag objects.
 */
export const usePublicProductTags = (businessIdentifier, options = {}) => {
    return useQuery({
        queryKey: queryKeys.publicProductTags(businessIdentifier),
        queryFn: async () => {
            console.log(`[usePublicProductTags] Fetching public tags for business: ${businessIdentifier}`);
            try {
                // Backend endpoint: /api/products/public/menu/{business_identifier}/tags/
                const response = await apiService.get(`products/public/menu/${businessIdentifier}/tags/`);
                console.log('[usePublicProductTags] Successfully fetched public tags:', response.data);
                // Assuming backend returns an array of tags directly, or { results: [] }
                // Backend ensures these are is_publicly_visible=True
                return Array.isArray(response.data) ? response.data : response.data.results || [];
            } catch (error) {
                console.error(`[usePublicProductTags] Error fetching public tags for business ${businessIdentifier}:`, error.response?.data || error.message);
                const errorMessage = error.response?.data?.detail || "Could not load product tags for this menu.";
                const customError = new Error(errorMessage);
                customError.status = error.response?.status;
                throw customError;
            }
        },
        enabled: !!businessIdentifier && (options.enabled !== false),
        staleTime: 1000 * 60 * 10, // Tags change less frequently
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            if (error.status === 404) return false;
            return failureCount < 1;
        },
        ...options,
    });
};

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
    // const { user } = useAuth(); // Not strictly needed for this mutation

    return useMutation({
        mutationFn: async ({ productId, data, requestHeaders }) => {
            // console.log(`[useUpdateProduct] mutationFn START: Patching ${productId} with data:`, data);
            const response = await apiService.patch(`/products/${productId}/`, data, { headers: requestHeaders });
            // console.log(`[useUpdateProduct] mutationFn SUCCESS: API response for ${productId}:`, response);
            return response; // Return the full Axios response
        },

        onSuccess: (response, variables, context) => { // Axios response is the first arg
            const updatedProduct = response.data; // The actual data from backend
            const { productId } = variables;
            console.log(`[useUpdateProduct] onSuccess START: Product ID ${productId}, Updated Data from PATCH:`, updatedProduct);

            if (!updatedProduct || typeof updatedProduct.id === 'undefined') {
                console.error("[useUpdateProduct] onSuccess: updatedProduct data from PATCH is missing or invalid.", updatedProduct);
                if (options.onSuccess) {
                    options.onSuccess(response, variables, context);
                }
                return;
            }

            try {
                // 1. Update single product details cache (good practice)
                console.log(`[useUpdateProduct] onSuccess: Updating productDetails cache for ${productId}`);
                queryClient.setQueryData(queryKeys.productDetails(productId), updatedProduct); // Use the direct updated product data

                // 2. Invalidate all product list queries.
                // This will cause useProducts to refetch with its current queryParams.
                const invalidationKey = [PRODUCTS_BASE_KEY, 'list']; // CORRECTLY USE THE IMPORTED CONSTANT
                console.log(`[useUpdateProduct] onSuccess: Invalidating all product list queries starting with key:`, invalidationKey);

                queryClient.invalidateQueries({
                    queryKey: invalidationKey,
                    exact: false, // Match all queries starting with this base
                });
                console.log(`[useUpdateProduct] onSuccess: Product list queries invalidated for product ${productId}. Refetch should occur.`);

                if (options.onSuccess) {
                    options.onSuccess(response, variables, context);
                }
            } catch (e) {
                console.error(`[useUpdateProduct] onSuccess: CRITICAL ERROR during cache operations for ${productId}:`, e);
            }
            console.log(`[useUpdateProduct] onSuccess END for ${productId}`);
        },

        onError: (error, variables, context) => {
            console.error(`[useUpdateProduct] onError Invoked: Product ID ${variables?.productId}, Error:`, error.response?.data || error.message, error);
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