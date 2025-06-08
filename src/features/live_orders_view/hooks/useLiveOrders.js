import { useQuery } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';

/**
 * A hook to fetch the live orders view data for the MVP.
 * It performs an initial fetch via HTTP and then polls for updates every 15 seconds.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<object>, Error>} The result object from react-query.
 */
export const useLiveOrders = () => {
    const queryResult = useQuery({
        // The query key uniquely identifies this data in the cache.
        queryKey: queryKeys.liveOrdersView,

        // The query function calls our API service to get the latest data.
        queryFn: async () => {
            const response = await apiService.getLiveOrdersView();
            return response.data;
        },

        // --- Polling Configuration for Phase 1 ---
        // Automatically refetch data every 15 seconds.
        refetchInterval: 15000,

        // Consider data fresh for 1 minute. This prevents unnecessary refetches
        // if the component re-mounts within this window, but polling will continue.
        staleTime: 1000 * 60,

        // For a live dashboard, it's good practice to refetch immediately when the
        // user returns to the window.
        refetchOnWindowFocus: true,
    });

    return queryResult;
};