import { useCallback, useEffect, useMemo } from 'react'; // Added useMemo
import useHistory from './useHistory';

import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    MIN_GRID_ROWS,
    MAX_GRID_ROWS,
    MIN_GRID_COLS,
    MAX_GRID_COLS,
    ItemTypes,
    DEFAULT_GRID_SUBDIVISION, // New constant
    // AVAILABLE_SUBDIVISIONS, // Not directly used in this hook, but good to know it exists
} from '../constants/layoutConstants'; // Path to your constants file

import {
    getDefaultSeatsForSize,
    canPlaceItem as canPlaceItemUtil,
    checkItemsInBounds as checkItemsInBoundsUtil,
    getEffectiveDimensions as getEffectiveDimensionsUtil, // Renamed to avoid conflict
    getNextAvailableTableNumber,
} from '../utils/layoutUtils';

const useLayoutDesignerStateManagement = (
    initialLayoutConfig = {},
    openAlertModal = (title, message, type) => console.warn(`Alert Modal not provided: ${type} - ${title}: ${message}`)
) => {
    const {
        initialTables = [],
        initialGridRows = DEFAULT_INITIAL_GRID_ROWS,
        initialGridCols = DEFAULT_INITIAL_GRID_COLS,
        initialGridSubdivision = DEFAULT_GRID_SUBDIVISION, // New initial prop
    } = initialLayoutConfig;

    // Helper to generate default table properties, now aware of minor grid scaling for w/h
    const generateDefaultTableProps = useCallback((tableArray, partialTableData, currentSubdivision) => {
        const baseId = partialTableData.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const baseSize = partialTableData.size || 'square'; // From tool.type or item.size

        // If w_major and h_major are from tool (representing major cell span)
        // then actual w/h in minor cells needs to be calculated.
        // Let's assume PlacedItem stores its dimensions in minor cells.
        // If partialTableData comes from a tool, its w/h are in MAJOR cells.
        let widthInMinorCells = partialTableData.w; // Assume this is passed as minor cell dim if from existing item
        let heightInMinorCells = partialTableData.h; // Assume this is passed as minor cell dim if from existing item

        if (partialTableData.isFromTool) { // A flag to indicate if w/h are major cell units
            widthInMinorCells = partialTableData.w * currentSubdivision;
            heightInMinorCells = partialTableData.h * currentSubdivision;
        }

        return {
            id: baseId,
            itemType: ItemTypes.PLACED_TABLE,
            number: partialTableData.number || getNextAvailableTableNumber(tableArray.filter(t => t.id !== baseId)),
            size: baseSize, // e.g., 'square', 'rectangle' - refers to the tool type for visual rendering
            seats: partialTableData.seats !== undefined ? partialTableData.seats : getDefaultSeatsForSize(baseSize),
            rotation: partialTableData.rotation || 0,
            // gridPosition is always in MINOR cell coordinates
            gridPosition: partialTableData.gridPosition || { rowStart: 1, colStart: 1 },
            // Store intrinsic dimensions in MINOR cells.
            // These are the dimensions based on the tool's definition and current subdivision at time of placement.
            // Rotation will swap these in getEffectiveDimensions.
            w: widthInMinorCells,  // Width in minor cells
            h: heightInMinorCells, // Height in minor cells
            ...partialTableData,
            isFromTool: undefined, // Clear the flag
        };
    }, []);


    const parseAndPrepareInitialTables = useCallback((tablesToParse, subdivision) => {
        let processedTables = [];
        tablesToParse.forEach(table => {
            // When parsing initial tables, they might already have w/h in minor cells OR major cells.
            // This needs a clear contract. Let's assume initialTables prop provides w/h in MAJOR cells if not specified.
            // Or better, ensure initialTables (from storage) *always* store w/h in MINOR cells relative to the subdivision they were saved with.
            // For now, let's assume initialTables from `currentLayout` might have `w_major`, `h_major`
            // and `saved_subdivision` to correctly parse them.
            // Simpler: Assume w,h in initialTables are already in minor cells for *their* saved subdivision.
            // If subdivision changes, these might need re-evaluation (complex).
            // For this iteration, let's assume w,h in initialTables are what they should be.
            const tableDataForProps = { ...table };
            if (table.w_major && table.h_major && subdivision) { // If initial data uses major cell units
                tableDataForProps.w = table.w_major * subdivision;
                tableDataForProps.h = table.h_major * subdivision;
                delete tableDataForProps.w_major;
                delete tableDataForProps.h_major;
            }
            processedTables.push(generateDefaultTableProps(processedTables, tableDataForProps, subdivision));
        });
        return processedTables.map(table => ({
            ...table,
            number: processedTables.filter(t => t.id !== table.id && t.number === table.number).length > 0
                ? getNextAvailableTableNumber(processedTables.filter(t => t.id !== table.id))
                : table.number,
        }));
    }, [generateDefaultTableProps]);

    const initialSnapshot = useMemo(() => ({
        designedTables: parseAndPrepareInitialTables(initialTables, initialGridSubdivision),
        gridRows: initialGridRows, // Major grid rows
        gridCols: initialGridCols, // Major grid cols
        gridSubdivision: initialGridSubdivision,
    }), [initialTables, initialGridRows, initialGridCols, initialGridSubdivision, parseAndPrepareInitialTables]);

    const {
        state: layoutSnapshot,
        setState: setLayoutSnapshotWithHistory,
        undo,
        redo,
        canUndo,
        canRedo,
        resetHistory,
    } = useHistory(initialSnapshot);

    const { designedTables, gridRows, gridCols, gridSubdivision } = layoutSnapshot;

    useEffect(() => {
        const newSnapshot = {
            designedTables: parseAndPrepareInitialTables(
                initialLayoutConfig.initialTables || [],
                initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION
            ),
            gridRows: initialLayoutConfig.initialGridRows || DEFAULT_INITIAL_GRID_ROWS,
            gridCols: initialLayoutConfig.initialGridCols || DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION,
        };
        resetHistory(newSnapshot);
    }, [
        initialLayoutConfig.initialTables,
        initialLayoutConfig.initialGridRows,
        initialLayoutConfig.initialGridCols,
        initialLayoutConfig.initialGridSubdivision,
        resetHistory,
        parseAndPrepareInitialTables
    ]);

    const getEffectiveDimensions = useCallback((item) => {
        // Uses getEffectiveDimensionsUtil which should now primarily care about rotation
        // as item.w and item.h are already in minor cells.
        return getEffectiveDimensionsUtil(item); // Pass item directly
    }, []);

    const canPlaceItem = useCallback((minorRow, minorCol, itemW_minor, itemH_minor, itemToExcludeId = null) => {
        const totalMinorRows = gridRows * gridSubdivision;
        const totalMinorCols = gridCols * gridSubdivision;
        return canPlaceItemUtil(
            minorRow, minorCol,
            itemW_minor, itemH_minor,
            designedTables,
            totalMinorRows, totalMinorCols, // Pass total minor dimensions
            itemToExcludeId,
            getEffectiveDimensions // Pass the local getEffectiveDimensions
        );
    }, [designedTables, gridRows, gridCols, gridSubdivision, getEffectiveDimensions]);

    const addItemToLayout = useCallback((itemFromTool, minorTargetRow, minorTargetCol, itemTypeFromTool) => {
        // itemFromTool: { type (tool.type/size), w (major), h (major) }
        const majorCellW = itemFromTool.w;
        const majorCellH = itemFromTool.h;

        const itemW_minor = majorCellW * gridSubdivision;
        const itemH_minor = majorCellH * gridSubdivision;

        if (!canPlaceItem(minorTargetRow, minorTargetCol, itemW_minor, itemH_minor, null)) {
            openAlertModal("Placement Error", `Cannot place ${itemFromTool.size || 'item'}: space occupied or out of bounds.`, "error");
            return;
        }

        setLayoutSnapshotWithHistory(prev => {
            if (itemTypeFromTool === ItemTypes.TABLE_TOOL) {
                const newItem = generateDefaultTableProps(
                    prev.designedTables,
                    {
                        size: itemFromTool.size, // Tool's 'type' or 'size' identifier
                        gridPosition: { rowStart: minorTargetRow, colStart: minorTargetCol },
                        w: itemW_minor, // Store dimensions in minor cells
                        h: itemH_minor, // Store dimensions in minor cells
                        // No 'isFromTool' needed here as generateDefaultTableProps handles it
                    },
                    prev.gridSubdivision // Pass current subdivision for context if needed by generateDefault
                );
                return { ...prev, designedTables: [...prev.designedTables, newItem] };
            }
            return prev;
        });
    }, [canPlaceItem, gridSubdivision, setLayoutSnapshotWithHistory, openAlertModal, generateDefaultTableProps]);

    const moveExistingItem = useCallback((itemId, toMinorRow, toMinorCol) => {
        setLayoutSnapshotWithHistory(prev => {
            const itemToMove = prev.designedTables.find(t => t.id === itemId);
            if (!itemToMove) return prev;

            // Effective dimensions are already in minor cells because item.w/h are stored in minor cells.
            const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(itemToMove);

            if (!canPlaceItem(toMinorRow, toMinorCol, effW_minor, effH_minor, itemId)) {
                return prev;
            }
            return {
                ...prev,
                designedTables: prev.designedTables.map(t =>
                    t.id === itemId ? { ...t, gridPosition: { rowStart: toMinorRow, colStart: toMinorCol } } : t
                ),
            };
        });
    }, [canPlaceItem, setLayoutSnapshotWithHistory, getEffectiveDimensions]);


    const removeItemAtCoords = useCallback((minorRowClicked, minorColClicked) => {
        setLayoutSnapshotWithHistory(prev => {
            const itemToRemove = prev.designedTables.find(t => {
                if (!t || !t.gridPosition) return false;
                const { w: itemW_minor, h: itemH_minor } = getEffectiveDimensions(t); // Already minor
                return minorRowClicked >= t.gridPosition.rowStart &&
                       minorRowClicked < t.gridPosition.rowStart + itemH_minor &&
                       minorColClicked >= t.gridPosition.colStart &&
                       minorColClicked < t.gridPosition.colStart + itemW_minor;
            });

            if (itemToRemove) {
                return {
                    ...prev,
                    designedTables: prev.designedTables.filter(t => t.id !== itemToRemove.id),
                };
            }
            return prev;
        });
    }, [setLayoutSnapshotWithHistory, getEffectiveDimensions]);


    const updateTableProperties = useCallback((tableId, { number, seats, rotation }) => {
        // rotation is a boolean flag indicating a desire to rotate
        let validationPassed = true;
        setLayoutSnapshotWithHistory(prev => {
            const currentTable = prev.designedTables.find(t => t.id === tableId);
            if (!currentTable) return prev;

            const updatedProps = {};
            if (number !== undefined) { /* ... (same number validation logic) ... */
                const newNumberNum = parseInt(number, 10);
                if (isNaN(newNumberNum) || newNumberNum <= 0) {
                    openAlertModal("Invalid Input", "Table number must be a positive integer.", "error");
                    validationPassed = false;
                } else if (prev.designedTables.some(t => t.id !== tableId && t.number === newNumberNum)) {
                    openAlertModal("Duplicate Number", `Table number ${newNumberNum} is already in use.`, "warning");
                    validationPassed = false;
                } else {
                    updatedProps.number = newNumberNum;
                }
            }
            if (seats !== undefined) { /* ... (same seats validation logic) ... */
                const newSeatsNum = parseInt(seats, 10);
                if (isNaN(newSeatsNum) || newSeatsNum < 0) {
                    openAlertModal("Invalid Input", "Number of seats must be a non-negative integer.", "error");
                    validationPassed = false;
                } else {
                    updatedProps.seats = newSeatsNum;
                }
            }

            if (rotation === true) { // If rotation is requested
                const newRotationValue = currentTable.rotation === 0 ? 90 : 0;
                const tentativeRotatedTable = { ...currentTable, ...updatedProps, rotation: newRotationValue };
                const { w: effW_minor, h: effH_minor } = getEffectiveDimensions(tentativeRotatedTable); // Already minor

                const totalMinorRows = prev.gridRows * prev.gridSubdivision;
                const totalMinorCols = prev.gridCols * prev.gridSubdivision;

                if (!canPlaceItemUtil(
                    currentTable.gridPosition.rowStart, currentTable.gridPosition.colStart,
                    effW_minor, effH_minor,
                    prev.designedTables,
                    totalMinorRows, totalMinorCols,
                    tableId,
                    getEffectiveDimensions // Pass the utility
                )) {
                    openAlertModal("Rotation Error", "Cannot rotate table: new orientation conflicts or out of bounds.", "error");
                    validationPassed = false;
                } else {
                    updatedProps.rotation = newRotationValue;
                }
            }

            if (!validationPassed || Object.keys(updatedProps).length === 0) return prev;

            return {
                ...prev,
                designedTables: prev.designedTables.map(t =>
                    t.id === tableId ? { ...t, ...updatedProps } : t
                ),
            };
        });
        return validationPassed;
    }, [setLayoutSnapshotWithHistory, openAlertModal, getEffectiveDimensions]);


    const setGridDimensions = useCallback(({ rows: newMajorRows, cols: newMajorCols }) => {
        // rows and cols here refer to MAJOR grid dimensions
        setLayoutSnapshotWithHistory(prev => {
            const targetMajorRows = newMajorRows !== undefined ? parseInt(newMajorRows, 10) : prev.gridRows;
            const targetMajorCols = newMajorCols !== undefined ? parseInt(newMajorCols, 10) : prev.gridCols;
            // ... (validation for MIN/MAX major rows/cols remains the same) ...
            if (newMajorRows !== undefined && (isNaN(targetMajorRows) || targetMajorRows < MIN_GRID_ROWS || targetMajorRows > MAX_GRID_ROWS)) {
                 openAlertModal("Invalid Dimension", `Rows must be between ${MIN_GRID_ROWS} and ${MAX_GRID_ROWS}.`, "warning"); return prev;
            }
            if (newMajorCols !== undefined && (isNaN(targetMajorCols) || targetMajorCols < MIN_GRID_COLS || targetMajorCols > MAX_GRID_COLS)) {
                 openAlertModal("Invalid Dimension", `Cols must be between ${MIN_GRID_COLS} and ${MAX_GRID_COLS}.`, "warning"); return prev;
            }

            // Check bounds against total MINOR dimensions
            const totalNewMinorRows = targetMajorRows * prev.gridSubdivision;
            const totalNewMinorCols = targetMajorCols * prev.gridSubdivision;

            if (
                (newMajorRows !== undefined && targetMajorRows < prev.gridRows && !checkItemsInBoundsUtil(totalNewMinorRows, prev.gridCols * prev.gridSubdivision, prev.designedTables, getEffectiveDimensions)) ||
                (newMajorCols !== undefined && targetMajorCols < prev.gridCols && !checkItemsInBoundsUtil(prev.gridRows * prev.gridSubdivision, totalNewMinorCols, prev.designedTables, getEffectiveDimensions))
            ) {
                openAlertModal("Resize Error", "Cannot reduce dimensions. Items would be out of bounds.", "error");
                return prev;
            }
            return { ...prev, gridRows: targetMajorRows, gridCols: targetMajorCols };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal, getEffectiveDimensions]);


    const setGridSubdivision = useCallback((newSubdivisionValue) => {
        const newSubdivision = parseInt(newSubdivisionValue, 10);
        if (isNaN(newSubdivision) || newSubdivision < 1) { // Basic validation
            openAlertModal("Invalid Subdivision", "Grid subdivision level is invalid.", "error");
            return;
        }

        setLayoutSnapshotWithHistory(prev => {
            // **CRITICAL DECISION POINT: How to handle existing items?**
            // Option 1: Clear items (simplest for now)
            if (prev.designedTables.length > 0) {
                openAlertModal("Layout Cleared", "Changing grid subdivision has cleared existing items.", "info");
            }
            // Option 2: Try to convert (very complex, requires items to store their original major cell span)
            // For now, let's go with clearing.
            return {
                ...prev,
                gridSubdivision: newSubdivision,
                designedTables: [], // Clear tables when subdivision changes
            };
        });
    }, [setLayoutSnapshotWithHistory, openAlertModal]);

    // removeItemById and clearFullLayout remain largely the same logic,
    // just ensure they operate on the correct item arrays.
    const removeItemById = useCallback((itemId) => {
        setLayoutSnapshotWithHistory(prev => ({
            ...prev,
            designedTables: prev.designedTables.filter(t => t.id !== itemId),
        }));
    }, [setLayoutSnapshotWithHistory]);

    const clearFullLayout = useCallback(() => {
        const clearedSnapshot = {
            designedTables: [],
            gridRows: DEFAULT_INITIAL_GRID_ROWS,
            gridCols: DEFAULT_INITIAL_GRID_COLS,
            gridSubdivision: DEFAULT_GRID_SUBDIVISION,
        };
        resetHistory(clearedSnapshot);
        openAlertModal("Cleared", "Designer canvas has been cleared and grid reset.", "info");
    }, [resetHistory, openAlertModal]);


    return {
        designedTables,
        gridRows, // Major grid rows
        gridCols, // Major grid cols
        gridSubdivision,

        undo, redo, canUndo, canRedo,
        resetLayoutHistory: resetHistory,

        addItemToLayout,
        moveExistingItem,
        removeItemById,
        removeItemAtCoords,
        updateTableProperties,
        setGridDimensions, // For major grid
        setGridSubdivision,
        clearFullLayout,

        canPlaceItem, // Operates on minor grid coordinates
        getEffectiveDimensions, // Returns dimensions in minor cells
    };
};

export default useLayoutDesignerStateManagement;