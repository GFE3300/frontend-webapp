import { useQuery } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';

/**
 * A hook to fetch the active venue layout for the current business using React Query.
 * It handles caching, loading, and error states automatically.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<object, Error>} The result object from React Query.
 *          The `data` property will contain the layout object, including grid dimensions and an array of items.
 */
export const useLayoutData = () => {
    // We don't need to pass a businessId as a parameter because the API service
    // uses an interceptor to add the auth token, and the backend determines the
    // active business from that token. This keeps the hook clean and reusable.
    const queryResult = useQuery({
        // The query key uniquely identifies this data.
        queryKey: queryKeys.activeVenueLayout(),

        // The query function calls our API service.
        queryFn: async () => {
            const response = await apiService.getActiveVenueLayout();
            // Ensure the 'items' property is always an array, even if null/undefined from API, to prevent render errors.
            if (response.data && !Array.isArray(response.data.items)) {
                response.data.items = [];
            }
            return response.data;
        },

        // --- React Query Options for Static Data ---

        // Consider layout data to be "fresh" for 5 minutes.
        // This prevents unnecessary re-fetching if the user navigates away and back quickly.
        staleTime: 1000 * 60 * 5,

        // If a fetch fails, only retry once. This isn't live data, so aggressive retries aren't needed.
        retry: 1,
        
        // This data should not poll. refetchInterval is left at its default (false).
        // refetchOnWindowFocus is also left at its default (true), which is acceptable.
    });

    return queryResult;
};