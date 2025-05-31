import React, { useState, useEffect } from 'react';
import { ITEM_CONFIGS } from '../../../constants/itemConfigs';
import InputField from '../../../../../components/common/InputField'; // Verify path

const LABEL_STYLE = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
const INFO_SECTION_STYLE = "mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5";
const INFO_PAIR_STYLE = "flex justify-between items-center text-xs";
const INFO_LABEL_STYLE = "text-neutral-500 dark:text-neutral-400";
const INFO_VALUE_STYLE = "text-neutral-700 dark:text-neutral-200 font-medium text-right";
const HELPER_TEXT_STYLE = "text-xxs text-neutral-500 dark:text-neutral-400 mt-0.5";

const DecorEditor = ({ item, onUpdateItemProperty, gridSubdivision }) => {

    const [labelInput, setLabelInput] = useState(item.label || '');
    const [widthInput, setWidthInput] = useState(String(item.w_minor || gridSubdivision || 1));
    const [heightInput, setHeightInput] = useState(String(item.h_minor || gridSubdivision || 1));

    const itemConfig = ITEM_CONFIGS[item.itemType];
    const isResizable = typeof itemConfig?.isResizable === 'function' ? itemConfig.isResizable(item) : itemConfig?.isResizable === true;

    useEffect(() => {
        if (item.label !== labelInput) {
            setLabelInput(item.label || '');
        }
        if (isResizable) {
            if (String(item.w_minor || gridSubdivision || 1) !== widthInput) {
                setWidthInput(String(item.w_minor || gridSubdivision || 1));
            }
            if (String(item.h_minor || gridSubdivision || 1) !== heightInput) {
                setHeightInput(String(item.h_minor || gridSubdivision || 1));
            }
        }
    }, [item.label, item.w_minor, item.h_minor, isResizable, gridSubdivision, labelInput, widthInput, heightInput]); // Added local states to deps

    const handleLabelChange = (e) => {
        const newLabel = e.target.value;
        setLabelInput(newLabel);
        onUpdateItemProperty(item.id, { label: newLabel });
    };

    const handleDimensionChange = (dim, value) => {
        const numValue = parseInt(value, 10);
        if (dim === 'w_minor') setWidthInput(value);
        if (dim === 'h_minor') setHeightInput(value);

        if (value === '') {
            onUpdateItemProperty(item.id, { [dim]: gridSubdivision || 1 });
        } else if (!isNaN(numValue) && numValue >= 1) {
            onUpdateItemProperty(item.id, { [dim]: numValue });
        }
    };

    const handleDimensionBlur = (dim, inputValue) => {
        let finalValue = parseInt(inputValue, 10);
        const currentItemValue = dim === 'w_minor' ? item.w_minor : item.h_minor;

        if (isNaN(finalValue) || finalValue < 1) {
            finalValue = gridSubdivision || 1;
        }
        if (finalValue !== (currentItemValue || gridSubdivision || 1)) {
            onUpdateItemProperty(item.id, { [dim]: finalValue });
        }
        if (dim === 'w_minor') setWidthInput(String(finalValue));
        if (dim === 'h_minor') setHeightInput(String(finalValue));
    };

    if (!item || item.itemType !== 'placedDecor') return null;

    return (
        <div className="space-y-4 p-1 font-montserrat">
            <div>
                <InputField
                    label="Label (Optional)"
                    type="text"
                    className={`w-full h-15 flex items-end ${LABEL_STYLE}`}
                    value={labelInput}
                    onChange={handleLabelChange}
                    placeholder="e.g., Potted Fern, Area Rug"
                    title="Enter an optional label for this decor item."
                />
            </div>

            {isResizable && (
                <>
                    <div>
                        <InputField
                            label="Width (minor cells)"
                            type="number"
                            className={`w-full h-15 flex items-end ${LABEL_STYLE}`}
                            value={widthInput}
                            onChange={(e) => handleDimensionChange('w_minor', e.target.value)}
                            onBlur={(e) => handleDimensionBlur('w_minor', e.target.value)}
                            min="1"
                            title="Width of the item's base before rotation."
                        />
                    </div>
                    <div>
                        <InputField
                            label="Height (minor cells)"
                            type="number"
                            className={`w-full h-15 flex items-end ${LABEL_STYLE}`}
                            value={heightInput}
                            onChange={(e) => handleDimensionChange('h_minor', e.target.value)}
                            onBlur={(e) => handleDimensionBlur('h_minor', e.target.value)}
                            min="1"
                            title="Height of the item's base before rotation."
                        />
                        <p className={`mx-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ${HELPER_TEXT_STYLE}`}>
                            Dimensions apply to the item's base before rotation.
                        </p>
                    </div>
                </>
            )}

            <div className={INFO_SECTION_STYLE}>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Item ID:</span>
                    <span className={`${INFO_VALUE_STYLE} font-mono`}>{item.id.substring(5, 12)}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Decor Type:</span>
                    <span className={INFO_VALUE_STYLE}>{item.decorType || 'Generic'}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Shape Config:</span>
                    <span className={INFO_VALUE_STYLE}>{item.shape}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Rotation:</span>
                    <span className={INFO_VALUE_STYLE}>{item.rotation}°</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Fixed:</span>
                    <span className={INFO_VALUE_STYLE}>{item.isFixed ? 'Yes' : 'No'}</span>
                </div>
            </div>
        </div>
    );
};

export default DecorEditor;