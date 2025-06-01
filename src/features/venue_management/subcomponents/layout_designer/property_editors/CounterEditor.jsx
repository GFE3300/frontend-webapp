import React, { useState, useEffect } from 'react';
import InputField from '../../../../../components/common/InputField'; // Verify path

// Localization
import slRaw from '../../../utils/script_lines.js';
const sl = slRaw.venueManagement.counterEditor;
const slCommon = slRaw; // For common Yes/No

// Design Guideline Variables (Copied from original, no changes here)
const LABEL_STYLE = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
const INFO_SECTION_STYLE = "mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5";
const INFO_PAIR_STYLE = "flex justify-between items-center text-xs";
const INFO_LABEL_STYLE = "text-neutral-500 dark:text-neutral-400";
const INFO_VALUE_STYLE = "text-neutral-700 dark:text-neutral-200 font-medium text-right";
const HELPER_TEXT_STYLE = "text-xxs text-neutral-500 dark:text-neutral-400 mt-0.5";
// --- End Design Guideline Variables ---

const CounterEditor = ({ item, onUpdateItemProperty }) => {
    const isActualCounter = item?.itemType === 'placedCounter';
    // Assuming ItemTypes is available or this check is robust enough
    const isDecorCounter = item?.itemType === 'placedDecor' && item?.decorType?.startsWith('counter-');

    const [labelInput, setLabelInput] = useState(item.label || '');
    const [lengthMajorInput, setLengthMajorInput] = useState(String(item.length_units || '1'));

    useEffect(() => {
        if (item.label !== labelInput) {
            setLabelInput(item.label || '');
        }
        // Ensure length_units from item prop updates local state
        if (String(item.length_units || '1') !== lengthMajorInput) {
            setLengthMajorInput(String(item.length_units || '1'));
        }
    }, [item.label, item.length_units, labelInput, lengthMajorInput]);

    const handleLabelChange = (e) => {
        const newLabel = e.target.value;
        setLabelInput(newLabel);
        onUpdateItemProperty(item.id, { label: newLabel });
    };

    const handleLengthChange = (e) => {
        const newLengthStr = e.target.value;
        setLengthMajorInput(newLengthStr); // Update local state immediately for responsive input

        if (newLengthStr === '') {
            // Temporarily allow empty, onBlur will correct to min 1 or use hook validation
            // Or, directly update to '1' if that's preferred UX for empty input
            onUpdateItemProperty(item.id, { length_units: '1' });
        } else {
            // Allow temporary invalid numbers too, validation in hook/onBlur
            // This prevents input from "jumping" if user types "0" then intends "01" -> "1"
            onUpdateItemProperty(item.id, { length_units: newLengthStr });
        }
    };

    const handleLengthBlur = () => {
        let finalLength = parseInt(lengthMajorInput, 10);
        if (isNaN(finalLength) || finalLength < 1) {
            finalLength = 1; // Default to 1 if invalid or less than 1
        }
        // Only call update if the corrected value is different from what's already in item prop
        if (String(finalLength) !== String(item.length_units || '1')) {
            onUpdateItemProperty(item.id, { length_units: String(finalLength) });
        }
        // Always set local state to the validated/corrected value
        setLengthMajorInput(String(finalLength));
    };


    const isLengthDimensionWidth = item.rotation === 0 || item.rotation === 180;

    if (!item || !(isActualCounter || isDecorCounter)) {
        return (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md font-montserrat">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                    {sl.invalidItemError || "Error: Invalid item for Counter Editor."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-1 font-montserrat">
            <div>
                <InputField
                    label={sl.labelOptionalLabel || "Label (Optional)"}
                    type="text"
                    className={`w-full h-15 flex items-end ${LABEL_STYLE}`}
                    value={labelInput}
                    onChange={handleLabelChange}
                    placeholder={sl.labelPlaceholder || "e.g., Main Bar, Register"}
                    title={sl.labelTooltip || "Enter an optional label for this counter."}
                />
            </div>

            <div>
                <InputField
                    label={sl.lengthLabel || "Length (major grid units)"}
                    type="number" // Using number for better native controls, but blur/change handles parsing
                    className={`w-full h-15 flex items-end ${LABEL_STYLE}`}
                    value={lengthMajorInput}
                    onChange={handleLengthChange}
                    onBlur={handleLengthBlur}
                    min="1" // HTML5 min attribute
                    placeholder={sl.lengthPlaceholder || "e.g., 2"}
                    title={sl.lengthTooltip || "Length of the counter along its main axis, in major grid cells."}
                />
                <p className={`mx-1 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ${HELPER_TEXT_STYLE}`}>
                    {sl.lengthHelpText || "Defines length along its main axis. Thickness is 1 major unit."}
                </p>
            </div>

            <div className={INFO_SECTION_STYLE}>
                {/* <h4 className="text-sm font-semibold mb-2">{sl.infoSectionTitle || "Counter Information"}</h4> */}
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.itemIdLabel || "Item ID:"}</span>
                    <span className={`${INFO_VALUE_STYLE} font-mono`}>{item.id.substring(5, 12)}</span>
                </div>
                {item.decorType && ( // Only show if it's a decor-based counter
                    <div className={INFO_PAIR_STYLE}>
                        <span className={INFO_LABEL_STYLE}>{sl.decorTypeLabel || "Decor Type (if any):"}</span>
                        <span className={INFO_VALUE_STYLE}>{item.decorType}</span>
                    </div>
                )}
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.shapeConfigLabel || "Shape Config:"}</span>
                    <span className={INFO_VALUE_STYLE}>{item.shape}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.rotationLabel || "Rotation:"}</span>
                    <span className={INFO_VALUE_STYLE}>{item.rotation}°</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.actualBaseWidthLabel || "Actual Base Width (minor):"}</span>
                    <span className={`${INFO_VALUE_STYLE} ${isLengthDimensionWidth ? 'font-bold text-rose-600 dark:text-rose-400' : ''}`}>{item.w_minor}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.actualBaseHeightLabel || "Actual Base Height (minor):"}</span>
                    <span className={`${INFO_VALUE_STYLE} ${!isLengthDimensionWidth ? 'font-bold text-rose-600 dark:text-rose-400' : ''}`}>{item.h_minor}</span>
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

export default CounterEditor;