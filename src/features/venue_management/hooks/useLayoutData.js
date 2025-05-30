import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/api'; // Import the apiService
// Import constants for default layout structure
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION
} from '../constants/layoutConstants';
// ItemTypes is not directly used here for parsing but good to be aware of them from itemConfigs.

// Helper function to build the default layout structure in BACKEND format
const buildDefaultBackendLayout = () => ({
    id: null, // No ID for a new, unsaved layout
    name: 'Default Venue Layout', // Default name
    grid_rows: DEFAULT_INITIAL_GRID_ROWS,
    grid_cols: DEFAULT_INITIAL_GRID_COLS,
    grid_subdivision: DEFAULT_GRID_SUBDIVISION,
    items: [], // designItems will be 'items' in backend format
    // kitchen_area_definition might be another field if backend supports it explicitly
});

const useLayoutData = (openAlertModal) => {
    const [layoutData, setLayoutData] = useState(null); // Stores layout in BACKEND format
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    // Fetch layout from backend on mount
    useEffect(() => {
        const fetchLayout = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.getActiveVenueLayout();
                if (response.data && response.data.id) { // Existing layout found
                    setLayoutData({
                        ...response.data,
                        items: Array.isArray(response.data.items) ? response.data.items : [],
                    });
                    console.log("[useLayoutData] Layout fetched from backend:", response.data);
                } else {
                    // No layout found (e.g., 204 No Content, or backend signals new business by returning empty/null)
                    console.log("[useLayoutData] No active layout found on backend. Using default local structure.");
                    setLayoutData(buildDefaultBackendLayout());
                }
            } catch (error) {
                console.error("[useLayoutData] Error fetching layout from backend:", error);
                if (openAlertModal) {
                    const message = error.response?.data?.detail || error.message || "Could not load venue layout from the server.";
                    openAlertModal("Loading Error", message, "error");
                }
                setLayoutData(buildDefaultBackendLayout()); // Fallback to default
            } finally {
                setIsLoading(false);
                setInitialFetchDone(true);
            }
        };

        fetchLayout();
    }, [openAlertModal]); // Runs once on mount

    const saveDesignedLayout = useCallback(async (designedLayoutDataFromEditor) => {

        console.log("[useLayoutData] designedLayoutDataFromEditor received:", JSON.stringify(designedLayoutDataFromEditor, null, 2));

        // designedLayoutDataFromEditor: { designItems (frontend format), gridDimensions, name (optional) }
        if (!initialFetchDone) { // Prevent saving if initial load isn't complete
            if (openAlertModal) openAlertModal("Save Error", "Layout data is not yet loaded. Please wait and try again.", "warning");
            return false;
        }
        if (!designedLayoutDataFromEditor) {
            if (openAlertModal) openAlertModal("Save Error", "No layout data provided to save.", "error");
            return false;
        }

        setIsSaving(true);
        const { designItems: frontendItems, gridDimensions: newGridDimensions, name: layoutNameFromEditor } = designedLayoutDataFromEditor;

        console.log("[useLayoutData] Extracted frontendItems:", JSON.stringify(frontendItems, null, 2));

        const backendItems = (frontendItems || []).map(feItem => {
            const beItem = {
                // Handle ID: if client-generated, send undefined so backend assigns UUID.
                id: (feItem.id?.startsWith("item_") || feItem.id?.startsWith("loaded_item_")) ? undefined : feItem.id,
                item_type: feItem.itemType,
                grid_row_start: feItem.gridPosition?.rowStart,
                grid_col_start: feItem.gridPosition?.colStart,
                w_minor: feItem.w_minor,
                h_minor: feItem.h_minor,
                rotation: feItem.rotation || 0,
                layer: feItem.layer || 1,
                is_fixed: feItem.isFixed || false,
                item_specific_props: {}
            };

            // Known base frontend keys that are NOT part of item_specific_props
            // and are handled above or are purely frontend (effW_minor, effH_minor).
            const baseFrontendKeys = ['id', 'itemType', 'gridPosition', 'w_minor', 'h_minor', 'rotation', 'layer', 'isFixed', 'effW_minor', 'effH_minor'];

            for (const key in feItem) {
                if (Object.prototype.hasOwnProperty.call(feItem, key) && !baseFrontendKeys.includes(key)) {
                    // Specific mappings from frontend key to backend item_specific_props key
                    if (key === 'number') { // For tables
                        beItem.item_specific_props.table_number = feItem[key];
                    } else if (key === 'isProvisional') { // For tables
                        beItem.item_specific_props.is_provisional = feItem[key];
                    } else if (key === 'swingDirection') { // For doors
                        beItem.item_specific_props.swing_direction = feItem[key];
                    } else if (key === 'isOpen') { // For doors
                        beItem.item_specific_props.is_open = feItem[key];
                    }
                    // Direct mapping for other known specific props (already named as backend expects)
                    else if (['seats', 'shape', 'label', 'decorType', 'thickness_minor', 'length_units'].includes(key)) {
                        if (feItem[key] !== undefined) {
                            beItem.item_specific_props[key] = feItem[key];
                        }
                    }
                    // Any other properties not explicitly handled but not in baseKeys are assumed to be specific
                    else {
                        if (feItem[key] !== undefined) {
                            beItem.item_specific_props[key] = feItem[key];
                        }
                    }
                }
            }
            // Remove item_specific_props if empty, as per DRF behavior with empty JSONField (null=True)
            if (Object.keys(beItem.item_specific_props).length === 0) {
                delete beItem.item_specific_props;
            }
            return beItem;
        });

        const currentLayoutId = layoutData?.id; // Get ID from the fetched/current layout state
        const currentLayoutName = layoutData?.name;

        const payload = {
            id: currentLayoutId, // Send the ID if updating an existing layout
            name: layoutNameFromEditor || currentLayoutName || buildDefaultBackendLayout().name,
            grid_rows: newGridDimensions.rows,
            grid_cols: newGridDimensions.cols,
            grid_subdivision: newGridDimensions.gridSubdivision,
            items: backendItems,
            // kitchen_area_definition: designedLayoutDataFromEditor.kitchenArea, // If backend supports kitchen_area_definition
        };

        console.log("[useLayoutData] FINAL PAYLOAD being sent to backend:", JSON.stringify(payload, null, 2));

        try {
            const response = await apiService.saveActiveVenueLayout(payload);
            setLayoutData({ // Update local state with the response from the backend
                ...response.data,
                items: Array.isArray(response.data.items) ? response.data.items : [],
            });
            if (openAlertModal) openAlertModal("Layout Saved", "Venue layout has been successfully saved.", "success");
            console.log("[useLayoutData] Layout saved to backend. New state:", response.data);
            return true; // Indicate success
        } catch (error) {
            console.error("[useLayoutData] Error saving layout to backend:", error);
            if (openAlertModal) {
                let message = "Could not save venue layout.";
                if (error.response?.data) {
                    // Attempt to parse DRF field errors
                    if (typeof error.response.data === 'object') {
                        let fieldErrors = [];
                        for (const field in error.response.data) {
                            if (Array.isArray(error.response.data[field])) {
                                fieldErrors.push(`${field}: ${error.response.data[field].join(', ')}`);
                            } else {
                                fieldErrors.push(`${field}: ${String(error.response.data[field])}`);
                            }
                        }
                        if (fieldErrors.length > 0) message += ` Details: ${fieldErrors.join('; ')}`;
                        else if (error.response.data.detail) message = error.response.data.detail; // General detail error
                    } else {
                        message = String(error.response.data); // Non-object error response
                    }
                } else if (error.message) {
                    message = error.message;
                }
                openAlertModal("Save Error", message, "error");
            }
            return false; // Indicate failure
        } finally {
            setIsSaving(false);
        }
    }, [openAlertModal, layoutData, initialFetchDone]);

    const resetLayoutToLocalDefaults = useCallback(() => {
        const defaultBackendStruct = buildDefaultBackendLayout();
        // Preserve current layout's ID and Name for the reset action.
        // This means "reset" clears items and grid settings for the *current* layout ID.
        const newLayoutState = {
            ...defaultBackendStruct,
            id: layoutData?.id, // Keep current ID
            name: layoutData?.name || defaultBackendStruct.name, // Keep current name or default
        };
        setLayoutData(newLayoutState); // Update local state to this default structure
        if (openAlertModal) {
            openAlertModal("Layout Reset Locally", "The layout has been reset to default. Save to persist these changes.", "info");
        }
        // This action itself signifies a change that will need saving.
        // The onContentChange in VenueDesignerPage will be triggered if LayoutEditor's
        // initial state (derived from this) changes compared to its previous state.
    }, [openAlertModal, layoutData]);


    return {
        layoutData, // This is in BACKEND format
        isLoading,
        isSaving,
        initialFetchDone,
        saveDesignedLayout, // Expects frontend-formatted layout, transforms it for backend
        resetLayoutToLocalDefaults,
    };
};

export default useLayoutData;