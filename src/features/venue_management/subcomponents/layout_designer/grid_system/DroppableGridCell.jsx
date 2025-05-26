// features/venue_management/subcomponents/layout_designer/grid_system/DroppableGridCell.jsx
import React from 'react';
import { useDrop } from 'react-dnd';
// ItemTypes should be passed as a prop, as it contains all defined types
// import { ItemTypes } from '../../constants/itemConfigs'; // No direct import, use prop

const DroppableGridCell = ({
    r, // MINOR row index (1-based) of this cell
    c, // MINOR column index (1-based) of this cell

    // Styling props from LayoutDesignerGrid
    isMajorRowBoundary,
    isMajorColBoundary,
    isGridEdgeRow,
    isGridEdgeCol,
    gridSubdivision, // Current subdivision level (e.g., 1, 2, 4)

    // Callbacks & State
    addItem,               // (toolPayloadFromDrag, targetMinorRow, targetMinorCol) => void
    moveItem,              // (itemId, toMinorRow, toMinorCol) => void
    canPlaceItemAtCoords,  // (targetMinorRow, targetMinorCol, itemW_minor, itemH_minor, itemToExcludeId) => boolean

    draggedItemPreview,       // { r (minor), c (minor), w (minor), h (minor), isValid } | null
    updateDraggedItemPreview, // (previewData | null) => void

    isEraserActive,
    eraseDesignerItem,     // (minorRowClicked, minorColClicked) => void - Erases item occupying this cell

    ItemTypes,             // Prop: All DND item types { TABLE_TOOL, PLACED_TABLE, WALL_TOOL, PLACED_WALL, etc. }
}) => {

    const [{ isOver, canDropItem }, drop] = useDrop(() => ({
        // Accept all defined tool types and all defined placed item types
        accept: [
            ItemTypes.TABLE_TOOL, ItemTypes.WALL_TOOL, ItemTypes.DOOR_TOOL, ItemTypes.DECOR_TOOL, // Add all tool types
            ItemTypes.PLACED_TABLE, ItemTypes.PLACED_WALL, ItemTypes.PLACED_DOOR, ItemTypes.PLACED_DECOR, // Add all placed item types
        ],
        drop: (item, monitor) => {
            // `item` is the payload from DraggableGenericTool or PlacedItemWrapper
            // `r`, `c` are the minor cell coordinates of *this* DroppableGridCell (where drop occurs)
            const didDrop = monitor.didDrop();
            if (didDrop) return; // Prevents multiple drops on nested targets

            const droppedItemType = monitor.getItemType(); // Get the actual type of the item being dropped

            // Check if the droppedItemType is one of the TOOL types
            const isTool = [ItemTypes.TABLE_TOOL, ItemTypes.WALL_TOOL, ItemTypes.DOOR_TOOL, ItemTypes.DECOR_TOOL].includes(droppedItemType);

            if (isTool) {
                // 'item' is toolPayloadFromDrag: { toolItemType, createsPlacedItemType, w_major, h_major, size_identifier }
                addItem(item, r, c); // 'r', 'c' are minor coords of this cell (top-left anchor).
            } else { // Assumed to be a PLACED_ITEM type
                // 'item' is from PlacedItemWrapper: { id, itemType, w_minor, h_minor, rotation, shape, effW_minor, effH_minor }
                moveItem(item.id, r, c);
            }
            updateDraggedItemPreview(null); // Clear preview on successful drop
        },
        hover: (item, monitor) => {
            // item: drag payload, monitor: dnd monitor instance
            if (!monitor.isOver({ shallow: true })) { // Only fire for this specific cell
                // If not over this cell anymore but was the anchor for a preview, consider clearing or letting mouseLeave on grid handle it.
                // For simplicity, we primarily rely on mouseLeave on the parent grid to clear.
                return;
            }

            let previewW_minor, previewH_minor;
            let itemIdToExclude = null; // For new items, no ID to exclude from collision yet.
            const currentHoverItemType = monitor.getItemType();

            const isTool = [ItemTypes.TABLE_TOOL, ItemTypes.WALL_TOOL, ItemTypes.DOOR_TOOL, ItemTypes.DECOR_TOOL].includes(currentHoverItemType);

            if (isTool) {
                // Item is a tool from the toolbar
                // Its payload contains w_major, h_major. Convert to minor for preview.
                previewW_minor = item.w_major * gridSubdivision;
                previewH_minor = item.h_major * gridSubdivision;
                // For tools, rotation is assumed 0 for initial placement preview
            } else if (item.effW_minor !== undefined && item.effH_minor !== undefined) {
                // Item is an existing PlacedItem being moved. Its payload contains effective dimensions.
                previewW_minor = item.effW_minor;
                previewH_minor = item.effH_minor;
                itemIdToExclude = item.id; // Exclude itself from collision check
            } else {
                // Should not happen if drag payloads are correct
                console.warn("DroppableGridCell: Dragged item missing expected dimensions for preview.", item);
                updateDraggedItemPreview(null);
                return;
            }

            const isValidPlacement = canPlaceItemAtCoords(r, c, previewW_minor, previewH_minor, itemIdToExclude);
            updateDraggedItemPreview({ r, c, w: previewW_minor, h: previewH_minor, isValid: isValidPlacement });
        },
        canDrop: (item, monitor) => {
            // Similar logic to hover to determine if the drop is valid
            let itemW_minor, itemH_minor, itemIdToExclude = null;
            const currentDropItemType = monitor.getItemType();
            const isTool = [ItemTypes.TABLE_TOOL, ItemTypes.WALL_TOOL, ItemTypes.DOOR_TOOL, ItemTypes.DECOR_TOOL].includes(currentDropItemType);

            if (isTool) {
                itemW_minor = item.w_major * gridSubdivision;
                itemH_minor = item.h_major * gridSubdivision;
            } else if (item.effW_minor !== undefined && item.effH_minor !== undefined) {
                itemW_minor = item.effW_minor;
                itemH_minor = item.effH_minor;
                itemIdToExclude = item.id;
            } else {
                return false; // Cannot determine dimensions, so cannot drop
            }
            return canPlaceItemAtCoords(r, c, itemW_minor, itemH_minor, itemIdToExclude);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver({ shallow: true }),
            canDropItem: !!monitor.canDrop(),
            draggingItemType: monitor.getItemType(), // Get type of item being dragged over
        }),
    }), [r, c, addItem, moveItem, canPlaceItemAtCoords, updateDraggedItemPreview, ItemTypes, gridSubdivision, isEraserActive]);

    const clickHandler = () => {
        if (isEraserActive) {
            // eraseDesignerItem will find which item (if any) occupies this r,c and remove it.
            eraseDesignerItem(r, c);
        }
        // Other click logic (e.g., for kitchen definition) could go here
        // else if (isDefiningKitchen && onCellClickForKitchen) {
        //    onCellClickForKitchen(r,c); // Pass minor coords
        // }
    };

    // --- Styling for minor/major grid lines ---
    let cellStyleClasses = "flex items-center justify-center transition-colors duration-100 ease-in-out";
    cellStyleClasses += " border-gray-200"; // Base border color

    let borderRightWidth = "border-r";
    let borderBottomWidth = "border-b";

    if (isMajorColBoundary && !isGridEdgeCol) borderRightWidth = "border-r-2 border-r-gray-400";
    if (isMajorRowBoundary && !isGridEdgeRow) borderBottomWidth = "border-b-2 border-b-gray-400";

    if (isGridEdgeCol) borderRightWidth = "border-r-0"; // Parent grid has outer border
    if (isGridEdgeRow) borderBottomWidth = "border-b-0"; // Parent grid has outer border

    cellStyleClasses += ` ${borderRightWidth} ${borderBottomWidth}`;

    // --- Styling for drag preview / DND states ---
    if (draggedItemPreview) {
        const { r: pR_minor, c: pC_minor, w: pW_minor, h: pH_minor, isValid: pIsValid } = draggedItemPreview;
        // Check if this current minor cell (r, c) falls within the dragged item's footprint preview
        if (r >= pR_minor && r < pR_minor + pH_minor && c >= pC_minor && c < pC_minor + pW_minor) {
            cellStyleClasses += pIsValid ? ' bg-green-200 opacity-70' : ' bg-red-200 opacity-70';
        } else if (isOver && canDropItem) { // This cell is the top-left anchor for a valid drop, but not part of current preview footprint
            cellStyleClasses += ' bg-lime-300 bg-opacity-50';
        } else if (isOver && !canDropItem) { // This cell is the top-left anchor for an invalid drop
            cellStyleClasses += ' bg-rose-300 bg-opacity-50';
        }
    } else if (isOver && canDropItem) { // Hovering over a valid top-left drop anchor (no extended preview)
        cellStyleClasses += ' bg-lime-200 bg-opacity-60';
    } else if (isOver && !canDropItem) { // Hovering over an invalid top-left drop anchor
        cellStyleClasses += ' bg-rose-200 bg-opacity-60';
    }

    // Eraser hover effect on the cell itself
    if (isEraserActive && isOver) {
        cellStyleClasses += ' bg-red-100 opacity-80'; // Eraser hover on an empty cell or cell part of an item
    }

    // Kitchen definition styling (example)
    // if (isDefiningKitchen && isOver) {
    //    cellStyleClasses += ' bg-blue-100 opacity-70';
    // }
    // if (kitchenCorner1 && kitchenCorner1.r === r && kitchenCorner1.c === c) {
    //    cellStyleClasses += ' ring-2 ring-blue-500 ring-inset';
    // }

    return (
        <div
            ref={drop}
            className={cellStyleClasses}
            // Width and height are implicitly set by parent's CSS grid
            onClick={clickHandler}
            title={isEraserActive ? `Eraser on cell (${r},${c})` : `Cell (${r},${c})`}
        >
            {/* Optional: Debugging info, useful for high subdivision levels */}
            {/* {gridSubdivision >= 4 && (r % gridSubdivision === 1 && c % gridSubdivision === 1) && (
                <span className="text-xxxs text-gray-400 select-none pointer-events-none">{r},{c}</span>
            )} */}
        </div>
    );
};

export default DroppableGridCell;