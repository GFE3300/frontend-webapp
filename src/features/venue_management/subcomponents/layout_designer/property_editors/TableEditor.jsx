// features/venue_management/subcomponents/layout_designer/property_editors/TableEditor.jsx
import React from 'react';
// Removed QR related imports as per "minimalist editor" and QR moved to "Preview Section"

const INPUT_FIELD_STYLE = "w-full text-sm rounded-md h-9 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 focus:ring-1 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-transparent placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-900 dark:text-neutral-100";
const LABEL_STYLE = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";

const TableEditor = ({ item, onUpdateItemProperty }) => {
    if (!item || item.itemType !== 'placedTable') return null;

    const handlePropertyChange = (propName, value) => {
        onUpdateItemProperty(item.id, { [propName]: value === '' ? null : value });
    };

    return (
        <div className="space-y-4 p-1">
            {/* Table Number is edited directly on TableRenderer for better UX */}
            {/* If needed here for some reason, ensure it's read-only or clearly indicates it reflects the on-item edit */}
            {/* <div>
                <label htmlFor={`table-number-disp-${item.id}`} className={LABEL_STYLE}>
                    Table Number:
                </label>
                <input
                    type="text"
                    id={`table-number-disp-${item.id}`}
                    value={item.number ?? 'N/A'}
                    readOnly
                    className={`${INPUT_FIELD_STYLE} bg-neutral-50 dark:bg-neutral-700/50 cursor-default`}
                />
            </div> */}

            <div>
                <label htmlFor={`seats-${item.id}`} className={LABEL_STYLE}>
                    Number of Seats:
                </label>
                <input
                    type="text" // Allows empty string, validation by hook
                    id={`seats-${item.id}`}
                    name="seats"
                    value={item.seats ?? ''}
                    onChange={(e) => handlePropertyChange('seats', e.target.value)}
                    placeholder="e.g., 4"
                    className={INPUT_FIELD_STYLE}
                />
            </div>

            {/* QR Code section is removed from editor for minimalism. It will be in Preview Mode. */}

            <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <p><strong>ID:</strong> <span className="font-mono">{item.id.substring(0, 10)}...</span></p>
                <p><strong>Shape:</strong> {item.shape}</p>
                <p><strong>Rotation:</strong> {item.rotation}°</p>
                <p><strong>Provisional:</strong> {item.isProvisional ? 'Yes (Set Number)' : 'No'}</p>
            </div>
        </div>
    );
};

export default TableEditor;