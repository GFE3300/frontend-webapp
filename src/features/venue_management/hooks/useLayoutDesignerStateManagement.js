// features/venue_management/hooks/useLayoutDesignerStateManagement.js
import { useCallback, useEffect, useMemo } from 'react';
import useHistory from './useHistory';

// Constants
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    MIN_GRID_ROWS,
    MAX_GRID_ROWS,
    MIN_GRID_COLS,
    MAX_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION,
} from '../constants/layoutConstants';
import { ItemTypes, ITEM_CONFIGS } from '../constants/itemConfigs';

// Utilities
import {
    canPlaceItem as canPlaceItemUtil,
    checkItemsInBounds as checkItemsInBoundsUtil,
    getEffectiveDimensions as getEffectiveDimensionsUtil,
} from '../utils/layoutUtils';

const STABLE_EMPTY_ARRAY_DESIGN_ITEMS = Object.freeze([]);
// Smallest an item can be in minor cells (width or height).
// Could also be `prev.gridSubdivision` to enforce min 1 major cell equivalent.
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1;

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

    const generateNewItemFromTool = useCallback((
        toolPayloadFromDrag, targetMinorRow, targetMinorCol, currentSubdivision, existingDesignItems
    ) => {
        const placedItemType = toolPayloadFromDrag.createsPlacedItemType;
        const config = ITEM_CONFIGS[placedItemType];
        if (!config) {
            console.error(`[generateNewItemFromTool] CRITICAL: No config for ${placedItemType}`, toolPayloadFromDrag);
            openAlertModal("Configuration Error", `Missing config for ${placedItemType}.`, "error");
            return null;
        }
        if (typeof config.defaultPropsFactory !== 'function') {
            console.error(`[generateNewItemFromTool] CRITICAL: No factory for ${placedItemType}`, config);
            openAlertModal("Configuration Error", `Missing factory for ${placedItemType}.`, "error");
            return null;
        }
        const baseId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const base_w_minor = toolPayloadFromDrag.w_major * currentSubdivision;
        const base_h_minor = toolPayloadFromDrag.h_major * currentSubdivision;

        if (isNaN(base_w_minor) || base_w_minor < MIN_ITEM_DIMENSION_MINOR_CELLS || isNaN(base_h_minor) || base_h_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) {
            console.error(`[generateNewItemFromTool] Invalid base dimensions for ${placedItemType}. w_minor: ${base_w_minor}, h_minor: ${base_h_minor}. Tool:`, toolPayloadFromDrag, `Subdiv: ${currentSubdivision}`);
            openAlertModal("Dimension Error", `Invalid base dimensions for ${placedItemType}. Min dimension: ${MIN_ITEM_DIMENSION_MINOR_CELLS}.`, "error");
            return null;
        }
        let typeSpecificDefaults = {};
        try {
            typeSpecificDefaults = config.defaultPropsFactory(toolPayloadFromDrag, currentSubdivision, existingDesignItems);
        } catch (e) {
            console.error(`[generateNewItemFromTool] Error in factory for ${placedItemType}:`, e);
            openAlertModal("Factory Error", `Error creating props for ${placedItemType}.`, "error");
            return null;
        }
        return {
            id: baseId, itemType: placedItemType,
            gridPosition: { rowStart: targetMinorRow, colStart: targetMinorCol },
            w_minor: base_w_minor, h_minor: base_h_minor,
            rotation: 0, isFixed: false, layer: 1, isProvisional: true,
            ...typeSpecificDefaults,
        };
    }, [openAlertModal]);

    const parseAndPrepareInitialItems = useCallback((itemsToParse) => {
        if (!itemsToParse || itemsToParse.length === 0) return STABLE_EMPTY_ARRAY_DESIGN_ITEMS;
        return itemsToParse.map((originalItem, index) => {
            const item = { ...originalItem };
            item.id = item.id || `loaded_item_${Date.now()}_${index}`;
            item.itemType = item.itemType || ItemTypes.PLACED_DECOR;
            if (!ITEM_CONFIGS[item.itemType]) {
                console.warn(`[parseAndPrepareInitialItems] Item ${item.id} unknown type '${item.itemType}'. Defaulting.`);
                item.itemType = ItemTypes.PLACED_DECOR;
            }
            item.rotation = typeof item.rotation === 'number' ? item.rotation : 0;
            item.isFixed = typeof item.isFixed === 'boolean' ? item.isFixed : false;
            item.layer = typeof item.layer === 'number' ? item.layer : 1;
            item.isProvisional = typeof item.isProvisional === 'boolean' ? item.isProvisional : false;

            if (item.gridPosition) {
                item.gridPosition.rowStart = Math.max(1, parseInt(item.gridPosition.rowStart, 10) || 1);
                item.gridPosition.colStart = Math.max(1, parseInt(item.gridPosition.colStart, 10) || 1);
            } else {
                item.gridPosition = { rowStart: 1, colStart: 1 };
            }
            const subdivisionForCalc = item.gridSubdivision || initialGridSubdivision || DEFAULT_GRID_SUBDIVISION;
            if (typeof item.w_minor !== 'number' || item.w_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) {
                item.w_minor = (Number(item.w) * subdivisionForCalc) || (1 * subdivisionForCalc);
                if (isNaN(item.w_minor) || item.w_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) item.w_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, 1 * subdivisionForCalc);
            }
            if (typeof item.h_minor !== 'number' || item.h_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) {
                item.h_minor = (Number(item.h) * subdivisionForCalc) || (1 * subdivisionForCalc);
                if (isNaN(item.h_minor) || item.h_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) item.h_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, 1 * subdivisionForCalc);
            }
            delete item.w; delete item.h;
            if (typeof item.shape === 'undefined') {
                if (typeof item.size_identifier === 'string') item.shape = item.size_identifier;
                else if (typeof item.size === 'string') item.shape = item.size;
                else item.shape = ITEM_CONFIGS[item.itemType]?.defaultShape || 'default-shape';
            }
            delete item.size_identifier; delete item.size;
            if (item.itemType === ItemTypes.PLACED_TABLE) {
                if (typeof item.number === 'undefined' && typeof item.tableNumber === 'number') item.number = item.tableNumber;
                delete item.tableNumber;
                if (item.seats !== null && (typeof item.seats !== 'number' || isNaN(item.seats))) {
                    item.seats = parseInt(item.seats, 10);
                    if (isNaN(item.seats)) item.seats = null;
                }
            }
            return item;
        });
    }, [initialGridSubdivision]);

    const initialSnapshot = useMemo(() => ({
        designItems: parseAndPrepareInitialItems(initialDesignItems),
        gridRows: initialGridRows,
        gridCols: initialGridCols,
        gridSubdivision: initialGridSubdivision,
    }), [initialDesignItems, initialGridRows, initialGridCols, initialGridSubdivision, parseAndPrepareInitialItems]);

    const { state: layoutSnapshot, setState: setLayoutSnapshotWithHistory, undo, redo, canUndo, canRedo, resetHistory } = useHistory(initialSnapshot);
    const { designItems, gridRows, gridCols, gridSubdivision } = layoutSnapshot;

    useEffect(() => { /* console.log("[LayoutDesignerState] Snapshot:", layoutSnapshot); */ }, [layoutSnapshot]);

    useEffect(() => {
        const newParsedItems = parseAndPrepareInitialItems(initialLayoutConfig.initialDesignItems || STABLE_EMPTY_ARRAY_DESIGN_ITEMS);
        const newSnapshotForEffect = {
            designItems: newParsedItems,
            gridRows: initialLayoutConfig.initialGridRows || DEFAULT_INITIAL_GRID_ROWS,
            gridCols: initialLayoutConfig.initialGridCols || DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION,
        };
        if (JSON.stringify(newSnapshotForEffect) !== JSON.stringify(initialSnapshot)) {
            resetHistory(newSnapshotForEffect);
        }
    }, [initialLayoutConfig.initialDesignItems, initialLayoutConfig.initialGridRows, initialLayoutConfig.initialGridCols, initialLayoutConfig.initialGridSubdivision, resetHistory, parseAndPrepareInitialItems, initialSnapshot]);


    const getEffectiveDimensions = useCallback((item) => getEffectiveDimensionsUtil(item), []);

    const canPlaceItem = useCallback((targetMinorRow, targetMinorCol, itemEffW_minor, itemEffH_minor, itemToExcludeId = null) => {
        const totalMinorRows = gridRows * gridSubdivision;
        const totalMinorCols = gridCols * gridSubdivision;
        return canPlaceItemUtil(targetMinorRow, targetMinorCol, itemEffW_minor, itemEffH_minor, designItems, totalMinorRows, totalMinorCols, itemToExcludeId);
    }, [designItems, gridRows, gridCols, gridSubdivision]);

    const addItemToLayout = useCallback((toolPayloadFromDrag, minorTargetRow, minorTargetCol) => {
        const itemBaseW_minor = toolPayloadFromDrag.w_major * gridSubdivision;
        const itemBaseH_minor = toolPayloadFromDrag.h_major * gridSubdivision;
        if (isNaN(itemBaseW_minor) || itemBaseW_minor < MIN_ITEM_DIMENSION_MINOR_CELLS || isNaN(itemBaseH_minor) || itemBaseH_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) {
            openAlertModal("Placement Error", `Invalid dimensions for new item. Min dim: ${MIN_ITEM_DIMENSION_MINOR_CELLS}.`, "error"); return;
        }
        if (!canPlaceItem(minorTargetRow, minorTargetCol, itemBaseW_minor, itemBaseH_minor, null)) {
            openAlertModal("Placement Error", `Cannot place item: Space occupied or out of bounds.`, "error"); return;
        }
        setLayoutSnapshotWithHistory(prev => {
            const newItem = generateNewItemFromTool(toolPayloadFromDrag, minorTargetRow, minorTargetCol, prev.gridSubdivision, prev.designItems);
            return newItem ? { ...prev, designItems: [...prev.designItems, newItem] } : prev;
        });
    }, [canPlaceItem, gridSubdivision, setLayoutSnapshotWithHistory, openAlertModal, generateNewItemFromTool]);

    const moveExistingItem = useCallback((itemId, toMinorRow, toMinorCol) => {
        setLayoutSnapshotWithHistory(prev => {
            const itemToMove = prev.designItems.find(it => it.id === itemId);
            if (!itemToMove) return prev;
            const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(itemToMove);
            if (!canPlaceItem(toMinorRow, toMinorCol, effW_minor, effH_minor, itemId)) return prev;
            const updatedDesignItems = prev.designItems.map(it =>
                it.id === itemId ? { ...it, gridPosition: { rowStart: toMinorRow, colStart: toMinorCol } } : it
            );
            return { ...prev, designItems: updatedDesignItems };
        });
    }, [canPlaceItem, setLayoutSnapshotWithHistory, getEffectiveDimensions]);

    const removeItemById = useCallback((itemId) => {
        setLayoutSnapshotWithHistory(prev => ({ ...prev, designItems: prev.designItems.filter(it => it.id !== itemId) }));
    }, [setLayoutSnapshotWithHistory]);

    const removeItemAtCoords = useCallback((minorRowClicked, minorColClicked) => {
        setLayoutSnapshotWithHistory(prev => {
            let itemFoundToRemove = null;
            const newDesignItems = prev.designItems.filter(it => {
                if (itemFoundToRemove || !it || !it.gridPosition) return true;
                const { w: itemW_minor, h: itemH_minor } = getEffectiveDimensions(it);
                const { rowStart, colStart } = it.gridPosition;
                if (minorRowClicked >= rowStart && minorRowClicked < rowStart + itemH_minor &&
                    minorColClicked >= colStart && minorColClicked < colStart + itemW_minor) {
                    itemFoundToRemove = it; return false;
                }
                return true;
            });
            return itemFoundToRemove ? { ...prev, designItems: newDesignItems } : prev;
        });
    }, [setLayoutSnapshotWithHistory, getEffectiveDimensions]);

    const updateItemProperties = useCallback((itemId, newProps) => {
        let overallValidationPassed = true;

        setLayoutSnapshotWithHistory(prev => {
            const itemIndex = prev.designItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) { console.warn(`[updateItemProperties] Item ${itemId} not found.`); return prev; }

            const currentItem = prev.designItems[itemIndex];
            const itemConfig = ITEM_CONFIGS[currentItem.itemType];
            let accumulatedChanges = { ...newProps };

            // --- Stage 1: Handle explicit dimensional/positional changes (e.g., from resize handles) ---
            let pendingGridPosition = newProps.gridPosition ? { ...newProps.gridPosition } : { ...currentItem.gridPosition };
            let pendingWMinor = newProps.w_minor !== undefined ? parseInt(newProps.w_minor, 10) : currentItem.w_minor;
            let pendingHMinor = newProps.h_minor !== undefined ? parseInt(newProps.h_minor, 10) : currentItem.h_minor;
            const dimensionalOrPositionalChangeAttempted = newProps.gridPosition || newProps.w_minor !== undefined || newProps.h_minor !== undefined;

            if (dimensionalOrPositionalChangeAttempted) {
                if ((newProps.w_minor !== undefined && (isNaN(pendingWMinor) || pendingWMinor < MIN_ITEM_DIMENSION_MINOR_CELLS)) ||
                    (newProps.h_minor !== undefined && (isNaN(pendingHMinor) || pendingHMinor < MIN_ITEM_DIMENSION_MINOR_CELLS))) {
                    openAlertModal("Invalid Dimension", `Dimensions cannot be less than ${MIN_ITEM_DIMENSION_MINOR_CELLS} minor cell(s).`, "error");
                    if (newProps.w_minor !== undefined) delete accumulatedChanges.w_minor;
                    if (newProps.h_minor !== undefined) delete accumulatedChanges.h_minor;
                    overallValidationPassed = false;
                }

                pendingWMinor = accumulatedChanges.w_minor !== undefined ? accumulatedChanges.w_minor : currentItem.w_minor;
                pendingHMinor = accumulatedChanges.h_minor !== undefined ? accumulatedChanges.h_minor : currentItem.h_minor;

                if (overallValidationPassed) { // Only check placement if dimensions are valid so far
                    const itemForCheck = { ...currentItem, gridPosition: pendingGridPosition, w_minor: pendingWMinor, h_minor: pendingHMinor, rotation: accumulatedChanges.rotation !== undefined ? accumulatedChanges.rotation : currentItem.rotation };
                    const { w: effW_check, h: effH_check } = getEffectiveDimensionsUtil(itemForCheck);
                    if (!canPlaceItemUtil(pendingGridPosition.rowStart, pendingGridPosition.colStart, effW_check, effH_check, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                        openAlertModal("Placement Error", "Resized/moved item conflicts or is out of bounds.", "error");
                        if (newProps.gridPosition) delete accumulatedChanges.gridPosition;
                        if (newProps.w_minor !== undefined) delete accumulatedChanges.w_minor;
                        if (newProps.h_minor !== undefined) delete accumulatedChanges.h_minor;
                        overallValidationPassed = false;
                    }
                }
            }

            // --- Stage 2: Handle rotation ---
            if (newProps.rotation === true) { // `rotation: true` is a trigger
                delete accumulatedChanges.rotation; // consume the trigger
                if (itemConfig?.isRotatable) {
                    const currentRotationVal = accumulatedChanges.rotation !== undefined ? accumulatedChanges.rotation : currentItem.rotation || 0;
                    let newRotationValue = (currentRotationVal + 90) % 360;
                    // Add logic for itemConfig.allowedRotations / limitRotationTo180 if needed here

                    const posToUse = accumulatedChanges.gridPosition || currentItem.gridPosition;
                    const wToUse = accumulatedChanges.w_minor !== undefined ? accumulatedChanges.w_minor : currentItem.w_minor;
                    const hToUse = accumulatedChanges.h_minor !== undefined ? accumulatedChanges.h_minor : currentItem.h_minor;

                    const tempItemWithNewRotation = { ...currentItem, gridPosition: posToUse, w_minor: wToUse, h_minor: hToUse, rotation: newRotationValue };
                    const { w: effW_rot, h: effH_rot } = getEffectiveDimensionsUtil(tempItemWithNewRotation);

                    if (!canPlaceItemUtil(posToUse.rowStart, posToUse.colStart, effW_rot, effH_rot, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                        openAlertModal("Rotation Error", "Cannot rotate: new orientation conflicts or is out of bounds.", "error");
                        // Do not set overallValidationPassed to false, just don't apply rotation if it was the only change.
                        // If other changes were valid, they might still proceed.
                    } else {
                        accumulatedChanges.rotation = newRotationValue;
                    }
                }
            }


            // --- Stage 3: Handle semantic size changes (e.g., counter length from editor) ---
            if (currentItem.itemType === ItemTypes.PLACED_DECOR && currentItem.decorType?.startsWith('counter-') && newProps.length !== undefined) {
                const newLengthUnits = parseInt(String(newProps.length).trim(), 10);
                delete accumulatedChanges.length;

                if (isNaN(newLengthUnits) || newLengthUnits < 1) {
                    openAlertModal("Invalid Input", "Counter length must be a positive integer.", "error");
                } else {
                    const baseUnitMinor = 1 * prev.gridSubdivision; // One major cell equivalent
                    const rotationToUse = accumulatedChanges.rotation !== undefined ? accumulatedChanges.rotation : currentItem.rotation;
                    const isHorizontal = (rotationToUse === 0 || rotationToUse === 180);

                    let new_semantic_w_minor, new_semantic_h_minor;
                    if (isHorizontal) {
                        new_semantic_w_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, newLengthUnits * baseUnitMinor);
                        new_semantic_h_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, baseUnitMinor); // Depth is 1 major unit
                    } else { // Vertical
                        new_semantic_h_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, newLengthUnits * baseUnitMinor);
                        new_semantic_w_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, baseUnitMinor); // Depth is 1 major unit
                    }

                    const posToCheck = accumulatedChanges.gridPosition || currentItem.gridPosition;
                    const itemForCheck = { ...currentItem, ...accumulatedChanges, gridPosition: posToCheck, w_minor: new_semantic_w_minor, h_minor: new_semantic_h_minor, rotation: rotationToUse };
                    const { w: effW_check, h: effH_check } = getEffectiveDimensionsUtil(itemForCheck);

                    if (!canPlaceItemUtil(posToCheck.rowStart, posToCheck.colStart, effW_check, effH_check, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                        openAlertModal("Resize Error", "Cannot change counter length: New size conflicts or is out of bounds.", "error");
                        overallValidationPassed = false; // This change makes the whole op invalid if it fails
                    } else {
                        accumulatedChanges.w_minor = new_semantic_w_minor;
                        accumulatedChanges.h_minor = new_semantic_h_minor;
                        accumulatedChanges.length_units = newLengthUnits;
                    }
                }
            }

            // --- Stage 4: If dimensions changed (e.g. via resize handles), update counter length_units ---
            // This runs if w_minor/h_minor changed directly AND it wasn't editor-driven length change
            if (overallValidationPassed && currentItem.itemType === ItemTypes.PLACED_DECOR && currentItem.decorType?.startsWith('counter-') &&
                (newProps.w_minor !== undefined || newProps.h_minor !== undefined) && newProps.length === undefined) {
                const finalWMinor = accumulatedChanges.w_minor !== undefined ? accumulatedChanges.w_minor : currentItem.w_minor;
                const finalHMinor = accumulatedChanges.h_minor !== undefined ? accumulatedChanges.h_minor : currentItem.h_minor;
                const rotationToUse = accumulatedChanges.rotation !== undefined ? accumulatedChanges.rotation : currentItem.rotation;
                const baseUnitMinor = 1 * prev.gridSubdivision;
                const isHorizontal = (rotationToUse === 0 || rotationToUse === 180);
                const lengthDimensionMinor = isHorizontal ? finalWMinor : finalHMinor;

                if (typeof lengthDimensionMinor === 'number' && lengthDimensionMinor >= baseUnitMinor && baseUnitMinor > 0) {
                    accumulatedChanges.length_units = Math.max(1, Math.round(lengthDimensionMinor / baseUnitMinor));
                } else { // Should be caught by MIN_ITEM_DIMENSION_MINOR_CELLS check earlier, but as a safeguard
                    accumulatedChanges.length_units = 1;
                }
            }

            // --- Stage 5: Other property validations (table number, seats) ---
            if (currentItem.itemType === ItemTypes.PLACED_TABLE) {
                if (newProps.number !== undefined) {
                    const newNumStr = String(newProps.number).trim();
                    if (newNumStr === "") { accumulatedChanges.number = null; accumulatedChanges.isProvisional = true; } // No number, so provisional
                    else {
                        const newNum = parseInt(newNumStr, 10);
                        if (isNaN(newNum) || newNum <= 0) {
                            openAlertModal("Invalid Input", "Table number must be a positive integer or empty.", "error");
                            delete accumulatedChanges.number; if (accumulatedChanges.isProvisional === false) delete accumulatedChanges.isProvisional; // Revert if changed
                            overallValidationPassed = false;
                        } else if (prev.designItems.some(it => it.id !== itemId && it.itemType === ItemTypes.PLACED_TABLE && it.number === newNum)) {
                            openAlertModal("Duplicate Number", `Table number ${newNum} is already in use.`, "warning");
                            delete accumulatedChanges.number; if (accumulatedChanges.isProvisional === false) delete accumulatedChanges.isProvisional; // Revert
                            overallValidationPassed = false;
                        } else { // Valid, unique positive number
                            accumulatedChanges.number = newNum; // Ensure it's stored as number
                            accumulatedChanges.isProvisional = false; // Valid number, so not provisional
                        }
                    }
                }
                if (newProps.seats !== undefined) {
                    const newSeatsStr = String(newProps.seats).trim();
                    if (newSeatsStr === "") { accumulatedChanges.seats = null; }
                    else {
                        const newSeatsNum = parseInt(newSeatsStr, 10);
                        if (isNaN(newSeatsNum) || newSeatsNum < 0) {
                            openAlertModal("Invalid Input", "Seats must be a non-negative integer or empty.", "error");
                            delete accumulatedChanges.seats;
                            overallValidationPassed = false;
                        } else {
                            accumulatedChanges.seats = newSeatsNum;
                        }
                    }
                }
            }

            // --- Final Step: Apply if overall validation passed ---
            if (!overallValidationPassed) { // If any critical validation failed, revert all proposed changes for this call.
                console.warn("[updateItemProperties] Overall validation failed. No changes applied for this operation.", newProps);
                return prev;
            }
            if (Object.keys(accumulatedChanges).length === 0) return prev; // No actual changes to apply

            const updatedItem = { ...currentItem, ...accumulatedChanges };
            const newDesignItems = [...prev.designItems];
            newDesignItems[itemIndex] = updatedItem;
            return { ...prev, designItems: newDesignItems };
        });
        return overallValidationPassed;
    }, [setLayoutSnapshotWithHistory, openAlertModal, getEffectiveDimensionsUtil, canPlaceItemUtil]);

    const setGridDimensions = useCallback(({ rows, cols }) => {
        setLayoutSnapshotWithHistory(prev => {
            const targetMajorRows = rows !== undefined ? parseInt(rows, 10) : prev.gridRows;
            const targetMajorCols = cols !== undefined ? parseInt(cols, 10) : prev.gridCols;
            if ((rows !== undefined && (isNaN(targetMajorRows) || targetMajorRows < MIN_GRID_ROWS || targetMajorRows > MAX_GRID_ROWS)) ||
                (cols !== undefined && (isNaN(targetMajorCols) || targetMajorCols < MIN_GRID_COLS || targetMajorCols > MAX_GRID_COLS))) {
                openAlertModal("Invalid Dimension", `Grid dimensions out of range.`, "warning"); return prev;
            }
            const newTotalMinorRows = targetMajorRows * prev.gridSubdivision;
            const newTotalMinorCols = targetMajorCols * prev.gridSubdivision;
            if (((rows !== undefined && targetMajorRows < prev.gridRows) || (cols !== undefined && targetMajorCols < prev.gridCols)) &&
                !checkItemsInBoundsUtil(newTotalMinorRows, newTotalMinorCols, prev.designItems)) {
                openAlertModal("Resize Error", "Cannot reduce dimensions. Items out of bounds.", "error"); return prev;
            }
            return { ...prev, gridRows: targetMajorRows, gridCols: targetMajorCols };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal, checkItemsInBoundsUtil]);

    const setGridSubdivision = useCallback((newSubdivisionValue) => {
        const newSubdivision = parseInt(newSubdivisionValue, 10);
        if (isNaN(newSubdivision) || newSubdivision < 1) {
            openAlertModal("Invalid Subdivision", "Grid subdivision level is invalid.", "error"); return;
        }
        setLayoutSnapshotWithHistory(prev => {
            if (prev.designItems.length > 0) {
                openAlertModal("Layout Cleared", "Changing grid subdivision has cleared existing items.", "info");
            }
            return { ...prev, gridSubdivision: newSubdivision, designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const clearFullLayout = useCallback(() => {
        resetHistory({
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            gridRows: DEFAULT_INITIAL_GRID_ROWS,
            gridCols: DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: DEFAULT_GRID_SUBDIVISION,
        });
        openAlertModal("Designer Cleared", "Layout cleared and grid reset to default.", "info");
    }, [resetHistory, openAlertModal]);


    return {
        designItems, gridRows, gridCols, gridSubdivision,
        undo, redo, canUndo, canRedo,
        resetLayoutHistory: resetHistory,
        addItemToLayout,
        moveExistingItem,
        removeItemById,
        removeItemAtCoords,
        updateItemProperties,
        setGridDimensions,
        setGridSubdivision,
        clearFullLayout,
        canPlaceItem,
        getEffectiveDimensions,
    };
};

export default useLayoutDesignerStateManagement;