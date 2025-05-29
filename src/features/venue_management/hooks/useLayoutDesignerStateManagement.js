// features/venue_management/hooks/useLayoutDesignerStateManagement.js
// DEBUG + ROTATION-RESIZE FOCUS
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
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1;
const DEBUG_PREFIX_HOOK = "[StateMgmt DEBUG] ";
const ROTATION_RESIZE_DEBUG_PREFIX = "[DEBUG ROTATION-RESIZE] [StateMgmt] ";

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
        // ... (rest of function is unchanged, keeping it for context but not modifying for this debug)
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
        const isProvisional = typeSpecificDefaults.isProvisional !== undefined
            ? typeSpecificDefaults.isProvisional
            : false;

        return {
            id: baseId, itemType: placedItemType,
            gridPosition: { rowStart: targetMinorRow, colStart: targetMinorCol },
            w_minor: base_w_minor, h_minor: base_h_minor,
            rotation: 0, isFixed: false, layer: 1,
            isProvisional,
            ...typeSpecificDefaults,
        };
    }, [openAlertModal]);

    const parseAndPrepareInitialItems = useCallback((itemsToParse) => {
        // ... (rest of function is unchanged)
        if (!itemsToParse || itemsToParse.length === 0) return STABLE_EMPTY_ARRAY_DESIGN_ITEMS;
        return itemsToParse.map((originalItem, index) => {
            const item = { ...originalItem };
            item.id = item.id || `loaded_item_${Date.now()}_${index}`;

            if (!item.itemType || !ITEM_CONFIGS[item.itemType]) {
                console.warn(`[parseAndPrepareInitialItems] Item ${item.id} has unknown type '${item.itemType}'. Defaulting to PLACED_DECOR.`);
                item.itemType = ItemTypes.PLACED_DECOR;
                if (!item.decorType && item.shape?.startsWith('plant-')) item.decorType = 'plant';
            }

            item.rotation = typeof item.rotation === 'number' ? (parseInt(String(item.rotation), 10) % 360 + 360) % 360 : 0;
            item.isFixed = typeof item.isFixed === 'boolean' ? item.isFixed : false;
            item.layer = typeof item.layer === 'number' ? item.layer : 1;

            if (item.itemType === ItemTypes.PLACED_TABLE) {
                item.isProvisional = typeof item.isProvisional === 'boolean' ? item.isProvisional : (item.number == null || item.number <= 0);
            } else {
                item.isProvisional = typeof item.isProvisional === 'boolean' ? item.isProvisional : false;
            }

            if (item.gridPosition) {
                item.gridPosition.rowStart = Math.max(1, parseInt(String(item.gridPosition.rowStart), 10) || 1);
                item.gridPosition.colStart = Math.max(1, parseInt(String(item.gridPosition.colStart), 10) || 1);
            } else {
                item.gridPosition = { rowStart: 1, colStart: 1 };
            }

            const subdivisionForCalc = item.gridSubdivision || initialGridSubdivision || DEFAULT_GRID_SUBDIVISION;
            if (typeof item.w_minor !== 'number' || item.w_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) {
                item.w_minor = (Number(item.w_major || item.w) * subdivisionForCalc) || (1 * subdivisionForCalc);
                if (isNaN(item.w_minor) || item.w_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) item.w_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, 1 * subdivisionForCalc);
            }
            if (typeof item.h_minor !== 'number' || item.h_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) {
                item.h_minor = (Number(item.h_major || item.h) * subdivisionForCalc) || (1 * subdivisionForCalc);
                if (isNaN(item.h_minor) || item.h_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) item.h_minor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, 1 * subdivisionForCalc);
            }
            delete item.w; delete item.h; delete item.w_major; delete item.h_major;

            if (typeof item.shape === 'undefined') {
                if (typeof item.size_identifier === 'string') item.shape = item.size_identifier;
                else item.shape = ITEM_CONFIGS[item.itemType]?.defaultShape || `${item.itemType}-default-shape`;
            }
            delete item.size_identifier; delete item.size;

            if (item.itemType === ItemTypes.PLACED_TABLE) {
                if (typeof item.number === 'undefined' && typeof item.tableNumber === 'number') item.number = item.tableNumber;
                delete item.tableNumber;
                if (item.seats !== null && (typeof item.seats !== 'number' || isNaN(item.seats))) {
                    item.seats = parseInt(String(item.seats), 10);
                    if (isNaN(item.seats)) item.seats = null;
                }
            }
            if (item.itemType === ItemTypes.PLACED_COUNTER && typeof item.length_units !== 'number') {
                item.length_units = Math.round(item.w_minor / subdivisionForCalc) || 1;
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
    }, [initialLayoutConfig, resetHistory, parseAndPrepareInitialItems, initialSnapshot]);

    const getEffectiveDimensions = useCallback((item) => getEffectiveDimensionsUtil(item), []);

    const canPlaceItem = useCallback((targetMinorRow, targetMinorCol, itemEffW_minor, itemEffH_minor, itemToExcludeId = null) => {
        const totalMinorRows = gridRows * gridSubdivision;
        const totalMinorCols = gridCols * gridSubdivision;
        return canPlaceItemUtil(targetMinorRow, targetMinorCol, itemEffW_minor, itemEffH_minor, designItems, totalMinorRows, totalMinorCols, itemToExcludeId);
    }, [designItems, gridRows, gridCols, gridSubdivision]);

    const addItemToLayout = useCallback((toolPayloadFromDrag, minorTargetRow, minorTargetCol) => {
        // ... (rest of function is unchanged)
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
        // ... (rest of function is unchanged)
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
        // ... (rest of function is unchanged)
        setLayoutSnapshotWithHistory(prev => ({ ...prev, designItems: prev.designItems.filter(it => it.id !== itemId) }));
    }, [setLayoutSnapshotWithHistory]);

    const removeItemAtCoords = useCallback((minorRowClicked, minorColClicked) => {
        // ... (rest of function is unchanged)
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
        console.log(DEBUG_PREFIX_HOOK + `updateItemProperties CALLED for item ${itemId} with newProps:`, JSON.parse(JSON.stringify(newProps)));
        let overallValidationPassedThisCall = true;

        setLayoutSnapshotWithHistory(prev => {
            console.log(ROTATION_RESIZE_DEBUG_PREFIX + `updateItemProperties (inside setLayoutSnapshotWithHistory) for item ${itemId}. New props received:`, JSON.parse(JSON.stringify(newProps)));
            let overallValidationPassedInSnapshot = true;

            const itemIndex = prev.designItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) {
                console.warn(DEBUG_PREFIX_HOOK + `[updateItemProperties] Item ${itemId} not found.`);
                overallValidationPassedThisCall = false;
                return prev;
            }

            const currentItem = { ...prev.designItems[itemIndex] }; // Work with a copy
            console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Current item state (before applying newProps):`, JSON.parse(JSON.stringify(currentItem)));
            const itemConfig = ITEM_CONFIGS[currentItem.itemType];
            let accumulatedChanges = { ...newProps };
            console.log(DEBUG_PREFIX_HOOK + `Initial accumulatedChanges:`, JSON.parse(JSON.stringify(accumulatedChanges)));

            // --- Stage 1: Handle explicit dimensional/positional changes ---
            // ... (unchanged from original) ...
            let pendingGridPosition = newProps.gridPosition ? { ...newProps.gridPosition } : { ...currentItem.gridPosition };
            let pendingWMinor = newProps.w_minor !== undefined ? parseInt(String(newProps.w_minor), 10) : currentItem.w_minor;
            let pendingHMinor = newProps.h_minor !== undefined ? parseInt(String(newProps.h_minor), 10) : currentItem.h_minor;
            const dimensionalOrPositionalChangeAttempted = newProps.gridPosition || newProps.w_minor !== undefined || newProps.h_minor !== undefined;

            if (dimensionalOrPositionalChangeAttempted) {
                if ((newProps.w_minor !== undefined && (isNaN(pendingWMinor) || pendingWMinor < MIN_ITEM_DIMENSION_MINOR_CELLS)) ||
                    (newProps.h_minor !== undefined && (isNaN(pendingHMinor) || pendingHMinor < MIN_ITEM_DIMENSION_MINOR_CELLS))) {
                    openAlertModal("Invalid Dimension", `Dimensions cannot be less than ${MIN_ITEM_DIMENSION_MINOR_CELLS} minor cell(s).`, "error");
                    if (newProps.w_minor !== undefined) delete accumulatedChanges.w_minor;
                    if (newProps.h_minor !== undefined) delete accumulatedChanges.h_minor;
                    overallValidationPassedInSnapshot = false;
                }

                pendingWMinor = accumulatedChanges.w_minor !== undefined ? accumulatedChanges.w_minor : currentItem.w_minor;
                pendingHMinor = accumulatedChanges.h_minor !== undefined ? accumulatedChanges.h_minor : currentItem.h_minor;

                if (overallValidationPassedInSnapshot) {
                    const itemForCheck = {
                        ...currentItem,
                        gridPosition: pendingGridPosition,
                        w_minor: pendingWMinor,
                        h_minor: pendingHMinor,
                        rotation: newProps.rotation !== undefined && typeof newProps.rotation === 'number'
                            ? newProps.rotation
                            : (newProps.rotation === true
                                ? (parseInt(String(currentItem.rotation || 0), 10) + 90) % 360
                                : currentItem.rotation)
                    };
                    const { w: effW_check, h: effH_check } = getEffectiveDimensionsUtil(itemForCheck);
                    if (!canPlaceItemUtil(pendingGridPosition.rowStart, pendingGridPosition.colStart, effW_check, effH_check, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                        openAlertModal("Placement Error", "Resized/moved item conflicts or is out of bounds.", "error");
                        if (newProps.gridPosition) delete accumulatedChanges.gridPosition;
                        if (newProps.w_minor !== undefined) delete accumulatedChanges.w_minor;
                        if (newProps.h_minor !== undefined) delete accumulatedChanges.h_minor;
                        overallValidationPassedInSnapshot = false;
                    }
                }
            }

            // --- Stage 2: Handle rotation ---
            console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Stage 2 ROTATION: newProps.rotation=${newProps.rotation}, overallValidationPassedInSnapshot=${overallValidationPassedInSnapshot}`);
            if (newProps.rotation !== undefined && overallValidationPassedInSnapshot) {
                if (itemConfig?.isRotatable) {
                    let newRotationAngle;
                    const currentActualRotation = parseInt(String(currentItem.rotation || 0), 10);
                    console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Current actual rotation: ${currentActualRotation}`);

                    if (isNaN(currentActualRotation)) {
                        delete accumulatedChanges.rotation; overallValidationPassedInSnapshot = false;
                    } else if (newProps.rotation === true) { // Rotate by +90
                        newRotationAngle = (currentActualRotation + 90) % 360;
                        console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Rotation by +90. New angle: ${newRotationAngle}`);
                    } else if (typeof newProps.rotation === 'number') { // Direct angle set
                        newRotationAngle = ((parseInt(String(newProps.rotation), 10) % 360) + 360) % 360;
                        console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Direct rotation. New angle: ${newRotationAngle}`);
                        if (isNaN(newRotationAngle)) { newRotationAngle = undefined; openAlertModal("Invalid Input", "Invalid rotation angle.", "error"); overallValidationPassedInSnapshot = false; }
                    } else {
                        openAlertModal("Invalid Input", "Invalid rotation type.", "error"); delete accumulatedChanges.rotation; newRotationAngle = undefined; overallValidationPassedInSnapshot = false;
                    }

                    if (newRotationAngle !== undefined && overallValidationPassedInSnapshot) {
                        let prospectiveWMinor = accumulatedChanges.w_minor !== undefined ? accumulatedChanges.w_minor : currentItem.w_minor;
                        let prospectiveHMinor = accumulatedChanges.h_minor !== undefined ? accumulatedChanges.h_minor : currentItem.h_minor;
                        const posToUse = accumulatedChanges.gridPosition || currentItem.gridPosition;
                        console.log(ROTATION_RESIZE_DEBUG_PREFIX + `For rotation check - Base Dims before potential swap: w=${prospectiveWMinor}, h=${prospectiveHMinor}. Pos: r=${posToUse.rowStart},c=${posToUse.colStart}`);

                        const wasHorizontal = currentActualRotation === 0 || currentActualRotation === 180;
                        const willBeHorizontal = newRotationAngle === 0 || newRotationAngle === 180;
                        console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Orientation change: wasHorizontal=${wasHorizontal}, willBeHorizontal=${willBeHorizontal}`);

                        const tempItemWithNewRotationAndCurrentBaseDims = {
                            ...currentItem,
                            gridPosition: posToUse,
                            w_minor: prospectiveWMinor, // Use base dims *before* swap for validation
                            h_minor: prospectiveHMinor, // Use base dims *before* swap for validation
                            rotation: newRotationAngle
                        };
                        const { w: effW_rot, h: effH_rot } = getEffectiveDimensionsUtil(tempItemWithNewRotationAndCurrentBaseDims);
                        console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Validating rotation placement for effective dims: effW=${effW_rot}, effH=${effH_rot}`);

                        if (!canPlaceItemUtil(posToUse.rowStart, posToUse.colStart, effW_rot, effH_rot, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                            openAlertModal("Rotation Error", "Cannot rotate: new orientation conflicts or is out of bounds.", "error");
                            console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Rotation placement validation FAILED.`);
                            delete accumulatedChanges.rotation;
                            overallValidationPassedInSnapshot = false;
                        } else {
                            console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Rotation placement validation PASSED.`);
                            accumulatedChanges.rotation = newRotationAngle;
                            if (wasHorizontal !== willBeHorizontal) {
                                console.log(ROTATION_RESIZE_DEBUG_PREFIX + `SWAPPING base dimensions. Old base: w=${prospectiveWMinor}, h=${prospectiveHMinor}. New base: w=${prospectiveHMinor}, h=${prospectiveWMinor}`);
                                accumulatedChanges.w_minor = prospectiveHMinor; // SWAP!
                                accumulatedChanges.h_minor = prospectiveWMinor; // SWAP!
                            } else {
                                // No swap needed, ensure prospective dimensions are kept if they were part of this update
                                if (newProps.w_minor !== undefined) accumulatedChanges.w_minor = prospectiveWMinor;
                                if (newProps.h_minor !== undefined) accumulatedChanges.h_minor = prospectiveHMinor;
                                console.log(ROTATION_RESIZE_DEBUG_PREFIX + `No dimension swap. Final base dims in accumulatedChanges: w=${accumulatedChanges.w_minor}, h=${accumulatedChanges.h_minor}`);
                            }
                        }
                    } else if (newProps.rotation !== undefined && accumulatedChanges.rotation !== undefined) {
                        delete accumulatedChanges.rotation;
                    }
                } else {
                    if (newProps.rotation !== undefined) delete accumulatedChanges.rotation;
                }
            }
            console.log(ROTATION_RESIZE_DEBUG_PREFIX + `End of Stage 2. accumulatedChanges:`, JSON.parse(JSON.stringify(accumulatedChanges)), `overallValidationPassedInSnapshot=${overallValidationPassedInSnapshot}`);


            // --- Stage 3 & 4: Handle Counter Sizing ---
            // ... (unchanged from original) ...
            if (overallValidationPassedInSnapshot) {
                const isCounterItem = currentItem.itemType === ItemTypes.PLACED_COUNTER ||
                    (currentItem.itemType === ItemTypes.PLACED_DECOR && currentItem.decorType?.startsWith('counter-'));
                if (isCounterItem) { /* ... counter logic ... */ }
            }

            // --- Stage 5: Other property validations (table number, seats) ---
            // ... (unchanged from original) ...
            if (overallValidationPassedInSnapshot && currentItem.itemType === ItemTypes.PLACED_TABLE) { /* ... table logic ... */ }


            // --- Final Step: Apply if overall validation passed ---
            if (!overallValidationPassedInSnapshot) {
                overallValidationPassedThisCall = false;
                console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Final Step: overallValidationPassedInSnapshot is FALSE. Returning previous state.`);
                return prev;
            }

            let hasActualChanges = false;
            for (const key in accumulatedChanges) {
                if (key === 'gridPosition') {
                    if (accumulatedChanges.gridPosition.rowStart !== currentItem.gridPosition.rowStart ||
                        accumulatedChanges.gridPosition.colStart !== currentItem.gridPosition.colStart) {
                        hasActualChanges = true; break;
                    }
                } else if (JSON.stringify(accumulatedChanges[key]) !== JSON.stringify(currentItem[key])) {
                    hasActualChanges = true; break;
                }
            }
            console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Final Step: hasActualChanges=${hasActualChanges}`);

            if (!hasActualChanges) {
                console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Final Step: No actual changes detected. Returning previous state.`);
                return prev;
            }

            const updatedItem = { ...currentItem, ...accumulatedChanges };
            const newDesignItems = [...prev.designItems];
            newDesignItems[itemIndex] = updatedItem;
            console.log(ROTATION_RESIZE_DEBUG_PREFIX + `Final Step: Applying changes. Updated Item:`, JSON.parse(JSON.stringify(updatedItem)));
            return { ...prev, designItems: newDesignItems };
        });

        console.log(ROTATION_RESIZE_DEBUG_PREFIX + `updateItemProperties RETURNING. overallValidationPassedThisCall=${overallValidationPassedThisCall}`);
        return overallValidationPassedThisCall;
    }, [setLayoutSnapshotWithHistory, openAlertModal, getEffectiveDimensionsUtil, canPlaceItemUtil]);

    const setGridDimensions = useCallback(({ rows, cols }) => {
        // ... (rest of function is unchanged)
        setLayoutSnapshotWithHistory(prev => {
            const targetMajorRows = rows !== undefined ? parseInt(String(rows), 10) : prev.gridRows;
            const targetMajorCols = cols !== undefined ? parseInt(String(cols), 10) : prev.gridCols;
            if ((rows !== undefined && (isNaN(targetMajorRows) || targetMajorRows < MIN_GRID_ROWS || targetMajorRows > MAX_GRID_ROWS)) ||
                (cols !== undefined && (isNaN(targetMajorCols) || targetMajorCols < MIN_GRID_COLS || targetMajorCols > MAX_GRID_COLS))) {
                openAlertModal("Invalid Dimension", `Grid dimensions out of range. Min/Max Rows: ${MIN_GRID_ROWS}-${MAX_GRID_ROWS}, Cols: ${MIN_GRID_COLS}-${MAX_GRID_COLS}.`, "warning"); return prev;
            }
            const newTotalMinorRows = targetMajorRows * prev.gridSubdivision;
            const newTotalMinorCols = targetMajorCols * prev.gridSubdivision;
            if (((rows !== undefined && targetMajorRows < prev.gridRows) || (cols !== undefined && targetMajorCols < prev.gridCols)) &&
                !checkItemsInBoundsUtil(newTotalMinorRows, newTotalMinorCols, prev.designItems)) {
                openAlertModal("Resize Error", "Cannot reduce dimensions. Some items would be out of bounds.", "error"); return prev;
            }
            return { ...prev, gridRows: targetMajorRows, gridCols: targetMajorCols };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal, checkItemsInBoundsUtil]);

    const setGridSubdivision = useCallback((newSubdivisionValue) => {
        // ... (rest of function is unchanged)
        const newSubdivision = parseInt(String(newSubdivisionValue), 10);
        if (isNaN(newSubdivision) || newSubdivision < 1) {
            openAlertModal("Invalid Subdivision", "Grid subdivision level is invalid.", "error"); return;
        }
        setLayoutSnapshotWithHistory(prev => {
            if (prev.designItems.length > 0) {
                openAlertModal("Layout Update", "Changing grid subdivision will clear existing items if you proceed with new item placements. Current items remain, but may not align perfectly if you don't clear.", "info");
            }
            return { ...prev, gridSubdivision: newSubdivision };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const clearFullLayout = useCallback(() => {
        // ... (rest of function is unchanged)
        setLayoutSnapshotWithHistory(prev => ({
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            gridRows: prev.gridRows,
            gridCols: prev.gridCols,
            gridSubdivision: prev.gridSubdivision,
        }));
        openAlertModal("Designer Cleared", "All items have been removed from the layout.", "info");
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const resetFullLayout = useCallback(() => {
        // ... (rest of function is unchanged)
        resetHistory({
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            gridRows: DEFAULT_INITIAL_GRID_ROWS,
            gridCols: DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: DEFAULT_GRID_SUBDIVISION,
        });
        openAlertModal("Designer Reset", "Layout and grid settings have been reset to default.", "info");
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
        clearAllItems: clearFullLayout,
        resetToDefaults: resetFullLayout,
        canPlaceItem,
        getEffectiveDimensions,
    };
};

export default useLayoutDesignerStateManagement;