import React from 'react';
import Icon from '../../../../../components/common/Icon';
import Dropdown from '../../../../../components/common/Dropdown';

const LABEL_STYLE = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
const SELECT_STYLE = "w-full text-sm rounded-md h-9 pl-3 pr-8 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 focus:ring-1 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-rose-500 text-neutral-900 dark:text-neutral-100 shadow-sm appearance-none";
const CHECKBOX_WRAPPER_STYLE = "flex items-center space-x-2 cursor-pointer"; // Applied to label wrapping checkbox
const CHECKBOX_LABEL_TEXT_STYLE = "text-xs font-medium text-neutral-600 dark:text-neutral-300"; // For text part of checkbox label
const CHECKBOX_STYLE = "form-checkbox h-4 w-4 text-rose-600 dark:text-rose-500 bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-500 rounded focus:ring-rose-500 dark:focus:ring-rose-400 transition duration-150 ease-in-out";
const INFO_SECTION_STYLE = "mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5";
const INFO_PAIR_STYLE = "flex justify-between items-center text-xs";
const INFO_LABEL_STYLE = "text-neutral-500 dark:text-neutral-400";
const INFO_VALUE_STYLE = "text-neutral-700 dark:text-neutral-200 font-medium text-right";
const HELPER_TEXT_STYLE = "text-xxs text-neutral-500 dark:text-neutral-400 mt-0.5";

const DoorEditor = ({ item, onUpdateItemProperty }) => {
    if (!item || item.itemType !== 'placedDoor') return null;

    const handleSwingDirectionChange = (e) => {
        onUpdateItemProperty(item.id, { swingDirection: e });
    };

    return (
        <div className="space-y-4 p-1 font-montserrat">
            <div>
                <Dropdown
                    id={`door-swing-${item.id}`}
                    label="Swing Direction"
                    name="swingDirection"
                    value={item.swingDirection || 'left'}
                    onChange={handleSwingDirectionChange}
                    options={[
                        { value: 'left', label: 'Left Swing' },
                        { value: 'right', label: 'Right Swing' },
                    ]}
                    placeholder="Select Swing Direction"
                    error={''}
                    helptext={''}
                    className={`h-15 flex items-end`}
                    disabled={false}
                    themeColor="rose"
                />
            </div>

            <div className={INFO_SECTION_STYLE}>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Item ID:</span>
                    <span className={`${INFO_VALUE_STYLE} font-mono`}>{item.id.substring(5, 12)}</span>
                </div>
                <div className={INFO_PAIR_STYLE}>
                    <span className={INFO_LABEL_STYLE}>Type:</span>
                    <span className={INFO_VALUE_STYLE}>{item.shape || 'Standard Door'}</span>
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

export default DoorEditor;