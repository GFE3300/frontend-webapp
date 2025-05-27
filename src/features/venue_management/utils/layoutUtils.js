// features/venue_management/utils/layoutUtils.js

// ItemTypes is used by getNextAvailableTableNumber for filtering
import { ItemTypes } from '../constants/itemConfigs';

/**
 * Calculates the effective dimensions (width and height) of an item in MINOR_CELL_UNITS,
 * considering its rotation.
 * @param {object} item - The item object. Expected to have:
 *                        - item.w_minor: base width in minor cells (pre-rotation)
 *                        - item.h_minor: base height in minor cells (pre-rotation)
 *                        - item.rotation: 0, 90, 180, 270
 * @returns {object} { w: effectiveWidth_minor, h: effectiveHeight_minor } in minor cell units.
 */
export const getEffectiveDimensions = (item) => {
    if (!item || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        // This warning is important. If it appears, it means item data is malformed upstream.
        console.warn("getEffectiveDimensions: Invalid item or missing w_minor/h_minor. Item:", JSON.stringify(item), "Defaulting to 1x1.");
        return { w: 1, h: 1 }; // Fallback to prevent errors downstream
    }

    // Only 90 and 270 degree rotations swap width and height
    if (item.rotation === 90 || item.rotation === 270) {
        return { w: item.h_minor, h: item.w_minor };
    }
    // For 0 and 180 degrees, width and height remain as defined
    return { w: item.w_minor, h: item.h_minor };
};

/**
 * Checks if a specific minor grid cell is occupied by any part of an existing design item.
 * @param {number} minorRowToCheck - The 1-based minor row index to check.
 * @param {number} minorColToCheck - The 1-based minor column index to check.
 * @param {Array} designItems - Array of all placed design item objects.
 * @param {string|null} excludeItemId - ID of an item to exclude from the check (e.g., the item being moved).
 * @returns {boolean} True if the cell is occupied, false otherwise.
 */
const isMinorCellOccupied = (minorRowToCheck, minorColToCheck, designItems, excludeItemId) => {
    // console.log(`[isMinorCellOccupied] Checking cell (${minorRowToCheck}, ${minorColToCheck}), excluding ${excludeItemId}`);
    for (const item of designItems) {
        if (!item || !item.gridPosition || typeof item.gridPosition.rowStart !== 'number' || typeof item.gridPosition.colStart !== 'number') {
            // console.warn("[isMinorCellOccupied] Skipping malformed item:", item);
            continue;
        }
        if (item.id === excludeItemId) {
            // console.log(`[isMinorCellOccupied] Skipping excluded item ID: ${excludeItemId}`);
            continue;
        }

        const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(item);
        const { rowStart: itemMinorRowStart, colStart: itemMinorColStart } = item.gridPosition;

        if (
            minorRowToCheck >= itemMinorRowStart &&
            minorRowToCheck < itemMinorRowStart + effH_minor && // Use < because it's 0-indexed extent from a 1-indexed start
            minorColToCheck >= itemMinorColStart &&
            minorColToCheck < itemMinorColStart + effW_minor
        ) {
            // console.log(`[isMinorCellOccupied] Cell (${minorRowToCheck}, ${minorColToCheck}) IS OCCUPIED by item ${item.id} at (${itemMinorRowStart},${itemMinorColStart}) with effDims (${effW_minor}x${effH_minor})`);
            return true; // Cell is occupied by this item
        }
    }
    // console.log(`[isMinorCellOccupied] Cell (${minorRowToCheck}, ${minorColToCheck}) is NOT occupied.`);
    return false; // Cell is not occupied by any relevant item
};

/**
 * Determines if an item can be placed at the specified minor grid coordinates without overlapping
 * existing items or going out of bounds.
 * @param {number} targetMinorRow - Target 1-based top-left minor row for the item's placement.
 * @param {number} targetMinorCol - Target 1-based top-left minor col for the item's placement.
 * @param {number} itemEffW_minor - Effective width of the item in minor cells (after considering rotation).
 * @param {number} itemEffH_minor - Effective height of the item in minor cells (after considering rotation).
 * @param {Array} designItems - Array of all existing placed design items.
 * @param {number} totalMinorGridRows - Total number of minor rows available on the grid.
 * @param {number} totalMinorGridCols - Total number of minor columns available on the grid.
 * @param {string|null} itemToExcludeId - ID of an item to exclude from collision checks (used when moving an item).
 * @returns {boolean} True if the item can be placed, false otherwise.
 */
