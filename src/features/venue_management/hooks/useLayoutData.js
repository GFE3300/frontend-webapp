import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/api';
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION
} from '../constants/layoutConstants';

// Localization
import slRaw, { interpolate } from '../utils/script_lines.js';

const sl = slRaw.venueManagement.useLayoutData;

const buildDefaultBackendLayout = () => ({
    id: null,
    name: 'Default Venue Layout', // This could also be localized if needed for new layouts
    grid_rows: DEFAULT_INITIAL_GRID_ROWS,
    grid_cols: DEFAULT_INITIAL_GRID_COLS,
    grid_subdivision: DEFAULT_GRID_SUBDIVISION,
    items: [],
});

const useLayoutData = (openAlertModal) => {
    const [layoutData, setLayoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    useEffect(() => {
        const fetchLayout = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.getActiveVenueLayout();
                if (response.data && response.data.id) {
                    setLayoutData({
                        ...response.data,
                        items: Array.isArray(response.data.items) ? response.data.items : [],
                    });
                    // console.log("[useLayoutData] Layout fetched from backend:", response.data);
                } else {
                    // console.log("[useLayoutData] No active layout found on backend. Using default local structure.");
                    if (openAlertModal) { // Inform user about using default
                        openAlertModal(
                            slRaw.info || "Info", // Using a common "Info" title
                            sl.noActiveLayoutMessage || "No active layout found on backend. Using default local structure.",
                            "info"
                        );
                    }
                    setLayoutData(buildDefaultBackendLayout());
                }
            } catch (error) {
                console.error("[useLayoutData] Error fetching layout from backend:", error);
                if (openAlertModal) {
                    const message = error.response?.data?.detail || error.message || (sl.loadingErrorMessageDefault || "Could not load venue layout from the server.");
                    openAlertModal(sl.loadingErrorTitle || "Loading Error", message, "error");
                }
                setLayoutData(buildDefaultBackendLayout());
            } finally {
                setIsLoading(false);
                setInitialFetchDone(true);
            }
        };

        fetchLayout();
    }, [openAlertModal]);

    const saveDesignedLayout = useCallback(async (designedLayoutDataFromEditor) => {
        if (!initialFetchDone) {
            if (openAlertModal) openAlertModal(
                sl.saveErrorTitle || "Save Error",
                sl.saveErrorNotLoaded || "Layout data is not yet loaded. Please wait and try again.",
                "warning"
            );
            return false;
        }
        if (!designedLayoutDataFromEditor) {
            if (openAlertModal) openAlertModal(
                sl.saveErrorTitle || "Save Error",
                sl.saveErrorNoData || "No layout data provided to save.",
                "error"
            );
            return false;
        }

        setIsSaving(true);
        const { designItems: frontendItems, gridDimensions: newGridDimensions, name: layoutNameFromEditor } = designedLayoutDataFromEditor;

        const backendItems = (frontendItems || []).map(feItem => {
            const beItem = {
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

            const baseFrontendKeys = ['id', 'itemType', 'gridPosition', 'w_minor', 'h_minor', 'rotation', 'layer', 'isFixed', 'effW_minor', 'effH_minor'];

            for (const key in feItem) {
                if (Object.prototype.hasOwnProperty.call(feItem, key) && !baseFrontendKeys.includes(key)) {
                    if (key === 'number') {
                        beItem.item_specific_props.table_number = feItem[key];
                    } else if (key === 'isProvisional') {
                        beItem.item_specific_props.is_provisional = feItem[key];
                    } else if (key === 'swingDirection') {
                        beItem.item_specific_props.swing_direction = feItem[key];
                    } else if (key === 'isOpen') {
                        beItem.item_specific_props.is_open = feItem[key];
                    } else if (['seats', 'shape', 'label', 'decorType', 'thickness_minor', 'length_units'].includes(key)) {
                        if (feItem[key] !== undefined) {
                            beItem.item_specific_props[key] = feItem[key];
                        }
                    } else {
                        if (feItem[key] !== undefined) {
                            beItem.item_specific_props[key] = feItem[key];
                        }
                    }
                }
            }
            if (Object.keys(beItem.item_specific_props).length === 0) {
                delete beItem.item_specific_props;
            }
            return beItem;
        });

        const currentLayoutId = layoutData?.id;
        const currentLayoutName = layoutData?.name;

        const payload = {
            id: currentLayoutId,
            name: layoutNameFromEditor || currentLayoutName || buildDefaultBackendLayout().name,
            grid_rows: newGridDimensions.rows,
            grid_cols: newGridDimensions.cols,
            grid_subdivision: newGridDimensions.gridSubdivision,
            items: backendItems,
        };

        try {
            const response = await apiService.saveActiveVenueLayout(payload);
            setLayoutData({
                ...response.data,
                items: Array.isArray(response.data.items) ? response.data.items : [],
            });
            if (openAlertModal) openAlertModal(
                sl.layoutSavedTitle || "Layout Saved",
                sl.layoutSavedMessage || "Venue layout has been successfully saved.",
                "success"
            );
            return true;
        } catch (error) {
            console.error("[useLayoutData] Error saving layout to backend:", error);
            if (openAlertModal) {
                let message = sl.saveErrorDefault || "Could not save venue layout.";
                if (error.response?.data) {
                    if (typeof error.response.data === 'object') {
                        let fieldErrors = [];
                        for (const field in error.response.data) {
                            if (Array.isArray(error.response.data[field])) {
                                fieldErrors.push(`${field}: ${error.response.data[field].join(', ')}`);
                            } else {
                                fieldErrors.push(`${field}: ${String(error.response.data[field])}`);
                            }
                        }
                        if (fieldErrors.length > 0) {
                            message += ` ${interpolate(sl.saveErrorDetailsPrefix || "Details: {details}", { details: fieldErrors.join('; ') })}`;
                        } else if (error.response.data.detail) {
                            message = error.response.data.detail;
                        }
                    } else {
                        message = String(error.response.data);
                    }
                } else if (error.message) {
                    message = error.message;
                }
                openAlertModal(sl.saveErrorTitle || "Save Error", message, "error");
            }
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [openAlertModal, layoutData, initialFetchDone]);

    const resetLayoutToLocalDefaults = useCallback(() => {
        const defaultBackendStruct = buildDefaultBackendLayout();
        const newLayoutState = {
            ...defaultBackendStruct,
            id: layoutData?.id,
            name: layoutData?.name || defaultBackendStruct.name,
        };
        setLayoutData(newLayoutState);
        if (openAlertModal) {
            openAlertModal(
                sl.resetLocallyTitle || "Layout Reset Locally",
                sl.resetLocallyMessage || "The layout has been reset to default. Save to persist these changes.",
                "info"
            );
        }
    }, [openAlertModal, layoutData]);


    return {
        layoutData,
        isLoading,
        isSaving,
        initialFetchDone,
        saveDesignedLayout,
        resetLayoutToLocalDefaults,
    };
};

export default useLayoutData;