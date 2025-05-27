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
import LayoutDesignerSidebar from './LayoutDesignerSidebar';
import LayoutDesignerToolbar from './LayoutDesignerToolbar';
import LayoutDesignerGrid from './grid_system/LayoutDesignerGrid.jsx';

// Constants
import {
    CELL_SIZE_REM,
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION,
    MIN_GRID_ROWS, MAX_GRID_ROWS, MIN_GRID_COLS, MAX_GRID_COLS,
    // Zoom Constants (ensure these are defined in layoutConstants.jsx)
    DEFAULT_ZOOM_LEVEL,
    MIN_ZOOM_LEVEL,
    MAX_ZOOM_LEVEL,
    ZOOM_STEP,
} from '../../constants/layoutConstants';

import {
    ItemTypes,
    toolDefinitions,
    ITEM_CONFIGS,
} from '../../constants/itemConfigs';

const STABLE_EMPTY_DESIGN_ITEMS = Object.freeze([]);

const LayoutDesigner = ({
    currentLayout,
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

    // --- Selected Item State ---
    const [selectedItemId, setSelectedItemId] = useState(null);
    const handleSelectItem = useCallback((itemId) => {
        setSelectedItemId(prevId => (prevId === itemId ? null : itemId));
    }, []);

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

    // --- Zoom State & Handlers ---
    const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL);

    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(MAX_ZOOM_LEVEL, parseFloat((prev + ZOOM_STEP).toFixed(2)))); // toFixed for float precision
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(MIN_ZOOM_LEVEL, parseFloat((prev - ZOOM_STEP).toFixed(2)))); // toFixed for float precision
    }, []);

    const handleResetZoom = useCallback(() => {
        setZoomLevel(DEFAULT_ZOOM_LEVEL);
    }, []);


    // --- QR Code Fetching Effect ---
    useEffect(() => {
        layoutManager.designItems.forEach(item => {
            if (ITEM_CONFIGS[item.itemType]?.canHaveQr && item.id) {
                const canFetchQr = item.itemType === ItemTypes.PLACED_TABLE ? !!item.number : true;
                if (canFetchQr) {
                    const status = qrManager.getQrStatus(item.id);
                    if (!status.url && !status.loading && status.url !== 'error' && !status.error) {
                        qrManager.fetchQrCodeForTable(item, "black", "white");
                    }
                }
            }
        });
        const currentItemIds = new Set(layoutManager.designItems.map(it => it.id));
        Object.keys(qrManager.qrImageUrls).forEach(qrItemId => {
            if (!currentItemIds.has(qrItemId)) {
                qrManager.clearQrDataForTable(qrItemId);
            }
        });
    }, [layoutManager.designItems, qrManager]);

    // --- Save Handler ---
    const handleSave = useCallback(() => {
        const tablesToValidate = layoutManager.designItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE);
        const validTableNumbers = tablesToValidate
            .map(t => t.number)
            .filter(num => typeof num === 'number' && num > 0);
        const uniqueValidTableNumbers = new Set(validTableNumbers);

        if (tablesToValidate.length > 0 && (validTableNumbers.length !== uniqueValidTableNumbers.size || validTableNumbers.length !== tablesToValidate.length)) {
            openAlertModal("Validation Error", "Ensure all tables have unique, positive numbers before saving.", "error");
            return;
        }
        const layoutToSave = {
            designItems: JSON.parse(JSON.stringify(layoutManager.designItems)),
            gridDimensions: {
                rows: layoutManager.gridRows,
                cols: layoutManager.gridCols,
                gridSubdivision: layoutManager.gridSubdivision,
            },
        };
        onSaveLayout(layoutToSave);
        setSelectedItemId(null);
    }, [
        layoutManager.designItems, layoutManager.gridRows, layoutManager.gridCols,
        layoutManager.gridSubdivision, onSaveLayout, openAlertModal
    ]);

    // --- Clear All Handler ---
    const handleClearAll = () => {
        layoutManager.clearFullLayout();
        qrManager.clearAllQrData();
        setSelectedItemId(null);
        setZoomLevel(DEFAULT_ZOOM_LEVEL); // Reset zoom on clear all
    };

    // --- Generic Item Property Update Handler ---
    const handleUpdateItemDetails = useCallback((itemId, propertyUpdates) => {
        const success = layoutManager.updateItemProperties(itemId, propertyUpdates);
        const item = layoutManager.designItems.find(it => it.id === itemId);
        if (item && ITEM_CONFIGS[item.itemType]?.canHaveQr && success) {
            if (item.itemType === ItemTypes.PLACED_TABLE && (propertyUpdates.number !== undefined || propertyUpdates.seats !== undefined)) {
                if (item.number) {
                    qrManager.fetchQrCodeForTable(item, "black", "white");
                } else {
                    qrManager.clearQrDataForTable(item.id);
                }
            }
        }
        return success;
    }, [layoutManager, qrManager]);

    // Deselect item if it's removed
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
                    selectedItemId={selectedItemId}
                    onUpdateItemProperties={handleUpdateItemDetails}
                    ItemTypes={ItemTypes}
                    ITEM_CONFIGS={ITEM_CONFIGS}
                    getQrStatus={qrManager.getQrStatus}
                    downloadSingleQr={qrManager.downloadSingleQr}
                    downloadAllQrs={qrManager.downloadAllQrs}
                />

                <main className="flex-1 flex flex-col overflow-hidden ml-80"> {/* Added flex flex-col */}
                    <div className="p-6 pb-2 shrink-0"> {/* Reduced bottom padding */}
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                            className="text-4xl font-bold text-indigo-700 mb-6 text-center tracking-tight" // Adjusted margin
                        >
                            Layout Designer
                        </motion.h2>

                        <LayoutDesignerToolbar
                            majorGridRows={layoutManager.gridRows}
                            majorGridCols={layoutManager.gridCols}
                            currentGridSubdivision={layoutManager.gridSubdivision}
                            onGridDimensionChange={(dimension, value) => layoutManager.setGridDimensions({ [dimension]: value })}
                            onGridSubdivisionChange={layoutManager.setGridSubdivision}
                            minGridRows={MIN_GRID_ROWS} maxGridRows={MAX_GRID_ROWS}
                            minGridCols={MIN_GRID_COLS} maxGridCols={MAX_GRID_COLS}
                            toolDefinitions={toolDefinitions}
                            ItemTypes={ItemTypes}
                            isEraserActive={interactionsManager.isEraserActive}
                            onToggleEraser={() => { interactionsManager.toggleEraser(); setSelectedItemId(null); }}
                            onUndo={layoutManager.undo}
                            onRedo={layoutManager.redo}
                            canUndo={layoutManager.canUndo}
                            canRedo={layoutManager.canRedo}
                            // Zoom props
                            zoomLevel={zoomLevel}
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            onResetZoom={handleResetZoom}
                        />
                    </div>

                    {/* Scrollable and Padded Wrapper for the Grid */}
                    <div className="flex-1 overflow-auto p-4 pt-2 bg-slate-100 rounded-lg shadow-inner m-6 mt-0">
                        <LayoutDesignerGrid
                            majorGridRows={layoutManager.gridRows}
                            majorGridCols={layoutManager.gridCols}
                            gridSubdivision={layoutManager.gridSubdivision}
                            designItems={layoutManager.designItems}
                            ItemTypes={ItemTypes}
                            ITEM_CONFIGS={ITEM_CONFIGS}
                            CELL_SIZE_REM={CELL_SIZE_REM}
                            onAddItem={layoutManager.addItemToLayout}
                            onMoveItem={layoutManager.moveExistingItem}
                            onEraseDesignerItemFromCell={layoutManager.removeItemAtCoords}
                            onEraseDesignerItemById={(itemId) => {
                                layoutManager.removeItemById(itemId);
                                if (ITEM_CONFIGS[layoutManager.designItems.find(it => it.id === itemId)?.itemType]?.canHaveQr) {
                                    qrManager.clearQrDataForTable(itemId);
                                }
                                if (selectedItemId === itemId) setSelectedItemId(null);
                            }}
                            onUpdateItemProperty={handleUpdateItemDetails}
                            selectedItemId={selectedItemId}
                            onSelectItem={handleSelectItem}
                            canPlaceItem={layoutManager.canPlaceItem}
                            draggedItemPreview={interactionsManager.draggedItemPreview}
                            onUpdateDraggedItemPreview={interactionsManager.updateDraggedItemPreview}
                            isEraserActive={interactionsManager.isEraserActive}
                            // Zoom prop
                            zoomLevel={zoomLevel}
                        />
                    </div>

                    {/* Action Buttons - consider moving them outside the scrollable grid area if main area scrolls */}
                    <div className="shrink-0 px-6 pb-6 pt-2 flex flex-col sm:flex-row justify-center items-center sm:space-x-4 space-y-3 sm:space-y-0">
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
                            onClick={() => { setSelectedItemId(null); onCancel(); }}
                            className="px-8 py-3 w-full sm:w-auto bg-rose-400 text-white rounded-xl hover:bg-rose-500 transition-colors shadow-md font-medium"
                        >
                            <Icon name="cancel" className="w-5 h-5 mr-2 inline-block" /> Cancel & Exit
                        </motion.button>
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