export const canPlaceItem = (
    targetMinorRow, targetMinorCol,
    itemEffW_minor, itemEffH_minor, // Effective dimensions passed directly
    designItems,
    totalMinorGridRows, totalMinorGridCols,
    itemToExcludeId = null
) => {
    // console.log(`[canPlaceItem] Attempting to place item (effDims ${itemEffW_minor}x${itemEffH_minor}) at (${targetMinorRow},${targetMinorCol}) on grid (${totalMinorGridRows}x${totalMinorGridCols}), excluding ID: ${itemToExcludeId}`);

    // 1. Check grid boundaries (1-based indexing for targetRow/Col and totalRows/Cols)
    if (
        targetMinorRow < 1 ||
        targetMinorCol < 1 ||
        targetMinorRow + itemEffH_minor - 1 > totalMinorGridRows || // Max row item occupies
        targetMinorCol + itemEffW_minor - 1 > totalMinorGridCols    // Max col item occupies
    ) {
        // console.log(`[canPlaceItem] Placement fail: Out of bounds. Item ends at (${targetMinorRow + itemEffH_minor - 1}, ${targetMinorCol + itemEffW_minor - 1})`);
        return false;
    }

    // 2. Check for overlap with other items
    for (let rOffset = 0; rOffset < itemEffH_minor; rOffset++) {
        for (let cOffset = 0; cOffset < itemEffW_minor; cOffset++) {
            const checkMinorRow = targetMinorRow + rOffset;
            const checkMinorCol = targetMinorCol + cOffset;
            if (isMinorCellOccupied(checkMinorRow, checkMinorCol, designItems, itemToExcludeId)) {
                // console.log(`[canPlaceItem] Placement fail: Cell (${checkMinorRow}, ${checkMinorCol}) is occupied.`);
                return false;
            }
        }
    }
    // console.log(`[canPlaceItem] Placement success for item at (${targetMinorRow},${targetMinorCol})`);
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
        if (!item || !item.gridPosition || typeof item.gridPosition.rowStart !== 'number' || typeof item.gridPosition.colStart !== 'number') {
            // console.warn("[checkItemsInBounds] Skipping malformed item:", item);
            continue;
        }

        const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(item);
        const { rowStart: minorRowStart, colStart: minorColStart } = item.gridPosition;

        if (
            minorRowStart < 1 || minorColStart < 1 || // Should not happen if items are placed correctly
            minorRowStart + effH_minor - 1 > newTotalMinorRows ||
            minorColStart + effW_minor - 1 > newTotalMinorCols
        ) {
            // console.log(`[checkItemsInBounds] Item ${item.id} is OUT of new bounds (${newTotalMinorRows}x${newTotalMinorCols}). Item ends at (${minorRowStart + effH_minor - 1}, ${minorColStart + effW_minor - 1})`);
            return false; // This item is out of the new bounds
        }
    }
    // console.log(`[checkItemsInBounds] All items are WITHIN new bounds (${newTotalMinorRows}x${newTotalMinorCols})`);
    return true; // All items are within bounds
};

/**
 * Gets the next available table number from an array of design items.
 * It finds the smallest positive integer not currently used as a table number.
 * @param {Array} designItems - Array of all design items.
 * @returns {number} The next available table number (e.g., 1, 2, 3...).
 */
export const getNextAvailableTableNumber = (designItems) => {
    const tableNumbersInUse = new Set(
        designItems
            .filter(item => item.itemType === ItemTypes.PLACED_TABLE && typeof item.number === 'number' && item.number > 0 && !isNaN(item.number))
            .map(table => table.number)
    );

    if (tableNumbersInUse.size === 0) {
        return 1;
    }

    let nextNumber = 1;
    while (tableNumbersInUse.has(nextNumber)) {
        nextNumber++;
    }
    // console.log(`[getNextAvailableTableNumber] Existing numbers: ${[...tableNumbersInUse].sort((a,b)=>a-b)}. Next available: ${nextNumber}`);
    return nextNumber;
};

/**
 * Determines the default number of seats for a table based on its tool definition.
 * @param {string} toolSizeIdentifier - The 'size_identifier' from the toolDefinition (e.g., 'square-1x1').
 * @param {number} toolW_major - The base width of the tool in MAJOR grid cells.
 * @param {number} toolH_major - The base height of the tool in MAJOR grid cells.
 * @returns {number} The default number of seats.
 */
export const getDefaultSeatsForSize = (toolSizeIdentifier, toolW_major, toolH_major) => {
    // Prioritize specific known identifiers
    switch (toolSizeIdentifier) {
        case 'square-1x1':
            return 2;
        case 'rectangle-2x1': // Typically a 2-person or 4-person table (2x1 major cells)
            return 4;
        case 'round-2x2': // A 2x2 major cell round table
            return 4;
        // Add more specific cases if needed
        // case 'barstool-1x1': return 1;
    }

    // Fallback logic based on general dimensions (less precise)
    // This is a very rough heuristic and might need adjustment based on design intent
    if (toolW_major === 1 && toolH_major === 1) { // Small square/round
        return 2;
    }
    if ((toolW_major === 2 && toolH_major === 1) || (toolW_major === 1 && toolH_major === 2)) { // Small rectangle
        return 4;
    }
    if (toolW_major === 2 && toolH_major === 2) { // Larger square/round
        return 4; // Or maybe 6-8 if it's a large round table
    }

    console.warn(`[getDefaultSeatsForSize] No specific seat count for toolSizeIdentifier: '${toolSizeIdentifier}' (w_major: ${toolW_major}, h_major: ${toolH_major}). Defaulting seats to 2.`);
    return 2; // A general fallback
};