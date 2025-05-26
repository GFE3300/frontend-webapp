import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils'; // Util expects item.w/h in minor cells

const PlacedItem = ({
    item, // item.gridPosition (minor coords), item.w (minor units), item.h (minor units), item.rotation, item.size (tool type)
    itemType, // e.g., ItemTypes.PLACED_TABLE

    isEraserActive,
    eraseDesignerItem,   // (itemId) => void
    onUpdateTableNumber, // (tableId, newNumberString) => boolean
    onRotateTable,       // (tableId) => void (triggers updateTableProperties with {rotation: true})

    CELL_SIZE_REM,       // This is now MINOR_CELL_SIZE_REM, passed from LayoutDesignerGrid
    ItemTypes,           // Constant object { PLACED_TABLE, TABLE_TOOL }
}) => {
    const [isEditingNumber, setIsEditingNumber] = useState(false);
    const [currentNumberInput, setCurrentNumberInput] = useState(
        itemType === ItemTypes.PLACED_TABLE && item ? String(item.number ?? '') : ""
    );

    // Calculate effective dimensions in minor cell units using the utility.
    // item.w and item.h are already in minor cell units.
    const effectiveDimensionsInMinorUnits = useMemo(() => getEffectiveDimensionsUtil(item), [item]);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: itemType, // Use the passed itemType (e.g., PLACED_TABLE)
        item: () => ({
            id: item.id,
            itemType: itemType,
            // Base dimensions (in minor cells) and rotation are needed for recalculating effective dims on hover/drop
            w: item.w,          // Base width in minor cells (before rotation)
            h: item.h,          // Base height in minor cells (before rotation)
            rotation: item.rotation,
            size: item.size,    // Original tool type/size identifier (e.g., 'square', 'rectangle')

            // Include current effective dimensions directly in the payload for DroppableGridCell's hover/canDrop
            // These are also in minor cell units.
            effW_minor: effectiveDimensionsInMinorUnits.w,
            effH_minor: effectiveDimensionsInMinorUnits.h,
        }),
        canDrag: () => !isEditingNumber && !isEraserActive,
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [item, itemType, isEditingNumber, isEraserActive, ItemTypes, effectiveDimensionsInMinorUnits]);


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
        if (!success && item.number !== undefined) { // Revert if save failed
            setCurrentNumberInput(String(item.number));
        }
        setIsEditingNumber(false);
    }, [item?.id, item?.number, currentNumberInput, onUpdateTableNumber]);

    const cancelEdit = useCallback(() => {
        if (item.number !== undefined) {
            setCurrentNumberInput(String(item.number));
        }
        setIsEditingNumber(false);
    }, [item?.number]);

    const handleInputKeyDown = useCallback((e) => {
        if (e.key === 'Enter') { e.preventDefault(); saveNumber(); }
        else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
    }, [saveNumber, cancelEdit]);

    const handleRotateClick = useCallback((e) => {
        e.stopPropagation();
        if (onRotateTable && !isEditingNumber && !isEraserActive) {
            onRotateTable(item.id);
        }
    }, [item?.id, onRotateTable, isEditingNumber, isEraserActive]);


    if (!item || !item.gridPosition || typeof item.w !== 'number' || typeof item.h !== 'number') {
        console.warn("PlacedItem: Invalid item data", item);
        return null;
    }

    // item.gridPosition is in MINOR cell coordinates (e.g., { rowStart: 5, colStart: 9 })
    // effectiveDimensionsInMinorUnits.w and .h are in MINOR cell units
    // CELL_SIZE_REM is the size of one MINOR cell in rems.

    const style = {
        position: 'absolute',
        top: `${(item.gridPosition.rowStart - 1) * CELL_SIZE_REM}rem`,
        left: `${(item.gridPosition.colStart - 1) * CELL_SIZE_REM}rem`,
        width: `${effectiveDimensionsInMinorUnits.w * CELL_SIZE_REM}rem`,
        height: `${effectiveDimensionsInMinorUnits.h * CELL_SIZE_REM}rem`,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 100 : (isEditingNumber ? 25 : (isEraserActive ? 20 : 10)), // Ensure eraser click doesn't go through if not intended
        transformOrigin: 'center center',
    };

    let baseClasses = `flex flex-col items-center justify-center text-xs overflow-hidden p-0.5 select-none relative group shadow-md`;
    let shapeClass = item.size === 'round' ? 'rounded-[50%]' : 'rounded-md';

    if (itemType === ItemTypes.PLACED_TABLE) {
        baseClasses += ` border border-indigo-500 bg-indigo-200 text-indigo-900`;
    }
    // else if (itemType === ItemTypes.PLACED_OBSTACLE) { /* Style for obstacles */ }


    let title = `T${item.number ?? 'N/A'} (${item.size?.replace('-', ' ')}) S:${item.seats ?? 'N/A'} R:${item.rotation}°`;
    if (isEditingNumber) title = `Editing T${item.number ?? 'N/A'}`;
    if (isEraserActive) title = `Click to erase T${item.number ?? 'N/A'}`;


    const content = (
        <>
            {isEditingNumber && itemType === ItemTypes.PLACED_TABLE ? (
                <input
                    type="number"
                    value={currentNumberInput}
                    onChange={handleInputChange}
                    onBlur={saveNumber}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    onClick={(e) => e.stopPropagation()} // Prevent item click when editing input
                    className="w-11 text-center bg-white text-indigo-700 rounded border border-indigo-500 text-xs py-0 z-30"
                    min="1"
                />
            ) : itemType === ItemTypes.PLACED_TABLE && (
                <span
                    className="font-semibold text-[10px] sm:text-xs cursor-pointer hover:text-indigo-600"
                    onClick={handleNumberTextClick}
                    title={`Edit Table ${item.number ?? 'N/A'} Number`}
                >
                    T{item.number ?? 'N/A'}
                </span>
            )}
            {itemType === ItemTypes.PLACED_TABLE && (
                <>
                    <span className="text-[8px] sm:text-[10px] leading-tight opacity-80">{item.size?.replace('-', ' ')}</span>
                    {item.seats !== undefined && <span className="text-[8px] sm:text-[10px] leading-tight opacity-70">S: {item.seats}</span>}
                </>
            )}

            {itemType === ItemTypes.PLACED_TABLE && onRotateTable && !isDragging && !isEditingNumber && !isEraserActive && (
                <button
                    onClick={handleRotateClick}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    title={`Rotate Table ${item.number ?? 'N/A'}`}
                >
                    <Icon name="rotate_90_degrees_cw" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
            )}
        </>
    );

    baseClasses += ` ${!isEraserActive && !isDragging && !isEditingNumber && itemType !== ItemTypes.PLACED_OBSTACLE ? 'cursor-grab hover:shadow-lg' : ''}`;
    baseClasses += ` ${isEraserActive && !isEditingNumber ? 'cursor-pointer hover:bg-rose-300 hover:border-rose-500' : ''}`;
    baseClasses += ` ${isDragging ? 'cursor-grabbing' : ''}`;

    return (
        <motion.div
            layout // Animate layout changes (position, size due to rotation)
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            ref={drag}
            style={style}
            onClick={e => {
                if (isEraserActive && !isEditingNumber) {
                    e.stopPropagation(); // Prevent grid cell click if eraser is for this item
                    eraseDesignerItem(item.id);
                }
                // If not editing number and not eraser, clicking the item itself doesn't do anything extra
                // (text for number editing has its own click handler)
            }}
            className={`${baseClasses} ${shapeClass}`}
            title={title}
        >
            {content}
        </motion.div>
    );
};

export default PlacedItem;