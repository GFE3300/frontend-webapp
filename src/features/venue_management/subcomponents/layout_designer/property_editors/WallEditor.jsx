// features/venue_management/subcomponents/layout_designer/property_editors/WallEditor.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../../../../components/common/InputField'; // Verify path

const LABEL_STYLE = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
// INPUT_STYLE is now part of InputField's internal styling or passed via its own props
const INFO_SECTION_STYLE = "mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5";
const INFO_PAIR_STYLE = "flex justify-between items-center text-xs";
const INFO_LABEL_STYLE = "text-neutral-500 dark:text-neutral-400";
const INFO_VALUE_STYLE = "text-neutral-700 dark:text-neutral-200 font-medium text-right";
const HELPER_TEXT_STYLE = "text-xxs text-neutral-500 dark:text-neutral-400 mt-0.5";

const WallEditor = ({ item, onUpdateItemProperty, gridSubdivision }) => {
    const [thicknessInput, setThicknessInput] = useState(String(item.thickness_minor ?? 1));

    useEffect(() => {
        if (String(item.thickness_minor ?? 1) !== thicknessInput) {
            setThicknessInput(String(item.thickness_minor ?? 1));
        }
    }, [item.thickness_minor, thicknessInput]); // Added thicknessInput to deps

    const handleThicknessChange = (e) => {
        const value = e.target.value;
        setThicknessInput(value);

        const numValue = parseInt(value, 10);
        if (value === '') {
            onUpdateItemProperty(item.id, { thickness_minor: 1 });
        } else if (!isNaN(numValue) && numValue >= 1) {
            onUpdateItemProperty(item.id, { thickness_minor: numValue });
        }
        // Invalid input will be handled onBlur or by the hook's validation
    };

    const handleThicknessBlur = () => {
        let finalThickness = parseInt(thicknessInput, 10);
        if (isNaN(finalThickness) || finalThickness < 1) {
            finalThickness = 1;
        }
        if (finalThickness !== (item.thickness_minor ?? 1)) {
            onUpdateItemProperty(item.id, { thickness_minor: finalThickness });
        }
        setThicknessInput(String(finalThickness));
    };

    const lengthInMajorUnits = Math.max(item.w_minor, item.h_minor) / (gridSubdivision || 1);

    if (!item || item.itemType !== 'placedWall') return null;

    return (
        <div className="space-y-4 p-1 font-montserrat">
            <div>
                <InputField
                    label="Visual Thickness (minor cells)"
                    type="number"
                    className={`w-full h-15 flex items-end ${LABEL_STYLE}`} 
                    value={thicknessInput}
                    onChange={handleThicknessChange}
                    onBlur={handleThicknessBlur}
                    min="1"
                    max={gridSubdivision || 4}
                    placeholder="1"
                    title="Visual thickness of the wall within its own cell."
                />
                <p className={`mx-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ${HELPER_TEXT_STYLE}`}>
                    Thickness within its own grid cell. Does not affect collision. Max: {gridSubdivision || 4}.
                </p>
            </div>

            <div className={INFO_SECTION_STYLE}>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Item ID:</span>
                    <span className={`${INFO_VALUE_STYLE} font-mono`}>{item.id.substring(5, 12)}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Length (major units):</span>
                    <span className={INFO_VALUE_STYLE}>{lengthInMajorUnits.toFixed(1)}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Base Width (minor):</span>
                    <span className={INFO_VALUE_STYLE}>{item.w_minor}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Base Height (minor):</span>
                    <span className={INFO_VALUE_STYLE}>{item.h_minor}</span>
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

export default WallEditor;