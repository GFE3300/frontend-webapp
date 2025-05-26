import { useState, useCallback } from 'react';
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    // ... other constants
} from '../utils/layoutConstants';
import {
    // ... relevant layoutUtils
} from '../utils/layoutUtils';

const useLayoutDesignerState = (initialTables = [], initialGrid, initialKitchen, openAlertModal) => {
    const [designedTables, setDesignedTables] = useState(initialTables);
    const [gridRows, setGridRows] = useState(initialGrid?.rows || DEFAULT_INITIAL_GRID_ROWS);

    return {
        designedTables, setDesignedTables,
        gridRows, setGridRows,
    };
};

export default useLayoutDesignerState;