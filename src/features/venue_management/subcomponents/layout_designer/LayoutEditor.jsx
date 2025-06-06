import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';

import useLayoutDesignerStateManagement from '../../hooks/useLayoutDesignerStateManagement';
import useDesignerInteractions from '../../hooks/useDesignerInteractions';
import EditorToolbar from './EditorToolbar';
import EditorCanvas from './EditorCanvas';
import PropertiesInspector from './PropertiesInspector';
import {
    DEFAULT_ZOOM_LEVEL, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, ZOOM_STEP,
    DEFAULT_INITIAL_GRID_ROWS, DEFAULT_INITIAL_GRID_COLS, DEFAULT_GRID_SUBDIVISION
} from '../../constants/layoutConstants';
import { ItemTypes, toolDefinitions, ITEM_CONFIGS } from '../../constants/itemConfigs';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// Localization
import slRaw, { interpolate } from '../../utils/script_lines.js';
const sl = slRaw.venueManagement.layoutEditor;
const slCommon = slRaw; // For general strings

const DEBUG_LAYOUT_EDITOR = "[LayoutEditor DEBUG]";

const createComparableSnapshotPart = (items) => {
    if (!Array.isArray(items)) return [];
    return JSON.parse(JSON.stringify(items)).sort((a, b) => String(a.id).localeCompare(String(b.id)));
};

