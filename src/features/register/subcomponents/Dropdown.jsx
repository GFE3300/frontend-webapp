import React, { useState, useRef, useEffect, memo, useCallback, useId, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from "../../../components/common/Icon";
import { scriptLines_Components as scriptLines } from '../utils/script_lines';

/**
 * An accessible and animated dropdown component with a floating label,
 * aligning with the style of InputField. Supports keyboard navigation,
 * dark mode, error display, and theming.
 * @component Dropdown
 * @param {Object} props - Component properties.
 * @param {string} props.label - The label text for the dropdown (required).
 * @param {Array<Object>} props.options - An array of option objects, each with `value` and `label` properties (required).
 *        Optionally, an option can have `disabled: true`.
 * @param {*} props.value - The currently selected value of the dropdown (controlled component).
 * @param {Function} props.onChange - Callback function invoked when an option is selected. Passes the new value. (required).
 * @param {string} [props.placeholder="Select an option"] - Placeholder text shown when no value is selected.
 * @param {string} [props.error] - An error message to display beneath the dropdown.
 * @param {string} [props.helptext] - Additional helper text to display.
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {boolean} [props.disabled=false] - If true, the dropdown is disabled.
 * @param {string} [props.themeColor="rose"] - Theme color for accents.
 * @param {string} [props.name] - The name attribute for the dropdown (useful for forms).
 * @param {string} [props.id] - Custom ID for the dropdown control.
 */
const Dropdown = memo(({
    label,
    options,
    value,
    onChange,
    placeholder = "Select an option",
    error,
    helptext,
    className = '',
    disabled = false,
    themeColor = "rose",
    name,
    id,
    errorClassName = '',
    ...restProps // To pass down other props like onFocus, onBlur if needed
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const generatedId = useId();
    const CONTROL_ID = id || `${generatedId}-dropdown-control`;
    const LABEL_ID = `${generatedId}-dropdown-label`;
    const LISTBOX_ID = `${generatedId}-dropdown-listbox`;
    const ERROR_ID = error ? `${generatedId}-dropdown-error` : undefined;
    const HELP_ID = helptext ? `${generatedId}-dropdown-help` : undefined;

    const THEME_CLASSES = {
        rose: {
            focusRing: 'focus-visible:ring-rose-400 dark:focus-visible:ring-rose-400',
            labelFocusText: 'text-rose-400 dark:text-rose-400',
            selectedOptionBg: 'bg-rose-50 dark:bg-rose-700/50',
            selectedOptionText: 'text-rose-600 dark:text-rose-300 font-semibold',
            optionHoverBg: 'hover:bg-rose-50 dark:hover:bg-neutral-300/50',
            iconColor: 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200',
        },
        // Add other themes if needed
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const animationConfig = {
        labelSpring: { type: 'spring', stiffness: 300, damping: 25 },
        chevronSpin: { duration: 0.2, ease: "easeInOut" },
        dropdownList: {
            initial: { opacity: 0, y: -10, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -5, scale: 0.98, transition: { duration: 0.15 } },
            transition: { type: 'spring', stiffness: 500, damping: 30 }
        },
        errorHelptext: { /* ... same as TagInput ... */
            initial: { opacity: 0, y: -5 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
            exit: { opacity: 0, y: -5, transition: { duration: 0.15, ease: 'easeIn' } }
        }
    };

    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1); // For keyboard navigation
    const dropdownRef = useRef(null); // Ref for the main container for click outside
    const buttonRef = useRef(null); // Ref for the button for focus management
    const listboxRef = useRef(null); // Ref for the UL listbox

    // ===========================================================================
    // Effects
    // ===========================================================================

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Reset activeIndex when options change or dropdown closes
    useEffect(() => {
        if (!isOpen) {
            // Find index of current value when dropdown closes, or set to -1
            const currentIndex = options.findIndex(opt => opt.value === value);
            setActiveIndex(currentIndex !== -1 ? currentIndex : -1);
        } else {
            // When opening, set activeIndex to the selected value, or first if none selected
            const currentIndex = options.findIndex(opt => opt.value === value);
            setActiveIndex(currentIndex !== -1 ? currentIndex : (options.length > 0 ? 0 : -1));
        }
    }, [isOpen, options, value]);

    // Scroll active item into view
    useEffect(() => {
        if (isOpen && activeIndex >= 0 && listboxRef.current) {
            const activeElement = listboxRef.current.children[activeIndex];
            activeElement?.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen, activeIndex]);


    // ===========================================================================
    // Handlers
    // ===========================================================================
    const toggleDropdown = useCallback(() => {
        if (disabled) return;
        setIsOpen(prev => !prev);
    }, [disabled]);

    const handleOptionClick = useCallback((optionValue) => {
        if (disabled) return;
        onChange(optionValue);
        setIsOpen(false);
        buttonRef.current?.focus(); // Return focus to the button
    }, [disabled, onChange]);

    const handleKeyDown = useCallback((e) => {
        if (disabled) return;
        const { key } = e;
        const numOptions = options.length;

        if (!isOpen && (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp')) {
            e.preventDefault();
            setIsOpen(true);
            // Set activeIndex to current value or first option when opening with keys
            const currentIndex = options.findIndex(opt => opt.value === value);
            setActiveIndex(currentIndex !== -1 ? currentIndex : (numOptions > 0 ? 0 : -1));
            return;
        }

        if (isOpen) {
            switch (key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setActiveIndex(prev => (prev + 1) % numOptions);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setActiveIndex(prev => (prev - 1 + numOptions) % numOptions);
                    break;
                case 'Enter':
                case ' ': // Space selects
                    e.preventDefault();
                    if (activeIndex >= 0 && options[activeIndex] && !options[activeIndex].disabled) {
                        handleOptionClick(options[activeIndex].value);
                    }
                    break;
                case 'Escape':
                case 'Tab':
                    e.preventDefault();
                    setIsOpen(false);
                    buttonRef.current?.focus();
                    break;
                default:
                    // Allow typing to select an option (basic first-letter match)
                    if (/^[a-zA-Z0-9]$/.test(key)) {
                        const firstMatchIndex = options.findIndex(
                            opt => opt.label.toLowerCase().startsWith(key.toLowerCase())
                        );
                        if (firstMatchIndex !== -1) {
                            setActiveIndex(firstMatchIndex);
                        }
                    }
                    break;
            }
        }
    }, [disabled, isOpen, options, value, activeIndex, handleOptionClick]);

    // ===========================================================================
    // Render Helpers
    // ===========================================================================
    const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);
    const displayLabelText = selectedOption ? selectedOption.label : placeholder;
    const hasValue = selectedOption !== undefined;

    // ===========================================================================
    // Prop Validation (Component Level)
    // ===========================================================================
    if (!label || typeof label !== 'string') {
        console.error('Dropdown: `label` prop is required and must be a string.');
        return <p className="text-red-500">Error: Dropdown label is missing.</p>;
    }
    if (!Array.isArray(options)) {
        console.error('Dropdown: `options` prop is required and must be an array.');
        return <p className="text-red-500">Error: Dropdown options are missing or invalid.</p>;
    }
    if (typeof onChange !== 'function') {
        console.error('Dropdown: `onChange` prop is required and must be a function.');
        return <p className="text-red-500">Error: Dropdown change handler is missing.</p>;
    }

    // ===========================================================================
    // Rendering
    // ===========================================================================
    return (
        <div
            className={`dropdown-container relative ${className}`}
            ref={dropdownRef}
            data-testid="dropdown-container"
        >
            {/* Floating Label (mimics InputField) */}
            <motion.label
                htmlFor={CONTROL_ID}
                id={LABEL_ID}
                className={`absolute -top-7 left-3 origin-bottom-left pointer-events-none font-montserrat
                    `}
                layout // Animate label position with LayoutGroup (if Dropdown is wrapped in one with other fields)
                transition={animationConfig.labelSpring}
            >
                <span className='text-sm font-medium font-montserrat transition-colors duration-200 text-neutral-700 dark:text-gray-300'>
                    {label}
                </span>
            </motion.label>

            {/* Control Button */}
            <button
                type="button"
                id={CONTROL_ID}
                ref={buttonRef}
                name={name}
                onClick={toggleDropdown}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`
                    dropdown-button group w-full h-9 py-2 pl-4 pr-3 rounded-full font-montserrat font-medium
                    flex items-center justify-between text-left
                    bg-neutral-100 dark:bg-neutral-200
                    focus:outline-none focus-visible:ring-2 ${currentTheme.focusRing}
                    transition-all duration-200
                    text-neutral-900 dark:text-neutral-800 text-sm
                    ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-300/80'}
                    ${error ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}
                `}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-labelledby={`${LABEL_ID} ${CONTROL_ID}`} // Label + selected value for screen readers
                aria-controls={LISTBOX_ID}
                aria-describedby={`${ERROR_ID || ''} ${HELP_ID || ''}`.trim()}
                aria-invalid={!!error}
                data-testid="dropdown-button"
                {...restProps} // Pass onFocus, onBlur if needed
            >
                <span
                    className={`truncate ${!hasValue && placeholder ? 'text-neutral-500 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-800'}`}
                    data-testid="dropdown-selected-value"
                >
                    {displayLabelText}
                </span>
                <motion.span
                    className='flex-shrink-0 h-6'
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={animationConfig.chevronSpin}
                    aria-hidden="true"
                >
                    <Icon name="expand_more" className={`w-6 h-6 ml-1 flex-shrink-0 ${currentTheme.iconColor} transition-colors`} />
                </motion.span>
            </button>

            {/* Options List */}
            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        id={LISTBOX_ID}
                        ref={listboxRef}
                        className="
                            dropdown-options absolute top-full left-0 z-20 w-full mt-1 
                            bg-white dark:bg-neutral-200
                            border border-neutral-200 dark:border-neutral-600 
                            rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 focus:outline-none"
                        role="listbox"
                        aria-labelledby={LABEL_ID}
                        tabIndex={-1} // Make it focusable programmatically if needed, but button handles focus.
                        variants={animationConfig.dropdownList}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        data-testid="dropdown-options-list"
                    >
                        {options.length > 0 ? options.map((option, index) => (
                            <li
                                key={option.value} // Use option.value for key if unique, or generate unique key
                                id={`${CONTROL_ID}-option-${index}`}
                                className={`
                                    px-3 py-2 text-sm font-montserrat cursor-pointer transition-colors outline-none
                                    flex items-center justify-between
                                    ${option.disabled ? 'opacity-50 cursor-not-allowed text-neutral-400 dark:text-neutral-500'
                                        : `${currentTheme.optionHoverBg} text-neutral-800 dark:text-neutral-800`}
                                    ${activeIndex === index && !option.disabled ? `${currentTheme.selectedOptionBg} ${currentTheme.selectedOptionText}` : ''}
                                    ${value === option.value && !option.disabled && activeIndex !== index ? 'font-semibold text-neutral-700 dark:text-neutral-600' : ''}
                                `}
                                onClick={() => !option.disabled && handleOptionClick(option.value)}
                                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                                role="option"
                                aria-selected={value === option.value || activeIndex === index}
                                aria-disabled={option.disabled}
                                data-testid={`dropdown-option-${option.value}`}
                            >
                                <span className="truncate">{option.label}</span>
                                {value === option.value && !option.disabled && (
                                    <Icon name="check" className={`w-4 h-4 ml-2 flex-shrink-0 ${currentTheme.selectedOptionText}`} aria-hidden="true" />
                                )}
                            </li>
                        )) : (
                            <li className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 italic">
                               {scriptLines.Dropdown.line1} 
                            </li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>

            {/* Error and Help Text Section */}
            <div className={`mt-1.5 ml-3 min-h-[1.25rem] ${errorClassName}`}> {/* Placeholder for height consistency */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-2"
                            id="tagInputError"
                            role="alert"
                        >
                            <Icon
                                name="error"
                                className="w-6 h-6 text-red-600 dark:text-red-400"
                                variations={{ fill: 1, weight: 700, grade: 0, opsz: 48 }}
                                aria-hidden="true"
                            />
                            <span className="text-red-600 dark:text-red-400 text-sm font-medium font-montserrat">
                                {error}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {!error && helptext && (
                        <motion.p
                            id={HELP_ID}
                            className="text-xs text-neutral-500 dark:text-neutral-400 font-medium font-montserrat"
                            variants={animationConfig.errorHelptext}
                            initial="initial" animate="animate" exit="exit"
                        >
                            {helptext}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

// ===========================================================================
// Prop Types (Subcomponents ChevronIcon and CheckmarkIcon are removed as Icon component is used)
// ===========================================================================
Dropdown.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            label: PropTypes.string.isRequired,
            disabled: PropTypes.bool, // Optional: to disable specific options
        })
    ).isRequired,
    value: PropTypes.any, // Can be any type matching option values
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    helptext: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    themeColor: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
};

Dropdown.defaultProps = {
    placeholder: "Select an option",
    className: '',
    disabled: false,
    themeColor: "rose",
    error: '', // Default to empty string for easier conditional checks
    helptext: '',
};

export default Dropdown;