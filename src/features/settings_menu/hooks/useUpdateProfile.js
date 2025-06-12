import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';

/**
 * A custom mutation hook for updating the user's profile.
 * It handles the API call, and upon success, immediately triggers a full
 * session refresh to get new tokens with the updated user data.
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useUpdateProfile = (options = {}) => {
    // MODIFIED: We now get `login` from AuthContext.
    // The backend's response will contain everything needed.
    const { login } = useAuth();
    const { addToast } = useToast();

    return useMutation({
        mutationFn: (userData) => {
            // Send the PATCH request to update user details in the database.
            // The backend will now respond with new tokens.
            return apiService.updateCurrentUser(userData);
        },
        onSuccess: async (response, variables, context) => {
            addToast("Profile updated successfully!", "success");

            // --- THE CORRECT AND FINAL FIX ---
            const { access, refresh } = response.data;
            if (access && refresh) {
                // Use the centralized login function to update the entire auth state
                // with the new tokens. This is the single source of truth.
                await login(access, refresh);
            } else {
                console.error("Profile update succeeded but did not receive new tokens.");
                addToast("Profile updated, but session may be out of sync.", "warning");
            }

            // Allow the calling component to perform additional actions on success.
            if (options.onSuccess) {
                options.onSuccess(response, variables, context);
            }
        },
        onError: (error, variables, context) => {
            // This handles errors from the initial PATCH request.
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