import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A custom mutation hook for updating a team member's role.
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {import('@tanstack/react-query').UseMutationResult} The result object from useMutation.
 */
export const useUpdateMemberRole = (options = {}) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    return useMutation({
        /**
         * @param {{businessId: string, membershipId: string, role: string}} variables
         */
        mutationFn: ({ businessId, membershipId, role }) => {
            return apiService.updateMemberRole(businessId, membershipId, { role });
        },

        onSuccess: (data, variables) => {
            // After successfully updating a role, invalidate the members list.
            queryClient.invalidateQueries({
                queryKey: queryKeys.businessMembers(variables.businessId)
            });

            addToast(sl.teamManagement.roleUpdateSuccessToast, "success");

            if (options.onSuccess) {
                options.onSuccess(data, variables);
            }
        },

        onError: (error) => {
            const errorMessage = getErrorMessage(error, sl.teamManagement.roleUpdateErrorToast);
            addToast(errorMessage, 'error');
            console.error("Update Member Role Error:", error);
        },

        ...options,
    });
};