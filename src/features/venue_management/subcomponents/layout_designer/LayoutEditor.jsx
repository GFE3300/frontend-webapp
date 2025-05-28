// features\venue_management\subcomponents\layout_designer\LayoutEditor.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// REMOVE: import { DndProvider } from 'react-dnd';
// REMOVE: import { HTML5Backend } from 'react-dnd-html5-backend';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// Hooks
import useLayoutDesignerStateManagement from '../../hooks/useLayoutDesignerStateManagement';
import useDesignerInteractions from '../../hooks/useDesignerInteractions';

// Child Components
import EditorToolbar from './EditorToolbar';
import EditorCanvas from './EditorCanvas';
import PropertiesInspector from './PropertiesInspector';

// Constants
import {
    DEFAULT_ZOOM_LEVEL, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, ZOOM_STEP,
    DEFAULT_INITIAL_GRID_ROWS, DEFAULT_INITIAL_GRID_COLS, DEFAULT_GRID_SUBDIVISION
} from '../../constants/layoutConstants';
import { ItemTypes, toolDefinitions, ITEM_CONFIGS } from '../../constants/itemConfigs';

// Common Components
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// Design Guideline Variables
const EDITOR_MAIN_AREA_BG_LIGHT = 'bg-neutral-100';
const EDITOR_MAIN_AREA_BG_DARK = 'dark:bg-neutral-900';

