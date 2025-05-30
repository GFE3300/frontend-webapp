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
    parseBackendLayoutItemsToFrontend, // IMPORT THE NEW PARSER
} from '../utils/layoutUtils'; // Assuming layoutUtils.js is in the same directory or path is updated

const STABLE_EMPTY_ARRAY_DESIGN_ITEMS = Object.freeze([]);
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1;
const DEBUG_PREFIX_HOOK = "[StateMgmt DEBUG] ";
const ROTATION_RESIZE_DEBUG_PREFIX = "[DEBUG ROTATION-RESIZE] [StateMgmt] ";

const useLayoutDesignerStateManagement = (
    initialLayoutConfig = {}, // Expects initialDesignItems in BACKEND format if coming from useLayoutData
    openAlertModal = (title, message, type) => console.warn(`Alert Modal not provided: ${type} - ${title}: ${message}`)
) => {
    const {
        // initialDesignItems are expected in BACKEND format here
        initialDesignItems: initialBackendItems = STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
        initialGridRows = DEFAULT_INITIAL_GRID_ROWS,
        initialGridCols = DEFAULT_INITIAL_GRID_COLS,
        initialGridSubdivision = DEFAULT_GRID_SUBDIVISION,
    } = initialLayoutConfig;

    // The generateNewItemFromTool function remains largely the same as it creates NEW frontend items
    // from tool payloads, not from backend data.
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
            // existingDesignItems are already in frontend format here because they come from prev.designItems
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

    // REMOVE the old parseAndPrepareInitialItems function from here.
    // It's now replaced by the utility in layoutUtils.js

    const initialSnapshot = useMemo(() => {
        // initialBackendItems are in backend format. Parse them to frontend format.
        // The gridSubdivision used for parsing should be the one for this specific layout.
        const parsedFrontendItems = parseBackendLayoutItemsToFrontend(initialBackendItems, initialGridSubdivision);
        return {
            designItems: parsedFrontendItems, // These are now in FRONTEND format
            gridRows: initialGridRows,
            gridCols: initialGridCols,
            gridSubdivision: initialGridSubdivision,
        };
    }, [initialBackendItems, initialGridRows, initialGridCols, initialGridSubdivision]); // Removed parseAndPrepareInitialItems from deps

    const { state: layoutSnapshot, setState: setLayoutSnapshotWithHistory, undo, redo, canUndo, canRedo, resetHistory } = useHistory(initialSnapshot);
    const { designItems, gridRows, gridCols, gridSubdivision } = layoutSnapshot; // designItems here are in FRONTEND format

    useEffect(() => {
        // When initialLayoutConfig changes (e.g., layout loaded from server by parent),
        // re-parse and potentially reset history.
        const newParsedFrontendItems = parseBackendLayoutItemsToFrontend(
            initialLayoutConfig.initialDesignItems || STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION
        );

        const newSnapshotForEffect = {
            designItems: newParsedFrontendItems,
            gridRows: initialLayoutConfig.initialGridRows || DEFAULT_INITIAL_GRID_ROWS,
            gridCols: initialLayoutConfig.initialGridCols || DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION,
        };

        // Compare with the current state in the history hook (layoutSnapshot)
        if (JSON.stringify(newSnapshotForEffect) !== JSON.stringify(layoutSnapshot)) {
            // Also compare with what was initially set (initialSnapshot based on initial props)
            // to decide if it's a true "new initial state" vs. just a prop update that matches current state.
            const currentInitialSnapshotFromProps = {
                designItems: parseBackendLayoutItemsToFrontend(initialLayoutConfig.initialDesignItems, initialLayoutConfig.initialGridSubdivision),
                gridRows: initialLayoutConfig.initialGridRows,
                gridCols: initialLayoutConfig.initialGridCols,
                gridSubdivision: initialLayoutConfig.initialGridSubdivision,
            };
            if (JSON.stringify(currentInitialSnapshotFromProps) !== JSON.stringify(initialSnapshot)) {
                // console.log(DEBUG_PREFIX_HOOK + "Initial config changed significantly. Resetting history.");
                resetHistory(currentInitialSnapshotFromProps); // Pass the new state to reset to
            } else if (JSON.stringify(newSnapshotForEffect) !== JSON.stringify(layoutSnapshot)) {
                // This case might occur if props changed but not enough to warrant a full history reset,
                // but the current state is out of sync. This usually means an external change
                // that should perhaps overwrite the current history stack.
                // For now, we primarily rely on the initialSnapshot comparison.
                // console.log(DEBUG_PREFIX_HOOK + "Props changed and current snapshot differs. Resetting history to new props.");
                // resetHistory(newSnapshotForEffect); // This might be too aggressive if user has made changes.
                // A more nuanced approach might involve diffing or providing a "load new layout" action.
                // For now, if the initial "source of truth" (props) fundamentally changes what `initialSnapshot` *should* be, we reset.
            }
        }
        // Removed parseAndPrepareInitialItems from deps
    }, [initialLayoutConfig, resetHistory, initialSnapshot, layoutSnapshot]);


    const getEffectiveDimensions = useCallback((item) => getEffectiveDimensionsUtil(item), []);

    const canPlaceItem = useCallback((targetMinorRow, targetMinorCol, itemEffW_minor, itemEffH_minor, itemToExcludeId = null) => {
        const totalMinorRows = gridRows * gridSubdivision;
        const totalMinorCols = gridCols * gridSubdivision;
        // designItems are already in frontend format
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
            // prev.designItems are in frontend format
            const newItem = generateNewItemFromTool(toolPayloadFromDrag, minorTargetRow, minorTargetCol, prev.gridSubdivision, prev.designItems);
            return newItem ? { ...prev, designItems: [...prev.designItems, newItem] } : prev;
        });
    }, [canPlaceItem, gridSubdivision, setLayoutSnapshotWithHistory, openAlertModal, generateNewItemFromTool]);

    // moveExistingItem, removeItemById, removeItemAtCoords, updateItemProperties,
    // setGridDimensions, setGridSubdivision, clearFullLayout, resetFullLayout
    // should all continue to work with `designItems` in frontend format as they
    // operate on the state managed by this hook.

    // ... (rest of the hook: moveExistingItem, removeItemById, removeItemAtCoords, updateItemProperties, etc.
    //      These functions operate on `designItems` which are already in frontend format within this hook's state.)
    // ... NO CHANGES NEEDED FOR THE REST OF THE FUNCTIONS IN THIS HOOK ...
    // ... AS THEY ALREADY EXPECT `designItems` TO BE IN FRONTEND FORMAT ...
    // ... (The `updateItemProperties` already has detailed logic for rotations and sizing based on frontend item structure)

    // [UNCHANGED functions from the provided snippet, ensure they are complete in your actual file]
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
        // This function is complex and handles internal validation and transformations
        // for properties like rotation (swapping w_minor/h_minor), counter length, etc.
        // It expects `newProps` to be frontend-style properties.
        // The `prev.designItems` it operates on are already in frontend format.
        // No changes needed here due to external data format change.
        // [This function's body is long and assumed to be correct from the provided code]
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
            // --- Stage 2: Rotation ---
            if (newProps.rotation !== undefined && overallValidationPassedInSnapshot) {
                if (itemConfig?.isRotatable) {
                    let newRotationAngle;
                    const currentActualRotation = parseInt(String(currentItem.rotation || 0), 10);
                    if (isNaN(currentActualRotation)) {
                        delete accumulatedChanges.rotation; overallValidationPassedInSnapshot = false;
                    } else if (newProps.rotation === true) {
                        newRotationAngle = (currentActualRotation + 90) % 360;
                    } else if (typeof newProps.rotation === 'number') {
                        newRotationAngle = ((parseInt(String(newProps.rotation), 10) % 360) + 360) % 360;
                        if (isNaN(newRotationAngle)) { newRotationAngle = undefined; openAlertModal("Invalid Input", "Invalid rotation angle.", "error"); overallValidationPassedInSnapshot = false; }
                    } else {
                        openAlertModal("Invalid Input", "Invalid rotation type.", "error"); delete accumulatedChanges.rotation; newRotationAngle = undefined; overallValidationPassedInSnapshot = false;
                    }

                    if (newRotationAngle !== undefined && overallValidationPassedInSnapshot) {
                        let prospectiveWMinor = accumulatedChanges.w_minor !== undefined ? accumulatedChanges.w_minor : currentItem.w_minor;
                        let prospectiveHMinor = accumulatedChanges.h_minor !== undefined ? accumulatedChanges.h_minor : currentItem.h_minor;
                        const posToUse = accumulatedChanges.gridPosition || currentItem.gridPosition;
                        const wasHorizontal = currentActualRotation === 0 || currentActualRotation === 180;
                        const willBeHorizontal = newRotationAngle === 0 || newRotationAngle === 180;
                        const tempItemWithNewRotationAndCurrentBaseDims = { ...currentItem, gridPosition: posToUse, w_minor: prospectiveWMinor, h_minor: prospectiveHMinor, rotation: newRotationAngle };
                        const { w: effW_rot, h: effH_rot } = getEffectiveDimensionsUtil(tempItemWithNewRotationAndCurrentBaseDims);

                        if (!canPlaceItemUtil(posToUse.rowStart, posToUse.colStart, effW_rot, effH_rot, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                            openAlertModal("Rotation Error", "Cannot rotate: new orientation conflicts or is out of bounds.", "error");
                            delete accumulatedChanges.rotation; overallValidationPassedInSnapshot = false;
                        } else {
                            accumulatedChanges.rotation = newRotationAngle;
                            if (wasHorizontal !== willBeHorizontal) { // Orientation changed
                                accumulatedChanges.w_minor = prospectiveHMinor;
                                accumulatedChanges.h_minor = prospectiveWMinor;
                            } else { // Orientation maintained
                                if (newProps.w_minor !== undefined) accumulatedChanges.w_minor = prospectiveWMinor;
                                if (newProps.h_minor !== undefined) accumulatedChanges.h_minor = prospectiveHMinor;
                            }
                        }
                    } else if (newProps.rotation !== undefined && accumulatedChanges.rotation !== undefined) { delete accumulatedChanges.rotation; }
                } else { if (newProps.rotation !== undefined) delete accumulatedChanges.rotation; }
            }
            // --- Stage 3 & 4: Counter Sizing ---
            if (overallValidationPassedInSnapshot) {
                const isCounterItem = currentItem.itemType === ItemTypes.PLACED_COUNTER || (currentItem.itemType === ItemTypes.PLACED_DECOR && currentItem.decorType?.startsWith('counter-'));
                if (isCounterItem && newProps.length !== undefined) { // `length` is major units
                    const newLengthMajorUnits = parseInt(String(newProps.length), 10);
                    if (!isNaN(newLengthMajorUnits) && newLengthMajorUnits >= 1) {
                        const newLengthMinorUnits = newLengthMajorUnits * prev.gridSubdivision;
                        const currentRotation = accumulatedChanges.rotation !== undefined ? accumulatedChanges.rotation : currentItem.rotation;
                        const isHorizontal = currentRotation === 0 || currentRotation === 180;
                        let newWMinor = isHorizontal ? newLengthMinorUnits : (accumulatedChanges.w_minor !== undefined ? accumulatedChanges.w_minor : currentItem.w_minor);
                        let newHMinor = !isHorizontal ? newLengthMinorUnits : (accumulatedChanges.h_minor !== undefined ? accumulatedChanges.h_minor : currentItem.h_minor);
                        // If rotation also changed, base dimensions for non-length axis come from potentially swapped ones
                        if (newProps.rotation !== undefined && accumulatedChanges.rotation !== undefined) {
                            const wasHorizontalBeforeThisUpdate = currentItem.rotation === 0 || currentItem.rotation === 180;
                            const willBeHorizontalAfterThisUpdate = accumulatedChanges.rotation === 0 || accumulatedChanges.rotation === 180;
                            if (wasHorizontalBeforeThisUpdate !== willBeHorizontalAfterThisUpdate) { // Orientation flipped due to rotation in this update
                                newWMinor = isHorizontal ? newLengthMinorUnits : currentItem.h_minor; // Use original non-length dimension from before swap
                                newHMinor = !isHorizontal ? newLengthMinorUnits : currentItem.w_minor;
                            } else { // Orientation same as before, or rotation didn't flip it
                                newWMinor = isHorizontal ? newLengthMinorUnits : currentItem.w_minor;
                                newHMinor = !isHorizontal ? newLengthMinorUnits : currentItem.h_minor;
                            }
                        }


                        const itemForCounterCheck = { ...currentItem, ...accumulatedChanges, w_minor: newWMinor, h_minor: newHMinor };
                        const { w: effW_counter, h: effH_counter } = getEffectiveDimensionsUtil(itemForCounterCheck);
                        const posForCounterCheck = accumulatedChanges.gridPosition || currentItem.gridPosition;
                        if (canPlaceItemUtil(posForCounterCheck.rowStart, posForCounterCheck.colStart, effW_counter, effH_counter, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                            accumulatedChanges.w_minor = newWMinor;
                            accumulatedChanges.h_minor = newHMinor;
                            accumulatedChanges.length_units = newLengthMajorUnits;
                        } else {
                            openAlertModal("Sizing Error", "Counter cannot be resized: new size conflicts or is out of bounds.", "error");
                            delete accumulatedChanges.length; overallValidationPassedInSnapshot = false;
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
                    if (newNumberStr === '') {
                        accumulatedChanges.number = null; accumulatedChanges.isProvisional = true;
                    } else {
                        const newNumber = parseInt(newNumberStr, 10);
                        if (isNaN(newNumber) || newNumber <= 0) {
                            openAlertModal("Invalid Table Number", "Table number must be a positive integer.", "error");
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
                    if (newSeatsStr === '') {
                        accumulatedChanges.seats = null;
                    } else {
                        const newSeats = parseInt(newSeatsStr, 10);
                        if (isNaN(newSeats) || newSeats < 0) {
                            openAlertModal("Invalid Seat Count", "Seat count must be a non-negative integer.", "error");
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
            // prev.designItems are in frontend format here
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
            if (prev.designItems.length > 0) {
                openAlertModal(
                    "Subdivision Changed",
                    "Grid subdivision has been updated. Existing items might need manual readjustment if their base major unit sizes were tied to the old subdivision. No automatic scaling of items is performed.",
                    "info"
                );
            }
            return { ...prev, gridSubdivision: newSubdivision };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const clearFullLayout = useCallback(() => {
        setLayoutSnapshotWithHistory(prev => ({
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS, // Already frontend format (empty)
            gridRows: prev.gridRows,
            gridCols: prev.gridCols,
            gridSubdivision: prev.gridSubdivision,
        }));
        openAlertModal("Designer Cleared", "All items have been removed from the layout.", "info");
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const resetFullLayout = useCallback(() => {
        resetHistory({ // Pass the new initial state directly to resetHistory (in frontend format)
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            gridRows: DEFAULT_INITIAL_GRID_ROWS,
            gridCols: DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: DEFAULT_GRID_SUBDIVISION,
        });
        openAlertModal("Designer Reset", "Layout and grid settings have been reset to default.", "info");
    }, [resetHistory, openAlertModal]);


    return {
        designItems, // These are in FRONTEND format for the editor UI
        gridRows, gridCols, gridSubdivision,
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