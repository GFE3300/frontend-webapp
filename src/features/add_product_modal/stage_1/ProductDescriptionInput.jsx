// src/features/add_product_modal/subcomponents/ProductDescriptionInput.jsx

// 1. Imports
import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Assuming Icon component path is correct
import ScriptLines from '../utils/script_lines'; // Import the localization object

/**
 * A versatile input component that behaves like an inline editable text area.
 * It displays text initially and transforms into a textarea for editing upon user interaction.
 * Features include automatic height adjustment, character limits, placeholder text,
 * error display, and animated transitions between display and edit modes.
 *
 * @component ProductDescriptionInput
 * @param {object} props - Component properties.
 * @param {string} [props.initialValue] - The initial text value for the input.
 * @param {function} props.onSave - Callback function invoked with the trimmed text value when changes are saved. (Required)
 * @param {string} [props.placeholder] - Placeholder text for the textarea.
 * @param {number} [props.maxLength] - Maximum number of characters allowed.
 * @param {number} [props.minRows] - Minimum number of rows the textarea should display.
 * @param {number} [props.maxHeightPx] - Maximum height in pixels the textarea can grow to.
 * @param {string} [props.label] - A label for the input, primarily for accessibility.
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {string} [props.error] - An error message string to display.
 * @param {string} [props.themeColor] - Theme color for focus rings and other accents.
 * @param {string} [props.editIconName] - Name of the icon to display as an edit affordance.
 */
