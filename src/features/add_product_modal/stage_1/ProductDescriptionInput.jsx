// 1. Imports
import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Assuming Icon component path is correct

/**
 * A versatile input component that behaves like an inline editable text area.
 * It displays text initially and transforms into a textarea for editing upon user interaction.
 * Features include automatic height adjustment, character limits, placeholder text,
 * error display, and animated transitions between display and edit modes.
 *
 * @component ProductDescriptionInput
 * @param {object} props - Component properties.
 * @param {string} [props.initialValue=""] - The initial text value for the input.
 * @param {function} props.onSave - Callback function invoked with the trimmed text value when changes are saved (on blur or Escape if reverted). (Required)
 * @param {string} [props.placeholder="Tell your customers about this product..."] - Placeholder text for the textarea.
 * @param {number} [props.maxLength=500] - Maximum number of characters allowed.
 * @param {number} [props.minRows=3] - Minimum number of rows the textarea should display, influencing its initial and minimum height.
 * @param {number} [props.maxHeightPx=200] - Maximum height in pixels the textarea can grow to.
 * @param {string} [props.label="Description"] - A label for the input, primarily for accessibility (e.g., `aria-label`).
 * @param {string} [props.className=""] - Additional CSS classes for the root container.
 * @param {string} [props.error] - An error message string to display. If present, the component will indicate an error state.
 * @param {string} [props.themeColor="rose"] - Theme color for focus rings and other accents.
 * @param {string} [props.editIconName="edit"] - Name of the icon to display as an edit affordance.
 */
