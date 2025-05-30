import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/api'; // Import the apiService
// Import constants for default layout structure
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION
} from '../constants/layoutConstants';
// ItemTypes might be needed for specific logic if any, but primary transformation is general
// import { ItemTypes } from '../constants/itemConfigs'; // Not directly used here but good to keep in mind

// const LAYOUT_STORAGE_KEY = 'bakeryFullLayout_v2'; // REMOVE: No longer using localStorage for primary storage

// Helper function to build the default layout structure in BACKEND format
const buildDefaultBackendLayout = () => ({
    id: null, // No ID for a new, unsaved layout
    name: 'Default Venue Layout',
    grid_rows: DEFAULT_INITIAL_GRID_ROWS,
    grid_cols: DEFAULT_INITIAL_GRID_COLS,
    grid_subdivision: DEFAULT_GRID_SUBDIVISION,
    items: [], // designItems will be 'items' in backend format
    // kitchenArea is not explicitly part of the backend model structure shown,
    // but if it were, it would be like: kitchen_area_definition: null,
    // For now, we'll manage it client-side based on items or assume it's part of 'items' if it's a special item type.
    // Based on current structure, kitchenArea seems to be a purely client-side concept derived or stored separately.
    // We'll keep it in the hook's state but it might not be directly part of the backend layout payload.
    // Let's assume kitchenArea is NOT part of the main backend layout object for now unless specified.
});

