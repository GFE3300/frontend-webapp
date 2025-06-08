import { useQuery } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';

// Polling interval in milliseconds (e.g., 15 seconds)
const ORDER_STATUS_POLL_INTERVAL = 15000;

// Terminal states where polling should stop, based on backend orders/models.py
const TERMINAL_ORDER_STATUSES = ['COMPLETED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_BUSINESS'];

/**
 * A hook to fetch and periodically update the status of a specific order.
 *
 * @param {string | null} orderId - The UUID of the order to track.
 * @returns {object} The result of the useQuery hook, containing:
 *  - data: The latest order data object.
 *  - isLoading: True on the initial fetch.
 *  - isError: True if an error occurs.
 *  - error: The error object.
 *  - isFetching: True during polling refetches.
 */
export const useOrderTracking = (orderId) => {
    // Assuming queryKeys.order(orderId) will be defined as ['orders', 'detail', orderId]
    const orderQueryKey = queryKeys.order(orderId);

    const isQueryEnabled = !!orderId;

    const fetchOrderStatus = async () => {
        if (!orderId) {
            throw new Error("Order ID is required to track status.");
        }
        // This maps to our backend's OrderDetailAPIView.
        const response = await apiService.get(`orders/${orderId}/`);
        return response.data;
    };

    const queryResult = useQuery({
        queryKey: orderQueryKey,
        queryFn: fetchOrderStatus,
        enabled: isQueryEnabled,
        refetchInterval: (data) => {
            // Stop polling if the order reaches a terminal state
            if (data && TERMINAL_ORDER_STATUSES.includes(data.status)) {
                return false;
            }
            return ORDER_STATUS_POLL_INTERVAL;
        },
        refetchOnWindowFocus: true, // Refetch when the user comes back to the tab
        retry: 2, // Retry failed fetches twice
    });

    return queryResult;
};