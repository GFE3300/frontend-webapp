// 1. Imports
import React, { forwardRef, useState, useRef, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from "../../../components/common/Icon";

/**
 * A subcomponent for the help tooltip.
 * @param {{text: string}} props - The text to display in the tooltip.
 */
const HelpTooltip = ({ text }) => (
    <div className="relative group flex items-center ml-2">
        <Icon name="help_outline" className="w-4 h-4 text-neutral-400 dark:text-neutral-500 cursor-help" style={{ fontSize: '1rem' }} variations={{ fill: 0, weight: 600, grade: 0, opsz: 48 }} />
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs p-2.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10" role="tooltip">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-800 dark:bg-neutral-900 rotate-45" style={{ marginTop: '-4px' }}></div>
        </div>
    </div>
);
HelpTooltip.propTypes = { text: PropTypes.string.isRequired };

/**
 * A subcomponent for the error icon and its tooltip.
 * @param {{message: string}} props - The error message.
 */
const ErrorIconWithTooltip = ({ message }) => (
    <div className="relative group flex items-center">
        <Icon name="error" className="w-6 h-6 text-red-500 dark:text-red-400" aria-hidden="true" />
        <div className="absolute bottom-full mb-2 right-0 w-max max-w-xs p-2.5 text-xs font-medium text-white bg-red-600 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10" role="tooltip">
            {message}
        </div>
    </div>
);
ErrorIconWithTooltip.propTypes = { message: PropTypes.string.isRequired };

/**
 * Reusable input field component with animated labels, error handling, and dark mode support
 * @component
 * @param {Object} props - Component properties
 */
const InputField = memo(forwardRef(({
    label,
    error,
    className,
    labelClassName = 'text-neutral-700 dark:text-neutral-400',
    asyncValidationStatus = 'idle', // 'idle', 'validating', 'valid', 'invalid'
    asyncErrorMessage = '',
    helpTooltipText = '',
    ...props
}, ref) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const animationConfig = {
        labelSpring: { type: 'spring', stiffness: 300, damping: 25 },
        iconAppear: {
            initial: { opacity: 0, scale: 0.5 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.5 },
            transition: { duration: 0.2, ease: "circOut" }
        }
    };

    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    const inputRef = useRef(null);

    // ===========================================================================
    // Memoized Values
    // ===========================================================================
    const displayError = useMemo(() => {
        // Asynchronous validation error takes precedence.
        return asyncValidationStatus === 'invalid' ? asyncErrorMessage : error;
    }, [asyncValidationStatus, asyncErrorMessage, error]);

    const isErrorActive = !!displayError;
    const isSuccessActive = asyncValidationStatus === 'valid';
    const isProcessing = asyncValidationStatus === 'validating';

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
            <div className="flex items-center absolute -top-7 left-3 pointer-events-none">
                <motion.label
                    htmlFor={props.id || label}
                    className={`origin-bottom-left`}
                >
                    <motion.span
                        className={`text-sm font-medium font-montserrat transition-colors duration-200 ${labelClassName}`}
                        animate={{
                            y: isFocused || hasValue ? -24 : 0,
                            scale: isFocused || hasValue ? 0.85 : 1,
                        }}
                        transition={animationConfig.labelSpring}
                    >
                        {label}
                    </motion.span>
                </motion.label>
                {helpTooltipText && <HelpTooltip text={helpTooltipText} />}
            </div>

            <div className="relative w-full">
                <input
                    {...props}
                    id={props.id || label}
                    ref={(node) => {
                        if (typeof ref === 'function') ref(node);
                        else if (ref) ref.current = node;
                        inputRef.current = node;
                    }}
                    className={`
                        w-full h-9 py-2 px-4 rounded-full font-montserrat font-medium
                        bg-neutral-100 dark:bg-neutral-200
                        focus:outline-none focus:ring-2
                        transition-all duration-200
                        text-neutral-900 dark:text-neutral-800 text-sm
                        ${isErrorActive ? 'ring-2 ring-red-500 dark:ring-red-400 pr-12' :
                            isSuccessActive ? 'ring-2 ring-green-500 dark:ring-green-400 pr-12' :
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
                    aria-invalid={isErrorActive}
                    aria-describedby={isErrorActive ? `${props.id || label}-error` : undefined}
                />

                <div className="absolute top-1/2 right-3 -translate-y-1/2 h-6 w-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isProcessing && (
                            <motion.div key="validating" {...animationConfig.iconAppear} className='flex items-center justify-center'>
                                <Icon name="progress_activity" className="w-5 h-5 text-neutral-500 animate-spin" />
                            </motion.div>
                        )}
                        {isSuccessActive && (
                            <motion.div key="valid" {...animationConfig.iconAppear} className='flex items-center justify-center'>
                                <Icon name="check_circle" className="w-6 h-6 text-green-500" />
                            </motion.div>
                        )}
                        {isErrorActive && !isProcessing && (
                            <motion.div key="error" {...animationConfig.iconAppear}>
                                <ErrorIconWithTooltip message={displayError} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="mt-1.5 ml-3 min-h-[1.25rem]">
                {/* Standard help text is shown only when there's no error */}
                {props.helptext && !isErrorActive && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium font-montserrat">
                        {props.helptext}
                    </p>
                )}
                {/* Standard yup error is shown only if there's no async error */}
                {error && asyncValidationStatus !== 'invalid' && (
                    <p id={`${props.id || label}-error`} className="text-sm text-red-500 dark:text-red-400 font-medium font-montserrat" role="alert">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}));

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string,
    className: PropTypes.string,
    labelClassName: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    id: PropTypes.string,
    helptext: PropTypes.string,
    asyncValidationStatus: PropTypes.oneOf(['idle', 'validating', 'valid', 'invalid']),
    asyncErrorMessage: PropTypes.string,
    helpTooltipText: PropTypes.string,
};

export default InputField;