import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

import Icon from '../../../../components/common/Icon'; // Adjusted path
import Modal from '../../../../components/animated_alerts/Modal.jsx';

import DraggableGenericTool from './DraggableGenericTool';
import PlacedItem from './PlacedItem';
import DroppableGridCell from './DroppableGridCell';

import useQrCodeManager from '../../hooks/useQrCodeManager.js';
import useHistory from '../../hooks/useHistory'; // New Hook

import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    MIN_GRID_ROWS,
    MAX_GRID_ROWS,
    MIN_GRID_COLS,
    MAX_GRID_COLS,
    CELL_SIZE_REM,
    ItemTypes,
    tableToolsConfig,
    obstacleToolsConfig, // Added
    // kitchenToolConfig, // Not directly used as a draggable tool in the same way
} from '../../utils/layoutConstants.jsx';

import {
    getDefaultSeatsForSize,
    getToolConfigByType,
    canPlaceItem as canPlaceItemUtil,
    checkItemsInBounds as checkItemsInBoundsUtil,
    getEffectiveDimensions, // Added
    getNextAvailableTableNumber,
} from '../../utils/layoutUtils.js';
import { constructQrDataValue } from '../../utils/commonUtils.js';
// commonUtils like constructQrDataValue and downloadBlob are now used within useQrCodeManager

