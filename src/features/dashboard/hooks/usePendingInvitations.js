import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../services/queryKeys';
import apiService from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook to fetch pending invitations for a specific business.
 * @param {string} businessId - The UUID of the business.
 * @param {object} options - Optional TanStack Query options.
 */
export const usePendingInvitations = (businessId, options = {}) => {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: queryKeys.pendingInvitations(businessId),
        queryFn: () => apiService.getPendingInvitations(businessId).then(res => res.data),
        enabled: !!isAuthenticated && !!businessId,
        staleTime: 1000 * 60 * 1, // 1 minute
        ...options,
    });
};