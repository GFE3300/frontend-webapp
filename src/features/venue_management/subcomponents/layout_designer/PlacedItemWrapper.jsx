// features/venue_management/subcomponents/layout_designer/PlacedItemWrapper.jsx
import React, { useMemo, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';

// Import specific item renderers
import PlacedTableItem from './item_renderers/PlacedTableItem';
import PlacedWallItem from './item_renderers/PlacedWallItem';
import PlacedDoorItem from './item_renderers/PlacedDoorItem';
import PlacedDecorItem from './item_renderers/PlacedDecorItem';

import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
// ITEM_CONFIGS and ItemTypes will be passed as props

// Fallback component if no specific renderer is found
const DefaultItemRenderer = ({ item }) => (
    <div className="w-full h-full border border-dashed border-red-500 bg-red-100 flex flex-col items-center justify-center text-red-700 text-xxs p-0.5 text-center">
        <span>Renderer Missing</span>
        <span>Type: {item.itemType?.toString()}</span>
        <span>ID: {item.id?.substring(0, 5)}</span>
    </div>
);

const PlacedItemWrapper = ({
    item, // The full design item object: { id, itemType, gridPosition, w_minor, h_minor, rotation, shape, ...otherProps }
    isEraserActive,
    eraseDesignerItemById,  // (itemId) => void
    onUpdateItemProperty,   // Generic: (itemId, { property: value }) => boolean
    onSelectItem,           // (itemId) => void, to set selected item for sidebar
    isSelected,             // boolean: true if this item is currently selected

    CELL_SIZE_REM,          // This is MINOR_CELL_SIZE_REM, passed from LayoutDesignerGrid
    ItemTypes,              // Constant object { PLACED_TABLE, PLACED_WALL, TABLE_TOOL etc. }
    ITEM_CONFIGS,           // Main configuration for all PlacedItemTypes
}) => {

    // Calculate effective dimensions in minor cell units.
    const effectiveDimensionsInMinorUnits = useMemo(() => getEffectiveDimensionsUtil(item), [item]);

    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: item.itemType, // Use the item's specific placed type (e.g., PLACED_TABLE, PLACED_WALL)
        item: () => ({ // This is the drag payload for an existing placed item
            id: item.id,
            itemType: item.itemType,
            w_minor: item.w_minor,         // Base width in minor cells (before rotation)
            h_minor: item.h_minor,         // Base height in minor cells (before rotation)
            rotation: item.rotation,
            shape: item.shape,             // Pass shape (formerly size_identifier) for preview consistency
            // Effective dimensions are useful for DroppableGridCell's hover/canDrop logic
            effW_minor: effectiveDimensionsInMinorUnits.w,
            effH_minor: effectiveDimensionsInMinorUnits.h,
        }),
        canDrag: () => !isEraserActive && !item.isFixed, // Cannot drag if eraser is active or item is fixed
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [item, isEraserActive, ItemTypes, effectiveDimensionsInMinorUnits]);


    if (!item || !item.gridPosition || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        console.warn("PlacedItemWrapper: Invalid item data. Required: id, gridPosition, w_minor, h_minor. Received:", item);
        return null; // Or some error placeholder
    }

    const style = {
        position: 'absolute',
        top: `${(item.gridPosition.rowStart - 1) * CELL_SIZE_REM}rem`,
        left: `${(item.gridPosition.colStart - 1) * CELL_SIZE_REM}rem`,
        width: `${effectiveDimensionsInMinorUnits.w * CELL_SIZE_REM}rem`,
        height: `${effectiveDimensionsInMinorUnits.h * CELL_SIZE_REM}rem`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : (isSelected ? 15 : (isEraserActive ? 20 : 10)), // Higher z-index if selected
        transformOrigin: 'center center',
        cursor: isEraserActive ? 'pointer' : (item.isFixed ? 'default' : (isDragging ? 'grabbing' : 'grab')),
    };

    const handleWrapperClick = useCallback((e) => {
        e.stopPropagation(); // Prevent grid cell click from firing underneath
        if (isEraserActive && !item.isFixed) { // Cannot erase fixed items with eraser tool
            eraseDesignerItemById(item.id);
        } else if (onSelectItem) {
            onSelectItem(item.id);
        }
    }, [isEraserActive, item.id, item.isFixed, eraseDesignerItemById, onSelectItem]);

    // --- Dynamic Renderer Dispatch Logic ---
    let SpecificItemRenderer = DefaultItemRenderer; // Fallback
    const rendererKey = ITEM_CONFIGS[item.itemType]?.PlacedComponent;

    switch (rendererKey) {
        case 'PlacedTableItem': SpecificItemRenderer = PlacedTableItem; break;
        case 'PlacedWallItem': SpecificItemRenderer = PlacedWallItem; break;
        case 'PlacedDoorItem': SpecificItemRenderer = PlacedDoorItem; break;
        case 'PlacedDecorItem': SpecificItemRenderer = PlacedDecorItem; break;
        // No default needed as DefaultItemRenderer is assigned initially
    }

    let wrapperClassName = "group"; // For group-hover effects in children
    if (isSelected && !isEraserActive) {
        wrapperClassName += " ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-100 shadow-lg";
    } else if (isEraserActive && !item.isFixed) {
        wrapperClassName += " hover:ring-2 hover:ring-rose-400 hover:ring-offset-1 hover:ring-offset-gray-100";
    }


    return (
        <motion.div
            ref={drag} // Apply drag ref to the motion div
            style={style}
            onClick={handleWrapperClick}
            layout // Animate layout changes (position, size due to rotation)
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={wrapperClassName}
            title={
                isEraserActive && !item.isFixed ? `Click to erase this ${ITEM_CONFIGS[item.itemType]?.displayName || item.itemType}` :
                    item.isFixed ? `${ITEM_CONFIGS[item.itemType]?.displayName || item.itemType} (Fixed)` :
                        `Drag to move, Click to select ${ITEM_CONFIGS[item.itemType]?.displayName || item.itemType}`
            }
        >
            {/* dragPreview is used by react-dnd to show a custom drag preview if needed.
                For now, the default browser preview (semi-transparent version of the item) is fine.
                If you use dragPreview( <YourCustomPreviewComponent /> ), then the drag ref should be on a different element.
                Typically, the drag ref itself is sufficient for the default preview.
            */}
            <SpecificItemRenderer
                item={item}
                // Pass down relevant interaction handlers if the specific renderer needs them.
                // Most interactions (select, erase) are handled by this wrapper.
                // Property updates specific to the item type (e.g., table number edit) are managed within the renderer
                // by calling onUpdateItemProperty with the correct payload.
                onUpdateItemProperty={onUpdateItemProperty}
                // isSelected might be useful for internal styling of the renderer
                isSelected={isSelected}
            />
        </motion.div>
    );
};

export default PlacedItemWrapper;