const LayoutEditor = ({
    initialLayout,
    onSaveTrigger,
    onSaveAndExitTrigger,
    onContentChange,
    openAlert,
    isZenMode,
    onToggleZenMode,
}) => {
    // --- State ---
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [isPropertiesInspectorOpen, setIsPropertiesInspectorOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL);
    const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);

    const initialLayoutConfig = useMemo(() => ({
        initialDesignItems: initialLayout?.designItems ? JSON.parse(JSON.stringify(initialLayout.designItems)) : Object.freeze([]),
        initialGridRows: initialLayout?.gridDimensions?.rows ?? DEFAULT_INITIAL_GRID_ROWS, // Provide default
        initialGridCols: initialLayout?.gridDimensions?.cols ?? DEFAULT_INITIAL_GRID_COLS, // Provide default
        initialGridSubdivision: initialLayout?.gridDimensions?.gridSubdivision ?? DEFAULT_GRID_SUBDIVISION, // Provide default
    }), [initialLayout]);

    const layoutManager = useLayoutDesignerStateManagement(initialLayoutConfig, openAlert);
    const interactionsManager = useDesignerInteractions();

    // --- Callbacks ---
    const handleSelectItem = useCallback((itemId) => {
        setSelectedItemId(prevId => {
            const newId = prevId === itemId ? null : itemId;
            setIsPropertiesInspectorOpen(!!newId);
            return newId;
        });
        if (interactionsManager.isEraserActive) {
            interactionsManager.toggleEraser();
        }
    }, [interactionsManager]);

    const deselectAndCloseInspector = useCallback(() => {
        setSelectedItemId(null);
        setIsPropertiesInspectorOpen(false);
    }, []);

    const handleCanvasClick = useCallback((event) => {
        // Only deselect if the click is directly on the canvas area, not on an item or handle within it.
        if (event.target === event.currentTarget) { // currentTarget is the motion.main element
            if (selectedItemId || isPropertiesInspectorOpen) {
                deselectAndCloseInspector();
            }
        }
    }, [selectedItemId, isPropertiesInspectorOpen, deselectAndCloseInspector]);

    const handleZoomIn = useCallback(() => setZoomLevel(prev => Math.min(MAX_ZOOM_LEVEL, parseFloat((prev + ZOOM_STEP).toFixed(2)))), []);
    const handleZoomOut = useCallback(() => setZoomLevel(prev => Math.max(MIN_ZOOM_LEVEL, parseFloat((prev - ZOOM_STEP).toFixed(2)))), []);
    const handleResetZoom = useCallback(() => setZoomLevel(DEFAULT_ZOOM_LEVEL), []);

    const validateLayoutForSave = useCallback(() => {
        const tablesToValidate = layoutManager.designItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE);
        const hasInvalidTables = tablesToValidate.some(t => t.isProvisional || typeof t.number !== 'number' || t.number <= 0);
        const tableNumbers = tablesToValidate
            .filter(t => typeof t.number === 'number' && t.number > 0)
            .map(t => t.number);
        const hasDuplicateTableNumbers = new Set(tableNumbers).size !== tableNumbers.length;

        if (hasInvalidTables || hasDuplicateTableNumbers) {
            let message = "";
            if (hasInvalidTables) message += "Ensure all tables have valid, positive numbers. ";
            if (hasDuplicateTableNumbers) message += "Table numbers must be unique.";
            openAlert("Layout Validation Error", message.trim(), "error");
            return false;
        }
        return true;
    }, [layoutManager.designItems, openAlert, ItemTypes.PLACED_TABLE]);

    const getCurrentLayoutSnapshot = useCallback(() => ({
        designItems: JSON.parse(JSON.stringify(layoutManager.designItems)),
        gridDimensions: {
            rows: layoutManager.gridRows,
            cols: layoutManager.gridCols,
            gridSubdivision: layoutManager.gridSubdivision,
        },
    }), [layoutManager]);

    const handleSave = useCallback(async () => {
        if (!validateLayoutForSave()) return false;
        if (onSaveTrigger) {
            const layoutToSave = getCurrentLayoutSnapshot();
            // Assuming onSaveTrigger is async and returns success status
            const success = await onSaveTrigger(layoutToSave);
            return success;
        }
        return false; // Or true if save is considered successful by default if no trigger
    }, [validateLayoutForSave, getCurrentLayoutSnapshot, onSaveTrigger]);

    const handleSaveAndExit = useCallback(async () => {
        const saved = await handleSave();
        if (saved && onSaveAndExitTrigger) {
            onSaveAndExitTrigger(getCurrentLayoutSnapshot());
        }
    }, [handleSave, onSaveAndExitTrigger, getCurrentLayoutSnapshot]);

    const attemptClearAll = useCallback(() => setIsClearConfirmationOpen(true), []);

    const confirmClearAll = useCallback(() => {
        setIsClearConfirmationOpen(false);
        layoutManager.resetToDefaults();
        deselectAndCloseInspector();
        setZoomLevel(DEFAULT_ZOOM_LEVEL);
    }, [layoutManager, deselectAndCloseInspector]);

    const handleUpdateItemProperties = useCallback((itemId, propertyUpdates) => {
        return layoutManager.updateItemProperties(itemId, propertyUpdates);
    }, [layoutManager]);


    // --- Effects ---
    useEffect(() => {
        const currentDesignerStateSnapshot = {
            designItems: layoutManager.designItems,
            gridDimensions: {
                rows: layoutManager.gridRows,
                cols: layoutManager.gridCols,
                gridSubdivision: layoutManager.gridSubdivision,
            }
        };
        // Use the defaults used in useMemo for initialLayoutConfig for a fair comparison
        const initialHookSnapshot = {
            designItems: initialLayoutConfig.initialDesignItems,
            gridDimensions: {
                rows: initialLayoutConfig.initialGridRows,
                cols: initialLayoutConfig.initialGridCols,
                gridSubdivision: initialLayoutConfig.initialGridSubdivision,
            }
        };

        if (JSON.stringify(currentDesignerStateSnapshot) !== JSON.stringify(initialHookSnapshot)) {
            if (onContentChange) onContentChange();
        }
    }, [
        layoutManager.designItems, layoutManager.gridRows, layoutManager.gridCols, layoutManager.gridSubdivision,
        initialLayoutConfig, onContentChange
    ]);

    useEffect(() => {
        if (selectedItemId && !layoutManager.designItems.find(item => item.id === selectedItemId)) {
            setSelectedItemId(null);
            setIsPropertiesInspectorOpen(false);
        }
    }, [layoutManager.designItems, selectedItemId]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (isPropertiesInspectorOpen) {
                    deselectAndCloseInspector();
                } else if (selectedItemId) {
                    setSelectedItemId(null); // Deselect item if inspector is already closed
                } else if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                }
                if (interactionsManager.draggedItemPreview) {
                    interactionsManager.updateDraggedItemPreview(null);
                }
            }
            // Example: Ctrl+S for save, ensure this doesn't conflict with browser save
            if (event.ctrlKey && event.key.toLowerCase() === 's') {
                event.preventDefault();
                handleSave();
            }
            if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                layoutManager.undo();
            }
            if (event.ctrlKey && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
                event.preventDefault();
                layoutManager.redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItemId, isPropertiesInspectorOpen, interactionsManager, layoutManager, handleSave, deselectAndCloseInspector]); // Added dependencies

    return (
        <div className="flex flex-col h-full w-full" role="application">
            <EditorToolbar
                majorGridRows={layoutManager.gridRows}
                majorGridCols={layoutManager.gridCols}
                currentGridSubdivision={layoutManager.gridSubdivision}
                onGridDimensionChange={(dimension, value) => layoutManager.setGridDimensions({ [dimension]: value })}
                onGridSubdivisionChange={layoutManager.setGridSubdivision}
                zoomLevel={zoomLevel}
                onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetZoom={handleResetZoom}
                toolDefinitions={toolDefinitions} ItemTypes={ItemTypes}
                isEraserActive={interactionsManager.isEraserActive}
                onToggleEraser={interactionsManager.toggleEraser}
                onUndo={layoutManager.undo} onRedo={layoutManager.redo}
                canUndo={layoutManager.canUndo} canRedo={layoutManager.canRedo}
                onSave={handleSave}
                // onSaveAndExit={handleSaveAndExit} // This prop seems unused by EditorToolbar in the provided code.
                onClearAll={attemptClearAll}
                isZenMode={isZenMode} onToggleZenMode={onToggleZenMode}
            />

            <div
                className={`flex-1 flex overflow-hidden relative ${EDITOR_MAIN_AREA_BG_LIGHT} ${EDITOR_MAIN_AREA_BG_DARK} transition-all duration-300 ease-in-out`}
            >
                <motion.main
                    layout // Enable layout animations for this container if its size changes (e.g., PropertiesInspector opens/closes)
                    className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6 md:p-8"
                    onClick={handleCanvasClick} // Click on empty canvas area for deselect
                    role="region"
                    aria-label="Layout Design Canvas Area"
                >
                    <EditorCanvas
                        majorGridRows={layoutManager.gridRows}
                        majorGridCols={layoutManager.gridCols}
                        gridSubdivision={layoutManager.gridSubdivision}
                        designItems={layoutManager.designItems}
                        ItemTypes={ItemTypes} ITEM_CONFIGS={ITEM_CONFIGS}
                        onAddItem={layoutManager.addItemToLayout}
                        onMoveItem={layoutManager.moveExistingItem}
                        onEraseDesignerItemFromCell={layoutManager.removeItemAtCoords}
                        onEraseDesignerItemById={layoutManager.removeItemById}
                        onUpdateItemProperty={handleUpdateItemProperties}
                        onSelectItem={handleSelectItem} selectedItemId={selectedItemId}
                        canPlaceItem={layoutManager.canPlaceItem}
                        draggedItemPreview={interactionsManager.draggedItemPreview}
                        onUpdateDraggedItemPreview={interactionsManager.updateDraggedItemPreview}
                        isEraserActive={interactionsManager.isEraserActive}
                        zoomLevel={zoomLevel}
                        onCanvasClick={handleCanvasClick} // Pass again for direct canvas click if needed inside EditorCanvas
                    />
                </motion.main>

                <PropertiesInspector
                    designItems={layoutManager.designItems}
                    selectedItemId={selectedItemId}
                    onUpdateItemProperties={handleUpdateItemProperties}
                    ITEM_CONFIGS={ITEM_CONFIGS} ItemTypes={ItemTypes}
                    isOpen={isPropertiesInspectorOpen}
                    onClose={deselectAndCloseInspector}
                    gridSubdivision={layoutManager.gridSubdivision}
                />
            </div>

            <ConfirmationModal
                isOpen={isClearConfirmationOpen}
                onClose={() => setIsClearConfirmationOpen(false)}
                onConfirm={confirmClearAll}
                title="Clear Entire Layout"
                message="Are you sure you want to clear the entire layout and reset grid settings? This action cannot be undone using the history."
                confirmText="Yes, Clear All & Reset Grid"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default LayoutEditor;