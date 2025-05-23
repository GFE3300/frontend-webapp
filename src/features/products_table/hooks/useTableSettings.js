import { useState, useEffect, useCallback } from 'react';
import { defaultColumnVisibility, defaultColumnOrder, initialColumns } from '../utils/tableConfig';

const SETTINGS_STORAGE_KEY = 'productsTableSettings';

const loadSettings = () => {
    try {
        const serializedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (serializedSettings === null) {
            return {
                columnVisibility: defaultColumnVisibility,
                columnOrder: defaultColumnOrder,
                filters: { search: '', category: '', product_type: '', is_active: '', tags: [] },
                sort: { id: '', desc: false }, // e.g. { id: 'name', desc: false } for asc name
                pagination: { pageIndex: 0, pageSize: 10 },
            };
        }
        const stored = JSON.parse(serializedSettings);
        // Ensure all columns from initialColumns are present in visibility and order, merge if new columns added
        const currentColumnIds = initialColumns.map(c => c.id);
        
        const mergedVisibility = { ...defaultColumnVisibility };
        currentColumnIds.forEach(id => {
            if (stored.columnVisibility && stored.columnVisibility.hasOwnProperty(id)) {
                mergedVisibility[id] = stored.columnVisibility[id];
            }
        });

        const mergedOrder = [...defaultColumnOrder];
        if (stored.columnOrder) {
            const storedOrderSet = new Set(stored.columnOrder);
            // Keep valid stored order, append new columns
            const validStoredOrder = stored.columnOrder.filter(id => currentColumnIds.includes(id));
            const newColumnsInOrder = currentColumnIds.filter(id => !storedOrderSet.has(id));
            mergedOrder.length = 0; // Clear default order
            mergedOrder.push(...validStoredOrder, ...newColumnsInOrder);
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
        return {
            columnVisibility: defaultColumnVisibility,
            columnOrder: defaultColumnOrder,
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
            const serializedSettings = JSON.stringify(settings);
            localStorage.setItem(SETTINGS_STORAGE_KEY, serializedSettings);
        } catch (error) {
            console.error("Error saving table settings to localStorage:", error);
        }
    }, [settings]);

    const setColumnVisibility = useCallback((updater) => {
        setSettingsState(prev => ({
            ...prev,
            columnVisibility: typeof updater === 'function' ? updater(prev.columnVisibility) : updater,
        }));
    }, []);

    const setColumnOrder = useCallback((newOrder) => {
        setSettingsState(prev => ({ ...prev, columnOrder: newOrder }));
    }, []);

    const setFilters = useCallback((newFilters) => {
        setSettingsState(prev => ({
            ...prev,
            filters: typeof newFilters === 'function' ? newFilters(prev.filters) : { ...prev.filters, ...newFilters },
            pagination: { ...prev.pagination, pageIndex: 0 } // Reset to first page on filter change
        }));
    }, []);

    const setSort = useCallback((newSort) => { // newSort = {id: 'colId', desc: boolean}
        setSettingsState(prev => ({ ...prev, sort: newSort }));
    }, []);

    const setPagination = useCallback((newPagination) => { // newPagination = {pageIndex, pageSize}
        setSettingsState(prev => ({
            ...prev,
            pagination: typeof newPagination === 'function' ? newPagination(prev.pagination) : newPagination
        }));
    }, []);
    
    const resetTableSettings = useCallback(() => {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        setSettingsState(loadSettings()); // Reload defaults
    }, []);


    return {
        ...settings,
        setColumnVisibility,
        setColumnOrder,
        setFilters,
        setSort,
        setPagination,
        resetTableSettings,
    };
};