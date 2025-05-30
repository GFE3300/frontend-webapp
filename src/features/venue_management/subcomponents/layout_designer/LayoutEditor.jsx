// frontend/src/features/venue_management/subcomponents/layout_designer/LayoutEditor.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const EDITOR_MAIN_AREA_BG_LIGHT = 'bg-neutral-100';
const EDITOR_MAIN_AREA_BG_DARK = 'dark:bg-neutral-900';
const DEBUG_LAYOUT_EDITOR = "[LayoutEditor DEBUG]";

const createComparableSnapshotPart = (items) => {
    if (!Array.isArray(items)) return [];
    return JSON.parse(JSON.stringify(items)).sort((a, b) => String(a.id).localeCompare(String(b.id)));
};


const LayoutEditor = ({
    initialLayout,
    onSaveTrigger,
    onContentChange,
    openAlert,
    isZenMode,
    onToggleZenMode,
}) => {
    // --- State ---
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [moveCandidateItemId, setMoveCandidateItemId] = useState(null);
    const [activeToolForPlacement, setActiveToolForPlacement] = useState(null); // << NEW: Tool selected from toolbar
    const [isPropertiesInspectorOpen, setIsPropertiesInspectorOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL);
    const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);

    const initialLayoutConfigForHook = useMemo(() => {
        const items = initialLayout?.designItems ? JSON.parse(JSON.stringify(initialLayout.designItems)) : Object.freeze([]);
        const config = {
            initialDesignItems: items,
            initialGridRows: initialLayout?.gridDimensions?.rows ?? DEFAULT_INITIAL_GRID_ROWS,
            initialGridCols: initialLayout?.gridDimensions?.cols ?? DEFAULT_INITIAL_GRID_COLS,
            initialGridSubdivision: initialLayout?.gridDimensions?.gridSubdivision ?? DEFAULT_GRID_SUBDIVISION,
        };
        return config;
    }, [initialLayout]);

    const layoutManager = useLayoutDesignerStateManagement(initialLayoutConfigForHook, openAlert);
    const interactionsManager = useDesignerInteractions(); // isEraserActive, toggleEraser, draggedItemPreview, updateDraggedItemPreview

    // --- Callbacks ---

    const deselectAllAndClearModes = useCallback(() => {
        setSelectedItemId(null);
        setIsPropertiesInspectorOpen(false);
        setMoveCandidateItemId(null);
        setActiveToolForPlacement(null);
        // interactionsManager.updateDraggedItemPreview(null); // Clear DND previews if any
        // Don't toggle eraser here, it's a separate user action
    }, [/* Stable setters */]);

    const handleSelectItem = useCallback((itemId) => {
        setSelectedItemId(prevSelectedId => {
            const newSelectedId = prevSelectedId === itemId ? null : itemId;
            if (newSelectedId) {
                setMoveCandidateItemId(newSelectedId);
                setActiveToolForPlacement(null); // << If selecting an item, cancel "new tool placement" mode
                setIsPropertiesInspectorOpen(true);
                if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                }
            } else {
                // Deselecting the current item or cleared by canvas click
                setMoveCandidateItemId(null);
                // setActiveToolForPlacement(null); // Don't clear active tool if just deselecting an item
                setIsPropertiesInspectorOpen(false);
            }
            return newSelectedId;
        });
    }, [interactionsManager /* Stable setters */]);

    const handleCanvasAreaClick = useCallback((event) => {
        if (event.target === event.currentTarget) {
            if (selectedItemId || isPropertiesInspectorOpen || moveCandidateItemId || activeToolForPlacement) {
                deselectAllAndClearModes();
            }
        }
    }, [selectedItemId, isPropertiesInspectorOpen, moveCandidateItemId, activeToolForPlacement, deselectAllAndClearModes]);

    // << NEW: Callback when a tool is clicked in the EditorToolbar >>
    const handleToolbarToolSelect = useCallback((toolDefinition) => {
        setActiveToolForPlacement(prevTool => {
            const newActiveTool = prevTool?.name === toolDefinition?.name ? null : toolDefinition;
            if (newActiveTool) {
                console.log(DEBUG_LAYOUT_EDITOR, `Tool selected for placement: ${newActiveTool.name}`);
                // Cancel other interaction modes when a tool is selected for placement
                setSelectedItemId(null);
                setMoveCandidateItemId(null);
                setIsPropertiesInspectorOpen(false);
                if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                }
            } else {
                console.log(DEBUG_LAYOUT_EDITOR, `Tool deselected for placement.`);
            }
            return newActiveTool;
        });
    }, [interactionsManager]);


    const handleCanvasCellPrimaryClick = useCallback((targetMinorRow, targetMinorCol) => {
        if (interactionsManager.isEraserActive) {
            // Eraser logic is handled by onEraseDesignerItemFromCell passed to EditorCanvas -> CanvasCell
            // This function is primarily for non-eraser clicks now.
            // If CanvasCell calls this even with eraser, we can add:
            // layoutManager.removeItemAtCoords(targetMinorRow, targetMinorCol);
            // However, CanvasCell's own onClick should handle eraser first.
            return;
        }

        if (activeToolForPlacement) {
            console.log(DEBUG_LAYOUT_EDITOR, `Cell clicked for NEW item placement. Tool: ${activeToolForPlacement.name}, Target: R${targetMinorRow}C${targetMinorCol}`);
            layoutManager.addItemToLayout(activeToolForPlacement, targetMinorRow, targetMinorCol);
            // Decide if tool stays active for multiple placements or deactivates
            // setActiveToolForPlacement(null); // Deactivate after one placement
        } else if (moveCandidateItemId) {
            console.log(DEBUG_LAYOUT_EDITOR, `Cell clicked for EXISTING item move. Candidate: ${moveCandidateItemId}, Target: R${targetMinorRow}C${targetMinorCol}`);
            layoutManager.moveExistingItem(moveCandidateItemId, targetMinorRow, targetMinorCol);
            setMoveCandidateItemId(null); // Clear move candidate after attempt
            // Item remains selected (selectedItemId is not cleared here)
        }
        // If neither mode is active, a click on a cell currently does nothing more here.
        // Canvas background click handles full deselection.
    }, [
        activeToolForPlacement, moveCandidateItemId, layoutManager, interactionsManager.isEraserActive,
        // setActiveToolForPlacement, setMoveCandidateItemId // Stable setters
    ]);


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
            if (hasInvalidTables) message += "Ensure all tables have valid, positive numbers. ";
            if (hasDuplicateTableNumbers) message += "Table numbers must be unique.";
            openAlert("Layout Validation Error", message.trim(), "error");
            return false;
        }
        return true;
    }, [layoutManager.designItems, openAlert, ItemTypes.PLACED_TABLE]);
    const getCurrentLayoutSnapshotForSave = useCallback(() => {
        const snapshot = {
            designItems: JSON.parse(JSON.stringify(layoutManager.designItems)),
            gridDimensions: {
                rows: layoutManager.gridRows,
                cols: layoutManager.gridCols,
                gridSubdivision: layoutManager.gridSubdivision,
            },
            name: initialLayout?.name,
        };
        return snapshot;
    }, [layoutManager, initialLayout?.name]);
    const handleSave = useCallback(async () => {
        if (!validateLayoutForSave()) return false;
        if (onSaveTrigger) {
            const layoutToSave = getCurrentLayoutSnapshotForSave();
            const success = await onSaveTrigger(layoutToSave);
            return success;
        }
        openAlert("Save Error", "Save function (onSaveTrigger) not configured for LayoutEditor.", "warning");
        return false;
    }, [validateLayoutForSave, getCurrentLayoutSnapshotForSave, onSaveTrigger, openAlert]);
    const attemptClearAll = useCallback(() => setIsClearConfirmationOpen(true), []);
    const confirmClearAll = useCallback(() => { /* ... (no changes, uses deselectAllAndClearModes indirectly) ... */
        setIsClearConfirmationOpen(false);
        layoutManager.resetToDefaults();
        deselectAllAndClearModes();
        setZoomLevel(DEFAULT_ZOOM_LEVEL);
    }, [layoutManager, deselectAllAndClearModes]);

    const handleUpdateItemProperties = useCallback((itemId, propertyUpdates) => {
        const success = layoutManager.updateItemProperties(itemId, propertyUpdates);
        if (moveCandidateItemId === itemId && propertyUpdates.isFixed === true) {
            setMoveCandidateItemId(null);
        }
        // If properties of the activeToolForPlacement change (not typical, but possible if tool defs were dynamic)
        // or if an item update somehow invalidates activeToolForPlacement, clear it.
        // For now, assume tool definitions are static during placement.
        return success;
    }, [layoutManager, moveCandidateItemId /* Stable setters */]);


    // --- Effects ---
    useEffect(() => { /* ... (no changes to content change detection logic) ... */
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

    useEffect(() => { /* ... (no changes to selected item existence check) ... */
        if (selectedItemId && !layoutManager.designItems.find(item => item.id === selectedItemId)) {
            deselectAllAndClearModes();
        }
    }, [layoutManager.designItems, selectedItemId, deselectAllAndClearModes]);

    useEffect(() => { // Keyboard shortcuts
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (interactionsManager.draggedItemPreview) { // Active DND preview
                    interactionsManager.updateDraggedItemPreview(null);
                } else if (activeToolForPlacement) { // << NEW: Cancel active tool placement
                    setActiveToolForPlacement(null);
                } else if (moveCandidateItemId || isPropertiesInspectorOpen || selectedItemId) {
                    deselectAllAndClearModes();
                } else if (interactionsManager.isEraserActive) {
                    interactionsManager.toggleEraser();
                } else if (isZenMode) {
                    onToggleZenMode();
                }
            }
            // ... (Ctrl+S, Ctrl+Z, Ctrl+Y shortcuts unchanged) ...
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); handleSave(); }
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') { event.preventDefault(); layoutManager.undo(); }
            if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) { event.preventDefault(); layoutManager.redo(); }

            if (event.key.toLowerCase() === 'e' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
                if (document.activeElement?.tagName?.toLowerCase() !== 'input' && document.activeElement?.tagName?.toLowerCase() !== 'select' && document.activeElement?.tagName?.toLowerCase() !== 'textarea') {
                    event.preventDefault();
                    // If any placement/move mode is active, activating eraser should cancel them.
                    if (moveCandidateItemId) setMoveCandidateItemId(null);
                    if (activeToolForPlacement) setActiveToolForPlacement(null);
                    // if (selectedItemId) setSelectedItemId(null); // Optionally deselect too
                    interactionsManager.toggleEraser();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        selectedItemId, isPropertiesInspectorOpen, interactionsManager, layoutManager,
        handleSave, deselectAllAndClearModes, isZenMode, onToggleZenMode,
        moveCandidateItemId, activeToolForPlacement, // << Add new states
        // Stable setters
    ]);

    // console.log(DEBUG_LAYOUT_EDITOR, "Rendering. Selected:", selectedItemId, "MoveCand:", moveCandidateItemId, "ActiveTool:", activeToolForPlacement?.name);

    return (
        <div className="flex flex-col h-full w-full" role="application">
            <EditorToolbar
                // ... (existing props) ...
                onToolbarToolSelect={handleToolbarToolSelect} // << NEW PROP
                activeToolForPlacementName={activeToolForPlacement?.name} // << NEW PROP (optional, for toolbar visual feedback)
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
                        // ... (existing props) ...
                        onCellClickForPrimaryAction={handleCanvasCellPrimaryClick} // << RENAMED/UNIFIED prop
                        moveCandidateItemId={moveCandidateItemId}
                        activeToolForPlacement={activeToolForPlacement} // << NEW PROP
                        majorGridRows={layoutManager.gridRows}
                        majorGridCols={layoutManager.gridCols}
                        gridSubdivision={layoutManager.gridSubdivision}
                        designItems={layoutManager.designItems}
                        ItemTypes={ItemTypes} ITEM_CONFIGS={ITEM_CONFIGS}
                        onAddItem={layoutManager.addItemToLayout} // Still needed for DND from toolbar
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
                    onClose={deselectAllAndClearModes}
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