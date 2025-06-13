import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A custom mutation hook for resending a pending invitation.
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {import('@tanstack/react-query').UseMutationResult} The result object from useMutation.
 */
export const useResendInvitation = (options = {}) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    return useMutation({
        /**
         * @param {{businessId: string, invitationId: string}} variables
         */
        mutationFn: ({ businessId, invitationId }) => {
            return apiService.resendInvitation(businessId, invitationId);
        },

        onSuccess: (data, variables) => {
            // After resending, invalidate the invitations list to get the updated expiration date.
            queryClient.invalidateQueries({
                queryKey: queryKeys.pendingInvitations(variables.businessId)
            });

            addToast(sl.teamManagement.resendSuccessToast, "success");

            if (options.onSuccess) {
                options.onSuccess(data, variables);
            }
        },

        onError: (error) => {
            const errorMessage = getErrorMessage(error, sl.teamManagement.resendErrorToast);
            addToast(errorMessage, 'error');
            console.error("Resend Invitation Error:", error);
        },

        ...options,
    });
};