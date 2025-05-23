// src/features/products_table/hooks/useTableSettings.js
import { useState, useEffect, useCallback } from 'react';
import { initialColumns } from '../utils/tableConfig'; // Keep defaultColumnOrder as array

// Helper to create default visibility Set
const createDefaultVisibilitySet = (cols) => {
    const defaultSet = new Set();
    cols.forEach(col => {
        // Your existing logic for default visibility
        if (![/*COLUMN_KEYS.STOCK, COLUMN_KEYS.SALES, etc.*/].includes(col.id) && col.isVisibilityToggleable !== false) {
            // Make sure fixed columns (isVisibilityToggleable === false) are also in the set initially if they are visible by default
            if (col.isVisibilityToggleable === false || ![/* hidden by default keys */].includes(col.id)) {
                defaultSet.add(col.id);
            }
        } else if (col.isVisibilityToggleable === false) { // Always add non-toggleable fixed columns
            defaultSet.add(col.id);
        }
    });
    return defaultSet;
};
const defaultVisibilitySet = createDefaultVisibilitySet(initialColumns);
const defaultColumnOrderKeys = initialColumns.map(col => col.id);


const SETTINGS_STORAGE_KEY = 'productsTableSettings_v2'; // Changed key to avoid conflicts with old format

const loadSettings = () => {
    try {
        const serializedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (serializedSettings === null) {
            return {
                columnVisibility: defaultVisibilitySet, // Use Set
                columnOrder: defaultColumnOrderKeys,    // Use Array of keys
                filters: { search: '', category: '', product_type: '', is_active: '', tags: [] },
                sort: { id: '', desc: false },
                pagination: { pageIndex: 0, pageSize: 10 },
            };
        }
        const stored = JSON.parse(serializedSettings);
        const currentColumnIds = initialColumns.map(c => c.id);

        // Merge visibility: ensure all current columns are considered, respect stored prefs
        let mergedVisibility = new Set();
        if (stored.columnVisibility && Array.isArray(stored.columnVisibility)) { // Check if stored is array (from Set serialization)
            const storedVisibilitySet = new Set(stored.columnVisibility);
            currentColumnIds.forEach(id => {
                const colConfig = initialColumns.find(c => c.id === id);
                if (colConfig?.isVisibilityToggleable === false) { // Fixed columns always visible
                    mergedVisibility.add(id);
                } else if (storedVisibilitySet.has(id)) {
                    mergedVisibility.add(id);
                } else if (!Object.prototype.hasOwnProperty.call(stored, 'columnVisibility') && defaultVisibilitySet.has(id)) {
                    // If 'columnVisibility' wasn't in storage at all, use default
                    mergedVisibility.add(id);
                }
            });
        } else {
            mergedVisibility = defaultVisibilitySet; // Fallback to default
        }


        // Merge order: keep valid stored order, append new columns
        let mergedOrder = [...defaultColumnOrderKeys];
        if (stored.columnOrder && Array.isArray(stored.columnOrder)) {
            const storedOrderSet = new Set(stored.columnOrder);
            const validStoredOrder = stored.columnOrder.filter(id => currentColumnIds.includes(id));
            const newColumnsInOrder = currentColumnIds.filter(id => !storedOrderSet.has(id));
            mergedOrder = [...validStoredOrder, ...newColumnsInOrder];
        }

        return {
            ...stored,
            columnVisibility: mergedVisibility,
            columnOrder: mergedOrder,
            filters: stored.filters || { search: '', category: '', product_type: '', is_active: '', tags: [] },
            sort: stored.sort || { id: '', desc: false },
            pagination: stored.pagination || { pageIndex: 0, pageSize: 10 },
        };
    } catch (error) {
        console.error("Error loading table settings from localStorage:", error);
        return { /* same defaults as above */
            columnVisibility: defaultVisibilitySet,
            columnOrder: defaultColumnOrderKeys,
            filters: { search: '', category: '', product_type: '', is_active: '', tags: [] },
            sort: { id: '', desc: false },
            pagination: { pageIndex: 0, pageSize: 10 },
        };
    }
};

export const useTableSettings = () => {
    const [settings, setSettingsState] = useState(loadSettings);

    useEffect(() => {
        try {
            // Serialize Set to Array for localStorage
            const serializedSettings = JSON.stringify({
                ...settings,
                columnVisibility: Array.from(settings.columnVisibility)
            });
            localStorage.setItem(SETTINGS_STORAGE_KEY, serializedSettings);
        } catch (error) {
            console.error("Error saving table settings to localStorage:", error);
        }
    }, [settings]);

    // onColumnVisibilityChange now expects a function that updates the Set
    const setColumnVisibility = useCallback((updater) => { // updater is (prevSet) => newSet
        setSettingsState(prev => ({
            ...prev,
            columnVisibility: typeof updater === 'function' ? updater(prev.columnVisibility) : new Set(updater),
        }));
    }, []);

    const setColumnOrder = useCallback((newOrderArray) => { // Expects an array of keys
        setSettingsState(prev => ({ ...prev, columnOrder: newOrderArray }));
    }, []);

    // ... setFilters, setSort, setPagination, resetTableSettings remain similar ...
    const setFilters = useCallback((newFilters) => {
        setSettingsState(prev => ({
            ...prev,
            filters: typeof newFilters === 'function' ? newFilters(prev.filters) : { ...prev.filters, ...newFilters },
            pagination: { ...prev.pagination, pageIndex: 0 }
        }));
    }, []);

    const setSort = useCallback((newSort) => {
        setSettingsState(prev => ({ ...prev, sort: newSort }));
    }, []);

    const setPagination = useCallback((newPagination) => {
        setSettingsState(prev => ({
            ...prev,
            pagination: typeof newPagination === 'function' ? newPagination(prev.pagination) : newPagination
        }));
    }, []);

    const resetTableSettings = useCallback(() => {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        setSettingsState(loadSettings());
    }, []);


    return {
        ...settings, // This will spread columnVisibility (Set) and columnOrder (Array)
        setColumnVisibility,
        setColumnOrder,
        setFilters,
        setSort,
        setPagination,
        resetTableSettings,
    };
};