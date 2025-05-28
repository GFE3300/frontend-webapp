// features/venue_management/utils/layoutUtils.js

// ItemTypes is used by getNextAvailableTableNumber for filtering
import { ItemTypes } from '../constants/itemConfigs';

/**
 * Calculates the effective dimensions (Axis-Aligned Bounding Box - AABB)
 * of an item in MINOR_CELL_UNITS, considering its rotation.
 * @param {object} item - The item object. Expected to have:
 *                        - item.w_minor: base width in minor cells (pre-rotation)
 *                        - item.h_minor: base height in minor cells (pre-rotation)
 *                        - item.rotation: angle in degrees (0, 90, 180, 270 for simple AABB, or arbitrary)
 * @returns {{ w: number, h: number }} Object containing effectiveWidth_minor (w) and effectiveHeight_minor (h) in minor cell units.
 */
export const getEffectiveDimensions = (item) => {
    if (!item || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        console.warn("getEffectiveDimensions: Invalid item or missing w_minor/h_minor. Item:", item, "Defaulting to 1x1.");
        return { w: 1, h: 1 }; // Fallback for malformed items
    }

    const { w_minor, h_minor, rotation = 0 } = item;
    const normalizedRotation = (parseInt(String(rotation), 10) % 360 + 360) % 360; // Normalize to 0-359

    if (normalizedRotation === 0 || normalizedRotation === 180) {
        return { w: w_minor, h: h_minor };
    }
    if (normalizedRotation === 90 || normalizedRotation === 270) {
        return { w: h_minor, h: w_minor }; // Swap width and height for 90/270 deg rotations
    }

    // For arbitrary rotations, calculate the AABB
    const angleRad = (normalizedRotation * Math.PI) / 180;
    const cosA = Math.abs(Math.cos(angleRad)); // Use absolute values for AABB
    const sinA = Math.abs(Math.sin(angleRad));

    const effectiveWidth = w_minor * cosA + h_minor * sinA;
    const effectiveHeight = w_minor * sinA + h_minor * cosA;

    return {
        w: Math.max(1, Math.round(effectiveWidth)),  // Ensure at least 1x1, round to nearest whole cell
        h: Math.max(1, Math.round(effectiveHeight))
    };
};

/**
 * Checks if a specific minor grid cell is occupied by any part of an existing design item.
 * @param {number} minorRowToCheck - The 1-based minor row index to check.
 * @param {number} minorColToCheck - The 1-based minor column index to check.
 * @param {Array<object>} designItems - Array of all placed design item objects.
 * @param {string | null} excludeItemId - ID of an item to exclude from the check (e.g., the item being moved).
 * @returns {boolean} True if the cell is occupied, false otherwise.
 */
const isMinorCellOccupied = (minorRowToCheck, minorColToCheck, designItems, excludeItemId) => {
    for (const item of designItems) {
        if (!item || !item.gridPosition || typeof item.gridPosition.rowStart !== 'number' || typeof item.gridPosition.colStart !== 'number') {
            continue; // Skip malformed items
        }
        if (item.id === excludeItemId) {
            continue; // Skip the item being excluded (e.g., when moving it)
        }

        const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(item);
        const { rowStart: itemMinorRowStart, colStart: itemMinorColStart } = item.gridPosition;

        // Check if the cell (minorRowToCheck, minorColToCheck) falls within the item's AABB
        if (
            minorRowToCheck >= itemMinorRowStart &&
            minorRowToCheck < itemMinorRowStart + effH_minor && // Max row extent is start + height - 1
            minorColToCheck >= itemMinorColStart &&
            minorColToCheck < itemMinorColStart + effW_minor   // Max col extent is start + width - 1
        ) {
            return true; // Cell is occupied by this item
        }
    }
    return false; // Cell is not occupied by any relevant item
};

/**
 * Determines if an item can be placed at the specified minor grid coordinates without overlapping
 * existing items or going out of bounds.
 * @param {number} targetMinorRow - Target 1-based top-left minor row for the item's placement.
 * @param {number} targetMinorCol - Target 1-based top-left minor col for the item's placement.
 * @param {number} itemEffW_minor - Effective width of the item in minor cells (after considering rotation).
 * @param {number} itemEffH_minor - Effective height of the item in minor cells (after considering rotation).
 * @param {Array<object>} designItems - Array of all existing placed design items.
 * @param {number} totalMinorGridRows - Total number of minor rows available on the grid.
 * @param {number} totalMinorGridCols - Total number of minor columns available on the grid.
 * @param {string | null} [itemToExcludeId=null] - ID of an item to exclude from collision checks.
 * @returns {boolean} True if the item can be placed, false otherwise.
 */
export const canPlaceItem = (
    targetMinorRow, targetMinorCol,
    itemEffW_minor, itemEffH_minor,
    designItems,
    totalMinorGridRows, totalMinorGridCols,
    itemToExcludeId = null
) => {
    // Ensure target coordinates and dimensions are valid numbers
    if (
        isNaN(targetMinorRow) || isNaN(targetMinorCol) ||
        isNaN(itemEffW_minor) || isNaN(itemEffH_minor) ||
        itemEffW_minor < 1 || itemEffH_minor < 1 // Effective dimensions must be at least 1x1
    ) {
        console.error("canPlaceItem: Invalid input parameters for target position or dimensions.");
        return false;
    }

    // 1. Check grid boundaries (1-based indexing for targetRow/Col and totalRows/Cols)
    if (
        targetMinorRow < 1 ||
        targetMinorCol < 1 ||
        targetMinorRow + itemEffH_minor - 1 > totalMinorGridRows || // Max row item occupies
        targetMinorCol + itemEffW_minor - 1 > totalMinorGridCols    // Max col item occupies
    ) {
        return false; // Out of bounds
    }

    // 2. Check for overlap with other items by iterating through each cell the new item would occupy
    for (let rOffset = 0; rOffset < itemEffH_minor; rOffset++) {
        for (let cOffset = 0; cOffset < itemEffW_minor; cOffset++) {
            const checkMinorRow = targetMinorRow + rOffset;
            const checkMinorCol = targetMinorCol + cOffset;
            if (isMinorCellOccupied(checkMinorRow, checkMinorCol, designItems, itemToExcludeId)) {
                return false; // Collision detected
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
 * @param {Array<object>} designItems - Array of design item objects to check.
 * @returns {boolean} True if all items are in bounds, false otherwise.
 */
export const checkItemsInBounds = (newTotalMinorRows, newTotalMinorCols, designItems) => {
    for (const item of designItems) {
        if (!item || !item.gridPosition || typeof item.gridPosition.rowStart !== 'number' || typeof item.gridPosition.colStart !== 'number') {
            continue; // Skip malformed items
        }

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
 * It finds the smallest positive integer not currently used as a table number.
 * @param {Array<object>} designItems - Array of all design items.
 * @returns {number} The next available table number (e.g., 1, 2, 3...).
 */
export const getNextAvailableTableNumber = (designItems) => {
    const tableNumbersInUse = new Set(
        designItems
            .filter(item => item.itemType === ItemTypes.PLACED_TABLE &&
                typeof item.number === 'number' &&
                !isNaN(item.number) && // Ensure it's not NaN after parsing
                item.number > 0)
            .map(table => table.number)
    );

    if (tableNumbersInUse.size === 0) {
        return 1;
    }

    let nextNumber = 1;
    while (tableNumbersInUse.has(nextNumber)) {
        nextNumber++;
    }
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
        case 'round-1x1': // Added from itemConfigs.jsx for consistency
            return 2;
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