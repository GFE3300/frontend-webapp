import React from 'react';
import { useDrop } from 'react-dnd';
import { getEffectiveDimensions, getToolConfigByType } from '../../utils/layoutUtils'; // Import helpers

// ItemTypes is passed as a prop from LayoutDesigner

const DroppableGridCell = ({
    r, // row index (1-based)
    c, // column index (1-based)
    isEraserActive,
    eraseDesignerItem,         // (itemId) => void (used if item is directly clicked with eraser) or (r, c) if cell clicked
    addItem,                   // (toolItem, r, c, itemTypeFromTool) => void
    moveItem,                  // (itemId, toRow, toCol) => void (renamed from moveTable for clarity)
    canPlaceItemAtCoords,      // (row, col, itemW, itemH, itemToExcludeId) => boolean
    // Props for drag preview
    draggedItemPreview,        // { r, c, w, h, isValid } | null
    updateDraggedItemPreview,  // (previewData | null) => void
    ItemTypes,                 // Prop for ItemTypes
}) => {

    const [{ isOver, canDropItem, draggedItemTypeFromMonitor }, drop] = useDrop(() => ({
        accept: [ItemTypes.TABLE_TOOL, ItemTypes.PLACED_TABLE],
        drop: (item, monitor) => {
            const didDrop = monitor.didDrop();
            if (didDrop) return; // Prevents multiple drops on nested targets

            const type = monitor.getItemType();
            if (type === ItemTypes.TABLE_TOOL) {
                // item here is from DraggableGenericTool: { type (tool.type), w, h, size, itemType (TABLE_TOOL) }
                addItem(item, r, c, ItemTypes.TABLE_TOOL);
            } else if (type === ItemTypes.PLACED_TABLE) {
                // item here is from PlacedItem: { id, itemType (PLACED_TABLE), size, rotation }
                moveItem(item.id, r, c);
            }
            updateDraggedItemPreview(null); // Clear preview on drop
        },
        hover: (item, monitor) => {
            if (!monitor.isOver({ shallow: true })) return; // Only hover over this specific cell

            let previewW, previewH;
            let itemId = null;

            if (item.itemType === ItemTypes.TABLE_TOOL) {
                // New item from tool
                previewW = item.w;
                previewH = item.h;
            } else if (item.itemType === ItemTypes.PLACED_TABLE) {
                // Existing item being moved
                const tempItemForCalc = { size: item.size, rotation: item.rotation, itemType: ItemTypes.PLACED_TABLE };
                const { w, h } = getEffectiveDimensions(tempItemForCalc);
                previewW = w;
                previewH = h;
                itemId = item.id;
            } else {
                updateDraggedItemPreview(null);
                return;
            }

            const isValid = canPlaceItemAtCoords(r, c, previewW, previewH, itemId);
            updateDraggedItemPreview({ r, c, w: previewW, h: previewH, isValid });
        },
        canDrop: (item, monitor) => {
            // canDrop is based on the top-left corner (r,c) of the potential drop
            let itemW, itemH, itemId = null;
            if (item.itemType === ItemTypes.TABLE_TOOL) {
                itemW = item.w;
                itemH = item.h;
            } else if (item.itemType === ItemTypes.PLACED_TABLE) {
                const tempItemForCalc = { size: item.size, rotation: item.rotation, itemType: ItemTypes.PLACED_TABLE };
                const { w, h } = getEffectiveDimensions(tempItemForCalc);
                itemW = w;
                itemH = h;
                itemId = item.id;
            } else {
                return false;
            }
            return canPlaceItemAtCoords(r, c, itemW, itemH, itemId);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver({ shallow: true }),
            canDropItem: !!monitor.canDrop(),
            draggedItemTypeFromMonitor: monitor.getItemType(),
        }),
    }), [r, c, addItem, moveItem, canPlaceItemAtCoords, updateDraggedItemPreview, ItemTypes]);

    const clickHandler = () => {
        if (isEraserActive) {
            // eraseDesignerItem expects (r,c) if erasing by cell click,
            // or (id) if erasing by clicking a PlacedItem (handled in PlacedItem itself)
            eraseDesignerItem(r, c);
        }
    };

    let cellClasses = "w-full h-full border border-gray-200 transition-colors duration-100";

    if (draggedItemPreview) {
        const { r: pR, c: pC, w: pW, h: pH, isValid: pIsValid } = draggedItemPreview;
        if (r >= pR && r < pR + pH && c >= pC && c < pC + pW) {
            cellClasses += pIsValid ? ' bg-green-200 opacity-70' : ' bg-red-200 opacity-70';
        } else if (isOver && canDropItem) {
            // This specific cell is a valid drop target for the top-left corner of the item
            cellClasses += ' bg-lime-300 bg-opacity-50';
        } else if (isOver && !canDropItem) {
            cellClasses += ' bg-rose-300 bg-opacity-50';
        }
    } else if (isOver && canDropItem) {
        cellClasses += ' bg-lime-200 bg-opacity-60';
    } else if (isOver && !canDropItem) {
        cellClasses += ' bg-rose-200 bg-opacity-60';
    }


    return (
        <div
            ref={drop}
            className={cellClasses}
            style={{ gridRowStart: r, gridColumnStart: c }} // CSS grid uses 1-based indexing from parent
            onClick={clickHandler}
            title={isEraserActive ? `Click to erase item in this cell (${r},${c})` : `Cell (${r},${c})`}
        />
    );
};

export default DroppableGridCell;