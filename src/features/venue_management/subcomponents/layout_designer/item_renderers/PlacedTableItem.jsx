// features/venue_management/subcomponents/layout_designer/item_renderers/PlacedTableItem.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../../../components/common/Icon'; // Adjust path as per your project

const PlacedTableItem = ({
    item, // Table-specific data: { id, number, shape, seats, rotation, ... }
    onUpdateItemProperty, // (itemId, { property: value }) => boolean
    // onSelectItem, // Prop available from wrapper, not used directly here for main selection
}) => {
    const [isEditingNumber, setIsEditingNumber] = useState(false);
    const [currentNumberInput, setCurrentNumberInput] = useState(String(item.number ?? ''));

    useEffect(() => {
        // Update local input if item.number changes externally and not currently editing
        if (!isEditingNumber && item.number !== undefined && String(item.number) !== currentNumberInput) {
            setCurrentNumberInput(String(item.number));
        }
    }, [item.number, isEditingNumber, currentNumberInput]);

    const handleNumberTextClick = useCallback((e) => {
        e.stopPropagation(); // Prevent wrapper's onSelectItem/onClick if specifically editing number
        setCurrentNumberInput(String(item.number ?? ''));
        setIsEditingNumber(true);
    }, [item.number]);

    const handleInputChange = (e) => {
        setCurrentNumberInput(e.target.value);
    };

    const saveNumber = useCallback(() => {
        if (!item?.id) return;
        // Pass the raw string; useLayoutDesignerStateManagement will handle parsing and validation
        onUpdateItemProperty(item.id, { number: currentNumberInput });
        setIsEditingNumber(false);
    }, [item?.id, currentNumberInput, onUpdateItemProperty]);

    const cancelEdit = useCallback(() => {
        setCurrentNumberInput(String(item.number ?? '')); // Revert to original number
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
        e.stopPropagation(); // Prevent wrapper's onSelectItem/onClick
        if (!isEditingNumber && item?.id) {
            onUpdateItemProperty(item.id, { rotation: true }); // `rotation: true` is a trigger
        }
    }, [item?.id, onUpdateItemProperty, isEditingNumber]);

    const baseClasses = `w-full h-full flex flex-col items-center justify-center text-xs overflow-hidden p-0.5 select-none relative border group`;
    const shapeClass = item.shape?.includes('round') ? 'rounded-[50%]' : 'rounded-md';
    const themeClasses = `border-indigo-500 bg-indigo-200 text-indigo-900 hover:bg-indigo-300`;

    return (
        <div
            className={`${baseClasses} ${shapeClass} ${themeClasses}`}
            title={`Table ${item.number ?? 'N/A'}, Shape: ${item.shape}, Seats: ${item.seats ?? 'N/A'}`}
        >
            {isEditingNumber ? (
                <input
                    type="text" // Use text to allow empty string initially, validation is in the hook
                    value={currentNumberInput}
                    onChange={handleInputChange}
                    onBlur={saveNumber} // Save on blur
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    onClick={(e) => e.stopPropagation()} // Keep stopPropagation
                    className="max-w-[80%] text-center bg-white text-indigo-700 rounded border border-indigo-600 text-xs py-0 z-10 outline-none ring-1 ring-indigo-600"
                />
            ) : (
                <span
                    className="font-semibold text-[10px] sm:text-xs cursor-pointer hover:text-indigo-700"
                    onClick={handleNumberTextClick}
                    title={`Edit Table ${item.number ?? 'N/A'} Number`}
                >
                    T{item.number ?? 'N/A'}
                </span>
            )}
            <span className="text-[8px] sm:text-[9px] leading-tight opacity-80">{item.shape?.replace(/-/g, ' ')}</span>
            {item.seats !== undefined && <span className="text-[8px] sm:text-[9px] leading-tight opacity-70">S: {item.seats}</span>}

            {/* Rotate button visible on group hover (group is on PlacedItemWrapper) when not editing */}
            {!isEditingNumber && (
                <button
                    onClick={handleRotateClick}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-5"
                    title={`Rotate Table ${item.number ?? 'N/A'}`}
                >
                    <Icon name="rotate_90_degrees_cw" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
            )}
        </div>
    );
};

export default PlacedTableItem;