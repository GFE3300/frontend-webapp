import React, { useState, useEffect } from 'react';
import InputField from '../../../../../components/common/InputField'; // Verify path

const LABEL_STYLE = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
const INFO_SECTION_STYLE = "mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5";
const INFO_PAIR_STYLE = "flex justify-between items-center text-xs";
const INFO_LABEL_STYLE = "text-neutral-500 dark:text-neutral-400";
const INFO_VALUE_STYLE = "text-neutral-700 dark:text-neutral-200 font-medium text-right";
const HELPER_TEXT_STYLE = "text-xxs text-neutral-500 dark:text-neutral-400 mt-0.5";

const CounterEditor = ({ item, onUpdateItemProperty, gridSubdivision }) => {
    const isActualCounter = item?.itemType === 'placedCounter';
    const isDecorCounter = item?.itemType === 'placedDecor' && item?.decorType?.startsWith('counter-');

    const [labelInput, setLabelInput] = useState(item.label || '');
    const [lengthMajorInput, setLengthMajorInput] = useState(String(item.length_units || '1'));

    useEffect(() => {
        if (item.label !== labelInput) {
            setLabelInput(item.label || '');
        }
        if (String(item.length_units || '1') !== lengthMajorInput) {
            setLengthMajorInput(String(item.length_units || '1'));
        }
    }, [item.label, item.length_units, labelInput, lengthMajorInput]); // Added local states to deps

    const handleLabelChange = (e) => {
        const newLabel = e.target.value;
        setLabelInput(newLabel);
        onUpdateItemProperty(item.id, { label: newLabel });
    };

    const handleLengthChange = (e) => {
        const newLengthStr = e.target.value;
        setLengthMajorInput(newLengthStr);

        if (newLengthStr === '') {
            onUpdateItemProperty(item.id, { length_units: '1' });
        } else {
            const num = parseInt(newLengthStr, 10);
            if (!isNaN(num) && num >= 1) {
                onUpdateItemProperty(item.id, { length_units: String(num) });
            } else {
                onUpdateItemProperty(item.id, { length_units: newLengthStr });
            }
        }
    };

    const handleLengthBlur = () => {
        let finalLength = parseInt(lengthMajorInput, 10);
        if (isNaN(finalLength) || finalLength < 1) {
            finalLength = 1;
        }
        if (String(finalLength) !== String(item.length_units || '1')) {
            onUpdateItemProperty(item.id, { length_units: String(finalLength) });
        }
        setLengthMajorInput(String(finalLength));
    };

    const isLengthDimensionWidth = item.rotation === 0 || item.rotation === 180;

    if (!item || !(isActualCounter || isDecorCounter)) {
        return (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md font-montserrat">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">Error: Invalid item for Counter Editor.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-1 font-montserrat">
            <div>
                <InputField
                    label="Label (Optional)"
                    type="text"
                    className={`w-full h-15 flex items-end ${LABEL_STYLE}`}
                    value={labelInput}
                    onChange={handleLabelChange}
                    placeholder="e.g., Main Bar, Register"
                    title="Enter an optional label for this counter."
                />
            </div>

            <div>
                <InputField
                    label="Length (major grid units)"
                    type="number"
                    className={`w-full h-15 flex items-end ${LABEL_STYLE}`}
                    value={lengthMajorInput}
                    onChange={handleLengthChange}
                    onBlur={handleLengthBlur}
                    min="1"
                    placeholder="e.g., 2"
                    title="Length of the counter along its main axis, in major grid cells."
                />
                <p className={`mx-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ${HELPER_TEXT_STYLE}`}>
                    Defines length along its main axis. Thickness is 1 major unit.
                </p>
            </div>

            <div className={INFO_SECTION_STYLE}>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Item ID:</span>
                    <span className={`${INFO_VALUE_STYLE} font-mono`}>{item.id.substring(5, 12)}</span>
                </div>
                {item.decorType && (
                    <div className={INFO_PAIR_STYLE}>
                        <span className={INFO_LABEL_STYLE}>Decor Type (if any):</span>
                        <span className={INFO_VALUE_STYLE}>{item.decorType}</span>
                    </div>
                )}
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Shape Config:</span>
                    <span className={INFO_VALUE_STYLE}>{item.shape}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Rotation:</span>
                    <span className={INFO_VALUE_STYLE}>{item.rotation}°</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Actual Base Width (minor):</span>
                    <span className={`${INFO_VALUE_STYLE} ${isLengthDimensionWidth ? 'font-bold text-rose-600 dark:text-rose-400' : ''}`}>{item.w_minor}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Actual Base Height (minor):</span>
                    <span className={`${INFO_VALUE_STYLE} ${!isLengthDimensionWidth ? 'font-bold text-rose-600 dark:text-rose-400' : ''}`}>{item.h_minor}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Fixed:</span>
                    <span className={INFO_VALUE_STYLE}>{item.isFixed ? 'Yes' : 'No'}</span>
                </div>
            </div>
        </div>
    );
};

export default CounterEditor;