import { useQuery } from '@tanstack/react-query';
import apiService from '../services/api'; // Ensure this path is correct
import { queryKeys } from '../services/queryKeys'; // Ensure this path is correct
import { useParams } from 'react-router-dom'; // To potentially get tableLayoutItemId if hook is used directly in a routed component

// No actual React Context Provider is needed here if we are just exporting custom hooks
// that use TanStack Query's global QueryClientProvider.

/**
 * Fetches public information about a specific table layout item.
 * This hook is intended for use in customer-facing views where tableLayoutItemId is known.
 *
 * @param {string} tableLayoutItemId - The UUID of the table layout item.
 * @param {object} options - Optional TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *                        On success, `data` will contain:
 *                        { table_display_number, business_uuid, business_slug, business_name }
 */
export const usePublicTableInfo = (tableLayoutItemId, options = {}) => {
    // The hook can also get tableLayoutItemId from params if it's directly used in a routed component,
    // but it's generally better to pass it explicitly for reusability.
    // const params = useParams();
    // const idToFetch = tableLayoutItemId || params.tableLayoutItemId;

    const idToFetch = tableLayoutItemId;

    return useQuery({
        queryKey: queryKeys.publicTableInfo(idToFetch),
        queryFn: async () => {
            if (!idToFetch) {
                // This check is important. If idToFetch is null/undefined,
                // queryFn won't run if `enabled` is false, but if `enabled` is true,
                // it might proceed and fail.
                console.warn('usePublicTableInfo: tableLayoutItemId is missing, cannot fetch.');
                throw new Error('Table identifier is missing.');
            }
            console.log(`[usePublicTableInfo] Fetching public table info for ID: ${idToFetch}`);
            try {
                const response = await apiService.get(`venue/public/table-info/${idToFetch}/`);
                // Backend returns: { table_display_number, business_uuid, business_slug, business_name }
                console.log('[usePublicTableInfo] Successfully fetched table info:', response.data);
                return response.data;
            } catch (error) {
                console.error(`[usePublicTableInfo] Error fetching table info for ID ${idToFetch}:`, error.response?.data || error.message);
                // Let TanStack Query handle the error object, but re-throw to ensure it's propagated.
                // We can customize the error message here if needed before re-throwing.
                const errorMessage = error.response?.data?.message ||
                    error.response?.data?.detail ||
                    (error.response?.status === 404 ? "The scanned QR code or link seems to be invalid. Please try again." : "Could not load venue information.");

                // Create a new error object to ensure a clean message is passed to the UI component
                const customError = new Error(errorMessage);
                customError.status = error.response?.status; // Preserve status if available
                throw customError;
            }
        },
        enabled: !!idToFetch && (options.enabled !== false), // Query is enabled only if tableLayoutItemId is provided
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes, table info is unlikely to change frequently
        refetchOnWindowFocus: false, // Unlikely to change while window is focused
        retry: (failureCount, error) => {
            // Do not retry on 404 (Not Found) or 400 (Bad Request, e.g. invalid UUID) errors
            if (error.status === 404 || error.status === 400) {
                return false;
            }
            // For other errors (like network issues), retry up to 2 times (default is 3 retries total).
            return failureCount < 2;
        },
        ...options, // Allow overriding default query options
    });
};