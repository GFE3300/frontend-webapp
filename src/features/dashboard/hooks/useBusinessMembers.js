import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../services/queryKeys';
import apiService from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

/**
// src/features/dashboard/hooks/useBusinessMembers.js

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../services/queryKeys';
import apiService from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook to fetch the list of team members for a specific business.
 * @param {string} businessId - The UUID of the business whose members are to be fetched.
 * @param {object} options - Optional TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *   On success, `data` contains an array of team member objects.
 */
export const useBusinessMembers = (businessId, options = {}) => {
    const { isAuthenticated } = useAuth();

    return useQuery({
        // The query key includes the businessId to ensure data is refetched
        // when the user switches to a different business.
        queryKey: queryKeys.businessMembers(businessId), // This uses the key from queryKeys.js
        queryFn: async () => {
            // This API call corresponds to the new function in api.js
            const response = await apiService.getBusinessMembers(businessId);
            return response.data;
        },
        // This query should only run if the user is authenticated and a businessId is provided.
        enabled: !!isAuthenticated && !!businessId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        ...options,
    });
};