const useLayoutData = (openAlertModal) => {
    const [layoutData, setLayoutData] = useState(null); // Initial state is null until fetched
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    // Fetch layout from backend on mount
    useEffect(() => {
        const fetchLayout = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.getActiveVenueLayout();
                if (response.data && response.data.id) { // Check if a layout exists (has an ID)
                    // Backend data is assumed to be in the correct structure.
                    // No complex parsing needed here if backend sends it as expected.
                    // Ensure 'items' is an array.
                    setLayoutData({
                        ...response.data,
                        items: Array.isArray(response.data.items) ? response.data.items : [],
                    });
                    console.log("useLayoutData: Layout fetched from backend:", response.data);
                } else {
                    // No layout found on backend, or response is empty/unexpected (e.g., 204 No Content if new business)
                    console.log("useLayoutData: No active layout found on backend or unexpected response. Using default.");
                    setLayoutData(buildDefaultBackendLayout());
                }
            } catch (error) {
                console.error("useLayoutData: Error fetching layout from backend:", error);
                if (openAlertModal) {
                    const message = error.response?.data?.detail || error.message || "Could not load venue layout from the server.";
                    openAlertModal("Loading Error", message, "error");
                }
                // Fallback to a default local layout structure on error to allow editor to function
                setLayoutData(buildDefaultBackendLayout());
            } finally {
                setIsLoading(false);
                setInitialFetchDone(true);
            }
        };

        fetchLayout();
    }, [openAlertModal]); // Runs once on mount

    const saveDesignedLayout = useCallback(async (newDesignedLayoutDataFromEditor) => {
        // newDesignedLayoutDataFromEditor comes from LayoutEditor and has { designItems, gridDimensions }
        // designItems here are in FRONTEND format (flattened properties)
        // gridDimensions are { rows, cols, gridSubdivision }

        if (!layoutData && !initialFetchDone) {
            if (openAlertModal) openAlertModal("Save Error", "Layout data is not yet loaded. Please wait and try again.", "warning");
            return false;
        }

        setIsSaving(true);
        const { designItems: frontendItems, gridDimensions: newGridDimensions, name: layoutNameFromEditor } = newDesignedLayoutDataFromEditor;

        // Transform frontendItems to backend 'items' structure
        const backendItems = (frontendItems || []).map(feItem => {
            const beItem = {
                id: feItem.id?.startsWith("item_") || feItem.id?.startsWith("loaded_item_") ? undefined : feItem.id, // Send undefined for new items so backend generates ID
                item_type: feItem.itemType,
                grid_row_start: feItem.gridPosition?.rowStart,
                grid_col_start: feItem.gridPosition?.colStart,
                w_minor: feItem.w_minor,
                h_minor: feItem.h_minor,
                rotation: feItem.rotation || 0,
                layer: feItem.layer || 1, // Default layer if not specified
                is_fixed: feItem.isFixed || false, // Default is_fixed if not specified
                item_specific_props: {}
            };

            // Populate item_specific_props by excluding known base frontend keys
            // and mapping specific ones
            const baseFrontendKeys = ['id', 'itemType', 'gridPosition', 'w_minor', 'h_minor', 'rotation', 'layer', 'isFixed', 'effW_minor', 'effH_minor'];

            for (const key in feItem) {
                if (Object.prototype.hasOwnProperty.call(feItem, key) && !baseFrontendKeys.includes(key)) {
                    // Direct mapping for most properties to item_specific_props
                    // Specific transformations:
                    if (key === 'number') { // For tables
                        beItem.item_specific_props.table_number = feItem[key];
                    } else if (key === 'isProvisional') { // For tables
                        beItem.item_specific_props.is_provisional = feItem[key];
                    } else if (key === 'swingDirection') { // For doors
                        beItem.item_specific_props.swing_direction = feItem[key];
                    } else if (key === 'isOpen') { // For doors
                        beItem.item_specific_props.is_open = feItem[key];
                    }
                    // Add other specific frontendKey -> backendKey transformations here if any are different
                    // e.g. decorType, shape, seats, label, thickness_minor, length_units should be directly mapped
                    else if (['seats', 'shape', 'label', 'decorType', 'thickness_minor', 'length_units'].includes(key)) {
                        if (feItem[key] !== undefined) { // Only add if defined
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
            if (Object.keys(beItem.item_specific_props).length === 0) {
                delete beItem.item_specific_props; // Remove if empty, as per DRF behavior with empty JSONField (null=True)
            }
            return beItem;
        });

        const currentLayoutId = layoutData?.id; // Get ID from the fetched/current layout state
        const currentLayoutName = layoutData?.name;

        const payload = {
            id: currentLayoutId, // Send the ID if we are updating an existing layout
            name: layoutNameFromEditor || currentLayoutName || buildDefaultBackendLayout().name,
            grid_rows: newGridDimensions.rows,
            grid_cols: newGridDimensions.cols,
            grid_subdivision: newGridDimensions.gridSubdivision,
            items: backendItems,
            // kitchen_area: newDesignedLayoutDataFromEditor.kitchenArea, // If kitchenArea were part of backend payload
        };

        try {
            const response = await apiService.saveActiveVenueLayout(payload);
            // Update local state with the response from the backend, which should be the saved layout
            setLayoutData({
                ...response.data, // Assuming backend returns the full layout object including potentially new item IDs
                items: Array.isArray(response.data.items) ? response.data.items : [],
            });
            if (openAlertModal) openAlertModal("Layout Saved", "Venue layout has been successfully saved to the server.", "success");
            console.log("useLayoutData: Layout saved to backend. New state:", response.data);
            return true; // Indicate success
        } catch (error) {
            console.error("useLayoutData: Error saving layout to backend:", error);
            if (openAlertModal) {
                const message = error.response?.data?.detail || (typeof error.response?.data === 'object' ? JSON.stringify(error.response.data) : error.message) || "Could not save venue layout to the server.";
                openAlertModal("Save Error", message, "error");
            }
            return false; // Indicate failure
        } finally {
            setIsSaving(false);
        }
    }, [openAlertModal, layoutData, initialFetchDone]); // layoutData for current ID and name, initialFetchDone to prevent saving before load


    // resetLayoutToDefaults is more complex now. It should ideally:
    // 1. Create a default layout payload.
    // 2. Save this default layout to the backend (effectively overwriting or creating new if no ID).
    // 3. Update local state with this new default layout from backend response.
    // For simplicity, if "reset" means clearing items and using default grid for a *new* save,
    // then LayoutEditor would call saveDesignedLayout with empty items and default grid.
    // If "reset" means fetching a pristine default from backend, that's another API.
    // Let's assume "reset" means client-side state reset for now, and user must save it.
    // OR, we could make it save an empty layout to the backend.
    // For now, this reset will be local and prompt user to save.
    const resetLayoutToLocalDefaults = useCallback(() => {
        const defaultBackendStruct = buildDefaultBackendLayout();
        // If there was a loaded layout, keep its ID and name for the reset,
        // effectively clearing its items and grid to default for a subsequent save.
        const newLayoutState = {
            ...defaultBackendStruct,
            id: layoutData?.id,
            name: layoutData?.name || defaultBackendStruct.name,
        };
        setLayoutData(newLayoutState);
        if (openAlertModal) {
            openAlertModal("Layout Reset Locally", "The layout has been reset to default configuration. Save to persist these changes.", "info");
        }
        // This marks changes that need saving.
        // The onContentChange in VenueDesignerPage will be triggered by LayoutEditor using this new initial state.
    }, [openAlertModal, layoutData]);


    return {
        // layoutData is now in backend format {id, name, grid_rows, grid_cols, grid_subdivision, items: []}
        // 'items' within layoutData are in backend format (with item_specific_props)
        layoutData,
        isLoading,
        isSaving,
        initialFetchDone, // To let consumers know if the first fetch attempt has completed
        saveDesignedLayout, // Takes frontend-formatted layout data from editor
        resetLayoutToLocalDefaults, // Resets local state to default, needs explicit save
    };
};

export default useLayoutData;