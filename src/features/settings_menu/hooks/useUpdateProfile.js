import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import i18n from '../../../i18n';

/**
 * A custom mutation hook for updating the current user's profile.
 * It handles the API call, global state updates via AuthContext,
 * toast notifications, and language switching.
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useUpdateProfile = (options = {}) => {
    // Get the global state updater function from AuthContext.
    const { updateUser } = useAuth();
    const { addToast } = useToast();

    return useMutation({
        mutationFn: (userData) => {
            // This API call sends a PATCH request to update the user's details.
            return apiService.updateCurrentUser(userData);
        },
        onSuccess: (response, variables, context) => {
            const updatedUser = response.data;

            // CRITICAL FIX: Update the global user state in AuthContext.
            // This immediately propagates changes to all subscribed components,
            // such as the main dashboard header avatar and name.
            updateUser(updatedUser);

            addToast("Profile updated successfully!", "success");

            // If the language was part of the update, change the app's language.
            // This ensures the UI language matches the user's new preference.
            if (variables.language && i18n.language !== variables.language) {
                i18n.changeLanguage(variables.language)
                    .catch(err => console.error("i18n: Failed to change language on profile update.", err));
            }

            // Allow the calling component to perform additional actions on success.
            if (options.onSuccess) {
                options.onSuccess(response, variables, context);
            }
        },
        onError: (error, variables, context) => {
            // Use a centralized error handler for consistent user feedback.
            const errorMessage = getErrorMessage(error, "Failed to update profile. Please try again.");
            addToast(errorMessage, "error");
            console.error("Profile update error:", error);

            if (options.onError) {
                options.onError(error, variables, context);
            }
        },
        // Spread any other options passed from the component.
        ...options
    });
};