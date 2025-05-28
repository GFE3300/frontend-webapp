// features/venue_management/subcomponents/layout_designer/EditorCanvas.jsx
import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
// getEmptyImage is still needed if ResizeHandle uses a custom drag preview,
// but the main canvas's useDrop doesn't need it if it's not creating a custom preview for handles.
// For now, assuming PlacedItem's ResizeHandle handles its own preview.
// import { getEmptyImage } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';

// Child Components
import CanvasCell from './CanvasCell';
import PlacedItem from './PlacedItem';

// Utilities & Constants
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import { CELL_SIZE_REM as MAJOR_CELL_SIZE_REM } from '../../constants/layoutConstants';
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1; // Smallest an item can be in minor cells

// --- Design Guideline Variables (Tailwind class names based on your system) ---
const CANVAS_CONTAINER_STYLES = {
    bgLight: "bg-neutral-100",
    bgDark: "dark:bg-neutral-900",
    padding: "p-4 sm:p-6 md:p-8",
};

const CANVAS_GRID_STYLES = {
    base: "relative mx-auto rounded-md shadow-lg",
    borderLight: "border border-neutral-300",
    borderDark: "dark:border-neutral-700",
    bgLight: "bg-white",
    bgDark: "dark:bg-neutral-800", // Grid background, for item ring offsets
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
    onAddItem, onMoveItem,
    onEraseDesignerItemFromCell, onEraseDesignerItemById,
    onUpdateItemProperty,
    onSelectItem, selectedItemId,
    canPlaceItem,
    draggedItemPreview, onUpdateDraggedItemPreview,
    isEraserActive,
    zoomLevel,
    onCanvasClick, // For deselecting items by clicking on empty canvas area
}) => {
    const canvasGridRef = useRef(null);
    const [minorCellSizePx, setMinorCellSizePx] = useState(16); // Default, updated in useEffect

    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => MAJOR_CELL_SIZE_REM / gridSubdivision, [gridSubdivision]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (rootFontSize > 0 && gridSubdivision > 0) {
                setMinorCellSizePx((MAJOR_CELL_SIZE_REM / gridSubdivision) * rootFontSize);
            }
        }
    }, [minorCellSizeRem, gridSubdivision]);

    // This useDrop hook is now ONLY for RESIZE_HANDLE drags occurring over the canvas.
    // Rotation handle drags are no longer handled here.
    const [{ isOverCanvasForResizeDrag }, dropTargetRefSetter] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE], // Only accept resize handles
        hover: (dragPayload, monitor) => {
            if (!monitor.isOver({ shallow: true }) || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                return;
            }

            const { type: handleType, itemId, direction, originalItem } = dragPayload;
            // Ensure it's a resize handle and originalItem is present
            if (handleType !== ItemTypes.RESIZE_HANDLE || !originalItem) {
                return;
            }

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const gridRect = canvasGridRef.current.getBoundingClientRect();
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;

            // Logic for RESIZE_HANDLE
            const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));

            let { gridPosition: origPos, w_minor: origW, h_minor: origH, rotation: origRot } = originalItem;
            let newRowStart = origPos.rowStart;
            let newColStart = origPos.colStart;
            let newWMinor = origW;
            let newHMinor = origH;

            // Determine new dimensions based on handle direction and item rotation
            if (origRot === 0 || origRot === 180) { // Horizontal or upside-down
                switch (direction) {
                    case 'N': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.rowStart + origH) - hoveredMinorR); newRowStart = (origPos.rowStart + origH) - newHMinor; break;
                    case 'S': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - origPos.rowStart + 1); break;
                    case 'W': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.colStart + origW) - hoveredMinorC); newColStart = (origPos.colStart + origW) - newWMinor; break;
                    case 'E': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - origPos.colStart + 1); break;
                    default: break;
                }
            } else { // 90 or 270 degrees rotation (Vertical orientation)
                switch (direction) {
                    case 'N': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.rowStart + origW) - hoveredMinorR); newRowStart = (origPos.rowStart + origW) - newWMinor; break;
                    case 'S': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - origPos.rowStart + 1); break;
                    case 'W': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.colStart + origH) - hoveredMinorC); newColStart = (origPos.colStart + origH) - newHMinor; break;
                    case 'E': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - origPos.colStart + 1); break;
                    default: break;
                }
            }
            const tempItemForValidation = { ...originalItem, gridPosition: { rowStart: newRowStart, colStart: newColStart }, w_minor: newWMinor, h_minor: newHMinor, rotation: origRot };
            const { w: effW_check, h: effH_check } = getEffectiveDimensionsUtil(tempItemForValidation);
            const isValid = canPlaceItem(newRowStart, newColStart, effW_check, effH_check, itemId);

            onUpdateDraggedItemPreview({
                type: 'resize', itemId,
                gridPosition: { rowStart: newRowStart, colStart: newColStart },
                w_minor: newWMinor, h_minor: newHMinor,
                effW_minor: effW_check, effH_minor: effH_check,
                rotation: origRot, isValid,
            });
        },
        drop: (dragPayload, monitor) => {
            if (!draggedItemPreview || (draggedItemPreview.type === 'resize' && !draggedItemPreview.isValid)) {
                onUpdateDraggedItemPreview(null);
                return;
            }

            const { type: previewType, itemId } = draggedItemPreview;

            if (previewType === 'resize') {
                const { gridPosition, w_minor, h_minor } = draggedItemPreview;
                onUpdateItemProperty(itemId, {
                    gridPosition: { rowStart: gridPosition.rowStart, colStart: gridPosition.colStart },
                    w_minor: w_minor,
                    h_minor: h_minor,
                });
            }
            // No else block for 'rotation' as it's no longer handled here.
            onUpdateDraggedItemPreview(null);
        },
        collect: monitor => ({
            isOverCanvasForResizeDrag: !!monitor.isOver({ shallow: true }) &&
                monitor.getItemType() === ItemTypes.RESIZE_HANDLE,
        }),
    }), [
        totalMinorRows, totalMinorCols, minorCellSizePx, zoomLevel,
        canPlaceItem, onUpdateItemProperty, onUpdateDraggedItemPreview, ItemTypes, draggedItemPreview,
    ]);

    useEffect(() => {
        if (canvasGridRef.current) {
            dropTargetRefSetter(canvasGridRef.current);
        }
    }, [dropTargetRefSetter]);

    const canvasGridDynamicStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        width: `${majorGridCols * MAJOR_CELL_SIZE_REM}rem`,
        height: `${majorGridRows * MAJOR_CELL_SIZE_REM}rem`,
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left',
        transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)', // Smooth zoom
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, zoomLevel]);

    const handleCanvasMouseLeave = useCallback(() => {
        // Clear placement or resize preview if mouse leaves the grid area
        if (draggedItemPreview && (draggedItemPreview.type === 'placement' || draggedItemPreview.type === 'resize')) {
            onUpdateDraggedItemPreview(null);
        }
    }, [draggedItemPreview, onUpdateDraggedItemPreview]);

    // Safeguard for critical ItemTypes prop and specific required types
    if (!ItemTypes || typeof ItemTypes.RESIZE_HANDLE !== 'string') {
        return (
            <div className="p-5 text-red-600 bg-red-100 rounded-md">
                Error: Critical ItemTypes configuration missing (RESIZE_HANDLE).
            </div>
        );
    }

    return (
        <div
            className={`flex-1 w-full h-full overflow-auto
                        ${CANVAS_CONTAINER_STYLES.bgLight} ${CANVAS_CONTAINER_STYLES.bgDark}
                        ${CANVAS_CONTAINER_STYLES.padding}
                        flex items-center justify-center`}
            onClick={onCanvasClick} // For deselecting items when clicking empty canvas background
            role="application" // Main interactive region
            aria-label="Venue Layout Design Canvas"
        >
            <div
                ref={canvasGridRef} // Ref for DND resize handle drop target
                className={`${CANVAS_GRID_STYLES.base} ${CANVAS_GRID_STYLES.borderLight} ${CANVAS_GRID_STYLES.borderDark} ${CANVAS_GRID_STYLES.bgLight} ${CANVAS_GRID_STYLES.bgDark}`}
                style={canvasGridDynamicStyle}
                onMouseLeave={handleCanvasMouseLeave} // Clear previews if mouse leaves grid
            >
                {/* Render Minor Grid Cells (CanvasCell) */}
                {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                    Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                        const minorRow = rIndex + 1;
                        const minorCol = cIndex + 1;
                        const isMajorRBoundary = minorRow % gridSubdivision === 0 && minorRow !== totalMinorRows;
                        const isMajorCBoundary = minorCol % gridSubdivision === 0 && minorCol !== totalMinorCols;

                        return (
                            <CanvasCell
                                key={`cell-${minorRow}-${minorCol}`}
                                r_minor={minorRow} c_minor={minorCol}
                                isMajorRowBoundary={isMajorRBoundary} isMajorColBoundary={isMajorCBoundary}
                                gridSubdivision={gridSubdivision}
                                onAddItemToLayout={onAddItem} onMoveExistingItem={onMoveItem}
                                canPlaceItemAtCoords={canPlaceItem}
                                currentDraggedItemPreview={draggedItemPreview} // For placement preview
                                onUpdateCurrentDraggedItemPreview={onUpdateDraggedItemPreview}
                                isEraserActive={isEraserActive}
                                onEraseItemFromCell={onEraseDesignerItemFromCell}
                                ItemTypes={ItemTypes} // Pass all DND item types
                            />
                        );
                    })
                )}

                {/* Resize Preview Overlay (only for type 'resize') */}
                {draggedItemPreview && draggedItemPreview.type === 'resize' && draggedItemPreview.itemId && (
                    <div
                        className={`absolute pointer-events-none ${RESIZE_PREVIEW_STYLES.borderStyle} ${RESIZE_PREVIEW_STYLES.borderRadius}
                                    ${draggedItemPreview.isValid ? `${RESIZE_PREVIEW_STYLES.validBg} ${RESIZE_PREVIEW_STYLES.validBorder}` : `${RESIZE_PREVIEW_STYLES.invalidBg} ${RESIZE_PREVIEW_STYLES.invalidBorder}`}`}
                        style={{
                            top: `${(draggedItemPreview.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                            left: `${(draggedItemPreview.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
                            width: `${draggedItemPreview.effW_minor * minorCellSizeRem}rem`,
                            height: `${draggedItemPreview.effH_minor * minorCellSizeRem}rem`,
                            transform: `rotate(${draggedItemPreview.rotation || 0}deg)`,
                            transformOrigin: 'center center',
                            zIndex: 150, // Above cells, below items being actively dragged by body
                        }}
                    />
                )}

                {/* Render All Placed Design Items */}
                <AnimatePresence>
                    {designItems.filter(item => item && item.id && item.gridPosition).map(item => {
                        const isCurrentlySelected = selectedItemId === item.id;
                        // Do not render the item if it's the one being actively previewed for resize
                        const isHiddenForResizePreview = draggedItemPreview?.type === 'resize' && draggedItemPreview?.itemId === item.id;
                        if (isHiddenForResizePreview) return null;

                        // Rotation is directly from item.rotation; no preview manipulation here.
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
                            // Ring offset classes removed from here; PlacedItem handles them directly
                            />
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EditorCanvas;