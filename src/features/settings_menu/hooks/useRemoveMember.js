import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A custom mutation hook for removing a member from a business.
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {import('@tanstack/react-query').UseMutationResult} The result object from useMutation.
 */
export const useRemoveMember = (options = {}) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    return useMutation({
        /**
         * @param {{businessId: string, membershipId: string}} variables
         */
        mutationFn: ({ businessId, membershipId }) => {
            return apiService.removeMember(businessId, membershipId);
        },

        onSuccess: (data, variables) => {
            // After successfully removing a member, invalidate the members list to refetch it.
            queryClient.invalidateQueries({
                queryKey: queryKeys.businessMembers(variables.businessId)
            });

            // Also invalidate context permissions as the team count has changed.
            queryClient.invalidateQueries({
                queryKey: queryKeys.contextPermissions
            });

            addToast(sl.teamManagement.removeSuccessToast, "success");

            if (options.onSuccess) {
                options.onSuccess(data, variables);
            }
        },

        onError: (error) => {
            const errorMessage = getErrorMessage(error, sl.teamManagement.removeErrorToast);
            addToast(errorMessage, 'error');
            console.error("Remove Member Error:", error);
        },

        ...options,
    });
};