const LayoutEditor = forwardRef(({ // Wrapped with forwardRef
    initialLayout,
    onSaveTrigger,
    onContentChange,
    openAlert, // This comes from VenueDesignerPage, already localized there
    isZenMode,
    onToggleZenMode,
}, ref) => { // Added ref parameter
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [moveCandidateItemId, setMoveCandidateItemId] = useState(null);
    const [activeToolForPlacement, setActiveToolForPlacement] = useState(null);
    const [isPropertiesInspectorOpen, setIsPropertiesInspectorOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL);
    const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);

    const initialLayoutConfigForHook = useMemo(() => {
        const items = initialLayout?.designItems ? JSON.parse(JSON.stringify(initialLayout.designItems)) : Object.freeze([]);
        return {
            initialDesignItems: items,
            initialGridRows: initialLayout?.gridDimensions?.rows ?? DEFAULT_INITIAL_GRID_ROWS,
            initialGridCols: initialLayout?.gridDimensions?.cols ?? DEFAULT_INITIAL_GRID_COLS,
            initialGridSubdivision: initialLayout?.gridDimensions?.gridSubdivision ?? DEFAULT_GRID_SUBDIVISION,
        };
    }, [initialLayout]);

    const layoutManager = useLayoutDesignerStateManagement(initialLayoutConfigForHook, openAlert);
    const interactionsManager = useDesignerInteractions();

    // Expose getCurrentLayoutSnapshot via ref for VenueDesignerPage
    useImperativeHandle(ref, () => ({
        getCurrentLayoutSnapshot: () => {
            return {
                designItems: JSON.parse(JSON.stringify(layoutManager.designItems)),
                gridDimensions: {
                    rows: layoutManager.gridRows,
                    cols: layoutManager.gridCols,
                    gridSubdivision: layoutManager.gridSubdivision,
                },
                name: initialLayout?.name, // Preserve name from initial prop
            };
        }
    }));


    const deselectAllAndClearModes = useCallback(() => {
        setSelectedItemId(null);
        setIsPropertiesInspectorOpen(false);
        setMoveCandidateItemId(null);
        setActiveToolForPlacement(null);
    }, []);

    const handleSelectItem = useCallback((itemId) => {
        setSelectedItemId(prevSelectedId => {
            const newSelectedId = prevSelectedId === itemId ? null : itemId;
            if (newSelectedId) {
                setMoveCandidateItemId(newSelectedId);
                setActiveToolForPlacement(null);
                setIsPropertiesInspectorOpen(true);
                if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                }
            } else {
                setMoveCandidateItemId(null);
                setIsPropertiesInspectorOpen(false);
            }
            return newSelectedId;
        });
    }, [interactionsManager]);

    const handleCanvasAreaClick = useCallback((event) => {
        if (event.target === event.currentTarget) {
            if (selectedItemId || isPropertiesInspectorOpen || moveCandidateItemId || activeToolForPlacement) {
                deselectAllAndClearModes();
            }
        }
    }, [selectedItemId, isPropertiesInspectorOpen, moveCandidateItemId, activeToolForPlacement, deselectAllAndClearModes]);

    const handleToolbarToolSelect = useCallback((toolDefinition) => {
        setActiveToolForPlacement(prevTool => {
            const newActiveTool = prevTool?.name === toolDefinition?.name ? null : toolDefinition;
            if (newActiveTool) {
                console.log(DEBUG_LAYOUT_EDITOR, interpolate(sl.toolSelectedForPlacement || "Tool selected: {toolName}", { toolName: newActiveTool.name }));
                setSelectedItemId(null);
                setMoveCandidateItemId(null);
                setIsPropertiesInspectorOpen(false);
                if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                }
            } else {
                console.log(DEBUG_LAYOUT_EDITOR, sl.toolDeselectedForPlacement || "Tool deselected.");
            }
            return newActiveTool;
        });
    }, [interactionsManager]);


    const handleCanvasCellPrimaryClick = useCallback((targetMinorRow, targetMinorCol) => {
        if (interactionsManager.isEraserActive) {
            return;
        }

        if (activeToolForPlacement) {
            console.log(DEBUG_LAYOUT_EDITOR, interpolate(sl.cellClickedNewItem || "New item at R{row}C{col}", { toolName: activeToolForPlacement.name, row: targetMinorRow, col: targetMinorCol }));
            layoutManager.addItemToLayout(activeToolForPlacement, targetMinorRow, targetMinorCol);
        } else if (moveCandidateItemId) {
            console.log(DEBUG_LAYOUT_EDITOR, interpolate(sl.cellClickedExistingItem || "Move {itemId} to R{row}C{col}", { itemId: moveCandidateItemId, row: targetMinorRow, col: targetMinorCol }));
            layoutManager.moveExistingItem(moveCandidateItemId, targetMinorRow, targetMinorCol);
            setMoveCandidateItemId(null);
        }
    }, [activeToolForPlacement, moveCandidateItemId, layoutManager, interactionsManager.isEraserActive]);


    const handleZoomIn = useCallback(() => { setZoomLevel(prev => Math.min(MAX_ZOOM_LEVEL, parseFloat((prev + ZOOM_STEP).toFixed(2)))); }, []);
    const handleZoomOut = useCallback(() => { setZoomLevel(prev => Math.max(MIN_ZOOM_LEVEL, parseFloat((prev - ZOOM_STEP).toFixed(2)))); }, []);
    const handleResetZoom = useCallback(() => { setZoomLevel(DEFAULT_ZOOM_LEVEL); }, []);

    const validateLayoutForSave = useCallback(() => {
        const tablesToValidate = layoutManager.designItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE);
        const hasInvalidTables = tablesToValidate.some(t => t.isProvisional || typeof t.number !== 'number' || t.number <= 0);
        const tableNumbers = tablesToValidate
            .filter(t => typeof t.number === 'number' && t.number > 0)
            .map(t => t.number);
        const hasDuplicateTableNumbers = new Set(tableNumbers).size !== tableNumbers.length;

        if (hasInvalidTables || hasDuplicateTableNumbers) {
            let message = "";
            if (hasInvalidTables) message += (sl.validationErrorInvalidTables || "Ensure all tables have valid, positive numbers.") + " ";
            if (hasDuplicateTableNumbers) message += (sl.validationErrorDuplicateTableNumbers || "Table numbers must be unique.");
            openAlert(sl.validationErrorTitle || "Layout Validation Error", message.trim(), "error");
            return false;
        }
        return true;
    }, [layoutManager.designItems, openAlert]);

    const getCurrentLayoutSnapshotForSave = useCallback(() => {
        return {
            designItems: JSON.parse(JSON.stringify(layoutManager.designItems)),
            gridDimensions: {
                rows: layoutManager.gridRows,
                cols: layoutManager.gridCols,
                gridSubdivision: layoutManager.gridSubdivision,
            },
            name: initialLayout?.name,
        };
    }, [layoutManager, initialLayout?.name]);

    const handleSave = useCallback(async () => {
        if (!validateLayoutForSave()) return false;
        if (onSaveTrigger) {
            const layoutToSave = getCurrentLayoutSnapshotForSave();
            const success = await onSaveTrigger(layoutToSave);
            return success;
        }
        openAlert(slCommon.error || "Error", sl.saveErrorNotConfigured || "Save function not configured.", "warning");
        return false;
    }, [validateLayoutForSave, getCurrentLayoutSnapshotForSave, onSaveTrigger, openAlert]);

    const attemptClearAll = useCallback(() => setIsClearConfirmationOpen(true), []);
    const confirmClearAll = useCallback(() => {
        setIsClearConfirmationOpen(false);
        layoutManager.resetToDefaults(); // This now resets history and uses default constants
        deselectAllAndClearModes();
        setZoomLevel(DEFAULT_ZOOM_LEVEL);
        // openAlert for "Designer Cleared" is handled within layoutManager.resetToDefaults
    }, [layoutManager, deselectAllAndClearModes]);

    const handleUpdateItemProperties = useCallback((itemId, propertyUpdates) => {
        const success = layoutManager.updateItemProperties(itemId, propertyUpdates);
        if (moveCandidateItemId === itemId && propertyUpdates.isFixed === true) {
            setMoveCandidateItemId(null);
        }
        return success;
    }, [layoutManager, moveCandidateItemId]);


    useEffect(() => {
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

        if (currentSnapshotString !== initialSnapshotString) {
            if (onContentChange) onContentChange();
        }
    }, [
        layoutManager.designItems, layoutManager.gridRows, layoutManager.gridCols, layoutManager.gridSubdivision,
        initialLayoutConfigForHook,
        onContentChange
    ]);

    useEffect(() => {
        if (selectedItemId && !layoutManager.designItems.find(item => item.id === selectedItemId)) {
            deselectAllAndClearModes();
        }
    }, [layoutManager.designItems, selectedItemId, deselectAllAndClearModes]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (interactionsManager.draggedItemPreview) {
                    interactionsManager.updateDraggedItemPreview(null);
                } else if (activeToolForPlacement) {
                    setActiveToolForPlacement(null);
                } else if (moveCandidateItemId || isPropertiesInspectorOpen || selectedItemId) {
                    deselectAllAndClearModes();
                } else if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                } else if (isZenMode) {
                    onToggleZenMode();
                }
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); handleSave(); }
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') { event.preventDefault(); layoutManager.undo(); }
            if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) { event.preventDefault(); layoutManager.redo(); }

            if (event.key.toLowerCase() === 'e' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
                const activeEl = document.activeElement?.tagName?.toLowerCase();
                if (activeEl !== 'input' && activeEl !== 'select' && activeEl !== 'textarea') {
                    event.preventDefault();
                    if (moveCandidateItemId) setMoveCandidateItemId(null);
                    if (activeToolForPlacement) setActiveToolForPlacement(null);
                    interactionsManager.toggleEraser();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        selectedItemId, isPropertiesInspectorOpen, interactionsManager, layoutManager,
        handleSave, deselectAllAndClearModes, isZenMode, onToggleZenMode,
        moveCandidateItemId, activeToolForPlacement,
    ]);

    return (
        <div className="relative flex flex-col h-full w-full overflow-auto" role="application">
            <EditorToolbar
                majorGridRows={layoutManager.gridRows}
                majorGridCols={layoutManager.gridCols}
                currentGridSubdivision={layoutManager.gridSubdivision}
                onGridDimensionChange={(dimension, value) => layoutManager.setGridDimensions({ [dimension]: value })}
                onGridSubdivisionChange={layoutManager.setGridSubdivision}
                zoomLevel={zoomLevel}
                onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetZoom={handleResetZoom}
                toolDefinitions={toolDefinitions} /* ItemTypes implicitly used by DraggableTool via toolDefinitions */
                isEraserActive={interactionsManager.isEraserActive}
                onToggleEraser={interactionsManager.toggleEraser}
                onUndo={layoutManager.undo} onRedo={layoutManager.redo}
                canUndo={layoutManager.canUndo} canRedo={layoutManager.canRedo}
                onSave={handleSave}
                onClearAll={attemptClearAll} // This will show the confirmation modal
                isZenMode={isZenMode} onToggleZenMode={onToggleZenMode}
                onToolbarToolSelect={handleToolbarToolSelect}
                activeToolForPlacementName={activeToolForPlacement?.name}
            />

            <div
                className={`flex-1 flex overflow-visible relative transition-colors duration-300 ease-in-out`}
            >
                <motion.main
                    layout
                    className="flex-1 overflow-auto" // Ensure this can scroll if canvas is larger than viewport
                    onClick={handleCanvasAreaClick} // For deselecting items when clicking empty canvas area
                    role="region"
                    aria-label={sl.mainRegionLabel || "Layout Design Canvas Area"}
                >
                    <EditorCanvas
                        majorGridRows={layoutManager.gridRows}
                        majorGridCols={layoutManager.gridCols}
                        gridSubdivision={layoutManager.gridSubdivision}
                        designItems={layoutManager.designItems}
                        ItemTypes={ItemTypes} ITEM_CONFIGS={ITEM_CONFIGS}
                        onAddItem={layoutManager.addItemToLayout}
                        onMoveItem={layoutManager.moveExistingItem}
                        onCellClickForPrimaryAction={handleCanvasCellPrimaryClick}
                        moveCandidateItemId={moveCandidateItemId}
                        activeToolForPlacement={activeToolForPlacement}
                        onEraseDesignerItemFromCell={layoutManager.removeItemAtCoords}
                        onEraseDesignerItemById={layoutManager.removeItemById}
                        onUpdateItemProperty={handleUpdateItemProperties}
                        onSelectItem={handleSelectItem} selectedItemId={selectedItemId}
                        canPlaceItem={layoutManager.canPlaceItem}
                        draggedItemPreview={interactionsManager.draggedItemPreview}
                        onUpdateDraggedItemPreview={interactionsManager.updateDraggedItemPreview}
                        isEraserActive={interactionsManager.isEraserActive}
                        zoomLevel={zoomLevel}
                        onCanvasClick={handleCanvasAreaClick} // Also passed to EditorCanvas for its direct use if needed
                    />
                </motion.main>

                <PropertiesInspector
                    designItems={layoutManager.designItems}
                    selectedItemId={selectedItemId}
                    onUpdateItemProperties={handleUpdateItemProperties}
                    ITEM_CONFIGS={ITEM_CONFIGS} ItemTypes={ItemTypes}
                    isOpen={isPropertiesInspectorOpen}
                    onClose={deselectAllAndClearModes}
                    gridSubdivision={layoutManager.gridSubdivision}
                // No explicit aria-label here, assuming PropertiesInspector handles its own accessibility or is part of a larger labeled region
                />
            </div>

            <ConfirmationModal
                isOpen={isClearConfirmationOpen}
                onClose={() => setIsClearConfirmationOpen(false)}
                onConfirm={confirmClearAll}
                title={sl.confirmClearTitle || "Clear Entire Layout"}
                message={sl.confirmClearMessage || "Are you sure you want to clear all items and reset grid settings to default?"}
                confirmText={sl.confirmClearConfirmText || "Yes, Clear All & Reset"}
                cancelText={sl.confirmClearCancelText || "Cancel"}
                type="danger"
            />
        </div>
    );
});

export default LayoutEditor;