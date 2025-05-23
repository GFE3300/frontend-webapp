// 1. Imports
import React, { forwardRef, useState, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from "../../../components/common/Icon";

/**
 * Reusable input field component with animated labels, error handling, and dark mode support
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.label - Input label text
 * @param {string} [props.error] - Error message to display
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - React ref for input element
 */
const InputField = memo(forwardRef(({
    label,
    error,
    className,
    ...props
}, ref) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const animationConfig = {
        labelSpring: { type: 'spring', stiffness: 300 },
        errorAppear: {
            initial: { opacity: 0, y: 5 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -5 },
            transition: { duration: 0.2 }
        },
        tooltipAppear: {
            initial: { opacity: 0, y: -5 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -5 }
        }
    };

    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [errorText, setErrorText] = useState('');
    const inputRef = useRef(null);

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleChange = (e) => {
        setHasValue(!!e.target.value);
        props.onChange?.(e);
    };

    // ===========================================================================
    // Validation
    // ===========================================================================
    if (!label) {
        console.error('InputField: Missing required "label" prop');
        return null;
    }

    // ===========================================================================
    // Rendering
    // ===========================================================================
    return (
        <div className={`relative ${className}`}>
            {/* Label Animation Container */}
            <motion.div className="relative">
                <label className="absolute -top-7 left-3 origin-bottom-left pointer-events-none max-h-4.5 max-w-[80%]">
                    <motion.span
                        className={`text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-full font-medium font-montserrat transition-colors duration-200 ${
                            isFocused || hasValue
                                ? 'text-rose-400 dark:text-rose-400'
                                : 'text-neutral-700 dark:text-gray-300'
                        }`}
                        animate={{
                            y: isFocused || hasValue ? -24 : 0,
                            scale: isFocused || hasValue ? 0.85 : 1,
                            height: 18,
                            maxWidth: '100%'
                        }}
                        transition={animationConfig.labelSpring}
                    >
                        {label}
                    </motion.span>
                </label>

                {/* Input Element */}
                <input
                    {...props}
                    ref={(node) => {
                        if (typeof ref === 'function') ref(node);
                        else if (ref) ref.current = node;
                        inputRef.current = node;
                    }}
                    className={`
                        w-full py-2 px-4 rounded-full font-montserrat font-medium
                        bg-neutral-100 dark:bg-neutral-200
                        focus:outline-none focus:ring-2
                        transition-all duration-200
                        text-neutral-900 dark:text-neutral-800 text-sm
                        ${error ? 'ring-2 ring-red-500 dark:ring-red-400' :
                            'focus:ring-rose-400 dark:focus:ring-rose-400'}
                    `}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    onChange={handleChange}
                />
            </motion.div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        {...animationConfig.errorAppear}
                        className="absolute right-2 top-1.5 flex items-center gap-1"
                        role="alert"
                        aria-live="polite"
                    >
                        <div
                            className="relative w-6 h-6 flex items-center justify-center"
                            onMouseEnter={() => setErrorText(error)}
                            onMouseLeave={() => setErrorText('')}
                            role="tooltip"
                        >
                            <Icon
                                name="error"
                                className="w-6 h-6 text-red-600 dark:text-red-400"
                                variations={{ fill: 1, weight: 700, grade: 0, opsz: 48 }}
                            />

                            {/* Error Tooltip */}
                            <AnimatePresence>
                                {errorText && (
                                    <motion.div
                                        {...animationConfig.tooltipAppear}
                                        className="absolute z-50 top-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/5" 
                                    >
                                        <p className="
                                            bg-white dark:bg-gray-800 
                                            rounded-xl px-4 py-3 
                                            text-xs text-gray-900 dark:text-gray-100 
                                            font-medium font-montserrat
                                            shadow-sm"
                                        >
                                            {errorText}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}));

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func
};

export default InputField;