import { ItemTypes, ITEM_CONFIGS } from '../constants/itemConfigs';
import { DEFAULT_GRID_SUBDIVISION } from '../constants/layoutConstants'; // For default subdivision

const MIN_ITEM_DIMENSION_MINOR_CELLS = 1; // Ensure this is defined or imported if needed by parser logic
const DEBUG_LAYOUT_UTILS_PARSER = "[LayoutUtils Parser DEBUG]";


/**
 * Calculates the effective dimensions (Axis-Aligned Bounding Box - AABB)
 * of an item in MINOR_CELL_UNITS, considering its rotation.
 * Assumes item.w_minor and item.h_minor in the item's state have already been
 * swapped if the item's orientation changed due to a 90/270 degree rotation.
 * @param {object} item - The item object. Expected to have:
 *                        - item.w_minor: base width in minor cells (orientation-adjusted)
 *                        - item.h_minor: base height in minor cells (orientation-adjusted)
 *                        - item.rotation: angle in degrees
 * @returns {{ w: number, h: number }} Object containing effectiveWidth_minor (w) and effectiveHeight_minor (h) in minor cell units.
 */
export const getEffectiveDimensions = (item) => {
    if (!item || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        // console.warn("getEffectiveDimensions: Invalid item or missing w_minor/h_minor. Item:", item, "Defaulting to 1x1.");
        return { w: 1, h: 1 }; // Fallback for malformed items
    }

    const { w_minor, h_minor, rotation = 0 } = item;
    const normalizedRotation = (parseInt(String(rotation), 10) % 360 + 360) % 360; // Normalize to 0-359

    // If item.w_minor and item.h_minor in the state are already orientation-adjusted (swapped by useLayoutDesignerStateManagement),
    // then for cardinal rotations, these current w_minor/h_minor ARE the AABB dimensions.
    if (normalizedRotation === 0 || normalizedRotation === 90 || normalizedRotation === 180 || normalizedRotation === 270) {
        return { w: w_minor, h: h_minor };
    }

    // For ARBITRARY (non-cardinal) rotations, calculate the AABB based on the current w_minor, h_minor.
    // These w_minor, h_minor are the base dimensions of the item as if its current visual orientation were "0 degrees".
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
export const isMinorCellOccupied = (minorRowToCheck, minorColToCheck, designItems, excludeItemId) => {
    for (const item of designItems) {
        if (!item || !item.gridPosition || typeof item.gridPosition.rowStart !== 'number' || typeof item.gridPosition.colStart !== 'number') {
            continue; // Skip malformed items
        }
        if (item.id === excludeItemId) {
            continue; // Skip the item being excluded (e.g., when moving it)
        }

        const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(item);
        const { rowStart: itemMinorRowStart, colStart: itemMinorColStart } = item.gridPosition;

        if (
            minorRowToCheck >= itemMinorRowStart &&
            minorRowToCheck < itemMinorRowStart + effH_minor &&
            minorColToCheck >= itemMinorColStart &&
            minorColToCheck < itemMinorColStart + effW_minor
        ) {
            return true;
        }
    }
    return false;
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
    if (
        isNaN(targetMinorRow) || isNaN(targetMinorCol) ||
        isNaN(itemEffW_minor) || isNaN(itemEffH_minor) ||
        itemEffW_minor < MIN_ITEM_DIMENSION_MINOR_CELLS || itemEffH_minor < MIN_ITEM_DIMENSION_MINOR_CELLS
    ) {
        // console.error(DEBUG_LAYOUT_UTILS_PARSER, "canPlaceItem: Invalid input parameters for target position or dimensions.");
        return false;
    }

    if (
        targetMinorRow < 1 ||
        targetMinorCol < 1 ||
        targetMinorRow + itemEffH_minor - 1 > totalMinorGridRows ||
        targetMinorCol + itemEffW_minor - 1 > totalMinorGridCols
    ) {
        return false; // Out of bounds
    }

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
 * @param {number} newTotalMinorRows - The new total number of minor rows for the grid.
 * @param {number} newTotalMinorCols - The new total number of minor columns for the grid.
 * @param {Array<object>} designItems - Array of design item objects to check.
 * @returns {boolean} True if all items are in bounds, false otherwise.
 */
export const checkItemsInBounds = (newTotalMinorRows, newTotalMinorCols, designItems) => {
    for (const item of designItems) {
        if (!item || !item.gridPosition || typeof item.gridPosition.rowStart !== 'number' || typeof item.gridPosition.colStart !== 'number') {
            continue;
        }
        const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(item);
        const { rowStart: minorRowStart, colStart: minorColStart } = item.gridPosition;
        if (
            minorRowStart < 1 || minorColStart < 1 ||
            minorRowStart + effH_minor - 1 > newTotalMinorRows ||
            minorColStart + effW_minor - 1 > newTotalMinorCols
        ) {
            return false;
        }
    }
    return true;
};

/**
 * Gets the next available table number from an array of design items.
 * @param {Array<object>} designItems - Array of all design items (expected in frontend format).
 * @returns {number} The next available table number.
 */
export const getNextAvailableTableNumber = (designItems) => {
    const tableNumbersInUse = new Set(
        (designItems || [])
            .filter(item => item.itemType === ItemTypes.PLACED_TABLE &&
                typeof item.number === 'number' &&
                !isNaN(item.number) &&
                item.number > 0)
            .map(table => table.number)
    );
    if (tableNumbersInUse.size === 0) return 1;
    let nextNumber = 1;
    while (tableNumbersInUse.has(nextNumber)) nextNumber++;
    return nextNumber;
};

/**
 * Determines the default number of seats for a table based on its tool definition.
 * @param {string} toolSizeIdentifier - The 'size_identifier' from the toolDefinition.
 * @param {number} toolW_major - The base width of the tool in MAJOR grid cells.
 * @param {number} toolH_major - The base height of the tool in MAJOR grid cells.
 * @returns {number} The default number of seats.
 */
export const getDefaultSeatsForSize = (toolSizeIdentifier, toolW_major, toolH_major) => {
    switch (toolSizeIdentifier) {
        case 'square-1x1': return 2;
        case 'rectangle-2x1': return 4;
        case 'rectangle-1x2': return 4;
        case 'round-1x1': return 2;
        case 'round-2x2': return 4; // Assuming a 2x2 round table exists
    }
    // Fallback logic based on major dimensions
    if (toolW_major === 1 && toolH_major === 1) return 2;
    if ((toolW_major === 2 && toolH_major === 1) || (toolW_major === 1 && toolH_major === 2)) return 4;
    if (toolW_major === 2 && toolH_major === 2) return 4;
    // console.warn(DEBUG_LAYOUT_UTILS_PARSER, `[getDefaultSeatsForSize] No specific seat count for toolSizeIdentifier: '${toolSizeIdentifier}'. Defaulting to 2.`);
    return 2;
};

/**
 * Parses a single backend-formatted layout item into the frontend's flattened format.
 * @param {object} backendItem - The item object from the backend.
 * @param {number} gridSubdivision - The current grid subdivision factor (used for defaults if needed).
 * @param {number} itemIndexForId - Index for generating a fallback ID.
 * @returns {object | null} The item in frontend format, or null if parsing fails.
 */
export const parseBackendItemToFrontend = (backendItem, gridSubdivision = DEFAULT_GRID_SUBDIVISION, itemIndexForId = 0) => {
    if (!backendItem || typeof backendItem !== 'object') {
        // console.warn(DEBUG_LAYOUT_UTILS_PARSER, "parseBackendItemToFrontend: Invalid backendItem received.", backendItem);
        return null;
    }

    const feItem = {};

    // 1. Core properties from backend item root
    feItem.id = backendItem.id || `loaded_item_${Date.now()}_${itemIndexForId}`; // Ensure ID exists
    feItem.itemType = backendItem.item_type;
    feItem.gridPosition = {
        rowStart: Math.max(1, parseInt(String(backendItem.grid_row_start), 10) || 1),
        colStart: Math.max(1, parseInt(String(backendItem.grid_col_start), 10) || 1)
    };
    feItem.w_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, parseInt(String(backendItem.w_minor), 10) || (1 * gridSubdivision));
    feItem.h_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, parseInt(String(backendItem.h_minor), 10) || (1 * gridSubdivision));
    feItem.rotation = typeof backendItem.rotation === 'number' ? (parseInt(String(backendItem.rotation), 10) % 360 + 360) % 360 : 0;
    feItem.layer = typeof backendItem.layer === 'number' ? backendItem.layer : 1;
    feItem.isFixed = typeof backendItem.is_fixed === 'boolean' ? backendItem.is_fixed : false;

    // 2. Extract and flatten item_specific_props
    const beSpecifics = backendItem.item_specific_props || {};

    // Table-specific properties
    if (feItem.itemType === ItemTypes.PLACED_TABLE) {
        feItem.number = beSpecifics.table_number !== undefined ? beSpecifics.table_number : null;

        if (typeof beSpecifics.is_provisional === 'boolean') {
            feItem.isProvisional = beSpecifics.is_provisional;
        } else {
            feItem.isProvisional = (feItem.number === null || typeof feItem.number === 'undefined');
        }

        feItem.seats = typeof beSpecifics.seats === 'number'
            ? beSpecifics.seats
            : getDefaultSeatsForSize(
                beSpecifics.shape || 'square-1x1',
                Math.round(feItem.w_minor / (gridSubdivision || DEFAULT_GRID_SUBDIVISION)),
                Math.round(feItem.h_minor / (gridSubdivision || DEFAULT_GRID_SUBDIVISION))
            );
        feItem.shape = beSpecifics.shape || 'square-1x1';
    }

    // Wall-specific properties
    else if (feItem.itemType === ItemTypes.PLACED_WALL) {
        feItem.shape = beSpecifics.shape || 'wall-segment';
        feItem.thickness_minor = typeof beSpecifics.thickness_minor === 'number' ? beSpecifics.thickness_minor : 1;
    }

    // Door-specific properties
    else if (feItem.itemType === ItemTypes.PLACED_DOOR) {
        feItem.shape = beSpecifics.shape || 'standard-door';
        feItem.swingDirection = beSpecifics.swing_direction || 'left';
        feItem.isOpen = typeof beSpecifics.is_open === 'boolean' ? beSpecifics.is_open : false;
    }

    // Decor-specific properties
    else if (feItem.itemType === ItemTypes.PLACED_DECOR) {
        feItem.shape = beSpecifics.shape || 'default-decor-shape';
        feItem.decorType = beSpecifics.decorType || 'generic'; // e.g., 'plant', 'rug'
        feItem.label = beSpecifics.label || ''; // Optional label
    }

    // Counter-specific properties
    else if (feItem.itemType === ItemTypes.PLACED_COUNTER) {
        feItem.shape = beSpecifics.shape || 'counter-straight-1x1';
        feItem.label = beSpecifics.label || '';
        feItem.length_units = typeof beSpecifics.length_units === 'number' ? beSpecifics.length_units : 1;
    }

    // Fallback for unknown itemType or types without specific props handling above
    else {
        if (!feItem.itemType || !ITEM_CONFIGS[feItem.itemType]) {
            // console.warn(DEBUG_LAYOUT_UTILS_PARSER, `Item ${feItem.id} has unknown type '${feItem.itemType}'. Defaulting to PLACED_DECOR.`);
            feItem.itemType = ItemTypes.PLACED_DECOR; // Default type
            feItem.decorType = beSpecifics.decorType || 'unknown';
            feItem.shape = beSpecifics.shape || 'unknown-shape';
        }
        // Copy any other specific props directly if not handled explicitly (use with caution)
        // for (const key in beSpecifics) {
        //     if (Object.prototype.hasOwnProperty.call(beSpecifics, key) && feItem[key] === undefined) {
        //         feItem[key] = beSpecifics[key];
        //     }
        // }
    }

    // General default for isProvisional if not set by type-specific logic
    if (typeof feItem.isProvisional !== 'boolean') {
        feItem.isProvisional = false;
    }


    // console.log(DEBUG_LAYOUT_UTILS_PARSER, `Parsed backend item ${backendItem.id || 'NEW_FROM_INDEX_'+itemIndexForId} into frontend item:`, JSON.parse(JSON.stringify(feItem)));
    return feItem;
};


/**
 * Parses a full backend layout (array of items) into frontend format.
 * @param {Array<object>} backendItemsArray - The array of item objects from the backend.
 * @param {number} gridSubdivision - The current grid subdivision factor.
 * @returns {Array<object>} Array of items in frontend format.
 */
export const parseBackendLayoutItemsToFrontend = (backendItemsArray, gridSubdivision = DEFAULT_GRID_SUBDIVISION) => {
    if (!Array.isArray(backendItemsArray)) {
        // console.warn(DEBUG_LAYOUT_UTILS_PARSER, "parseBackendLayoutItemsToFrontend: Expected an array of backend items.", backendItemsArray);
        return [];
    }
    // console.log(DEBUG_LAYOUT_UTILS_PARSER, `Parsing ${backendItemsArray.length} backend items with subdivision ${gridSubdivision}`);
    const parsedItems = backendItemsArray.map((item, index) => parseBackendItemToFrontend(item, gridSubdivision, index)).filter(item => item !== null);
    // console.log(DEBUG_LAYOUT_UTILS_PARSER, `Successfully parsed ${parsedItems.length} items into frontend format.`);
    return parsedItems;
};