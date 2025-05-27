// features/venue_management/subcomponents/layout_designer/grid_system/LayoutDesignerGrid.jsx
import React, { useMemo, useRef, useEffect, useState } from 'react'; // Added useState
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import DroppableGridCell from './DroppableGridCell';
import PlacedItemWrapper from '../PlacedItemWrapper';
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../../utils/layoutUtils';

// Define a minimum dimension for items in minor cells.
// Can be 1 for max granularity, or `gridSubdivision` to enforce items are at least 1 major cell equivalent.
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
    canPlaceItem, // The validation function from useLayoutDesignerStateManagement
    draggedItemPreview,
    onUpdateDraggedItemPreview,
    isEraserActive,
}) => {

    const gridRef = useRef(null);
    const [minorCellSizePx, setMinorCellSizePx] = useState(16); // Default/fallback

    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => CELL_SIZE_REM / gridSubdivision, [CELL_SIZE_REM, gridSubdivision]);

    useEffect(() => {
        if (typeof window !== 'undefined' && gridRef.current) {
            const currentREMValue = parseFloat(getComputedStyle(document.documentElement).fontSize);
            setMinorCellSizePx((CELL_SIZE_REM / gridSubdivision) * currentREMValue);
        }
    }, [CELL_SIZE_REM, gridSubdivision]);


    const [{ isOverGrid }, dropOnGrid] = useDrop(() => ({
        accept: [ItemTypes.RESIZE_HANDLE], // Only handles resize drops directly on the grid container
        hover: (dragPayload, monitor) => {
            if (!monitor.isOver({ shallow: true }) || !gridRef.current || minorCellSizePx === 0) return;

            const { type: handleType, itemId, direction, originalItem } = dragPayload;
            if (handleType !== ItemTypes.RESIZE_HANDLE) return;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const gridRect = gridRef.current.getBoundingClientRect();
            const mouseX_px = clientOffset.x - gridRect.left;
            const mouseY_px = clientOffset.y - gridRect.top;

            const hoveredMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_px / minorCellSizePx) + 1));
            const hoveredMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_px / minorCellSizePx) + 1));

            let { gridPosition: origPos, w_minor: origW, h_minor: origH, rotation: origRot } = originalItem;
            let newRowStart = origPos.rowStart;
            let newColStart = origPos.colStart;
            let newWMinor = origW;
            let newHMinor = origH;

            // Determine new dimensions and position based on handle direction and item rotation
            if (origRot === 0 || origRot === 180) { // Item is aligned with grid axes or flipped
                switch (direction) {
                    case 'N':
                        newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.rowStart + origH) - hoveredMinorR);
                        newRowStart = (origPos.rowStart + origH) - newHMinor;
                        break;
                    case 'S':
                        newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - origPos.rowStart + 1);
                        break;
                    case 'W':
                        newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.colStart + origW) - hoveredMinorC);
                        newColStart = (origPos.colStart + origW) - newWMinor;
                        break;
                    case 'E':
                        newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - origPos.colStart + 1);
                        break;
                    default: break;
                }
            } else { // Item is rotated 90 or 270 degrees (width and height are swapped visually)
                switch (direction) {
                    case 'N': // Visual top, affects base width
                        newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.rowStart + origW) - hoveredMinorR);
                        newRowStart = (origPos.rowStart + origW) - newWMinor;
                        break;
                    case 'S': // Visual bottom, affects base width
                        newWMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorR - origPos.rowStart + 1);
                        break;
                    case 'W': // Visual left, affects base height
                        newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, (origPos.colStart + origH) - hoveredMinorC);
                        newColStart = (origPos.colStart + origH) - newHMinor;
                        break;
                    case 'E': // Visual right, affects base height
                        newHMinor = Math.max(MIN_ITEM_DIMENSION_MINOR_CELLS, hoveredMinorC - origPos.colStart + 1);
                        break;
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
                effW_minor: effW_check, effH_minor: effH_check, // Pass effective dimensions for preview
                rotation: origRot, isValid,
            });
        },
        drop: (dragPayload, monitor) => {
            if (!gridRef.current || minorCellSizePx === 0 || !monitor.didDrop()) { // Ensure drop is on this target
                onUpdateDraggedItemPreview(null); // Clear preview if drop conditions not met
                return;
            }
            const { type: handleType, itemId, direction, originalItem } = dragPayload;
            if (handleType !== ItemTypes.RESIZE_HANDLE) return;

            // Recalculate final position and dimensions (similar to hover, but based on drop point)
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) {
                onUpdateDraggedItemPreview(null);
                return;
            }

            const gridRect = gridRef.current.getBoundingClientRect();
            const mouseX_px = clientOffset.x - gridRect.left;
            const mouseY_px = clientOffset.y - gridRect.top;
            const droppedMinorC = Math.max(1, Math.min(totalMinorCols, Math.floor(mouseX_px / minorCellSizePx) + 1));
            const droppedMinorR = Math.max(1, Math.min(totalMinorRows, Math.floor(mouseY_px / minorCellSizePx) + 1));

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
            } else { // 90 or 270
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
            } // else: The state hook's validation will provide an alert if needed.
            onUpdateDraggedItemPreview(null); // Clear preview after drop
        },
        collect: monitor => ({
            isOverGrid: !!monitor.isOver({ shallow: true }),
            // draggingResizeItem: monitor.getItem(), // Not strictly needed if type check is done
        }),
    }), [
        totalMinorRows, totalMinorCols, minorCellSizePx,
        canPlaceItem, onUpdateItemProperty, onUpdateDraggedItemPreview,
        ItemTypes, // Critical for `accept` and type checking
        // designItems, gridSubdivision not directly used in these callbacks, but are deps for canPlaceItem
    ]);

    // Connect the drop target to the grid div
    useEffect(() => {
        if (gridRef.current) {
            dropOnGrid(gridRef);
        }
    }, [dropOnGrid]);


    const gridWrapperStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        width: `${majorGridCols * CELL_SIZE_REM}rem`,
        height: `${majorGridRows * CELL_SIZE_REM}rem`,
        minWidth: '300px',
        backgroundColor: 'var(--color-background-grid, #f9fafb)', // Ensure this CSS var is defined
        touchAction: 'none',
        position: 'relative', // Ensure it's a positioning context for absolutely positioned children
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, CELL_SIZE_REM]);

    // --- Prop Validation ---
    if (!ItemTypes || typeof ItemTypes.RESIZE_HANDLE !== 'string') {
        console.error(
            'LayoutDesignerGrid: Critical prop error. ItemTypes.RESIZE_HANDLE is missing or not a string.',
            'Received ItemTypes:', ItemTypes
        );
        return (
            <div style={{ padding: '20px', color: 'red', border: '1px solid red', margin: '20px', backgroundColor: 'white' }}>
                <h2>Configuration Error in LayoutDesignerGrid</h2>
                <p><code>ItemTypes.RESIZE_HANDLE</code> is not correctly defined. Please check the console.</p>
            </div>
        );
    }

    return (
        <motion.div
            ref={gridRef} // Attach ref for bounding box and drop target
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mx-auto rounded-lg shadow-md overflow-hidden border border-gray-300" // Removed relative from here as gridWrapperStyle has it
            style={gridWrapperStyle}
            onMouseLeave={() => {
                // If a drag preview is active when mouse leaves grid, clear it.
                // Drop handlers will also clear it on successful drop.
                if (draggedItemPreview) {
                    onUpdateDraggedItemPreview(null);
                }
            }}
        >
            {/* Render Minor Grid Cells */}
            {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                    const minorRow = rIndex + 1;
                    const minorCol = cIndex + 1;
                    const isMajorRowBoundary = minorRow % gridSubdivision === 0;
                    const isMajorColBoundary = minorCol % gridSubdivision === 0;
                    const isGridEdgeRow = minorRow === totalMinorRows;
                    const isGridEdgeCol = minorCol === totalMinorCols;

                    // Suppress cell-level preview if a resize operation is active
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
                    backgroundColor: draggedItemPreview.isValid ? 'rgba(74, 222, 128, 0.4)' : 'rgba(248, 113, 113, 0.4)', // Green/Red with alpha
                    border: `2px dashed ${draggedItemPreview.isValid ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}`, // Darker Green/Red
                    zIndex: 50, // Above cells, potentially below item being dragged if visual issues
                    pointerEvents: 'none', // Preview should not interfere with mouse events
                    borderRadius: '4px', // Optional: match item's border radius
                }} />
            )}

            {/* Render All Placed Design Items */}
            <AnimatePresence>
                {designItems.filter(item => item && item.id && item.gridPosition).map(item => {
                    const isCurrentlySelected = selectedItemId === item.id;
                    const isBeingResized = draggedItemPreview?.type === 'resize' && draggedItemPreview?.itemId === item.id;

                    return (
                        <PlacedItemWrapper
                            key={item.id}
                            item={item}
                            isEraserActive={isEraserActive}
                            eraseDesignerItemById={onEraseDesignerItemById}
                            onUpdateItemProperty={onUpdateItemProperty}
                            onSelectItem={onSelectItem}
                            isSelected={isCurrentlySelected && !isBeingResized} // Show handles if selected, but not if it's this item being actively resized
                            CELL_SIZE_REM={minorCellSizeRem} // Pass MINOR cell size for wrapper's calculations
                            ItemTypes={ItemTypes}
                            ITEM_CONFIGS={ITEM_CONFIGS}
                        />
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
};

export default LayoutDesignerGrid;