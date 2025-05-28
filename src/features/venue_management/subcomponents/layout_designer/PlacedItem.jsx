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
    base: "group absolute cursor-grab focus-visible:outline-none",
    dragging: "!cursor-grabbing opacity-60 shadow-2xl",
    fixed: "!cursor-default",
    selectedLight: "ring-2 ring-rose-500 shadow-lg",
    selectedDark: "dark:ring-rose-400",
    eraserHoverLight: "hover:ring-2 hover:ring-red-500/70",
    eraserHoverDark: "dark:hover:ring-red-400/70",
};

const HANDLE_CLASSES = {
    base: "absolute rounded-full shadow-md transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100",
    bgLight: "bg-rose-500",
    bgDark: "dark:bg-rose-400",
    border: "border-2 border-white dark:border-neutral-800",
    resizeSize: "w-2.5 h-2.5",
    rotationSize: "w-6 h-6 p-0.5",
    rotationIconSize: "w-4 h-4",
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
    const [{ isDragging: isResizeDragging }, dragResizeRef, previewResizeRef] = useDrag(() => ({
        type: ItemTypes.RESIZE_HANDLE,
        item: () => ({
            type: ItemTypes.RESIZE_HANDLE,
            itemId: item.id,
            direction: direction,
            originalItem: { ...item },
        }),
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));

    useEffect(() => { previewResizeRef(getEmptyImage(), { captureDraggingState: true }); }, [previewResizeRef]);

    const handleSize = HANDLE_CLASSES.resizeSize;
    const offset = `-translate-x-1/2 -translate-y-1/2`;

    let positionClasses = "";
    let cursorClass = "";

    switch (direction) {
        case 'N': positionClasses = `top-0 left-1/2 ${offset}`; cursorClass = 'cursor-ns-resize'; break;
        case 'S': positionClasses = `bottom-0 left-1/2 ${offset} translate-y-full`; cursorClass = 'cursor-ns-resize'; break;
        case 'E': positionClasses = `top-1/2 right-0 ${offset} translate-x-full`; cursorClass = 'cursor-ew-resize'; break;
        case 'W': positionClasses = `top-1/2 left-0 ${offset}`; cursorClass = 'cursor-ew-resize'; break;
        default: break;
    }

    return (
        <div
            ref={dragResizeRef}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark}
                ${HANDLE_CLASSES.border} ${handleSize} ${positionClasses} ${cursorClass}
                ${isResizeDragging ? 'opacity-70' : ''}
            `}
            title={`Resize ${direction}`}
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 25 }}
        />
    );
};

const RotationHandle = ({ item, onUpdateItemProperty }) => {
    const handleRotateClick = useCallback((e) => {
        e.stopPropagation();
        if (item && item.id && onUpdateItemProperty) {
            onUpdateItemProperty(item.id, { rotation: true });
        }
    }, [item, onUpdateItemProperty]);

    return (
        <button
            type="button"
            onClick={handleRotateClick}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.rotationSize}
                ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark} ${HANDLE_CLASSES.border}
                flex items-center justify-center cursor-pointer
                -top-2 -right-2 transform translate-x-1/2 -translate-y-1/2 
            `}
            style={{ zIndex: 26 }}
            title="Rotate Item (90°)"
            aria-label="Rotate Item by 90 degrees"
        >
            <Icon name="rotate_right" className={`${HANDLE_CLASSES.rotationIconSize} ${HANDLE_CLASSES.rotationIconColor}`} style={{ fontSize: '1rem' }} />
        </button>
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
    zoomLevel,
}) => {

    const effectiveDimensions = useMemo(() => getEffectiveDimensionsUtil(item), [item]);

    const [{ isDragging: isItemDragging }, dragItemBodyRef] = useDrag(() => ({
        type: item.itemType,
        item: () => ({ ...item, effW_minor: effectiveDimensions.w, effH_minor: effectiveDimensions.h }),
        canDrag: () => !isEraserActive && !item.isFixed,
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [item, isEraserActive, ItemTypes, effectiveDimensions]);

    // This style object now only contains layout-related CSS properties (top, left, width, height, zIndex).
    // Transform properties (rotate, scale) will be handled by Framer Motion's animate prop.
    const dynamicPositionAndSizeStyle = useMemo(() => {
        return {
            position: 'absolute',
            top: `${(item.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
            left: `${(item.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
            width: `${item.w_minor * minorCellSizeRem}rem`,
            height: `${item.h_minor * minorCellSizeRem}rem`,
            zIndex: isItemDragging ? 200 : (isSelected ? 15 : (isEraserActive && !item.isFixed ? 20 : 10)),
            // transformOrigin: 'center center', // Framer Motion typically defaults to center for rotate with explicit W/H.
            // Can be added if specific origin is needed and not handled by Framer.
        };
    }, [item.gridPosition, item.w_minor, item.h_minor, minorCellSizeRem, isItemDragging, isSelected, isEraserActive]);

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
        if (onSelectItem) onSelectItem(item.id);
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

    const classList = [PLACED_ITEM_CLASSES.base];
    if (item.isFixed) {
        classList.push(PLACED_ITEM_CLASSES.fixed);
    }

    const selectionRingOffsetClasses = "ring-offset-1 ring-offset-white dark:ring-offset-neutral-800";

    if (isItemDragging) {
        classList.push(PLACED_ITEM_CLASSES.dragging);
    } else if (isSelected && !isEraserActive) {
        classList.push(PLACED_ITEM_CLASSES.selectedLight, PLACED_ITEM_CLASSES.selectedDark, selectionRingOffsetClasses);
    } else if (isEraserActive && !item.isFixed) {
        classList.push(PLACED_ITEM_CLASSES.eraserHoverLight, PLACED_ITEM_CLASSES.eraserHoverDark, selectionRingOffsetClasses);
    }

    const combinedClassName = classList.join(' ');

    const canResize = typeof itemConfig?.isResizable === 'function' ? itemConfig.isResizable(item) : itemConfig?.isResizable === true;
    const canRotate = itemConfig?.isRotatable === true;

    if (!item || !item.gridPosition || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        console.warn("PlacedItem: Invalid item data received. Rendering null.", item);
        return null;
    }

    // Simplified log to check rotation value passed to Framer Motion
    // console.log(`PlacedItem ${item.id} rendering. Rotation for animate: ${item.rotation || 0}`);

    return (
        <motion.div
            ref={dragItemBodyRef}
            style={dynamicPositionAndSizeStyle} // Apply position and size styles directly
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            layout // Enable Framer Motion layout animations for position and size
            initial={{
                opacity: 0,
                scale: 0.9, // Initial scale
            }}
            animate={{ // Target state for animation
                opacity: 1,
                scale: isItemDragging ? 1.05 : 1, // Animate scale based on dragging state
                rotate: item.rotation || 0,      // Animate rotation based on item.rotation
            }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }} // Default transition for all animated props
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
                        <ResizeHandle key={`${item.id}-rh-${dir}`} item={item} direction={dir} ItemTypes={ItemTypes} />
                    ))}
                    {canRotate && (
                        <RotationHandle key={`${item.id}-roth`} item={item} onUpdateItemProperty={onUpdateItemProperty} />
                    )}
                </>
            )}
        </motion.div>
    );
};

export default PlacedItem;