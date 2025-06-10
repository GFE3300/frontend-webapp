import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';
import { useToast } from '../../../contexts/ToastContext';

/**
 * Custom mutation hook to update a team member's role.
 * @param {object} options - Optional TanStack Query mutation options.
 */
export const useUpdateMemberRole = (options = {}) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    return useMutation({
        mutationFn: ({ businessId, membershipId, role }) =>
            apiService.updateMemberRole(businessId, membershipId, { role }),

        onSuccess: (data, variables) => {
            addToast("Member role updated successfully.", "success");
            queryClient.invalidateQueries({ queryKey: queryKeys.businessMembers(variables.businessId) });
            if (options.onSuccess) options.onSuccess(data, variables);
        },
        onError: (error, variables, context) => {
            const errorMessage = error.response?.data?.error || 'Failed to update member role.';
            addToast(errorMessage, 'error');
            if (options.onError) options.onError(error, variables, context);
        }
    });
};