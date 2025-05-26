import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion'; // For main action buttons or overall page transition

import Modal from '../../../../components/animated_alerts/Modal.jsx';
import Icon from '../../../../components/common/Icon.jsx'; // Ensure correct path

// New Hooks
import useLayoutDesignerStateManagement from '../../hooks/useLayoutDesignerStateManagement';
import useDesignerInteractions from '../../hooks/useDesignerInteractions';
import useQrCodeManager from '../../hooks/useQrCodeManager'; // Existing, but used here

// New UI Components
import LayoutDesignerSidebar from './LayoutDesignerSidebar';
import LayoutDesignerToolbar from './LayoutDesignerToolbar';
import LayoutDesignerGrid from './grid_system/LayoutDesignerGrid.jsx';

// Constants
import {
    ItemTypes,
    CELL_SIZE_REM,
    tableToolsConfig,
    // obstacleToolsConfig, // If using obstacles
    DEFAULT_INITIAL_GRID_ROWS, // For default if no currentLayout
    DEFAULT_INITIAL_GRID_COLS, // For default if no currentLayout
    MIN_GRID_ROWS, MAX_GRID_ROWS, MIN_GRID_COLS, MAX_GRID_COLS, // For toolbar
} from '../../constants/layoutConstants';

const STABLE_EMPTY_ARRAY = Object.freeze([]); // Stable empty array for initial state

// Utilities - some might be used directly for QR code data if not handled by hooks/sidebar
// import { constructQrDataValue } from '../../utils/commonUtils.js';


