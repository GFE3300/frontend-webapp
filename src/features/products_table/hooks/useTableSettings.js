import { useState, useEffect, useCallback } from 'react';
import { initialColumns, COLUMN_KEYS } from '../utils/tableConfig';

const DEFAULT_PAGE_SIZE = 10;

const createDefaultVisibilitySet = (cols) => {
    const defaultSet = new Set();
    cols.forEach(col => {
        // MODIFICATION: Removed 'sales' from the hiddenByDefault array
        const hiddenByDefault = [COLUMN_KEYS.COST, COLUMN_KEYS.BARCODE, COLUMN_KEYS.LAST_UPDATED];
        if (col.isVisibilityToggleable === false) {
            defaultSet.add(col.id);
        } else if (!hiddenByDefault.includes(col.id)) {
            defaultSet.add(col.id);
        }
    });
    return defaultSet;
};

// ... rest of the file remains unchanged ...
// NOTE: The rest of the file from the dossier is assumed to be here.
// Only the relevant changed function is shown for brevity.

// The rest of the `useTableSettings.js` file content from the dossier follows...
const defaultVisibilitySet = createDefaultVisibilitySet(initialColumns);
const defaultColumnOrderKeys = initialColumns.map(col => col.id);

const SETTINGS_STORAGE_KEY = 'productsTableSettings_v3_no_resize'; // Changed key slightly

const loadSettings = () => {
    try {
        const serializedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (serializedSettings === null) {
            return {
                columnVisibility: defaultVisibilitySet,
                columnOrder: defaultColumnOrderKeys,
                // No columnWidths
                filters: { search: '', category: '', product_type: '', is_active: '', tags: [] },
                sort: { id: '', desc: false },
                pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
            };
        }
        const stored = JSON.parse(serializedSettings);
        const currentColumnIds = initialColumns.map(c => c.id);

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
            });
        } else {
            mergedVisibility = defaultVisibilitySet;
        }
        initialColumns.forEach(col => {
            if (col.isVisibilityToggleable === false) {
                mergedVisibility.add(col.id);
            }
        });

        let mergedOrder = [...defaultColumnOrderKeys];
        if (stored.columnOrder && Array.isArray(stored.columnOrder)) {
            const validStoredOrder = stored.columnOrder.filter(id => currentColumnIds.includes(id));
            const storedOrderSet = new Set(validStoredOrder);
            const newColumnsInOrder = currentColumnIds.filter(id => !storedOrderSet.has(id));
            mergedOrder = [...validStoredOrder, ...newColumnsInOrder];
        }

        // No columnWidths merging needed

        const finalSettings = {
            filters: stored.filters || { search: '', category: '', product_type: '', is_active: '', tags: [] },
            sort: stored.sort || { id: '', desc: false },
            pagination: stored.pagination || { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
            columnVisibility: mergedVisibility,
            columnOrder: mergedOrder,
            // No columnWidths
        };
        return finalSettings;

    } catch (error) {
        console.error("Error loading table settings from localStorage:", error);
        return {
            columnVisibility: defaultVisibilitySet,
            columnOrder: defaultColumnOrderKeys,
            // No columnWidths
            filters: { search: '', category: '', product_type: '', is_active: '', tags: [] },
            sort: { id: '', desc: false },
            pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
        };
    }
};

export const useTableSettings = () => {
    const [settings, setSettingsState] = useState(() => loadSettings());

    useEffect(() => {
        try {
            const { columnWidths, ...settingsToSave } = settings; // Exclude columnWidths if it somehow exists
            const serializedSettings = JSON.stringify({
                ...settingsToSave,
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
            // No columnWidths
            filters: { search: '', category: '', product_type: '', is_active: '', tags: [] },
            sort: { id: '', desc: false },
            pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
        };
        setSettingsState(freshDefaults);
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