import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';

// Child Components
import CanvasCell from './CanvasCell'; // Assuming path is correct
import PlacedItem from './PlacedItem';   // Assuming path is correct

// Utilities & Constants
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import { CELL_SIZE_REM as MAJOR_CELL_SIZE_REM } from '../../constants/layoutConstants';
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1; // Smallest an item can be in minor cells

// --- Design Guideline Variables ---
const CANVAS_CONTAINER_STYLES = {
    bgLight: "bg-neutral-100", // Updated to match LayoutEditor's main area for seamlessness
    bgDark: "dark:bg-neutral-900",
    padding: "p-4 sm:p-6 md:p-8", // Ample padding around the grid itself
};

const CANVAS_GRID_STYLES = {
    base: "relative mx-auto rounded-md shadow-lg", // Slightly larger rounding
    borderLight: "border border-neutral-300",
    borderDark: "dark:border-neutral-700", // Darker border for better definition
    bgLight: "bg-white",                   // Canvas itself is white
    bgDark: "dark:bg-neutral-800",         // Dark canvas background
};

const RESIZE_PREVIEW_STYLES = {
    validBg: "bg-rose-500/20", // Use Rose for valid interaction preview
    validBorder: "border-rose-500",
    invalidBg: "bg-red-500/20",
    invalidBorder: "border-red-600",
    borderStyle: "border-2 border-dashed",
    borderRadius: "rounded-sm", // Consistent with item renderers if they are rounded-sm
};
// --- End Design Guideline Variables ---

