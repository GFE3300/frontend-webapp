import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DroppableGridCell from './DroppableGridCell'; // Will represent a MINOR cell
import PlacedItem from '../PlacedItem'; // PlacedItem is outside grid_system

const LayoutDesignerGrid = ({
    majorGridRows,          // Number of major rows
    majorGridCols,          // Number of major columns
    gridSubdivision,        // Subdivision level (e.g., 1, 2, 4)
    designedTables,
    // designedObstacles,    // If implementing
    // definedKitchenArea,   // If implementing visual representation here

    ItemTypes,
    CELL_SIZE_REM,          // Size of one MAJOR grid cell in rem

    onAddItem,              // (toolItem, minorRow, minorCol, itemTypeFromTool) => void
    onMoveItem,             // (itemId, toMinorRow, toMinorCol) => void
    onEraseDesignerItemFromCell, // (minorRow, minorCol) => void
    onEraseDesignerItemById,     // (itemId) => void

    onUpdateTableNumber,    // (tableId, newNumberString) => boolean
    onRotateTable,          // (tableId) => void (triggers updateTableProperties with {rotation: true})

    canPlaceItem,           // (minorRow, minorCol, itemW_minor, itemH_minor, itemToExcludeId) => boolean

    draggedItemPreview,       // { r_minor, c_minor, w_minor, h_minor, isValid } | null
    onUpdateDraggedItemPreview, // (previewData | null) => void

    isEraserActive,
    // isDefiningKitchen,
    // onCellClickForKitchen, // If minor cells handle kitchen definition clicks
}) => {

    // Calculate total minor cells and the size of each minor cell
    const totalMinorRows = useMemo(() => majorGridRows * gridSubdivision, [majorGridRows, gridSubdivision]);
    const totalMinorCols = useMemo(() => majorGridCols * gridSubdivision, [majorGridCols, gridSubdivision]);

    // CELL_SIZE_REM is for a MAJOR cell. minorCellSizeRem is the visual size of each DroppableGridCell.
    const minorCellSizeRem = useMemo(() => CELL_SIZE_REM / gridSubdivision, [CELL_SIZE_REM, gridSubdivision]);

    const gridWrapperStyle = useMemo(() => ({
        display: 'grid',
        // Grid template is now based on total minor cells and their individual size
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        // Total width/height of the grid container remains based on MAJOR cells and CELL_SIZE_REM
        width: `${majorGridCols * CELL_SIZE_REM}rem`,
        height: `${majorGridRows * CELL_SIZE_REM}rem`,
        minWidth: '300px', // Example
        backgroundColor: 'var(--color-background-grid, #f9fafb)', // Use a CSS variable or a fallback
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, majorGridCols, majorGridRows, CELL_SIZE_REM]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mx-auto rounded-lg shadow-md relative overflow-hidden border border-gray-300" // Ensure border for grid edges
            style={gridWrapperStyle}
            onMouseLeave={() => onUpdateDraggedItemPreview(null)} // Clear preview when mouse leaves grid
        >
            {/* Render Minor Grid Cells (DroppableGridCell now represents a minor cell) */}
            {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                    const minorRow = rIndex + 1; // 1-based minor coordinate
                    const minorCol = cIndex + 1; // 1-based minor coordinate

                    // Determine if this minor cell's bottom/right border forms a major grid line
                    const isMajorRowBoundary = minorRow % gridSubdivision === 0;
                    const isMajorColBoundary = minorCol % gridSubdivision === 0;

                    // Determine if this minor cell is at the very edge of the entire grid
                    const isGridEdgeRow = minorRow === totalMinorRows;
                    const isGridEdgeCol = minorCol === totalMinorCols;

                    return (
                        <DroppableGridCell
                            key={`minor-cell-${minorRow}-${minorCol}`}
                            r={minorRow}
                            c={minorCol}
                            // Properties for styling based on major/minor lines
                            isMajorRowBoundary={isMajorRowBoundary}
                            isMajorColBoundary={isMajorColBoundary}
                            isGridEdgeRow={isGridEdgeRow}
                            isGridEdgeCol={isGridEdgeCol}
                            gridSubdivision={gridSubdivision}

                            // DND and interaction props (all operate with minor coordinates)
                            addItem={onAddItem}
                            moveItem={onMoveItem}
                            canPlaceItemAtCoords={canPlaceItem}

                            draggedItemPreview={draggedItemPreview}
                            updateDraggedItemPreview={onUpdateDraggedItemPreview}

                            isEraserActive={isEraserActive}
                            eraseDesignerItem={onEraseDesignerItemFromCell} // Called with minorRow, minorCol

                            ItemTypes={ItemTypes}
                        />
                    );
                })
            )}

            {/* Render Placed Items (Tables) */}
            {/* PlacedItem positions and sizes itself based on minor cell coordinates and minorCellSizeRem */}
            <AnimatePresence>
                {designedTables.filter(t => t && t.id && t.gridPosition).map(table => (
                    <PlacedItem
                        key={table.id}
                        item={table} // item.gridPosition, item.w, item.h are in MINOR units
                        itemType={ItemTypes.PLACED_TABLE}
                        isEraserActive={isEraserActive}
                        eraseDesignerItem={onEraseDesignerItemById} // Called with itemId
                        onUpdateTableNumber={onUpdateTableNumber}
                        onRotateTable={onRotateTable}
                        CELL_SIZE_REM={minorCellSizeRem} // Pass MINOR cell size to PlacedItem
                        ItemTypes={ItemTypes}
                    />
                ))}
            </AnimatePresence>

            {/* Placeholder for Kitchen Area visual (if implemented) */}
            {/* It would also be positioned and sized using minorCellSizeRem and minor coordinates */}
            {/* {definedKitchenArea && (
                <motion.div
                    // ... styles based on definedKitchenArea (minor coords) and minorCellSizeRem ...
                >Kitchen</motion.div>
            )} */}
        </motion.div>
    );
};

export default LayoutDesignerGrid;