import React, { useState, useEffect } from 'react';

const CounterPropertiesEditor = ({
    item,
    onUpdateItemProperty,
}) => {

    // Local state for debounced input or direct updates if preferred
    const [labelInput, setLabelInput] = useState(item.label || '');
    const [lengthInput, setLengthInput] = useState(String(item.length_units || '1')); // Ensure it's a string for input

    // Update local state if item props change externally (e.g., undo/redo)
    useEffect(() => {
        setLabelInput(item.label || '');
    }, [item.label]);

    useEffect(() => {
        setLengthInput(String(item.length_units || '1'));
    }, [item.length_units]);


    const handleLabelChange = (e) => {
        const newLabel = e.target.value;
        setLabelInput(newLabel);
        // Optionally debounce this or update on blur
        onUpdateItemProperty(item.id, { label: newLabel });
    };

    const handleLabelBlur = () => {
        // If not updating on change, update on blur
        // onUpdateItemProperty(item.id, { label: labelInput });
    };

    const handleLengthChange = (e) => {
        const newLengthStr = e.target.value;
        setLengthInput(newLengthStr); // Keep input as string for controlled component

        // Validate and update immediately or on blur/debounce
        // For immediate update with validation:
        const newLengthNum = parseInt(newLengthStr, 10);
        if (newLengthStr === '' || (!isNaN(newLengthNum) && newLengthNum >= 1)) {
            // Pass the validated number or a default if empty (hook handles '1' if empty string for length)
            onUpdateItemProperty(item.id, { length: newLengthStr === '' ? '1' : String(newLengthNum) });
        } else if (newLengthStr !== '' && (isNaN(newLengthNum) || newLengthNum < 1)) {
            // If invalid and not empty, revert or alert. The hook should also handle this.
            // For safety, could reset input or let the hook's alert guide user.
            // This example updates with potentially invalid string, relying on hook to validate.
            onUpdateItemProperty(item.id, { length: newLengthStr });
        }
    };

    const handleLengthBlur = () => {
        // If only updating on blur, this is where the call to onUpdateItemProperty would go
        // with more robust validation and clamping of lengthInput before sending.
        // Example:
        let finalLength = parseInt(lengthInput, 10);
        if (isNaN(finalLength) || finalLength < 1) {
            finalLength = 1; // Default to 1 if invalid
        }
        setLengthInput(String(finalLength)); // Update local state to reflect clamped value
        if (String(finalLength) !== String(item.length_units || '1')) {
            onUpdateItemProperty(item.id, { length: String(finalLength) });
        }
    };

    if (!item || !(item.decorType && item.decorType.startsWith('counter-'))) {
        // Safeguard: This editor should only be for counters.
        console.warn("CounterPropertiesEditor rendered with an invalid item type:", item);
        return (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-700 font-medium">Error: Invalid item for Counter Editor.</p>
                <p className="text-xxs text-red-600">Expected a 'counter-' decorType.</p>
            </div>
        );
    }


    return (
        <div className="space-y-4 p-1 text-sm text-slate-700">
            {/* Label Input */}
            <div>
                <label htmlFor={`counter-label-${item.id}`} className="block text-xs font-medium text-slate-600 mb-1">
                    Label (Optional):
                </label>
                <input
                    type="text"
                    id={`counter-label-${item.id}`}
                    name="label"
                    value={labelInput}
                    onChange={handleLabelChange}
                    onBlur={handleLabelBlur} // Use if you prefer update on blur
                    placeholder="e.g., Main Bar, Coffee Station"
                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-xs focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
            </div>

            {/* Length Units Input */}
            <div>
                <label htmlFor={`counter-length-${item.id}`} className="block text-xs font-medium text-slate-600 mb-1">
                    Length (in Major Grid Units):
                </label>
                <input
                    type="number" // Using number type for better UX on some devices
                    id={`counter-length-${item.id}`}
                    name="length_units" // This name matches the property expected by the hook
                    value={lengthInput}
                    onChange={handleLengthChange}
                    onBlur={handleLengthBlur} // Recommended for final validation/update
                    min="1" // Semantic minimum for length
                    placeholder="e.g., 2"
                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-xs focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
                <p className="text-xxs text-slate-500 mt-0.5">
                    Defines how many major grid cells long the counter is.
                </p>
            </div>

            {/* Read-only Information Section */}
            <div className="text-xs text-slate-500 space-y-1 mt-4 pt-3 border-t border-slate-200">
                <p><strong>ID:</strong> <span className="font-mono text-slate-400">{item.id.substring(5, 12)}</span></p>
                <p><strong>Decor Type:</strong> <span className="font-medium text-slate-600">{item.decorType}</span></p>
                <p><strong>Rotation:</strong> <span className="font-medium text-slate-600">{item.rotation}°</span></p>
                {import.meta.env.NODE_ENV === 'development' && ( // Show detailed dimensions in dev
                    <>
                        <p><strong>Stored Length Units:</strong> <span className="font-medium text-slate-600">{item.length_units || 'N/A'}</span></p>
                        <p><strong>Actual w_minor:</strong> <span className="font-medium text-slate-600">{item.w_minor}</span></p>
                        <p><strong>Actual h_minor:</strong> <span className="font-medium text-slate-600">{item.h_minor}</span></p>
                    </>
                )}
            </div>
        </div>
    );
};

export default CounterPropertiesEditor;