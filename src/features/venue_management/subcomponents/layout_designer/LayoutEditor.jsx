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

// Enhanced deep-copy and sort for robust comparison
const createComparableSnapshotPart = (items) => {
    if (!Array.isArray(items)) return [];
    return JSON.parse(JSON.stringify(items)).sort((a, b) => String(a.id).localeCompare(String(b.id)));
};


const LayoutEditor = ({
    initialLayout, // Expected in frontend format: { designItems, gridDimensions, name, kitchenArea? }
    onSaveTrigger, // (currentLayoutSnapshot) => Promise<boolean>
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

    console.log(DEBUG_LAYOUT_EDITOR, "LayoutEditor RENDER START. initialLayout prop:", JSON.parse(JSON.stringify(initialLayout || {})));

    const initialLayoutConfigForHook = useMemo(() => {
        // console.log(DEBUG_LAYOUT_EDITOR, "Recalculating initialLayoutConfigForHook. initialLayout received:", JSON.parse(JSON.stringify(initialLayout || {})));
        const items = initialLayout?.designItems ? JSON.parse(JSON.stringify(initialLayout.designItems)) : Object.freeze([]);
        const config = {
            initialDesignItems: items,
            initialGridRows: initialLayout?.gridDimensions?.rows ?? DEFAULT_INITIAL_GRID_ROWS,
            initialGridCols: initialLayout?.gridDimensions?.cols ?? DEFAULT_INITIAL_GRID_COLS,
            initialGridSubdivision: initialLayout?.gridDimensions?.gridSubdivision ?? DEFAULT_GRID_SUBDIVISION,
        };
        // console.log(DEBUG_LAYOUT_EDITOR, "initialLayoutConfigForHook CREATED:", JSON.parse(JSON.stringify(config)));
        return config;
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
            interactionsManager.toggleEraser();
        }
    }, [interactionsManager]);

    const deselectAndCloseInspector = useCallback(() => {
        setSelectedItemId(null);
        setIsPropertiesInspectorOpen(false);
    }, []);

    const handleCanvasAreaClick = useCallback((event) => {
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

    const getCurrentLayoutSnapshotForSave = useCallback(() => {
        const snapshot = {
            designItems: JSON.parse(JSON.stringify(layoutManager.designItems)), // Deep copy
            gridDimensions: {
                rows: layoutManager.gridRows,
                cols: layoutManager.gridCols,
                gridSubdivision: layoutManager.gridSubdivision,
            },
            name: initialLayout?.name, // Preserve the original layout name unless changed via UI (not implemented here)
        };
        console.log(DEBUG_LAYOUT_EDITOR, "getCurrentLayoutSnapshotForSave CALLED. Snapshot designItems count:", snapshot.designItems.length, "Snapshot content:", JSON.parse(JSON.stringify(snapshot)));
        return snapshot;
    }, [layoutManager, initialLayout?.name]);

    const handleSave = useCallback(async () => {
        console.log(DEBUG_LAYOUT_EDITOR, "handleSave CALLED in LayoutEditor.");
        if (!validateLayoutForSave()) {
            console.log(DEBUG_LAYOUT_EDITOR, "handleSave: Validation FAILED.");
            return false;
        }
        if (onSaveTrigger) {
            const layoutToSave = getCurrentLayoutSnapshotForSave();
            console.log(DEBUG_LAYOUT_EDITOR, "handleSave: Triggering onSaveTrigger (from VenueDesignerPage) with layoutToSave:", JSON.parse(JSON.stringify(layoutToSave)));
            const success = await onSaveTrigger(layoutToSave); // onSaveTrigger is async (handleSaveLayoutFromEditor in VenueDesignerPage)
            console.log(DEBUG_LAYOUT_EDITOR, "handleSave: onSaveTrigger returned:", success);
            return success; // Propagate success status
        }
        openAlert("Save Error", "Save function (onSaveTrigger) not configured for LayoutEditor.", "warning");
        console.log(DEBUG_LAYOUT_EDITOR, "handleSave: onSaveTrigger is NOT defined.");
        return false;
    }, [validateLayoutForSave, getCurrentLayoutSnapshotForSave, onSaveTrigger, openAlert]);

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
        console.log(DEBUG_LAYOUT_EDITOR, "Change detection EFFECT RUNNING. Dependencies:", {
            designItemsCount: layoutManager.designItems.length,
            gridRows: layoutManager.gridRows,
            gridCols: layoutManager.gridCols,
            gridSubdivision: layoutManager.gridSubdivision,
            initialLayoutConfigForHook_designItemsCount: initialLayoutConfigForHook.initialDesignItems.length,
            initialLayoutConfigForHook_gridRows: initialLayoutConfigForHook.initialGridRows,
            // Not logging full objects initially to avoid overly verbose logs, can add if needed
        });

        const currentLayoutMgrState = {
            designItems: layoutManager.designItems,
            gridRows: layoutManager.gridRows,
            gridCols: layoutManager.gridCols,
            gridSubdivision: layoutManager.gridSubdivision,
        };

        const propDerivedInitialState = {
            designItems: initialLayoutConfigForHook.initialDesignItems,
            gridRows: initialLayoutConfigForHook.initialGridRows,
            gridCols: initialLayoutConfigForHook.initialGridCols,
            gridSubdivision: initialLayoutConfigForHook.initialGridSubdivision,
        };

        const currentComparableDesignItems = createComparableSnapshotPart(currentLayoutMgrState.designItems);
        const initialComparableDesignItems = createComparableSnapshotPart(propDerivedInitialState.designItems);

        const currentGridComparable = {
            rows: currentLayoutMgrState.gridRows,
            cols: currentLayoutMgrState.gridCols,
            gridSubdivision: currentLayoutMgrState.gridSubdivision,
        };
        const initialGridComparable = {
            rows: propDerivedInitialState.gridRows,
            cols: propDerivedInitialState.gridCols,
            gridSubdivision: propDerivedInitialState.gridSubdivision,
        };

        const currentSnapshotString = JSON.stringify({ designItems: currentComparableDesignItems, gridDimensions: currentGridComparable });
        const initialSnapshotString = JSON.stringify({ designItems: initialComparableDesignItems, gridDimensions: initialGridComparable });

        // Log the states before comparison
        console.log(DEBUG_LAYOUT_EDITOR, "Current State (from layoutManager, for comparison):", JSON.parse(currentSnapshotString));
        console.log(DEBUG_LAYOUT_EDITOR, "Initial/Prop State (from initialLayoutConfigForHook, for comparison):", JSON.parse(initialSnapshotString));

        if (currentSnapshotString !== initialSnapshotString) {
            console.warn(DEBUG_LAYOUT_EDITOR, "CONTENT MISMATCH DETECTED! Calling onContentChange.");
            if (onContentChange) {
                onContentChange();
            }
        } else {
            console.log(DEBUG_LAYOUT_EDITOR, "Content matches initial/prop state. No onContentChange needed.");
        }
    }, [
        layoutManager.designItems, layoutManager.gridRows, layoutManager.gridCols, layoutManager.gridSubdivision,
        initialLayoutConfigForHook,
        onContentChange
    ]);

    useEffect(() => {
        if (selectedItemId && !layoutManager.designItems.find(item => item.id === selectedItemId)) {
            console.log(DEBUG_LAYOUT_EDITOR, `Selected item ${selectedItemId} no longer exists. Deselecting.`);
            setSelectedItemId(null);
            setIsPropertiesInspectorOpen(false);
        }
    }, [layoutManager.designItems, selectedItemId]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (interactionsManager.draggedItemPreview) {
                    interactionsManager.updateDraggedItemPreview(null);
                } else if (isPropertiesInspectorOpen) {
                    deselectAndCloseInspector();
                } else if (selectedItemId) {
                    setSelectedItemId(null);
                } else if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                } else if (isZenMode) {
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
            if (event.key.toLowerCase() === 'e' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
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
        handleSave, deselectAndCloseInspector, isZenMode, onToggleZenMode
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
                onSave={handleSave}
                onClearAll={attemptClearAll}
                isZenMode={isZenMode} onToggleZenMode={onToggleZenMode}
            />

            <div
                className={`flex-1 flex overflow-hidden relative ${EDITOR_MAIN_AREA_BG_LIGHT} ${EDITOR_MAIN_AREA_BG_DARK} transition-colors duration-300 ease-in-out`}
            >
                <motion.main
                    layout
                    className="flex-1 overflow-auto"
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
                        onCanvasClick={handleCanvasAreaClick}
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