const ProductDescriptionInput = ({
    initialValue = "",
    onSave,
    placeholder = "Tell your customers about this product...",
    maxLength = 500,
    minRows = 3,
    maxHeightPx = 200,
    label = "Description",
    className = "",
    error,
    themeColor = "rose", // Added for consistency
    editIconName = "edit",
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const prefersReducedMotion = useReducedMotion();
    const DUMMY_LINE_HEIGHT_PX = 20; // Approximate line height in pixels for `minRows` calculation.
    const PADDING_COMPENSATION_PX = 16; // Approximate vertical padding (py-2.5 * 2) in pixels.

    const THEME_CLASSES = {
        rose: {
            focusRing: 'focus:ring-rose-500',
            borderColorFocus: 'focus:border-rose-500',
        },
        // Add other themes if needed
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const animationVariants = {
        viewSwitch: { // For switching between display and editing views
            initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 },
            transition: { duration: prefersReducedMotion ? 0 : 0.25, ease: "easeInOut" }
        },
        errorDisplay: { // For the error message itself
            initial: { opacity: 0, y: -10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
            exit: { opacity: 0, y: -5, transition: { duration: 0.15, ease: 'easeIn' } }
        }
    };

    // Base CSS classes for both display and textarea to maintain similar box model and appearance.
    const commonBoxClasses = `w-full text-sm border rounded-xl py-2.5 px-3.5 transition-all duration-200 shadow-sm dark:shadow-md`; // Updated to rounded-xl and consistent padding

    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(initialValue);
    const textareaRef = useRef(null);
    const displayWrapperRef = useRef(null);

    // ===========================================================================
    // Effects
    // ===========================================================================
    // Sync internal value with `initialValue` prop if it changes externally.
    useEffect(() => {
        setCurrentValue(initialValue);
    }, [initialValue]);

    // Auto-adjust textarea height and manage focus when entering edit mode.
    const adjustTextareaHeight = useCallback((element) => {
        if (!element) return;
        element.style.height = 'auto'; // Reset height to allow shrinking.
        const scrollHeight = element.scrollHeight;
        const minHeightFromRows = (minRows * DUMMY_LINE_HEIGHT_PX) + PADDING_COMPENSATION_PX;
        element.style.height = `${Math.min(Math.max(scrollHeight, minHeightFromRows), maxHeightPx)}px`;
    }, [minRows, maxHeightPx, DUMMY_LINE_HEIGHT_PX, PADDING_COMPENSATION_PX]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            adjustTextareaHeight(textareaRef.current);
            // Place cursor at the end of the text.
            textareaRef.current.setSelectionRange(currentValue.length, currentValue.length);
        }
    }, [isEditing, currentValue, adjustTextareaHeight]); // adjustTextareaHeight is memoized

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleInputChange = useCallback((e) => {
        const newValue = e.target.value;
        if (newValue.length <= maxLength) {
            setCurrentValue(newValue);
            adjustTextareaHeight(e.target); // Adjust height as user types.
        }
    }, [maxLength, adjustTextareaHeight]);

    const triggerSave = useCallback(() => {
        const trimmedValue = currentValue.trim();
        // Call onSave only if the value has meaningfully changed.
        if (trimmedValue !== (initialValue || "").trim()) {
            onSave(trimmedValue);
        }
        setIsEditing(false);
        // Update internal state to reflect the saved (or reverted if unchanged) value.
        // If value became empty and initial was also effectively empty, keep it visually empty.
        setCurrentValue(trimmedValue === "" && (initialValue || "").trim() === "" ? "" : trimmedValue);
    }, [currentValue, initialValue, onSave]);

    const handleBlur = useCallback((e) => {
        // Save on blur only if focus moves outside the component itself.
        // This prevents saving if, for example, a button within the component was clicked.
        // (Though this component currently has no such internal buttons).
        if (!e.currentTarget.contains(e.relatedTarget)) {
            triggerSave();
        }
    }, [triggerSave]);

    const handleDisplayClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            e.preventDefault(); // Prevent potential modal close if Escape is also used for that.
            setCurrentValue(initialValue); // Revert to original value.
            setIsEditing(false); // Exit editing mode.
        }
        // Example: Ctrl+Enter or Cmd+Enter to save
        // if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        //     e.preventDefault();
        //     triggerSave();
        // }
    }, [initialValue]); // Removed setIsEditing and triggerSave from deps as they're stable

    // ===========================================================================
    // Derived State / Calculations
    // ===========================================================================
    const charsLeft = maxLength - currentValue.length;
    const hasError = !!error; // Boolean flag for error state.
    const hasActualContent = currentValue.trim().length > 0;

    // Calculate minimum height style dynamically based on minRows.
    const minHeightStyle = useMemo(() => ({
        minHeight: `${(minRows * 1.5) + 2}rem` // Approx. 1.5rem line-height + 1rem total py padding (py-2 is .5rem * 2)
    }), [minRows]);

    // ===========================================================================
    // Validation Logic (Props Validation)
    // ===========================================================================
    if (typeof onSave !== 'function') {
        console.error('ProductDescriptionInput: `onSave` prop is required and must be a function.');
        return (
            <div className={`${className} ${commonBoxClasses} opacity-50 cursor-not-allowed border-red-500 p-4`} title="Component Misconfigured: onSave handler missing">
                Error: Component misconfiguration. Cannot save input.
            </div>
        );
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <div className={`product-description-input-root relative font-montserrat ${className}`}>
            {/* Animated container for switching between editing and display modes */}
            <AnimatePresence mode="wait">
                {isEditing ? (
                    // Editing mode: Textarea
                    <motion.div
                        key="editing-description"
                        className="relative"
                        variants={animationVariants.viewSwitch}
                        initial="initial" animate="animate" exit="exit"
                    >
                        <textarea
                            ref={textareaRef}
                            id="product-description-input-field" // Unique ID for label association
                            value={currentValue}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={`${commonBoxClasses} appearance-none bg-white dark:bg-neutral-750 
                                        text-neutral-800 dark:text-neutral-100 
                                        placeholder-neutral-400 dark:placeholder-neutral-500
                                        focus:outline-none focus:ring-2 resize-none overflow-y-auto 
                                        scrollbar-thin scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent scrollbar-thumb-rounded-full
                                        ${hasError
                                    ? `border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400`
                                    : `border-neutral-300 dark:border-neutral-600 ${currentTheme.borderColorFocus} ${currentTheme.focusRing}`
                                }`}
                            maxLength={maxLength}
                            style={{ minHeight: `${(minRows * DUMMY_LINE_HEIGHT_PX) + PADDING_COMPENSATION_PX}px` }} // More precise min-height
                            aria-label={label} // Main label for the textarea
                            aria-describedby={hasError ? "product-description-error-msg" : "product-description-char-count-msg"}
                            aria-invalid={hasError}
                        />
                        {/* Character count display */}
                        <div id="product-description-char-count-msg" className="absolute right-3 bottom-2.5 text-xs text-neutral-500 dark:text-neutral-400 pointer-events-none">
                            {charsLeft >= 0 ? charsLeft : <span className="text-red-500">{Math.abs(charsLeft)} over</span>}
                        </div>
                    </motion.div>
                ) : (
                    // Display mode: Clickable text block
                    <motion.div
                        key="display-description"
                        ref={displayWrapperRef}
                        onClick={handleDisplayClick}
                        onFocus={handleDisplayClick} // Allow focusing with keyboard to activate editing
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDisplayClick(); }}
                        tabIndex={0} // Make it focusable
                        role="button" // Semantically a button that activates editing
                        aria-label={`Edit ${label}. Current value: ${currentValue || 'empty'}`}
                        className={`${commonBoxClasses} cursor-text group bg-white dark:bg-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-700/80
                                    flex items-start justify-between relative 
                                    ${hasError
                                ? 'border-red-400/80 dark:border-red-500/80 hover:border-red-500 dark:hover:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                            }`}
                        style={minHeightStyle} // Apply calculated min-height
                        variants={animationVariants.viewSwitch}
                        initial="initial" animate="animate" exit="exit"
                    >
                        {/* Text content, styled differently if it's just the placeholder */}
                        <p className={`whitespace-pre-wrap break-words flex-grow pt-px 
                                        ${hasActualContent
                                ? 'text-neutral-800 dark:text-neutral-100'
                                : 'text-neutral-400 dark:text-neutral-500 italic' // Placeholder style
                            }
                                        ${hasError && hasActualContent ? 'text-red-700 dark:text-red-400' : ''}
                                        ${hasError && !hasActualContent ? 'text-red-500/80 dark:text-red-400/80' : ''}
                                        `}>
                            {hasActualContent ? currentValue : placeholder}
                        </p>
                        {/* Edit icon affordance */}
                        <Icon
                            name={editIconName}
                            className="w-6 h-6 text-neutral-400 dark:text-neutral-500 ml-2 flex-shrink-0 
                                       opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Animated error message display below the input/display area */}
            <AnimatePresence>
                {hasError && (
                    <motion.p
                        id="product-description-error-msg"
                        className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 px-1"
                        role="alert"
                        variants={animationVariants.errorDisplay}
                        initial="initial" animate="animate" exit="exit"
                    >
                        <Icon name="error_outline" className="w-3.5 h-3.5 flex-shrink-0" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

ProductDescriptionInput.propTypes = {
    initialValue: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    maxLength: PropTypes.number,
    minRows: PropTypes.number,
    maxHeightPx: PropTypes.number,
    label: PropTypes.string,
    className: PropTypes.string,
    error: PropTypes.string,
    themeColor: PropTypes.oneOf(['rose' /*, add other themes here */]),
    editIconName: PropTypes.string,
};

ProductDescriptionInput.defaultProps = {
    initialValue: "",
    placeholder: "Tell your customers about this product...",
    maxLength: 500,
    minRows: 3,
    maxHeightPx: 200,
    label: "Description",
    className: "",
    error: null, // Default to null for no error
    themeColor: "rose",
    editIconName: "edit",
};

export default memo(ProductDescriptionInput);