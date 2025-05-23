// frontend/src/features/products_table/subcomponents/EditableCell.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';

const EditableCell = ({ initialValue, onSave, cellType = 'text', productId, fieldKey }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState(''); // For displaying errors
    const inputRef = useRef(null);

    useEffect(() => {
        setValue(initialValue);
        setError(''); // Clear error when initialValue changes (e.g., data refresh)
    }, [initialValue]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (cellType === 'text' || cellType === 'editableText') { // Added editableText
                inputRef.current.select();
            }
        }
    }, [isEditing, cellType]);

    const handleSave = async () => {
        setError(''); // Clear previous errors
        if (value !== initialValue) {
            if (cellType === 'currency' || cellType === 'editableCurrency') { // Added editableCurrency
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    setError("Invalid number.");
                    // setValue(initialValue); // Optionally revert immediately or let user correct
                    setIsEditing(true); // Keep editing open
                    return;
                }
                if (numValue < 0 && (fieldKey === 'selling_price_excl_tax' || fieldKey === 'labor_overhead_cost')) {
                    setError("Price/Cost cannot be negative.");
                    setIsEditing(true);
                    return;
                }
            }
            if (fieldKey === 'name' && !value.trim()) {
                setError("Name cannot be empty.");
                setIsEditing(true);
                return;
            }

            try {
                await onSave(productId, fieldKey, cellType.startsWith('editableCurrency') ? parseFloat(value) : value);
                setIsEditing(false);
            } catch (err) {
                console.error("Failed to save cell:", err);
                // Assuming err.message or similar contains backend validation
                setError(err.response?.data?.detail || err.message || "Save failed.");
                // Don't revert value immediately, let user see error and correct or Escape
                // setValue(initialValue); // Revert on failed save if desired
                setIsEditing(true); // Keep editing open to show error
            }
        } else {
            setIsEditing(false); // No change, just close
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if cell is in a form
            handleSave();
        } else if (e.key === 'Escape') {
            setValue(initialValue);
            setError('');
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="relative w-full">
                <input
                    ref={inputRef}
                    type={(cellType === 'currency' || cellType === 'editableCurrency') ? 'number' : 'text'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleSave} // Save on blur
                    onKeyDown={handleKeyDown}
                    className={`w-full px-1 py-0.5 text-sm border rounded bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100
                                ${error ? 'border-red-500 ring-red-500' : 'border-rose-500 focus:ring-rose-500'}`}
                    step={(cellType === 'currency' || cellType === 'editableCurrency') ? "0.01" : undefined}
                />
                {error && <p className="absolute text-xs text-red-500 -bottom-4 left-0">{error}</p>}
            </div>
        );
    }

    const displayValue = (cellType === 'currency' || cellType === 'editableCurrency')
        ? `$${parseFloat(value || 0).toFixed(2)}`
        : (value === null || value === undefined || value === '' ? <span className="italic text-neutral-400">N/A</span> : value);

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-700/20 p-1 rounded group relative min-h-[24px] w-full" // min-h to prevent layout shift
        >
            {displayValue}
            <Icon name="edit" className="w-3 h-3 text-neutral-400 dark:text-neutral-500 absolute top-1/2 right-1 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

EditableCell.propTypes = {
    initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Allow null/undefined
    onSave: PropTypes.func.isRequired, // (productId, fieldKey, newValue) => Promise<void>
    cellType: PropTypes.oneOf(['text', 'currency', 'editableText', 'editableCurrency']),
    productId: PropTypes.string.isRequired,
    fieldKey: PropTypes.string.isRequired,
};

export default EditableCell;