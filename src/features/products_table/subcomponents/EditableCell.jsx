import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';

const EditableCell = ({ initialValue, onSave, cellType = 'text', productId, fieldKey }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false); // New state for saving
    const inputRef = useRef(null);

    useEffect(() => {
        setValue(initialValue);
        setError('');
    }, [initialValue]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (cellType === 'text' || cellType === 'editableText') {
                inputRef.current.select();
            }
        }
    }, [isEditing, cellType]);

    const handleSave = async () => {
        if (isSaving) return; // Prevent multiple saves

        setError('');
        if (value !== initialValue) {
            if (cellType === 'currency' || cellType === 'editableCurrency') {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    setError("Invalid number.");
                    setIsEditing(true);
                    return;
                }
                if (numValue < 0 && (fieldKey === 'selling_price_excl_tax' || fieldKey === 'labor_overhead_cost')) {
                    setError("Price/Cost cannot be negative.");
                    setIsEditing(true);
                    return;
                }
            }
            if (fieldKey === 'name' && String(value).trim() === '') { // Ensure value is string for trim
                setError("Name cannot be empty.");
                setIsEditing(true);
                return;
            }

            setIsSaving(true);
            try {
                await onSave(productId, fieldKey, cellType.startsWith('editableCurrency') ? parseFloat(value) : value);
                setIsEditing(false);
            } catch (err) {
                console.error("Failed to save cell:", err);
                setError(err.response?.data?.detail || err.response?.data?.[fieldKey]?.[0] || err.message || "Save failed.");
                setIsEditing(true);
            } finally {
                setIsSaving(false);
            }
        } else {
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            setValue(initialValue);
            setError('');
            setIsEditing(false);
            setIsSaving(false); // Ensure saving is reset
        }
    };

    const openEditor = () => {
        if (isSaving) return; // Don't open if currently involved in a save elsewhere (e.g. blur then click)
        setIsEditing(true);
    }

    if (isEditing) {
        return (
            <div className="relative w-full">
                <input
                    ref={inputRef}
                    type={(cellType === 'currency' || cellType === 'editableCurrency') ? 'number' : 'text'}
                    value={value === null || value === undefined ? '' : value} // Handle null/undefined for input
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    disabled={isSaving}
                    className={`w-full px-1 py-0.5 text-sm border rounded bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100
                                ${error ? 'border-red-500 ring-red-500' : 'border-rose-500 focus:ring-rose-500'}
                                ${isSaving ? 'pr-7' : ''}`} // Make space for spinner
                    step={(cellType === 'currency' || cellType === 'editableCurrency') ? "0.01" : undefined}
                />
                {isSaving && (
                    <div className="absolute top-1/2 right-1.5 transform -translate-y-1/2">
                        <Spinner size="xs" />
                    </div>
                )}
                {error && <p className="absolute text-xs text-red-500 -bottom-4 left-0 whitespace-nowrap">{error}</p>}
            </div>
        );
    }

    const displayValue = (cellType === 'currency' || cellType === 'editableCurrency')
        ? `$${parseFloat(value || 0).toFixed(2)}`
        : (value === null || value === undefined || String(value).trim() === '' ? <span className="italic text-neutral-400">N/A</span> : String(value));

    return (
        <div
            onClick={openEditor}
            className="cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-700/20 p-1 rounded group relative min-h-[24px] w-full flex items-center justify-between"
        >
            <span className="truncate">{displayValue}</span>
            {!isSaving && <Icon name="edit" className="w-3 h-3 text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />}
            {isSaving && <Spinner size="xs" className="flex-shrink-0 ml-1" />} {/* Show spinner in non-editing view too if needed, usually not */}
        </div>
    );
};

EditableCell.propTypes = {
    initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSave: PropTypes.func.isRequired,
    cellType: PropTypes.oneOf(['text', 'currency', 'editableText', 'editableCurrency']),
    productId: PropTypes.string.isRequired,
    fieldKey: PropTypes.string.isRequired,
};

export default EditableCell;