// features/venue_management/subcomponents/layout_designer/grid_system/LayoutDesignerGrid.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence for item add/remove
import DroppableGridCell from './DroppableGridCell';
import PlacedItemWrapper from '../PlacedItemWrapper'; // Updated import name

const LayoutDesignerGrid = ({
    majorGridRows,
    majorGridCols,
    gridSubdivision,

    designItems,            // Array of all design item objects (generic)
    ItemTypes,              // Constants for DND types { TABLE_TOOL, PLACED_TABLE, WALL_TOOL, PLACED_WALL, ... }
    ITEM_CONFIGS,           // Main configuration for all PlacedItemTypes
    CELL_SIZE_REM,          // Size of one MAJOR grid cell in rem

    // Callbacks from useLayoutDesignerStateManagement via LayoutDesigner
    onAddItem,              // (toolPayloadFromDrag, minorRow, minorCol) => void
    onMoveItem,             // (itemId, toMinorRow, toMinorCol) => void
    onEraseDesignerItemFromCell, // (minorRow, minorCol) => void (eraser on empty cell part of item)
    onEraseDesignerItemById,     // (itemId) => void (eraser directly on item or item's own erase button)
    onUpdateItemProperty,   // Generic: (itemId, { property: value }) => boolean
    onSelectItem,           // (itemId) => void, to set selected item for sidebar

    canPlaceItem,           // (minorRow, minorCol, itemW_minor, itemH_minor, itemToExcludeId) => boolean

    // For drag preview visualization
    draggedItemPreview,
    onUpdateDraggedItemPreview,

    isEraserActive,
    // isDefiningKitchen, // Future feature
    // onCellClickForKitchen, // Future feature
}) => {

    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => CELL_SIZE_REM / gridSubdivision, [CELL_SIZE_REM, gridSubdivision]);

    const gridWrapperStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        width: `${majorGridCols * CELL_SIZE_REM}rem`,
        height: `${majorGridRows * CELL_SIZE_REM}rem`,
        minWidth: '300px',
        backgroundColor: 'var(--color-background-grid, #f9fafb)',
        touchAction: 'none', // Helps prevent page scroll on touch devices when dragging items
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, CELL_SIZE_REM]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mx-auto rounded-lg shadow-md relative overflow-hidden border border-gray-300"
            style={gridWrapperStyle}
            onMouseLeave={() => onUpdateDraggedItemPreview(null)} // Clear drag preview when mouse leaves grid
        >
            {/* Render Minor Grid Cells (DroppableGridCell represents a minor cell) */}
            {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                    const minorRow = rIndex + 1; // 1-based minor coordinate
                    const minorCol = cIndex + 1; // 1-based minor coordinate

                    const isMajorRowBoundary = minorRow % gridSubdivision === 0;
                    const isMajorColBoundary = minorCol % gridSubdivision === 0;
                    const isGridEdgeRow = minorRow === totalMinorRows;
                    const isGridEdgeCol = minorCol === totalMinorCols;

                    return (
                        <DroppableGridCell
                            key={`minor-cell-${minorRow}-${minorCol}`}
                            r={minorRow}
                            c={minorCol}
                            isMajorRowBoundary={isMajorRowBoundary}
                            isMajorColBoundary={isMajorColBoundary}
                            isGridEdgeRow={isGridEdgeRow}
                            isGridEdgeCol={isGridEdgeCol}
                            gridSubdivision={gridSubdivision}

                            addItem={onAddItem}
                            moveItem={onMoveItem}
                            canPlaceItemAtCoords={canPlaceItem} // Renamed for clarity from canPlaceItem

                            draggedItemPreview={draggedItemPreview}
                            updateDraggedItemPreview={onUpdateDraggedItemPreview}

                            isEraserActive={isEraserActive}
                            eraseDesignerItem={onEraseDesignerItemFromCell} // For eraser on cell

                            ItemTypes={ItemTypes} // Pass all DND item types
                        />
                    );
                })
            )}

            {/* Render All Placed Design Items using PlacedItemWrapper */}
            <AnimatePresence>
                {designItems.filter(item => item && item.id && item.gridPosition).map(item => (
                    <PlacedItemWrapper
                        key={item.id}
                        item={item} // Pass the full, generic item object
                        // itemType={item.itemType} // Redundant, item.itemType exists

                        isEraserActive={isEraserActive}
                        eraseDesignerItemById={onEraseDesignerItemById} // For item's own erase action
                        onUpdateItemProperty={onUpdateItemProperty} // Generic update function
                        onSelectItem={onSelectItem} // To select item for sidebar

                        CELL_SIZE_REM={minorCellSizeRem} // Pass MINOR cell size
                        ItemTypes={ItemTypes}
                        ITEM_CONFIGS={ITEM_CONFIGS} // Pass ITEM_CONFIGS if PlacedItemWrapper or its children need it
                    />
                ))}
            </AnimatePresence>

            {/* Placeholder for Kitchen Area visual (if implemented and managed by this component) */}
            {/* e.g., if currentLayout from LayoutDesigner included kitchenArea and it's passed here */}
            {/* {currentLayout?.kitchenArea && (
                <motion.div
                    style={{
                        gridRowStart: currentLayout.kitchenArea.rowStart_minor,
                        gridColumnStart: currentLayout.kitchenArea.colStart_minor,
                        gridRowEnd: `span ${currentLayout.kitchenArea.h_minor}`,
                        gridColumnEnd: `span ${currentLayout.kitchenArea.w_minor}`,
                        zIndex: 1, // Below items
                        pointerEvents: 'none',
                    }}
                    className="bg-slate-200 border-2 border-slate-400 rounded-md opacity-60 flex items-center justify-center"
                >
                    <span className="text-slate-600 font-semibold text-sm">Kitchen</span>
                </motion.div>
            )} */}
        </motion.div>
    );
};

export default LayoutDesignerGrid;