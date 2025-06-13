import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../services/queryKeys';
import apiService from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook to fetch the list of team members for a specific business.
 * @param {string} businessId - The UUID of the business whose members are to be fetched.
 * @param {object} [options={}] - Optional TanStack Query options.
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<object>, Error>} The result of the TanStack Query operation.
 *   On success, `data` contains an array of team member objects, where each object
 *   represents a `Membership` and includes user details.
 */
export const useBusinessMembers = (businessId, options = {}) => {
    const { isAuthenticated } = useAuth();

    return useQuery({
        // The query key includes the businessId to ensure data is unique per business
        // and automatically refetches when the user switches business contexts.
        queryKey: queryKeys.businessMembers(businessId),

        // The query function calls our centralized apiService.
        queryFn: async () => {
            const response = await apiService.getBusinessMembers(businessId);
            return response.data;
        },

        // This query should only run if the user is authenticated and a businessId is provided.
        // This prevents unnecessary API calls on logout or during initial load.
        enabled: !!isAuthenticated && !!businessId,

        // It's reasonable to cache this data for a short period as team composition doesn't change every second.
        staleTime: 1000 * 60 * 2, // 2 minutes

        // Any additional options provided by the consuming component will be merged here.
        ...options,
    });
};