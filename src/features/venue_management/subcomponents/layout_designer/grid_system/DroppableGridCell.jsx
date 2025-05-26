import React from 'react';
import { useDrop } from 'react-dnd';

const DroppableGridCell = ({
    r, // MINOR row index (1-based)
    c, // MINOR column index (1-based)

    // Styling props from LayoutDesignerGrid
    isMajorRowBoundary,
    isMajorColBoundary,
    isGridEdgeRow,
    isGridEdgeCol,
    gridSubdivision, // Current subdivision level (e.g., 1, 2, 4)

    isEraserActive,
    eraseDesignerItem,     // (minorRow, minorCol) => void
    addItem,               // (toolItemFromPayload, minorRow, minorCol, itemTypeFromTool) => void
    moveItem,              // (itemId, toMinorRow, toMinorCol) => void
    canPlaceItemAtCoords,  // (minorRow, minorCol, itemW_minor, itemH_minor, itemToExcludeId) => boolean

    draggedItemPreview,       // { r (minor), c (minor), w (minor), h (minor), isValid } | null
    updateDraggedItemPreview, // (previewData | null) => void
    ItemTypes,                // { TABLE_TOOL, PLACED_TABLE }
}) => {

    const [{ isOver, canDropItem }, drop] = useDrop(() => ({
        accept: [ItemTypes.TABLE_TOOL, ItemTypes.PLACED_TABLE],
        drop: (item, monitor) => {
            // `item` is the payload from DraggableGenericTool or PlacedItem
            // `r`, `c` are the minor cell coordinates of this DroppableGridCell (where drop occurs)
            const didDrop = monitor.didDrop();
            if (didDrop) return; // Prevents multiple drops on nested targets if any

            const itemTypeFromMonitor = monitor.getItemType();
            if (itemTypeFromMonitor === ItemTypes.TABLE_TOOL) {
                // item: { type (tool's 'size'), w (MAJOR cell units), h (MAJOR cell units), itemType: ItemTypes.TABLE_TOOL }
                addItem(item, r, c, ItemTypes.TABLE_TOOL);
            } else if (itemTypeFromMonitor === ItemTypes.PLACED_TABLE) {
                // item: { id, itemType, w (minor), h (minor), rotation, size, effW_minor, effH_minor }
                moveItem(item.id, r, c);
            }
            updateDraggedItemPreview(null); // Clear preview on successful drop
        },
        hover: (item, monitor) => {
            if (!monitor.isOver({ shallow: true })) return; // Only for this specific cell

            let previewW_minor, previewH_minor;
            let itemId = null;

            if (item.itemType === ItemTypes.TABLE_TOOL) {
                // Tool's w/h are in MAJOR cells. Convert to minor for preview.
                previewW_minor = item.w * gridSubdivision;
                previewH_minor = item.h * gridSubdivision;
            } else if (item.itemType === ItemTypes.PLACED_TABLE) {
                // PlacedItem's drag payload includes effW_minor, effH_minor (effective dimensions in minor units)
                previewW_minor = item.effW_minor;
                previewH_minor = item.effH_minor;
                itemId = item.id;
            } else {
                updateDraggedItemPreview(null); // Should not happen with current accepted types
                return;
            }
            // r, c are this cell's minor coordinates (top-left of potential placement)
            const isValid = canPlaceItemAtCoords(r, c, previewW_minor, previewH_minor, itemId);
            updateDraggedItemPreview({ r, c, w: previewW_minor, h: previewH_minor, isValid });
        },
        canDrop: (item, monitor) => {
            let itemW_minor, itemH_minor, itemId = null;
            if (item.itemType === ItemTypes.TABLE_TOOL) {
                itemW_minor = item.w * gridSubdivision;
                itemH_minor = item.h * gridSubdivision;
            } else if (item.itemType === ItemTypes.PLACED_TABLE) {
                itemW_minor = item.effW_minor;
                itemH_minor = item.effH_minor;
                itemId = item.id;
            } else {
                return false;
            }
            // r, c are this cell's minor coordinates
            return canPlaceItemAtCoords(r, c, itemW_minor, itemH_minor, itemId);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver({ shallow: true }),
            canDropItem: !!monitor.canDrop(),
        }),
    }), [r, c, addItem, moveItem, canPlaceItemAtCoords, updateDraggedItemPreview, ItemTypes, gridSubdivision, isEraserActive]); // Added isEraserActive for click handler context

    const clickHandler = () => {
        if (isEraserActive) {
            eraseDesignerItem(r, c); // Erase content starting at this minor cell (r,c)
        }
        // Add other click logic if needed (e.g., for kitchen definition, passing minor r,c)
    };

    // --- Styling for minor/major grid lines ---
    let cellStyleClasses = "flex items-center justify-center transition-colors duration-100 ease-in-out";

    // Base minor cell borders (very light)
    // Apply right and bottom border to all cells by default.
    // The container of LayoutDesignerGrid should have the top and left border for the whole grid.
    cellStyleClasses += " border-gray-200"; // Combined border color class

    // Default border widths (thin)
    let borderRightWidth = "border-r";
    let borderBottomWidth = "border-b";

    // Thicker borders for major grid lines, but not for the very edge of the entire grid
    if (isMajorColBoundary && !isGridEdgeCol) {
        borderRightWidth = "border-r-2 border-r-gray-400"; // Thicker & darker for major
    }
    if (isMajorRowBoundary && !isGridEdgeRow) {
        borderBottomWidth = "border-b-2 border-b-gray-400"; // Thicker & darker for major
    }

    // Remove borders at the very edge of the grid (the parent container `LayoutDesignerGrid` has the outer border)
    if (isGridEdgeCol) borderRightWidth = "border-r-0";
    if (isGridEdgeRow) borderBottomWidth = "border-b-0";

    cellStyleClasses += ` ${borderRightWidth} ${borderBottomWidth}`;


    // Styling for drag preview / DND states
    if (draggedItemPreview) {
        const { r: pR_minor, c: pC_minor, w: pW_minor, h: pH_minor, isValid: pIsValid } = draggedItemPreview;
        // Check if this current minor cell (r, c) falls within the dragged item's footprint
        if (r >= pR_minor && r < pR_minor + pH_minor && c >= pC_minor && c < pC_minor + pW_minor) {
            cellStyleClasses += pIsValid ? ' bg-green-200 opacity-70' : ' bg-red-200 opacity-70';
        } else if (isOver && canDropItem) { // This cell is the top-left anchor for a valid drop
            cellStyleClasses += ' bg-lime-300 bg-opacity-50';
        } else if (isOver && !canDropItem) { // This cell is the top-left anchor for an invalid drop
            cellStyleClasses += ' bg-rose-300 bg-opacity-50';
        }
    } else if (isOver && canDropItem) { // Hovering over a valid top-left drop anchor, no active preview across multiple cells
        cellStyleClasses += ' bg-lime-200 bg-opacity-60';
    } else if (isOver && !canDropItem) { // Hovering over an invalid top-left drop anchor
        cellStyleClasses += ' bg-rose-200 bg-opacity-60';
    }

    // Eraser hover effect
    if (isEraserActive && isOver) {
        cellStyleClasses += ' bg-red-100 opacity-80';
    }


    return (
        <div
            ref={drop}
            className={cellStyleClasses}
            // Width and height are implicitly set by parent's CSS grid (grid-template-columns/rows)
            // No explicit style for width/height needed here.
            onClick={clickHandler}
            title={isEraserActive ? `Eraser on cell (${r},${c})` : `Cell (${r},${c})`}
        >
            {/* Optional: Debugging info for very small subdivisions */}
            {/* {gridSubdivision >= 4 && <span className="text-xxxs text-gray-400 select-none pointer-events-none">{r},{c}</span>} */}
        </div>
    );
};

export default DroppableGridCell;