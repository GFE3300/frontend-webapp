import { useQuery } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';

/**
 * A hook to fetch active orders specifically for the Kitchen Display System.
 * It polls the dedicated KDS endpoint every 10 seconds.
 *
 * @param {{enabled: boolean}} options - Standard react-query options, e.g., to enable/disable the query.
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<object>, Error>} The result object.
 */
export const useActiveKitchenOrders = (options = {}) => {
    return useQuery({
        queryKey: queryKeys.kitchenActiveOrders,
        queryFn: () => apiService.getKitchenOrders().then(res => res.data),

        // Polling configuration for a live KDS
        refetchInterval: 10000, // Refetch every 10 seconds
        refetchOnWindowFocus: true,

        // Data is fresh for 8 seconds. Prevents refetch spam on quick focus changes.
        staleTime: 8000,

        // Only run this query if enabled is explicitly true (or not false)
        enabled: options.enabled,

        retry: 1,
    });
};