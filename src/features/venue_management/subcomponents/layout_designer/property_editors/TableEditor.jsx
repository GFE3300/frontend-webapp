// features/venue_management/subcomponents/layout_designer/property_editors/TableEditor.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../../../../components/common/InputField';

// Localization
import slRaw from '../../../utils/script_lines.js';
const sl = slRaw.venueManagement.tableEditor;
const slCommon = slRaw; // For common strings like Yes/No

// Design Guideline Variables (Copied from original, no changes here)
const LABEL_STYLE = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
// INPUT_STYLE is handled by InputField
const INFO_SECTION_STYLE = "mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5";
const INFO_PAIR_STYLE = "flex justify-between items-center text-xs";
const INFO_LABEL_STYLE = "text-neutral-500 dark:text-neutral-400";
const INFO_VALUE_STYLE = "text-neutral-700 dark:text-neutral-200 font-medium text-right";
const HELPER_TEXT_STYLE = "text-xxs text-neutral-500 dark:text-neutral-400 mt-0.5";
// --- End Design Guideline Variables ---

const TableEditor = ({ item, onUpdateItemProperty }) => {
    const [seatsInput, setSeatsInput] = useState(String(item.seats ?? ''));

    useEffect(() => {
        if (String(item.seats ?? '') !== seatsInput) {
            setSeatsInput(String(item.seats ?? ''));
        }
    }, [item.seats, seatsInput]);

    const handleSeatsChange = (e) => {
        const value = e.target.value;
        setSeatsInput(value);
        onUpdateItemProperty(item.id, { seats: value });
    };

    const handleSeatsBlur = () => {
        let finalSeats = seatsInput.trim();
        if (finalSeats === '') {
            onUpdateItemProperty(item.id, { seats: null });
        } else {
            const numSeats = parseInt(finalSeats, 10);
            if (!isNaN(numSeats) && numSeats >= 0) {
                onUpdateItemProperty(item.id, { seats: numSeats });
            } else {
                onUpdateItemProperty(item.id, { seats: finalSeats });
            }
        }
    };

    if (!item || item.itemType !== 'placedTable') return null;

    const tableNumberDisplayValue = item.isProvisional
        ? (sl.tableNumberValueProvisional || 'Nº? (Set on table)')
        : (item.number ?? (sl.tableNumberValueNotSet || 'Not Set'));

    return (
        <div className="space-y-4 p-1 font-montserrat">
            <div>
                <InputField
                    label={sl.tableNumberLabel || "Table Number"}
                    className={`h-15 w-full flex items-end ${LABEL_STYLE}`} // className is for wrapper here
                    value={tableNumberDisplayValue}
                    // onChange is not used for table number as it's edited on canvas
                    title={sl.tableNumberHelpText || "Edit table number directly on the table item on the canvas."} // Tooltip for the read-only field
                    readOnly
                />
                <p className={`mx-1 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ${HELPER_TEXT_STYLE}`}>
                    {sl.tableNumberHelpText || "Edit number on the table itself. Click to select, then click number to edit."}
                </p>
            </div>

            <div>
                <InputField
                    label={sl.seatsLabel || "Number of Seats"}
                    className={`h-15 w-full flex items-end ${LABEL_STYLE}`}
                    value={seatsInput}
                    onChange={handleSeatsChange}
                    onBlur={handleSeatsBlur}
                    placeholder={sl.seatsPlaceholder || "e.g., 4 or empty for default"}
                    title={sl.seatsTooltip || "Enter a number or leave empty for default seats."}
                    type="text" // Use text to allow empty string, parsing handled manually
                    inputMode="numeric" // Hint for mobile keyboards
                />
                <p className={`mx-1 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ${HELPER_TEXT_STYLE}`}>
                    {sl.seatsHelpText || "Enter a number or leave empty for default seats."}
                </p>
            </div>

            <div className={INFO_SECTION_STYLE}>
                {/* Optional: Add a title for this section if desired */}
                {/* <h4 className="text-sm font-semibold mb-2">{sl.infoSectionTitle || "Table Information"}</h4> */}
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.itemIdLabel || "Item ID:"}</span>
                    <span className={`${INFO_VALUE_STYLE} font-mono`}>{item.id.substring(5, 12)}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.defaultShapeLabel || "Default shape:"}</span>
                    <span className={INFO_VALUE_STYLE}>{item.shape}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.rotationLabel || "Rotation:"}</span>
                    <span className={INFO_VALUE_STYLE}>{item.rotation}°</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.provisionalLabel || "Provisional:"}</span>
                    <span className={`${INFO_VALUE_STYLE} ${item.isProvisional ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                        {item.isProvisional ? (sl.yesValue || slCommon.yes || "Yes") : (sl.noValue || slCommon.no || "No")}
                    </span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.fixedLabel || "Fixed:"}</span>
                    <span className={INFO_VALUE_STYLE}>
                        {item.isFixed ? (sl.yesValue || slCommon.yes || "Yes") : (sl.noValue || slCommon.no || "No")}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TableEditor;