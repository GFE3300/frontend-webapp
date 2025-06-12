import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A custom hook to handle the logic for creating and redirecting to a
 * Stripe Customer Portal session.
 *
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {{
 *  manageSubscription: Function,
 *  isLoading: boolean
 * }} An object containing the mutation function and its loading state.
 */
export const useManageSubscription = (options = {}) => {
    const { addToast } = useToast();

    const mutation = useMutation({
        mutationFn: () => {
            // This API call requires no payload. It uses the user's session
            // on the backend to create a portal session for them.
            return apiService.createCustomerPortalSession();
        },
        onMutate: () => {
            // Fired before the mutation function. Good for optimistic UI updates
            // or showing initial feedback.
            addToast(sl.subscriptionManagement.redirectingToast, "info", 3000);
        },
        onSuccess: (response) => {
            // The backend successfully returned the portal URL.
            // The data object from the response should contain the url.
            const portalUrl = response.data.url;

            if (portalUrl) {
                // Redirect the user to the Stripe Customer Portal.
                window.location.href = portalUrl;
            } else {
                // This case handles if the API responds 200 OK but without a URL.
                console.error("Failed to get portal URL from the server response.", response);
                addToast(sl.subscriptionManagement.portalErrorToast, "error");
            }

            // Call any additional onSuccess callback provided by the component.
            if (options.onSuccess) {
                options.onSuccess(response);
            }
        },
        onError: (error) => {
            // Use a utility to parse the error and get a user-friendly message.
            const errorMessage = getErrorMessage(error, sl.subscriptionManagement.portalErrorToast);
            addToast(errorMessage, 'error');
            console.error("Create Customer Portal Session Error:", error);

            // Call any additional onError callback provided by the component.
            if (options.onError) {
                options.onError(error);
            }
        },
        // Spread any other options passed to the hook.
        ...options,
    });

    return {
        // Expose the mutate function with a more descriptive name.
        manageSubscription: mutation.mutate,
        // Expose the loading state for the UI (e.g., disabling buttons).
        isLoading: mutation.isPending,
    };
};