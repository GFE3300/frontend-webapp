import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A custom mutation hook for revoking a pending invitation.
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {import('@tanstack/react-query').UseMutationResult} The result object from useMutation.
 */
export const useRevokeInvitation = (options = {}) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    return useMutation({
        /**
         * @param {{businessId: string, invitationId: string}} variables
         */
        mutationFn: ({ businessId, invitationId }) => {
            return apiService.revokeInvitation(businessId, invitationId);
        },

        onSuccess: (data, variables) => {
            // After revoking, invalidate the invitations list to remove the item from the UI.
            queryClient.invalidateQueries({
                queryKey: queryKeys.pendingInvitations(variables.businessId)
            });

            // Also invalidate context permissions as the team count has effectively changed
            // regarding the limit on pending invites + current members.
            queryClient.invalidateQueries({
                queryKey: queryKeys.contextPermissions
            });

            addToast(sl.teamManagement.revokeSuccessToast, "success");

            if (options.onSuccess) {
                options.onSuccess(data, variables);
            }
        },

        onError: (error) => {
            const errorMessage = getErrorMessage(error, sl.teamManagement.revokeErrorToast);
            addToast(errorMessage, 'error');
            console.error("Revoke Invitation Error:", error);
        },

        ...options,
    });
};  