import React, { useState, useEffect } from 'react';
import InputField from '../../../../../components/common/InputField';

const LABEL_STYLE = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
const INPUT_STYLE = "w-full text-sm rounded-md h-9 px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 focus:ring-1 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-rose-500 placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-900 dark:text-neutral-100 shadow-sm";
const READ_ONLY_INPUT_STYLE = `${INPUT_STYLE} bg-neutral-50 dark:bg-neutral-700/50 cursor-default opacity-80`;
const INFO_SECTION_STYLE = "mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5";
const INFO_PAIR_STYLE = "flex justify-between items-center text-xs";
const INFO_LABEL_STYLE = "text-neutral-500 dark:text-neutral-400";
const INFO_VALUE_STYLE = "text-neutral-700 dark:text-neutral-200 font-medium text-right";
const HELPER_TEXT_STYLE = "text-xxs text-neutral-500 dark:text-neutral-400 mt-0.5";


const TableEditor = ({ item, onUpdateItemProperty }) => {

    const [seatsInput, setSeatsInput] = useState(String(item.seats ?? ''));

    useEffect(() => {
        // Update local state if item.seats changes externally (e.g., undo/redo, or default seat calculation)
        if (String(item.seats ?? '') !== seatsInput) {
            setSeatsInput(String(item.seats ?? ''));
        }
    }, [item.seats, seatsInput]); // Only re-run if item.seats itself changes

    const handleSeatsChange = (e) => {
        const value = e.target.value;
        setSeatsInput(value); // Keep as string for input field
        // The hook updateItemProperties will handle parsing 'number' or 'null'
        onUpdateItemProperty(item.id, { seats: value });
    };

    const handleSeatsBlur = () => {
        // Optional: if you want to parse/validate on blur before final update
        // For now, immediate update on change is handled.
        // The hook will perform the final validation.
        let finalSeats = seatsInput.trim();
        if (finalSeats === '') {
            onUpdateItemProperty(item.id, { seats: null });
        } else {
            const numSeats = parseInt(finalSeats, 10);
            if (!isNaN(numSeats) && numSeats >= 0) {
                onUpdateItemProperty(item.id, { seats: numSeats });
            } else {
                // If invalid, hook should show alert, editor might revert to item.seats
                onUpdateItemProperty(item.id, { seats: finalSeats }); // Let hook validate
            }
        }
    };

    if (!item || item.itemType !== 'placedTable') return null;

    return (
        <div className="space-y-4 p-1 font-montserrat">
            <div>
                <InputField
                    label="Table Number"
                    className={`h-15 w-full flex items-end ${LABEL_STYLE}`}
                    value={item.isProvisional ? 'Nº? (Set on table)' : (item.number ?? 'Not Set')}
                    onChange={(e) => onUpdateItemProperty(item.id, { number: e.target.value })}
                    title="Edit table number directly on the table item on the canvas."
                    readOnly
                />
                <p className={`mx-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ${HELPER_TEXT_STYLE}`}>Edit number on the table itself. Click to select, then click number to edit.</p>
            </div>

            <div>
                <InputField
                    label="Number of Seats"
                    className={`h-15 w-full flex items-end ${LABEL_STYLE}`}
                    value={seatsInput}
                    onChange={handleSeatsChange}
                    onBlur={handleSeatsBlur}
                    placeholder="e.g., 4 or empty for default"
                    title="Enter a number or leave empty for default seats."
                />
                <p className={`mx-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ${HELPER_TEXT_STYLE}`}>Enter a number or leave empty for default seats.</p>
            </div>

            <div className={INFO_SECTION_STYLE}>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Item ID:</span>
                    <span className={`${INFO_VALUE_STYLE} font-mono`}>{item.id.substring(5, 12)}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Default shape:</span>
                    <span className={INFO_VALUE_STYLE}>{item.shape}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Rotation:</span>
                    <span className={INFO_VALUE_STYLE}>{item.rotation}°</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Provisional:</span>
                    <span className={`${INFO_VALUE_STYLE} ${item.isProvisional ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                        {item.isProvisional ? 'Yes' : 'No'}
                    </span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Fixed:</span>
                    <span className={INFO_VALUE_STYLE}>{item.isFixed ? 'Yes' : 'No'}</span>
                </div>
            </div>
        </div>
    );
};

export default TableEditor;