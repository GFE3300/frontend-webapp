import { useQuery } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';

/**
 * A hook to fetch the live orders view data for the MVP.
 * It performs an initial fetch via HTTP and then polls for updates every 15 seconds.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<object>, Error>} The result object from react-query.
 *          The `data` property will contain an array of live table state objects.
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

        // --- Polling Configuration for a Live Dashboard ---
        
        // Automatically refetch data every 15 seconds to keep the view "live".
        // This is a key requirement for the "Air Traffic Control" feel.
        refetchInterval: 15000,

        // For a live dashboard, it's good practice to refetch immediately when the
        // user returns to the window, ensuring they see the latest state instantly.
        refetchOnWindowFocus: true,
        
        // Data is considered fresh for 10 seconds. This prevents rapid, overlapping refetches
        // on component re-mounts while polling continues in the background.
        staleTime: 1000 * 10,
        
        // If a fetch fails, retry once before showing an error state.
        retry: 1,
    });

    return queryResult;
};