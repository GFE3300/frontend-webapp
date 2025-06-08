import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';
import { scriptLines_ProductsTable as scriptLines } from '../utils/script_lines.js';

const EditableCell = ({ initialValue, onSave, cellType = 'text', productId, fieldKey }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const inputRef = useRef(null);
    const cellRef = useRef(null);

    useEffect(() => {
        setValue(initialValue);
        setError('');
    }, [initialValue]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (cellType === 'text' || cellType === 'editableText') {
                setTimeout(() => inputRef.current?.select(), 0);
            }
        }
    }, [isEditing, cellType]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleOpenEditMode = () => {
        if (isSaving || isEditing) return;
        setValue(initialValue);
        setError('');
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (isSaving) return;

        const processedValue = typeof value === 'string' ? value.trim() : value;
        const processedInitialValue = typeof initialValue === 'string' ? initialValue?.trim() : initialValue;

        setError('');
        if (processedValue !== processedInitialValue) {

            if (cellType === 'currency' || cellType === 'editableCurrency') {
                const numValue = parseFloat(processedValue);
                if (isNaN(numValue)) {
                    setError(scriptLines.editableCell.errors.invalidNumber);
                    return;
                }
                if (numValue < 0 && (fieldKey === 'selling_price_excl_tax' || fieldKey === 'labor_overhead_cost')) {
                    setError(scriptLines.editableCell.errors.negativeValue);
                    return;
                }
            }
            if (fieldKey === 'name' && String(processedValue).trim() === '') {
                setError(scriptLines.editableCell.errors.nameCannotBeEmpty);
                return;
            }

            setIsSaving(true);
            try {
                const valueToSave = (cellType.startsWith('editableCurrency') || cellType === 'currency') ? parseFloat(processedValue) : processedValue;
                await onSave(productId, fieldKey, valueToSave);
                setIsEditing(false);
                setShowSuccess(true);
            } catch (err) {
                console.error("Failed to save cell:", err);
                const backendError = err.response?.data;
                let errorMessage = scriptLines.editableCell.errors.saveFailed;
                if (backendError) {
                    if (backendError[fieldKey] && Array.isArray(backendError[fieldKey])) {
                        errorMessage = backendError[fieldKey][0];
                    } else if (backendError.detail) {
                        errorMessage = backendError.detail;
                    } else if (typeof backendError === 'string') {
                        errorMessage = backendError;
                    } else {
                        // Fallback for complex error objects
                        const firstKey = Object.keys(backendError)[0];
                        if (firstKey && Array.isArray(backendError[firstKey])) {
                            errorMessage = `${firstKey}: ${backendError[firstKey][0]}`;
                        } else {
                            errorMessage = JSON.stringify(backendError);
                        }
                    }
                } else if (err.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);

            } finally {
                setIsSaving(false);
            }
        } else {
            setIsEditing(false);
            setError('');
        }
    };

    const handleCancelEdit = () => {
        setValue(initialValue);
        setError('');
        setIsEditing(false);
        setIsSaving(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEdit();
        }
    };

    if (isEditing) {
        return (
            <div className="relative w-full" ref={cellRef}>
                <div className="relative flex items-center justify-between w-full">
                    <input
                        ref={inputRef}
                        type={(cellType === 'currency' || cellType === 'editableCurrency') ? 'number' : 'text'}
                        value={value === null || value === undefined ? '' : value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={(e) => {
                            if (cellRef.current && !cellRef.current.contains(e.relatedTarget)) {
                                handleSave();
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={isSaving}
                        className={`w-full py-1 px-2 text-sm border rounded-md font-montserrat bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-400 dark:focus:ring-red-300 pr-8' : 'border-neutral-300 dark:border-neutral-600 focus:ring-rose-500 dark:focus:ring-rose-400'} ${isSaving ? 'pr-8' : ''}`}
                        step={(cellType === 'currency' || cellType === 'editableCurrency') ? "0.01" : undefined}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${fieldKey}-error` : undefined}
                    />
                    {isSaving && (<div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center"><Spinner size="xs" /></div>)}
                    {error && !isSaving && (<div className="absolute p-1 w-6 h-6 top-1/2 right-2 transform -translate-y-1/2 text-red-500 dark:text-red-400" title={error}><Icon name="error_outline" className="w-4 h-4" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 400, grade: 0, opsz: 18 }} /></div>)}
                </div>
                {error && (<p id={`${fieldKey}-error`} className="absolute text-xs text-red-600 dark:text-red-400 mt-0.5 left-0 whitespace-nowrap font-montserrat">{error}</p>)}
            </div>
        );
    }

    const isEmpty = value === null || value === undefined || String(value).trim() === '';

    let displayValue = isEmpty ? <span className="italic text-neutral-400 dark:text-neutral-500">{scriptLines.editableCell.emptyPlaceholder}</span> : String(value);

    if (!isEmpty && (cellType === 'currency' || cellType === 'editableCurrency')) {
        const num = parseFloat(value);
        displayValue = isNaN(num) ? <span className="italic text-red-500 dark:text-red-400">{scriptLines.editableCell.errors.invalidNumberShort}</span> : `$${num.toFixed(2)}`;
    }

    return (
        <div
            ref={cellRef}
            onClick={handleOpenEditMode}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenEditMode(); }}
            role="button"
            tabIndex={0}
            className={`group relative w-full min-h-[28px] flex items-center justify-between px-2 py-1 rounded-md cursor-pointer font-montserrat transition-all duration-150 ease-in-out text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:focus:ring-rose-400 ${showSuccess ? 'ring-2 ring-green-500 dark:ring-green-400 shadow-md' : 'ring-transparent'}`}

            title={isEditing ? undefined : scriptLines.editableCell.editTooltip.replace('{fieldKey}', fieldKey)}
        >
            <span className="truncate flex-grow">{displayValue}</span>
            {!isEditing && !isSaving && (
                <Icon name="edit" className="w-4 h-4 text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex-shrink-0 ml-2" style={{ fontSize: '1rem' }} />
            )}
        </div>
    );
};

EditableCell.propTypes = {
    initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSave: PropTypes.func.isRequired,
    cellType: PropTypes.oneOf(['text', 'currency', 'editableText', 'editableCurrency']),
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fieldKey: PropTypes.string.isRequired,
};

export default EditableCell;