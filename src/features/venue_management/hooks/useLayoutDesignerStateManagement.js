import { useCallback, useEffect, useMemo, useRef } from 'react';
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
    // parseBackendLayoutItemsToFrontend, // REMOVED: Parsing is now expected to happen upstream (in VenueDesignerPage)
} from '../utils/layoutUtils';

const STABLE_EMPTY_ARRAY_DESIGN_ITEMS = Object.freeze([]);
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1;
const DEBUG_PREFIX_HOOK_STATE_MGMT = "[StateMgmt DEBUG] ";
// const ROTATION_RESIZE_DEBUG_PREFIX = "[DEBUG ROTATION-RESIZE] [StateMgmt] "; // Kept for reference if needed

const useLayoutDesignerStateManagement = (
    initialLayoutConfig = {}, // Expects initialDesignItems in FRONTEND format here
    openAlertModal = (title, message, type) => console.warn(`Alert Modal not provided: ${type} - ${title}: ${message}`)
) => {
    const {
        // initialDesignItems are now expected in FRONTEND format here
        initialDesignItems: initialFrontendItems = STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
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
            console.error(DEBUG_PREFIX_HOOK_STATE_MGMT + `[generateNewItemFromTool] CRITICAL: No config for ${placedItemType}`, toolPayloadFromDrag);
            openAlertModal("Configuration Error", `Missing config for ${placedItemType}.`, "error");
            return null;
        }
        if (typeof config.defaultPropsFactory !== 'function') {
            console.error(DEBUG_PREFIX_HOOK_STATE_MGMT + `[generateNewItemFromTool] CRITICAL: No factory for ${placedItemType}`, config);
            openAlertModal("Configuration Error", `Missing factory for ${placedItemType}.`, "error");
            return null;
        }
        const baseId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const base_w_minor = toolPayloadFromDrag.w_major * currentSubdivision;
        const base_h_minor = toolPayloadFromDrag.h_major * currentSubdivision;

        if (isNaN(base_w_minor) || base_w_minor < MIN_ITEM_DIMENSION_MINOR_CELLS || isNaN(base_h_minor) || base_h_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) {
            console.error(DEBUG_PREFIX_HOOK_STATE_MGMT + `[generateNewItemFromTool] Invalid base dimensions for ${placedItemType}. w_minor: ${base_w_minor}, h_minor: ${base_h_minor}. Tool:`, toolPayloadFromDrag, `Subdiv: ${currentSubdivision}`);
            openAlertModal("Dimension Error", `Invalid base dimensions for ${placedItemType}. Min dimension: ${MIN_ITEM_DIMENSION_MINOR_CELLS}.`, "error");
            return null;
        }
        let typeSpecificDefaults = {};
        try {
            typeSpecificDefaults = config.defaultPropsFactory(toolPayloadFromDrag, currentSubdivision, existingDesignItems);
        } catch (e) {
            console.error(DEBUG_PREFIX_HOOK_STATE_MGMT + `[generateNewItemFromTool] Error in factory for ${placedItemType}:`, e);
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

    const initialSnapshot = useMemo(() => {
        // initialFrontendItems are already in FRONTEND format. No parsing needed here.
        console.log(DEBUG_PREFIX_HOOK_STATE_MGMT + "Creating initialSnapshot. initialFrontendItems count:", initialFrontendItems.length, "Grid:", initialGridRows, initialGridCols, initialGridSubdivision);
        return {
            designItems: initialFrontendItems, // Use directly
            gridRows: initialGridRows,
            gridCols: initialGridCols,
            gridSubdivision: initialGridSubdivision,
        };
    }, [initialFrontendItems, initialGridRows, initialGridCols, initialGridSubdivision]);

    const { state: layoutSnapshot, setState: setLayoutSnapshotWithHistory, undo, redo, canUndo, canRedo, resetHistory } = useHistory(initialSnapshot); // initialSnapshot is based on the VERY FIRST initialLayoutConfig
    const { designItems, gridRows, gridCols, gridSubdivision } = layoutSnapshot;

    const prevInitialLayoutConfigRef = useRef(initialLayoutConfig);

    useEffect(() => {
        // This effect responds to changes in `initialLayoutConfig` prop from LayoutEditor
        if (JSON.stringify(initialLayoutConfig) !== JSON.stringify(prevInitialLayoutConfigRef.current)) {
            console.warn(DEBUG_PREFIX_HOOK_STATE_MGMT + "Initial config from props changed. Resetting history to new props:", initialLayoutConfig);

            // initialLayoutConfig.initialDesignItems IS ALREADY IN FRONTEND FORMAT
            const newSnapshotForHistory = {
                designItems: initialLayoutConfig.initialDesignItems || STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
                gridRows: initialLayoutConfig.initialGridRows || DEFAULT_INITIAL_GRID_ROWS,
                gridCols: initialLayoutConfig.initialGridCols || DEFAULT_INITIAL_GRID_COLS,
                gridSubdivision: initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION,
            };
            resetHistory(newSnapshotForHistory); // Pass the new state to reset the history to
            prevInitialLayoutConfigRef.current = initialLayoutConfig; // Update the ref to the currently processed config
        }
    }, [initialLayoutConfig, resetHistory]);


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
            if (!canPlaceItem(toMinorRow, toMinorCol, effW_minor, effH_minor, itemId)) return prev; // Collision or OOB
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

    // updateItemProperties: This function remains complex and critical.
    // Its internal logic relies on item properties being in frontend format.
    // No structural changes here needed due to backend integration, but its correctness is paramount.
    const updateItemProperties = useCallback((itemId, newProps) => {
        // [UNCHANGED - The body of this function is assumed to be correct as provided in the problem description's snippet]
        // This function handles internal validation and transformations for properties like rotation, counter length, etc.
        // It operates on `prev.designItems` which are already in frontend format.
        let overallValidationPassedThisCall = true;
        setLayoutSnapshotWithHistory(prev => {
            let overallValidationPassedInSnapshot = true;
            const itemIndex = prev.designItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) {
                overallValidationPassedThisCall = false;
                return prev;
            }
            const currentItem = { ...prev.designItems[itemIndex] };
            const itemConfig = ITEM_CONFIGS[currentItem.itemType];
            let accumulatedChanges = { ...newProps };

            // --- Stage 1: Dimensional/Positional Changes ---
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
                        gridPosition: pendingGridPosition, w_minor: pendingWMinor, h_minor: pendingHMinor,
                        rotation: newProps.rotation !== undefined && typeof newProps.rotation === 'number'
                            ? newProps.rotation
                            : (newProps.rotation === true ? (parseInt(String(currentItem.rotation || 0), 10) + 90) % 360 : currentItem.rotation)
                    };
                    const { w: effW_check, h: effH_check } = getEffectiveDimensionsUtil(itemForCheck); // Ensure using imported util
                    if (!canPlaceItemUtil(pendingGridPosition.rowStart, pendingGridPosition.colStart, effW_check, effH_check, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) { // Ensure using imported util
                        openAlertModal("Placement Error", "Resized/moved item conflicts or is out of bounds.", "error");
                        if (newProps.gridPosition) delete accumulatedChanges.gridPosition;
                        if (newProps.w_minor !== undefined) delete accumulatedChanges.w_minor;
                        if (newProps.h_minor !== undefined) delete accumulatedChanges.h_minor;
                        overallValidationPassedInSnapshot = false;
                    }
                }
            }
            // --- Stage 2: Rotation ---
            if (newProps.rotation !== undefined && overallValidationPassedInSnapshot) {
                if (itemConfig?.isRotatable) {
                    let newRotationAngle;
                    const currentActualRotation = parseInt(String(currentItem.rotation || 0), 10);
                    if (isNaN(currentActualRotation)) {
                        delete accumulatedChanges.rotation; overallValidationPassedInSnapshot = false;
                    } else if (newProps.rotation === true) { // Relative rotation (+90 deg)
                        newRotationAngle = (currentActualRotation + 90) % 360;
                    } else if (typeof newProps.rotation === 'number') { // Absolute rotation angle
                        newRotationAngle = ((parseInt(String(newProps.rotation), 10) % 360) + 360) % 360; // Normalize
                        if (isNaN(newRotationAngle)) { newRotationAngle = undefined; openAlertModal("Invalid Input", "Invalid rotation angle.", "error"); overallValidationPassedInSnapshot = false; }
                    } else {
                        openAlertModal("Invalid Input", "Invalid rotation type.", "error"); delete accumulatedChanges.rotation; newRotationAngle = undefined; overallValidationPassedInSnapshot = false;
                    }

                    if (newRotationAngle !== undefined && overallValidationPassedInSnapshot) {
                        // Use dimensions that might have been set in this same update call (accumulatedChanges)
                        // or fall back to currentItem's dimensions if not part of this update.
                        let prospectiveWMinor = accumulatedChanges.w_minor !== undefined ? accumulatedChanges.w_minor : currentItem.w_minor;
                        let prospectiveHMinor = accumulatedChanges.h_minor !== undefined ? accumulatedChanges.h_minor : currentItem.h_minor;
                        const posToUse = accumulatedChanges.gridPosition || currentItem.gridPosition;

                        // Check if orientation (horizontal/vertical primary axis) changes
                        const wasEffectivelyHorizontal = currentActualRotation === 0 || currentActualRotation === 180;
                        const willBeEffectivelyHorizontal = newRotationAngle === 0 || newRotationAngle === 180;

                        // Create a temporary item with the new rotation but with *base* dimensions
                        // before they are potentially swapped by this rotation logic.
                        // The key is that w_minor/h_minor in the state always reflect the item's dimensions
                        // as if it were at 0 degrees (base dimensions). getEffectiveDimensions handles the AABB.
                        // Here, we need to see if the rotation itself necessitates swapping the *base* w_minor/h_minor.

                        // If the base dimensions w_minor/h_minor *should* swap due to this rotation:
                        let newBaseW = prospectiveWMinor;
                        let newBaseH = prospectiveHMinor;
                        if (wasEffectivelyHorizontal !== willBeEffectivelyHorizontal) { // Orientation changed (e.g., 0 -> 90)
                            newBaseW = prospectiveHMinor; // The new base width becomes the old base height
                            newBaseH = prospectiveWMinor; // The new base height becomes the old base width
                        }

                        // Now check collision with these new *base* dimensions and new rotation
                        const tempItemWithNewRotationAndAdjustedBaseDims = { ...currentItem, gridPosition: posToUse, w_minor: newBaseW, h_minor: newBaseH, rotation: newRotationAngle };
                        const { w: effW_rot, h: effH_rot } = getEffectiveDimensionsUtil(tempItemWithNewRotationAndAdjustedBaseDims);

                        if (!canPlaceItemUtil(posToUse.rowStart, posToUse.colStart, effW_rot, effH_rot, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                            openAlertModal("Rotation Error", "Cannot rotate: new orientation conflicts or is out of bounds.", "error");
                            delete accumulatedChanges.rotation; overallValidationPassedInSnapshot = false;
                        } else {
                            accumulatedChanges.rotation = newRotationAngle;
                            // IMPORTANT: If orientation changed, update w_minor and h_minor in accumulatedChanges
                            // to reflect the swapped base dimensions.
                            if (wasEffectivelyHorizontal !== willBeEffectivelyHorizontal) {
                                accumulatedChanges.w_minor = newBaseW; // Use the swapped base dimensions
                                accumulatedChanges.h_minor = newBaseH;
                            } else {
                                // If orientation didn't change, but w/h were part of newProps, ensure they are kept
                                if (newProps.w_minor !== undefined) accumulatedChanges.w_minor = prospectiveWMinor;
                                if (newProps.h_minor !== undefined) accumulatedChanges.h_minor = prospectiveHMinor;
                            }
                        }
                    } else if (newProps.rotation !== undefined && accumulatedChanges.rotation !== undefined) { delete accumulatedChanges.rotation; } // Rollback if invalid
                } else { if (newProps.rotation !== undefined) delete accumulatedChanges.rotation; } // Not rotatable, remove if attempted
            }

            // --- Stage 3 & 4: Counter Sizing (length is in major units) ---
            // (This part seems okay, assuming `length` prop comes from CounterEditor and refers to major units)
            if (overallValidationPassedInSnapshot) {
                const isCounterItem = currentItem.itemType === ItemTypes.PLACED_COUNTER || (currentItem.itemType === ItemTypes.PLACED_DECOR && currentItem.decorType?.startsWith('counter-'));
                if (isCounterItem && newProps.length !== undefined) { // `length` is major units from CounterEditor
                    const newLengthMajorUnits = parseInt(String(newProps.length), 10);
                    if (!isNaN(newLengthMajorUnits) && newLengthMajorUnits >= 1) {
                        const newLengthMinorUnits = newLengthMajorUnits * prev.gridSubdivision;

                        // Determine current rotation (could be from this update or existing)
                        const currentRotationForCounter = accumulatedChanges.rotation !== undefined ? accumulatedChanges.rotation : currentItem.rotation;
                        const isHorizontal = currentRotationForCounter === 0 || currentRotationForCounter === 180;

                        // Determine the non-length base dimension. This should come from the item's state
                        // *before* any potential w/h swap due to rotation in *this current update step*.
                        // If rotation *also* changed in this update and flipped orientation, the base for non-length axis
                        // should be the one that *was* the non-length axis.
                        let nonLengthBaseDimensionMinor;
                        if (newProps.rotation !== undefined && accumulatedChanges.rotation !== undefined) { // If rotation is part of this update
                            const wasHorizontalBeforeThisUpdate = currentItem.rotation === 0 || currentItem.rotation === 180;
                            const willBeHorizontalAfterThisUpdate = accumulatedChanges.rotation === 0 || accumulatedChanges.rotation === 180;
                            if (wasHorizontalBeforeThisUpdate !== willBeHorizontalAfterThisUpdate) { // Orientation flipped
                                nonLengthBaseDimensionMinor = isHorizontal ? currentItem.w_minor : currentItem.h_minor; // Use the original dimension that became the depth
                            } else { // Orientation same, or rotation didn't flip it
                                nonLengthBaseDimensionMinor = isHorizontal ? currentItem.h_minor : currentItem.w_minor;
                            }
                        } else { // Rotation not part of this update, use current base dimensions
                            nonLengthBaseDimensionMinor = isHorizontal ? currentItem.h_minor : currentItem.w_minor;
                        }


                        let newBaseWMinor = isHorizontal ? newLengthMinorUnits : nonLengthBaseDimensionMinor;
                        let newBaseHMinor = !isHorizontal ? newLengthMinorUnits : nonLengthBaseDimensionMinor;

                        const itemForCounterCheck = { ...currentItem, ...accumulatedChanges, w_minor: newBaseWMinor, h_minor: newBaseHMinor, rotation: currentRotationForCounter };
                        const { w: effW_counter, h: effH_counter } = getEffectiveDimensionsUtil(itemForCounterCheck);
                        const posForCounterCheck = accumulatedChanges.gridPosition || currentItem.gridPosition;

                        if (canPlaceItemUtil(posForCounterCheck.rowStart, posForCounterCheck.colStart, effW_counter, effH_counter, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                            accumulatedChanges.w_minor = newBaseWMinor;
                            accumulatedChanges.h_minor = newBaseHMinor;
                            accumulatedChanges.length_units = newLengthMajorUnits; // Store the major unit length
                        } else {
                            openAlertModal("Sizing Error", "Counter cannot be resized: new size conflicts or is out of bounds.", "error");
                            delete accumulatedChanges.length; // Remove 'length' if it caused issues
                            overallValidationPassedInSnapshot = false;
                        }
                    } else {
                        openAlertModal("Invalid Input", "Counter length must be a positive number.", "error");
                        delete accumulatedChanges.length; overallValidationPassedInSnapshot = false;
                    }
                }
            }

            // --- Stage 5: Other property validations (table number, seats) ---
            if (overallValidationPassedInSnapshot && currentItem.itemType === ItemTypes.PLACED_TABLE) {
                if (newProps.number !== undefined) {
                    const newNumberStr = String(newProps.number).trim();
                    if (newNumberStr === '' || newProps.number === null) { // Allow clearing number (sets provisional)
                        accumulatedChanges.number = null; accumulatedChanges.isProvisional = true;
                    } else {
                        const newNumber = parseInt(newNumberStr, 10);
                        if (isNaN(newNumber) || newNumber <= 0) {
                            openAlertModal("Invalid Table Number", "Table number must be a positive integer or empty.", "error");
                            delete accumulatedChanges.number; overallValidationPassedInSnapshot = false;
                        } else {
                            const isDuplicate = prev.designItems.some(it => it.id !== itemId && it.itemType === ItemTypes.PLACED_TABLE && it.number === newNumber);
                            if (isDuplicate) {
                                openAlertModal("Duplicate Table Number", `Table number ${newNumber} is already in use.`, "error");
                                delete accumulatedChanges.number; overallValidationPassedInSnapshot = false;
                            } else {
                                accumulatedChanges.number = newNumber; accumulatedChanges.isProvisional = false;
                            }
                        }
                    }
                }
                if (newProps.seats !== undefined) {
                    const newSeatsStr = String(newProps.seats).trim();
                    if (newSeatsStr === '' || newProps.seats === null) { // Allow clearing seats
                        accumulatedChanges.seats = null;
                    } else {
                        const newSeats = parseInt(newSeatsStr, 10);
                        if (isNaN(newSeats) || newSeats < 0) {
                            openAlertModal("Invalid Seat Count", "Seat count must be a non-negative integer or empty.", "error");
                            delete accumulatedChanges.seats; overallValidationPassedInSnapshot = false;
                        } else { accumulatedChanges.seats = newSeats; }
                    }
                }
            }
            // --- Final Step: Apply ---
            if (!overallValidationPassedInSnapshot) {
                overallValidationPassedThisCall = false; return prev;
            }
            let hasActualChanges = false;
            for (const key in accumulatedChanges) {
                if (key === 'gridPosition') {
                    if (accumulatedChanges.gridPosition.rowStart !== currentItem.gridPosition.rowStart || accumulatedChanges.gridPosition.colStart !== currentItem.gridPosition.colStart) {
                        hasActualChanges = true; break;
                    }
                } else if (JSON.stringify(accumulatedChanges[key]) !== JSON.stringify(currentItem[key])) {
                    hasActualChanges = true; break;
                }
            }
            if (!hasActualChanges) return prev;
            const updatedItem = { ...currentItem, ...accumulatedChanges };
            const newDesignItems = [...prev.designItems];
            newDesignItems[itemIndex] = updatedItem;
            return { ...prev, designItems: newDesignItems };
        });
        return overallValidationPassedThisCall;
    }, [setLayoutSnapshotWithHistory, openAlertModal, getEffectiveDimensionsUtil, canPlaceItemUtil]);


    const setGridDimensions = useCallback(({ rows, cols }) => {
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
        const newSubdivision = parseInt(String(newSubdivisionValue), 10);
        if (isNaN(newSubdivision) || newSubdivision < 1) {
            openAlertModal("Invalid Subdivision", "Grid subdivision level is invalid.", "error"); return;
        }
        setLayoutSnapshotWithHistory(prev => {
            // Note: Changing subdivision does NOT automatically rescale items' w_minor/h_minor.
            // Frontend items store absolute minor cell dimensions. If subdivision changes,
            // their perceived size in "major" units changes, but not their minor cell footprint.
            // The user might need to manually adjust items. This alert informs them.
            if (prev.designItems.length > 0) {
                openAlertModal(
                    "Subdivision Changed",
                    "Grid subdivision has been updated. Existing items' dimensions are in minor cells and will not automatically scale. Manual adjustment may be needed if their intended size was relative to major grid units.",
                    "info"
                );
            }
            return { ...prev, gridSubdivision: newSubdivision };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const clearFullLayout = useCallback(() => {
        setLayoutSnapshotWithHistory(prev => ({
            ...prev, // Keep grid dimensions and subdivision
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
        }));
        openAlertModal("Designer Cleared", "All items have been removed from the layout.", "info");
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const resetFullLayout = useCallback(() => {
        resetHistory({ // Pass the new initial state directly to resetHistory
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            gridRows: DEFAULT_INITIAL_GRID_ROWS,
            gridCols: DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: DEFAULT_GRID_SUBDIVISION,
        });
        openAlertModal("Designer Reset", "Layout and grid settings have been reset to default.", "info");
    }, [resetHistory, openAlertModal]);


    return {
        designItems, // These are in FRONTEND format
        gridRows, gridCols, gridSubdivision,
        undo, redo, canUndo, canRedo,
        resetLayoutHistory: resetHistory, // Expose history reset method
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