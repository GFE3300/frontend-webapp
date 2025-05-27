// features/venue_management/subcomponents/layout_designer/grid_system/LayoutDesignerGrid.jsx
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import DroppableGridCell from './DroppableGridCell';
import PlacedItemWrapper from '../PlacedItemWrapper';
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../../utils/layoutUtils';

// Define a minimum dimension for items in minor cells.
const MIN_ITEM_DIMENSION_MINOR_CELLS = 1;

const LayoutDesignerGrid = ({
    majorGridRows,
    majorGridCols,
    gridSubdivision,
    designItems,
    ItemTypes, // Expected to include RESIZE_HANDLE
    ITEM_CONFIGS,
    CELL_SIZE_REM, // Major cell size
    onAddItem,
    onMoveItem,
    onEraseDesignerItemFromCell,
    onEraseDesignerItemById,
    onUpdateItemProperty,
    onSelectItem,
    selectedItemId,
    canPlaceItem,
    draggedItemPreview,
    onUpdateDraggedItemPreview,
    isEraserActive,
    zoomLevel, // New prop for zoom
}) => {

    const gridRef = useRef(null);
    // minorCellSizePx should represent the UNZOOMED size of a minor cell in pixels
    const [minorCellSizePx, setMinorCellSizePx] = useState(16); // Default/fallback

    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => CELL_SIZE_REM / gridSubdivision, [CELL_SIZE_REM, gridSubdivision]);

    useEffect(() => {
        // Calculate the unzoomed size of a minor cell in pixels
        if (typeof window !== 'undefined' && gridRef.current) {
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            setMinorCellSizePx((CELL_SIZE_REM / gridSubdivision) * rootFontSize);
        }
    }, [CELL_SIZE_REM, gridSubdivision]); // Recalculate if base REM or subdivision changes

    // useDrop hook for handling RESIZE_HANDLE drops directly on the grid container
    const [{ isOverGrid }, dropOnGridRef] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE],
        hover: (dragPayload, monitor) => {
            // Ensure this hover is for the grid itself and necessary refs/values are available
            if (!monitor.isOver({ shallow: true }) || !gridRef.current || minorCellSizePx === 0 || zoomLevel === 0) {
                return;
            }

            const { type: handleType, itemId, direction, originalItem } = dragPayload;
            if (handleType !== ItemTypes.RESIZE_HANDLE) return;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const gridRect = gridRef.current.getBoundingClientRect();

            // 1. Mouse position relative to the SCALED grid's top-left corner (visual position on screen)
            const mouseX_on_scaled_grid_px = clientOffset.x - gridRect.left;
            const mouseY_on_scaled_grid_px = clientOffset.y - gridRect.top;

            // 2. Convert to mouse position relative to the UN-SCALED grid
            const mouseX_on_unscaled_grid_px = mouseX_on_scaled_grid_px / zoomLevel;
            const mouseY_on_unscaled_grid_px = mouseY_on_scaled_grid_px / zoomLevel;

            // 3. Calculate hovered minor cell based on UN-SCALED grid coordinates
            const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));

            // The rest of this logic calculates the new proposed dimensions based on the unscaled hover coordinates
            let { gridPosition: origPos, w_minor: origW, h_minor: origH, rotation: origRot } = originalItem;
            let newRowStart = origPos.rowStart;
            let newColStart = origPos.colStart;
            let newWMinor = origW;
            let newHMinor = origH;

            if (origRot === 0 || origRot === 180) { // Item aligned with grid axes or flipped
                switch (direction) {
                    case 'N': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.rowStart + origH) - hoveredMinorR); newRowStart = (origPos.rowStart + origH) - newHMinor; break;
                    case 'S': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - origPos.rowStart + 1); break;
                    case 'W': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.colStart + origW) - hoveredMinorC); newColStart = (origPos.colStart + origW) - newWMinor; break;
                    case 'E': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - origPos.colStart + 1); break;
                    default: break;
                }
            } else { // Item rotated 90 or 270 degrees
                switch (direction) {
                    case 'N': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.rowStart + origW) - hoveredMinorR); newRowStart = (origPos.rowStart + origW) - newWMinor; break;
                    case 'S': newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - origPos.rowStart + 1); break;
                    case 'W': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.colStart + origH) - hoveredMinorC); newColStart = (origPos.colStart + origH) - newHMinor; break;
                    case 'E': newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - origPos.colStart + 1); break;
                    default: break;
                }
            }

            const tempItemForValidation = { ...originalItem, w_minor: newWMinor, h_minor: newHMinor, rotation: origRot };
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
            if (!gridRef.current || minorCellSizePx === 0 || zoomLevel === 0 || !monitor.didDrop()) {
                onUpdateDraggedItemPreview(null); return;
            }
            const { type: handleType, itemId, direction, originalItem } = dragPayload;
            if (handleType !== ItemTypes.RESIZE_HANDLE) return;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) { onUpdateDraggedItemPreview(null); return; }

            const gridRect = gridRef.current.getBoundingClientRect();
            const mouseX_on_scaled_grid_px = clientOffset.x - gridRect.left;
            const mouseY_on_scaled_grid_px = clientOffset.y - gridRect.top;
            const mouseX_on_unscaled_grid_px = mouseX_on_scaled_grid_px / zoomLevel;
            const mouseY_on_unscaled_grid_px = mouseY_on_scaled_grid_px / zoomLevel;

            const droppedMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_on_unscaled_grid_px / minorCellSizePx) + 1));
            const droppedMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_on_unscaled_grid_px / minorCellSizePx) + 1));
            
            let { gridPosition: origPos, w_minor: origW, h_minor: origH, rotation: origRot } = originalItem;
            let finalRowStart = origPos.rowStart;
            let finalColStart = origPos.colStart;
            let finalWMinor = origW;
            let finalHMinor = origH;

            if (origRot === 0 || origRot === 180) {
                switch (direction) {
                    case 'N': finalHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.rowStart + origH) - droppedMinorR); finalRowStart = (origPos.rowStart + origH) - finalHMinor; break;
                    case 'S': finalHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, droppedMinorR - origPos.rowStart + 1); break;
                    case 'W': finalWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.colStart + origW) - droppedMinorC); finalColStart = (origPos.colStart + origW) - finalWMinor; break;
                    case 'E': finalWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, droppedMinorC - origPos.colStart + 1); break;
                    default: break;
                }
            } else { 
                switch (direction) {
                    case 'N': finalWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.rowStart + origW) - droppedMinorR); finalRowStart = (origPos.rowStart + origW) - finalWMinor; break;
                    case 'S': finalWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, droppedMinorR - origPos.rowStart + 1); break;
                    case 'W': finalHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.colStart + origH) - droppedMinorC); finalColStart = (origPos.colStart + origH) - finalHMinor; break;
                    case 'E': finalHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, droppedMinorC - origPos.colStart + 1); break;
                    default: break;
                }
            }

            const tempItemForValidation = { ...originalItem, w_minor: finalWMinor, h_minor: finalHMinor, rotation: origRot };
            const { w: effW_final, h: effH_final } = getEffectiveDimensionsUtil(tempItemForValidation);

            if (canPlaceItem(finalRowStart, finalColStart, effW_final, effH_final, itemId)) {
                onUpdateItemProperty(itemId, {
                    gridPosition: { rowStart: finalRowStart, colStart: finalColStart },
                    w_minor: finalWMinor,
                    h_minor: finalHMinor,
                });
            }
            onUpdateDraggedItemPreview(null);
        },
        collect: monitor => ({
            isOverGrid: !!monitor.isOver({ shallow: true }),
        }),
    }), [
        totalMinorRows, totalMinorCols, minorCellSizePx, zoomLevel, // Added zoomLevel
        canPlaceItem, onUpdateItemProperty, onUpdateDraggedItemPreview, ItemTypes,
    ]);

    // Connect the drop target to the grid div
    useEffect(() => {
        if (gridRef.current) {
            dropOnGridRef(gridRef); // Correctly use the ref from useDrop
        }
    }, [dropOnGridRef]);


    const gridWrapperStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        // These width/height define the unscaled size of the grid.
        // The visual size will be this * zoomLevel.
        width: `${majorGridCols * CELL_SIZE_REM}rem`,
        height: `${majorGridRows * CELL_SIZE_REM}rem`,
        minWidth: '300px', // An arbitrary minimum to prevent excessive shrinking
        backgroundColor: 'var(--color-background-grid, #f9fafb)', // Make sure this CSS var is defined
        touchAction: 'none', // Prevent page scroll on touch devices when dragging items
        position: 'relative', // For absolutely positioned children like PlacedItemWrapper
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left',
        // Transition for smoother zoom (optional, can impact performance on complex grids)
        // transition: 'transform 0.15s ease-out',
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, CELL_SIZE_REM, zoomLevel]);

    if (!ItemTypes || typeof ItemTypes.RESIZE_HANDLE !== 'string') {
        console.error('LayoutDesignerGrid: Critical prop error. ItemTypes.RESIZE_HANDLE is missing or not a string.');
        return <div style={{color: 'red', padding: '20px'}}>Configuration Error: RESIZE_HANDLE not defined.</div>;
    }

    return (
        <div
            ref={gridRef} // Attach ref for bounding box calculations and main drop target
            initial={{ opacity: 0, scale: 0.98 }} // Initial animation for the grid container itself
            animate={{ opacity: 1, scale: 1 }}   // Note: this scale is for the wrapper, not the zoom
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mx-auto rounded-lg shadow-md border border-gray-300" // Styles for the immediate container of the scaled grid
            // The actual scaled grid div is inside this motion.div
            // The direct style with transform is applied to the grid div itself
            style={gridWrapperStyle} // This style includes the transform: scale()
            onMouseLeave={() => {
                // Clear preview if mouse leaves the grid area AND a drag operation is in progress
                if (draggedItemPreview) {
                    onUpdateDraggedItemPreview(null);
                }
            }}
        >
            {/* Render Minor Grid Cells (DroppableGridCell represents a minor cell) */}
            {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                    const minorRow = rIndex + 1;
                    const minorCol = cIndex + 1;
                    const isMajorRowBoundary = minorRow % gridSubdivision === 0;
                    const isMajorColBoundary = minorCol % gridSubdivision === 0;
                    const isGridEdgeRow = minorRow === totalMinorRows;
                    const isGridEdgeCol = minorCol === totalMinorCols;

                    // Suppress cell-level preview if a resize operation is active and showing its own preview
                    const showCellLevelPreview = !(draggedItemPreview && draggedItemPreview.type === 'resize');

                    return (
                        <DroppableGridCell
                            key={`minor-cell-${minorRow}-${minorCol}`}
                            r={minorRow} c={minorCol}
                            isMajorRowBoundary={isMajorRowBoundary} isMajorColBoundary={isMajorColBoundary}
                            isGridEdgeRow={isGridEdgeRow} isGridEdgeCol={isGridEdgeCol}
                            gridSubdivision={gridSubdivision}
                            addItem={onAddItem} moveItem={onMoveItem}
                            canPlaceItemAtCoords={canPlaceItem}
                            draggedItemPreview={showCellLevelPreview ? draggedItemPreview : null}
                            updateDraggedItemPreview={onUpdateDraggedItemPreview}
                            isEraserActive={isEraserActive}
                            eraseDesignerItem={onEraseDesignerItemFromCell}
                            ItemTypes={ItemTypes}
                        />
                    );
                })
            )}

            {/* Render Resize Preview */}
            {draggedItemPreview && draggedItemPreview.type === 'resize' && draggedItemPreview.itemId && (
                <div style={{
                    position: 'absolute',
                    top: `${(draggedItemPreview.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                    left: `${(draggedItemPreview.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
                    width: `${draggedItemPreview.effW_minor * minorCellSizeRem}rem`,
                    height: `${draggedItemPreview.effH_minor * minorCellSizeRem}rem`,
                    backgroundColor: draggedItemPreview.isValid ? 'rgba(74, 222, 128, 0.4)' : 'rgba(248, 113, 113, 0.4)',
                    border: `2px dashed ${draggedItemPreview.isValid ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}`,
                    zIndex: 50,
                    pointerEvents: 'none',
                    borderRadius: '4px',
                }} />
            )}

            {/* Render All Placed Design Items using PlacedItemWrapper */}
            <AnimatePresence>
                {designItems.filter(item => item && item.id && item.gridPosition).map(item => {
                    const isCurrentlySelected = selectedItemId === item.id;
                    // Don't show resize handles on the item if this very item is the one being previewed for resize
                    const isThisItemBeingResizedPreview = draggedItemPreview?.type === 'resize' && draggedItemPreview?.itemId === item.id;

                    return (
                        <PlacedItemWrapper
                            key={item.id}
                            item={item}
                            isEraserActive={isEraserActive}
                            eraseDesignerItemById={onEraseDesignerItemById}
                            onUpdateItemProperty={onUpdateItemProperty}
                            onSelectItem={onSelectItem}
                            isSelected={isCurrentlySelected && !isThisItemBeingResizedPreview}
                            CELL_SIZE_REM={minorCellSizeRem} // Pass MINOR cell size for wrapper's calculations
                            ItemTypes={ItemTypes}
                            ITEM_CONFIGS={ITEM_CONFIGS}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default LayoutDesignerGrid;