// features/venue_management/hooks/useLayoutDesignerStateManagement.js
import { useCallback, useEffect, useMemo } from 'react';
import useHistory from './useHistory';

// Constants from the main layout constants file
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    MIN_GRID_ROWS,
    MAX_GRID_ROWS,
    MIN_GRID_COLS,
    MAX_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION,
    // AVAILABLE_SUBDIVISIONS, // Not directly used here, but by toolbar
} from '../constants/layoutConstants';

// Item specific configurations and types from the refactored itemConfigs.jsx
import { ItemTypes, ITEM_CONFIGS } from '../constants/itemConfigs';

// Utilities
import {
    canPlaceItem as canPlaceItemUtil,
    checkItemsInBounds as checkItemsInBoundsUtil,
    getEffectiveDimensions as getEffectiveDimensionsUtil,
    // getNextAvailableTableNumber is now called within ITEM_CONFIGS[PLACED_TABLE].defaultPropsFactory
} from '../utils/layoutUtils';

const STABLE_EMPTY_ARRAY_DESIGN_ITEMS = Object.freeze([]); // For stable reference

const useLayoutDesignerStateManagement = (
    initialLayoutConfig = {},
    openAlertModal = (title, message, type) => console.warn(`Alert Modal not provided: ${type} - ${title}: ${message}`)
) => {
    const {
        initialDesignItems = STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
        initialGridRows = DEFAULT_INITIAL_GRID_ROWS,
        initialGridCols = DEFAULT_INITIAL_GRID_COLS,
        initialGridSubdivision = DEFAULT_GRID_SUBDIVISION,
    } = initialLayoutConfig;

    /**
     * Generates default properties for a new item being placed.
     * Uses the item's configuration from ITEM_CONFIGS.
     */
    const generateNewItemFromTool = useCallback((
        toolPayloadFromDrag, // { toolItemType, createsPlacedItemType, w_major, h_major, size_identifier }
        targetMinorRow,
        targetMinorCol,
        currentSubdivision,
        existingDesignItems // Pass all existing items for context (e.g., table numbering)
    ) => {
        const placedItemType = toolPayloadFromDrag.createsPlacedItemType;
        const config = ITEM_CONFIGS[placedItemType];

        if (!config) {
            console.error(`[generateNewItemFromTool] No config found for placedItemType: ${placedItemType}`);
            openAlertModal("Configuration Error", `Cannot add item: Configuration missing for item type '${placedItemType}'.`, "error");
            return null;
        }

        const baseId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        // Tool's w_major/h_major define span in MAJOR grid cells. Convert to MINOR cell span for the item's base dimensions.
        const base_w_minor = toolPayloadFromDrag.w_major * currentSubdivision;
        const base_h_minor = toolPayloadFromDrag.h_major * currentSubdivision;

        let typeSpecificDefaults = {};
        if (config.defaultPropsFactory) {
            // Pass relevant parts of toolPayload and context to the factory
            typeSpecificDefaults = config.defaultPropsFactory(toolPayloadFromDrag, currentSubdivision, existingDesignItems);
        }

        return {
            id: baseId,
            itemType: placedItemType, // The type of item being created (e.g., PLACED_TABLE)
            gridPosition: { rowStart: targetMinorRow, colStart: targetMinorCol }, // MINOR coords for top-left
            w_minor: base_w_minor,    // Base width in MINOR cells (pre-rotation)
            h_minor: base_h_minor,    // Base height in MINOR cells (pre-rotation)
            rotation: 0,              // Default rotation
            isFixed: false,           // Default common property
            layer: 1,                 // Default common property (for future layering)
            ...typeSpecificDefaults,  // Apply/override with type-specific defaults from factory
        };
    }, [openAlertModal]);


    /**
     * Parses and prepares initial items for the layout.
     * Ensures essential properties are present and consistent.
     */
    const parseAndPrepareInitialItems = useCallback((itemsToParse) => {
        if (!itemsToParse || itemsToParse.length === 0) return STABLE_EMPTY_ARRAY_DESIGN_ITEMS;

        return itemsToParse.map(originalItem => {
            const item = { ...originalItem }; // Create a mutable copy

            // Ensure common defaults if missing
            item.rotation = typeof item.rotation === 'number' ? item.rotation : 0;
            item.isFixed = typeof item.isFixed === 'boolean' ? item.isFixed : false;
            item.layer = typeof item.layer === 'number' ? item.layer : 1;

            // Ensure w_minor and h_minor are present (critical for dimensions)
            // These should ideally be set correctly upon creation or load.
            // Fallbacks for older data structures:
            if (typeof item.w_minor !== 'number') {
                // console.warn(`Item ${item.id || 'Unknown ID'} missing w_minor. Defaulting to 1 or using 'w'. Original:`, originalItem);
                item.w_minor = Number(item.w) || 1 * (item.gridSubdivision || initialGridSubdivision || DEFAULT_GRID_SUBDIVISION); // If 'w' was major cells
                if (isNaN(item.w_minor)) item.w_minor = 1 * (item.gridSubdivision || initialGridSubdivision || DEFAULT_GRID_SUBDIVISION);
            }
            if (typeof item.h_minor !== 'number') {
                // console.warn(`Item ${item.id || 'Unknown ID'} missing h_minor. Defaulting to 1 or using 'h'. Original:`, originalItem);
                item.h_minor = Number(item.h) || 1 * (item.gridSubdivision || initialGridSubdivision || DEFAULT_GRID_SUBDIVISION);
                if (isNaN(item.h_minor)) item.h_minor = 1 * (item.gridSubdivision || initialGridSubdivision || DEFAULT_GRID_SUBDIVISION);
            }
            delete item.w; // Remove old property if it existed
            delete item.h; // Remove old property if it existed

            // Ensure `shape` property (used by renderers) exists, potentially from old `size_identifier` or `size`
            if (typeof item.shape === 'undefined' && typeof item.size_identifier === 'string') {
                item.shape = item.size_identifier;
            } else if (typeof item.shape === 'undefined' && typeof item.size === 'string') {
                item.shape = item.size;
            }
            delete item.size_identifier;
            delete item.size;

            // For tables, ensure 'number' property exists if 'tableNumber' was used.
            // This specific migration should ideally be one-off or handled by the table's config/parser if more complex.
            if (item.itemType === ItemTypes.PLACED_TABLE) {
                if (typeof item.number === 'undefined' && typeof item.tableNumber === 'number') {
                    item.number = item.tableNumber;
                }
                delete item.tableNumber; // Clean up old property
            }

            return item;
        });
    }, [initialGridSubdivision]); // Include initialGridSubdivision if used as fallback


    const initialSnapshot = useMemo(() => ({
        designItems: parseAndPrepareInitialItems(initialDesignItems),
        gridRows: initialGridRows,
        gridCols: initialGridCols,
        gridSubdivision: initialGridSubdivision,
    }), [initialDesignItems, initialGridRows, initialGridCols, initialGridSubdivision, parseAndPrepareInitialItems]);

    const {
        state: layoutSnapshot,
        setState: setLayoutSnapshotWithHistory,
        undo,
        redo,
        canUndo,
        canRedo,
        resetHistory,
    } = useHistory(initialSnapshot);

    const { designItems, gridRows, gridCols, gridSubdivision } = layoutSnapshot;

    // Effect to re-initialize state if top-level props change (e.g., loading a different layout)
    useEffect(() => {
        const newParsedItems = parseAndPrepareInitialItems(
            initialLayoutConfig.initialDesignItems || STABLE_EMPTY_ARRAY_DESIGN_ITEMS
        );
        const newSnapshot = {
            designItems: newParsedItems,
            gridRows: initialLayoutConfig.initialGridRows || DEFAULT_INITIAL_GRID_ROWS,
            gridCols: initialLayoutConfig.initialGridCols || DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION,
        };
        // Only reset if the snapshot is actually different to avoid infinite loops or unnecessary history resets
        if (JSON.stringify(newSnapshot) !== JSON.stringify(layoutSnapshot)) {
            resetHistory(newSnapshot);
        }
    }, [
        initialLayoutConfig.initialDesignItems,
        initialLayoutConfig.initialGridRows,
        initialLayoutConfig.initialGridCols,
        initialLayoutConfig.initialGridSubdivision,
        resetHistory,
        parseAndPrepareInitialItems,
        layoutSnapshot // Add layoutSnapshot to dependencies for comparison
    ]);


    const getEffectiveDimensions = useCallback((item) => {
        return getEffectiveDimensionsUtil(item); // Util handles rotation using item.w_minor, item.h_minor
    }, []);

    const canPlaceItem = useCallback((minorRow, minorCol, itemW_minor, itemH_minor, itemToExcludeId = null) => {
        const totalMinorRows = gridRows * gridSubdivision;
        const totalMinorCols = gridCols * gridSubdivision;
        return canPlaceItemUtil(
            minorRow, minorCol,
            itemW_minor, itemH_minor,
            designItems,
            totalMinorRows, totalMinorCols,
            itemToExcludeId,
            getEffectiveDimensions // Pass the memoized version
        );
    }, [designItems, gridRows, gridCols, gridSubdivision, getEffectiveDimensions]);

    const addItemToLayout = useCallback((
        toolPayloadFromDrag, // { toolItemType, createsPlacedItemType, w_major, h_major, size_identifier }
        minorTargetRow,
        minorTargetCol
    ) => {
        // Item dimensions in minor cells derived from tool's major cell span and current subdivision
        const itemBaseW_minor = toolPayloadFromDrag.w_major * gridSubdivision;
        const itemBaseH_minor = toolPayloadFromDrag.h_major * gridSubdivision;
        // For canPlaceItem check, we assume 0 rotation initially for a new item from tool.
        // Effective dimensions will be same as base dimensions if rotation is 0.
        const effW_minor = itemBaseW_minor;
        const effH_minor = itemBaseH_minor;


        if (!canPlaceItem(minorTargetRow, minorTargetCol, effW_minor, effH_minor, null)) {
            openAlertModal("Placement Error", `Cannot place item: space occupied or out of bounds.`, "error");
            return;
        }

        setLayoutSnapshotWithHistory(prev => {
            const newItem = generateNewItemFromTool(
                toolPayloadFromDrag,
                minorTargetRow,
                minorTargetCol,
                prev.gridSubdivision, // Use subdivision from prev state for consistency
                prev.designItems      // Pass existing items for context
            );
            if (newItem) {
                return { ...prev, designItems: [...prev.designItems, newItem] };
            }
            return prev; // If newItem is null due to config error
        });
    }, [canPlaceItem, gridSubdivision, setLayoutSnapshotWithHistory, openAlertModal, generateNewItemFromTool]);

    const moveExistingItem = useCallback((itemId, toMinorRow, toMinorCol) => {
        setLayoutSnapshotWithHistory(prev => {
            const itemToMove = prev.designItems.find(it => it.id === itemId);
            if (!itemToMove) return prev;

            // Effective dimensions are calculated based on the item's current rotation and base w_minor/h_minor
            const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(itemToMove);

            if (!canPlaceItem(toMinorRow, toMinorCol, effW_minor, effH_minor, itemId)) {
                // openAlertModal("Move Error", "Cannot move item: space occupied or out of bounds.", "warning"); // Optional: alert on failed move
                return prev; // Invalid move
            }
            return {
                ...prev,
                designItems: prev.designItems.map(it =>
                    it.id === itemId ? { ...it, gridPosition: { rowStart: toMinorRow, colStart: toMinorCol } } : it
                ),
            };
        });
    }, [canPlaceItem, setLayoutSnapshotWithHistory, getEffectiveDimensions /*, openAlertModal */]);

    const removeItemById = useCallback((itemId) => {
        setLayoutSnapshotWithHistory(prev => ({
            ...prev,
            designItems: prev.designItems.filter(it => it.id !== itemId),
        }));
    }, [setLayoutSnapshotWithHistory]);

    const removeItemAtCoords = useCallback((minorRowClicked, minorColClicked) => {
        setLayoutSnapshotWithHistory(prev => {
            // Find an item whose bounding box (effective dimensions) includes the clicked minor cell
            const itemToRemove = prev.designItems.find(it => {
                if (!it || !it.gridPosition) return false;
                const { w: itemW_minor, h: itemH_minor } = getEffectiveDimensions(it); // Use effective dimensions
                return minorRowClicked >= it.gridPosition.rowStart &&
                    minorRowClicked < it.gridPosition.rowStart + itemH_minor &&
                    minorColClicked >= it.gridPosition.colStart &&
                    minorColClicked < it.gridPosition.colStart + itemW_minor;
            });

            if (itemToRemove) {
                return { ...prev, designItems: prev.designItems.filter(it => it.id !== itemToRemove.id) };
            }
            return prev;
        });
    }, [setLayoutSnapshotWithHistory, getEffectiveDimensions]);

    const updateItemProperties = useCallback((itemId, newProps) => {
        // newProps is an object like { seats: 5 } or { rotation: true }
        let validationPassed = true; // Assume success initially for non-critical props

        setLayoutSnapshotWithHistory(prev => {
            const itemIndex = prev.designItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) return prev;

            const currentItem = prev.designItems[itemIndex];
            const itemConfig = ITEM_CONFIGS[currentItem.itemType]; // Get config for the specific item type
            let accumulatedChanges = { ...newProps }; // Start with the incoming newProps

            // --- Table Number Specific Validation (Example of type-specific validation) ---
            if (currentItem.itemType === ItemTypes.PLACED_TABLE && newProps.number !== undefined) {
                const newNumStr = String(newProps.number).trim();
                if (newNumStr === "") { // Allow clearing the number input
                    accumulatedChanges.number = null; // Or some other representation for "not set"
                } else {
                    const newNum = parseInt(newNumStr, 10);
                    if (isNaN(newNum) || newNum <= 0) {
                        openAlertModal("Invalid Input", "Table number must be a positive integer or empty.", "error");
                        validationPassed = false; delete accumulatedChanges.number;
                    } else if (prev.designItems.some(it => it.id !== itemId && it.itemType === ItemTypes.PLACED_TABLE && it.number === newNum)) {
                        openAlertModal("Duplicate Number", `Table number ${newNum} is already in use.`, "warning");
                        validationPassed = false; delete accumulatedChanges.number;
                    }
                }
            }

            // --- Seats Validation (Example for tables) ---
            if (currentItem.itemType === ItemTypes.PLACED_TABLE && newProps.seats !== undefined) {
                const newSeatsStr = String(newProps.seats).trim();
                if (newSeatsStr === "") {
                    accumulatedChanges.seats = null;
                } else {
                    const newSeatsNum = parseInt(newSeatsStr, 10);
                    if (isNaN(newSeatsNum) || newSeatsNum < 0) {
                        openAlertModal("Invalid Input", "Number of seats must be a non-negative integer or empty.", "error");
                        validationPassed = false; delete accumulatedChanges.seats;
                    }
                }
            }

            // --- Rotation Logic (Generic, applies if item isRotatable) ---
            if (newProps.rotation === true && itemConfig?.isRotatable) { // `rotation: true` is a trigger
                const currentRotation = currentItem.rotation || 0;
                // Simple 90-degree toggle for now. Could be more complex (e.g., 0, 90, 180, 270)
                const newRotationValue = (currentRotation + 90) % (itemConfig.allow360Rotation ? 360 : 180); // Example for 0/90 or 0/90/180/270
                if (itemConfig.allowedRotations && !itemConfig.allowedRotations.includes(newRotationValue)) { // More granular control
                    // find next allowed rotation or cycle
                }


                // Temporarily apply new rotation to check placement feasibility
                const tempItemWithNewRotation = { ...currentItem, ...accumulatedChanges, rotation: newRotationValue };
                const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(tempItemWithNewRotation);

                const totalMinorRows = prev.gridRows * prev.gridSubdivision;
                const totalMinorCols = prev.gridCols * prev.gridSubdivision;

                if (!canPlaceItemUtil(
                    currentItem.gridPosition.rowStart, currentItem.gridPosition.colStart,
                    effW_minor, effH_minor,
                    prev.designItems, totalMinorRows, totalMinorCols, itemId, getEffectiveDimensions
                )) {
                    openAlertModal("Rotation Error", "Cannot rotate: new orientation conflicts or is out of bounds.", "error");
                    // Do not apply rotation, remove the trigger from changes
                    delete accumulatedChanges.rotation;
                    // validationPassed remains true unless other props failed
                } else {
                    accumulatedChanges.rotation = newRotationValue; // Apply the actual new rotation value
                }
            } else if (newProps.rotation === true && !itemConfig?.isRotatable) {
                delete accumulatedChanges.rotation; // Item not rotatable, remove trigger
            }
            // --- End Rotation Logic ---

            // Add more type-specific property validation here if needed, using itemConfig.
            // For Phase 1, most other properties (like wall thickness, door swing) are simple value changes.

            if (!validationPassed && Object.keys(newProps).length === 1 && (newProps.number !== undefined || newProps.seats !== undefined)) {
                // If the only prop being changed failed validation (e.g. table number), revert the snapshot.
                return prev;
            }
            if (Object.keys(accumulatedChanges).length === 0 && !validationPassed) {
                // All attempted changes were invalid and removed from accumulatedChanges
                return prev;
            }


            const updatedItem = { ...currentItem, ...accumulatedChanges };
            const newDesignItems = [...prev.designItems];
            newDesignItems[itemIndex] = updatedItem;
            return { ...prev, designItems: newDesignItems };
        });
        return validationPassed; // Return success/failure of critical validations
    }, [setLayoutSnapshotWithHistory, openAlertModal, getEffectiveDimensions, canPlaceItemUtil]);


    const setGridDimensions = useCallback(({ rows, cols }) => { // These are MAJOR rows/cols
        setLayoutSnapshotWithHistory(prev => {
            const targetMajorRows = rows !== undefined ? parseInt(rows, 10) : prev.gridRows;
            const targetMajorCols = cols !== undefined ? parseInt(cols, 10) : prev.gridCols;

            if ((rows !== undefined && (isNaN(targetMajorRows) || targetMajorRows < MIN_GRID_ROWS || targetMajorRows > MAX_GRID_ROWS)) ||
                (cols !== undefined && (isNaN(targetMajorCols) || targetMajorCols < MIN_GRID_COLS || targetMajorCols > MAX_GRID_COLS))) {
                openAlertModal("Invalid Dimension", `Major grid dimensions out of range (${MIN_GRID_ROWS}-${MAX_GRID_ROWS}R, ${MIN_GRID_COLS}-${MAX_GRID_COLS}C).`, "warning");
                return prev;
            }

            // Calculate new total minor dimensions
            const newTotalMinorRows = targetMajorRows * prev.gridSubdivision;
            const newTotalMinorCols = targetMajorCols * prev.gridSubdivision;

            // Check if shrinking grid would make items go out of bounds
            if ((rows !== undefined && targetMajorRows < prev.gridRows && !checkItemsInBoundsUtil(newTotalMinorRows, prev.gridCols * prev.gridSubdivision, prev.designItems, getEffectiveDimensions)) ||
                (cols !== undefined && targetMajorCols < prev.gridCols && !checkItemsInBoundsUtil(prev.gridRows * prev.gridSubdivision, newTotalMinorCols, prev.designItems, getEffectiveDimensions))) {
                openAlertModal("Resize Error", "Cannot reduce dimensions. Items would be out of bounds.", "error");
                return prev;
            }
            return { ...prev, gridRows: targetMajorRows, gridCols: targetMajorCols };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal, getEffectiveDimensions, checkItemsInBoundsUtil]);

    const setGridSubdivision = useCallback((newSubdivisionValue) => {
        const newSubdivision = parseInt(newSubdivisionValue, 10);
        if (isNaN(newSubdivision) || newSubdivision < 1) { // Or check against AVAILABLE_SUBDIVISIONS
            openAlertModal("Invalid Subdivision", "Grid subdivision level is invalid.", "error"); return;
        }

        setLayoutSnapshotWithHistory(prev => {
            // For simplicity, changing subdivision clears items.
            // Converting item positions/sizes between subdivisions is complex.
            if (prev.designItems.length > 0) {
                openAlertModal("Layout Cleared", "Changing grid subdivision has cleared existing items. This is to ensure coordinate integrity.", "info");
            }
            return {
                ...prev,
                gridSubdivision: newSubdivision,
                designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS, // Clear items
            };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const clearFullLayout = useCallback(() => {
        // Reset to default grid dimensions and subdivision, and empty items
        resetHistory({
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            gridRows: DEFAULT_INITIAL_GRID_ROWS,
            gridCols: DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: DEFAULT_GRID_SUBDIVISION,
        });
        openAlertModal("Designer Cleared", "The layout designer canvas has been cleared and grid settings reset to default.", "info");
    }, [resetHistory, openAlertModal]);

    return {
        // State (from layoutSnapshot)
        designItems,
        gridRows, // Major grid rows
        gridCols, // Major grid cols
        gridSubdivision,

        // History actions
        undo, redo, canUndo, canRedo,
        resetLayoutHistory: resetHistory, // For external full reset control if needed

        // Mutators (actions that change the state)
        addItemToLayout,
        moveExistingItem,
        removeItemById,
        removeItemAtCoords,
        updateItemProperties, // Generic property updater
        setGridDimensions,    // For major grid rows/cols
        setGridSubdivision,
        clearFullLayout,

        // Validators & Utils (exposed for use by other components like DroppableGridCell)
        canPlaceItem,         // Operates on minor grid units
        getEffectiveDimensions, // Returns dimensions in minor cells, considering rotation
    };
};

export default useLayoutDesignerStateManagement;