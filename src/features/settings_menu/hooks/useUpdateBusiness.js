import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { queryKeys } from '../../../services/queryKeys';

/**
 * Custom hook for updating business details.
 * @param {object} options - Optional TanStack Query mutation options.
 */
export const useUpdateBusiness = (options = {}) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    return useMutation({
        mutationFn: ({ businessId, payload }) => {
            // Sends a PATCH request to the business detail endpoint.
            return apiService.patch(`businesses/${businessId}/`, payload);
        },
        onSuccess: (data, variables) => {
            addToast("Business profile updated successfully!", "success");
            // Invalidate the query for this specific business's details to refetch fresh data.
            queryClient.invalidateQueries({ queryKey: queryKeys.businessDetails(variables.businessId) });

            // Also invalidate the list of businesses in case the name changed.
            queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });

            if (options.onSuccess) {
                options.onSuccess(data, variables);
            }
        },
        onError: (error, variables, context) => {
            const errorMessage = getErrorMessage(error, "Failed to update business profile.");
            addToast(errorMessage, "error");
            console.error("Business update error:", error);

            if (options.onError) {
                options.onError(error, variables, context);
            }
        },
        ...options,
    });
};