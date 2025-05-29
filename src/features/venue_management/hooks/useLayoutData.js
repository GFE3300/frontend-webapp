// FILE: useLayoutData.js
// PATH: C:\Users\Gilberto F\Desktop\Smore\frontend\src\features\venue_management\hooks\useLayoutData.js

import { useState, useEffect, useCallback } from 'react';
// Original imports for default layout structure
import {
    initialTableLayoutData as defaultLayout,
    // sampleOrders, // Commented out for now
    // generateOrderId // Commented out for now
} from '../utils/orderUtils'; // Keep path to orderUtils for defaultLayout
import { ItemTypes } from '../constants/itemConfigs'; // Needed for table filtering if any

const LAYOUT_STORAGE_KEY = 'bakeryFullLayout_v2'; // Keep your existing storage key

const useLayoutData = (openAlertModal) => {
    const [layoutData, setLayoutData] = useState(() => {
        try {
            const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Basic validation: ensure gridDimensions and tables array exist
                if (parsed.gridDimensions && parsed.gridDimensions.rows && parsed.gridDimensions.cols && Array.isArray(parsed.tables)) {
                    // Further ensure gridSubdivision exists, defaulting if not.
                    const gridDimensions = {
                        ...defaultLayout.gridDimensions, // Provide defaults for any missing grid dimension props
                        ...parsed.gridDimensions,
                        gridSubdivision: parsed.gridDimensions.gridSubdivision || defaultLayout.gridDimensions.gridSubdivision || 1,
                    };
                    return { ...defaultLayout, ...parsed, gridDimensions };
                }
            }
            return { ...defaultLayout }; // Ensure a deep copy or spread of defaultLayout
        } catch (error) {
            console.error("Error loading layout from localStorage:", error);
            // openAlertModal might not be available here if error is in initial state function.
            // Consider a way to signal this error if it's critical.
            return { ...defaultLayout };
        }
    });

    // Persist to localStorage whenever layoutData changes
    useEffect(() => {
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutData));
        } catch (error) {
            console.error("Error saving layout to localStorage:", error);
            if (openAlertModal) { // Check if openAlertModal is provided
                openAlertModal("Storage Error", "Could not save layout changes. Your browser's local storage might be full or disabled.", "error");
            }
        }
    }, [layoutData, openAlertModal]);

    const saveDesignedLayout = useCallback((newDesignedLayoutData) => {
        // newDesignedLayoutData comes from LayoutEditor and has { designItems, gridDimensions }
        // The items in newDesignedLayoutData.designItems are already structured correctly by LayoutEditor's useLayoutDesignerStateManagement.
        // These items should be directly usable.

        // Filter out any provisional tables that don't have a number, or handle as needed.
        // For now, we assume LayoutEditor's save validation ensures tables are valid.
        const sanitizedItems = (newDesignedLayoutData.designItems || []).map(item => {
            // If items need further sanitization before saving (e.g., removing temporary UI state), do it here.
            // For now, we trust items from LayoutEditor are ready.
            // Example: If 'tables' in layoutData are expected to have order status (for future)
            // const existingTable = layoutData.tables.find(t => t.id === item.id);
            return {
                ...item,
                // status: existingTable?.status || 'empty', // Preserve existing status or default
                // order: existingTable?.order || null,      // Preserve existing order or default
            };
        });

        try {
            setLayoutData(prevLayoutData => ({
                // The structure from LayoutEditor should be { designItems, gridDimensions }
                // We store designItems as 'tables' in this hook's state to maintain compatibility
                // with how LiveOrderDashboard (soon VenueLayoutPreview) might have used it.
                // However, it's cleaner if the state here directly reflects `designItems`.
                // Let's align to `designItems` for clarity moving forward.
                designItems: sanitizedItems, // Store as 'designItems'
                gridDimensions: newDesignedLayoutData.gridDimensions || defaultLayout.gridDimensions,
                kitchenArea: newDesignedLayoutData.kitchenArea !== undefined ? newDesignedLayoutData.kitchenArea : (prevLayoutData.kitchenArea || null),
            }));
            // openAlertModal is handled by VenueDesignerPage now after save.
            // If save is successful, return true.
            return true;
        } catch (e) {
            console.error("Error in setLayoutData during saveDesignedLayout:", e);
            if (openAlertModal) {
                openAlertModal("Save Error", "An unexpected error occurred while trying to prepare the layout for saving.", "error");
            }
            return false;
        }
    }, [openAlertModal, defaultLayout.gridDimensions]); // Removed layoutData from deps to avoid potential stale closures if not careful

    // --- Order Simulation Logic - Temporarily Commented Out ---
    /*
    const updateTableStatusAndOrder = useCallback((tableId, newStatus, newOrderData = null) => {
        setLayoutData(prevLayout => ({
            ...prevLayout,
            // Ensure you are updating the correct array (e.g., designItems if that's the new standard)
            designItems: prevLayout.designItems.map(t =>
                t.id === tableId ? { ...t, status: newStatus, order: newOrderData } : t
            ),
        }));
    }, []);

    const clearTableOrder = useCallback((tableId) => {
        updateTableStatusAndOrder(tableId, 'empty', null);
    }, [updateTableStatusAndOrder]);

    const placeSimulatedOrder = useCallback(() => {
        const availableTables = layoutData.designItems.filter(t => t.itemType === ItemTypes.PLACED_TABLE && t.status === 'empty');
        if (!availableTables.length) {
            if (openAlertModal) {
                openAlertModal('No Empty Tables', 'Cannot simulate order: all tables are currently occupied.', 'warning');
            }
            return false;
        }
        // ... (rest of simulation logic)
        // const chosenTable = ...
        // const orderDetails = ...
        // const newOrder = ...
        // updateTableStatusAndOrder(chosenTable.id, 'new_order', newOrder);
        return true;
    }, [layoutData.designItems, updateTableStatusAndOrder, openAlertModal]);
    */

    const resetLayoutToDefaults = useCallback(() => {
        setLayoutData({ ...defaultLayout }); // Spread to ensure a new object
        if (openAlertModal) {
            openAlertModal("Layout Reset", "The layout has been reset to its default configuration.", "info");
        }
    }, [openAlertModal, defaultLayout]);


    return {
        // Provide layoutData directly. Consumers will access layoutData.designItems, layoutData.gridDimensions etc.
        layoutData,
        saveDesignedLayout, // Returns true on success, false on failure
        resetLayoutToDefaults,

        // --- Derived state - Consumers can derive these from layoutData directly if preferred,
        // or we can provide them for convenience. For now, let consumers derive.
        // tables: layoutData.designItems?.filter(item => item.itemType === ItemTypes.PLACED_TABLE) || [],
        // currentGridDimensions: layoutData.gridDimensions,
        // kitchenArea: layoutData.kitchenArea,

        // --- Commented out order-specific derived states ---
        // newOrdersCount: layoutData.designItems?.filter(t => t.itemType === ItemTypes.PLACED_TABLE && t.status === 'new_order').length || 0,
        // viewedOrders: layoutData.designItems?.filter(t => t.itemType === ItemTypes.PLACED_TABLE && t.status === 'viewed_order' && t.order) || [],
    };
};

export default useLayoutData;