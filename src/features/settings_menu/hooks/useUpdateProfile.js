import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import i18n from '../../../i18n';

export const useUpdateProfile = (options = {}) => {
    const { updateUser } = useAuth();
    const { addToast } = useToast();

    return useMutation({
        mutationFn: (userData) => {
            return apiService.updateCurrentUser(userData);
        },
        onSuccess: (response, variables, context) => {
            const updatedUser = response.data;
            updateUser(updatedUser);
            addToast("Profile updated successfully!", "success");

            // If language was changed, update the i18next instance
            if (variables.language && i18n.language !== variables.language) {
                i18n.changeLanguage(variables.language);
            }

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