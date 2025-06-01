import React, { useState, useEffect } from 'react';
import InputField from '../../../../../components/common/InputField';

// Localization
import slRaw, { interpolate } from '../../../utils/script_lines.js';
const sl = slRaw.venueManagement.wallEditor;
const slCommon = slRaw; // For common Yes/No

// Design Guideline Variables (Copied from original, no changes here)
const LABEL_STYLE = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
const INFO_SECTION_STYLE = "mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5";
const INFO_PAIR_STYLE = "flex justify-between items-center text-xs";
const INFO_LABEL_STYLE = "text-neutral-500 dark:text-neutral-400";
const INFO_VALUE_STYLE = "text-neutral-700 dark:text-neutral-200 font-medium text-right";
const HELPER_TEXT_STYLE = "text-xxs text-neutral-500 dark:text-neutral-400 mt-0.5";
// --- End Design Guideline Variables ---

const WallEditor = ({ item, onUpdateItemProperty, gridSubdivision }) => {
    const [thicknessInput, setThicknessInput] = useState(String(item.thickness_minor ?? 1));

    useEffect(() => {
        if (String(item.thickness_minor ?? 1) !== thicknessInput) {
            setThicknessInput(String(item.thickness_minor ?? 1));
        }
    }, [item.thickness_minor, thicknessInput]);

    const handleThicknessChange = (e) => {
        const value = e.target.value;
        setThicknessInput(value);

        const numValue = parseInt(value, 10);
        if (value === '') {
            onUpdateItemProperty(item.id, { thickness_minor: 1 });
        } else if (!isNaN(numValue) && numValue >= 1) {
            onUpdateItemProperty(item.id, { thickness_minor: numValue });
        }
    };

    const handleThicknessBlur = () => {
        let finalThickness = parseInt(thicknessInput, 10);
        const maxThickness = gridSubdivision || 4; // Default max if gridSubdivision undefined
        if (isNaN(finalThickness) || finalThickness < 1) {
            finalThickness = 1;
        } else if (finalThickness > maxThickness) {
            finalThickness = maxThickness;
        }

        if (finalThickness !== (item.thickness_minor ?? 1)) {
            onUpdateItemProperty(item.id, { thickness_minor: finalThickness });
        }
        setThicknessInput(String(finalThickness));
    };

    const lengthInMajorUnits = Math.max(item.w_minor || 0, item.h_minor || 0) / (gridSubdivision || 1);

    if (!item || item.itemType !== 'placedWall') return null;

    const maxThicknessDisplay = gridSubdivision || 4;

    return (
        <div className="space-y-4 p-1 font-montserrat">
            <div>
                <InputField
                    label={sl.thicknessLabel || "Visual Thickness (minor cells)"}
                    type="number"
                    className={`w-full h-15 flex items-end ${LABEL_STYLE}`}
                    value={thicknessInput}
                    onChange={handleThicknessChange}
                    onBlur={handleThicknessBlur}
                    min="1"
                    max={String(maxThicknessDisplay)} // InputField expects string for min/max
                    placeholder="1"
                    title={sl.thicknessTooltip || "Visual thickness of the wall within its own cell."}
                />
                <p className={`mx-1 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ${HELPER_TEXT_STYLE}`}>
                    {interpolate(sl.thicknessHelpText || "Thickness within its own grid cell. Does not affect collision. Max: {maxThickness}.", { maxThickness: maxThicknessDisplay })}
                </p>
            </div>

            <div className={INFO_SECTION_STYLE}>
                {/* <h4 className="text-sm font-semibold mb-2">{sl.infoSectionTitle || "Wall Information"}</h4> */}
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.itemIdLabel || "Item ID:"}</span>
                    <span className={`${INFO_VALUE_STYLE} font-mono`}>{item.id.substring(5, 12)}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.lengthLabel || "Length (major units):"}</span>
                    <span className={INFO_VALUE_STYLE}>{lengthInMajorUnits.toFixed(1)}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.baseWidthLabel || "Base Width (minor):"}</span>
                    <span className={INFO_VALUE_STYLE}>{item.w_minor}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.baseHeightLabel || "Base Height (minor):"}</span>
                    <span className={INFO_VALUE_STYLE}>{item.h_minor}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.rotationLabel || "Rotation:"}</span>
                    <span className={INFO_VALUE_STYLE}>{item.rotation}°</span>
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

export default WallEditor;