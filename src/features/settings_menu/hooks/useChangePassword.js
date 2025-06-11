import { useMutation } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { getErrorMessage } from '../../../utils/getErrorMessage';

export const useChangePassword = (options = {}) => {
    const { addToast } = useToast();

    return useMutation({
        mutationFn: (passwordData) => {
            // The API service expects a POST request to this endpoint
            // with a payload of { old_password, new_password1, new_password2 }
            return apiService.post('auth/change-password/', passwordData);
        },
        onSuccess: (response, variables, context) => {
            addToast("Password changed successfully!", "success");

            if (options.onSuccess) {
                options.onSuccess(response, variables, context);
            }
        },
        onError: (error, variables, context) => {
            const errorMessage = getErrorMessage(error, "Failed to change password. Please try again.");
            addToast(errorMessage, "error");
            console.error("Password change error:", error);

            if (options.onError) {
                options.onError(error, variables, context);
            }
        },
        ...options
    });
};