// features/venue_management/subcomponents/layout_designer/PlacedItem.jsx
// DEBUG + ROTATION-RESIZE FOCUS
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

// Utilities
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import Icon from '../../../../components/common/Icon';

// Design Guideline Variables
const PLACED_ITEM_CLASSES = {
    base: "group absolute cursor-grab focus-visible:outline-none",
    dragging: "!cursor-grabbing opacity-60 shadow-2xl scale-105",
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
    resizeSize: "w-3 h-3 md:w-2.5 md:h-2.5",
    rotationSize: "w-7 h-7 md:w-6 md:h-6 p-1 md:p-0.5",
    rotationIconSize: "w-4 h-4",
    rotationIconColor: "text-white dark:text-neutral-900",
};

const DEBUG_PREFIX_PLACED_ITEM = "[PlacedItem DEBUG] ";
const ROTATION_RESIZE_DEBUG_PREFIX_PI = "[DEBUG ROTATION-RESIZE] [PlacedItem] ";


const DefaultItemRenderer = ({ item, itemRotation }) => (
    // ... (unchanged) ...
    <div
        className="w-full h-full border border-dashed border-red-500 bg-red-100/50 flex flex-col items-center justify-center text-red-700 text-xxs p-0.5 text-center"
        style={{ transform: `rotate(${itemRotation}deg)`, transformOrigin: 'center center' }}
    >
        <span>Renderer Missing</span>
        <span>Type: {item.itemType?.toString()}</span>
        <span>ID: {item.id?.substring(0, 5)}</span>
    </div>
);

