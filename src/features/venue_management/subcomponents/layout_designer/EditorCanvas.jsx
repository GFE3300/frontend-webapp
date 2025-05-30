import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';

// Child Components
import CanvasCell from './CanvasCell';
import PlacedItem from './PlacedItem';

// Utilities & Constants
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import { CELL_SIZE_REM as MAJOR_CELL_SIZE_REM } from '../../constants/layoutConstants';
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1;

// Design Guideline Variables
const CANVAS_CONTAINER_STYLES = { 
    bgLight: "bg-neutral-100",
    bgDark: "dark:bg-neutral-900",
    padding: "p-4 sm:p-6 md:p-8",
};
const CANVAS_GRID_STYLES = {
    base: "relative mx-auto rounded-md shadow-lg touch-none",
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

// const DEBUG_EDITOR_CANVAS = "[EditorCanvas DEBUG]"; // Keep if needed

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
            if (rootFontSize > 0) {
                setMinorCellSizePx(minorCellSizeRem * rootFontSize);
            }
        }
    }, [minorCellSizeRem]);

    const [, dropTargetRefSetter] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE],
        hover: (dragPayload, monitor) => {
            if (!monitor.isOver({ shallow: true }) || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                if (draggedItemPreview && draggedItemPreview.type === 'resize') {
                    onUpdateDraggedItemPreview(null);
                }
                return;
            }
            const { type: handleType, itemId, direction, originalItem: payloadOriginalItem } = dragPayload;
            if (handleType !== ItemTypes.RESIZE_HANDLE || !payloadOriginalItem || !itemId) {
                if (draggedItemPreview && draggedItemPreview.type === 'resize') onUpdateDraggedItemPreview(null);
                return;
            }
            const currentItemState = designItems.find(it => it.id === itemId);
            if (!currentItemState) {
                if (draggedItemPreview) onUpdateDraggedItemPreview(null);
                return;
            }
            const baseW_from_payload = payloadOriginalItem.w_minor;
            const baseH_from_payload = payloadOriginalItem.h_minor;
            const originalGridPos = payloadOriginalItem.gridPosition;
            const item_rotation = payloadOriginalItem.rotation;
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) {
                if (draggedItemPreview && draggedItemPreview.type === 'resize') onUpdateDraggedItemPreview(null);
                return;
            }
            const gridRect = canvasGridRef.current.getBoundingClientRect();
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;
            const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));
            let newProposedAABBRowStart = originalGridPos.rowStart;
            let newProposedAABBColStart = originalGridPos.colStart;
            let newProposedBaseWMinor = baseW_from_payload;
            let newProposedBaseHMinor = baseH_from_payload;
            switch (direction) {
                case 'N':
                    newProposedBaseHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (originalGridPos.rowStart + baseH_from_payload) - hoveredMinorR);
                    newProposedAABBRowStart = (originalGridPos.rowStart + baseH_from_payload) - newProposedBaseHMinor;
                    break;
                case 'S':
                    newProposedBaseHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - originalGridPos.rowStart + 1);
                    break;
                case 'W':
                    newProposedBaseWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (originalGridPos.colStart + baseW_from_payload) - hoveredMinorC);
                    newProposedAABBColStart = (originalGridPos.colStart + baseW_from_payload) - newProposedBaseWMinor;
                    break;
                case 'E':
                    newProposedBaseWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - originalGridPos.colStart + 1);
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
                direction,
                previewGridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart },
                previewW_minor: previewAABB_W,
                previewH_minor: previewAABB_H,
                proposedBaseW_minor: newProposedBaseWMinor,
                proposedBaseH_minor: newProposedBaseHMinor,
                rotation: item_rotation,
                isValid,
            });
        },
        drop: (dragPayload, monitor) => {
            if (!draggedItemPreview || draggedItemPreview.type !== 'resize' || !draggedItemPreview.isValid || !draggedItemPreview.itemId) {
                if (draggedItemPreview) onUpdateDraggedItemPreview(null);
                return;
            }
            const {
                itemId,
                previewGridPosition,
                proposedBaseW_minor,
                proposedBaseH_minor
            } = draggedItemPreview;
            const updateProps = {
                gridPosition: { ...previewGridPosition },
                w_minor: proposedBaseW_minor,
                h_minor: proposedBaseH_minor,
            };
            onUpdateItemProperty(itemId, updateProps);
            onUpdateDraggedItemPreview(null);
        },
    }), [
        designItems, totalMinorRows, totalMinorCols, minorCellSizePx, zoomLevel,
        canPlaceItem, onUpdateItemProperty, onUpdateDraggedItemPreview, ItemTypes, draggedItemPreview,
        getEffectiveDimensionsUtil
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

    const gridContainerClasses = useMemo(() => {
        let classes = `${CANVAS_GRID_STYLES.base} ${CANVAS_GRID_STYLES.borderLight} ${CANVAS_GRID_STYLES.borderDark} ${CANVAS_GRID_STYLES.bgLight} ${CANVAS_GRID_STYLES.bgDark}`;
        // Apply cursor if EITHER an existing item is being click-moved OR a new tool is selected for click-placement
        if ((moveCandidateItemId || activeToolForPlacement) && !isEraserActive) {
            classes += ` ${CANVAS_GRID_STYLES.moveModeCursor}`;
        }
        return classes;
    }, [moveCandidateItemId, activeToolForPlacement, isEraserActive]); 


    return (
        <div
            className={`flex-1 w-full h-full overflow-auto
                        ${CANVAS_CONTAINER_STYLES.bgLight} ${CANVAS_CONTAINER_STYLES.bgDark}
                        ${CANVAS_CONTAINER_STYLES.padding}
                        flex items-center justify-center`}
            onClick={onCanvasClick} // For deselecting by clicking the main canvas area background
            role="application"
            aria-label="Venue Layout Design Canvas"
        >
            <div
                ref={canvasGridRef}
                className={gridContainerClasses}
                style={canvasGridDynamicStyle}
                onMouseLeave={handleCanvasMouseLeave}
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
                                onAddItemToLayout={onAddItem} // For DND from toolbar
                                onMoveExistingItem={onMoveItem} // For DND of existing items
                                onCellClickForPrimaryAction={onCellClickForPrimaryAction} // << UPDATED PROP NAME
                                moveCandidateItemId={moveCandidateItemId}
                                activeToolForPlacement={activeToolForPlacement} // << PASS DOWN
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

                {/* Resize Preview Div (no changes) */}
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

                {/* Render Placed Items (no changes in this iteration for this specific feature) */}
                <AnimatePresence>
                    {designItems.filter(item => item && item.id && item.gridPosition).map(item => {
                        const isCurrentlySelected = selectedItemId === item.id;
                        const isHiddenForThisResizePreview = draggedItemPreview?.type === 'resize' && draggedItemPreview?.itemId === item.id;

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