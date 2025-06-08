import { useQuery } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { queryKeys } from '../../../services/queryKeys';

/**
 * A hook to fetch the active venue layout for the current business using React Query.
 * It handles caching, loading, and error states automatically.
 * 
 * The backend is expected to create a default layout if one doesn't exist,
 * so this hook can expect data to always be returned on success.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<object, Error>} The result object from React Query.
 *          The `data` property will contain the layout object.
 */
export const useLayoutData = () => {
    // We don't need the businessId as a parameter because the API service
    // uses an interceptor to add the auth token, and the backend
    // determines the active business from that token.
    const queryResult = useQuery({
        // The query key uniquely identifies this data.
        queryKey: queryKeys.activeVenueLayout(), // Note: using the function from queryKeys

        // The query function calls our API service.
        queryFn: async () => {
            const response = await apiService.getActiveVenueLayout();
            // Ensure the 'items' property is always an array, even if null/undefined from API
            if (response.data && !Array.isArray(response.data.items)) {
                response.data.items = [];
            }
            return response.data;
        },

        // --- React Query Options ---

        // Consider layout data to be "fresh" for 5 minutes.
        // This prevents unnecessary re-fetching if the user navigates away and back quickly.
        staleTime: 1000 * 60 * 5,

        // If a fetch fails, only retry once.
        retry: 1,

        // If the query returns a 404 or similar error, it's better to show an error message
        // than to fall back to a default layout here. The backend guarantees a layout exists.
        // If it doesn't, that's a true error state we need to display.
    });

    return queryResult;
};

// The other functions (saveDesignedLayout, resetLayoutToLocalDefaults) are related to the
// *designer* component, not the read-only display. They should be moved to a separate hook
// like `useLayoutDesignerStateManagement.js` if they are not already. For the purpose of
// fixing the Live Orders page, we only need the data-fetching part. We will leave them
// commented out here to strictly adhere to the current task.

/*
export const useLayoutDesigner = () => {
    // ... logic for saveDesignedLayout and resetLayoutToLocalDefaults would go here ...
    // This would likely use `useMutation` for saving.
}
*/

export default useLayoutData;