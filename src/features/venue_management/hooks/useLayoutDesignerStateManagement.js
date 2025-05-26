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
} from '../constants/layoutConstants';

// Item specific configurations and types
import { ItemTypes, ITEM_CONFIGS } from '../constants/itemConfigs';

// Utilities
import {
    canPlaceItem as canPlaceItemUtil,
    checkItemsInBounds as checkItemsInBoundsUtil,
    getEffectiveDimensions as getEffectiveDimensionsUtil,
    getNextAvailableTableNumber, // Assuming this is specifically for tables for now
} from '../utils/layoutUtils';

const STABLE_EMPTY_ARRAY_DESIGN_ITEMS = Object.freeze([]);

const useLayoutDesignerStateManagement = (
    initialLayoutConfig = {},
    openAlertModal = (title, message, type) => console.warn(`Alert Modal not provided: ${type} - ${title}: ${message}`)
) => {
    const {
        initialDesignItems = STABLE_EMPTY_ARRAY_DESIGN_ITEMS, // Expecting an array of generic design items
        initialGridRows = DEFAULT_INITIAL_GRID_ROWS,
        initialGridCols = DEFAULT_INITIAL_GRID_COLS,
        initialGridSubdivision = DEFAULT_GRID_SUBDIVISION,
    } = initialLayoutConfig;


    const generateDefaultItemProps = useCallback((
        existingDesignItems,
        toolPayloadFromDrag, // { toolItemType, createsPlacedItemType, w_major, h_major, size_identifier }
        targetMinorRow,
        targetMinorCol,
        currentSubdivision
    ) => {
        const placedItemType = toolPayloadFromDrag.createsPlacedItemType;
        const config = ITEM_CONFIGS[placedItemType];

        if (!config) {
            console.error(`[generateDefaultItemProps] No config found for placedItemType: ${placedItemType}`);
            openAlertModal("Error", `Configuration missing for item type: ${placedItemType}. Cannot add item.`, "error");
            return null;
        }

        const baseId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        // Tool's w_major/h_major define span in MAJOR grid cells. Convert to MINOR cell span.
        const w_minor = toolPayloadFromDrag.w_major * currentSubdivision;
        const h_minor = toolPayloadFromDrag.h_major * currentSubdivision;

        let typeSpecificDefaults = {};
        if (config.defaultPropsFactory) {
            // Pass relevant parts of toolPayload and context to the factory
            const factoryPayload = {
                size_identifier: toolPayloadFromDrag.size_identifier, // e.g., 'square', 'wall-segment'
                // Pass other tool-specific data from toolPayloadFromDrag if needed by factories
            };
            typeSpecificDefaults = config.defaultPropsFactory(factoryPayload, currentSubdivision, existingDesignItems);
        }

        // Ensure table number is assigned if it's a table and defaultPropsFactory didn't set it
        if (placedItemType === ItemTypes.PLACED_TABLE && typeSpecificDefaults.tableNumber === undefined) {
            typeSpecificDefaults.tableNumber = getNextAvailableTableNumber(
                existingDesignItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE)
            );
        }

        return {
            id: baseId,
            itemType: placedItemType,
            gridPosition: { rowStart: targetMinorRow, colStart: targetMinorCol }, // MINOR coords
            w_minor: w_minor, // Base width in MINOR cells (pre-rotation)
            h_minor: h_minor, // Base height in MINOR cells (pre-rotation)
            rotation: 0,      // Default rotation
            isFixed: false,   // Default common property
            layer: 1,         // Default common property
            ...typeSpecificDefaults, // Apply/override with type-specific defaults
        };
    }, [openAlertModal]); // getNextAvailableTableNumber is pure, ITEM_CONFIGS is stable


    // Parses items (e.g., from storage). For now, assumes they are mostly in the correct new format.
    // More robust parsing would handle missing fields or old formats using ITEM_CONFIGS.
    const parseAndPrepareInitialItems = useCallback((itemsToParse, currentSubdivision) => {
        if (!itemsToParse || itemsToParse.length === 0) return STABLE_EMPTY_ARRAY_DESIGN_ITEMS;

        // Basic pass-through for now. Future: use ITEM_CONFIGS to validate/migrate old data.
        // This current version assumes saved items already have w_minor, h_minor, and gridPosition in minor units
        // relative to their *saved* subdivision. If the currentSubdivision on load is different,
        // a more complex conversion would be needed. For now, we assume they match or are compatible.
        return itemsToParse.map(item => ({
            rotation: 0, // Ensure default rotation if not present
            isFixed: false,
            layer: 1,
            ...item, // Spread existing item props
            // If item was saved with w_major/h_major and saved_subdivision, convert here:
            // w_minor: item.w_major * currentSubdivision, (if item had w_major)
            // h_minor: item.h_major * currentSubdivision, (if item had h_major)
        }));
    }, []);


    const initialSnapshot = useMemo(() => ({
        designItems: parseAndPrepareInitialItems(initialDesignItems, initialGridSubdivision),
        gridRows: initialGridRows, // Major grid rows
        gridCols: initialGridCols, // Major grid cols
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

    useEffect(() => {
        // This effect re-initializes the entire designer state if the top-level 'currentLayout' prop changes.
        const newParsedItems = parseAndPrepareInitialItems(
            initialLayoutConfig.initialDesignItems || STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION
        );
        const newSnapshot = {
            designItems: newParsedItems,
            gridRows: initialLayoutConfig.initialGridRows || DEFAULT_INITIAL_GRID_ROWS,
            gridCols: initialLayoutConfig.initialGridCols || DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION,
        };
        resetHistory(newSnapshot);
    }, [
        initialLayoutConfig.initialDesignItems,
        initialLayoutConfig.initialGridRows,
        initialLayoutConfig.initialGridCols,
        initialLayoutConfig.initialGridSubdivision,
        resetHistory,
        parseAndPrepareInitialItems
    ]);

    const getEffectiveDimensions = useCallback((item) => {
        // item.w_minor and item.h_minor are base dimensions in minor cells
        return getEffectiveDimensionsUtil(item); // Util handles rotation
    }, []);

    const canPlaceItem = useCallback((minorRow, minorCol, itemW_minor, itemH_minor, itemToExcludeId = null) => {
        const totalMinorRows = gridRows * gridSubdivision;
        const totalMinorCols = gridCols * gridSubdivision;
        return canPlaceItemUtil(
            minorRow, minorCol,
            itemW_minor, itemH_minor,
            designItems, // Use generic designItems
            totalMinorRows, totalMinorCols,
            itemToExcludeId,
            getEffectiveDimensions // Pass the memoized version from this hook
        );
    }, [designItems, gridRows, gridCols, gridSubdivision, getEffectiveDimensions]);

    const addItemToLayout = useCallback((
        toolPayloadFromDrag, // { toolItemType, createsPlacedItemType, w_major, h_major, size_identifier }
        minorTargetRow,
        minorTargetCol
    ) => {
        // Calculate item dimensions in minor cells based on tool's major cell span and current subdivision
        const itemW_minor = toolPayloadFromDrag.w_major * gridSubdivision;
        const itemH_minor = toolPayloadFromDrag.h_major * gridSubdivision;

        if (!canPlaceItem(minorTargetRow, minorTargetCol, itemW_minor, itemH_minor, null)) {
            openAlertModal("Placement Error", `Cannot place item: space occupied or out of bounds.`, "error");
            return;
        }

        setLayoutSnapshotWithHistory(prev => {
            const newItem = generateDefaultItemProps(
                prev.designItems,
                toolPayloadFromDrag,
                minorTargetRow,
                minorTargetCol,
                prev.gridSubdivision // Use subdivision from prev state for consistency during update
            );
            if (newItem) {
                return { ...prev, designItems: [...prev.designItems, newItem] };
            }
            return prev; // If newItem is null due to config error
        });
    }, [canPlaceItem, gridSubdivision, setLayoutSnapshotWithHistory, openAlertModal, generateDefaultItemProps]);

    const moveExistingItem = useCallback((itemId, toMinorRow, toMinorCol) => {
        setLayoutSnapshotWithHistory(prev => {
            const itemToMove = prev.designItems.find(it => it.id === itemId);
            if (!itemToMove) return prev;

            const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(itemToMove);

            if (!canPlaceItem(toMinorRow, toMinorCol, effW_minor, effH_minor, itemId)) {
                return prev; // Invalid move
            }
            return {
                ...prev,
                designItems: prev.designItems.map(it =>
                    it.id === itemId ? { ...it, gridPosition: { rowStart: toMinorRow, colStart: toMinorCol } } : it
                ),
            };
        });
    }, [canPlaceItem, setLayoutSnapshotWithHistory, getEffectiveDimensions]);

    const removeItemById = useCallback((itemId) => {
        setLayoutSnapshotWithHistory(prev => ({
            ...prev,
            designItems: prev.designItems.filter(it => it.id !== itemId),
        }));
    }, [setLayoutSnapshotWithHistory]);

    const removeItemAtCoords = useCallback((minorRowClicked, minorColClicked) => {
        setLayoutSnapshotWithHistory(prev => {
            const itemToRemove = prev.designItems.find(it => {
                if (!it || !it.gridPosition) return false;
                const { w: itemW_minor, h: itemH_minor } = getEffectiveDimensions(it);
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
        let validationPassed = true;
        setLayoutSnapshotWithHistory(prev => {
            const itemIndex = prev.designItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) return prev;

            const currentItem = prev.designItems[itemIndex];
            const itemConfig = ITEM_CONFIGS[currentItem.itemType];
            let accumulatedChanges = { ...newProps }; // Start with newProps

            // Handle Table Number Uniqueness (if applicable for this itemType and newProps)
            if (currentItem.itemType === ItemTypes.PLACED_TABLE && newProps.tableNumber !== undefined) {
                const newNum = parseInt(newProps.tableNumber, 10);
                if (isNaN(newNum) || newNum <= 0) {
                    openAlertModal("Invalid Input", "Table number must be a positive integer.", "error");
                    validationPassed = false;
                } else if (prev.designItems.some(it => it.id !== itemId && it.itemType === ItemTypes.PLACED_TABLE && it.number === newNum)) {
                    openAlertModal("Duplicate Number", `Table number ${newNum} is already in use.`, "warning");
                    validationPassed = false;
                }
                // If validation fails, don't include tableNumber in accumulatedChanges or revert it
                if (!validationPassed) delete accumulatedChanges.tableNumber;
            }
            // Handle Seats (if applicable)
            if (currentItem.itemType === ItemTypes.PLACED_TABLE && newProps.seats !== undefined) {
                const newSeatsNum = parseInt(newProps.seats, 10);
                if (isNaN(newSeatsNum) || newSeatsNum < 0) {
                    openAlertModal("Invalid Input", "Number of seats must be a non-negative integer.", "error");
                    validationPassed = false; delete accumulatedChanges.seats;
                }
            }

            // Handle Rotation (if applicable and requested)
            if (newProps.rotation === true && itemConfig?.isRotatable) { // rotation prop is a trigger
                const newRotationValue = currentItem.rotation === 0 ? 90 : 0; // Simple toggle for now
                const tempItemWithNewRotation = { ...currentItem, ...accumulatedChanges, rotation: newRotationValue };
                const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(tempItemWithNewRotation);

                const totalMinorRows = prev.gridRows * prev.gridSubdivision;
                const totalMinorCols = prev.gridCols * prev.gridSubdivision;

                if (!canPlaceItemUtil(
                    currentItem.gridPosition.rowStart, currentItem.gridPosition.colStart,
                    effW_minor, effH_minor,
                    prev.designItems, totalMinorRows, totalMinorCols, itemId, getEffectiveDimensions
                )) {
                    openAlertModal("Rotation Error", "Cannot rotate: new orientation conflicts or out of bounds.", "error");
                    validationPassed = false; // Keep original rotation
                } else {
                    accumulatedChanges.rotation = newRotationValue; // Apply new rotation
                }
            } else if (newProps.rotation === true && !itemConfig?.isRotatable) {
                // Rotation requested for non-rotatable item, remove trigger
                delete accumulatedChanges.rotation;
            }


            if (!validationPassed && Object.keys(newProps).length === 1 && (newProps.tableNumber !== undefined || newProps.seats !== undefined)) return prev; // Only one prop failed, revert
            if (Object.keys(accumulatedChanges).length === 0) return prev; // No valid changes to apply

            const updatedItem = { ...currentItem, ...accumulatedChanges };
            const newDesignItems = [...prev.designItems];
            newDesignItems[itemIndex] = updatedItem;
            return { ...prev, designItems: newDesignItems };
        });
        return validationPassed;
    }, [setLayoutSnapshotWithHistory, openAlertModal, getEffectiveDimensions]);


    const setGridDimensions = useCallback(({ rows, cols }) => { // These are MAJOR rows/cols
        setLayoutSnapshotWithHistory(prev => {
            const targetMajorRows = rows !== undefined ? parseInt(rows, 10) : prev.gridRows;
            const targetMajorCols = cols !== undefined ? parseInt(cols, 10) : prev.gridCols;

            if ((rows !== undefined && (isNaN(targetMajorRows) || targetMajorRows < MIN_GRID_ROWS || targetMajorRows > MAX_GRID_ROWS)) ||
                (cols !== undefined && (isNaN(targetMajorCols) || targetMajorCols < MIN_GRID_COLS || targetMajorCols > MAX_GRID_COLS))) {
                openAlertModal("Invalid Dimension", `Major grid dimensions out of range (${MIN_GRID_ROWS}-${MAX_GRID_ROWS}R, ${MIN_GRID_COLS}-${MAX_GRID_COLS}C).`, "warning");
                return prev;
            }

            const newTotalMinorRows = targetMajorRows * prev.gridSubdivision;
            const newTotalMinorCols = targetMajorCols * prev.gridSubdivision;

            if ((rows !== undefined && targetMajorRows < prev.gridRows && !checkItemsInBoundsUtil(newTotalMinorRows, prev.gridCols * prev.gridSubdivision, prev.designItems, getEffectiveDimensions)) ||
                (cols !== undefined && targetMajorCols < prev.gridCols && !checkItemsInBoundsUtil(prev.gridRows * prev.gridSubdivision, newTotalMinorCols, prev.designItems, getEffectiveDimensions))) {
                openAlertModal("Resize Error", "Cannot reduce dimensions. Items would be out of bounds.", "error");
                return prev;
            }
            return { ...prev, gridRows: targetMajorRows, gridCols: targetMajorCols };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal, getEffectiveDimensions]);

    const setGridSubdivision = useCallback((newSubdivisionValue) => {
        const newSubdivision = parseInt(newSubdivisionValue, 10);
        if (isNaN(newSubdivision) || newSubdivision < 1) {
            openAlertModal("Invalid Subdivision", "Grid subdivision level is invalid.", "error"); return;
        }

        setLayoutSnapshotWithHistory(prev => {
            if (prev.designItems.length > 0) {
                openAlertModal("Layout Cleared", "Changing grid subdivision has cleared existing items for simplicity. Future versions might support conversion.", "info");
            }
            return {
                ...prev,
                gridSubdivision: newSubdivision,
                designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS, // Clear items
            };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const clearFullLayout = useCallback(() => {
        resetHistory({
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            gridRows: DEFAULT_INITIAL_GRID_ROWS,
            gridCols: DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: DEFAULT_GRID_SUBDIVISION,
        });
        openAlertModal("Cleared", "Designer canvas has been cleared and grid reset.", "info");
    }, [resetHistory, openAlertModal]);

    return {
        // State
        designItems,
        gridRows, // Major grid rows
        gridCols, // Major grid cols
        gridSubdivision,

        // History
        undo, redo, canUndo, canRedo,
        resetLayoutHistory: resetHistory,

        // Mutators
        addItemToLayout,
        moveExistingItem,
        removeItemById,
        removeItemAtCoords,
        updateItemProperties, // Generic updater
        setGridDimensions,    // For major grid
        setGridSubdivision,
        clearFullLayout,

        // Validators/Utils
        canPlaceItem, // Operates on minor grid
        getEffectiveDimensions, // Returns dimensions in minor cells
    };
};

export default useLayoutDesignerStateManagement;