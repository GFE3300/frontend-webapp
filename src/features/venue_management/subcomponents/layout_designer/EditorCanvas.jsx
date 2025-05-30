// features/venue_management/subcomponents/layout_designer/EditorCanvas.jsx
import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence is used

// Child Components
import CanvasCell from './CanvasCell';
import PlacedItem from './PlacedItem';

// Utilities & Constants
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import { CELL_SIZE_REM as MAJOR_CELL_SIZE_REM } from '../../constants/layoutConstants';
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1; // Smallest an item can be in minor cells

// Design Guideline Variables
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
    bgDark: "dark:bg-neutral-800",
};

const RESIZE_PREVIEW_STYLES = {
    validBg: "bg-rose-500/20", // Tailwind: bg-rose-500 opacity-20
    validBorder: "border-rose-500",
    invalidBg: "bg-red-500/20",   // Tailwind: bg-red-500 opacity-20
    invalidBorder: "border-red-600",
    borderStyle: "border-2 border-dashed",
    borderRadius: "rounded-sm",
};

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
    onCanvasClick,
}) => {
    const canvasGridRef = useRef(null);
    const [minorCellSizePx, setMinorCellSizePx] = useState(16); // Default fallback

    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => MAJOR_CELL_SIZE_REM / gridSubdivision, [MAJOR_CELL_SIZE_REM, gridSubdivision]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (rootFontSize > 0) {
                setMinorCellSizePx(minorCellSizeRem * rootFontSize);
            }
        }
    }, [minorCellSizeRem]);

    const [collectedDropProps, dropTargetRefSetter] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE],
        hover: (dragPayload, monitor) => {
            if (!monitor.isOver({ shallow: true }) || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                return;
            }

            const { type: handleType, itemId, direction, originalItem: payloadOriginalItem } = dragPayload;

            if (handleType !== ItemTypes.RESIZE_HANDLE || !payloadOriginalItem) {
                if (draggedItemPreview) onUpdateDraggedItemPreview(null); // Clear if irrelevant preview
                return;
            }

            const currentItemFromState = designItems.find(it => it.id === itemId);
            if (!currentItemFromState) {
                if (draggedItemPreview) onUpdateDraggedItemPreview(null);
                return;
            }

            const currentGridPos = currentItemFromState.gridPosition;
            const baseW_from_payload = payloadOriginalItem.w_minor;
            const baseH_from_payload = payloadOriginalItem.h_minor;
            const item_rotation = payloadOriginalItem.rotation;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) {
                if (draggedItemPreview) onUpdateDraggedItemPreview(null);
                return;
            }

            const gridRect = canvasGridRef.current.getBoundingClientRect();
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;

            const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));

            let newProposedAABBRowStart = currentGridPos.rowStart;
            let newProposedAABBColStart = currentGridPos.colStart;
            let newProposedBaseWMinor = baseW_from_payload;
            let newProposedBaseHMinor = baseH_from_payload;
            const MIN_DIM = MIN_ITEM_DIMENSION_MINOR_CELLS;

            switch (direction) {
                case 'N':
                    newProposedBaseHMinor = Math.max(MIN_DIM, (currentGridPos.rowStart + baseH_from_payload) - hoveredMinorR);
                    newProposedAABBRowStart = (currentGridPos.rowStart + baseH_from_payload) - newProposedBaseHMinor;
                    break;
                case 'S':
                    newProposedBaseHMinor = Math.max(MIN_DIM, hoveredMinorR - currentGridPos.rowStart + 1);
                    break;
                case 'W':
                    newProposedBaseWMinor = Math.max(MIN_DIM, (currentGridPos.colStart + baseW_from_payload) - hoveredMinorC);
                    newProposedAABBColStart = (currentGridPos.colStart + baseW_from_payload) - newProposedBaseWMinor;
                    break;
                case 'E':
                    newProposedBaseWMinor = Math.max(MIN_DIM, hoveredMinorC - currentGridPos.colStart + 1);
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
            const isValid = canPlaceItem(newProposedAABBRowStart, newProposedAABBColStart, previewAABB_W, previewAABB_H, itemId);

            onUpdateDraggedItemPreview({
                type: 'resize', itemId,
                gridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart },
                w_minor: previewAABB_W,
                h_minor: previewAABB_H,
                rotation: item_rotation,
                isValid,
            });
        },
        drop: (dragPayload, monitor) => {
            const { isValid: previewIsValid, type: previewType } = draggedItemPreview || {};

            if (!draggedItemPreview || previewType !== 'resize' || !previewIsValid) {
                if (draggedItemPreview) onUpdateDraggedItemPreview(null);
                return;
            }

            const { itemId, direction, originalItem: payloadOriginalItem } = dragPayload;
            const currentItemFromState = designItems.find(it => it.id === itemId);
            if (!currentItemFromState) {
                onUpdateDraggedItemPreview(null); return;
            }

            const currentGridPos = currentItemFromState.gridPosition;
            const baseW_from_payload = payloadOriginalItem.w_minor;
            const baseH_from_payload = payloadOriginalItem.h_minor;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                onUpdateDraggedItemPreview(null); return;
            }

            const gridRect = canvasGridRef.current.getBoundingClientRect();
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;

            const droppedMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const droppedMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));

            let finalAABBRowStart = currentGridPos.rowStart;
            let finalAABBColStart = currentGridPos.colStart;
            let finalBaseWMinor = baseW_from_payload;
            let finalBaseHMinor = baseH_from_payload;
            const MIN_DIM = MIN_ITEM_DIMENSION_MINOR_CELLS;

            switch (direction) {
                case 'N':
                    finalBaseHMinor = Math.max(MIN_DIM, (currentGridPos.rowStart + baseH_from_payload) - droppedMinorR);
                    finalAABBRowStart = (currentGridPos.rowStart + baseH_from_payload) - finalBaseHMinor;
                    break;
                case 'S':
                    finalBaseHMinor = Math.max(MIN_DIM, droppedMinorR - currentGridPos.rowStart + 1);
                    break;
                case 'W':
                    finalBaseWMinor = Math.max(MIN_DIM, (currentGridPos.colStart + baseW_from_payload) - droppedMinorC);
                    finalAABBColStart = (currentGridPos.colStart + baseW_from_payload) - finalBaseWMinor;
                    break;
                case 'E':
                    finalBaseWMinor = Math.max(MIN_DIM, droppedMinorC - currentGridPos.colStart + 1);
                    break;
                default: break;
            }

            const finalItemForValidation = {
                ...payloadOriginalItem,
                gridPosition: { rowStart: finalAABBRowStart, colStart: finalAABBColStart },
                w_minor: finalBaseWMinor,
                h_minor: finalBaseHMinor,
            };
            const { w: finalAABB_W, h: finalAABB_H } = getEffectiveDimensionsUtil(finalItemForValidation);

            if (canPlaceItem(finalAABBRowStart, finalAABBColStart, finalAABB_W, finalAABB_H, itemId)) {
                const updateProps = {
                    gridPosition: { rowStart: finalAABBRowStart, colStart: finalAABBColStart },
                    w_minor: finalBaseWMinor,
                    h_minor: finalBaseHMinor,
                };
                onUpdateItemProperty(itemId, updateProps);
            }
            onUpdateDraggedItemPreview(null);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver({ shallow: true }),
            // canDrop: !!monitor.canDrop(), // Not explicitly used here, but available
        }),
    }), [
        designItems, totalMinorRows, totalMinorCols, minorCellSizePx, zoomLevel,
        canPlaceItem, onUpdateItemProperty, onUpdateDraggedItemPreview, ItemTypes, draggedItemPreview,
        getEffectiveDimensionsUtil // Ensure this utility is stable or memoized if complex
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
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, zoomLevel, MAJOR_CELL_SIZE_REM]);

    const handleCanvasMouseLeave = useCallback(() => {
        if (draggedItemPreview && (draggedItemPreview.type === 'placement' || draggedItemPreview.type === 'resize')) {
            onUpdateDraggedItemPreview(null);
        }
    }, [draggedItemPreview, onUpdateDraggedItemPreview]);

    // Critical check for ItemTypes.RESIZE_HANDLE
    if (!ItemTypes || typeof ItemTypes.RESIZE_HANDLE !== 'string') {
        // In production, you might log this error to a monitoring service
        // and/or display a more user-friendly error message.
        console.error("EditorCanvas: Critical ItemTypes configuration missing (RESIZE_HANDLE).");
        return (
            <div className="p-5 text-red-600 bg-red-100 rounded-md text-center">
                <p className="font-semibold">Configuration Error</p>
                <p className="text-sm">The layout editor cannot be loaded due to a configuration problem. Please contact support.</p>
            </div>
        );
    }

    return (
        <div
            className={`flex-1 w-full h-full overflow-auto
                        ${CANVAS_CONTAINER_STYLES.bgLight} ${CANVAS_CONTAINER_STYLES.bgDark}
                        ${CANVAS_CONTAINER_STYLES.padding}
                        flex items-center justify-center`}
            onClick={onCanvasClick} // For deselecting items when clicking canvas background
            role="application"
            aria-label="Venue Layout Design Canvas"
        >
            <div
                ref={canvasGridRef}
                className={`${CANVAS_GRID_STYLES.base} ${CANVAS_GRID_STYLES.borderLight} ${CANVAS_GRID_STYLES.borderDark} ${CANVAS_GRID_STYLES.bgLight} ${CANVAS_GRID_STYLES.bgDark}`}
                style={canvasGridDynamicStyle}
                onMouseLeave={handleCanvasMouseLeave} // Clear previews if mouse leaves grid area
            >
                {/* Render Grid Cells */}
                {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                    Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                        const minorRow = rIndex + 1;
                        const minorCol = cIndex + 1;
                        // Determine if this cell is on a major grid boundary for styling
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

                {/* Resize Preview Div */}
                {draggedItemPreview && draggedItemPreview.type === 'resize' && draggedItemPreview.itemId && (
                    <div
                        className={`absolute pointer-events-none ${RESIZE_PREVIEW_STYLES.borderStyle} ${RESIZE_PREVIEW_STYLES.borderRadius}
                                    ${draggedItemPreview.isValid ? `${RESIZE_PREVIEW_STYLES.validBg} ${RESIZE_PREVIEW_STYLES.validBorder}` : `${RESIZE_PREVIEW_STYLES.invalidBg} ${RESIZE_PREVIEW_STYLES.invalidBorder}`}`}
                        style={{
                            top: `${(draggedItemPreview.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                            left: `${(draggedItemPreview.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
                            width: `${draggedItemPreview.w_minor * minorCellSizeRem}rem`,
                            height: `${draggedItemPreview.h_minor * minorCellSizeRem}rem`,
                            zIndex: 100, // Ensure preview is above cells and items
                        }}
                        aria-hidden="true" // Decorative element
                    />
                )}

                {/* Render Placed Items */}
                <AnimatePresence>
                    {designItems.filter(item => item && item.id && item.gridPosition).map(item => {
                        const isCurrentlySelected = selectedItemId === item.id;
                        const isHiddenForResizePreview = draggedItemPreview?.type === 'resize' && draggedItemPreview?.itemId === item.id;

                        // Do not render the original item if its resize preview is active
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
                                zoomLevel={zoomLevel} // Pass zoomLevel if PlacedItem needs to adapt (e.g., handle sizes)
                            />
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EditorCanvas;