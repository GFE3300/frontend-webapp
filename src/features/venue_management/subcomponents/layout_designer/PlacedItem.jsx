import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import Icon from '../../../../components/common/Icon'; // Assuming Icon component exists and is used
import { getEffectiveDimensions } from '../../utils/layoutUtils'; // Import helper

// ItemTypes and CELL_SIZE_REM will be passed as props from LayoutDesigner

const PlacedItem = ({
    item,
    itemType, // e.g., ItemTypes.PLACED_TABLE from props
    isEraserActive,
    onUpdateTableNumber, // (tableId, newNumberString) => boolean
    onRotateTable, // (tableId) => void - New prop
    eraseDesignerItem,   // (itemId) => void
    CELL_SIZE_REM,
    ItemTypes, // Passed from LayoutDesigner
}) => {
    const [isEditingNumber, setIsEditingNumber] = useState(false);
    const [currentNumberInput, setCurrentNumberInput] = useState(
        itemType === ItemTypes.PLACED_TABLE && item ? String(item.number ?? '') : ""
    );

    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: ItemTypes.PLACED_TABLE, // This item is always a PLACED_TABLE once on grid
        item: () => ({ // item is a function to ensure fresh data on drag start
            id: item.id,
            itemType: ItemTypes.PLACED_TABLE,
            size: item.size,     // e.g., 'rectangle-tall' - fundamental property
            rotation: item.rotation, // e.g., 0 or 90 - fundamental property
        }),
        canDrag: () => !isEditingNumber && !isEraserActive,
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [item, isEditingNumber, isEraserActive, ItemTypes]); // Dependencies for useDrag

    useEffect(() => {
        // Connect the drag preview to an empty image
        // This is important if you want to render a custom drag layer or just hide the default browser preview
        // For this specific case, we might not need a custom drag layer if the highlighting on grid cells is sufficient.
        // If you want the item itself to follow the cursor, dragPreview(getEmptyImage()) is not what you want.
        // The default behavior of react-dnd will make a snapshot of the item follow the cursor.
        // To customize that, you'd use a DragLayer. For now, we'll let the default work.
    }, [dragPreview]);


    useEffect(() => {
        if (itemType === ItemTypes.PLACED_TABLE && !isEditingNumber && item.number !== undefined) {
            setCurrentNumberInput(String(item.number));
        }
    }, [item?.number, isEditingNumber, itemType, item]);

    const handleNumberTextClick = useCallback((e) => {
        e.stopPropagation();
        if (isEraserActive || isDragging) return;
        setCurrentNumberInput(String(item.number ?? ''));
        setIsEditingNumber(true);
    }, [isEraserActive, isDragging, item?.number]);

    const handleInputChange = (e) => setCurrentNumberInput(e.target.value);

    const saveNumber = useCallback(() => {
        const success = onUpdateTableNumber(item.id, currentNumberInput);
        if (!success && item.number !== undefined) {
            setCurrentNumberInput(String(item.number));
        }
        setIsEditingNumber(false);
    }, [item?.id, item?.number, currentNumberInput, onUpdateTableNumber]);

    const cancelEdit = useCallback(() => {
        if (item.number === undefined) return;
        setCurrentNumberInput(String(item.number));
        setIsEditingNumber(false);
    }, [item?.number]);


    const handleInputKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveNumber();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    }, [saveNumber, cancelEdit]);

    const handleRotateClick = useCallback((e) => {
        e.stopPropagation();
        if (onRotateTable && !isEditingNumber && !isEraserActive) {
            onRotateTable(item.id);
        }
    }, [item?.id, onRotateTable, isEditingNumber, isEraserActive]);


    if (!item || !item.gridPosition) return null;

    const { w: effectiveW, h: effectiveH } = getEffectiveDimensions(item);

    const style = {
        position: 'absolute',
        top: `${(item.gridPosition.rowStart - 1) * CELL_SIZE_REM}rem`,
        left: `${(item.gridPosition.colStart - 1) * CELL_SIZE_REM}rem`,
        width: `${effectiveW * CELL_SIZE_REM}rem`,
        height: `${effectiveH * CELL_SIZE_REM}rem`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : (isEraserActive ? 20 : (isEditingNumber ? 25 : 10)),
        // pointerEvents: isEraserActive && !isEditingNumber ? 'auto' : (isDragging ? 'none' : 'auto'),
        transformOrigin: 'center center', // For smoother visual rotation if CSS rotation is applied
    };

    let baseClasses = `flex flex-col items-center justify-center text-xs overflow-hidden p-0.5 select-none relative group`; // Added group for hover effects on children
    let shapeClass = item.size === 'round' ? 'rounded-full' : 'rounded-lg';
    baseClasses += ` border border-indigo-400 bg-indigo-100 text-indigo-800`;

    let title = isEditingNumber ? `Editing number (Original: ${item.number ?? 'N/A'})`
        : (isEraserActive ? `Click to erase Table ${item.number ?? 'N/A'}`
            : `Table ${item.number ?? 'N/A'} (${item.size?.replace('-', ' ') ?? 'N/A'}) - Seats: ${item.seats ?? 'N/A'}. Rotation: ${item.rotation}°`);

    const content = (
        <>
            {isEditingNumber ? (
                <input
                    type="number"
                    value={currentNumberInput}
                    onChange={handleInputChange}
                    onBlur={saveNumber}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="w-12 text-center bg-white text-indigo-700 rounded border border-indigo-500 text-sm py-0.5 z-30"
                    min="1"
                />
            ) : (
                <span
                    className="font-bold text-sm cursor-text hover:text-indigo-500"
                    onClick={handleNumberTextClick}
                    title={`Click to edit Table ${item.number ?? 'N/A'} number`}
                >
                    {item.number ?? 'N/A'}
                </span>
            )}
            <span className="text-xxs leading-tight text-center w-full break-words px-0.5">{item.size?.replace('-', ' ') ?? 'N/A'}</span>
            {item.seats !== undefined && <span className="text-xxs leading-tight opacity-80 text-center w-full break-words px-0.5">Seats: {item.seats}</span>}

            {/* Rotate Button - shown on hover when not dragging/editing/erasing */}
            {!isDragging && !isEditingNumber && !isEraserActive && (
                <button
                    onClick={handleRotateClick}
                    className="absolute top-0 right-0 mt-0.5 mr-0.5 p-0.5 bg-indigo-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    title={`Rotate Table ${item.number ?? 'N/A'}`}
                >
                    <Icon name="rotate_90_degrees_cw" className="w-3 h-3" />
                </button>
            )}
        </>
    );

    baseClasses += ` ${!isEraserActive && !isDragging && !isEditingNumber ? 'cursor-grab hover:shadow-lg' : ''}`;
    baseClasses += ` ${isEraserActive && !isEditingNumber ? 'cursor-pointer hover:bg-rose-300 hover:border-rose-500' : ''}`;
    baseClasses += ` ${isDragging ? 'cursor-grabbing' : ''}`;

    return (
        <motion.div
            layout // Animate layout changes
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            ref={drag} // Apply drag to the motion.div
            style={style}
            onClick={e => {
                if (isEraserActive && !isEditingNumber) {
                    e.stopPropagation();
                    eraseDesignerItem(item.id);
                }
            }}
            className={`${baseClasses} ${shapeClass}`}
            title={title}
        >
            {content}
        </motion.div>
    );
};

export default PlacedItem;