const EditorCanvas = ({
    majorGridRows, majorGridCols, gridSubdivision,
    designItems, ItemTypes, ITEM_CONFIGS,
    onAddItem, onMoveItem,
    onEraseDesignerItemFromCell, onEraseDesignerItemById,
    onUpdateItemProperty,
    onSelectItem, selectedItemId,
    canPlaceItem, // (targetMinorRow, targetMinorCol, itemEffW_minor, itemEffH_minor, itemToExcludeId) => boolean
    draggedItemPreview, onUpdateDraggedItemPreview, // This is currentDraggedItemPreview
    isEraserActive,
    zoomLevel,
    onCanvasClick, // Callback for when the empty canvas area (not an item) is clicked
}) => {
    const canvasGridRef = useRef(null);
    const [minorCellSizePx, setMinorCellSizePx] = useState(16); // Default, updated in useEffect

    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => MAJOR_CELL_SIZE_REM / gridSubdivision, [gridSubdivision]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            setMinorCellSizePx(minorCellSizeRem * rootFontSize);
        }
    }, [minorCellSizeRem]);

    const [{ isOverCanvasForHandleDrag }, dropTargetRefSetter] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE, ItemTypes.ROTATION_HANDLE], // Accept both handle types
        hover: (dragPayload, monitor) => {
            if (!monitor.isOver({ shallow: true }) || !canvasGridRef.current || minorCellSizePx === 0 || zoomLevel === 0) return;

            const { type: handleType, itemId, direction, originalItem } = dragPayload;
            if (![ItemTypes.RESIZE_HANDLE, ItemTypes.ROTATION_HANDLE].includes(handleType) || !originalItem) return;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const gridRect = canvasGridRef.current.getBoundingClientRect();
            // Crucial: Assumes canvasGridRef has transform-origin: top left;
            const mouseX_on_unscaled_grid_px = (clientOffset.x - gridRect.left) / zoomLevel;
            const mouseY_on_unscaled_grid_px = (clientOffset.y - gridRect.top) / zoomLevel;

            if (handleType === ItemTypes.RESIZE_HANDLE) {
                const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
                const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));

                let { gridPosition: origPos, w_minor: origW, h_minor: origH, rotation: origRot } = originalItem;
                let newRowStart = origPos.rowStart;
                let newColStart = origPos.colStart;
                let newWMinor = origW;
                let newHMinor = origH;

                if (origRot === 0 || origRot === 180) {
                    switch (direction) {
                        case 'N': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.rowStart + origH) - hoveredMinorR); newRowStart = (origPos.rowStart + origH) - newHMinor; break;
                        case 'S': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - origPos.rowStart + 1); break;
                        case 'W': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.colStart + origW) - hoveredMinorC); newColStart = (origPos.colStart + origW) - newWMinor; break;
                        case 'E': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - origPos.colStart + 1); break;
                        default: break;
                    }
                } else { // 90 or 270 degrees rotation
                    switch (direction) { // Note: For 90/270, N/S affect width, W/E affect height due to visual orientation
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

            } else if (handleType === ItemTypes.ROTATION_HANDLE) {
                const itemCenterX_px = (originalItem.gridPosition.colStart - 1 + originalItem.w_minor / 2) * minorCellSizePx;
                const itemCenterY_px = (originalItem.gridPosition.rowStart - 1 + originalItem.h_minor / 2) * minorCellSizePx;

                const deltaX = mouseX_on_unscaled_grid_px - itemCenterX_px;
                const deltaY = mouseY_on_unscaled_grid_px - itemCenterY_px;

                let angleRad = Math.atan2(deltaY, deltaX);
                let angleDeg = angleRad * (180 / Math.PI);
                angleDeg = (Math.round(angleDeg / 15) * 15 + 360) % 360; // Snap to 15-degree increments

                onUpdateDraggedItemPreview({
                    type: 'rotation', itemId,
                    newAngle: angleDeg,
                    // For rotation, assume valid during drag, collision primarily for placement/resize
                    isValid: true,
                    // Pass necessary original item info if rotation preview needs to show the item itself
                    originalItemDataForPreview: { ...originalItem, rotation: angleDeg },
                });
            }
        },
        drop: (dragPayload, monitor) => {
            if (!monitor.didDrop() || !draggedItemPreview) { // Check if it was handled by child or no preview
                if (monitor.didDrop() && monitor.getTargetIds().length > 0 && monitor.getTargetIds()[0] !== monitor.getSourceClientOffset()) {
                    // Likely handled by a PlacedItem itself if it was a direct DND on item for some other purpose
                } else {
                    onUpdateDraggedItemPreview(null); // Clear preview if drop was on canvas but not processed
                }
                return;
            }

            const { type: previewType, itemId, isValid } = draggedItemPreview;

            if (previewType === 'resize' && isValid) {
                const { gridPosition, w_minor, h_minor } = draggedItemPreview;
                onUpdateItemProperty(itemId, {
                    gridPosition: { rowStart: gridPosition.rowStart, colStart: gridPosition.colStart },
                    w_minor: w_minor,
                    h_minor: h_minor,
                });
            } else if (previewType === 'rotation' && isValid) { // Assuming isValid for rotation from hover
                const { newAngle } = draggedItemPreview;
                onUpdateItemProperty(itemId, { rotation: newAngle });
            }
            onUpdateDraggedItemPreview(null); // Clear preview after drop
        },
        collect: monitor => ({
            isOverCanvasForHandleDrag: !!monitor.isOver({ shallow: true }) &&
                [ItemTypes.RESIZE_HANDLE, ItemTypes.ROTATION_HANDLE].includes(monitor.getItemType()),
        }),
    }), [
        totalMinorRows, totalMinorCols, minorCellSizePx, zoomLevel,
        canPlaceItem, onUpdateItemProperty, onUpdateDraggedItemPreview, ItemTypes, draggedItemPreview, // draggedItemPreview added to deps
    ]);

    useEffect(() => {
        if (canvasGridRef.current) {
            dropTargetRefSetter(canvasGridRef.current);
        }
        return () => { dropTargetRefSetter(null); };
    }, [dropTargetRefSetter]);

    const canvasGridDynamicStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        width: `${majorGridCols * MAJOR_CELL_SIZE_REM}rem`,
        height: `${majorGridRows * MAJOR_CELL_SIZE_REM}rem`,
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left', // CRUCIAL for simpler coordinate math with zoom
        transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, zoomLevel]);

    if (!ItemTypes || typeof ItemTypes.RESIZE_HANDLE !== 'string' || typeof ItemTypes.ROTATION_HANDLE !== 'string') {
        return <div className="p-5 text-red-600 bg-red-100 rounded-md">Error: Critical ItemTypes (RESIZE_HANDLE or ROTATION_HANDLE) not properly defined.</div>;
    }

    return (
        <div
            className={`flex-1 w-full h-full overflow-auto 
                        ${CANVAS_CONTAINER_STYLES.bgLight} ${CANVAS_CONTAINER_STYLES.bgDark} 
                        ${CANVAS_CONTAINER_STYLES.padding} 
                        flex items-center justify-center`} // Center the grid container
            onClick={onCanvasClick} // For deselecting items when clicking empty canvas area
            role="application" // Main interactive region
            aria-label="Venue Layout Design Canvas"
        >
            <div
                ref={canvasGridRef}
                className={`${CANVAS_GRID_STYLES.base} ${CANVAS_GRID_STYLES.borderLight} ${CANVAS_GRID_STYLES.borderDark} ${CANVAS_GRID_STYLES.bgLight} ${CANVAS_GRID_STYLES.bgDark}`}
                style={canvasGridDynamicStyle}
                onMouseLeave={() => { // Clear placement preview if mouse leaves grid
                    if (draggedItemPreview && draggedItemPreview.type === 'placement') {
                        onUpdateDraggedItemPreview(null);
                    }
                }}
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
                                currentDraggedItemPreview={draggedItemPreview} // Pass the full preview object
                                onUpdateCurrentDraggedItemPreview={onUpdateDraggedItemPreview}
                                isEraserActive={isEraserActive}
                                onEraseItemFromCell={onEraseDesignerItemFromCell}
                                ItemTypes={ItemTypes}
                            />
                        );
                    })
                )}

                {/* Resize Preview Overlay */}
                {draggedItemPreview && draggedItemPreview.type === 'resize' && draggedItemPreview.itemId && (
                    <div
                        className={`absolute pointer-events-none ${RESIZE_PREVIEW_STYLES.borderStyle} ${RESIZE_PREVIEW_STYLES.borderRadius}
                                    ${draggedItemPreview.isValid ? `${RESIZE_PREVIEW_STYLES.validBg} ${RESIZE_PREVIEW_STYLES.validBorder}` : `${RESIZE_PREVIEW_STYLES.invalidBg} ${RESIZE_PREVIEW_STYLES.invalidBorder}`}`}
                        style={{
                            top: `${(draggedItemPreview.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                            left: `${(draggedItemPreview.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
                            width: `${draggedItemPreview.effW_minor * minorCellSizeRem}rem`,
                            height: `${draggedItemPreview.effH_minor * minorCellSizeRem}rem`,
                            transform: `rotate(${draggedItemPreview.rotation || 0}deg)`, // Show rotation if any
                            transformOrigin: 'center center',
                            zIndex: 150, // Above cells, below items being actively dragged by body
                        }}
                    />
                )}

                {/* Rotation Preview can be implicit by PlacedItem updating, or a ghost here if needed */}
                {/* For now, the PlacedItem itself will reflect rotation from draggedItemPreview if we pass it down */}

                {/* Render All Placed Design Items */}
                <AnimatePresence>
                    {designItems.filter(item => item && item.id && item.gridPosition).map(item => {
                        const isCurrentlySelected = selectedItemId === item.id;
                        // Do not render the item if it's the one being actively previewed for resize (the preview div handles it)
                        // For rotation, we might want the actual item to rotate.
                        const isHiddenForResizePreview = draggedItemPreview?.type === 'resize' && draggedItemPreview?.itemId === item.id;

                        if (isHiddenForResizePreview) return null;

                        // If item is being rotated, use the preview angle for its display
                        const displayItem = (draggedItemPreview?.type === 'rotation' && draggedItemPreview?.itemId === item.id)
                            ? { ...item, rotation: draggedItemPreview.newAngle }
                            : item;

                        return (
                            <PlacedItem
                                key={item.id} item={displayItem} // Use displayItem for live rotation feedback
                                isEraserActive={isEraserActive}
                                onEraseItemById={onEraseDesignerItemById}
                                onUpdateItemProperty={onUpdateItemProperty}
                                onSelectItem={onSelectItem} isSelected={isCurrentlySelected}
                                minorCellSizeRem={minorCellSizeRem}
                                ItemTypes={ItemTypes} ITEM_CONFIGS={ITEM_CONFIGS}
                                zoomLevel={zoomLevel}
                                canvasBgLightClass={CANVAS_GRID_STYLES.bgLight} // Pass actual canvas bg class for offset
                                canvasBgDarkClass={CANVAS_GRID_STYLES.bgDark}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EditorCanvas;