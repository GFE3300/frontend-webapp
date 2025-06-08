import { useState, useEffect, useCallback } from 'react';
import { usePublicTableInfo } from '../../../contexts/VenueDataContext'; // Adjust path if necessary

// --- Constants for localStorage keys ---
const GUEST_NAME_KEY = 'smore-guest-name';
const GUEST_EMAIL_KEY = 'smore-guest-email';
const GUEST_PEOPLE_KEY = 'smore-guest-people';

/**
 * Custom hook to manage venue context information for the public menu view.
 * Fetches public table info, manages guest details (name, email, people) from localStorage,
 * and provides methods to update the context.
 *
 * @param {string} tableLayoutItemId - The ID of the table layout item.
 * @returns {object} An object containing:
 *  - venueContext: The current venue information.
 *  - isLoadingVenueContext: Boolean indicating if table info is loading.
 *  - isVenueContextError: Boolean indicating an error fetching table info.
 *  - venueContextError: The error object if an error occurred.
 *  - refetchVenueContext: Function to refetch table info.
 *  - updateVenueUserDetails: Callback to update userName, userEmail, and numberOfPeople.
 *  - logoError: Boolean indicating if the business logo failed to load.
 *  - setLogoError: Function to set the logoError state.
 */
export const useVenueContextManager = (tableLayoutItemId) => {
    const [venueContext, setVenueContext] = useState(null);
    const [logoError, setLogoError] = useState(false);

    const {
        data: publicTableInfoData,
        isLoading: isLoadingPublicTableInfo,
        isError: isPublicTableInfoError,
        error: publicTableInfoError,
        refetch: refetchPublicTableInfo,
    } = usePublicTableInfo(tableLayoutItemId, {
        enabled: !!tableLayoutItemId,
        retry: (failureCount, error) => (error.status === 404 || error.status === 400 ? false : failureCount < 1),
    });

    useEffect(() => {
        // This effect runs when the API data (publicTableInfoData) is fetched or an error occurs.
        // It's responsible for merging API data with persisted guest data from localStorage.
        
        if (publicTableInfoData) {
            // Retrieve persisted guest data from localStorage.
            const storedName = localStorage.getItem(GUEST_NAME_KEY);
            const storedEmail = localStorage.getItem(GUEST_EMAIL_KEY);
            const storedPeople = localStorage.getItem(GUEST_PEOPLE_KEY);

            setVenueContext(prevCtx => {
                const newCtx = {
                    // Core business data from the API
                    tableNumber: publicTableInfoData.table_display_number,
                    businessName: publicTableInfoData.business_name,
                    businessUUID: publicTableInfoData.business_uuid,
                    businessIdentifierForAPI: publicTableInfoData.business_slug || publicTableInfoData.business_uuid,
                    businessLogoUrl: publicTableInfoData.business_logo_url,
                    businessCurrency: publicTableInfoData.business_currency || 'USD',
                    
                    // Guest details: prioritize persisted data, then fall back to defaults.
                    // The `prevCtx` check is to maintain state across hot-reloads or minor refetches, but localStorage is the primary source.
                    userName: storedName !== null ? storedName : (prevCtx?.userName) || 'Guest',
                    userEmail: storedEmail !== null ? storedEmail : (prevCtx?.userEmail) || '',
                    numberOfPeople: storedPeople ? parseInt(storedPeople, 10) : (prevCtx?.numberOfPeople) || 1,
                };
                return newCtx;
            });
            setLogoError(false);
        } else if (isPublicTableInfoError) {
            setVenueContext(null);
        }
    }, [publicTableInfoData, isPublicTableInfoError]); // This effect depends on the API fetch result.

    const updateVenueUserDetails = useCallback(({ newUserName, newUserEmail, newNumberOfPeople }) => {
        setVenueContext(prev => {
            if (!prev) {
                // This shouldn't happen if UI waits for initial context load, but it's a safe fallback.
                console.warn("[useVenueContextManager] updateVenueUserDetails called before context was initialized.");
                return null;
            }

            // Prepare the updated context state
            const updatedCtx = { ...prev };
            
            if (newUserName !== undefined) {
                updatedCtx.userName = newUserName;
                localStorage.setItem(GUEST_NAME_KEY, newUserName);
            }
            if (newUserEmail !== undefined) {
                updatedCtx.userEmail = newUserEmail;
                localStorage.setItem(GUEST_EMAIL_KEY, newUserEmail);
            }
            if (newNumberOfPeople !== undefined) {
                updatedCtx.numberOfPeople = newNumberOfPeople;
                localStorage.setItem(GUEST_PEOPLE_KEY, String(newNumberOfPeople));
            }
            
            return updatedCtx;
        });
    }, []);

    return {
        venueContext,
        isLoadingVenueContext: isLoadingPublicTableInfo,
        isVenueContextError: isPublicTableInfoError,
        venueContextError: publicTableInfoError,
        refetchVenueContext: refetchPublicTableInfo,
        updateVenueUserDetails,
        logoError,
        setLogoError,
    };
};