const LayoutDesigner = ({
    currentLayout, // existing tables, if any
    initialGridRows = DEFAULT_INITIAL_GRID_ROWS,
    initialGridCols = DEFAULT_INITIAL_GRID_COLS,
    onSaveLayout,
    onCancel
}) => {
    // State managed by useHistory for Undo/Redo
    const {
        state: layoutSnapshot,
        setState: setLayoutSnapshot, // Renamed for clarity
        undo,
        redo,
        canUndo,
        canRedo,
        resetHistory: resetLayoutHistory
    } = useHistory({
        designedTables: [],
        gridRows: initialGridRows,
        gridCols: initialGridCols,
    });

    const { designedTables, designedObstacles, gridRows, gridCols, definedKitchenArea } = layoutSnapshot;

    const [isDefiningKitchen, setIsDefiningKitchen] = useState(false);
    const [kitchenCorner1, setKitchenCorner1] = useState(null);

    const [isEraserActive, setIsEraserActive] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    const [draggedItemPreview, setDraggedItemPreview] = useState(null); // { r, c, w, h, isValid }

    const openAlertModal = useCallback((title, message, type = 'info') => {
        if (isAlertModalOpen && alertModalContent.title === title && alertModalContent.message === message && type === 'error') return;
        setAlertModalContent({ title, message, type });
        setIsAlertModalOpen(true);
    }, [isAlertModalOpen, alertModalContent.title, alertModalContent.message]);

    const closeAlertModal = useCallback(() => setIsAlertModalOpen(false), []);

    const {
        fetchQrCodeForTable,
        downloadSingleQr,
        downloadAllQrs,
        clearQrDataForTable,
        clearAllQrData,
        getQrStatus,
    } = useQrCodeManager(openAlertModal);

    const parseInitialTables = (layout) => layout.map(table => ({
        ...table,
        id: table.id || `generated_id_${Math.random().toString(36).substr(2, 9)}`,
        itemType: ItemTypes.PLACED_TABLE,
        number: table.number || getNextAvailableTableNumber(layout.filter(t => t.id !== table.id)),
        size: table.size || 'square',
        seats: table.seats !== undefined ? table.seats : getDefaultSeatsForSize(table.size),
        rotation: table.rotation || 0,
    }));

    useEffect(() => {
        const initialTablesParsed = currentLayout?.length ? parseInitialTables(currentLayout) : [];
        // Number re-assignment logic (simplified for brevity, original was more complex)
        const finalTables = initialTablesParsed.map((table, index, arr) => ({
            ...table,
            number: table.number === 0 || arr.find(t => t.id !== table.id && t.number === table.number)
                ? getNextAvailableTableNumber(arr.filter(t => t.id !== table.id))
                : table.number
        }));


        resetLayoutHistory({
            designedTables: finalTables,
            gridRows: initialGridRows,
            gridCols: initialGridCols,
        });
    }, [currentLayout, initialGridRows, initialGridCols, resetLayoutHistory]);

    useEffect(() => {
        designedTables.filter(t => t && t.id).forEach(table => {
            const status = getQrStatus(table.id);
            if (!status.url && !status.loading && status.url !== 'error') {
                fetchQrCodeForTable(table, "red", "blue");
            }
        });
    }, [designedTables, fetchQrCodeForTable, getQrStatus]);

    const updateDraggedItemPreviewCallback = useCallback((previewData) => {
        setDraggedItemPreview(previewData);
    }, []);

    const canPlaceItemAtCoords = useCallback((row, col, itemW, itemH, itemToExcludeId = null) => {
        return canPlaceItemUtil(row, col, itemW, itemH, designedTables, gridRows, gridCols, itemToExcludeId);
    }, [designedTables, gridRows, gridCols]);

    const canPlaceItem = useCallback((row, col, w, h, itemToExcludeId = null, itemTypeBeingPlaced = ItemTypes.PLACED_TABLE) => {
        return canPlaceItemUtil(row, col, w, h, designedTables, designedObstacles, definedKitchenArea, gridRows, gridCols, itemToExcludeId, itemTypeBeingPlaced);
    }, [designedTables, designedObstacles, definedKitchenArea, gridRows, gridCols]);

    const addItem = useCallback((itemFromTool, row, col, itemTypeFromTool) => { // itemTypeFromTool is ItemTypes.TABLE_TOOL
        // itemFromTool: { type (tool.type), w, h, size }
        const { w, h, size: toolSizeIdentifier } = itemFromTool;

        if (!canPlaceItemAtCoords(row, col, w, h, null)) {
            openAlertModal("Placement Error", `Cannot place ${toolSizeIdentifier}: space occupied or out of bounds.`, "error");
            return;
        }
        setLayoutSnapshot(prev => {
            const newTableNumber = getNextAvailableTableNumber(prev.designedTables);
            const newItem = {
                id: `table_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                itemType: ItemTypes.PLACED_TABLE,
                number: newTableNumber,
                gridPosition: { rowStart: row, colStart: col },
                size: toolSizeIdentifier, // e.g., 'square', 'rectangle'
                seats: getDefaultSeatsForSize(toolSizeIdentifier),
                rotation: 0, // New items are not rotated
            };
            return { ...prev, designedTables: [...prev.designedTables, newItem] };
        });
    }, [canPlaceItemAtCoords, setLayoutSnapshot, openAlertModal]);

    const moveItem = useCallback((itemId, toRow, toCol) => { // Renamed from moveTable
        const itemToMove = designedTables.find(t => t.id === itemId);
        if (!itemToMove) return;

        const { w: effectiveW, h: effectiveH } = getEffectiveDimensions(itemToMove);

        if (!canPlaceItemAtCoords(toRow, toCol, effectiveW, effectiveH, itemId)) {
            // openAlertModal("Placement Error", "Cannot move item: space occupied or out of bounds.", "error"); // Can be too noisy for drag
            return;
        }
        setLayoutSnapshot(prev => ({
            ...prev,
            designedTables: prev.designedTables.map(t =>
                t.id === itemId ? { ...t, gridPosition: { ...t.gridPosition, rowStart: toRow, colStart: toCol } } : t
            )
        }));
    }, [designedTables, canPlaceItemAtCoords, setLayoutSnapshot]);

    const eraseDesignerItem = useCallback((idOrRow, colCoordinate) => {
        if (!isEraserActive) return;
        let itemIdToRemove = null;

        if (typeof idOrRow === 'string' && colCoordinate === undefined) { // Erasing a specific item by ID (from PlacedItem click)
            itemIdToRemove = idOrRow;
        } else if (typeof idOrRow === 'number' && typeof colCoordinate === 'number') { // Erasing by clicking a cell
            const rowClicked = idOrRow;
            const colClicked = colCoordinate;

            const item = designedTables.find(t => {
                if (!t || !t.gridPosition) return false;
                const { w: itemW, h: itemH } = getEffectiveDimensions(t);
                return rowClicked >= t.gridPosition.rowStart && rowClicked < t.gridPosition.rowStart + itemH &&
                    colClicked >= t.gridPosition.colStart && colClicked < t.gridPosition.colStart + itemW;
            });
            if (item) itemIdToRemove = item.id;
        }

        if (itemIdToRemove) {
            setLayoutSnapshot(prev => ({
                ...prev,
                designedTables: prev.designedTables.filter(t => t.id !== itemIdToRemove),
            }));
            clearQrDataForTable(itemIdToRemove);
        }
    }, [isEraserActive, designedTables, clearQrDataForTable, setLayoutSnapshot]);

    const handleUpdateTableNumber = useCallback((tableId, newNumberString) => {
        const newNumber = parseInt(newNumberString, 10);
        if (isNaN(newNumber) || newNumber <= 0) {
            openAlertModal("Invalid Input", "Table number must be a positive integer.", "error"); return false;
        }
        if (designedTables.some(t => t.id !== tableId && t.number === newNumber)) {
            openAlertModal("Duplicate Number", `Table number ${newNumber} is already in use.`, "warning"); return false;
        }
        setLayoutSnapshot(prev => ({
            ...prev,
            designedTables: prev.designedTables.map(t => {
                if (t.id === tableId) {
                    const updatedTable = { ...t, number: newNumber };
                    fetchQrCodeForTable(updatedTable, "red", "blue");
                    return updatedTable;
                }
                return t;
            })
        }));
        return true;
    }, [openAlertModal, designedTables, fetchQrCodeForTable, setLayoutSnapshot]);

    const handleRotateTable = useCallback((tableId) => {
        setLayoutSnapshot(prev => {
            const tableToRotate = prev.designedTables.find(t => t.id === tableId);
            if (!tableToRotate) return prev;

            const newRotation = tableToRotate.rotation === 0 ? 90 : 0;
            const tentativeRotatedTable = { ...tableToRotate, rotation: newRotation };
            const { w: effW, h: effH } = getEffectiveDimensions(tentativeRotatedTable);

            // Check if it can be placed in its *current* position with the *new* rotation
            if (!canPlaceItemUtil(tableToRotate.gridPosition.rowStart, tableToRotate.gridPosition.colStart, effW, effH, prev.designedTables, prev.gridRows, prev.gridCols, tableId)) {
                openAlertModal("Rotation Error", "Cannot rotate table: new orientation conflicts with other items or boundaries.", "error");
                return prev;
            }

            // If QR needs update on rotation because effective dimensions change QR data (unlikely for this app)
            // fetchQrCodeForTable(tentativeRotatedTable, "red", "blue");

            return {
                ...prev,
                designedTables: prev.designedTables.map(t =>
                    t.id === tableId ? tentativeRotatedTable : t
                )
            };
        });
    }, [setLayoutSnapshot, openAlertModal]);


    const handleUpdateTableSeats = useCallback((tableId, newSeatsString) => {
        const newSeats = parseInt(newSeatsString, 10);
        if (isNaN(newSeats) || newSeats < 0) {
            openAlertModal("Invalid Input", "Number of seats must be a non-negative integer.", "error"); return false;
        }
        setLayoutSnapshot(prev => ({
            ...prev,
            designedTables: prev.designedTables.map(t => {
                if (t.id === tableId) {
                    const updatedTable = { ...t, seats: newSeats };
                    fetchQrCodeForTable(updatedTable, "red", "blue");
                    return updatedTable;
                }
                return t;
            })
        }));
        return true;
    }, [openAlertModal, fetchQrCodeForTable, setLayoutSnapshot]);

    const handleSave = useCallback(() => {
        // Validation logic remains similar...
        const validTables = designedTables.filter(t => t && typeof t.number === 'number' && t.number > 0);
        const numbers = validTables.map(t => t.number);
        const uniqueNumbers = new Set(numbers);
        if (numbers.length !== uniqueNumbers.size || validTables.length !== designedTables.length) {
            openAlertModal("Validation Error", "Ensure all tables have unique, positive numbers.", "error"); return;
        }
        const layoutToSave = {
            tables: JSON.parse(JSON.stringify(validTables)),
            // obstacles: JSON.parse(JSON.stringify(designedObstacles)), // Removed
            gridDimensions: { rows: gridRows, cols: gridCols },
            // kitchenArea: definedKitchenArea ? JSON.parse(JSON.stringify(definedKitchenArea)) : null, // Removed
        };
        onSaveLayout(layoutToSave);
    }, [designedTables, gridRows, gridCols, onSaveLayout, openAlertModal]);

    const handleGridDimensionChange = useCallback((dim, valueStr) => {
        const newValue = parseInt(valueStr, 10);
        const MIN = dim === 'rows' ? MIN_GRID_ROWS : MIN_GRID_COLS;
        const MAX = dim === 'rows' ? MAX_GRID_ROWS : MAX_GRID_COLS;
        const currentDimValue = dim === 'rows' ? gridRows : gridCols;

        if (isNaN(newValue) || newValue < MIN || newValue > MAX) {
            openAlertModal("Invalid Dimension", `${dim.charAt(0).toUpperCase() + dim.slice(1)} must be between ${MIN} and ${MAX}.`, "warning");
            return;
        }
        const newRows = dim === 'rows' ? newValue : gridRows;
        const newCols = dim === 'cols' ? newValue : gridCols;

        if (newValue < currentDimValue && !checkItemsInBoundsUtil(newRows, newCols, designedTables)) { // Simplified checkItemsInBoundsUtil call
            openAlertModal("Resize Error", `Cannot reduce ${dim}. Tables would be out of bounds.`, "error");
            return;
        }
        setLayoutSnapshot(prev => ({
            ...prev,
            gridRows: dim === 'rows' ? newValue : prev.gridRows,
            gridCols: dim === 'cols' ? newValue : prev.gridCols,
        }));
    }, [openAlertModal, gridRows, gridCols, designedTables, setLayoutSnapshot]);

    const handleDefineKitchenArea = useCallback(() => {
        if (isDefiningKitchen) {
            setIsDefiningKitchen(false);
            setKitchenCorner1(null);
        } else {
            setIsDefiningKitchen(true);
            setKitchenCorner1(null);
            setLayoutSnapshot(prev => ({ ...prev, definedKitchenArea: null })); // Clear existing kitchen when starting to define new
            setIsEraserActive(false); // Ensure eraser is off
        }
    }, [isDefiningKitchen, setLayoutSnapshot]);

    const handleCellClickForKitchen = useCallback((r, c) => {
        if (!isDefiningKitchen || isEraserActive) {
            setIsDefiningKitchen(false);
            setKitchenCorner1(null);
            return;
        }

        if (!kitchenCorner1) {
            setKitchenCorner1({ r, c });
        } else {
            const rowStart = Math.min(kitchenCorner1.r, r);
            const colStart = Math.min(kitchenCorner1.c, c);
            const rowEnd = Math.max(kitchenCorner1.r, r);
            const colEnd = Math.max(kitchenCorner1.c, c);
            const newKitchenDef = { rowStart, colStart, rowEnd, colEnd };

            // Check for overlap with existing items
            for (let i = rowStart; i <= rowEnd; i++) {
                for (let j = colStart; j <= colEnd; j++) {
                    // Using canPlaceItemUtil directly as we are checking for any item in general
                    if (canPlaceItemUtil(i, j, 1, 1, designedTables, designedObstacles, null, gridRows, gridCols, null, ItemTypes.PLACED_KITCHEN) === false) {
                        openAlertModal("Placement Error", "Kitchen area cannot overlap with existing items.", "error");
                        setKitchenCorner1(null); // Reset selection
                        setIsDefiningKitchen(true); // Keep in defining mode
                        return;
                    }
                }
            }
            setLayoutSnapshot(prev => ({ ...prev, definedKitchenArea: newKitchenDef }));
            setIsDefiningKitchen(false);
            setKitchenCorner1(null);
        }
    }, [isDefiningKitchen, isEraserActive, kitchenCorner1, designedTables, designedObstacles, gridRows, gridCols, openAlertModal, setLayoutSnapshot]);

    const handleClearAll = () => {
        resetLayoutHistory({
            designedTables: [],
            gridRows: DEFAULT_INITIAL_GRID_ROWS,
            gridCols: DEFAULT_INITIAL_GRID_COLS,
        });
        setIsEraserActive(false);
        clearAllQrData();
        if (openAlertModal) openAlertModal("Cleared", "Designer canvas has been cleared and grid reset.", "info");
    };

    const toolsSection = (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center sm:text-left">Tools</h3>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                {tableToolsConfig.map(tool => <DraggableGenericTool key={tool.type} tool={tool} itemType={ItemTypes.TABLE_TOOL} />)}
                {/* Obstacle and Kitchen tools removed */}
                <div className="border-l border-gray-300 h-10 mx-1 hidden sm:block"></div>
                <button onClick={() => setIsEraserActive(!isEraserActive)} className={`p-3 border rounded-xl flex flex-col items-center shadow transition-colors duration-150 ${isEraserActive ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-400' : 'bg-white hover:bg-gray-100 text-gray-600'}`} title={isEraserActive ? "Eraser Active" : "Activate Eraser"}>
                    <Icon name="ink_eraser" className="w-6 h-6 text-gray-500" /> <span className="text-xs mt-1">{isEraserActive ? 'Active' : 'Eraser'}</span>
                </button>
                <div className="border-l border-gray-300 h-10 mx-1 hidden sm:block"></div>
                <button onClick={undo} disabled={!canUndo} className="p-2 border rounded-md shadow bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" title="Undo"><Icon name="undo" className="w-5 h-5 text-gray-600" /></button>
                <button onClick={redo} disabled={!canRedo} className="p-2 border rounded-md shadow bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" title="Redo"><Icon name="redo" className="w-5 h-5 text-gray-600" /></button>
            </div>
        </div>
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-screen font-sans">
                <aside className="w-80 bg-slate-100 border-r border-slate-300 flex flex-col shadow-lg fixed top-0 left-0 h-full z-20">
                    <div className="p-4 border-b border-slate-300">
                        <h3 className="text-xl font-semibold text-indigo-700 tracking-tight">Table Properties</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {designedTables.filter(t => t && t.id).length === 0 ? (
                            <p className="text-sm text-gray-500 text-center mt-4">No tables placed on the grid yet.</p>
                        ) : (
                             designedTables.filter(t => t && t.id)
                                 .sort((a, b) => (a.number || Infinity) - (b.number || Infinity))
                                 .map(table => {
                                     const qrStatus = getQrStatus(table.id);
                                     // const qrDataStr = qrStatus.url !== 'error' ? constructQrDataValue(table) : 'Error generating data';

                                     return (
                                         <div key={table.id} className="p-3 bg-white rounded-lg shadow border border-slate-200">
                                             <h4 className="font-semibold text-indigo-600 mb-2">Table {table.number ?? 'N/A'} <span className="text-xs text-gray-500">({table.size ?? 'N/A'})</span></h4>
                                             <div className="mb-2">
                                                 <label htmlFor={`seats-${table.id}`} className="block text-xs font-medium text-gray-700 mb-1">Seats:</label>
                                                 <input
                                                     type="number" id={`seats-${table.id}`} min="0"
                                                     value={table.seats ?? ''}
                                                     onChange={(e) => handleUpdateTableSeats(table.id, e.target.value)}
                                                     className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                 />
                                             </div>
                                             <div>
                                                 <label className="block text-xs font-medium text-gray-700 mb-1">QR Code:</label>
                                                 <div className="flex items-center space-x-2">
                                                     <div className="p-1 border border-gray-300 rounded-md inline-block bg-white w-24 h-24 flex items-center justify-center">
                                                         {qrStatus.loading && <span className="text-xs text-gray-500">Loading...</span>}
                                                         {!qrStatus.loading && qrStatus.url && qrStatus.url !== 'error' && (
                                                             <img src={qrStatus.url} alt={`QR Code for Table ${table.number ?? 'N/A'}`} className="max-w-full max-h-full" />
                                                         )}
                                                         {!qrStatus.loading && (qrStatus.url === 'error' || !qrStatus.url) && <span className="text-xs text-red-500">Error/None</span>}
                                                     </div>
                                                     <button
                                                         onClick={() => downloadSingleQr(table)}
                                                         title={`Download QR for Table ${table.number ?? 'N/A'}`}
                                                         className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                                                         disabled={qrStatus.loading || !qrStatus.url || qrStatus.url === 'error'}
                                                     >
                                                         <Icon name="download" className="w-4 h-4" />
                                                     </button>
                                                 </div>
                                             </div>
                                         </div>
                                     );
                                 })
                         )}
                     </div>
                     <div className="p-4 border-t border-slate-300 mt-auto">
                         <button    
                             onClick={() => downloadAllQrs(designedTables)}
                             disabled={designedTables.filter(t => t && t.id).length === 0}
                             className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md flex items-center justify-center text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed">
                             <Icon name="qr_code_scanner" className="w-5 h-5 mr-2" /> Download All QR Codes
                         </button>
                     </div>
                </aside>

                <main className="flex-1 overflow-auto ml-80"> {/* Ensure ml-80 matches sidebar width */}
                    <div className="p-6 min-h-full bg-gradient-to-tr from-indigo-50 via-white to-pink-50">
                        <h2 className="text-4xl font-bold text-indigo-700 mb-8 text-center tracking-tight">Layout Designer</h2>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} className="mb-8 p-6 bg-white rounded-xl shadow-lg">
                            <div className="mb-6 pb-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center sm:text-left">Grid Dimensions</h3>
                                <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-4 sm:gap-6">
                                    <div className="flex items-center space-x-2"><label htmlFor="gridRows" className="text-sm font-medium text-gray-600">Rows:</label><input type="number" id="gridRows" name="gridRows" value={gridRows} onChange={(e) => handleGridDimensionChange('rows', e.target.value)} min={MIN_GRID_ROWS} max={MAX_GRID_ROWS} className="w-20 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
                                    <div className="flex items-center space-x-2"><label htmlFor="gridCols" className="text-sm font-medium text-gray-600">Cols:</label><input type="number" id="gridCols" name="gridCols" value={gridCols} onChange={(e) => handleGridDimensionChange('cols', e.target.value)} min={MIN_GRID_COLS} max={MAX_GRID_COLS} className="w-20 p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
                                </div>
                            </div>
                            {toolsSection}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="mx-auto bg-gray-50 rounded-xl shadow-xl relative overflow-hidden border border-gray-300"
                            style={{
                                display: 'grid',
                                gridTemplateRows: `repeat(${gridRows}, ${CELL_SIZE_REM}rem)`,
                                gridTemplateColumns: `repeat(${gridCols}, ${CELL_SIZE_REM}rem)`,
                                width: `${gridCols * CELL_SIZE_REM}rem`,
                                height: `${gridRows * CELL_SIZE_REM}rem`,
                                minWidth: '300px'
                            }}
                            onMouseLeave={() => updateDraggedItemPreviewCallback(null)}
                        >
                            {/* Grid Cells for dropping */}
                            {Array.from({ length: gridRows }).flatMap((_, rIndex) =>
                                Array.from({ length: gridCols }).map((_, cIndex) => (
                                    <DroppableGridCell
                                        key={`cell-${rIndex + 1}-${cIndex + 1}`}
                                        r={rIndex + 1} // 1-based
                                        c={cIndex + 1} // 1-based
                                        isEraserActive={isEraserActive}
                                        eraseDesignerItem={eraseDesignerItem}
                                        addItem={addItem}
                                        moveItem={moveItem}
                                        canPlaceItemAtCoords={canPlaceItemAtCoords}
                                        draggedItemPreview={draggedItemPreview}
                                        updateDraggedItemPreview={updateDraggedItemPreviewCallback}
                                        ItemTypes={ItemTypes}
                                    />
                                ))
                            )}
                             <AnimatePresence>
                                {designedTables.filter(t => t && t.id).map(table => (
                                    <PlacedItem
                                        key={table.id}
                                        item={table}
                                        itemType={ItemTypes.PLACED_TABLE}
                                        isEraserActive={isEraserActive}
                                        onUpdateTableNumber={handleUpdateTableNumber}
                                        onRotateTable={handleRotateTable}
                                        eraseDesignerItem={eraseDesignerItem}
                                        CELL_SIZE_REM={CELL_SIZE_REM}
                                        ItemTypes={ItemTypes}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        <div className="mt-10 flex justify-center space-x-4">
                            <button onClick={handleSave} className="px-8 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-md">Save Layout</button>
                            <button onClick={handleClearAll} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors shadow-md">Clear All & Reset Grid</button>
                            <button onClick={onCancel} className="px-8 py-3 bg-rose-400 text-white rounded-xl hover:bg-rose-500 transition-colors shadow-md">Cancel & Exit</button>
                        </div>
                    </div>
                </main>

                <Modal isOpen={isAlertModalOpen} onClose={closeAlertModal} title={alertModalContent.title} type={alertModalContent.type}>
                    <p>{alertModalContent.message}</p>
                </Modal>
            </div>
        </DndProvider>
    );
};

export default LayoutDesigner;