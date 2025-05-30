import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';

// Child Components
import CanvasCell from './CanvasCell';
import PlacedItem from './PlacedItem';

// Utilities & Constants
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import { CELL_SIZE_REM as MAJOR_CELL_SIZE_REM } from '../../constants/layoutConstants';
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1;

// Design Guideline Variables (assuming these are appropriate)
const CANVAS_CONTAINER_STYLES = {
    bgLight: "bg-neutral-100",
    bgDark: "dark:bg-neutral-900",
    padding: "p-4 sm:p-6 md:p-8", // Padding for the scrollable area around the grid
};

const CANVAS_GRID_STYLES = {
    base: "relative mx-auto rounded-md shadow-lg touch-none", // Added touch-none to help with drag interactions on touch devices
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

const DEBUG_EDITOR_CANVAS = "[EditorCanvas DEBUG]";

const EditorCanvas = ({
    majorGridRows, majorGridCols, gridSubdivision,
    designItems, ItemTypes, ITEM_CONFIGS,
    onAddItem, onMoveItem,
    onEraseDesignerItemFromCell, onEraseDesignerItemById,
    onUpdateItemProperty,
    onSelectItem, selectedItemId,
    canPlaceItem, // This is layoutManager.canPlaceItem
    draggedItemPreview, onUpdateDraggedItemPreview, // From interactionsManager
    isEraserActive,
    zoomLevel,
    onCanvasClick, // For deselecting by clicking canvas background
}) => {
    const canvasGridRef = useRef(null);
    const [minorCellSizePx, setMinorCellSizePx] = useState(16); // Fallback

    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => MAJOR_CELL_SIZE_REM / gridSubdivision, [gridSubdivision]); // MAJOR_CELL_SIZE_REM is a const

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (rootFontSize > 0) {
                setMinorCellSizePx(minorCellSizeRem * rootFontSize);
            }
        }
    }, [minorCellSizeRem]);

    // useDrop hook for handling resize handle drops onto the canvas
    const [, dropTargetRefSetter] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE], // Only accept resize handles
        hover: (dragPayload, monitor) => {
            // Ensure the drop target (canvasGridRef) is available and mouse is over it
            if (!monitor.isOver({ shallow: true }) || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                // If not over, or prerequisites not met, clear any resize preview
                if (draggedItemPreview && draggedItemPreview.type === 'resize') {
                    onUpdateDraggedItemPreview(null);
                }
                return;
            }

            const { type: handleType, itemId, direction, originalItem: payloadOriginalItem } = dragPayload;

            // Only proceed if it's a resize handle and we have the original item data
            if (handleType !== ItemTypes.RESIZE_HANDLE || !payloadOriginalItem || !itemId) {
                 if (draggedItemPreview && draggedItemPreview.type === 'resize') onUpdateDraggedItemPreview(null);
                return;
            }
            
            // Find the current state of the item being resized (important if other props changed)
            const currentItemState = designItems.find(it => it.id === itemId);
            if (!currentItemState) { // Item might have been deleted while dragging
                if (draggedItemPreview) onUpdateDraggedItemPreview(null);
                return;
            }

            // Use payloadOriginalItem for stable base dimensions and initial position during drag
            const baseW_from_payload = payloadOriginalItem.w_minor;
            const baseH_from_payload = payloadOriginalItem.h_minor;
            const originalGridPos = payloadOriginalItem.gridPosition; // Use original position as anchor for calc
            const item_rotation = payloadOriginalItem.rotation;


            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) {
                 if (draggedItemPreview && draggedItemPreview.type === 'resize') onUpdateDraggedItemPreview(null);
                return;
            }

            const gridRect = canvasGridRef.current.getBoundingClientRect();
            // Calculate mouse position relative to the unscaled grid
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;

            // Convert mouse position to minor grid cell coordinates (1-based)
            // Ensure hovered cell is within grid boundaries
            const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));
            
            let newProposedAABBRowStart = originalGridPos.rowStart;
            let newProposedAABBColStart = originalGridPos.colStart;
            let newProposedBaseWMinor = baseW_from_payload;
            let newProposedBaseHMinor = baseH_from_payload;

            // Calculate new base dimensions and AABB top-left based on drag direction
            switch (direction) {
                case 'N': // Dragging North handle (top edge)
                    newProposedBaseHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (originalGridPos.rowStart + baseH_from_payload) - hoveredMinorR);
                    newProposedAABBRowStart = (originalGridPos.rowStart + baseH_from_payload) - newProposedBaseHMinor;
                    break;
                case 'S': // Dragging South handle (bottom edge)
                    newProposedBaseHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - originalGridPos.rowStart + 1);
                    break;
                case 'W': // Dragging West handle (left edge)
                    newProposedBaseWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (originalGridPos.colStart + baseW_from_payload) - hoveredMinorC);
                    newProposedAABBColStart = (originalGridPos.colStart + baseW_from_payload) - newProposedBaseWMinor;
                    break;
                case 'E': // Dragging East handle (right edge)
                    newProposedBaseWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - originalGridPos.colStart + 1);
                    break;
                default: break;
            }
            
            // Create a temporary item with these new PROPOSED BASE dimensions and position for validation
            const tempItemForValidation = {
                ...payloadOriginalItem, // Start with original item data
                gridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart },
                w_minor: newProposedBaseWMinor, // These are new proposed BASE dimensions
                h_minor: newProposedBaseHMinor,
                // rotation is fixed during resize
            };
            
            // Get effective AABB dimensions for the preview rectangle based on these proposed base dimensions
            const { w: previewAABB_W, h: previewAABB_H } = getEffectiveDimensionsUtil(tempItemForValidation);
            const isValid = canPlaceItem(newProposedAABBRowStart, newProposedAABBColStart, previewAABB_W, previewAABB_H, itemId);

            onUpdateDraggedItemPreview({
                type: 'resize', itemId,
                direction, // Store direction for drop logic
                // These are for the VISUAL PREVIEW RECTANGLE (AABB)
                previewGridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart },
                previewW_minor: previewAABB_W,
                previewH_minor: previewAABB_H,
                // Store the PROPOSED NEW BASE dimensions separately for the drop handler
                proposedBaseW_minor: newProposedBaseWMinor,
                proposedBaseH_minor: newProposedBaseHMinor,
                rotation: item_rotation, // Keep original rotation for the preview
                isValid,
            });
        },
        drop: (dragPayload, monitor) => {
            if (!draggedItemPreview || draggedItemPreview.type !== 'resize' || !draggedItemPreview.isValid || !draggedItemPreview.itemId) {
                if (draggedItemPreview) onUpdateDraggedItemPreview(null); // Clear invalid or irrelevant preview
                return;
            }
            
            // Use the validated proposed base dimensions and AABB position from the preview state
            const { 
                itemId, 
                previewGridPosition, // This is the new AABB top-left
                proposedBaseW_minor, // This is the new base width
                proposedBaseH_minor  // This is the new base height
            } = draggedItemPreview;

            const updateProps = {
                gridPosition: { ...previewGridPosition }, // New AABB top-left
                w_minor: proposedBaseW_minor,          // New base width
                h_minor: proposedBaseH_minor,          // New base height
            };
            
            console.log(DEBUG_EDITOR_CANVAS, `Resize drop confirmed for item ${itemId}. Updating with:`, updateProps);
            onUpdateItemProperty(itemId, updateProps);
            onUpdateDraggedItemPreview(null); // Clear preview on successful drop
        },
    }), [
        designItems, totalMinorRows, totalMinorCols, minorCellSizePx, zoomLevel,
        canPlaceItem, onUpdateItemProperty, onUpdateDraggedItemPreview, ItemTypes, draggedItemPreview,
        getEffectiveDimensionsUtil 
    ]);

    useEffect(() => {
        if (canvasGridRef.current) {
            dropTargetRefSetter(canvasGridRef.current); // Attach drop target to the grid div
        }
    }, [dropTargetRefSetter]);

    const canvasGridDynamicStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        width: `${majorGridCols * MAJOR_CELL_SIZE_REM}rem`,
        height: `${majorGridRows * MAJOR_CELL_SIZE_REM}rem`,
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left', // Common origin for scaling
        transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, zoomLevel]);

    const handleCanvasMouseLeave = useCallback(() => {
        // Clear any active placement or resize preview if mouse leaves the grid area
        if (draggedItemPreview && (draggedItemPreview.type === 'placement' || draggedItemPreview.type === 'resize')) {
            console.log(DEBUG_EDITOR_CANVAS, "Mouse left canvas grid, clearing draggedItemPreview:", draggedItemPreview);
            onUpdateDraggedItemPreview(null);
        }
    }, [draggedItemPreview, onUpdateDraggedItemPreview]);
    
    return (
        <div // This is the scrollable container for the zoomable grid
            className={`flex-1 w-full h-full overflow-auto
                        ${CANVAS_CONTAINER_STYLES.bgLight} ${CANVAS_CONTAINER_STYLES.bgDark}
                        ${CANVAS_CONTAINER_STYLES.padding}
                        flex items-center justify-center`} // Center the (potentially smaller) zoomable grid
            onClick={onCanvasClick} // Handles deselecting items when clicking the empty area
            role="application"
            aria-label="Venue Layout Design Canvas"
        >
            <div // This is the direct parent of the grid, might be useful for transform calculations if needed
                ref={canvasGridRef} // The drop target for resize handles is this grid
                className={`${CANVAS_GRID_STYLES.base} ${CANVAS_GRID_STYLES.borderLight} ${CANVAS_GRID_STYLES.borderDark} ${CANVAS_GRID_STYLES.bgLight} ${CANVAS_GRID_STYLES.bgDark}`}
                style={canvasGridDynamicStyle}
                onMouseLeave={handleCanvasMouseLeave}
            >
                {/* Render Grid Cells */}
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
                                onAddItemToLayout={onAddItem} onMoveExistingItem={onMoveItem}
                                canPlaceItemAtCoords={canPlaceItem}
                                currentDraggedItemPreview={draggedItemPreview}
                                onUpdateCurrentDraggedItemPreview={onUpdateDraggedItemPreview}
                                isEraserActive={isEraserActive}
                                onEraseItemFromCell={onEraseDesignerItemFromCell}
                                ItemTypes={ItemTypes}
                            />
                        );
                    })
                )}

                {/* Resize Preview Div: Positioned relative to canvasGridRef */}
                {draggedItemPreview && draggedItemPreview.type === 'resize' && draggedItemPreview.itemId && (
                    <div
                        className={`absolute pointer-events-none ${RESIZE_PREVIEW_STYLES.borderStyle} ${RESIZE_PREVIEW_STYLES.borderRadius}
                                    ${draggedItemPreview.isValid ? `${RESIZE_PREVIEW_STYLES.validBg} ${RESIZE_PREVIEW_STYLES.validBorder}` : `${RESIZE_PREVIEW_STYLES.invalidBg} ${RESIZE_PREVIEW_STYLES.invalidBorder}`}`}
                        style={{
                            top: `${(draggedItemPreview.previewGridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                            left: `${(draggedItemPreview.previewGridPosition.colStart - 1) * minorCellSizeRem}rem`,
                            width: `${draggedItemPreview.previewW_minor * minorCellSizeRem}rem`,
                            height: `${draggedItemPreview.previewH_minor * minorCellSizeRem}rem`,
                            zIndex: 100, 
                        }}
                        aria-hidden="true"
                    />
                )}

                {/* Render Placed Items */}
                <AnimatePresence>
                    {designItems.filter(item => item && item.id && item.gridPosition).map(item => {
                        const isCurrentlySelected = selectedItemId === item.id;
                        // An item is hidden if a resize operation for THIS item is active (preview is shown instead)
                        const isHiddenForThisResizePreview = draggedItemPreview?.type === 'resize' && draggedItemPreview?.itemId === item.id;

                        if (isHiddenForThisResizePreview) return null;

                        return (
                            <PlacedItem
                                key={item.id} item={item}
                                isEraserActive={isEraserActive}
                                onEraseItemById={onEraseDesignerItemById}
                                onUpdateItemProperty={onUpdateItemProperty}
                                onSelectItem={onSelectItem} isSelected={isCurrentlySelected}
                                minorCellSizeRem={minorCellSizeRem}
                                ItemTypes={ItemTypes} ITEM_CONFIGS={ITEM_CONFIGS}
                                zoomLevel={zoomLevel}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EditorCanvas;