// features/venue_management/utils/layoutUtils.js

// ItemTypes is used by getNextAvailableTableNumber and parser for defaults
import { ItemTypes, ITEM_CONFIGS } from '../constants/itemConfigs';
import { DEFAULT_GRID_SUBDIVISION } from '../constants/layoutConstants'; // For default subdivision

const MIN_ITEM_DIMENSION_MINOR_CELLS = 1; // Ensure this is defined or imported if needed by parser logic

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
        console.warn("getEffectiveDimensions: Invalid item or missing w_minor/h_minor. Item:", item, "Defaulting to 1x1.");
        return { w: 1, h: 1 }; // Fallback for malformed items
    }

    const { w_minor, h_minor, rotation = 0 } = item;
    const normalizedRotation = (parseInt(String(rotation), 10) % 360 + 360) % 360; // Normalize to 0-359

    // If item.w_minor and item.h_minor in the state are already orientation-adjusted (swapped by useLayoutDesignerStateManagement),
    // then for cardinal rotations, these current w_minor/h_minor ARE the AABB dimensions.
    // For items coming directly from backend (w_minor/h_minor are base, not orientation-adjusted),
    // this logic needs to be consistent. The `useLayoutDesignerStateManagement` hook's updateItemProperties
    // is responsible for swapping w_minor/h_minor on rotation changes. So, this function should expect
    // w_minor/h_minor to be the base dimensions corresponding to the current visual orientation if it were at 0 degrees.
    // The parser should set these up correctly.

    // Correct logic if w_minor/h_minor are BASE dimensions (pre-orientation swap):
    if (normalizedRotation === 90 || normalizedRotation === 270) {
        return { w: h_minor, h: w_minor }; // Swap for AABB
    }
    if (normalizedRotation === 0 || normalizedRotation === 180) {
        return { w: w_minor, h: h_minor }; // No swap for AABB
    }

    // For ARBITRARY (non-cardinal) rotations, calculate the AABB based on the base w_minor, h_minor.
    const angleRad = (normalizedRotation * Math.PI) / 180;
    const cosA = Math.abs(Math.cos(angleRad));
    const sinA = Math.abs(Math.sin(angleRad));

    const effectiveWidth = w_minor * cosA + h_minor * sinA;
    const effectiveHeight = w_minor * sinA + h_minor * cosA;

    return {
        w: Math.max(1, Math.round(effectiveWidth)),
        h: Math.max(1, Math.round(effectiveHeight))
    };
};

// ... (isMinorCellOccupied, canPlaceItem, checkItemsInBounds, getNextAvailableTableNumber, getDefaultSeatsForSize remain unchanged for now)
// ... (These functions use getEffectiveDimensions, so its correctness is important)

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
        itemEffW_minor < 1 || itemEffH_minor < 1
    ) {
        console.error("canPlaceItem: Invalid input parameters for target position or dimensions.");
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
        designItems
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
        case 'round-1x1': return 2;
        case 'round-2x2': return 4;
    }
    if (toolW_major === 1 && toolH_major === 1) return 2;
    if ((toolW_major === 2 && toolH_major === 1) || (toolW_major === 1 && toolH_major === 2)) return 4;
    if (toolW_major === 2 && toolH_major === 2) return 4;
    console.warn(`[getDefaultSeatsForSize] No specific seat count for toolSizeIdentifier: '${toolSizeIdentifier}'. Defaulting to 2.`);
    return 2;
};

/**
 * Parses a single backend-formatted layout item into the frontend's flattened format.
 * @param {object} backendItem - The item object from the backend.
 * @param {number} gridSubdivision - The current grid subdivision factor.
 * @returns {object} The item in frontend format.
 */
