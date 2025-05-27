// src/features/venue_management/hooks/useLayoutData.js
import { useState, useEffect, useCallback } from 'react';
import {
    initialTableLayoutData as defaultLayout,
    sampleOrders,
    generateOrderId
} from '../utils/orderUtils';

const LAYOUT_STORAGE_KEY = 'bakeryFullLayout_v2';

const useLayoutData = (openAlertModal) => {
    const [layoutData, setLayoutData] = useState(() => {
        try {
            const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Basic validation
                if (parsed.gridDimensions && parsed.gridDimensions.rows && parsed.gridDimensions.cols && Array.isArray(parsed.tables)) {
                    return { ...defaultLayout, ...parsed };
                }
            }
            return defaultLayout;
        } catch (error) {
            console.error("Error loading layout from localStorage:", error);
            return defaultLayout;
        }
    });

    // Persist to localStorage whenever layoutData changes
    useEffect(() => {
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutData));
        } catch (error) {
            console.error("Error saving layout to localStorage:", error);
            if (openAlertModal) {
                openAlertModal("Storage Error", "Could not save layout changes. Your browser's local storage might be full or disabled.", "error");
            }
        }
    }, [layoutData, openAlertModal]);

    const saveDesignedLayout = useCallback((newDesignedLayoutData) => {
        // newDesignedLayoutData comes from LayoutDesigner and has { designItems, gridDimensions }
        const sanitizedItems = (newDesignedLayoutData.designItems || []).map(t => ({
            ...t,
            status: 'empty',
            order: null,
        }));
        const dataToSave = {
            tables: sanitizedItems,
            gridDimensions: newDesignedLayoutData.gridDimensions || defaultLayout.gridDimensions,
            kitchenArea: newDesignedLayoutData.kitchenArea || null,
        };
        setLayoutData(prevLayoutData => {
            const dataToSave = {
                tables: sanitizedItems, // Store the designItems as 'tables' internally in useLayoutData
                gridDimensions: newDesignedLayoutData.gridDimensions || defaultLayout.gridDimensions,
                // Preserve existing kitchenArea if LayoutDesigner doesn't send it back.
                kitchenArea: newDesignedLayoutData.kitchenArea !== undefined ? newDesignedLayoutData.kitchenArea : prevLayoutData.kitchenArea,
            };
            return dataToSave;
        });
        if (openAlertModal) {
            openAlertModal("Layout Saved", "The new table layout has been saved successfully.", "success");
        }
    }, [openAlertModal]);

    const updateTableStatusAndOrder = useCallback((tableId, newStatus, newOrderData = null) => {
        setLayoutData(prevLayout => ({
            ...prevLayout,
            tables: prevLayout.tables.map(t =>
                t.id === tableId ? { ...t, status: newStatus, order: newOrderData } : t
            ),
        }));
    }, []);

    const clearTableOrder = useCallback((tableId) => {
        updateTableStatusAndOrder(tableId, 'empty', null);
        // No modal here, as it's usually preceded by a confirmation in the UI
    }, [updateTableStatusAndOrder]);

    const placeSimulatedOrder = useCallback(() => {
        const availableTables = layoutData.tables.filter(t => t.status === 'empty');
        if (!availableTables.length) {
            if (openAlertModal) {
                openAlertModal('No Empty Tables', 'Cannot simulate order: all tables are currently occupied.', 'warning');
            }
            return false;
        }
        const chosenTable = availableTables[Math.floor(Math.random() * availableTables.length)];
        const orderDetails = sampleOrders[Math.floor(Math.random() * sampleOrders.length)];
        const newOrder = {
            id: generateOrderId(),
            ...orderDetails,
            tableNumber: chosenTable.number,
            createdAt: new Date().toISOString(),
        };
        updateTableStatusAndOrder(chosenTable.id, 'new_order', newOrder);
        return true; // Indicate success
    }, [layoutData.tables, updateTableStatusAndOrder, openAlertModal]);

    const resetLayoutToDefaults = useCallback(() => {
        setLayoutData(defaultLayout);
        if (openAlertModal) {
            openAlertModal("Layout Reset", "The layout has been reset to its default configuration.", "info");
        }
    }, [openAlertModal]);


    return {
        layoutData,
        saveDesignedLayout,
        updateTableStatusAndOrder,
        clearTableOrder,
        placeSimulatedOrder,
        resetLayoutToDefaults, // Useful for a "Clear All & Reset" button
        // Derived state (can also be computed in the component if preferred)
        tables: layoutData.tables,
        currentGridDimensions: layoutData.gridDimensions,
        kitchenArea: layoutData.kitchenArea,
        newOrdersCount: layoutData.tables.filter(t => t.status === 'new_order').length,
        viewedOrders: layoutData.tables.filter(t => t.status === 'viewed_order' && t.order),
    };
};

export default useLayoutData;