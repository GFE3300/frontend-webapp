import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../services/queryKeys';
import apiService from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook to fetch the list of businesses associated with the current user.
 * @param {object} options - Optional TanStack Query options.
 * @returns {QueryResult} The result of the TanStack Query operation.
 *   On success, `data` contains an array of business objects: `[{id, name, role}]`.
 */
export const useMyBusinesses = (options = {}) => {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: [queryKeys.myBusinesses],
        queryFn: async () => {
            const response = await apiService.getMyBusinesses();
            return response.data;
        },
        // This query should only run when the user is authenticated.
        enabled: isAuthenticated,
        // The list of businesses a user belongs to doesn't change frequently within a session.
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        ...options,
    });
};