const ResizeHandle = ({ item, direction, ItemTypes, isSelected }) => {
    // console.log(DEBUG_PREFIX_PLACED_ITEM + `ResizeHandle ${direction} for item ${item.id} re-rendering. Item data:`, JSON.parse(JSON.stringify(item)));

    const [{ isDragging: isResizeHandleDragging }, dragResizeRef, previewResizeRef] = useDrag(() => {
        return {
            type: ItemTypes.RESIZE_HANDLE,
            item: () => { // This factory function is called when drag starts
                // CRITICAL LOG: What 'item' does this closure capture for the payload?
                console.log(ROTATION_RESIZE_DEBUG_PREFIX_PI + `ResizeHandle '${direction}' for item '${item.id}' DRAG START.`);
                console.log(ROTATION_RESIZE_DEBUG_PREFIX_PI + `Item data being packaged into payload (originalItem):`, JSON.parse(JSON.stringify(item)));

                const payload = {
                    type: ItemTypes.RESIZE_HANDLE,
                    itemId: item.id,
                    direction: direction,
                    originalItem: { ...item }, // Snapshot of item AT THE MOMENT DRAG STARTS
                };
                // console.log(DEBUG_PREFIX_PLACED_ITEM + `ResizeHandle ${direction} for item ${item.id} DRAG START. Creating payload:`, JSON.parse(JSON.stringify(payload)));
                return payload;
            },
            collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
        };
    }, [item, ItemTypes, direction, isSelected]); // Dependencies updated

    useEffect(() => {
        previewResizeRef(getEmptyImage(), { captureDraggingState: true });
    }, [previewResizeRef]);

    // ... (rest of ResizeHandle styling and JSX is unchanged) ...
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
                ${isResizeHandleDragging ? '!opacity-100 ring-2 ring-white' : (isSelected ? 'opacity-100 group-hover:opacity-100' : 'opacity-0')}
                ${isSelected ? '!opacity-100' : ''}
            `}
            title={`Resize ${direction.toLowerCase()}`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{ zIndex: 25 }}
        />
    );
};

const RotationHandle = ({ item, onUpdateItemProperty, isSelected }) => {
    // ... (unchanged, but adding one log) ...
    const handleRotateClick = useCallback((e) => {
        e.stopPropagation();
        console.log(ROTATION_RESIZE_DEBUG_PREFIX_PI + `RotationHandle CLICK for item ${item.id}. Current item data:`, JSON.parse(JSON.stringify(item)));
        if (item && item.id && onUpdateItemProperty) {
            onUpdateItemProperty(item.id, { rotation: true });
        }
    }, [item, onUpdateItemProperty]);

    return (
        <button
            type="button"
            onClick={handleRotateClick}
            onTouchStart={(e) => { e.stopPropagation(); }}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.rotationSize}
                ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark} ${HANDLE_CLASSES.border}
                flex items-center justify-center cursor-pointer
                -top-3 -right-3 transform translate-x-1/2 -translate-y-1/2
                ${isSelected ? '!opacity-100' : 'opacity-0'}
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
    // console.log(DEBUG_PREFIX_PLACED_ITEM + `Item ${item.id} re-rendering. Selected: ${isSelected}. Eraser: ${isEraserActive}. Item data:`, JSON.parse(JSON.stringify(item)));
    // console.log(ROTATION_RESIZE_DEBUG_PREFIX_PI + `PlacedItem RENDER for item ${item.id}. Data:`, JSON.parse(JSON.stringify(item)));


    const effectiveDimensionsForDragPayload = useMemo(() => {
        const dims = getEffectiveDimensionsUtil(item);
        // console.log(ROTATION_RESIZE_DEBUG_PREFIX_PI + `Item ${item.id} effectiveDimensionsForDragPayload memo re-calculated. Result:`, JSON.parse(JSON.stringify(dims)), "from item:", JSON.parse(JSON.stringify(item)));
        return dims;
    }, [item]); // item is the dependency

    const [{ isDragging: isItemBodyDragging }, dragItemBodyRef] = useDrag(() => {
        return {
            type: item.itemType,
            item: () => {
                // CRITICAL LOG for item move: What 'item' does this closure capture?
                console.log(ROTATION_RESIZE_DEBUG_PREFIX_PI + `PlacedItem BODY DRAG START for item ${item.id}.`);
                console.log(ROTATION_RESIZE_DEBUG_PREFIX_PI + `Item data being packaged for move:`, JSON.parse(JSON.stringify(item)));
                console.log(ROTATION_RESIZE_DEBUG_PREFIX_PI + `Effective Dims for payload:`, JSON.parse(JSON.stringify(effectiveDimensionsForDragPayload)));

                const payload = {
                    ...item, // Captures the current 'item' prop
                    effW_minor: effectiveDimensionsForDragPayload.w,
                    effH_minor: effectiveDimensionsForDragPayload.h,
                };
                // console.log(DEBUG_PREFIX_PLACED_ITEM + `Item ${item.id} BODY DRAG START. Creating payload:`, JSON.parse(JSON.stringify(payload)));
                return payload;
            },
            canDrag: () => !isEraserActive && !item.isFixed && !isSelected,
            collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
        };
    }, [item, ItemTypes, isEraserActive, isSelected, effectiveDimensionsForDragPayload]);

    // ... (rest of PlacedItem is unchanged, including dynamicPositionAndSizeStyle, handleClick, etc.) ...
    const dynamicPositionAndSizeStyle = useMemo(() => {
        if (!item.gridPosition) return { display: 'none' };
        const style = {
            position: 'absolute',
            top: `${(item.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
            left: `${(item.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
            width: `${item.w_minor * minorCellSizeRem}rem`,
            height: `${item.h_minor * minorCellSizeRem}rem`,
            zIndex: isItemBodyDragging ? 200 : (isSelected ? 20 : (isEraserActive && !item.isFixed ? 15 : 10)),
        };
        // console.log(DEBUG_PREFIX_PLACED_ITEM + `Item ${item.id} dynamicPositionAndSizeStyle memo re-calculated:`, style);
        return style;
    }, [item.gridPosition, item.w_minor, item.h_minor, minorCellSizeRem, isItemBodyDragging, isSelected, isEraserActive]);

    const handleClick = useCallback((e) => {
        e.stopPropagation();
        // console.log(DEBUG_PREFIX_PLACED_ITEM + `Item ${item.id} CLICKED. Eraser: ${isEraserActive}, Fixed: ${item.isFixed}`);
        if (isEraserActive && !item.isFixed) {
            onEraseItemById(item.id);
        } else if (onSelectItem) {
            onSelectItem(item.id);
        }
    }, [isEraserActive, item.id, item.isFixed, onEraseItemById, onSelectItem]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        // console.log(DEBUG_PREFIX_PLACED_ITEM + `Item ${item.id} CONTEXT MENU. Fixed: ${item.isFixed}`);
        if (onSelectItem && !item.isFixed) onSelectItem(item.id);
    }, [item.id, item.isFixed, onSelectItem]);

    const itemConfig = ITEM_CONFIGS[item.itemType];
    let SpecificItemRenderer = DefaultItemRenderer;
    const rendererKey = itemConfig?.PlacedComponent;

    switch (rendererKey) {
        case 'TableRenderer': SpecificItemRenderer = TableRenderer; break;
        case 'WallRenderer': SpecificItemRenderer = WallRenderer; break;
        case 'DoorRenderer': SpecificItemRenderer = DoorRenderer; break;
        case 'DecorRenderer': SpecificItemRenderer = DecorRenderer; break;
        case 'CounterRenderer': SpecificItemRenderer = CounterRenderer; break;
        default: SpecificItemRenderer = DefaultItemRenderer;
    }

    const classList = [PLACED_ITEM_CLASSES.base];
    if (item.isFixed) classList.push(PLACED_ITEM_CLASSES.fixed);
    const selectionRingOffsetClasses = "ring-offset-1 ring-offset-white dark:ring-offset-neutral-800";
    if (isItemBodyDragging) {
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
        console.warn(DEBUG_PREFIX_PLACED_ITEM + "PlacedItem: Invalid item data received. Rendering null.", JSON.parse(JSON.stringify(item)));
        return null;
    }

    return (
        <motion.div
            ref={dragItemBodyRef}
            style={dynamicPositionAndSizeStyle}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: isItemBodyDragging ? 1.05 : 1,
            }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={combinedClassName}
            title={isEraserActive && !item.isFixed ? `Tap to erase ${itemConfig?.displayName || item.itemType}` :
                item.isFixed ? `${itemConfig?.displayName || item.itemType} (Fixed)` :
                    `Drag to move, Tap to select ${itemConfig?.displayName || item.itemType}`
            }
            role="button"
            tabIndex={isEraserActive || item.isFixed ? -1 : 0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
        >
            <div className="w-full h-full relative">
                <SpecificItemRenderer
                    item={item}
                    itemRotation={item.rotation || 0}
                    onUpdateItemProperty={onUpdateItemProperty}
                    isSelected={isSelected}
                    zoomLevel={zoomLevel}
                />
            </div>

            {isSelected && !isEraserActive && !item.isFixed && (
                <>
                    {canResize && ['N', 'S', 'E', 'W'].map(dir => (
                        <ResizeHandle key={`${item.id}-rh-${dir}`} item={item} direction={dir} ItemTypes={ItemTypes} isSelected={isSelected} />
                    ))}
                    {canRotate && (
                        <RotationHandle key={`${item.id}-roth`} item={item} onUpdateItemProperty={onUpdateItemProperty} isSelected={isSelected} />
                    )}
                </>
            )}
        </motion.div>
    );
};

export default PlacedItem;