const ProductDescriptionInput = ({
    initialValue,
    onSave,
    placeholder,
    maxLength,
    minRows,
    maxHeightPx,
    label,
    className,
    error,
    themeColor,
    editIconName,
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const prefersReducedMotion = useReducedMotion();
    const DUMMY_LINE_HEIGHT_PX = 20;
    const PADDING_COMPENSATION_PX = 16;

    const THEME_CLASSES = {
        rose: {
            focusRing: 'focus:ring-rose-500',
            borderColorFocus: 'focus:border-rose-500',
        },
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const animationVariants = {
        viewSwitch: {
            initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 },
            transition: { duration: prefersReducedMotion ? 0 : 0.25, ease: "easeInOut" }
        },
        errorDisplay: {
            initial: { opacity: 0, y: -10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
            exit: { opacity: 0, y: -5, transition: { duration: 0.15, ease: 'easeIn' } }
        }
    };

    const commonBoxClasses = `w-full text-sm border rounded-xl py-2.5 px-3.5 transition-all duration-200 shadow-sm dark:shadow-md`;

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
    useEffect(() => {
        setCurrentValue(initialValue);
    }, [initialValue]);

    const adjustTextareaHeight = useCallback((element) => {
        if (!element) return;
        element.style.height = 'auto';
        const scrollHeight = element.scrollHeight;
        const minHeightFromRows = (minRows * DUMMY_LINE_HEIGHT_PX) + PADDING_COMPENSATION_PX;
        element.style.height = `${Math.min(Math.max(scrollHeight, minHeightFromRows), maxHeightPx)}px`;
    }, [minRows, maxHeightPx, DUMMY_LINE_HEIGHT_PX, PADDING_COMPENSATION_PX]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            adjustTextareaHeight(textareaRef.current);
            textareaRef.current.setSelectionRange(currentValue.length, currentValue.length);
        }
    }, [isEditing, currentValue, adjustTextareaHeight]);

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleInputChange = useCallback((e) => {
        const newValue = e.target.value;
        if (newValue.length <= maxLength) {
            setCurrentValue(newValue);
            adjustTextareaHeight(e.target);
        }
    }, [maxLength, adjustTextareaHeight]);

    const triggerSave = useCallback(() => {
        const trimmedValue = currentValue.trim();
        if (trimmedValue !== (initialValue || "").trim()) {
            onSave(trimmedValue);
        }
        setIsEditing(false);
        setCurrentValue(trimmedValue === "" && (initialValue || "").trim() === "" ? "" : trimmedValue);
    }, [currentValue, initialValue, onSave]);

    const handleBlur = useCallback((e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            triggerSave();
        }
    }, [triggerSave]);

    const handleDisplayClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            setCurrentValue(initialValue);
            setIsEditing(false);
        }
    }, [initialValue]);

    // ===========================================================================
    // Derived State / Calculations
    // ===========================================================================
    const charsLeft = maxLength - currentValue.length;
    const hasError = !!error;
    const hasActualContent = currentValue.trim().length > 0;

    const minHeightStyle = useMemo(() => ({
        minHeight: `${(minRows * 1.5) + 2}rem`
    }), [minRows]);

    // ===========================================================================
    // Validation Logic (Props Validation)
    // ===========================================================================
    if (typeof onSave !== 'function') {
        console.error('ProductDescriptionInput: `onSave` prop is required and must be a function.');
        return (
            <div
                className={`${className} ${commonBoxClasses} opacity-50 cursor-not-allowed border-red-500 p-4`}
                title={ScriptLines.errorMissingOnSaveTitle} // MODIFIED
            >
                {ScriptLines.errorMissingOnSave} {/* MODIFIED */}
            </div>
        );
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    const displayModeAriaLabel = `${ScriptLines.ariaEditLabelPrefix} ${label}${ScriptLines.ariaEditLabelInfix} ${currentValue || ScriptLines.ariaEditLabelValueEmpty}`;

    return (
        <div className={`product-description-input-root relative font-montserrat ${className}`}>
            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div
                        key="editing-description"
                        className="relative"
                        variants={animationVariants.viewSwitch}
                        initial="initial" animate="animate" exit="exit"
                    >
                        <textarea
                            ref={textareaRef}
                            id="product-description-input-field"
                            value={currentValue}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder} // Prop 'placeholder' is used, default comes from scriptLines
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
                            style={{ minHeight: `${(minRows * DUMMY_LINE_HEIGHT_PX) + PADDING_COMPENSATION_PX}px` }}
                            aria-label={label} // Prop 'label' is used, default comes from scriptLines
                            aria-describedby={hasError ? "product-description-error-msg" : "product-description-char-count-msg"}
                            aria-invalid={hasError}
                        />
                        <div id="product-description-char-count-msg" className="absolute right-3 bottom-2.5 text-xs text-neutral-500 dark:text-neutral-400 pointer-events-none">
                            {charsLeft >= 0 ? charsLeft : <span className="text-red-500">{Math.abs(charsLeft)} {ScriptLines.charCountOverLimitSuffix}</span>} {/* MODIFIED */}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="display-description"
                        ref={displayWrapperRef}
                        onClick={handleDisplayClick}
                        onFocus={handleDisplayClick}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDisplayClick(); }}
                        tabIndex={0}
                        role="button"
                        aria-label={displayModeAriaLabel} // MODIFIED
                        className={`${commonBoxClasses} cursor-text group bg-white dark:bg-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-700/80
                                    flex items-start justify-between relative 
                                    ${hasError
                                ? 'border-red-400/80 dark:border-red-500/80 hover:border-red-500 dark:hover:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                            }`}
                        style={minHeightStyle}
                        variants={animationVariants.viewSwitch}
                        initial="initial" animate="animate" exit="exit"
                    >
                        <p className={`whitespace-pre-wrap break-words flex-grow pt-px 
                                        ${hasActualContent
                                ? 'text-neutral-800 dark:text-neutral-100'
                                : 'text-neutral-400 dark:text-neutral-500 italic'
                            }
                                        ${hasError && hasActualContent ? 'text-red-700 dark:text-red-400' : ''}
                                        ${hasError && !hasActualContent ? 'text-red-500/80 dark:text-red-400/80' : ''}
                                        `}>
                            {hasActualContent ? currentValue : placeholder} {/* Prop 'placeholder' is used here too */}
                        </p>
                        <Icon
                            name={editIconName}
                            className="w-6 h-6 text-neutral-400 dark:text-neutral-500 ml-2 flex-shrink-0 
                                       opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

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
    themeColor: PropTypes.oneOf(['rose']),
    editIconName: PropTypes.string,
};

ProductDescriptionInput.defaultProps = {
    initialValue: "",
    // MODIFIED: Default props now use scriptLines
    placeholder: ScriptLines.placeholder,
    maxLength: 500,
    minRows: 3,
    maxHeightPx: 200,
    label: ScriptLines.label,
    className: "",
    error: null,
    themeColor: "rose",
    editIconName: "edit",
};

export default memo(ProductDescriptionInput);