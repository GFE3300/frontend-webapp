import React from 'react';
// Icon is not used directly in this editor, but Dropdown might use it internally
import Dropdown from '../../../../../components/common/Dropdown';

// Localization
import slRaw from '../../../utils/script_lines.js';
const sl = slRaw.venueManagement.doorEditor;
const slCommon = slRaw; // For common Yes/No

// Design Guideline Variables (Copied from original, no changes here)
// LABEL_STYLE is implicitly handled by Dropdown's label prop
// SELECT_STYLE is handled internally by Dropdown
// CHECKBOX styles are not used here
const INFO_SECTION_STYLE = "mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5";
const INFO_PAIR_STYLE = "flex justify-between items-center text-xs";
const INFO_LABEL_STYLE = "text-neutral-500 dark:text-neutral-400";
const INFO_VALUE_STYLE = "text-neutral-700 dark:text-neutral-200 font-medium text-right";
// HELPER_TEXT_STYLE is not used here for now
// --- End Design Guideline Variables ---

const DoorEditor = ({ item, onUpdateItemProperty }) => {
    if (!item || item.itemType !== 'placedDoor') return null;

    const handleSwingDirectionChange = (newSwingValue) => { // Dropdown now passes the value directly
        onUpdateItemProperty(item.id, { swingDirection: newSwingValue });
    };

    const swingOptions = [
        { value: 'left', label: sl.leftSwingOption || "Left Swing" },
        { value: 'right', label: sl.rightSwingOption || "Right Swing" },
    ];

    return (
        <div className="space-y-4 p-1 font-montserrat">
            <div>
                <Dropdown
                    id={`door-swing-${item.id}`}
                    label={sl.swingDirectionLabel || "Swing Direction"}
                    name="swingDirection" // Important for forms, though not strictly needed here
                    value={item.swingDirection || 'left'}
                    onChange={handleSwingDirectionChange}
                    options={swingOptions}
                    placeholder={sl.selectSwingPlaceholder || "Select Swing Direction"}
                    // error={''} // No error state managed here currently
                    // helptext={''} // No help text for this dropdown currently
                    className={`h-15 flex items-end`} // Wrapper style for consistent spacing if needed
                    // disabled={false} // Default
                    themeColor="rose" // Consistent with other inputs
                />
            </div>

            <div className={INFO_SECTION_STYLE}>
                {/* <h4 className="text-sm font-semibold mb-2">{sl.infoSectionTitle || "Door Information"}</h4> */}
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.itemIdLabel || "Item ID:"}</span>
                    <span className={`${INFO_VALUE_STYLE} font-mono`}>{item.id.substring(5, 12)}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>{sl.typeLabel || "Type:"}</span>
                    <span className={INFO_VALUE_STYLE}>{item.shape || (sl.standardDoorType || "Standard Door")}</span>
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

export default DoorEditor;