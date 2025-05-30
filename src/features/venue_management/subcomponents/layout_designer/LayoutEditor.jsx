// frontend/src/features/venue_management/subcomponents/layout_designer/LayoutEditor.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion'; // Keep motion if used, but might be minimal here

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

const EDITOR_MAIN_AREA_BG_LIGHT = 'bg-neutral-100'; // Match VenueDesignerPage for consistency if applicable
const EDITOR_MAIN_AREA_BG_DARK = 'dark:bg-neutral-900'; // Match VenueDesignerPage
const DEBUG_LAYOUT_EDITOR = "[LayoutEditor DEBUG]";

const LayoutEditor = ({
    initialLayout, // Expected in frontend format: { designItems, gridDimensions, name, kitchenArea? }
    onSaveTrigger, // (currentLayoutSnapshot) => Promise<boolean>
    // onSaveAndExitTrigger, // This is handled by VenueDesignerPage if needed
    onContentChange, // () => void
    openAlert, // (title, message, type) => void
    isZenMode,
    onToggleZenMode,
}) => {
    // --- State ---
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [isPropertiesInspectorOpen, setIsPropertiesInspectorOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL);
    const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);

    // Prepare initialLayoutConfig for useLayoutDesignerStateManagement
    // initialLayout.designItems are ALREADY in frontend format, parsed by VenueDesignerPage
    const initialLayoutConfigForHook = useMemo(() => {
        console.log(DEBUG_LAYOUT_EDITOR, "Preparing initialLayoutConfigForHook. initialLayout received:", initialLayout);
        return {
            initialDesignItems: initialLayout?.designItems ? JSON.parse(JSON.stringify(initialLayout.designItems)) : Object.freeze([]),
            initialGridRows: initialLayout?.gridDimensions?.rows ?? DEFAULT_INITIAL_GRID_ROWS,
            initialGridCols: initialLayout?.gridDimensions?.cols ?? DEFAULT_INITIAL_GRID_COLS,
            initialGridSubdivision: initialLayout?.gridDimensions?.gridSubdivision ?? DEFAULT_GRID_SUBDIVISION,
            // Note: name and kitchenArea from initialLayout are not directly used by useLayoutDesignerStateManagement,
            // but are part of the overall layout snapshot this editor manages.
        };
    }, [initialLayout]);

    const layoutManager = useLayoutDesignerStateManagement(initialLayoutConfigForHook, openAlert);
    const interactionsManager = useDesignerInteractions();

    // --- Callbacks ---
    const handleSelectItem = useCallback((itemId) => {
        setSelectedItemId(prevId => {
            const newId = prevId === itemId ? null : itemId;
            setIsPropertiesInspectorOpen(!!newId);
            return newId;
        });
        if (interactionsManager.isEraserActive) {
            interactionsManager.toggleEraser(); // Deactivate eraser if an item is selected
        }
    }, [interactionsManager]);

    const deselectAndCloseInspector = useCallback(() => {
        setSelectedItemId(null);
        setIsPropertiesInspectorOpen(false);
    }, []);

    // This canvas click handler is for deselecting when the canvas *background* is clicked.
    // EditorCanvas itself handles clicks on cells. PlacedItem handles clicks on items.
    const handleCanvasAreaClick = useCallback((event) => {
        // Check if the click was on the direct child of motion.main (the EditorCanvas wrapper)
        // or on motion.main itself. This helps avoid deselecting if a modal or other overlay inside EditorCanvas is clicked.
        if (event.target === event.currentTarget) {
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

    const getCurrentLayoutSnapshotForSave = useCallback(() => ({
        designItems: JSON.parse(JSON.stringify(layoutManager.designItems)), // Deep copy
        gridDimensions: {
            rows: layoutManager.gridRows,
            cols: layoutManager.gridCols,
            gridSubdivision: layoutManager.gridSubdivision,
        },
        name: initialLayout?.name, // Preserve the original layout name unless changed via UI (not implemented here)
        // kitchenArea: layoutManager.kitchenArea, // If kitchen area is managed by layoutManager
    }), [layoutManager, initialLayout?.name]);

    const handleSave = useCallback(async () => {
        if (!validateLayoutForSave()) return false; // Explicitly return false
        if (onSaveTrigger) {
            const layoutToSave = getCurrentLayoutSnapshotForSave();
            console.log(DEBUG_LAYOUT_EDITOR, "Triggering onSaveTrigger with snapshot:", layoutToSave);
            const success = await onSaveTrigger(layoutToSave); // onSaveTrigger is async
            return success; // Propagate success status
        }
        openAlert("Save Error", "Save function not configured.", "warning");
        return false;
    }, [validateLayoutForSave, getCurrentLayoutSnapshotForSave, onSaveTrigger, openAlert]);

    const attemptClearAll = useCallback(() => setIsClearConfirmationOpen(true), []);

    const confirmClearAll = useCallback(() => {
        setIsClearConfirmationOpen(false);
        layoutManager.resetToDefaults(); // This resets items and grid to defaults within layoutManager
        deselectAndCloseInspector();
        setZoomLevel(DEFAULT_ZOOM_LEVEL);
        // onContentChange will be triggered by the useEffect below due to layoutManager state change
    }, [layoutManager, deselectAndCloseInspector]);

    const handleUpdateItemProperties = useCallback((itemId, propertyUpdates) => {
        // updateItemProperties in layoutManager returns a boolean indicating success
        return layoutManager.updateItemProperties(itemId, propertyUpdates);
    }, [layoutManager]);


    // --- Effects ---
    // Effect to notify parent (VenueDesignerPage) of content changes
    useEffect(() => {
        const currentLayoutMgrState = {
            designItems: layoutManager.designItems,
            gridRows: layoutManager.gridRows,
            gridCols: layoutManager.gridCols,
            gridSubdivision: layoutManager.gridSubdivision,
        };

        // initialLayoutConfigForHook is derived from props, represents the "saved" or "initial" state
        const propDerivedInitialState = {
            designItems: initialLayoutConfigForHook.initialDesignItems,
            gridRows: initialLayoutConfigForHook.initialGridRows,
            gridCols: initialLayoutConfigForHook.initialGridCols,
            gridSubdivision: initialLayoutConfigForHook.initialGridSubdivision,
        };

        const sortById = (a, b) => (String(a.id) < String(b.id) ? -1 : (String(a.id) > String(b.id) ? 1 : 0));

        // Create comparable snapshots
        const currentComparableSnapshot = {
            designItems: [...currentLayoutMgrState.designItems].sort(sortById).map(item => ({ ...item, id: String(item.id) })), // Standardize ID to string for comparison if mixed
            gridDimensions: { ...currentLayoutMgrState }, // gridRows, cols, subdivision
        };
        delete currentComparableSnapshot.gridDimensions.designItems; // Remove redundant items

        const initialComparableSnapshot = {
            designItems: [...propDerivedInitialState.designItems].sort(sortById).map(item => ({ ...item, id: String(item.id) })),
            gridDimensions: { ...propDerivedInitialState },
        };
        delete initialComparableSnapshot.gridDimensions.designItems;

        const currentSnapshotString = JSON.stringify(currentComparableSnapshot);
        const initialSnapshotString = JSON.stringify(initialComparableSnapshot);

        if (currentSnapshotString !== initialSnapshotString) {
            console.error(DEBUG_LAYOUT_EDITOR, "CONTENT MISMATCH DETECTED! Calling onContentChange.");
            console.log(DEBUG_LAYOUT_EDITOR, "Current State (from layoutManager, sorted, string IDs):", JSON.parse(currentSnapshotString));
            console.log(DEBUG_LAYOUT_EDITOR, "Initial/Prop State (from initialLayoutConfigForHook, sorted, string IDs):", JSON.parse(initialSnapshotString));

            // Further deep diff if needed:
            // import { diff } from 'deep-object-diff'; // Example library
            // console.log("Difference:", diff(JSON.parse(initialSnapshotString), JSON.parse(currentSnapshotString)));

            if (onContentChange) {
                onContentChange();
            }
        }
    }, [
        layoutManager.designItems, layoutManager.gridRows, layoutManager.gridCols, layoutManager.gridSubdivision,
        initialLayoutConfigForHook, // This object reference itself will change when props change
        onContentChange
    ]);
    
    // Effect to deselect item if it's removed from designItems
    useEffect(() => {
        if (selectedItemId && !layoutManager.designItems.find(item => item.id === selectedItemId)) {
            console.log(DEBUG_LAYOUT_EDITOR, `Selected item ${selectedItemId} no longer exists. Deselecting.`);
            setSelectedItemId(null);
            setIsPropertiesInspectorOpen(false);
        }
    }, [layoutManager.designItems, selectedItemId]);

    // Keyboard shortcuts (Escape, Ctrl+S, Ctrl+Z, Ctrl+Y)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (interactionsManager.draggedItemPreview) { // Highest priority: cancel drag preview
                    interactionsManager.updateDraggedItemPreview(null);
                } else if (isPropertiesInspectorOpen) {
                    deselectAndCloseInspector();
                } else if (selectedItemId) {
                    setSelectedItemId(null);
                } else if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                } else if (isZenMode) { // If nothing else, Esc exits Zen mode
                    onToggleZenMode();
                }
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                handleSave();
            }
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                layoutManager.undo();
            }
            if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
                event.preventDefault();
                layoutManager.redo();
            }
            // Add other shortcuts, e.g., 'e' for eraser
            if (event.key.toLowerCase() === 'e' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
                // Make sure no input field is focused
                if (document.activeElement?.tagName?.toLowerCase() !== 'input' && document.activeElement?.tagName?.toLowerCase() !== 'select' && document.activeElement?.tagName?.toLowerCase() !== 'textarea') {
                    event.preventDefault();
                    interactionsManager.toggleEraser();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        selectedItemId, isPropertiesInspectorOpen, interactionsManager, layoutManager,
        handleSave, deselectAndCloseInspector, isZenMode, onToggleZenMode // Added ZenMode dependencies
    ]);

    console.log(DEBUG_LAYOUT_EDITOR, "Rendering. SelectedItemId:", selectedItemId, "InspectorOpen:", isPropertiesInspectorOpen);

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
                onSave={handleSave} // This is the save action for the toolbar button
                onClearAll={attemptClearAll} // This action resets layoutManager's state (items and grid to default)
                isZenMode={isZenMode} onToggleZenMode={onToggleZenMode}
            />

            <div
                className={`flex-1 flex overflow-hidden relative ${EDITOR_MAIN_AREA_BG_LIGHT} ${EDITOR_MAIN_AREA_BG_DARK} transition-colors duration-300 ease-in-out`}
            >
                {/* motion.main acts as the clickable background area for deselecting items */}
                <motion.main
                    layout // Enable layout animations for this container if its size changes
                    className="flex-1 overflow-auto" // Removed p-x, EditorCanvas handles its own padding and centering
                    onClick={handleCanvasAreaClick}
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
                        onCanvasClick={handleCanvasAreaClick} // Pass for deselect from canvas background itself
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
                message="Are you sure you want to clear all items and reset grid settings to default? This action will be recorded in history but directly clearing is a significant step."
                confirmText="Yes, Clear All & Reset"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default LayoutEditor;