// features/venue_management/utils/layoutUtils.js

// Import ItemTypes to filter items if necessary (e.g., for table numbering)
import { ItemTypes } from '../constants/itemConfigs'; // Assuming ItemTypes is here

/**
 * Calculates the effective dimensions (width and height) of an item in MINOR_CELL_UNITS,
 * considering its rotation.
 * @param {object} item - The item object. Expected to have:
 *                        - item.w_minor: base width in minor cells (pre-rotation)
 *                        - item.h_minor: base height in minor cells (pre-rotation)
 *                        - item.rotation: 0 or 90 (can be extended for 180, 270)
 * @returns {object} { w: effectiveWidth_minor, h: effectiveHeight_minor } in minor cell units.
 */
export const getEffectiveDimensions = (item) => {
    if (!item || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        // console.warn("getEffectiveDimensions: Invalid item or missing w_minor/h_minor properties.", item);
        return { w: 1, h: 1 }; // Fallback to prevent errors downstream
    }

    if (item.rotation === 90 || item.rotation === 270) { // Rotations that swap w and h
        return { w: item.h_minor, h: item.w_minor };
    }
    return { w: item.w_minor, h: item.h_minor }; // Default, no swap
};

/**
 * Checks if a specific minor grid cell is occupied by any part of an existing design item.
 * @param {number} minorRowToCheck - The minor row index to check.
 * @param {number} minorColToCheck - The minor column index to check.
 * @param {Array} designItems - Array of all placed design item objects.
 * @param {string|null} excludeId - ID of an item to exclude from the check (e.g., the item being moved).
 * @returns {boolean} True if the cell is occupied, false otherwise.
 */
const isMinorCellOccupied = (minorRowToCheck, minorColToCheck, designItems, excludeId) => {
    for (const item of designItems) {
        if (!item || !item.gridPosition || item.id === excludeId) continue;

        const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(item);
        const { rowStart: itemMinorRowStart, colStart: itemMinorColStart } = item.gridPosition;

        if (
            minorRowToCheck >= itemMinorRowStart &&
            minorRowToCheck < itemMinorRowStart + effH_minor &&
            minorColToCheck >= itemMinorColStart &&
            minorColToCheck < itemMinorColStart + effW_minor
        ) {
            return true; // Cell is occupied by this item
        }
    }
    return false; // Cell is not occupied by any relevant item
};

/**
 * Determines if an item can be placed at the specified minor grid coordinates without overlapping
 * existing items or going out of bounds.
 * @param {number} targetMinorRow - Target top-left minor row for the item's placement.
 * @param {number} targetMinorCol - Target top-left minor col for the item's placement.
 * @param {number} itemW_minor - Width of the item in minor cells (effective, after rotation).
 * @param {number} itemH_minor - Height of the item in minor cells (effective, after rotation).
 * @param {Array} designItems - Array of all existing placed design items.
 * @param {number} totalMinorGridRows - Total number of minor rows available on the grid.
 * @param {number} totalMinorGridCols - Total number of minor columns available on the grid.
 * @param {string|null} itemToExcludeId - ID of an item to exclude from collision checks (used when moving an item).
 * @returns {boolean} True if the item can be placed, false otherwise.
 */
export const canPlaceItem = (
    targetMinorRow, targetMinorCol,
    itemW_minor, itemH_minor,
    designItems,
    totalMinorGridRows, totalMinorGridCols,
    itemToExcludeId = null
) => {
    // 1. Check grid boundaries
    if (
        targetMinorRow < 1 ||
        targetMinorCol < 1 ||
        targetMinorRow + itemH_minor - 1 > totalMinorGridRows ||
        targetMinorCol + itemW_minor - 1 > totalMinorGridCols
    ) {
        // console.log("Placement fail: Out of bounds");
        return false;
    }

    // 2. Check for overlap with other items
    for (let rOffset = 0; rOffset < itemH_minor; rOffset++) {
        for (let cOffset = 0; cOffset < itemW_minor; cOffset++) {
            const checkMinorRow = targetMinorRow + rOffset;
            const checkMinorCol = targetMinorCol + cOffset;
            if (isMinorCellOccupied(checkMinorRow, checkMinorCol, designItems, itemToExcludeId)) {
                // console.log(`Placement fail: Cell (${checkMinorRow}, ${checkMinorCol}) occupied`);
                return false;
            }
        }
    }

    return true; // Can be placed
};

/**
 * Checks if all provided design items are within the new total minor grid dimensions.
 * Useful when resizing the major grid.
 * @param {number} newTotalMinorRows - The new total number of minor rows for the grid.
 * @param {number} newTotalMinorCols - The new total number of minor columns for the grid.
 * @param {Array} designItems - Array of design item objects to check.
 * @returns {boolean} True if all items are in bounds, false otherwise.
 */
export const checkItemsInBounds = (newTotalMinorRows, newTotalMinorCols, designItems) => {
    for (const item of designItems) {
        if (!item || !item.gridPosition) continue;

        const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(item);
        const { rowStart: minorRowStart, colStart: minorColStart } = item.gridPosition;

        if (
            minorRowStart < 1 || minorColStart < 1 || // Should not happen if items are placed correctly
            minorRowStart + effH_minor - 1 > newTotalMinorRows ||
            minorColStart + effW_minor - 1 > newTotalMinorCols
        ) {
            return false; // This item is out of the new bounds
        }
    }
    return true; // All items are within bounds
};

/**
 * Gets the next available table number from an array of design items.
 * @param {Array} designItems - Array of all design items.
 * @returns {number} The next available table number.
 */
export const getNextAvailableTableNumber = (designItems) => {
    const tableNumbers = designItems
        .filter(item => item.itemType === ItemTypes.PLACED_TABLE && typeof item.number === 'number' && !isNaN(item.number))
        .map(table => table.number)
        .sort((a, b) => a - b); // Sort for predictable numbering and efficient finding

    if (tableNumbers.length === 0) return 1;

    let num = 1;
    for (const existingNum of tableNumbers) {
        if (num < existingNum) {
            return num;
        }
        if (num === existingNum) {
            num++;
        }
    }
    return num; // Next number after the highest existing one
};

// Note: getDefaultSeatsForSize and getToolConfigByType might be better suited
// inside itemConfigs.js or directly used by useLayoutDesignerStateManagement's
// generateDefaultItemProps if their logic becomes highly coupled with ITEM_CONFIGS.
// For now, if itemConfigs.js imports getDefaultSeatsForSize from here, that's fine.

export const getDefaultSeatsForSize = (sizeIdentifier) => {
    // Based on the 'size_identifier' from toolDefinitions (e.g., 'square', 'rectangle')
    switch (sizeIdentifier) {
        case 'square': return 2;
        case 'rectangle': return 4;
        case 'rectangle-tall': return 2;
        case 'round': return 4; // Round tables often vary, this is a default
        default: return 2; // Default for unknown or other types
    }
};