const LayoutDesigner = ({
    currentLayout, // Prop: existing layout data { tables, gridDimensions, kitchenArea, obstacles }
    // initialGridRows, initialGridCols are now part of currentLayout.gridDimensions or defaults
    onSaveLayout,  // Prop: (layoutToSave) => void
    onCancel,      // Prop: () => void
}) => {
    // --- Alert Modal State ---
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    const openAlertModal = useCallback((title, message, type = 'info') => {
        // Optional: Prevent spamming identical error modals
        if (isAlertModalOpen && alertModalContent.title === title && alertModalContent.message === message && type === 'error') return;
        setAlertModalContent({ title, message, type });
        setIsAlertModalOpen(true);
    }, [isAlertModalOpen, alertModalContent.title, alertModalContent.message]);
    const closeAlertModal = useCallback(() => setIsAlertModalOpen(false), []);

    // --- Initialize Hooks ---
    const initialLayoutConfig = useMemo(() => ({ // <-- USE useMemo
        initialTables: currentLayout?.tables || STABLE_EMPTY_ARRAY, // <-- USE STABLE_EMPTY_ARRAY
        initialGridRows: currentLayout?.gridDimensions?.rows || DEFAULT_INITIAL_GRID_ROWS,
        initialGridCols: currentLayout?.gridDimensions?.cols || DEFAULT_INITIAL_GRID_COLS,
        // initialObstacles: currentLayout?.obstacles || STABLE_EMPTY_ARRAY, // If using obstacles
        // initialKitchenArea: currentLayout?.kitchenArea || null,
    }), [currentLayout]);

    const layoutManager = useLayoutDesignerStateManagement(initialLayoutConfig, openAlertModal);
    const interactionsManager = useDesignerInteractions();
    const qrManager = useQrCodeManager(openAlertModal);


    // --- QR Code Fetching Effect ---
    // Fetch QR codes for newly added or modified tables
    useEffect(() => {
        layoutManager.designedTables.filter(t => t && t.id).forEach(table => {
            const status = qrManager.getQrStatus(table.id);
            // Fetch if no URL, not loading, not an error, and table number exists (QR data depends on it)
            if (table.number && !status.url && !status.loading && !status.error && status.url !== 'error') {
                // Assuming default QR colors. Pass from config if customizable.
                qrManager.fetchQrCodeForTable(table, "red", "blue");
            }
        });
    }, [layoutManager.designedTables, qrManager]);


    // --- Save Handler ---
    const handleSave = useCallback(() => {
        // Perform final validation before saving
        const tablesToSave = layoutManager.designedTables;
        const validTables = tablesToSave.filter(t => t && typeof t.number === 'number' && t.number > 0);
        const numbers = validTables.map(t => t.number);
        const uniqueNumbers = new Set(numbers);

        if (numbers.length !== uniqueNumbers.size || validTables.length !== tablesToSave.length) {
            openAlertModal("Validation Error", "Ensure all tables have unique, positive numbers before saving.", "error");
            return;
        }

        const layoutToSave = {
            tables: JSON.parse(JSON.stringify(validTables)), // Deep copy for safety
            // obstacles: JSON.parse(JSON.stringify(layoutManager.designedObstacles)), // If active
            gridDimensions: { rows: layoutManager.gridRows, cols: layoutManager.gridCols },
            // kitchenArea: layoutManager.definedKitchenArea ? JSON.parse(JSON.stringify(layoutManager.definedKitchenArea)) : null, // If active
        };
        onSaveLayout(layoutToSave);
    }, [
        layoutManager.designedTables,
        // layoutManager.designedObstacles,
        layoutManager.gridRows,
        layoutManager.gridCols,
        // layoutManager.definedKitchenArea,
        onSaveLayout,
        openAlertModal
    ]);

    // --- Clear All Handler ---
    const handleClearAll = () => {
        layoutManager.clearFullLayout(); // This will also trigger the alert from within the hook
        qrManager.clearAllQrData();      // Clear any cached QR blob URLs
    };

    // --- Update table properties (combining number/seats/rotation for PlacedItem) ---
    // PlacedItem might call this for number and rotation. Sidebar calls for seats.
    const handleUpdateTableDetails = useCallback((tableId, details) => {
        // `details` could be { number: newNum }, { seats: newSeats }, or { rotation: true }
        // The `updateTableProperties` hook method handles figuring out which prop to update.
        const success = layoutManager.updateTableProperties(tableId, details);
        if (success && (details.number !== undefined || details.seats !== undefined)) {
            // If number or seats changed, refetch QR as data might have changed
            const updatedTable = layoutManager.designedTables.find(t => t.id === tableId);
            if (updatedTable) {
                qrManager.fetchQrCodeForTable(updatedTable, "red", "blue");
            }
        }
        return success; // For PlacedItem to know if update was successful
    }, [layoutManager, qrManager]);


    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-screen font-sans bg-gradient-to-tr from-indigo-50 via-white to-pink-50"> {/* Overall background */}
                <LayoutDesignerSidebar
                    designedTables={layoutManager.designedTables}
                    getQrStatus={qrManager.getQrStatus}
                    downloadSingleQr={qrManager.downloadSingleQr}
                    downloadAllQrs={qrManager.downloadAllQrs}
                    onUpdateTableSeats={(tableId, seats) => handleUpdateTableDetails(tableId, { seats })}
                />

                <main className="flex-1 overflow-auto ml-80"> {/* Ensure ml-80 matches sidebar width */}
                    <div className="p-6 min-h-full"> {/* Removed inner gradient, applied to parent */}
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                            className="text-4xl font-bold text-indigo-700 mb-8 text-center tracking-tight"
                        >
                            Layout Designer
                        </motion.h2>

                        <LayoutDesignerToolbar
                            majorGridRows={layoutManager.gridRows} // Passed from layoutManager
                            majorGridCols={layoutManager.gridCols} // Passed from layoutManager
                            currentGridSubdivision={layoutManager.gridSubdivision} // New state from layoutManager
                            onGridDimensionChange={layoutManager.setGridDimensions} // For major dimensions
                            onGridSubdivisionChange={layoutManager.setGridSubdivision} // New callback

                            tableToolsConfig={tableToolsConfig}
                            ItemTypes={ItemTypes}
                            isEraserActive={interactionsManager.isEraserActive}
                            onToggleEraser={interactionsManager.toggleEraser}
                            onUndo={layoutManager.undo}
                            onRedo={layoutManager.redo}
                            canUndo={layoutManager.canUndo}
                            canRedo={layoutManager.canRedo}
                        />

                        <LayoutDesignerGrid
                            majorGridRows={layoutManager.gridRows} // This is already correct (gridRows from hook IS major)
                            majorGridCols={layoutManager.gridCols} // This is already correct (gridCols from hook IS major)
                            gridSubdivision={layoutManager.gridSubdivision} // NEW: Pass this down
                            designedTables={layoutManager.designedTables}
                            ItemTypes={ItemTypes}
                            CELL_SIZE_REM={CELL_SIZE_REM} // This is the MAJOR_CELL_SIZE_REM

                            // Callbacks are already correctly set up to use minor coordinates from layoutManager
                            onAddItem={layoutManager.addItemToLayout}
                            onMoveItem={layoutManager.moveExistingItem}
                            onEraseDesignerItemFromCell={layoutManager.removeItemAtCoords} // Expects minor coords
                            onEraseDesignerItemById={(itemId) => {
                                layoutManager.removeItemById(itemId);
                                qrManager.clearQrDataForTable(itemId);
                            }}
                            onUpdateTableNumber={(tableId, number) => handleUpdateTableDetails(tableId, { number })}
                            onRotateTable={(tableId) => handleUpdateTableDetails(tableId, { rotation: true })}
                            canPlaceItem={layoutManager.canPlaceItem} // Expects minor coords and minor dimensions

                            draggedItemPreview={interactionsManager.draggedItemPreview} // Preview coords/dims are minor
                            onUpdateDraggedItemPreview={interactionsManager.updateDraggedItemPreview}
                            isEraserActive={interactionsManager.isEraserActive}
                        />

                        {/* Main Action Buttons */}
                        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center sm:space-x-4 space-y-3 sm:space-y-0">
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleSave}
                                className="px-8 py-3 w-full sm:w-auto bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-md font-medium"
                            >
                                <Icon name="save" className="w-5 h-5 mr-2 inline-block" /> Save Layout
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleClearAll}
                                className="px-8 py-3 w-full sm:w-auto bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors shadow-md font-medium"
                            >
                                <Icon name="delete_sweep" className="w-5 h-5 mr-2 inline-block" /> Clear All & Reset
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={onCancel}
                                className="px-8 py-3 w-full sm:w-auto bg-rose-400 text-white rounded-xl hover:bg-rose-500 transition-colors shadow-md font-medium"
                            >
                                <Icon name="cancel" className="w-5 h-5 mr-2 inline-block" /> Cancel & Exit
                            </motion.button>
                        </div>
                    </div>
                </main>

                <Modal isOpen={isAlertModalOpen} onClose={closeAlertModal} title={alertModalContent.title} type={alertModalContent.type}>
                    <p className="text-sm">{alertModalContent.message}</p> {/* Ensure modal content is text-sm for consistency */}
                </Modal>
            </div>
        </DndProvider>
    );
};

export default LayoutDesigner;