import { useCallback, useEffect, useMemo, useRef } from 'react';
import useHistory from './useHistory';

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
import {
    canPlaceItem as canPlaceItemUtil,
    checkItemsInBounds as checkItemsInBoundsUtil,
    getEffectiveDimensions as getEffectiveDimensionsUtil,
} from '../utils/layoutUtils';

// Localization
import { scriptLines as slRaw } from '../utils/script_lines.js';
const sl = slRaw.venueManagement?.useLayoutDesignerStateManagement || {};
// const slCommon = slRaw; // For general strings if needed

const STABLE_EMPTY_ARRAY_DESIGN_ITEMS = Object.freeze([]);
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1;

const useLayoutDesignerStateManagement = (
    initialLayoutConfig = {},
    openAlertModal = (title, message, type) => console.warn(`Alert Modal not provided: ${type} - ${title}: ${message}`)
) => {
    const {
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
            const message = interpolate(sl.configErrorMissingConfigMessage || "Missing config for item type: {itemType}.", { itemType: placedItemType });
            openAlertModal(sl.configErrorMissingConfigTitle || "Configuration Error", message, "error");
            return null;
        }
        if (typeof config.defaultPropsFactory !== 'function') {
            const message = interpolate(sl.configErrorMissingFactoryMessage || "Missing factory for item type: {itemType}.", { itemType: placedItemType });
            openAlertModal(sl.configErrorMissingFactoryTitle || "Configuration Error", message, "error");
            return null;
        }
        const baseId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const base_w_minor = toolPayloadFromDrag.w_major * currentSubdivision;
        const base_h_minor = toolPayloadFromDrag.h_major * currentSubdivision;

        if (isNaN(base_w_minor) || base_w_minor < MIN_ITEM_DIMENSION_MINOR_CELLS || isNaN(base_h_minor) || base_h_minor < MIN_ITEM_DIMENSION_MINOR_CELLS) {
            const message = interpolate(sl.dimensionErrorMinMessage || "Invalid base dimensions. Min: {minCells} cell(s).", { minCells: MIN_ITEM_DIMENSION_MINOR_CELLS });
            openAlertModal(sl.dimensionErrorTitle || "Dimension Error", message, "error");
            return null;
        }
        let typeSpecificDefaults = {};
        try {
            typeSpecificDefaults = config.defaultPropsFactory(toolPayloadFromDrag, currentSubdivision, existingDesignItems);
        } catch (e) {
            console.error(`[StateMgmt] Error in factory for ${placedItemType}:`, e);
            const message = interpolate(sl.factoryErrorMessage || "Error creating properties for ({itemType}).", { itemType: placedItemType });
            openAlertModal(sl.factoryErrorTitle || "Factory Error", message, "error");
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
    }, [openAlertModal]); // sl object is stable, interpolate is stable

    const initialSnapshot = useMemo(() => ({
        designItems: initialFrontendItems,
        gridRows: initialGridRows,
        gridCols: initialGridCols,
        gridSubdivision: initialGridSubdivision,
    }), [initialFrontendItems, initialGridRows, initialGridCols, initialGridSubdivision]);

    const { state: layoutSnapshot, setState: setLayoutSnapshotWithHistory, undo, redo, canUndo, canRedo, resetHistory } = useHistory(initialSnapshot);
    const { designItems, gridRows, gridCols, gridSubdivision } = layoutSnapshot;

    const prevInitialLayoutConfigRef = useRef(initialLayoutConfig);

    useEffect(() => {
        const currentConfigString = JSON.stringify(initialLayoutConfig);
        const prevConfigString = JSON.stringify(prevInitialLayoutConfigRef.current);

        if (currentConfigString !== prevConfigString) {
            const newSnapshotForHistory = {
                designItems: initialLayoutConfig.initialDesignItems || STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
                gridRows: initialLayoutConfig.initialGridRows || DEFAULT_INITIAL_GRID_ROWS,
                gridCols: initialLayoutConfig.initialGridCols || DEFAULT_INITIAL_GRID_COLS,
                gridSubdivision: initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION,
            };
            resetHistory(newSnapshotForHistory);
            prevInitialLayoutConfigRef.current = initialLayoutConfig;
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
            const message = interpolate(sl.dimensionErrorMinMessage || "Invalid dimensions. Min: {minCells} cell(s).", { minCells: MIN_ITEM_DIMENSION_MINOR_CELLS });
            openAlertModal(sl.placementErrorTitle || "Placement Error", message, "error"); return;
        }
        if (!canPlaceItem(minorTargetRow, minorTargetCol, itemBaseW_minor, itemBaseH_minor, null)) {
            openAlertModal(sl.placementErrorTitle || "Placement Error", sl.placementErrorOccupiedOrOutOfBounds || "Cannot place: occupied or out of bounds.", "error"); return;
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
            if (!canPlaceItem(toMinorRow, toMinorCol, effW_minor, effH_minor, itemId)) return prev; // Silent fail if cannot place
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
        let overallValidationPassedThisCall = true;
        setLayoutSnapshotWithHistory(prev => {
            let overallValidationPassedInSnapshot = true;
            const itemIndex = prev.designItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) {
                overallValidationPassedThisCall = false; return prev;
            }
            const currentItem = { ...prev.designItems[itemIndex] };
            const itemConfig = ITEM_CONFIGS[currentItem.itemType];
            let accumulatedChanges = { ...newProps };

            // Stage 1: Dimensional/Positional Changes
            let pendingGridPosition = newProps.gridPosition ? { ...newProps.gridPosition } : { ...currentItem.gridPosition };
            let pendingWMinor = newProps.w_minor !== undefined ? parseInt(String(newProps.w_minor), 10) : currentItem.w_minor;
            let pendingHMinor = newProps.h_minor !== undefined ? parseInt(String(newProps.h_minor), 10) : currentItem.h_minor;
            const dimensionalOrPositionalChangeAttempted = newProps.gridPosition || newProps.w_minor !== undefined || newProps.h_minor !== undefined;

            if (dimensionalOrPositionalChangeAttempted) {
                if ((newProps.w_minor !== undefined && (isNaN(pendingWMinor) || pendingWMinor < MIN_ITEM_DIMENSION_MINOR_CELLS)) ||
                    (newProps.h_minor !== undefined && (isNaN(pendingHMinor) || pendingHMinor < MIN_ITEM_DIMENSION_MINOR_CELLS))) {
                    const message = interpolate(sl.dimensionErrorMinMessage || "Invalid dimensions. Min: {minCells} cell(s).", { minCells: MIN_ITEM_DIMENSION_MINOR_CELLS });
                    openAlertModal(sl.dimensionErrorTitle || "Dimension Error", message, "error");
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
                        openAlertModal(sl.placementErrorTitle || "Placement Error", sl.resizeErrorConflictOrOutOfBounds || "Resized/moved item conflicts or is out of bounds.", "error");
                        if (newProps.gridPosition) delete accumulatedChanges.gridPosition;
                        if (newProps.w_minor !== undefined) delete accumulatedChanges.w_minor;
                        if (newProps.h_minor !== undefined) delete accumulatedChanges.h_minor;
                        overallValidationPassedInSnapshot = false;
                    }
                }
            }
            // Stage 2: Rotation
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
                        if (isNaN(newRotationAngle)) { newRotationAngle = undefined; openAlertModal(sl.invalidInputTitle || "Invalid Input", sl.invalidRotationAngle || "Invalid rotation angle.", "error"); overallValidationPassedInSnapshot = false; }
                    } else {
                        openAlertModal(sl.invalidInputTitle || "Invalid Input", sl.invalidRotationType || "Invalid rotation type.", "error"); delete accumulatedChanges.rotation; newRotationAngle = undefined; overallValidationPassedInSnapshot = false;
                    }

                    if (newRotationAngle !== undefined && overallValidationPassedInSnapshot) {
                        let prospectiveWMinor = accumulatedChanges.w_minor !== undefined ? accumulatedChanges.w_minor : currentItem.w_minor;
                        let prospectiveHMinor = accumulatedChanges.h_minor !== undefined ? accumulatedChanges.h_minor : currentItem.h_minor;
                        const posToUse = accumulatedChanges.gridPosition || currentItem.gridPosition;
                        const wasEffectivelyHorizontal = currentActualRotation === 0 || currentActualRotation === 180;
                        const willBeEffectivelyHorizontal = newRotationAngle === 0 || newRotationAngle === 180;
                        let newBaseW = prospectiveWMinor; let newBaseH = prospectiveHMinor;
                        if (wasEffectivelyHorizontal !== willBeEffectivelyHorizontal) { newBaseW = prospectiveHMinor; newBaseH = prospectiveWMinor; }
                        const tempItemWithNewRotationAndAdjustedBaseDims = { ...currentItem, gridPosition: posToUse, w_minor: newBaseW, h_minor: newBaseH, rotation: newRotationAngle };
                        const { w: effW_rot, h: effH_rot } = getEffectiveDimensionsUtil(tempItemWithNewRotationAndAdjustedBaseDims);
                        if (!canPlaceItemUtil(posToUse.rowStart, posToUse.colStart, effW_rot, effH_rot, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                            openAlertModal(sl.rotationErrorTitle || "Rotation Error", sl.rotationErrorConflictOrOutOfBounds || "Cannot rotate: new orientation conflicts or out of bounds.", "error");
                            delete accumulatedChanges.rotation; overallValidationPassedInSnapshot = false;
                        } else {
                            accumulatedChanges.rotation = newRotationAngle;
                            if (wasEffectivelyHorizontal !== willBeEffectivelyHorizontal) {
                                accumulatedChanges.w_minor = newBaseW; accumulatedChanges.h_minor = newBaseH;
                            } else {
                                if (newProps.w_minor !== undefined) accumulatedChanges.w_minor = prospectiveWMinor;
                                if (newProps.h_minor !== undefined) accumulatedChanges.h_minor = prospectiveHMinor;
                            }
                        }
                    } else if (newProps.rotation !== undefined && accumulatedChanges.rotation !== undefined) { delete accumulatedChanges.rotation; }
                } else { if (newProps.rotation !== undefined) delete accumulatedChanges.rotation; }
            }
            // Stage 3 & 4: Counter Sizing
            if (overallValidationPassedInSnapshot) {
                const isCounterItem = currentItem.itemType === ItemTypes.PLACED_COUNTER || (currentItem.itemType === ItemTypes.PLACED_DECOR && currentItem.decorType?.startsWith('counter-'));
                if (isCounterItem && newProps.length_units !== undefined) {
                    const newLengthMajorUnits = parseInt(String(newProps.length_units), 10);
                    if (!isNaN(newLengthMajorUnits) && newLengthMajorUnits >= 1) {
                        const newLengthMinorUnits = newLengthMajorUnits * prev.gridSubdivision;
                        const currentRotationForCounter = accumulatedChanges.rotation !== undefined ? accumulatedChanges.rotation : currentItem.rotation;
                        const isHorizontal = currentRotationForCounter === 0 || currentRotationForCounter === 180;
                        let nonLengthBaseDimensionMinor;
                        if (newProps.rotation !== undefined && accumulatedChanges.rotation !== undefined) {
                            const wasHorizontalBeforeThisUpdate = currentItem.rotation === 0 || currentItem.rotation === 180;
                            const willBeHorizontalAfterThisUpdate = accumulatedChanges.rotation === 0 || accumulatedChanges.rotation === 180;
                            if (wasHorizontalBeforeThisUpdate !== willBeHorizontalAfterThisUpdate) {
                                nonLengthBaseDimensionMinor = isHorizontal ? currentItem.w_minor : currentItem.h_minor;
                            } else {
                                nonLengthBaseDimensionMinor = isHorizontal ? currentItem.h_minor : currentItem.w_minor;
                            }
                        } else {
                            nonLengthBaseDimensionMinor = isHorizontal ? currentItem.h_minor : currentItem.w_minor;
                        }
                        let newBaseWMinor = isHorizontal ? newLengthMinorUnits : nonLengthBaseDimensionMinor;
                        let newBaseHMinor = !isHorizontal ? newLengthMinorUnits : nonLengthBaseDimensionMinor;
                        const itemForCounterCheck = { ...currentItem, ...accumulatedChanges, w_minor: newBaseWMinor, h_minor: newBaseHMinor, rotation: currentRotationForCounter };
                        const { w: effW_counter, h: effH_counter } = getEffectiveDimensionsUtil(itemForCounterCheck);
                        const posForCounterCheck = accumulatedChanges.gridPosition || currentItem.gridPosition;
                        if (canPlaceItemUtil(posForCounterCheck.rowStart, posForCounterCheck.colStart, effW_counter, effH_counter, prev.designItems, prev.gridRows * prev.gridSubdivision, prev.gridCols * prev.gridSubdivision, itemId)) {
                            accumulatedChanges.w_minor = newBaseWMinor; accumulatedChanges.h_minor = newBaseHMinor; accumulatedChanges.length_units = newLengthMajorUnits;
                        } else {
                            openAlertModal(sl.sizingErrorTitle || "Sizing Error", sl.counterSizingErrorConflict || "Counter cannot be resized: conflicts or out of bounds.", "error");
                            delete accumulatedChanges.length_units; overallValidationPassedInSnapshot = false;
                        }
                    } else {
                        openAlertModal(sl.invalidInputTitle || "Invalid Input", sl.counterLengthPositiveError || "Counter length must be positive.", "error");
                        delete accumulatedChanges.length_units; overallValidationPassedInSnapshot = false;
                    }
                }
            }
            // Stage 5: Other property validations (table number, seats)
            if (overallValidationPassedInSnapshot && currentItem.itemType === ItemTypes.PLACED_TABLE) {
                if (newProps.number !== undefined) {
                    const newNumberStr = String(newProps.number).trim();
                    if (newNumberStr === '' || newProps.number === null) {
                        accumulatedChanges.number = null; accumulatedChanges.isProvisional = true;
                    } else {
                        const newNumber = parseInt(newNumberStr, 10);
                        if (isNaN(newNumber) || newNumber <= 0) {
                            openAlertModal(sl.invalidTableNumberTitle || "Invalid Table Number", sl.invalidTableNumberMessage || "Table number must be positive or empty.", "error");
                            delete accumulatedChanges.number; overallValidationPassedInSnapshot = false;
                        } else {
                            const isDuplicate = prev.designItems.some(it => it.id !== itemId && it.itemType === ItemTypes.PLACED_TABLE && it.number === newNumber);
                            if (isDuplicate) {
                                const message = interpolate(sl.duplicateTableNumberMessage || "Table number {number} is already in use.", { number: newNumber });
                                openAlertModal(sl.duplicateTableNumberTitle || "Duplicate Table Number", message, "error");
                                delete accumulatedChanges.number; overallValidationPassedInSnapshot = false;
                            } else {
                                accumulatedChanges.number = newNumber; accumulatedChanges.isProvisional = false;
                            }
                        }
                    }
                }
                if (newProps.seats !== undefined) {
                    const newSeatsStr = String(newProps.seats).trim();
                    if (newSeatsStr === '' || newProps.seats === null) {
                        accumulatedChanges.seats = null;
                    } else {
                        const newSeats = parseInt(newSeatsStr, 10);
                        if (isNaN(newSeats) || newSeats < 0) {
                            openAlertModal(sl.invalidSeatCountTitle || "Invalid Seat Count", sl.invalidSeatCountMessage || "Seat count must be non-negative or empty.", "error");
                            delete accumulatedChanges.seats; overallValidationPassedInSnapshot = false;
                        } else { accumulatedChanges.seats = newSeats; }
                    }
                }
            }
            // Final Step: Apply
            if (!overallValidationPassedInSnapshot) {
                overallValidationPassedThisCall = false; return prev;
            }
            let hasActualChanges = false;
            for (const key in accumulatedChanges) {
                if (key === 'gridPosition') {
                    if (JSON.stringify(accumulatedChanges.gridPosition) !== JSON.stringify(currentItem.gridPosition)) { hasActualChanges = true; break; }
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
                const message = interpolate(sl.gridDimensionErrorRange || "Grid dimensions out of range. Min/Max Rows: {minRows}-{maxRows}, Cols: {minCols}-{maxCols}.", { minRows: MIN_GRID_ROWS, maxRows: MAX_GRID_ROWS, minCols: MIN_GRID_COLS, maxCols: MAX_GRID_COLS });
                openAlertModal(sl.gridDimensionErrorTitle || "Invalid Dimension", message, "warning"); return prev;
            }
            const newTotalMinorRows = targetMajorRows * prev.gridSubdivision;
            const newTotalMinorCols = targetMajorCols * prev.gridSubdivision;
            if (((rows !== undefined && targetMajorRows < prev.gridRows) || (cols !== undefined && targetMajorCols < prev.gridCols)) &&
                !checkItemsInBoundsUtil(newTotalMinorRows, newTotalMinorCols, prev.designItems)) {
                openAlertModal(sl.gridResizeErrorOutOfBoundsTitle || "Resize Error", sl.gridResizeErrorOutOfBoundsMessage || "Cannot reduce: items out of bounds.", "error"); return prev;
            }
            return { ...prev, gridRows: targetMajorRows, gridCols: targetMajorCols };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal, checkItemsInBoundsUtil]);

    const setGridSubdivision = useCallback((newSubdivisionValue) => {
        const newSubdivision = parseInt(String(newSubdivisionValue), 10);
        if (isNaN(newSubdivision) || newSubdivision < 1) {
            openAlertModal(sl.invalidSubdivisionTitle || "Invalid Subdivision", sl.invalidSubdivisionMessage || "Grid subdivision is invalid.", "error"); return;
        }
        setLayoutSnapshotWithHistory(prev => {
            if (prev.designItems.length > 0) {
                openAlertModal(
                    sl.subdivisionChangedTitle || "Subdivision Changed",
                    sl.subdivisionChangedMessage || "Grid subdivision updated. Existing items may need manual adjustment.",
                    "info"
                );
            }
            return { ...prev, gridSubdivision: newSubdivision };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const clearAllItems = useCallback(() => {
        setLayoutSnapshotWithHistory(prev => ({
            ...prev,
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
        }));
        openAlertModal(sl.designerClearedTitle || "Designer Cleared", sl.designerClearedMessage || "All items removed.", "info");
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    const resetToDefaults = useCallback(() => {
        resetHistory({
            designItems: STABLE_EMPTY_ARRAY_DESIGN_ITEMS,
            gridRows: DEFAULT_INITIAL_GRID_ROWS,
            gridCols: DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: DEFAULT_GRID_SUBDIVISION,
        });
        openAlertModal(sl.designerResetTitle || "Designer Reset", sl.designerResetMessage || "Layout and grid reset to default.", "info");
    }, [resetHistory, openAlertModal]);


    return {
        designItems,
        gridRows, gridCols, gridSubdivision,
        undo, redo, canUndo, canRedo,
        resetLayoutHistory: resetHistory, // For VenueDesignerPage
        addItemToLayout,
        moveExistingItem,
        removeItemById,
        removeItemAtCoords,
        updateItemProperties,
        setGridDimensions,
        setGridSubdivision,
        clearAllItems,
        resetToDefaults, // Renamed from resetFullLayout
        canPlaceItem,
        getEffectiveDimensions,
    };
};

export default useLayoutDesignerStateManagement;