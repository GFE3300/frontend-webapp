import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';

/**
 * Custom hook to fetch the details of the user's active business.
 * @param {object} options - Optional TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 */
export const useBusinessDetails = (options = {}) => {
    const { user, isAuthenticated } = useAuth();
    const activeBusinessId = user?.activeBusinessId;

    return useQuery({
        // The query key includes the business ID to automatically refetch when the user switches businesses.
        queryKey: queryKeys.businessDetails(activeBusinessId), // Using standardized key from queryKeys.js
        queryFn: async () => {
            // Note: The endpoint should not have a trailing slash if your API service handles it.
            // Assuming apiService.get handles the base URL correctly.
            const response = await apiService.get(`businesses/${activeBusinessId}/`);
            return response.data;
        },
        // Only run the query if the user is authenticated and has an active business ID.
        enabled: !!isAuthenticated && !!activeBusinessId,
        staleTime: 1000 * 60 * 5, // 5 minutes, as per plan
        refetchOnWindowFocus: false, // Business details are not likely to change while window is focused
        ...options,
    });
};