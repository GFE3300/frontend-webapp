import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import { useDrag, useDrop } from 'react-dnd';
// MODIFICATION: Import the centralized script lines
import { scriptLines_ProductsTable as scriptLines } from '../utils/script_lines.js';

const ItemTypes = {
    COLUMN: 'column',
};

const DraggableColumnItem = ({
    id,
    text,
    index,
    isVisible,
    isFixed,
    onToggleVisibility,
    onMoveColumn,
}) => {
    const itemRef = useRef(null);
    const dragHandleRef = useRef(null);

    const [{ isDragging, handlerId }, drag, preview] = useDrag({
        type: ItemTypes.COLUMN,
        item: () => ({ id, index, isFixed }),
        canDrag: !isFixed,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
            handlerId: monitor.getHandlerId(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemTypes.COLUMN,
        hover(draggedItem, monitor) {
            if (!itemRef.current || draggedItem.isFixed || isFixed) {
                return;
            }
            const dragIndex = draggedItem.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return;
            }
            const hoverBoundingRect = itemRef.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            onMoveColumn(dragIndex, hoverIndex);
            draggedItem.index = hoverIndex;
        },
    });

    drag(dragHandleRef);
    preview(drop(itemRef));

    const baseClasses = "flex items-center justify-between w-full px-2 py-1 text-sm rounded-full transition-all duration-150 ease-in-out border font-montserrat";
    const interactiveClasses = !isFixed ? "hover:bg-neutral-100 dark:hover:bg-neutral-700/60 hover:shadow-md" : "cursor-default bg-neutral-50 dark:bg-neutral-700/50";
    const sourceItemWhileDraggingStyle = isDragging ? "opacity-30 border-dashed bg-neutral-100 dark:bg-neutral-700/20 border-neutral-400 dark:border-neutral-500 scale-95" : "bg-white dark:bg-neutral-700/30 border-neutral-200 dark:border-neutral-600/50 shadow-sm";

    const layoutTransitionConfig = {
        type: "spring",
        stiffness: 500,
        damping: 35,
        mass: 0.5
    };

    return (
        <motion.li
            ref={itemRef}
            data-handler-id={handlerId}
            key={id}
            layout
            transition={layoutTransitionConfig}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5, transition: { duration: 0.15 } }}
            className={`${baseClasses} ${interactiveClasses} ${sourceItemWhileDraggingStyle}`}
        >
            <div className="flex items-center flex-grow min-w-0">
                {!isFixed ? (
                    <div
                        ref={dragHandleRef}
                        className={`mr-2 p-1 w-7 h-7 -ml-0.5 text-neutral-400 dark:text-neutral-500 rounded-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'} hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors`}
                        title={scriptLines.draggableColumnItem.tooltips.dragReorder}
                    >
                        <Icon name="drag_indicator" className="w-5 h-5" style={{ fontSize: '1.25rem' }} />
                    </div>
                ) : (
                    <div className="mr-2 p-1 w-7 h-7 -ml-0.5 text-neutral-500 dark:text-neutral-400" title={scriptLines.draggableColumnItem.tooltips.fixedColumn}>
                        <Icon name="lock" className="w-5 h-5" style={{ fontSize: '1.25rem' }} />
                    </div>
                )}
                <span className="flex-grow text-neutral-700 dark:text-neutral-100 select-none truncate" title={text}>
                    {text}
                </span>
            </div>

            {!isFixed && (
                <button
                    onClick={() => onToggleVisibility(id)}
                    className="ml-2 p-1.5 w-8 h-8 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-rose-500 dark:focus-visible:ring-offset-neutral-800 transition-colors"
                    title={isVisible ? scriptLines.draggableColumnItem.tooltips.hideColumn : scriptLines.draggableColumnItem.tooltips.showColumn}
                    aria-pressed={isVisible}
                    aria-label={isVisible ? scriptLines.draggableColumnItem.aria.hide.replace('{columnName}', text) : scriptLines.draggableColumnItem.aria.show.replace('{columnName}', text)}
                >
                    <Icon
                        name={isVisible ? "visibility" : "visibility_off"}
                        className={`w-5 h-5 transition-colors ${isVisible ? "text-rose-500 dark:text-rose-400" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"}`}
                        style={{ fontSize: '1.25rem' }}
                    />
                </button>
            )}
            {isFixed && (
                <Icon
                    name={"visibility"}
                    className={`w-8 h-8 p-1.5 transition-colors ${isVisible ? "text-rose-500 dark:text-rose-400" : "text-neutral-500 dark:text-neutral-400"}`}
                    style={{ fontSize: '1.25rem' }}
                />
            )}
        </motion.li>
    );
};

DraggableColumnItem.propTypes = {
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isVisible: PropTypes.bool.isRequired,
    isFixed: PropTypes.bool.isRequired,
    onToggleVisibility: PropTypes.func.isRequired,
    onMoveColumn: PropTypes.func.isRequired,
};

export default DraggableColumnItem;