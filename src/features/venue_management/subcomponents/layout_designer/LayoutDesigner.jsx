import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';

import Modal from '../../../../components/animated_alerts/Modal.jsx';
import Icon from '../../../../components/common/Icon.jsx';

// Hooks
import useLayoutDesignerStateManagement from '../../hooks/useLayoutDesignerStateManagement';
import useDesignerInteractions from '../../hooks/useDesignerInteractions';
import useQrCodeManager from '../../hooks/useQrCodeManager';

// UI Components
import LayoutDesignerSidebar from './LayoutDesignerSidebar';
import LayoutDesignerToolbar from './LayoutDesignerToolbar';
import LayoutDesignerGrid from './grid_system/LayoutDesignerGrid.jsx'; // Correct path to grid system

// Constants
import {
    CELL_SIZE_REM, // This is MAJOR_CELL_SIZE_REM
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION, // For initialLayoutConfig default
    MIN_GRID_ROWS, MAX_GRID_ROWS, MIN_GRID_COLS, MAX_GRID_COLS, // For toolbar props
} from '../../constants/layoutConstants';

import { // Item specific constants and tool definitions
    ItemTypes,
    toolDefinitions, // This is the new source for tools
    ITEM_CONFIGS,
} from '../../constants/itemConfigs';

const STABLE_EMPTY_DESIGN_ITEMS = Object.freeze([]);

