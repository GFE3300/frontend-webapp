// src/features/add_product_modal/subcomponents/ProductTitleInput.jsx
// (Adjust path as necessary)

// 1. Imports
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon'; // Adjust path as needed

/**
 * @component ProductTitleInput
 * @description An inline-editable input field for a product title. It displays text that,
 * when clicked or focused, transforms into an input field. Saves on blur or Enter key.
 * Includes character count and error display.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.initialValue=""] - The initial value of the product title.
 * @param {Function} props.onSave - Callback function invoked when the input loses focus (blur) or
 *   Enter is pressed, and the value has changed from the initial trimmed value.
 *   Receives the trimmed string value as an argument.
 * @param {string} [props.placeholder="Enter Product Name"] - Placeholder text for the input field.
 * @param {number} [props.maxLength=100] - Maximum number of characters allowed in the input.
 * @param {string} [props.label="Product Name"] - Accessible label for the input field.
 * @param {boolean} [props.showLabel=false] - Controls the visibility of the label text above the input.
 *   The `aria-label` or an association via `htmlFor` provides accessibility even if hidden.
 * @param {string} [props.className=""] - Additional CSS classes for the main wrapper div.
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

    const inputRef = useRef(null); // Ref for the <input> element
    const displayRef = useRef(null); // Ref for the display <div> when not editing

    // ===========================================================================
    // Configuration
    // ===========================================================================
    // Base ID for form elements for accessibility
    const baseId = "product-title-input";
    const errorId = `${baseId}-error`;
    const charCountId = `${baseId}-char-count`;

    // ===========================================================================
    // Effects
    // ===========================================================================

    // Effect to update internal state if initialValue prop changes externally
    useEffect(() => {
        // Only update if not currently editing to avoid disrupting user input
        if (!isEditing) {
            setCurrentValue(initialValue);
        }
    }, [initialValue, isEditing]);

    // Effect to focus input and set cursor position when editing mode is activated
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            // Set cursor to the end of the text.
            // Using try-catch as setSelectionRange can sometimes fail in edge cases or specific browsers
            // if the input is not fully ready or visible.
            try {
                const valLength = inputRef.current.value.length;
                inputRef.current.setSelectionRange(valLength, valLength);
            } catch (e) {
                console.warn("Could not set selection range on input: ", e);
            }
        }
    }, [isEditing]); // No dependency on currentValue.length to avoid re-triggering on typing

    // ===========================================================================
    // Validation (for component rendering & derived state)
    // ===========================================================================
    const hasError = !!error; // Boolean flag for error state
    const charsLeft = maxLength - currentValue.length;

    // `onSave` is critical. PropTypes.func.isRequired handles this at dev time.
    // No other runtime validation is strictly necessary for the component to render its initial state.

    // ===========================================================================
    // Event Handlers & Callbacks
    // ===========================================================================

    /**
     * Handles changes to the input field value.
     * Updates `currentValue` state if within `maxLength`.
     */
    const handleInputChange = useCallback((e) => {
        const newValue = e.target.value;
        if (newValue.length <= maxLength) {
            setCurrentValue(newValue);
        }
    }, [maxLength]);

    /**
     * Triggers the save operation.
     * Trims the current value, calls `onSave` if the value has meaningfully changed,
     * and exits editing mode.
     */
    const triggerSave = useCallback(() => {
        const trimmedValue = currentValue.trim();
        const trimmedInitialValue = (initialValue || "").trim();

        // Only call onSave if the trimmed value is different from the trimmed initial value,
        // or if the initial value was empty and now there's content.
        if (trimmedValue !== trimmedInitialValue) {
            onSave(trimmedValue);
        }

        setIsEditing(false);

        // Update currentValue to the trimmed version for display,
        // or to empty if it was and remains effectively empty, to show placeholder.
        if (trimmedValue === "" && trimmedInitialValue === "") {
            setCurrentValue("");
        } else {
            setCurrentValue(trimmedValue);
        }
    }, [currentValue, initialValue, onSave]);

    /**
     * Handles the blur event on the input field.
     * Triggers save operation.
     */
    const handleBlur = useCallback(() => {
        // Using a microtask (setTimeout 0) to allow other click events (e.g. if there was a save button)
        // to register before blurring and saving.
        setTimeout(() => {
            // Check if focus has moved outside the component or to a non-interactive part.
            // This check is a bit complex and might need adjustment based on specific component structure.
            // For this component, direct save on blur is generally fine.
            if (document.activeElement !== inputRef.current) {
                triggerSave();
            }
        }, 0);
    }, [triggerSave]);

    /**
     * Handles keydown events on the input field (Enter for save, Escape to cancel).
     */
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if part of a form
            triggerSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setCurrentValue(initialValue); // Revert to initial value
            setIsEditing(false);
        }
    }, [initialValue, triggerSave]);

    /**
     * Activates the editing mode.
     */
    const activateEditing = useCallback(() => {
        // If there's an error, and the user clicks to edit,
        // we can keep the error visible or clear it.
        // For now, editing implies an attempt to fix, so the error state in input isn't forced by `currentValue`'s error status.
        setCurrentValue(currentValue); // Ensure it uses the latest, possibly untrimmed, value
        setIsEditing(true);
    }, [currentValue]); // current value needed to ensure the input field starts with the current display value.

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <div className={`group relative ${className}`}>
            {/* Optional Visible Label */}
            {showLabel && (
                <label htmlFor={baseId} className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {label}
                </label>
            )}

            {/* Editing State: Input Field */}
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
                        aria-label={label} // Ensure accessible name even if visual label is hidden
                        aria-invalid={hasError}
                        aria-describedby={`${hasError ? errorId : ''} ${charCountId}`.trim()}
                    />
                    {/* Character Count */}
                    <div id={charCountId} className="absolute right-0 top-full mt-1 text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite">
                        {charsLeft} character{charsLeft === 1 ? '' : 's'} remaining
                    </div>
                </div>
            ) : (
                /* Display State: Clickable Text */
                <div
                    ref={displayRef}
                    onClick={activateEditing}
                    onFocus={activateEditing} // Allow focusing with keyboard to edit
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateEditing(); } }}
                    tabIndex={0} // Make it focusable
                    role="button" // Semantically a button that activates editing
                    aria-label={`Edit ${label}. Current value: ${currentValue || placeholder}`}
                    className={`relative w-full max-h-10 cursor-text flex items-center group  /* Adjusted min-h for consistency with input+charcount */
                                border-b-2 py-1 transition-colors duration-200 font-montserrat
                                ${hasError ? 'border-red-500 dark:border-red-400' : 'border-dashed border-transparent group-hover:border-neutral-300 dark:group-hover:border-neutral-600'}`}
                // Dashed border only on hover for cleaner look
                >
                    {/* Displayed Text or Placeholder */}
                    <span className={`text-xl font-semibold break-words w-full
                                    ${currentValue
                            ? (hasError ? 'text-red-600 dark:text-red-500' : 'text-neutral-800 dark:text-neutral-100')
                            : (hasError ? 'text-red-400 dark:text-red-500 placeholder-opacity-100' : 'text-neutral-400 dark:text-neutral-500')
                        }
                                `}>
                        {currentValue || placeholder}
                    </span>
                    {/* Edit Icon (visible on hover/focus) */}
                    <Icon
                        name="edit"
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400 dark:text-neutral-500
                                   opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
                        aria-hidden="true" // Decorative as the div itself has aria-label
                    />
                </div>
            )}

            {/* Error Message Display */}
            {hasError && (
                <p id={errorId} className="mt-2.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1" role="alert"> {/* Increased mt from 1.5 to 2.5 for spacing with char count */}
                    <Icon name="error_outline" className="w-6 h-6 flex-shrink-0" /> {/* Adjusted icon size */}
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
    placeholder: "Enter Product Name",
    maxLength: 100,
    label: "Product Name",
    showLabel: false,
    className: "",
    error: null,
};

export default memo(ProductTitleInput);