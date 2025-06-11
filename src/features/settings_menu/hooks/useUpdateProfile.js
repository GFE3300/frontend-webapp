import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';

export const useUpdateProfile = (options = {}) => {
    const { updateUser } = useAuth();
    const { addToast } = useToast();

    return useMutation({
        mutationFn: (userData) => {
            // This service function sends a PATCH request to /api/auth/user/
            return apiService.updateCurrentUser(userData);
        },
        onSuccess: (response, variables, context) => {
            const updatedUser = response.data;
            updateUser(updatedUser); // Update the global auth context with the new user data
            addToast("Profile updated successfully!", "success");

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