const LayoutDesigner = ({
    currentLayout, // Prop: { designItems, gridDimensions: { rows, cols, gridSubdivision } }
    onSaveLayout,
    onCancel,
}) => {
    // --- Alert Modal State ---
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    const openAlertModal = useCallback((title, message, type = 'info') => {
        if (isAlertModalOpen && alertModalContent.title === title && alertModalContent.message === message && type === 'error') return;
        setAlertModalContent({ title, message, type });
        setIsAlertModalOpen(true);
    }, [isAlertModalOpen, alertModalContent.title, alertModalContent.message]);

    const closeAlertModal = useCallback(() => setIsAlertModalOpen(false), []);

    // --- Initialize Hooks ---
    const initialLayoutConfig = useMemo(() => ({
        initialDesignItems: currentLayout?.designItems || STABLE_EMPTY_DESIGN_ITEMS,
        initialGridRows: currentLayout?.gridDimensions?.rows || DEFAULT_INITIAL_GRID_ROWS,
        initialGridCols: currentLayout?.gridDimensions?.cols || DEFAULT_INITIAL_GRID_COLS,
        initialGridSubdivision: currentLayout?.gridDimensions?.gridSubdivision || DEFAULT_GRID_SUBDIVISION,
    }), [currentLayout]);

    const layoutManager = useLayoutDesignerStateManagement(initialLayoutConfig, openAlertModal);
    const interactionsManager = useDesignerInteractions();
    const qrManager = useQrCodeManager(openAlertModal);

    // --- QR Code Fetching Effect ---
    useEffect(() => {
        layoutManager.designItems.forEach(item => {
            // Check if item is a table and needs QR
            if (item.itemType === ItemTypes.PLACED_TABLE && item.id && item.number) {
                const status = qrManager.getQrStatus(item.id);
                if (!status.url && !status.loading && !status.error && status.url !== 'error') {
                    qrManager.fetchQrCodeForTable(item, "red", "blue"); // Default colors
                }
            }
        });
    }, [layoutManager.designItems, qrManager]); // Rerun if designItems or qrManager instance changes

    // --- Save Handler ---
    const handleSave = useCallback(() => {
        const itemsToValidate = layoutManager.designItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE);
        const validTables = itemsToValidate.filter(t => t && typeof t.number === 'number' && t.number > 0);
        const numbers = validTables.map(t => t.number);
        const uniqueNumbers = new Set(numbers);

        if (itemsToValidate.length > 0 && (numbers.length !== uniqueNumbers.size || validTables.length !== itemsToValidate.length)) {
            openAlertModal("Validation Error", "Ensure all tables have unique, positive numbers before saving.", "error");
            return;
        }

        const layoutToSave = {
            designItems: JSON.parse(JSON.stringify(layoutManager.designItems)), // Deep copy
            gridDimensions: {
                rows: layoutManager.gridRows,
                cols: layoutManager.gridCols,
                gridSubdivision: layoutManager.gridSubdivision,
            },
        };
        onSaveLayout(layoutToSave);
    }, [
        layoutManager.designItems,
        layoutManager.gridRows,
        layoutManager.gridCols,
        layoutManager.gridSubdivision,
        onSaveLayout,
        openAlertModal
    ]);

    // --- Clear All Handler ---
    const handleClearAll = () => {
        layoutManager.clearFullLayout();
        qrManager.clearAllQrData();
    };

    // --- Update Item Properties (Generic) ---
    const handleUpdateItemDetails = useCallback((itemId, details) => {
        // `details` is an object of properties to update, e.g., { tableNumber: newNum }, { seats: newSeats }, { rotation: true }
        const success = layoutManager.updateItemProperties(itemId, details);

        // If properties affecting QR code data (like tableNumber or seats for a table) change, refetch QR.
        const item = layoutManager.designItems.find(it => it.id === itemId);
        if (item && item.itemType === ItemTypes.PLACED_TABLE && success && (details.tableNumber !== undefined || details.seats !== undefined)) {
            qrManager.fetchQrCodeForTable(item, "red", "blue");
        }
        return success;
    }, [layoutManager, qrManager]);


    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-screen font-sans bg-gradient-to-tr from-indigo-50 via-white to-pink-50">
                <LayoutDesignerSidebar
                    designItems={layoutManager.designItems} // Pass generic designItems
                    getQrStatus={qrManager.getQrStatus}
                    downloadSingleQr={qrManager.downloadSingleQr}
                    downloadAllQrs={qrManager.downloadAllQrs}
                    onUpdateItemProperties={handleUpdateItemDetails} // Generic update function
                    ItemTypes={ItemTypes} // Pass ItemTypes for conditional rendering in sidebar
                    ITEM_CONFIGS={ITEM_CONFIGS} // Pass ITEM_CONFIGS for sidebar logic
                />

                <main className="flex-1 overflow-auto ml-80"> {/* Ensure ml-80 matches sidebar width */}
                    <div className="p-6 min-h-full">
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                            className="text-4xl font-bold text-indigo-700 mb-8 text-center tracking-tight"
                        >
                            Layout Designer
                        </motion.h2>

                        <LayoutDesignerToolbar
                            majorGridRows={layoutManager.gridRows}
                            majorGridCols={layoutManager.gridCols}
                            currentGridSubdivision={layoutManager.gridSubdivision}
                            onGridDimensionChange={layoutManager.setGridDimensions}
                            onGridSubdivisionChange={layoutManager.setGridSubdivision}
                            minGridRows={MIN_GRID_ROWS} maxGridRows={MAX_GRID_ROWS}
                            minGridCols={MIN_GRID_COLS} maxGridCols={MAX_GRID_COLS}
                            toolDefinitions={toolDefinitions} // Use new toolDefinitions
                            ItemTypes={ItemTypes}
                            isEraserActive={interactionsManager.isEraserActive}
                            onToggleEraser={interactionsManager.toggleEraser}
                            onUndo={layoutManager.undo}
                            onRedo={layoutManager.redo}
                            canUndo={layoutManager.canUndo}
                            canRedo={layoutManager.canRedo}
                        />

                        <LayoutDesignerGrid
                            majorGridRows={layoutManager.gridRows}
                            majorGridCols={layoutManager.gridCols}
                            gridSubdivision={layoutManager.gridSubdivision}
                            designedTables={layoutManager.designItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE)} // Example: filter for tables
                            // Or pass all designItems and let PlacedItem/factory handle rendering
                            // designedItems={layoutManager.designItems} // Preferred for true generic grid
                            ItemTypes={ItemTypes}
                            CELL_SIZE_REM={CELL_SIZE_REM} // This is MAJOR_CELL_SIZE_REM

                            onAddItem={layoutManager.addItemToLayout}
                            onMoveItem={layoutManager.moveExistingItem}
                            onEraseDesignerItemFromCell={layoutManager.removeItemAtCoords}
                            onEraseDesignerItemById={(itemId) => {
                                layoutManager.removeItemById(itemId);
                                qrManager.clearQrDataForTable(itemId);
                            }}
                            // Pass generic update function to PlacedItem, it will know what property to update
                            onUpdateItemProperty={(itemId, propertyUpdate) => handleUpdateItemDetails(itemId, propertyUpdate)}
                            // Specific handlers can be derived or PlacedItem can call onUpdateItemProperty with specific payloads
                            // e.g., onUpdateTableNumber={(id, num) => handleUpdateItemDetails(id, { tableNumber: num })}
                            // e.g., onRotateTable={(id) => handleUpdateItemDetails(id, { rotation: true })} -- 'rotation:true' is a trigger

                            canPlaceItem={layoutManager.canPlaceItem}
                            draggedItemPreview={interactionsManager.draggedItemPreview}
                            onUpdateDraggedItemPreview={interactionsManager.updateDraggedItemPreview}
                            isEraserActive={interactionsManager.isEraserActive}
                        />

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
                    <p className="text-sm">{alertModalContent.message}</p>
                </Modal>
            </div>
        </DndProvider>
    );
};

export default LayoutDesigner;