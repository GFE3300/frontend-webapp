import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { useDrop } from 'react-dnd';

import CanvasCell from './CanvasCell';
import PlacedItem from './PlacedItem';
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import { CELL_SIZE_REM as MAJOR_CELL_SIZE_REM } from '../../constants/layoutConstants';

// Localization
import slRaw from '../../utils/script_lines.js';
const sl = slRaw.venueManagement.editorCanvas;
// const slCanvasCell = slRaw.venueManagement.canvasCell; // For CanvasCell specific strings if needed there

const MIN_ITEM_DIMENSION_MINOR_CELLS = 1;

// Design Guideline Variables
const CANVAS_CONTAINER_STYLES = {
    bgLight: "bg-neutral-100",
    bgDark: "dark:bg-neutral-900",
    padding: "p-2 sm:p-3 md:p-4", // Adjusted padding
};
const CANVAS_GRID_STYLES = {
    base: "relative touch-none", // Ensure touch-none to prevent page scroll on touch devices during drag
    borderLight: "border border-neutral-300",
    borderDark: "dark:border-neutral-700",
    bgLight: "bg-white",
    bgDark: "dark:bg-neutral-800",
};
const RESIZE_PREVIEW_STYLES = {
    validBg: "bg-rose-500/20",
    validBorder: "border-rose-500",
    invalidBg: "bg-red-500/20",
    invalidBorder: "border-red-600",
    borderStyle: "border-2 border-dashed",
    borderRadius: "rounded-sm",
};
// --- End Design Guideline Variables ---


