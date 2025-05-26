import { tableToolsConfig, ItemTypes } from '../constants/layoutConstants'; // Path to your constants

export const getDefaultSeatsForSize = (size) => {
    // This logic remains the same as it's based on the table's 'type' or 'size' identifier
    switch (size) {
        case 'square': return 2;
        case 'rectangle': return 4;
        case 'rectangle-tall': return 2;
        case 'round': return 4;
        default: return 2;
    }
};

export const getToolConfigByType = (type) => {
    // This logic remains the same
    const tableTool = tableToolsConfig.find(tool => tool.type === type);
    if (tableTool) return tableTool;
    return null;
};

/**
 * Calculates the effective dimensions (width and height) of an item,
 * considering its rotation.
 * Assumes item.w and item.h are already in the desired unit system (e.g., minor cells).
 * @param {object} item - The item object (e.g., a placed table).
 *                        Expected to have item.w, item.h (in minor cells), and item.rotation (0 or 90).
 * @returns {object} { w, h } - Effective width and height in minor cells.
 */
export const getEffectiveDimensions = (item) => {
    if (!item || typeof item.w === 'undefined' || typeof item.h === 'undefined') {
        console.warn("getEffectiveDimensions: Invalid item or missing w/h", item);
        return { w: 1, h: 1 }; // Fallback
    }
    // item.w and item.h are assumed to be in minor cells already
    if (item.rotation === 90) {
        return { w: item.h, h: item.w }; // Swap for rotation
    }
    return { w: item.w, h: item.h };
};


/**
 * Checks if a specific minor grid cell is occupied by any part of an existing table.
 * @param {number} minorRow - The minor row index to check.
 * @param {number} minorCol - The minor column index to check.
 * @param {Array} tables - Array of placed table objects.
 * @param {string|null} excludeId - ID of a table to exclude from the check (e.g., the table being moved).
 * @param {function} getEffectiveDimensionsFn - Function to get effective dimensions of a table.
 * @returns {boolean} True if the cell is occupied, false otherwise.
 */
const isMinorCellOccupiedByTable = (minorRow, minorCol, tables, excludeId, getEffectiveDimensionsFn) => {
    for (const table of tables.filter(t => t && t.gridPosition)) {
        if (table.id === excludeId) continue;

        // getEffectiveDimensionsFn is expected to return dimensions in minor cells
        const { w: tableW_minor, h: tableH_minor } = getEffectiveDimensionsFn(table);
        const { rowStart: tableMinorRowStart, colStart: tableMinorColStart } = table.gridPosition;

        if (
            minorRow >= tableMinorRowStart && minorRow < tableMinorRowStart + tableH_minor &&
            minorCol >= tableMinorColStart && minorCol < tableMinorColStart + tableW_minor
        ) {
            return true;
        }
    }
    return false;
};

/**
 * Determines if an item can be placed at the specified minor grid coordinates.
 * @param {number} targetMinorRow - Target top-left minor row for the item.
 * @param {number} targetMinorCol - Target top-left minor col for the item.
 * @param {number} itemW_minor - Width of the item in minor cells.
 * @param {number} itemH_minor - Height of the item in minor cells.
 * @param {Array} currentTables - Array of existing placed tables.
 * @param {number} totalMinorRows - Total number of minor rows in the grid.
 * @param {number} totalMinorCols - Total number of minor columns in the grid.
 * @param {string|null} itemToExcludeId - ID of an item to exclude from collision checks (for moving).
 * @param {function} getEffectiveDimensionsFn - Function to get effective dimensions for collision checks.
 * @returns {boolean} True if the item can be placed, false otherwise.
 */
export const canPlaceItem = (
    targetMinorRow, targetMinorCol,
    itemW_minor, itemH_minor,
    currentTables,
    totalMinorRows, totalMinorCols,
    itemToExcludeId = null,
    getEffectiveDimensionsFn = getEffectiveDimensions // Default to the one in this file
) => {
    // Check grid boundaries (using minor grid dimensions)
    if (
        targetMinorRow < 1 || targetMinorCol < 1 ||
        targetMinorRow + itemH_minor - 1 > totalMinorRows ||
        targetMinorCol + itemW_minor - 1 > totalMinorCols
    ) {
        return false;
    }

    // Check for overlap with other tables (on the minor grid)
    for (let rOffset = 0; rOffset < itemH_minor; rOffset++) {
        for (let cOffset = 0; cOffset < itemW_minor; cOffset++) {
            const checkMinorRow = targetMinorRow + rOffset;
            const checkMinorCol = targetMinorCol + cOffset;
            if (isMinorCellOccupiedByTable(checkMinorRow, checkMinorCol, currentTables, itemToExcludeId, getEffectiveDimensionsFn)) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Checks if all provided items (tables) are within the new total minor grid dimensions.
 * @param {number} newTotalMinorRows - The new total number of minor rows.
 * @param {number} newTotalMinorCols - The new total number of minor columns.
 * @param {Array} tables - Array of table objects to check.
 * @param {function} getEffectiveDimensionsFn - Function to get effective dimensions of a table.
 * @returns {boolean} True if all items are in bounds, false otherwise.
 */
export const checkItemsInBounds = (newTotalMinorRows, newTotalMinorCols, tables, getEffectiveDimensionsFn = getEffectiveDimensions) => {
    for (const table of tables.filter(t => t && t.gridPosition)) {
        // Dimensions are already in minor cells from item.w, item.h via getEffectiveDimensionsFn
        const { w: itemW_minor, h: itemH_minor } = getEffectiveDimensionsFn(table);
        const { rowStart: minorRowStart, colStart: minorColStart } = table.gridPosition;

        if (
            minorRowStart + itemH_minor - 1 > newTotalMinorRows ||
            minorColStart + itemW_minor - 1 > newTotalMinorCols
        ) {
            return false;
        }
    }
    return true;
};

export const getNextAvailableTableNumber = (tables) => {
    // This logic remains the same, as it's based on table numbers, not positions
    if (!tables || tables.length === 0) return 1;
    const existingNumbers = tables
        .map(t => t.number)
        .filter(n => typeof n === 'number' && !isNaN(n))
        .sort((a, b) => a - b); // Sort for predictable numbering
    if (existingNumbers.length === 0) return 1;
    let num = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (!existingNumbers.includes(num)) {
            return num;
        }
        num++;
        if (num > existingNumbers.length + 1 && num > 1000) { // Safety break for very sparse large numbers
            console.warn("getNextAvailableTableNumber: High table number reached, check for issues or reset numbering.", num);
            return num; // Or throw an error
        }
    }
};