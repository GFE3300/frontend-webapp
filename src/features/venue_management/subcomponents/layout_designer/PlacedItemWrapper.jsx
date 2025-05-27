import React, { useMemo, useCallback, useEffect } from 'react';
import { useDrag, DndProvider } from 'react-dnd'; // DndProvider not strictly needed here if already at top level
import { getEmptyImage } from 'react-dnd-html5-backend'; // For hiding default drag preview for handles
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

// New ResizeHandle sub-component
const ResizeHandle = ({
    item,
    direction,
    ItemTypes, // Passed from PlacedItemWrapper
}) => {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: ItemTypes.RESIZE_HANDLE,
        item: () => ({ // This is the drag payload for a resize handle
            type: ItemTypes.RESIZE_HANDLE,
            itemId: item.id,
            direction: direction,
            originalItem: { // Snapshot of item state at drag start
                id: item.id,
                gridPosition: { ...item.gridPosition },
                w_minor: item.w_minor,
                h_minor: item.h_minor,
                rotation: item.rotation,
                itemType: item.itemType,
                decorType: item.decorType, // For counters
            }
        }),
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    // Hide default browser drag preview for handles
    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const getHandleStyle = () => {
        const handleSize = '8px'; // Size of the handle dot
        const offset = `calc(-${handleSize} / 2)`; // To center the handle on the edge

        // Base style for all handles
        let style = {
            position: 'absolute',
            width: handleSize,
            height: handleSize,
            backgroundColor: 'rgb(59 130 246)', // Tailwind blue-500
            borderRadius: '50%',
            border: '1px solid white',
            cursor: 'grab', // Changed based on direction below
            zIndex: 25, // Above item, below potential modals
            opacity: isDragging ? 0.7 : 1,
        };

        switch (direction) {
            case 'N':
                style = { ...style, top: offset, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' };
                break;
            case 'S':
                style = { ...style, bottom: offset, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' };
                break;
            case 'E':
                style = { ...style, top: '50%', right: offset, transform: 'translateY(-50%)', cursor: 'ew-resize' };
                break;
            case 'W':
                style = { ...style, top: '50%', left: offset, transform: 'translateY(-50%)', cursor: 'ew-resize' };
                break;
            default: break;
        }
        return style;
    };

    return (
        <div
            ref={drag}
            style={getHandleStyle()}
            className="resize-handle-dot" // For any additional global styling
            title={`Resize ${direction}`}
            onClick={(e) => e.stopPropagation()} // Prevent item selection when clicking handle
        />
    );
};


const PlacedItemWrapper = ({
    item,
    isEraserActive,
    eraseDesignerItemById,
    onUpdateItemProperty,
    onSelectItem,
    isSelected,

    CELL_SIZE_REM, // This is MINOR_CELL_SIZE_REM, passed from LayoutDesignerGrid
    ItemTypes,
    ITEM_CONFIGS,
}) => {

    const effectiveDimensionsInMinorUnits = useMemo(() => getEffectiveDimensionsUtil(item), [item]);

    const [{ isDragging: isItemDragging }, dragItemBody] = useDrag(() => ({
        type: item.itemType,
        item: () => ({
            id: item.id,
            itemType: item.itemType,
            w_minor: item.w_minor,
            h_minor: item.h_minor,
            rotation: item.rotation,
            shape: item.shape,
            effW_minor: effectiveDimensionsInMinorUnits.w,
            effH_minor: effectiveDimensionsInMinorUnits.h,
        }),
        canDrag: () => !isEraserActive && !item.isFixed,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [item, isEraserActive, ItemTypes, effectiveDimensionsInMinorUnits]);

    const style = {
        position: 'absolute',
        top: `${(item.gridPosition.rowStart - 1) * CELL_SIZE_REM}rem`,
        left: `${(item.gridPosition.colStart - 1) * CELL_SIZE_REM}rem`,
        width: `${effectiveDimensionsInMinorUnits.w * CELL_SIZE_REM}rem`,
        height: `${effectiveDimensionsInMinorUnits.h * CELL_SIZE_REM}rem`,
        opacity: isItemDragging ? 0.5 : 1,
        zIndex: isItemDragging ? 100 : (isSelected ? 15 : (isEraserActive ? 20 : 10)),
        transformOrigin: 'center center',
        cursor: isEraserActive ? 'pointer' : (item.isFixed ? 'default' : (isItemDragging ? 'grabbing' : 'grab')),
    };

    const handleWrapperClick = useCallback((e) => {
        e.stopPropagation();
        if (isEraserActive && !item.isFixed) {
            eraseDesignerItemById(item.id);
        } else if (onSelectItem) {
            onSelectItem(item.id);
        }
    }, [isEraserActive, item.id, item.isFixed, eraseDesignerItemById, onSelectItem]);

    let SpecificItemRenderer = DefaultItemRenderer;
    const itemConfig = ITEM_CONFIGS[item.itemType];
    const rendererKey = itemConfig?.PlacedComponent;

    switch (rendererKey) {
        case 'PlacedTableItem': SpecificItemRenderer = PlacedTableItem; break;
        case 'PlacedWallItem': SpecificItemRenderer = PlacedWallItem; break;
        case 'PlacedDoorItem': SpecificItemRenderer = PlacedDoorItem; break;
        case 'PlacedDecorItem': SpecificItemRenderer = PlacedDecorItem; break;
    }

    let wrapperClassName = "group relative"; // Added 'relative' for handle positioning
    if (isSelected && !isEraserActive) {
        wrapperClassName += " ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-100 shadow-lg";
    } else if (isEraserActive && !item.isFixed) {
        wrapperClassName += " hover:ring-2 hover:ring-rose-400 hover:ring-offset-1 hover:ring-offset-gray-100";
    }

    // Determine if item is resizable based on ITEM_CONFIGS
    const canResize = typeof itemConfig?.isResizable === 'function' ? itemConfig.isResizable(item) : itemConfig?.isResizable === true;

    if (!item || !item.gridPosition || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        console.warn("PlacedItemWrapper: Invalid item data. Required: id, gridPosition, w_minor, h_minor. Received:", item);
        return null;
    }

    return (
        <motion.div
            ref={dragItemBody} // Apply drag ref to the motion div for moving the item body
            style={style}
            onClick={handleWrapperClick}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={wrapperClassName}
            title={
                isEraserActive && !item.isFixed ? `Click to erase this ${itemConfig?.displayName || item.itemType}` :
                    item.isFixed ? `${itemConfig?.displayName || item.itemType} (Fixed)` :
                        `Drag to move, Click to select ${itemConfig?.displayName || item.itemType}`
            }
        >
            <SpecificItemRenderer
                item={item}
                onUpdateItemProperty={onUpdateItemProperty}
                isSelected={isSelected}
            />
            {/* Render Resize Handles */}
            {isSelected && !isEraserActive && !item.isFixed && canResize && (
                <>
                    {['N', 'S', 'E', 'W'].map(dir => (
                        <ResizeHandle
                            key={`${item.id}-handle-${dir}`}
                            item={item}
                            direction={dir}
                            ItemTypes={ItemTypes}
                            minorCellSizeRem={CELL_SIZE_REM} // Pass minor cell size for context if needed
                        />
                    ))}
                </>
            )}
        </motion.div>
    );
};

export default PlacedItemWrapper;