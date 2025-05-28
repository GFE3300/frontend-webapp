// features/venue_management/subcomponents/layout_designer/PlacedItem.jsx
import React, { useMemo, useCallback, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';

// Item Renderers
import TableRenderer from './item_renderers/TableRenderer';
import WallRenderer from './item_renderers/WallRenderer';
import DoorRenderer from './item_renderers/DoorRenderer';
import DecorRenderer from './item_renderers/DecorRenderer';
import CounterRenderer from './item_renderers/CounterRenderer';

import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import Icon from '../../../../components/common/Icon';

// --- Design Guideline Variables ---
const PLACED_ITEM_CLASSES = {
    base: "group absolute cursor-grab focus-visible:outline-none transform-gpu", // transform-gpu for better perf on transforms
    dragging: "!cursor-grabbing opacity-60 shadow-2xl scale-105",
    fixed: "!cursor-default",
    selectedLight: "ring-2 ring-rose-500 shadow-lg",
    selectedDark: "dark:ring-rose-400",
    // Ring offset classes will be dynamically generated based on props
    eraserHoverLight: "hover:ring-2 hover:ring-red-500/70",
    eraserHoverDark: "dark:hover:ring-red-400/70",
};

const HANDLE_CLASSES = {
    base: "absolute rounded-full shadow-md transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100",
    bgLight: "bg-rose-500",
    bgDark: "dark:bg-rose-400",
    border: "border-2 border-white dark:border-neutral-800",
    resizeSize: "w-2.5 h-2.5", // 10px
    rotationSize: "w-6 h-6 p-0.5", // 24px container for a 16px icon
    rotationIconSize: "w-4 h-4", // 16px icon
    rotationIconColor: "text-white dark:text-neutral-900",
};
// --- End Design Guideline Variables ---

const DefaultItemRenderer = ({ item }) => (
    <div className="w-full h-full border border-dashed border-red-500 bg-red-100/50 flex flex-col items-center justify-center text-red-700 text-xxs p-0.5 text-center">
        <span>Renderer Missing</span>
        <span>Type: {item.itemType?.toString()}</span>
        <span>ID: {item.id?.substring(0, 5)}</span>
    </div>
);

const ResizeHandle = ({ item, direction, ItemTypes }) => {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: ItemTypes.RESIZE_HANDLE,
        item: () => ({
            type: ItemTypes.RESIZE_HANDLE,
            itemId: item.id,
            direction: direction,
            originalItem: { ...item },
        }),
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));

    useEffect(() => { preview(getEmptyImage(), { captureDraggingState: true }); }, [preview]);

    const handleSize = HANDLE_CLASSES.resizeSize; // e.g., "w-2.5 h-2.5"
    const offset = `-translate-x-1/2 -translate-y-1/2`; // Centering trick

    let positionClasses = "";
    let cursorClass = "";

    switch (direction) {
        case 'N': positionClasses = `top-0 left-1/2 ${offset}`; cursorClass = 'cursor-ns-resize'; break;
        case 'S': positionClasses = `bottom-0 left-1/2 ${offset} translate-y-full`; cursorClass = 'cursor-ns-resize'; break; // Adjusted for bottom
        case 'E': positionClasses = `top-1/2 right-0 ${offset} translate-x-full`; cursorClass = 'cursor-ew-resize'; break; // Adjusted for right
        case 'W': positionClasses = `top-1/2 left-0 ${offset}`; cursorClass = 'cursor-ew-resize'; break;
        default: break;
    }

    return (
        <div
            ref={drag}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark} 
                ${HANDLE_CLASSES.border} ${handleSize} ${positionClasses} ${cursorClass}
                ${isDragging ? 'opacity-70' : ''}
            `}
            title={`Resize ${direction}`}
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 25 }}
        />
    );
};

const RotationHandle = ({ item, ItemTypes }) => {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: ItemTypes.ROTATION_HANDLE,
        item: () => ({
            type: ItemTypes.ROTATION_HANDLE,
            itemId: item.id,
            originalItem: { ...item },
        }),
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));

    useEffect(() => { preview(getEmptyImage(), { captureDraggingState: true }); }, [preview]);

    return (
        <div
            ref={drag}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.rotationSize} 
                ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark} ${HANDLE_CLASSES.border}
                flex items-center justify-center cursor-alias
                -top-2 -right-2 transform translate-x-1/2 -translate-y-1/2 
                ${isDragging ? 'opacity-70' : ''} 
            `} // Positioned off-corner
            style={{ zIndex: 26 }}
            title="Rotate Item"
            onClick={(e) => e.stopPropagation()}
        >
            <Icon name="rotate_right" className={`${HANDLE_CLASSES.rotationIconSize} ${HANDLE_CLASSES.rotationIconColor}`} style={{ fontSize: '1rem' }} />
        </div>
    );
};

