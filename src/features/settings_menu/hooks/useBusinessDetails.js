import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../services/api';

/**
 * Custom hook to fetch the details of the user's active business.
 * @param {object} options - Optional TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 */
export const useBusinessDetails = (options = {}) => {
    const { user } = useAuth();
    const activeBusinessId = user?.activeBusinessId;

    return useQuery({
        // The query key includes the business ID to automatically refetch when the user switches businesses.
        queryKey: ['businessDetails', activeBusinessId],
        queryFn: async () => {
            const response = await apiService.get(`businesses/${activeBusinessId}/`);
            return response.data;
        },
        // Only run the query if there is an active business ID.
        enabled: !!activeBusinessId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
    });
};