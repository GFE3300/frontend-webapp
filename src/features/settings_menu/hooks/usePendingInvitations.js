import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../services/queryKeys';
import apiService from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook to fetch pending invitations for a specific business.
 * @param {string} businessId - The UUID of the business whose invitations are to be fetched.
 * @param {object} [options={}] - Optional TanStack Query options.
 * @returns {import('@tanstack/react-query').UseQueryResult<Array<object>, Error>} The result of the TanStack Query operation.
 *   On success, `data` contains an array of pending invitation objects.
 */
export const usePendingInvitations = (businessId, options = {}) => {
    const { isAuthenticated } = useAuth();

    return useQuery({
        // The query key includes businessId to ensure data is specific to the active business.
        queryKey: queryKeys.pendingInvitations(businessId),

        queryFn: async () => {
            const response = await apiService.getPendingInvitations(businessId);
            return response.data;
        },

        // Only run the query if the user is authenticated and a businessId is available.
        enabled: !!isAuthenticated && !!businessId,

        // Invitations are moderately dynamic. A 1-minute stale time is reasonable.
        staleTime: 1000 * 60 * 1, // 1 minute

        // Any additional options from the component will be merged.
        ...options,
    });
};