const PlacedItem = ({
    item,
    isEraserActive,
    onEraseItemById,
    onUpdateItemProperty,
    onSelectItem,
    isSelected,
    minorCellSizeRem,
    ItemTypes,
    ITEM_CONFIGS,
    zoomLevel, // Passed for potential internal use by renderers or handles
    canvasBgLightClass = "ring-offset-neutral-50", // Default light canvas bg for ring offset
    canvasBgDarkClass = "dark:ring-offset-neutral-900", // Default dark canvas bg for ring offset
}) => {

    const effectiveDimensions = useMemo(() => getEffectiveDimensionsUtil(item), [item]);

    const [{ isDragging }, dragItemBodyRef] = useDrag(() => ({
        type: item.itemType,
        item: () => ({ ...item, effW_minor: effectiveDimensions.w, effH_minor: effectiveDimensions.h }),
        canDrag: () => !isEraserActive && !item.isFixed,
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [item, isEraserActive, ItemTypes, effectiveDimensions]);

    const dynamicStyle = {
        position: 'absolute',
        top: `${(item.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
        left: `${(item.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
        width: `${item.w_minor * minorCellSizeRem}rem`,
        height: `${item.h_minor * minorCellSizeRem}rem`,
        zIndex: isDragging ? 200 : (isSelected ? 15 : (isEraserActive && !item.isFixed ? 20 : 10)),
        transform: `rotate(${item.rotation || 0}deg)`,
        transformOrigin: 'center center',
    };

    const handleClick = useCallback((e) => {
        e.stopPropagation();
        if (isEraserActive && !item.isFixed) {
            onEraseItemById(item.id);
        } else if (onSelectItem) {
            onSelectItem(item.id);
        }
    }, [isEraserActive, item.id, item.isFixed, onEraseItemById, onSelectItem]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement custom context menu logic
        // This would typically involve setting state to show a context menu
        // and passing item.id and mouse coordinates to the parent (LayoutEditor).
        console.log("Context menu for item:", item.id);
        if (onSelectItem) onSelectItem(item.id); // Select item on right click as well
    }, [item.id, onSelectItem]);


    const itemConfig = ITEM_CONFIGS[item.itemType];
    let SpecificItemRenderer = DefaultItemRenderer;
    const rendererKey = itemConfig?.PlacedComponent;

    switch (rendererKey) {
        case 'TableRenderer': SpecificItemRenderer = TableRenderer; break;
        case 'WallRenderer': SpecificItemRenderer = WallRenderer; break;
        case 'DoorRenderer': SpecificItemRenderer = DoorRenderer; break;
        case 'DecorRenderer': SpecificItemRenderer = DecorRenderer; break;
        case 'CounterRenderer': SpecificItemRenderer = CounterRenderer; break;
    }

    let combinedClassName = `${PLACED_ITEM_CLASSES.base} ${item.isFixed ? PLACED_ITEM_CLASSES.fixed : ''}`;
    if (isDragging) {
        combinedClassName += ` ${PLACED_ITEM_CLASSES.dragging}`;
    } else if (isSelected && !isEraserActive) {
        combinedClassName += ` ${PLACED_ITEM_CLASSES.selectedLight} ${PLACED_ITEM_CLASSES.selectedDark} ${canvasBgLightClass} ${canvasBgDarkClass} ring-offset-1`;
    } else if (isEraserActive && !item.isFixed) {
        combinedClassName += ` ${PLACED_ITEM_CLASSES.eraserHoverLight} ${PLACED_ITEM_CLASSES.eraserHoverDark} ${canvasBgLightClass} ${canvasBgDarkClass} ring-offset-1`;
    }

    const canResize = typeof itemConfig?.isResizable === 'function' ? itemConfig.isResizable(item) : itemConfig?.isResizable === true;
    const canRotate = itemConfig?.isRotatable === true;

    if (!item || !item.gridPosition || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        console.warn("PlacedItem: Invalid item data.", item);
        return null;
    }

    return (
        <motion.div
            ref={dragItemBodyRef}
            style={dynamicStyle}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            layout // Animates position changes smoothly
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={combinedClassName}
            title={isEraserActive && !item.isFixed ? `Click to erase ${itemConfig?.displayName || item.itemType}` :
                item.isFixed ? `${itemConfig?.displayName || item.itemType} (Fixed)` :
                    `Drag to move, Click to select ${itemConfig?.displayName || item.itemType}`
            }
            role="button"
            tabIndex={isEraserActive || item.isFixed ? -1 : 0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
        >
            <SpecificItemRenderer
                item={item}
                onUpdateItemProperty={onUpdateItemProperty}
                isSelected={isSelected}
                zoomLevel={zoomLevel}
            />
            {isSelected && !isEraserActive && !item.isFixed && (
                <>
                    {canResize && ['N', 'S', 'E', 'W'].map(dir => (
                        <ResizeHandle key={`${item.id}-rh-${dir}`} item={item} direction={dir} ItemTypes={ItemTypes} zoomLevel={zoomLevel} />
                    ))}
                    {canRotate && (
                        <RotationHandle key={`${item.id}-roth`} item={item} ItemTypes={ItemTypes} zoomLevel={zoomLevel} />
                    )}
                </>
            )}
        </motion.div>
    );
};

export default PlacedItem;