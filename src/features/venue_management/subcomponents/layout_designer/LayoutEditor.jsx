import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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

// --- Design Guideline Variables ---
const EDITOR_MAIN_AREA_BG_LIGHT = 'bg-neutral-100'; // Slightly off-white for the area around the canvas
const EDITOR_MAIN_AREA_BG_DARK = 'dark:bg-neutral-900';
const EDITOR_PADDING_WHEN_INSPECTOR_OPEN = 'pr-80'; // width of PropertiesInspector

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

    // Memoize initialLayoutConfig to stabilize `useLayoutDesignerStateManagement` dependency
    // This ensures the hook doesn't re-initialize unnecessarily if `initialLayout` object reference changes but content is same.
    const initialLayoutConfig = useMemo(() => ({
        initialDesignItems: initialLayout?.designItems ? JSON.parse(JSON.stringify(initialLayout.designItems)) : Object.freeze([]),
        initialGridRows: initialLayout?.gridDimensions?.rows,
        initialGridCols: initialLayout?.gridDimensions?.cols,
        initialGridSubdivision: initialLayout?.gridDimensions?.gridSubdivision,
    }), [initialLayout]);

    // Core State Management Hook for layout items, grid, history
    const layoutManager = useLayoutDesignerStateManagement(initialLayoutConfig, openAlert);
    // Interaction State Hook for eraser, drag previews
    const interactionsManager = useDesignerInteractions();

    // --- Effects ---
    // Notify parent (VenueDesignerPage) about content changes
    useEffect(() => {
        const currentDesignerStateSnapshot = {
            designItems: layoutManager.designItems,
            gridDimensions: {
                rows: layoutManager.gridRows,
                cols: layoutManager.gridCols,
                gridSubdivision: layoutManager.gridSubdivision,
            }
        };
        // Compare current state with the effectively initial state that was used to set up the hook
        const initialHookSnapshot = {
            designItems: initialLayoutConfig.initialDesignItems,
            gridDimensions: {
                rows: initialLayoutConfig.initialGridRows || DEFAULT_INITIAL_GRID_ROWS, // Use defaults if not provided
                cols: initialLayoutConfig.initialGridCols || DEFAULT_INITIAL_GRID_COLS,
                gridSubdivision: initialLayoutConfig.initialGridSubdivision || DEFAULT_GRID_SUBDIVISION,
            }
        };

        if (JSON.stringify(currentDesignerStateSnapshot) !== JSON.stringify(initialHookSnapshot)) {
            if (onContentChange) onContentChange();
        }
    }, [
        layoutManager.designItems, layoutManager.gridRows, layoutManager.gridCols, layoutManager.gridSubdivision,
        initialLayoutConfig, onContentChange
    ]);

    // Deselect item if it's removed (e.g., by undo, eraser, or clear all)
    useEffect(() => {
        if (selectedItemId && !layoutManager.designItems.find(item => item.id === selectedItemId)) {
            setSelectedItemId(null);
            setIsPropertiesInspectorOpen(false);
        }
    }, [layoutManager.designItems, selectedItemId]);

    // Global keydown listener for 'Escape' key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (selectedItemId) {
                    setSelectedItemId(null);
                    setIsPropertiesInspectorOpen(false);
                } else if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                }
                if (interactionsManager.draggedItemPreview) {
                    interactionsManager.updateDraggedItemPreview(null); // Clear any active drag preview
                }
                // Potentially close other modals if active and appropriate
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItemId, interactionsManager]);

    // --- Callbacks ---
    const handleSelectItem = useCallback((itemId) => {
        setSelectedItemId(prevId => {
            const newId = prevId === itemId ? null : itemId;
            setIsPropertiesInspectorOpen(!!newId);
            return newId;
        });
        if (interactionsManager.isEraserActive) {
            interactionsManager.toggleEraser(); // Deactivate eraser when selecting an item
        }
    }, [interactionsManager]);

    const deselectAndCloseInspector = useCallback(() => {
        setSelectedItemId(null);
        setIsPropertiesInspectorOpen(false);
    }, []);

    const handleCanvasClick = useCallback((event) => {
        // Only deselect if the click is on the canvas background itself,
        // not on a placed item (which would be handled by PlacedItem's onClick).
        // EditorCanvas's outer div will call this.
        if (event.target === event.currentTarget && selectedItemId) {
            deselectAndCloseInspector();
        }
    }, [selectedItemId, deselectAndCloseInspector]);

    // Zoom handlers
    const handleZoomIn = useCallback(() => setZoomLevel(prev => Math.min(MAX_ZOOM_LEVEL, parseFloat((prev + ZOOM_STEP).toFixed(2)))), []);
    const handleZoomOut = useCallback(() => setZoomLevel(prev => Math.max(MIN_ZOOM_LEVEL, parseFloat((prev - ZOOM_STEP).toFixed(2)))), []);
    const handleResetZoom = useCallback(() => setZoomLevel(DEFAULT_ZOOM_LEVEL), []);

    // Layout Validation
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
    }, [layoutManager.designItems, openAlert]);

    // Get current layout state for saving
    const getCurrentLayoutSnapshot = useCallback(() => ({
        designItems: JSON.parse(JSON.stringify(layoutManager.designItems)),
        gridDimensions: {
            rows: layoutManager.gridRows,
            cols: layoutManager.gridCols,
            gridSubdivision: layoutManager.gridSubdivision,
        },
        // kitchenArea: layoutManager.kitchenArea, // Include if managed by layoutManager
    }), [layoutManager]);

    // Save handlers
    const handleSave = useCallback(async () => {
        if (!validateLayoutForSave()) return false;
        if (onSaveTrigger) {
            const layoutToSave = getCurrentLayoutSnapshot();
            return await onSaveTrigger(layoutToSave); // Propagate success/failure
        }
        return false;
    }, [validateLayoutForSave, getCurrentLayoutSnapshot, onSaveTrigger]);

    const handleSaveAndExit = useCallback(async () => {
        const saved = await handleSave();
        if (saved && onSaveAndExitTrigger) {
            // No need to get snapshot again, handleSave already did and called parent.
            // Parent (VenueDesignerPage) will handle navigation after successful save.
            onSaveAndExitTrigger(getCurrentLayoutSnapshot()); // Call parent's trigger which will navigate
        }
    }, [handleSave, onSaveAndExitTrigger, getCurrentLayoutSnapshot]);


    // Clear All handlers
    const attemptClearAll = useCallback(() => setIsClearConfirmationOpen(true), []);
    const confirmClearAll = useCallback(() => {
        setIsClearConfirmationOpen(false);
        layoutManager.clearFullLayout(); // Shows its own alert via openAlert
        deselectAndCloseInspector();
        setZoomLevel(DEFAULT_ZOOM_LEVEL);
        // onContentChange will be triggered by layoutManager changes
    }, [layoutManager, deselectAndCloseInspector]);

    // Item Property Update handler
    const handleUpdateItemProperties = useCallback((itemId, propertyUpdates) => {
        return layoutManager.updateItemProperties(itemId, propertyUpdates);
    }, [layoutManager]);

    // --- Render ---
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-full w-full" role="application"> {/* Main editor container */}
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
                    onSave={handleSave} onSaveAndExit={handleSaveAndExit} onClearAll={attemptClearAll}
                    isZenMode={isZenMode} onToggleZenMode={onToggleZenMode}
                />

                <div
                    className={`flex-1 flex overflow-hidden relative ${EDITOR_MAIN_AREA_BG_LIGHT} ${EDITOR_MAIN_AREA_BG_DARK} transition-all duration-300 ease-in-out`}
                // Adjust right padding if inspector is open to prevent content shift, or let motion.div handle it.
                // style={{ paddingRight: isPropertiesInspectorOpen ? '20rem' : '0' }} // 20rem = w-80
                >
                    <motion.main
                        layout // Animate layout changes when PropertiesInspector appears/disappears
                        className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6 md:p-8"
                        onClick={handleCanvasClick} // Click on empty space around the canvas to deselect
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
                            onCanvasClick={handleCanvasClick} // Pass for clicks directly on the grid background
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
                    // QR related props can be passed here if TableEditor needs them
                    />
                </div>
            </div>

            <ConfirmationModal
                isOpen={isClearConfirmationOpen}
                onClose={() => setIsClearConfirmationOpen(false)}
                onConfirm={confirmClearAll}
                title="Clear Entire Layout"
                message="Are you sure you want to clear the entire layout and reset grid settings? This action cannot be undone using the history."
                confirmText="Yes, Clear All"
                cancelText="Cancel"
                type="danger"
            />
            {/* Global AlertModal is handled by VenueDesignerPage */}
        </DndProvider>
    );
};

export default LayoutEditor;