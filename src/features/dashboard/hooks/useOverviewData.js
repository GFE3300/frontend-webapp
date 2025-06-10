import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../services/queryKeys';
import apiService from '../../../services/api';

/**
 * Fetches the consolidated summary data for the dashboard's "at a glance" card.
 * @param {object} options - TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *   On success, `data` contains: { snapshot_mode: { ... }, insight_mode: { ... } }
 */
export const useCommandBarSummary = (options = {}) => {
    return useQuery({
        queryKey: queryKeys.commandBarSummary,
        queryFn: async () => {
            const response = await apiService.getCommandBarSummary();
            return response.data;
        },
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every 1 minute
        suspense: true, // Enable Suspense mode
        ...options,
    });
};

/**
 * Fetches actionable items for the manager, such as low stock alerts and pending orders.
 * @param {object} options - TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *   On success, `data` contains: { low_stock_alerts, pending_orders, manager_attention }
 */
export const useActionItems = (options = {}) => {
    return useQuery({
        queryKey: queryKeys.actionItems,
        queryFn: async () => {
            const response = await apiService.getActionItems();
            return response.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
        suspense: true, // Enable Suspense mode
        ...options,
    });
};

/**
 * Fetches the top and bottom performing products for a given period.
 * @param {string} period - The time period ('today', 'week', 'month').
 * @param {object} options - TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *   On success, `data` contains: { top_movers, bottom_movers }
 */
export const useProductMovers = (period = 'today', options = {}) => {
    return useQuery({
        queryKey: queryKeys.productMovers(period),
        queryFn: async () => {
            const response = await apiService.getProductMovers(period);
            return response.data;
        },
        staleTime: 1000 * 60 * 15, // 15 minutes, as this data is less real-time
        suspense: true, // Enable Suspense mode
        ...options,
    });
};