// features/venue_management/subcomponents/layout_designer/EditorCanvas.jsx
// DEBUG VERSION + POTENTIAL FIX IMPLEMENTED
import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Child Components
import CanvasCell from './CanvasCell';
import PlacedItem from './PlacedItem'; // Assuming PlacedItem structure is adjusted as discussed

// Utilities & Constants
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import { CELL_SIZE_REM as MAJOR_CELL_SIZE_REM } from '../../constants/layoutConstants';
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1; // Smallest an item can be in minor cells

// Design Guideline Variables (assuming these are correctly defined)
const CANVAS_CONTAINER_STYLES = { /* ... */ };
const CANVAS_GRID_STYLES = { /* ... */ };
const RESIZE_PREVIEW_STYLES = { /* ... */ };

const DEBUG_PREFIX = "[EditorCanvas DEBUG] ";
const ROTATION_RESIZE_DEBUG_PREFIX_EC = "[DEBUG ROTATION-RESIZE] [EditorCanvas] ";


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
    const [minorCellSizePx, setMinorCellSizePx] = useState(16);

    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => MAJOR_CELL_SIZE_REM / gridSubdivision, [MAJOR_CELL_SIZE_REM, gridSubdivision]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (rootFontSize > 0 && gridSubdivision > 0 && MAJOR_CELL_SIZE_REM > 0) {
                setMinorCellSizePx((MAJOR_CELL_SIZE_REM / gridSubdivision) * rootFontSize);
            }
        }
    }, [minorCellSizeRem, gridSubdivision, MAJOR_CELL_SIZE_REM]);

    // useDrop for RESIZE_HANDLE
    const [collectedDropProps, dropTargetRefSetter] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE],
        hover: (dragPayload, monitor) => {
            // console.log(DEBUG_PREFIX + "RESIZE HOVER triggered on EditorCanvas");
            if (!monitor.isOver({ shallow: true }) || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                return;
            }

            const { type: handleType, itemId, direction, originalItem: payloadOriginalItem } = dragPayload;

            if (handleType !== ItemTypes.RESIZE_HANDLE || !payloadOriginalItem) {
                onUpdateDraggedItemPreview(null);
                return;
            }

            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE HOVER: ItemID=${itemId}, HandleDir=${direction}. PayloadOriginalItem: w=${payloadOriginalItem.w_minor}, h=${payloadOriginalItem.h_minor}, rot=${payloadOriginalItem.rotation}`);

            const currentItemFromState = designItems.find(it => it.id === itemId);
            if (!currentItemFromState) {
                onUpdateDraggedItemPreview(null);
                return;
            }

            const currentGridPos = currentItemFromState.gridPosition; // Use current position from state for anchor
            const baseW_from_payload = payloadOriginalItem.w_minor; // These are ALREADY SWAPPED if item was rotated 90/270
            const baseH_from_payload = payloadOriginalItem.h_minor; // These are ALREADY SWAPPED if item was rotated 90/270
            const item_rotation = payloadOriginalItem.rotation; // Item's actual rotation

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) {
                onUpdateDraggedItemPreview(null);
                return;
            }

            const gridRect = canvasGridRef.current.getBoundingClientRect();
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;

            const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));

            let newProposedAABBRowStart = currentGridPos.rowStart;
            let newProposedAABBColStart = currentGridPos.colStart;
            let newProposedBaseWMinor = baseW_from_payload; // Start with base dimensions from payload
            let newProposedBaseHMinor = baseH_from_payload; // Start with base dimensions from payload
            const MIN_DIM = MIN_ITEM_DIMENSION_MINOR_CELLS;

            // --- SIMPLIFIED RESIZE LOGIC ---
            // The 'direction' is visual. w_minor/h_minor in payload are already swapped to match base orientation.
            // We are calculating the new base dimensions.
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
            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE HOVER: Calculated new base dims for item: newW=${newProposedBaseWMinor}, newH=${newProposedBaseHMinor}`);
            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE HOVER: Proposed AABB anchor for item: r=${newProposedAABBRowStart}, c=${newProposedAABBColStart}`);

            // For validation, use the item's actual rotation and the PROPOSED NEW BASE dimensions
            const tempItemForValidation = {
                ...payloadOriginalItem, // Includes original rotation
                gridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart },
                w_minor: newProposedBaseWMinor, // Proposed new base width
                h_minor: newProposedBaseHMinor, // Proposed new base height
                // rotation: item_rotation // This is already in payloadOriginalItem
            };
            const { w: previewAABB_W, h: previewAABB_H } = getEffectiveDimensionsUtil(tempItemForValidation);
            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE HOVER: Effective Dims (AABB) for Preview based on new base and original rotation: previewAABB_W=${previewAABB_W}, previewAABB_H=${previewAABB_H}`);

            const isValid = canPlaceItem(newProposedAABBRowStart, newProposedAABBColStart, previewAABB_W, previewAABB_H, itemId);

            const previewData = {
                type: 'resize', itemId,
                gridPosition: { rowStart: newProposedAABBRowStart, colStart: newProposedAABBColStart },
                w_minor: previewAABB_W, // AABB width for preview div
                h_minor: previewAABB_H, // AABB height for preview div
                rotation: item_rotation, // Keep original rotation for context if needed by preview
                isValid,
            };
            onUpdateDraggedItemPreview(previewData);
        },
        drop: (dragPayload, monitor) => {
            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + "RESIZE DROP triggered");
            const { isValid: previewIsValid, type: previewType } = draggedItemPreview || {};

            if (!draggedItemPreview || previewType !== 'resize' || !previewIsValid) {
                console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE DROP: Aborting. Preview invalid or not 'resize'. isValid=${previewIsValid}, type=${previewType}`);
                onUpdateDraggedItemPreview(null); return;
            }

            const { itemId, direction, originalItem: payloadOriginalItem } = dragPayload;
            const currentItemFromState = designItems.find(it => it.id === itemId);
            if (!currentItemFromState) {
                console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE DROP: Item ${itemId} not found. Aborting.`);
                onUpdateDraggedItemPreview(null); return;
            }

            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE DROP: ItemID=${itemId}, HandleDir=${direction}. PayloadOriginalItem: w=${payloadOriginalItem.w_minor}, h=${payloadOriginalItem.h_minor}, rot=${payloadOriginalItem.rotation}`);

            const currentGridPos = currentItemFromState.gridPosition; // Item's current position in state
            const baseW_from_payload = payloadOriginalItem.w_minor; // ALREADY SWAPPED if item was rotated
            const baseH_from_payload = payloadOriginalItem.h_minor; // ALREADY SWAPPED if item was rotated
            const item_rotation = payloadOriginalItem.rotation;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                onUpdateDraggedItemPreview(null); return;
            }

            const gridRect = canvasGridRef.current.getBoundingClientRect();
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;

            const droppedMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const droppedMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));
            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE DROP: Dropped at minor cell r=${droppedMinorR}, c=${droppedMinorC}`);

            let finalAABBRowStart = currentGridPos.rowStart;
            let finalAABBColStart = currentGridPos.colStart;
            let finalBaseWMinor = baseW_from_payload;
            let finalBaseHMinor = baseH_from_payload;
            const MIN_DIM = MIN_ITEM_DIMENSION_MINOR_CELLS;

            // --- SIMPLIFIED RESIZE LOGIC FOR DROP ---
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
            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE DROP: Final base dims for item: finalW=${finalBaseWMinor}, finalH=${finalBaseHMinor}`);
            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE DROP: Final AABB anchor for item: r=${finalAABBRowStart}, c=${finalAABBColStart}`);

            const finalItemForValidation = {
                ...payloadOriginalItem,
                gridPosition: { rowStart: finalAABBRowStart, colStart: finalAABBColStart },
                w_minor: finalBaseWMinor,
                h_minor: finalBaseHMinor,
                // rotation: item_rotation // from payloadOriginalItem
            };
            const { w: finalAABB_W, h: finalAABB_H } = getEffectiveDimensionsUtil(finalItemForValidation);
            console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE DROP: For validation - AABB_r=${finalItemForValidation.gridPosition.rowStart}, AABB_c=${finalItemForValidation.gridPosition.colStart}, Effective Dims: w=${finalAABB_W}, h=${finalAABB_H}`);

            if (canPlaceItem(finalAABBRowStart, finalAABBColStart, finalAABB_W, finalAABB_H, itemId)) {
                const updateProps = {
                    gridPosition: { rowStart: finalAABBRowStart, colStart: finalAABBColStart },
                    w_minor: finalBaseWMinor,
                    h_minor: finalBaseHMinor
                    // Rotation is NOT changed by resize
                };
                console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE DROP: Validation PASSED. Calling onUpdateItemProperty for item ${itemId} with:`, JSON.parse(JSON.stringify(updateProps)));
                onUpdateItemProperty(itemId, updateProps);
            } else {
                console.log(ROTATION_RESIZE_DEBUG_PREFIX_EC + `RESIZE DROP: Validation FAILED for final placement. Item ${itemId} not updated.`);
            }
            onUpdateDraggedItemPreview(null);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver({ shallow: true }),
            canDrop: !!monitor.canDrop(), // Not strictly used by this drop target, but good practice
        }),
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
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, zoomLevel, MAJOR_CELL_SIZE_REM]);

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
                ref={canvasGridRef} // This is where RESIZE_HANDLE drops are caught
                className={`${CANVAS_GRID_STYLES.base} ${CANVAS_GRID_STYLES.borderLight} ${CANVAS_GRID_STYLES.borderDark} ${CANVAS_GRID_STYLES.bgLight} ${CANVAS_GRID_STYLES.bgDark}`}
                style={canvasGridDynamicStyle}
                onMouseLeave={handleCanvasMouseLeave}
            >
                {/* Render Grid Cells */}
                {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                    Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                        // ... (CanvasCell rendering as before)
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
                                currentDraggedItemPreview={draggedItemPreview} // Pass full preview
                                onUpdateCurrentDraggedItemPreview={onUpdateDraggedItemPreview}
                                isEraserActive={isEraserActive}
                                onEraseItemFromCell={onEraseDesignerItemFromCell}
                                ItemTypes={ItemTypes}
                            />
                        );
                    })
                )}

                {/* Resize Preview Div (uses AABB dimensions from draggedItemPreview) */}
                {draggedItemPreview && draggedItemPreview.type === 'resize' && draggedItemPreview.itemId && (
                    <div
                        className={`absolute pointer-events-none ${RESIZE_PREVIEW_STYLES.borderStyle} ${RESIZE_PREVIEW_STYLES.borderRadius}
                                    ${draggedItemPreview.isValid ? `${RESIZE_PREVIEW_STYLES.validBg} ${RESIZE_PREVIEW_STYLES.validBorder}` : `${RESIZE_PREVIEW_STYLES.invalidBg} ${RESIZE_PREVIEW_STYLES.invalidBorder}`}`}
                        style={{
                            top: `${(draggedItemPreview.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                            left: `${(draggedItemPreview.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
                            width: `${draggedItemPreview.w_minor * minorCellSizeRem}rem`,  // This should be AABB width
                            height: `${draggedItemPreview.h_minor * minorCellSizeRem}rem`, // This should be AABB height
                            zIndex: 100,
                        }}
                    />
                )}

                {/* Render Placed Items */}
                <AnimatePresence>
                    {designItems.filter(item => item && item.id && item.gridPosition).map(item => {
                        const isCurrentlySelected = selectedItemId === item.id;
                        // If a resize preview for THIS item is active, PlacedItem might be visually hidden or altered by its own logic.
                        const isHiddenForResizePreview = draggedItemPreview?.type === 'resize' && draggedItemPreview?.itemId === item.id;
                        if (isHiddenForResizePreview) return null; // Hide original item while its resize preview is active

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