import { useQuery } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';

// The statuses the kitchen cares about
const ACTIVE_KITCHEN_STATUSES = 'PENDING_CONFIRMATION,CONFIRMED,PREPARING,READY_FOR_PICKUP,SERVED';

/**
 * A hook to fetch active orders for the Kitchen Display System.
 * It polls every 15 seconds to keep the view live.
 */
export const useActiveKitchenOrders = (options = {}) => {
    const queryResult = useQuery({
        queryKey: queryKeys.kitchenActiveOrders,
        queryFn: () => apiService.get('orders/', {
            params: {
                status__in: ACTIVE_KITCHEN_STATUSES,
                ordering: '-order_timestamp' // Show newest orders first
            }
        }).then(res => res.data.results), // Extract the results array from paginated response
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
        staleTime: 10000,
        ...options, // Allow passing options like `enabled`
    });
    return queryResult;
};