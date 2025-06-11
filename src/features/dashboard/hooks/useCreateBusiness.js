import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { getErrorMessage } from '../../../utils/getErrorMessage';

/**
 * A custom mutation hook to create a new business.
 * This hook handles the API call, seamless user context switching upon success,
 * and comprehensive error handling.
 *
 * @param {object} [options={}] - Optional TanStack Query mutation options.
 * @returns {import('@tanstack/react-query').UseMutationResult} The result object from useMutation.
 */

export const useCreateBusiness = (options = {}) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { login } = useAuth(); // Use the login function for seamless context switching.

    return useMutation({
        mutationFn: (newBusinessData) => {
            // The mutation function calls the apiService to create the business.
            // The payload (newBusinessData) will be constructed in the UI component.
            return apiService.createBusiness(newBusinessData);
        },
        onSuccess: (response) => {
            // The backend responds with new tokens containing the updated active business context.
            const { access, refresh, name: newBusinessName } = response.data;

            if (!access || !refresh) {
                console.error("Create Business Success: New tokens were not received from the backend.");
                addToast("Session update failed. Please switch business manually.", "warning");
                // Invalidate queries anyway, so the user can manually switch.
                queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
                navigate('/dashboard/business/overview', { replace: true });
                return;
            }

            // This is the core of the "seamless switch".
            // The login function from AuthContext updates the entire user state,
            // including tokens in localStorage and the user object in context.
            login(access, refresh);

            // Invalidate the 'myBusinesses' query to ensure the BusinessSwitcher dropdown
            // is updated with the newly created business.
            queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });

            addToast(`Business "${newBusinessName}" created and set as active!`, "success");

            // Navigate the user to the overview page of their new active business context.
            navigate('/dashboard/business/overview', { replace: true });

            // Call any additional onSuccess callback provided by the component.
            options.onSuccess?.(response);
        },
        onError: (error) => {
            // Use a utility to parse the error and get a user-friendly message.
            const errorMessage = getErrorMessage(error, 'Failed to create business. Please try again.');
            addToast(errorMessage, 'error');

            console.error("Create Business Mutation Error:", error);

            // Call any additional onError callback provided by the component.
            options.onError?.(error);
        },
        // Spread any other options passed to the hook.
        ...options,
    });
};