const EditorCanvas = ({
    majorGridRows, majorGridCols, gridSubdivision,
    designItems, ItemTypes, ITEM_CONFIGS,
    onAddItem,
    onMoveItem,
    onCellClickForPrimaryAction,
    moveCandidateItemId,
    activeToolForPlacement,
    onEraseDesignerItemFromCell, onEraseDesignerItemById,
    onUpdateItemProperty,
    onSelectItem, selectedItemId,
    canPlaceItem,
    draggedItemPreview,
    onUpdateDraggedItemPreview,
    isEraserActive,
    zoomLevel, // This is the prop
    onCanvasClick, // For deselecting items by clicking canvas background
}) => {
    const canvasGridRef = useRef(null); // Ref for the scaled grid itself
    const gridWrapperRef = useRef(null); // Ref for the container of the scaled grid (this will be the drop target for resize)
    const [minorCellSizePx, setMinorCellSizePx] = useState(16);

    // Refs to hold the latest values of props/state for use in callbacks that might close over stale values
    const draggedItemPreviewRef = useRef(draggedItemPreview);
    const designItemsRef = useRef(designItems);
    const zoomLevelRef = useRef(zoomLevel); // Correctly tracks the latest zoomLevel prop value
    const canPlaceItemRef = useRef(canPlaceItem);

    useEffect(() => { draggedItemPreviewRef.current = draggedItemPreview; }, [draggedItemPreview]);
    useEffect(() => { designItemsRef.current = designItems; }, [designItems]);
    useEffect(() => { zoomLevelRef.current = zoomLevel; }, [zoomLevel]); // Updates the ref when zoomLevel prop changes
    useEffect(() => { canPlaceItemRef.current = canPlaceItem; }, [canPlaceItem]);

    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => MAJOR_CELL_SIZE_REM / gridSubdivision, [gridSubdivision]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (rootFontSize > 0) {
                setMinorCellSizePx(minorCellSizeRem * rootFontSize);
            }
        }
    }, [minorCellSizeRem]);

    const [, dropTargetRefSetter] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE], // Only resize handles are dropped onto the grid wrapper
        hover: (dragPayload, monitor) => {
            const currentZoomLevel = zoomLevelRef.current; // Use the ref for the latest zoom value in calculations
            const currentDraggedItemPreview = draggedItemPreviewRef.current; // Use ref

            if (!monitor.isOver({ shallow: true }) || !gridWrapperRef.current || minorCellSizePx === 0 || currentZoomLevel === 0) {
                if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') {
                    onUpdateDraggedItemPreview(null);
                }
                return;
            }

            const { type: handleType, itemId, direction, originalItem: payloadOriginalItem } = dragPayload;
            if (handleType !== ItemTypes.RESIZE_HANDLE || !payloadOriginalItem || !itemId) {
                if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') onUpdateDraggedItemPreview(null);
                return;
            }

            const itemExists = designItemsRef.current.find(it => it.id === itemId);
            if (!itemExists) {
                if (currentDraggedItemPreview) onUpdateDraggedItemPreview(null);
                return;
            }

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) {
                if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') onUpdateDraggedItemPreview(null);
                return;
            }

            // Calculate mouse position relative to the unscaled grid
            // gridWrapperRef.current is the element that receives the drop events for resize handles
            const wrapperRect = gridWrapperRef.current.getBoundingClientRect();

            // Mouse position relative to the viewport
            const mouseX_viewport = clientOffset.x;
            const mouseY_viewport = clientOffset.y;

            // Mouse position relative to the top-left of the gridWrapper (which is scaled)
            const mouseX_on_wrapper_px = mouseX_viewport - wrapperRect.left;
            const mouseY_on_wrapper_px = mouseY_viewport - wrapperRect.top;

            // Adjust for zoom to get mouse position on the conceptual unscaled grid
            const mouseX_on_unscaled_grid_px = mouseX_on_wrapper_px / currentZoomLevel;
            const mouseY_on_unscaled_grid_px = mouseY_on_wrapper_px / currentZoomLevel;

            // Determine hovered minor cell on the unscaled grid
            const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));

            let newProposedAABBRowStart = payloadOriginalItem.gridPosition.rowStart;
            let newProposedAABBColStart = payloadOriginalItem.gridPosition.colStart;
            let newProposedBaseWMinor = payloadOriginalItem.w_minor;
            let newProposedBaseHMinor = payloadOriginalItem.h_minor;

            switch (direction) {
                case 'N':
                    newProposedBaseHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (payloadOriginalItem.gridPosition.rowStart + payloadOriginalItem.h_minor) - hoveredMinorR);
                    newProposedAABBRowStart = (payloadOriginalItem.gridPosition.rowStart + payloadOriginalItem.h_minor) - newProposedBaseHMinor;
                    break;
                case 'S':
                    newProposedBaseHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - payloadOriginalItem.gridPosition.rowStart + 1);
                    break;
                case 'W':
                    newProposedBaseWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (payloadOriginalItem.gridPosition.colStart + payloadOriginalItem.w_minor) - hoveredMinorC);
                    newProposedAABBColStart = (payloadOriginalItem.gridPosition.colStart + payloadOriginalItem.w_minor) - newProposedBaseWMinor;
                    break;
                case 'E':
                    newProposedBaseWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - payloadOriginalItem.gridPosition.colStart + 1);
                    break;
                default: break;
            }

            const tempItemForValidation = {
                ...payloadOriginalItem,
                gridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart },
                w_minor: newProposedBaseWMinor,
                h_minor: newProposedBaseHMinor,
            };
            const { w: previewAABB_W, h: previewAABB_H } = getEffectiveDimensionsUtil(tempItemForValidation);
            const isValid = canPlaceItemRef.current(newProposedAABBRowStart, newProposedAABBColStart, previewAABB_W, previewAABB_H, itemId);

            onUpdateDraggedItemPreview({
                type: 'resize', itemId, direction,
                previewGridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart },
                previewW_minor: previewAABB_W, previewH_minor: previewAABB_H,
                proposedBaseW_minor: newProposedBaseWMinor, proposedBaseH_minor: newProposedBaseHMinor,
                rotation: payloadOriginalItem.rotation, isValid,
            });
        },
        drop: (dragPayload, monitor) => {
            const currentDraggedItemPreview = draggedItemPreviewRef.current; // Use ref
            if (!currentDraggedItemPreview || currentDraggedItemPreview.type !== 'resize' || !currentDraggedItemPreview.isValid || !currentDraggedItemPreview.itemId) {
                if (currentDraggedItemPreview) onUpdateDraggedItemPreview(null);
                return;
            }
            const { itemId, previewGridPosition, proposedBaseW_minor, proposedBaseH_minor } = currentDraggedItemPreview;
            onUpdateItemProperty(itemId, {
                gridPosition: { ...previewGridPosition },
                w_minor: proposedBaseW_minor,
                h_minor: proposedBaseH_minor,
            });
            onUpdateDraggedItemPreview(null);
        },
    }), [ // Dependencies for useDrop
        ItemTypes, onUpdateItemProperty, onUpdateDraggedItemPreview,
        totalMinorRows, totalMinorCols, minorCellSizePx,
        zoomLevel, // <<< --- THIS IS THE CRITICAL FIX ---
        getEffectiveDimensionsUtil // Include if its definition or usage implies dependency on props/state not captured by refs
    ]);

    // Connect the drop target ref to the gridWrapperRef
    useEffect(() => {
        if (gridWrapperRef.current) {
            dropTargetRefSetter(gridWrapperRef.current);
        }
    }, [dropTargetRefSetter]);

    // Style for the dynamically scaled grid canvas itself
    const canvasGridDynamicStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        width: `${majorGridCols * MAJOR_CELL_SIZE_REM}rem`,
        height: `${majorGridRows * MAJOR_CELL_SIZE_REM}rem`,
        transform: `scale(${zoomLevel})`, // Use the zoomLevel prop directly for styling
        transformOrigin: 'top left', // Scale from top-left
        transition: 'transform 0.05s linear', // Faster transition for smoother feel
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, zoomLevel]);

    // Style for the wrapper that contains the scaled grid. This wrapper's actual screen size changes with zoom.
    const gridWrapperStyle = useMemo(() => ({
        width: `${majorGridCols * MAJOR_CELL_SIZE_REM * zoomLevel}rem`, // Actual width on screen
        height: `${majorGridRows * MAJOR_CELL_SIZE_REM * zoomLevel}rem`, // Actual height on screen
        margin: 'auto', // Keeps the wrapper centered if canvas area is larger
        position: 'relative', // For absolute positioning of items within the scaled grid's coordinate system
        // Visual styles for the wrapper itself, if any (e.g., for debugging bounds)
        // backgroundColor: 'rgba(0, 255, 0, 0.1)', // Example: light green debug background
        borderRadius: '0.375rem', // Tailwind's rounded-md
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // Tailwind's shadow-lg
    }), [majorGridCols, majorGridRows, zoomLevel]);

    const handleCanvasMouseLeave = useCallback(() => {
        if (draggedItemPreviewRef.current && (draggedItemPreviewRef.current.type === 'placement' || draggedItemPreviewRef.current.type === 'resize')) {
            onUpdateDraggedItemPreview(null);
        }
    }, [onUpdateDraggedItemPreview]);

    const gridContainerClasses = useMemo(() =>
        `${CANVAS_GRID_STYLES.base} ${CANVAS_GRID_STYLES.borderLight} ${CANVAS_GRID_STYLES.borderDark} ${CANVAS_GRID_STYLES.bgLight} ${CANVAS_GRID_STYLES.bgDark}`
        , []);

    return (
        <div
            className={`flex-1 w-full h-full overflow-auto
                        ${CANVAS_CONTAINER_STYLES.padding}`}
            onClick={onCanvasClick}
            role="application"
            aria-label={sl.mainCanvasAreaLabel || "Venue Layout Design Canvas"}
        >
            <div ref={gridWrapperRef} style={gridWrapperStyle} className="grid-wrapper-for-scroll"> {/* This is the drop target for resize */}
                <div
                    ref={canvasGridRef} // This is the scaled grid
                    className={gridContainerClasses}
                    style={canvasGridDynamicStyle}
                    onMouseLeave={handleCanvasMouseLeave}
                    role="grid"
                    aria-label={sl.gridRegionLabel || "Layout Grid Area"}
                    aria-rowcount={totalMinorRows}
                    aria-colcount={totalMinorCols}
                >
                    {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                        Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                            const minorRow = rIndex + 1;
                            const minorCol = cIndex + 1;
                            const isMajorRBoundary = (minorRow % gridSubdivision === 0 && minorRow !== totalMinorRows) || (gridSubdivision === 1 && minorRow !== totalMinorRows);
                            const isMajorCBoundary = (minorCol % gridSubdivision === 0 && minorCol !== totalMinorCols) || (gridSubdivision === 1 && minorCol !== totalMinorCols);
                            return (
                                <CanvasCell
                                    key={`cell-${minorRow}-${minorCol}`}
                                    r_minor={minorRow} c_minor={minorCol}
                                    isMajorRowBoundary={isMajorRBoundary} isMajorColBoundary={isMajorCBoundary}
                                    gridSubdivision={gridSubdivision}
                                    onAddItemToLayout={onAddItem}
                                    onMoveExistingItem={onMoveItem}
                                    onCellClickForPrimaryAction={onCellClickForPrimaryAction}
                                    moveCandidateItemId={moveCandidateItemId}
                                    activeToolForPlacement={activeToolForPlacement}
                                    canPlaceItemAtCoords={canPlaceItemRef.current} // Use ref
                                    currentDraggedItemPreview={draggedItemPreviewRef.current} // Use ref
                                    onUpdateCurrentDraggedItemPreview={onUpdateDraggedItemPreview}
                                    isEraserActive={isEraserActive}
                                    onEraseItemFromCell={onEraseDesignerItemFromCell}
                                    ItemTypes={ItemTypes}
                                />
                            );
                        })
                    )}

                    {/* Resize Preview Overlay */}
                    {draggedItemPreviewRef.current?.type === 'resize' && draggedItemPreviewRef.current.itemId && (
                        <div
                            className={`absolute pointer-events-none ${RESIZE_PREVIEW_STYLES.borderStyle} ${RESIZE_PREVIEW_STYLES.borderRadius}
                                        ${draggedItemPreviewRef.current.isValid ? `${RESIZE_PREVIEW_STYLES.validBg} ${RESIZE_PREVIEW_STYLES.validBorder}` : `${RESIZE_PREVIEW_STYLES.invalidBg} ${RESIZE_PREVIEW_STYLES.invalidBorder}`}`}
                            style={{
                                top: `${(draggedItemPreviewRef.current.previewGridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                                left: `${(draggedItemPreviewRef.current.previewGridPosition.colStart - 1) * minorCellSizeRem}rem`,
                                width: `${draggedItemPreviewRef.current.previewW_minor * minorCellSizeRem}rem`,
                                height: `${draggedItemPreviewRef.current.previewH_minor * minorCellSizeRem}rem`,
                                zIndex: 100, // Ensure preview is above items but below handles
                            }}
                            aria-hidden="true" // It's a visual status indicator
                        />
                    )}

                    {/* Placed Items */}
                    <AnimatePresence>
                        {designItemsRef.current.map(item => { // Use ref
                            if (!item || !item.id || !item.gridPosition) return null;
                            const isCurrentlySelected = selectedItemId === item.id;
                            const currentLocalDraggedPreview = draggedItemPreviewRef.current; // Use ref
                            const isHiddenForThisResizePreview = currentLocalDraggedPreview?.type === 'resize' && currentLocalDraggedPreview?.itemId === item.id;

                            if (isHiddenForThisResizePreview) return null;

                            return (
                                <PlacedItem
                                    key={item.id} item={item}
                                    isEraserActive={isEraserActive}
                                    onEraseItemById={onEraseDesignerItemById}
                                    onUpdateItemProperty={onUpdateItemProperty}
                                    onSelectItem={onSelectItem} isSelected={isCurrentlySelected}
                                    moveCandidateItemId={moveCandidateItemId}
                                    minorCellSizeRem={minorCellSizeRem}
                                    ItemTypes={ItemTypes} ITEM_CONFIGS={ITEM_CONFIGS}
                                    zoomLevel={zoomLevelRef.current} // Use ref for child rendering
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default EditorCanvas;