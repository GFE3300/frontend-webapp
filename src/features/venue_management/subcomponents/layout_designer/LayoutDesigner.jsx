// features/venue_management/subcomponents/layout_designer/LayoutDesigner.jsx
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
import LayoutDesignerSidebar from './LayoutDesignerSidebar'; // Will be the dispatcher version
import LayoutDesignerToolbar from './LayoutDesignerToolbar';
import LayoutDesignerGrid from './grid_system/LayoutDesignerGrid.jsx';

// Constants
import {
    CELL_SIZE_REM, // This is MAJOR_CELL_SIZE_REM
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION,
    MIN_GRID_ROWS, MAX_GRID_ROWS, MIN_GRID_COLS, MAX_GRID_COLS,
    // AVAILABLE_SUBDIVISIONS is used by Toolbar
} from '../../constants/layoutConstants';

import { // Item specific constants and tool definitions
    ItemTypes,         // e.g., ItemTypes.PLACED_TABLE, ItemTypes.TABLE_TOOL
    toolDefinitions,   // The array of tool configurations for the toolbar
    ITEM_CONFIGS,      // The main configuration object for all PlacedItemTypes
} from '../../constants/itemConfigs';

const STABLE_EMPTY_DESIGN_ITEMS = Object.freeze([]);

const LayoutDesigner = ({
    currentLayout, // Prop is: { designItems: Item[], gridDimensions: { rows, cols, gridSubdivision }, kitchenArea (optional) }
    onSaveLayout,
    onCancel,
}) => {
    // --- Alert Modal State ---
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    const openAlertModal = useCallback((title, message, type = 'info') => {
        // Basic de-duplication for repeated error alerts
        if (isAlertModalOpen && alertModalContent.title === title && alertModalContent.message === message && type === 'error') return;
        setAlertModalContent({ title, message, type });
        setIsAlertModalOpen(true);
    }, [isAlertModalOpen, alertModalContent.title, alertModalContent.message]);

    const closeAlertModal = useCallback(() => setIsAlertModalOpen(false), []);

    // --- Selected Item State (for sidebar properties) ---
    const [selectedItemId, setSelectedItemId] = useState(null);

    const handleSelectItem = useCallback((itemId) => {
        setSelectedItemId(prevId => (prevId === itemId ? null : itemId)); // Toggle selection, or just set
    }, []);


    // --- Initialize Hooks ---
    const initialLayoutConfig = useMemo(() => ({
        initialDesignItems: currentLayout?.designItems || STABLE_EMPTY_DESIGN_ITEMS,
        initialGridRows: currentLayout?.gridDimensions?.rows || DEFAULT_INITIAL_GRID_ROWS,
        initialGridCols: currentLayout?.gridDimensions?.cols || DEFAULT_INITIAL_GRID_COLS,
        initialGridSubdivision: currentLayout?.gridDimensions?.gridSubdivision || DEFAULT_GRID_SUBDIVISION,
        // initialKitchenArea: currentLayout?.kitchenArea // If kitchenArea is managed by useLayoutDesignerStateManagement
    }), [currentLayout]);

    const layoutManager = useLayoutDesignerStateManagement(initialLayoutConfig, openAlertModal);
    const interactionsManager = useDesignerInteractions(); // For eraser, drag preview
    const qrManager = useQrCodeManager(openAlertModal);    // For QR codes (primarily tables)

    // --- QR Code Fetching Effect (for items that can have QR) ---
    useEffect(() => {
        layoutManager.designItems.forEach(item => {
            // Check if item type can have QR from ITEM_CONFIGS
            if (ITEM_CONFIGS[item.itemType]?.canHaveQr && item.id) {
                // For tables, QR might depend on item.number being set
                const canFetchQr = item.itemType === ItemTypes.PLACED_TABLE ? !!item.number : true;

                if (canFetchQr) {
                    const status = qrManager.getQrStatus(item.id);
                    if (!status.url && !status.loading && status.url !== 'error' && !status.error) { // Check !status.error
                        // TODO: Pass QR colors from a central config or item-specific config if needed
                        qrManager.fetchQrCodeForTable(item, "black", "white");
                    }
                }
            }
        });
        // Clear QR for removed items (layoutManager.designItems is the source of truth)
        const currentItemIds = new Set(layoutManager.designItems.map(it => it.id));
        Object.keys(qrManager.qrImageUrls).forEach(qrItemId => {
            if (!currentItemIds.has(qrItemId)) {
                qrManager.clearQrDataForTable(qrItemId);
            }
        });

    }, [layoutManager.designItems, qrManager]); // Rerun if designItems or qrManager instance changes

    // --- Save Handler ---
    const handleSave = useCallback(() => {
        // Validation example: ensure all tables have unique, positive numbers
        const tablesToValidate = layoutManager.designItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE);
        const validTableNumbers = tablesToValidate
            .map(t => t.number)
            .filter(num => typeof num === 'number' && num > 0);
        const uniqueValidTableNumbers = new Set(validTableNumbers);

        if (tablesToValidate.length > 0 && (validTableNumbers.length !== uniqueValidTableNumbers.size || validTableNumbers.length !== tablesToValidate.length)) {
            openAlertModal("Validation Error", "Ensure all tables have unique, positive numbers before saving.", "error");
            return;
        }
        // Add other validations for other item types if necessary

        const layoutToSave = {
            designItems: JSON.parse(JSON.stringify(layoutManager.designItems)), // Deep copy
            gridDimensions: {
                rows: layoutManager.gridRows,
                cols: layoutManager.gridCols,
                gridSubdivision: layoutManager.gridSubdivision,
            },
            // kitchenArea: layoutManager.kitchenArea, // If kitchenArea is part of layoutSnapshot
        };
        onSaveLayout(layoutToSave);
        setSelectedItemId(null); // Clear selection on save
    }, [
        layoutManager.designItems,
        layoutManager.gridRows,
        layoutManager.gridCols,
        layoutManager.gridSubdivision,
        // layoutManager.kitchenArea,
        onSaveLayout,
        openAlertModal
    ]);

    // --- Clear All Handler ---
    const handleClearAll = () => {
        layoutManager.clearFullLayout(); // This resets designItems, grid dimensions, etc.
        qrManager.clearAllQrData();
        setSelectedItemId(null); // Clear selection
    };

    // --- Generic Item Property Update Handler ---
    // Passed to sidebar editors and potentially to PlacedItem renderers
    const handleUpdateItemDetails = useCallback((itemId, propertyUpdates) => {
        // propertyUpdates is an object like { seats: 5 } or { rotation: true }
        const success = layoutManager.updateItemProperties(itemId, propertyUpdates);

        // If properties affecting QR code data change for a QR-eligible item, refetch QR.
        const item = layoutManager.designItems.find(it => it.id === itemId);
        if (item && ITEM_CONFIGS[item.itemType]?.canHaveQr && success) {
            // Example: For tables, number or other QR data relevant fields
            if (item.itemType === ItemTypes.PLACED_TABLE && (propertyUpdates.number !== undefined || propertyUpdates.seats !== undefined /* other relevant fields */)) {
                if (item.number) { // Only fetch if table has a valid number
                    qrManager.fetchQrCodeForTable(item, "black", "white");
                } else {
                    qrManager.clearQrDataForTable(item.id); // Clear QR if number is removed/invalid
                }
            }
            // Add similar logic for other QR-eligible items if any
        }
        return success; // Return validation status from layoutManager
    }, [layoutManager, qrManager]);

    // Deselect item if it's removed from designItems
    useEffect(() => {
        if (selectedItemId && !layoutManager.designItems.find(item => item.id === selectedItemId)) {
            setSelectedItemId(null);
        }
    }, [layoutManager.designItems, selectedItemId]);


    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-screen font-sans bg-gradient-to-tr from-indigo-50 via-white to-pink-50">
                <LayoutDesignerSidebar
                    designItems={layoutManager.designItems}
                    selectedItemId={selectedItemId} // Pass selectedItemId
                    onUpdateItemProperties={handleUpdateItemDetails} // Generic update function
                    ItemTypes={ItemTypes}
                    ITEM_CONFIGS={ITEM_CONFIGS}
                    // QR Props
                    getQrStatus={qrManager.getQrStatus}
                    downloadSingleQr={qrManager.downloadSingleQr}
                    downloadAllQrs={qrManager.downloadAllQrs}
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
                            onGridDimensionChange={(dimension, value) => {
                                layoutManager.setGridDimensions({ [dimension]: value });
                            }}
                            onGridSubdivisionChange={layoutManager.setGridSubdivision}
                            minGridRows={MIN_GRID_ROWS} maxGridRows={MAX_GRID_ROWS} // Pass constraints
                            minGridCols={MIN_GRID_COLS} maxGridCols={MAX_GRID_COLS} // Pass constraints
                            toolDefinitions={toolDefinitions} // Pass the full tool definitions
                            ItemTypes={ItemTypes} // For DraggableGenericTool's type
                            isEraserActive={interactionsManager.isEraserActive}
                            onToggleEraser={() => { interactionsManager.toggleEraser(); setSelectedItemId(null); }} // Deselect on tool change
                            onUndo={layoutManager.undo}
                            onRedo={layoutManager.redo}
                            canUndo={layoutManager.canUndo}
                            canRedo={layoutManager.canRedo}
                        />

                        <LayoutDesignerGrid
                            majorGridRows={layoutManager.gridRows}
                            majorGridCols={layoutManager.gridCols}
                            gridSubdivision={layoutManager.gridSubdivision}
                            designItems={layoutManager.designItems} // Pass all designItems
                            ItemTypes={ItemTypes}
                            ITEM_CONFIGS={ITEM_CONFIGS} // Grid might need this for complex previews or item interactions
                            CELL_SIZE_REM={CELL_SIZE_REM} // This is MAJOR_CELL_SIZE_REM

                            onAddItem={layoutManager.addItemToLayout}
                            onMoveItem={layoutManager.moveExistingItem}
                            onEraseDesignerItemFromCell={layoutManager.removeItemAtCoords} // For eraser clicking on empty cell part of item
                            onEraseDesignerItemById={(itemId) => { // For PlacedItem's own erase trigger
                                layoutManager.removeItemById(itemId);
                                if (ITEM_CONFIGS[layoutManager.designItems.find(it => it.id === itemId)?.itemType]?.canHaveQr) {
                                    qrManager.clearQrDataForTable(itemId);
                                }
                                if (selectedItemId === itemId) setSelectedItemId(null); // Deselect if erased
                            }}
                            onUpdateItemProperty={handleUpdateItemDetails} // Generic update
                            onSelectItem={handleSelectItem} // Pass down the selection handler

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
                                onClick={() => { setSelectedItemId(null); onCancel(); }} // Deselect on cancel
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