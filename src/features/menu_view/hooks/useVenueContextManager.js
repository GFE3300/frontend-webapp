import { useState, useEffect, useCallback } from 'react';
import { usePublicTableInfo } from '../../../contexts/VenueDataContext'; // Adjust path if necessary

/**
 * Custom hook to manage venue context information.
 * Fetches public table info and provides methods to update parts of the venue context.
 *
 * @param {string} tableLayoutItemId - The ID of the table layout item.
 * @returns {object} An object containing:
 *  - venueContext: The current venue information (null if not loaded/error).
 *  - isLoadingVenueContext: Boolean indicating if table info is loading.
 *  - isVenueContextError: Boolean indicating an error fetching table info.
 *  - venueContextError: The error object if an error occurred.
 *  - refetchVenueContext: Function to refetch table info.
 *  - updateVenueUserDetails: Callback to update userName and numberOfPeople.
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
        console.log("[useVenueContextManager Effect] Running. publicTableInfoData:", publicTableInfoData, "isError:", isPublicTableInfoError);
        if (publicTableInfoData) {
            setVenueContext(prevCtx => {
                const newCtx = {
                    tableNumber: publicTableInfoData.table_display_number,
                    businessName: publicTableInfoData.business_name,
                    businessUUID: publicTableInfoData.business_uuid,
                    businessIdentifierForAPI: publicTableInfoData.business_slug || publicTableInfoData.business_uuid,
                    businessLogoUrl: publicTableInfoData.business_logo_url,
                    // Preserve userName and numberOfPeople if they were already set (e.g., by SetupStage or GuestProfileModal)
                    // and the core business data hasn't changed in a way that would invalidate them.
                    // If prevCtx is null (first load) or tableNumber differs (significant change), use defaults.
                    userName: (prevCtx && prevCtx.tableNumber === publicTableInfoData.table_display_number) ? prevCtx.userName : 'Guest',
                    numberOfPeople: (prevCtx && prevCtx.tableNumber === publicTableInfoData.table_display_number) ? prevCtx.numberOfPeople : 1,
                };
                console.log("[useVenueContextManager Effect] Setting venueContext:", newCtx, "Previous context was:", prevCtx);
                return newCtx;
            });
            setLogoError(false);
        } else if (isPublicTableInfoError) {
            console.log("[useVenueContextManager Effect] Error detected, setting venueContext to null.");
            setVenueContext(null);
        }
    }, [publicTableInfoData, isPublicTableInfoError]); // Dependencies only on fetched data/error status

    const updateVenueUserDetails = useCallback(({ newUserName, newNumberOfPeople }) => {
        setVenueContext(prev => {
            if (!prev) {
                console.warn("[useVenueContextManager] updateVenueUserDetails called when prev context was null. This is unusual. Initializing with user details.");
                // This scenario is less likely if AppContent waits for initial venueContext.
                // If it happens, we only have user details to set.
                return {
                    // Core business data would be missing here.
                    // This indicates a potential logic flaw if called before initial load.
                    userName: newUserName,
                    numberOfPeople: newNumberOfPeople,
                };
            }
            const updatedCtx = {
                ...prev,
                userName: newUserName !== undefined ? newUserName : prev.userName,
                numberOfPeople: newNumberOfPeople !== undefined ? newNumberOfPeople : prev.numberOfPeople,
            };
            console.log("[useVenueContextManager] updateVenueUserDetails. New context:", updatedCtx);
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