export const parseBackendItemToFrontend = (backendItem, gridSubdivision = DEFAULT_GRID_SUBDIVISION, itemIndexForId = 0) => {
    if (!backendItem || typeof backendItem !== 'object') {
        console.warn("parseBackendItemToFrontend: Invalid backendItem received.", backendItem);
        return null;
    }

    let feItem = { ...backendItem }; // Start with a copy
    let specificProps = {};

    // 1. Extract and map item_specific_props
    if (feItem.item_specific_props && typeof feItem.item_specific_props === 'object') {
        const beSpecifics = feItem.item_specific_props;
        if (beSpecifics.table_number !== undefined) specificProps.number = beSpecifics.table_number;
        if (beSpecifics.is_provisional !== undefined) specificProps.isProvisional = beSpecifics.is_provisional;
        if (beSpecifics.swing_direction !== undefined) specificProps.swingDirection = beSpecifics.swing_direction;
        if (beSpecifics.is_open !== undefined) specificProps.isOpen = beSpecifics.is_open;

        const directMappedKeys = ['seats', 'shape', 'label', 'decorType', 'thickness_minor', 'length_units'];
        directMappedKeys.forEach(key => {
            if (beSpecifics[key] !== undefined) specificProps[key] = beSpecifics[key];
        });
        delete feItem.item_specific_props;
    }

    // 2. Map top-level backend keys to frontend keys/structure
    if (feItem.item_type !== undefined) {
        feItem.itemType = feItem.item_type;
        delete feItem.item_type;
    }
    if (feItem.is_fixed !== undefined) {
        feItem.isFixed = feItem.is_fixed;
        delete feItem.is_fixed;
    }

    feItem.gridPosition = {
        rowStart: Math.max(1, parseInt(String(feItem.grid_row_start), 10) || 1),
        colStart: Math.max(1, parseInt(String(feItem.grid_col_start), 10) || 1)
    };
    delete feItem.grid_row_start;
    delete feItem.grid_col_start;

    // 3. Merge extracted specificProps
    feItem = { ...feItem, ...specificProps };

    // 4. Sanitize and provide defaults for core frontend properties
    feItem.id = feItem.id || `loaded_item_${Date.now()}_${itemIndexForId}`; // Ensure ID exists
    if (!feItem.itemType || !ITEM_CONFIGS[feItem.itemType]) {
        console.warn(`[parseBackendItemToFrontend] Item ${feItem.id} has unknown type '${feItem.itemType}'. Defaulting to PLACED_DECOR.`);
        feItem.itemType = ItemTypes.PLACED_DECOR;
        if (!feItem.decorType && feItem.shape?.startsWith('plant-')) feItem.decorType = 'plant';
        if (!feItem.decorType && feItem.shape?.startsWith('rug-')) feItem.decorType = 'rug';
    }

    feItem.rotation = typeof feItem.rotation === 'number' ? (parseInt(String(feItem.rotation), 10) % 360 + 360) % 360 : 0;
    feItem.isFixed = typeof feItem.isFixed === 'boolean' ? feItem.isFixed : false;
    feItem.layer = typeof feItem.layer === 'number' ? feItem.layer : 1;

    // isProvisional (already handled if from item_specific_props, this is a fallback)
    if (feItem.itemType === ItemTypes.PLACED_TABLE) {
        if (typeof feItem.isProvisional !== 'boolean') {
            feItem.isProvisional = (feItem.number == null || String(feItem.number).trim() === '' || parseInt(String(feItem.number), 10) <= 0);
        }
    } else {
        if (typeof feItem.isProvisional !== 'boolean') feItem.isProvisional = false;
    }

    // w_minor, h_minor: Backend provides these. Ensure they are valid.
    // NOTE: The original parser had logic to derive from w_major/h_major for old localStorage.
    // For backend data, w_minor/h_minor should be present.
    feItem.w_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, parseInt(String(feItem.w_minor), 10) || (1 * gridSubdivision));
    feItem.h_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, parseInt(String(feItem.h_minor), 10) || (1 * gridSubdivision));

    // Shape (already handled if from item_specific_props)
    if (typeof feItem.shape === 'undefined') {
        feItem.shape = ITEM_CONFIGS[feItem.itemType]?.defaultPropsFactory?.({}, gridSubdivision, [])?.shape || `${feItem.itemType}-default-shape`;
    }

    // Table specific 'number' (already handled if from item_specific_props)
    // Sanitize 'seats' (already handled if from item_specific_props)
    if (feItem.itemType === ItemTypes.PLACED_TABLE && feItem.seats !== undefined && feItem.seats !== null && (typeof feItem.seats !== 'number' || isNaN(feItem.seats))) {
        feItem.seats = parseInt(String(feItem.seats), 10);
        if (isNaN(feItem.seats)) feItem.seats = null;
    }

    // Counter specific 'length_units' (already handled if from item_specific_props)
    // Add fallback if needed
    if (feItem.itemType === ItemTypes.PLACED_COUNTER) {
        if (typeof feItem.length_units !== 'number' || isNaN(feItem.length_units) || feItem.length_units < 1) {
            const isHorizontal = feItem.rotation === 0 || feItem.rotation === 180;
            const baseDimensionForLength = isHorizontal ? feItem.w_minor : feItem.h_minor;
            feItem.length_units = Math.max(1, Math.round(baseDimensionForLength / gridSubdivision));
        }
    }

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
        console.warn("parseBackendLayoutItemsToFrontend: Expected an array of backend items.", backendItemsArray);
        return [];
    }
    return backendItemsArray.map((item, index) => parseBackendItemToFrontend(item, gridSubdivision, index)).filter(item => item !== null);
};