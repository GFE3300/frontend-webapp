import { useState, useEffect, useCallback } from 'react';
import { initialColumns, COLUMN_KEYS } from '../utils/tableConfig'; // Ensure COLUMN_KEYS is imported if used here
// Assuming PAGE_SIZE is a constant you might want to centralize or import
// For now, we'll keep it as 10, consistent with ProductDataContext.
const DEFAULT_PAGE_SIZE = 10;

const createDefaultVisibilitySet = (cols) => {
    const defaultSet = new Set();
    cols.forEach(col => {
        // Example: Hide COST, SALES by default. Actions and Image are often fixed or handled differently.
        const hiddenByDefault = [COLUMN_KEYS.COST, COLUMN_KEYS.SALES, COLUMN_KEYS.BARCODE, COLUMN_KEYS.LAST_UPDATED];
        if (col.isVisibilityToggleable === false) { // Always visible if not toggleable
            defaultSet.add(col.id);
        } else if (!hiddenByDefault.includes(col.id)) {
            defaultSet.add(col.id);
        }
    });
    return defaultSet;
};

const defaultVisibilitySet = createDefaultVisibilitySet(initialColumns);
const defaultColumnOrderKeys = initialColumns.map(col => col.id);

const defaultColumnWidths = initialColumns.reduce((acc, col) => {
    if (col.isResizable !== false) {
        acc[col.id] = col.size || 150; // Default size if col.size is not defined
    }
    return acc;
}, {});

const SETTINGS_STORAGE_KEY = 'productsTableSettings_v3';

const loadSettings = () => {
    try {
        const serializedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (serializedSettings === null) {
            // console.log("useTableSettings: No stored settings found, using defaults.");
            return {
                columnVisibility: defaultVisibilitySet,
                columnOrder: defaultColumnOrderKeys,
                columnWidths: defaultColumnWidths,
                filters: { search: '', category: '', product_type: '', is_active: '', tags: [] },
                sort: { id: '', desc: false },
                pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
            };
        }
        const stored = JSON.parse(serializedSettings);
        //console.log("useTableSettings: Loaded stored settings:", stored);
        const currentColumnIds = initialColumns.map(c => c.id);

        // Merge visibility
        let mergedVisibility = new Set();
        if (stored.columnVisibility && Array.isArray(stored.columnVisibility)) {
            const storedVisibilitySet = new Set(stored.columnVisibility);
            currentColumnIds.forEach(id => {
                const colConfig = initialColumns.find(c => c.id === id);
                if (colConfig?.isVisibilityToggleable === false) {
                    mergedVisibility.add(id);
                } else if (storedVisibilitySet.has(id)) {
                    mergedVisibility.add(id);
                }
                // If a new column is added and not in storedVisibilitySet, it won't be added unless handled here
                // For simplicity, new columns will be hidden by default unless isVisibilityToggleable is false or logic in createDefaultVisibilitySet adds them
            });
        } else {
            mergedVisibility = defaultVisibilitySet; // Fallback to new defaults if stored format is incompatible
        }
        // Ensure all non-toggleable columns are visible
        initialColumns.forEach(col => {
            if (col.isVisibilityToggleable === false) {
                mergedVisibility.add(col.id);
            }
        });


        // Merge order
        let mergedOrder = [...defaultColumnOrderKeys]; // Start with current default order
        if (stored.columnOrder && Array.isArray(stored.columnOrder)) {
            const validStoredOrder = stored.columnOrder.filter(id => currentColumnIds.includes(id));
            const storedOrderSet = new Set(validStoredOrder);
            const newColumnsInOrder = currentColumnIds.filter(id => !storedOrderSet.has(id));
            mergedOrder = [...validStoredOrder, ...newColumnsInOrder];
        }

        // Merge columnWidths: Start with current defaults, override with stored valid ones
        let mergedColumnWidths = { ...defaultColumnWidths };
        if (stored.columnWidths && typeof stored.columnWidths === 'object') {
            for (const colId in stored.columnWidths) {
                const colConfig = initialColumns.find(c => c.id === colId);
                // Only apply stored width if column exists and is resizable
                if (colConfig && (colConfig.isResizable !== false)) {
                    mergedColumnWidths[colId] = stored.columnWidths[colId];
                }
            }
        }
        // Prune widths for columns that no longer exist or are no longer resizable
        Object.keys(mergedColumnWidths).forEach(colId => {
            const colConfig = initialColumns.find(c => c.id === colId);
            if (!colConfig || colConfig.isResizable === false) {
                delete mergedColumnWidths[colId];
            }
        });

        const finalSettings = {
            filters: stored.filters || { search: '', category: '', product_type: '', is_active: '', tags: [] },
            sort: stored.sort || { id: '', desc: false },
            pagination: stored.pagination || { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
            columnVisibility: mergedVisibility,
            columnOrder: mergedOrder,
            columnWidths: mergedColumnWidths, // Crucial: ensure this is always an object
        };
        // console.log("useTableSettings: Final merged settings:", finalSettings);
        return finalSettings;

    } catch (error) {
        // console.error("Error loading table settings from localStorage:", error);
        return {
            columnVisibility: defaultVisibilitySet,
            columnOrder: defaultColumnOrderKeys,
            columnWidths: defaultColumnWidths,
            filters: { search: '', category: '', product_type: '', is_active: '', tags: [] },
            sort: { id: '', desc: false },
            pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
        };
    }
};

export const useTableSettings = () => {
    const [settings, setSettingsState] = useState(() => loadSettings());

    useEffect(() => {
        // console.log("useTableSettings: Settings state updated, attempting to save:", settings);
        try {
            const serializedSettings = JSON.stringify({
                ...settings,
                columnVisibility: Array.from(settings.columnVisibility)
            });
            localStorage.setItem(SETTINGS_STORAGE_KEY, serializedSettings);
        } catch (error) {
            console.error("Error saving table settings to localStorage:", error);
        }
    }, [settings]);

    const setColumnVisibility = useCallback((updater) => {
        setSettingsState(prev => ({
            ...prev,
            columnVisibility: typeof updater === 'function' ? updater(prev.columnVisibility) : new Set(updater),
        }));
    }, []);

    const setColumnOrder = useCallback((newOrderArray) => {
        setSettingsState(prev => ({ ...prev, columnOrder: newOrderArray }));
    }, []);

    const setColumnWidths = useCallback((newWidthsOrUpdater) => {
        setSettingsState(prev => ({
            ...prev,
            columnWidths: typeof newWidthsOrUpdater === 'function'
                ? newWidthsOrUpdater(prev.columnWidths)
                : newWidthsOrUpdater,
        }));
    }, []);


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
        const freshDefaults = {
            columnVisibility: createDefaultVisibilitySet(initialColumns),
            columnOrder: initialColumns.map(col => col.id),
            columnWidths: initialColumns.reduce((acc, col) => {
                if (col.isResizable !== false) acc[col.id] = col.size || 150; return acc;
            }, {}),
            filters: { search: '', category: '', product_type: '', is_active: '', tags: [] },
            sort: { id: '', desc: false },
            pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
        };
        setSettingsState(freshDefaults);
        // console.log("useTableSettings: Table settings reset to defaults.");
    }, []);


    return {
        ...settings, // This will spread columnVisibility, columnOrder, and crucially columnWidths
        setColumnVisibility,
        setColumnOrder,
        setColumnWidths,
        setFilters,
        setSort,
        setPagination,
        resetTableSettings,
    };
};