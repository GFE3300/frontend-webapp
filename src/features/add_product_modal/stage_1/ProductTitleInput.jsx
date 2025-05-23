import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon'; // Adjust path as needed
import ScriptLines from '../utils/script_lines'; // Import the localization object

/**
 * @component ProductTitleInput
 * @description An inline-editable input field for a product title. It displays text that,
 * when clicked or focused, transforms into an input field. Saves on blur or Enter key.
 * Includes character count and error display.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.initialValue] - The initial value of the product title.
 * @param {Function} props.onSave - Callback function invoked when the input loses focus (blur) or
 *   Enter is pressed, and the value has changed from the initial trimmed value.
 *   Receives the trimmed string value as an argument.
 * @param {string} [props.placeholder] - Placeholder text for the input field.
 * @param {number} [props.maxLength] - Maximum number of characters allowed in the input.
 * @param {string} [props.label] - Accessible label for the input field.
 * @param {boolean} [props.showLabel] - Controls the visibility of the label text above the input.
 * @param {string} [props.className] - Additional CSS classes for the main wrapper div.
 * @param {string} [props.error] - An error message string. If provided, displays an error state and message.
 */
const ProductTitleInput = ({
    initialValue,
    onSave,
    placeholder,
    maxLength,
    label,
    showLabel,
    className,
    error,
}) => {
    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(initialValue);

    const inputRef = useRef(null);
    const displayRef = useRef(null);

    // ===========================================================================
    // Configuration
    // ===========================================================================
    const baseId = "product-title-input";
    const errorId = `${baseId}-error`;
    const charCountId = `${baseId}-char-count`;

    // ===========================================================================
    // Effects
    // ===========================================================================
    useEffect(() => {
        if (!isEditing) {
            setCurrentValue(initialValue);
        }
    }, [initialValue, isEditing]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            try {
                const valLength = inputRef.current.value.length;
                inputRef.current.setSelectionRange(valLength, valLength);
            } catch (e) {
                console.warn(ScriptLines.warnCannotSetSelection, e); // MODIFIED
            }
        }
    }, [isEditing]);

    // ===========================================================================
    // Validation
    // ===========================================================================
    const hasError = !!error;
    const charsLeft = maxLength - currentValue.length;

    // ===========================================================================
    // Event Handlers & Callbacks
    // ===========================================================================
    const handleInputChange = useCallback((e) => {
        const newValue = e.target.value;
        if (newValue.length <= maxLength) {
            setCurrentValue(newValue);
        }
    }, [maxLength]);

    const triggerSave = useCallback(() => {
        const trimmedValue = currentValue.trim();
        const trimmedInitialValue = (initialValue || "").trim();

        if (trimmedValue !== trimmedInitialValue) {
            onSave(trimmedValue);
        }
        setIsEditing(false);
        if (trimmedValue === "" && trimmedInitialValue === "") {
            setCurrentValue("");
        } else {
            setCurrentValue(trimmedValue);
        }
    }, [currentValue, initialValue, onSave]);

    const handleBlur = useCallback(() => {
        setTimeout(() => {
            if (document.activeElement !== inputRef.current) {
                triggerSave();
            }
        }, 0);
    }, [triggerSave]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            triggerSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setCurrentValue(initialValue);
            setIsEditing(false);
        }
    }, [initialValue, triggerSave]);

    const activateEditing = useCallback(() => {
        setCurrentValue(currentValue);
        setIsEditing(true);
    }, [currentValue]);

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    const charCountText = charsLeft === 1
        ? ScriptLines.charCountRemainingSingular
        : ScriptLines.charCountRemainingPlural;

    const displayModeAriaLabel = `${ScriptLines.ariaEditLabelPrefix} ${label}${ScriptLines.ariaEditLabelInfix} ${currentValue || placeholder}`;

    return (
        <div className={`group relative ${className}`}>
            {showLabel && (
                <label htmlFor={baseId} className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {label} {/* Prop 'label' used here, default comes from ScriptLines */}
                </label>
            )}

            {isEditing ? (
                <div className="relative">
                    <input
                        ref={inputRef}
                        id={baseId}
                        type="text"
                        value={currentValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`w-full h-10 appearance-none bg-transparent text-xl font-semibold font-montserrat
                                    text-neutral-800 dark:text-neutral-100
                                    placeholder-neutral-400 dark:placeholder-neutral-500
                                    border-b-2 py-1
                                    focus:outline-none focus:ring-0
                                    transition-colors duration-200
                                    ${hasError
                                ? 'border-red-500 dark:border-red-400'
                                : 'border-neutral-300 dark:border-neutral-600 focus:border-rose-500 dark:focus:border-rose-400'
                            }`}
                        maxLength={maxLength}
                        aria-label={label}
                        aria-invalid={hasError}
                        aria-describedby={`${hasError ? errorId : ''} ${charCountId}`.trim()}
                    />
                    <div id={charCountId} className="absolute right-0 top-full mt-1 text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite">
                        {charsLeft} {charCountText} {/* MODIFIED */}
                    </div>
                </div>
            ) : (
                <div
                    ref={displayRef}
                    onClick={activateEditing}
                    onFocus={activateEditing}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateEditing(); } }}
                    tabIndex={0}
                    role="button"
                    aria-label={displayModeAriaLabel} // MODIFIED
                    className={`relative w-full max-h-10 cursor-text flex items-center group
                                border-b-2 py-1 transition-colors duration-200 font-montserrat
                                ${hasError ? 'border-red-500 dark:border-red-400' : 'border-dashed border-transparent group-hover:border-neutral-300 dark:group-hover:border-neutral-600'}`}
                >
                    <span className={`text-xl font-semibold break-words w-full
                                    ${currentValue
                            ? (hasError ? 'text-red-600 dark:text-red-500' : 'text-neutral-800 dark:text-neutral-100')
                            : (hasError ? 'text-red-400 dark:text-red-500 placeholder-opacity-100' : 'text-neutral-400 dark:text-neutral-500')
                        }
                                `}>
                        {currentValue || placeholder} {/* Prop 'placeholder' used */}
                    </span>
                    <Icon
                        name="edit"
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400 dark:text-neutral-500
                                   opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
                        aria-hidden="true"
                    />
                </div>
            )}

            {hasError && (
                <p id={errorId} className="mt-2.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
                    <Icon name="error_outline" className="w-6 h-6 flex-shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
};

ProductTitleInput.propTypes = {
    initialValue: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    maxLength: PropTypes.number,
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    className: PropTypes.string,
    error: PropTypes.string,
};

ProductTitleInput.defaultProps = {
    initialValue: "",
    // MODIFIED: Default props now use ScriptLines
    placeholder: ScriptLines.placeholder2,
    maxLength: 100,
    label: ScriptLines.label,
    showLabel: false,
    className: "",
    error: null,
};

export default memo(ProductTitleInput);