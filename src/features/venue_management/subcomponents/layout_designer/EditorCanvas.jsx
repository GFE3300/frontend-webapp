// features\venue_management\subcomponents\layout_designer\EditorCanvas.jsx
import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Child Components
import CanvasCell from './CanvasCell';
import PlacedItem from './PlacedItem';

// Utilities & Constants
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils'; // IMPORTED
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
    canPlaceItem, // Assumed: canPlaceItem(row, col, AABB_W, AABB_H, excludeId)
    draggedItemPreview, onUpdateDraggedItemPreview,
    isEraserActive,
    zoomLevel,
    onCanvasClick,
}) => {
    const canvasGridRef = useRef(null);
    const [minorCellSizePx, setMinorCellSizePx] = useState(16);

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

    const [{ isOverCanvasForResizeDrag }, dropTargetRefSetter] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE],
        hover: (dragPayload, monitor) => {
            if (!monitor.isOver({ shallow: true }) || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                return;
            }

            const { type: handleType, itemId, direction, originalItem: payloadOriginalItem } = dragPayload;
            if (handleType !== ItemTypes.RESIZE_HANDLE || !payloadOriginalItem) {
                return;
            }

            const currentItemFromState = designItems.find(it => it.id === itemId);
            if (!currentItemFromState) {
                onUpdateDraggedItemPreview(null);
                return;
            }

            const currentGridPos = currentItemFromState.gridPosition; // Current AABB top-left
            const baseW_before_resize = payloadOriginalItem.w_minor; // Base width before this resize op
            const baseH_before_resize = payloadOriginalItem.h_minor; // Base height before this resize op
            const rotation = payloadOriginalItem.rotation;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const gridRect = canvasGridRef.current.getBoundingClientRect();
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;

            const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));

            let newProposedAABBRowStart = currentGridPos.rowStart;
            let newProposedAABBColStart = currentGridPos.colStart;
            let newProposedBaseWMinor = baseW_before_resize;
            let newProposedBaseHMinor = baseH_before_resize;

            const MIN_DIM = MIN_ITEM_DIMENSION_MINOR_CELLS;

            // Calculate new BASE dimensions and new AABB top-left
            if (rotation === 0 || rotation === 180) { // Item is effectively horizontal
                switch (direction) {
                    case 'N':
                        newProposedBaseHMinor = Math.max(MIN_DIM, (currentGridPos.rowStart + baseH_before_resize) - hoveredMinorR);
                        newProposedAABBRowStart = (currentGridPos.rowStart + baseH_before_resize) - newProposedBaseHMinor;
                        break;
                    case 'S':
                        newProposedBaseHMinor = Math.max(MIN_DIM, hoveredMinorR - currentGridPos.rowStart + 1);
                        break;
                    case 'W':
                        newProposedBaseWMinor = Math.max(MIN_DIM, (currentGridPos.colStart + baseW_before_resize) - hoveredMinorC);
                        newProposedAABBColStart = (currentGridPos.colStart + baseW_before_resize) - newProposedBaseWMinor;
                        break;
                    case 'E':
                        newProposedBaseWMinor = Math.max(MIN_DIM, hoveredMinorC - currentGridPos.colStart + 1);
                        break;
                }
            } else { // Item is effectively vertical (rotation 90 or 270)
                switch (direction) {
                    case 'N': // Top of AABB, changes base width
                        newProposedBaseWMinor = Math.max(MIN_DIM, (currentGridPos.rowStart + baseW_before_resize) - hoveredMinorR);
                        newProposedAABBRowStart = (currentGridPos.rowStart + baseW_before_resize) - newProposedBaseWMinor;
                        break;
                    case 'S': // Bottom of AABB, changes base width
                        newProposedBaseWMinor = Math.max(MIN_DIM, hoveredMinorR - currentGridPos.rowStart + 1);
                        break;
                    case 'W': // Left of AABB, changes base height
                        newProposedBaseHMinor = Math.max(MIN_DIM, (currentGridPos.colStart + baseH_before_resize) - hoveredMinorC);
                        newProposedAABBColStart = (currentGridPos.colStart + baseH_before_resize) - newProposedBaseHMinor;
                        break;
                    case 'E': // Right of AABB, changes base height
                        newProposedBaseHMinor = Math.max(MIN_DIM, hoveredMinorC - currentGridPos.colStart + 1);
                        break;
                }
            }

            const tempItemForValidation = {
                ...payloadOriginalItem, // Use payload for other props like type, shape, etc.
                gridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart },
                w_minor: newProposedBaseWMinor,
                h_minor: newProposedBaseHMinor,
                rotation: rotation
            };
            const { w: previewAABB_W, h: previewAABB_H } = getEffectiveDimensionsUtil(tempItemForValidation);
            const isValid = canPlaceItem(newProposedAABBRowStart, newProposedAABBColStart, previewAABB_W, previewAABB_H, itemId);

            onUpdateDraggedItemPreview({
                type: 'resize', itemId,
                gridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart }, // AABB top-left
                w_minor: previewAABB_W, // AABB width for preview div
                h_minor: previewAABB_H, // AABB height for preview div
                rotation: rotation,
                isValid,
            });
        },
        drop: (dragPayload, monitor) => {
            const { isValid: previewIsValid, type: previewType } = draggedItemPreview || {};
            if (!draggedItemPreview || previewType !== 'resize' || !previewIsValid) {
                onUpdateDraggedItemPreview(null);
                return;
            }

            const { itemId, direction, originalItem: payloadOriginalItem } = dragPayload;

            const currentItemFromState = designItems.find(it => it.id === itemId);
            if (!currentItemFromState) {
                onUpdateDraggedItemPreview(null);
                return;
            }

            const currentGridPos = currentItemFromState.gridPosition;
            const baseW_before_resize = payloadOriginalItem.w_minor;
            const baseH_before_resize = payloadOriginalItem.h_minor;
            const rotation = payloadOriginalItem.rotation;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                onUpdateDraggedItemPreview(null);
                return;
            }

            const gridRect = canvasGridRef.current.getBoundingClientRect();
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;

            const droppedMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const droppedMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));

            let finalAABBRowStart = currentGridPos.rowStart;
            let finalAABBColStart = currentGridPos.colStart;
            let finalBaseWMinor = baseW_before_resize;
            let finalBaseHMinor = baseH_before_resize;
            const MIN_DIM = MIN_ITEM_DIMENSION_MINOR_CELLS;

            if (rotation === 0 || rotation === 180) {
                switch (direction) {
                    case 'N': finalBaseHMinor = Math.max(MIN_DIM, (currentGridPos.rowStart + baseH_before_resize) - droppedMinorR); finalAABBRowStart = (currentGridPos.rowStart + baseH_before_resize) - finalBaseHMinor; break;
                    case 'S': finalBaseHMinor = Math.max(MIN_DIM, droppedMinorR - currentGridPos.rowStart + 1); break;
                    case 'W': finalBaseWMinor = Math.max(MIN_DIM, (currentGridPos.colStart + baseW_before_resize) - droppedMinorC); finalAABBColStart = (currentGridPos.colStart + baseW_before_resize) - finalBaseWMinor; break;
                    case 'E': finalBaseWMinor = Math.max(MIN_DIM, droppedMinorC - currentGridPos.colStart + 1); break;
                }
            } else {
                switch (direction) {
                    case 'N': finalBaseWMinor = Math.max(MIN_DIM, (currentGridPos.rowStart + baseW_before_resize) - droppedMinorR); finalAABBRowStart = (currentGridPos.rowStart + baseW_before_resize) - finalBaseWMinor; break;
                    case 'S': finalBaseWMinor = Math.max(MIN_DIM, droppedMinorR - currentGridPos.rowStart + 1); break;
                    case 'W': finalBaseHMinor = Math.max(MIN_DIM, (currentGridPos.colStart + baseH_before_resize) - droppedMinorC); finalAABBColStart = (currentGridPos.colStart + baseH_before_resize) - finalBaseHMinor; break;
                    case 'E': finalBaseHMinor = Math.max(MIN_DIM, droppedMinorC - currentGridPos.colStart + 1); break;
                }
            }

            const finalItemForValidation = {
                ...payloadOriginalItem,
                gridPosition: { rowStart: finalAABBRowStart, colStart: finalAABBColStart },
                w_minor: finalBaseWMinor,
                h_minor: finalBaseHMinor,
                rotation: rotation
            };
            const { w: finalAABB_W, h: finalAABB_H } = getEffectiveDimensionsUtil(finalItemForValidation);

            if (canPlaceItem(finalAABBRowStart, finalAABBColStart, finalAABB_W, finalAABB_H, itemId)) {
                onUpdateItemProperty(itemId, {
                    gridPosition: { rowStart: finalAABBRowStart, colStart: finalAABBColStart },
                    w_minor: finalBaseWMinor, // Send new BASE width
                    h_minor: finalBaseHMinor, // Send new BASE height
                });
            }
            onUpdateDraggedItemPreview(null);
        },
        collect: monitor => ({
            isOverCanvasForResizeDrag: !!monitor.isOver({ shallow: true }) &&
                monitor.getItemType() === ItemTypes.RESIZE_HANDLE,
        }),
    }), [
        designItems, // ADDED designItems
        totalMinorRows, totalMinorCols, minorCellSizePx, zoomLevel,
        canPlaceItem, onUpdateItemProperty, onUpdateDraggedItemPreview, ItemTypes, draggedItemPreview,
        getEffectiveDimensionsUtil // Added dependency
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
        transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, zoomLevel]);

    const handleCanvasMouseLeave = useCallback(() => {
        if (draggedItemPreview && (draggedItemPreview.type === 'placement' || draggedItemPreview.type === 'resize')) {
            onUpdateDraggedItemPreview(null);
        }
    }, [draggedItemPreview, onUpdateDraggedItemPreview]);

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
            onClick={onCanvasClick}
            role="application"
            aria-label="Venue Layout Design Canvas"
        >
            <div
                ref={canvasGridRef}
                className={`${CANVAS_GRID_STYLES.base} ${CANVAS_GRID_STYLES.borderLight} ${CANVAS_GRID_STYLES.borderDark} ${CANVAS_GRID_STYLES.bgLight} ${CANVAS_GRID_STYLES.bgDark}`}
                style={canvasGridDynamicStyle}
                onMouseLeave={handleCanvasMouseLeave}
            >
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
                                currentDraggedItemPreview={draggedItemPreview}
                                onUpdateCurrentDraggedItemPreview={onUpdateDraggedItemPreview}
                                isEraserActive={isEraserActive}
                                onEraseItemFromCell={onEraseDesignerItemFromCell}
                                ItemTypes={ItemTypes}
                            />
                        );
                    })
                )}

                {/* Resize Preview "Shadow" */}
                {draggedItemPreview && draggedItemPreview.type === 'resize' && draggedItemPreview.itemId && (
                    <div
                        className={`absolute pointer-events-none ${RESIZE_PREVIEW_STYLES.borderStyle} ${RESIZE_PREVIEW_STYLES.borderRadius}
                                    ${draggedItemPreview.isValid ? `${RESIZE_PREVIEW_STYLES.validBg} ${RESIZE_PREVIEW_STYLES.validBorder}` : `${RESIZE_PREVIEW_STYLES.invalidBg} ${RESIZE_PREVIEW_STYLES.invalidBorder}`}`}
                        style={{
                            top: `${(draggedItemPreview.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                            left: `${(draggedItemPreview.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
                            width: `${draggedItemPreview.w_minor * minorCellSizeRem}rem`,   // Use AABB width from preview object
                            height: `${draggedItemPreview.h_minor * minorCellSizeRem}rem`,  // Use AABB height from preview object
                            transformOrigin: 'center center',
                            zIndex: 150,
                        }}
                    />
                )}

                <AnimatePresence>
                    {designItems.filter(item => item && item.id && item.gridPosition).map(item => {
                        const isCurrentlySelected = selectedItemId === item.id;
                        const isHiddenForResizePreview = draggedItemPreview?.type === 'resize' && draggedItemPreview?.itemId === item.id;
                        if (isHiddenForResizePreview) return null;

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