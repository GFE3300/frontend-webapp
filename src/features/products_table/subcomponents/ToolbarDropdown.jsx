import React, { useState, useRef, useEffect, memo, useCallback, useId, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const ToolbarDropdown = memo(({
    options,
    value,
    onChange,
    placeholder = "Select",
    className = '',
    disabled = false,
    iconName,
    ariaLabel,
    isSortActiveTarget = false, // New prop for highlighting
    ...restProps
}) => {
    const generatedId = useId();
    const CONTROL_ID = `${generatedId}-toolbar-dropdown-control`;
    const LISTBOX_ID = `${generatedId}-toolbar-dropdown-listbox`;

    const currentTheme = {
        focusRing: 'focus-visible:ring-2 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500',
        selectedOptionBg: 'bg-rose-50 dark:bg-rose-700/50',
        selectedOptionText: 'text-rose-600 dark:text-rose-300',
        optionHoverBg: 'hover:bg-neutral-100 dark:hover:bg-neutral-600/50',
        iconColor: 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700',
    };

    const animationConfig = {
        chevronSpin: { duration: 0.2, ease: "easeInOut" },
        dropdownList: {
            initial: { opacity: 0, y: -5, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -5, scale: 0.98, transition: { duration: 0.15 } },
            transition: { type: 'spring', stiffness: 500, damping: 30 }
        },
    };

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const listboxRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        const currentIndex = options.findIndex(opt => opt.value === value);
        setActiveIndex(currentIndex !== -1 ? currentIndex : (isOpen && options.length > 0 ? 0 : -1));
    }, [isOpen, options, value]);

    useEffect(() => {
        if (isOpen && activeIndex >= 0 && listboxRef.current) {
            const activeElement = listboxRef.current.children[activeIndex];
            activeElement?.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen, activeIndex]);

    const toggleDropdown = useCallback(() => {
        if (disabled) return;
        setIsOpen(prev => !prev);
    }, [disabled]);

    const handleOptionClick = useCallback((optionValue) => {
        if (disabled) return;
        onChange(optionValue);
        setIsOpen(false);
        buttonRef.current?.focus();
    }, [disabled, onChange]);

    const handleKeyDown = useCallback((e) => {
        if (disabled) return;
        const { key } = e;
        const numOptions = options.length;

        if (!isOpen && (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp')) {
            e.preventDefault();
            setIsOpen(true);
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
                case ' ':
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
                    if (/^[a-zA-Z0-9]$/.test(key)) {
                        const firstMatchIndex = options.findIndex(
                            opt => opt.label.toLowerCase().startsWith(key.toLowerCase())
                        );
                        if (firstMatchIndex !== -1) setActiveIndex(firstMatchIndex);
                    }
                    break;
            }
        }
    }, [disabled, isOpen, options, activeIndex, handleOptionClick]);

    const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);
    const displayLabelText = selectedOption ? selectedOption.label : placeholder;
    const hasValue = selectedOption !== undefined;

    if (!Array.isArray(options)) {
        console.error('ToolbarDropdown: `options` prop is required and must be an array.');
        return <p className="text-red-500">Error: Dropdown options are missing.</p>;
    }
    if (typeof onChange !== 'function') {
        console.error('ToolbarDropdown: `onChange` prop is required and must be a function.');
        return <p className="text-red-500">Error: Dropdown onChange missing.</p>;
    }

    const baseButtonClasses = `
        dropdown-button group w-full h-9 py-2 pl-4 pr-3 rounded-full font-montserrat font-medium
        flex items-center justify-between text-left
        focus:outline-none focus-visible:ring-2 ${currentTheme.focusRing}
        transition-all duration-200
        text-neutral-900 dark:text-neutral-800 text-sm
    `;

    const stateClasses = disabled
        ? 'cursor-not-allowed opacity-70 bg-neutral-100 dark:bg-neutral-200'
        : isSortActiveTarget
            ? 'cursor-pointer bg-sky-100 dark:bg-sky-200 ring-2 ring-sky-500 dark:ring-sky-500 shadow-sm hover:bg-sky-200 dark:hover:bg-sky-300/80'
            : 'cursor-pointer bg-neutral-100 dark:bg-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-300/80';


    return (
        <div className={`toolbar-dropdown-container relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                id={CONTROL_ID}
                ref={buttonRef}
                onClick={toggleDropdown}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`${baseButtonClasses} ${stateClasses}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel || displayLabelText}
                aria-controls={LISTBOX_ID}
                {...restProps}
            >
                {iconName && <Icon name={iconName} className="w-4 h-4 mr-2 text-neutral-500 dark:text-neutral-400 flex-shrink-0" style={{ fontSize: '1rem' }} />}
                <span
                    className={`truncate ${!hasValue && placeholder ? 'text-neutral-500 dark:text-neutral-400' : ''}`}
                >
                    {displayLabelText}
                </span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={animationConfig.chevronSpin}
                    aria-hidden="true"
                    className="ml-1 h-5 w-5 flex-shrink-0"
                >
                    <Icon name="expand_more" className={`w-5 h-5 flex-shrink-0 ${currentTheme.iconColor}`} style={{ fontSize: '1.25rem' }} />
                </motion.span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        id={LISTBOX_ID}
                        ref={listboxRef}
                        className="
                            dropdown-options absolute top-full left-0 z-20 w-full mt-1
                            bg-white dark:bg-neutral-100 font-montserrat text-neutral-900 dark:text-neutral-800
                            border border-neutral-200 dark:border-neutral-600
                            rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 focus:outline-none"
                        role="listbox"
                        tabIndex={-1}
                        variants={animationConfig.dropdownList}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {options.length > 0 ? options.map((option, index) => (
                            <li
                                key={option.value}
                                id={`${CONTROL_ID}-option-${index}`}
                                className={`
                                    px-3 py-2 text-sm cursor-pointer transition-colors outline-none
                                    flex items-center justify-between
                                    text-neutral-700 dark:text-neutral-800 
                                    ${option.disabled ? 'opacity-50 cursor-not-allowed'
                                        : `${currentTheme.optionHoverBg}`}
                                    ${activeIndex === index && !option.disabled ? `${currentTheme.selectedOptionBg} ${currentTheme.selectedOptionText}` : ''}
                                    ${value === option.value && !option.disabled && activeIndex !== index ? 'font-medium' : ''}
                                `}
                                onClick={() => !option.disabled && handleOptionClick(option.value)}
                                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                                role="option"
                                aria-selected={value === option.value || activeIndex === index}
                                aria-disabled={option.disabled}
                            >
                                <span className="truncate">{option.label}</span>
                                {value === option.value && !option.disabled && (
                                    <Icon name="check" className={`w-4 h-4 ml-2 flex-shrink-0 ${currentTheme.selectedOptionText}`} aria-hidden="true" style={{ fontSize: '1rem' }} />
                                )}
                            </li>
                        )) : (
                            <li className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 italic">
                                No options available
                            </li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
});

ToolbarDropdown.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            label: PropTypes.string.isRequired,
            disabled: PropTypes.bool,
        })
    ).isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
    disabled: PropTypes.bool,
    iconName: PropTypes.string,
    ariaLabel: PropTypes.string,
    isSortActiveTarget: PropTypes.bool, // New prop
};

export default ToolbarDropdown;