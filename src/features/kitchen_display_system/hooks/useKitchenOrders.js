import { useQuery } from '@tanstack/react-query';
import kitchenOrderService from '../services/kitchenOrderService';
import { queryKeys } from '../../../services/queryKeys';

/**
 * A hook to fetch live kitchen orders based on status filters, with automatic polling.
 * @param {object} filters - An object containing query parameters, e.g., { status: 'new,preparing' }.
 * @returns {QueryResult} The result object from TanStack Query, including data, isLoading, isError, etc.
 */
const useKitchenOrders = (filters) => {
    // Determine a unique query key based on the current filters.
    // This ensures that changing the filter triggers a new fetch.
    const queryKey = queryKeys.kitchenActiveOrders(filters?.status || 'all');

    const queryResult = useQuery({
        queryKey,
        // The query function calls our service to fetch the data.
        queryFn: () => kitchenOrderService.fetchActiveOrders(filters),
        // --- Polling Configuration for a Live Dashboard ---
        // Automatically refetch data every 15 seconds to keep the view "live".
        refetchInterval: 15000,
        // Refetch immediately when the user returns to the window.
        refetchOnWindowFocus: true,
        // Data is considered fresh for 10 seconds to prevent rapid refetches.
        staleTime: 1000 * 10,
        // If a fetch fails, retry once before showing an error state.
        retry: 1,
    });

    // The hook now simply returns the entire result from useQuery.
    // The component using this hook will destructure what it needs (data, isLoading, etc.).
    return queryResult;
};

export default useKitchenOrders;