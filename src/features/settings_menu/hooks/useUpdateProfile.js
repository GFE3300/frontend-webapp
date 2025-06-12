import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A custom mutation hook for updating the user's profile.
 * It handles the API call, and upon success, immediately triggers a full
 * session refresh to get new tokens with the updated user data.
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useUpdateProfile = (options = {}) => {
    // The login function from AuthContext will handle the session refresh
    // using the new tokens provided by the backend upon successful update.
    const { login } = useAuth();
    const { addToast } = useToast();

    return useMutation({
        mutationFn: (userData) => {
            // The API service sends a PATCH request and the backend is configured
            // to respond with new tokens containing the updated user claims.
            return apiService.updateCurrentUser(userData);
        },
        onSuccess: async (response, variables, context) => {
            addToast(sl.personalInfoCard.toastUpdateSuccess || "Profile updated successfully!", "success");

            const { access, refresh } = response.data;
            if (access && refresh) {
                // Use the centralized login function to update the entire auth state.
                // This is the single source of truth for session management.
                await login(access, refresh);
            } else {
                console.error("Profile update succeeded but did not receive new tokens.");
                addToast("Profile updated, but a manual refresh may be needed to see all changes.", "warning");
            }

            // Allow the calling component to perform additional actions on success.
            if (options.onSuccess) {
                options.onSuccess(response, variables, context);
            }
        },
        onError: (error, variables, context) => {
            const errorMessage = getErrorMessage(error, "Failed to update profile. Please try again.");
            addToast(errorMessage, "error");
            console.error("Profile update error:", error);

            if (options.onError) {
                options.onError(error, variables, context);
            }
        },
        ...options
    });
};