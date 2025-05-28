import React from 'react';

const DoorPropertiesEditor = ({
    item, // The selected door item object: { id, itemType, shape, swingDirection, isOpen, rotation, ... }
    onUpdateItemProperty, // Function: (itemId, { property: value }) => boolean
}) => {
    // Ensure this editor is only used for 'placedDoor' items.
    if (!item || item.itemType !== 'placedDoor') {
        // This check is a safeguard. ItemPropertiesPanel should dispatch correctly.
        console.warn("DoorPropertiesEditor rendered with an invalid item type:", item);
        return (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-700 font-medium">Error: Invalid item for Door Editor.</p>
                <p className="text-xxs text-red-600">Expected itemType 'placedDoor'.</p>
            </div>
        );
    }

    const handleSwingDirectionChange = (e) => {
        onUpdateItemProperty(item.id, { swingDirection: e.target.value });
    };

    // This handles the change from a standard checkbox.
    // If using a custom ToggleSwitch, adapt its onChange prop.
    const handleIsOpenChange = (e) => {
        onUpdateItemProperty(item.id, { isOpen: e.target.checked });
    };

    return (
        <div className="space-y-4 p-1 text-sm text-slate-700">
            {/* Swing Direction Control */}
            <div>
                <label htmlFor={`door-swing-${item.id}`} className="block text-xs font-medium text-slate-600 mb-1">
                    Swing Direction:
                </label>
                <select
                    id={`door-swing-${item.id}`}
                    name="swingDirection"
                    value={item.swingDirection || 'left'} // Default to 'left' if undefined
                    onChange={handleSwingDirectionChange}
                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-xs focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none"
                // Add custom arrow styling if desired, or use a custom SelectField component
                >
                    <option value="left">Left Swing</option>
                    <option value="right">Right Swing</option>
                    {/* Future options like 'double', 'sliding-left', 'sliding-right' could be added here */}
                </select>
            </div>

            {/* Is Open (Visual State) Control */}
            <div>
                <label htmlFor={`door-isOpen-${item.id}`} className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-600 mt-1">
                    <input
                        type="checkbox"
                        id={`door-isOpen-${item.id}`}
                        name="isOpen"
                        checked={item.isOpen || false} // Default to false if undefined
                        onChange={handleIsOpenChange}
                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded border-slate-400 focus:ring-indigo-500"
                    />
                    <span>Visually Open in Designer</span>
                </label>
                <p className="text-xxs text-slate-500 mt-0.5 pl-6">
                    This only affects the door's appearance on the design canvas.
                </p>
            </div>

            {/* Read-only Information Section */}
            <div className="text-xs text-slate-500 space-y-1 mt-4 pt-3 border-t border-slate-200">
                <p><strong>ID:</strong> <span className="font-mono text-slate-400">{item.id.substring(5, 12)}</span></p>
                <p><strong>Type:</strong> <span className="font-medium text-slate-600">{item.shape || 'Standard Door'}</span></p>
                <p><strong>Rotation:</strong> <span className="font-medium text-slate-600">{item.rotation}°</span></p>
            </div>
        </div>
    );
};

export default DoorPropertiesEditor;