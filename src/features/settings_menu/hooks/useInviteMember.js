import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';
import { interpolate } from '../../../i18n';

/**
 * A custom mutation hook for inviting a new member to a business.
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {import('@tanstack/react-query').UseMutationResult} The result object from useMutation.
 */
export const useInviteMember = (options = {}) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    return useMutation({
        /**
         * @param {{businessId: string, email: string, role: string}} variables
         */
        mutationFn: ({ businessId, email, role }) => {
            return apiService.inviteMember(businessId, { email, role });
        },

        onSuccess: (data, variables) => {
            // After successfully sending an invite, we must refetch the list of pending invitations.
            queryClient.invalidateQueries({
                queryKey: queryKeys.pendingInvitations(variables.businessId)
            });

            // Also, invalidate the context permissions query as the team member count might have changed.
            queryClient.invalidateQueries({
                queryKey: queryKeys.contextPermissions
            });

            addToast(
                interpolate(sl.teamManagement.inviteSuccessToast, { email: variables.email }),
                "success"
            );

            // Allow the component to run its own onSuccess logic (e.g., closing a modal).
            if (options.onSuccess) {
                options.onSuccess(data, variables);
            }
        },

        onError: (error) => {
            // Use our utility to get a clean, user-friendly error message.
            const errorMessage = getErrorMessage(error, sl.teamManagement.inviteErrorToast);
            addToast(errorMessage, 'error');
            console.error("Invite Member Error:", error);
        },

        // Spread any other options passed to the hook.
        ...options,
    });
};