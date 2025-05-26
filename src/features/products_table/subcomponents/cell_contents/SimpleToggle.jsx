// src/features/products_table/subcomponents/SimpleToggle.jsx
import React, { useId } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import Spinner from '../../../../components/common/Spinner';
import Icon from '../../../../components/common/Icon'; // Import Icon for check/cross

const SimpleToggle = ({
    checked,
    onChange,
    disabled = false,
    size = 'md',
    isLoading = false,
    label,
    labelId,
    className = '',
}) => {
     /* 
    // Debugging output to check props
     console.log('SimpleToggle rendered with:', {
        checked,
        onChange,
        disabled,
        size,
        isLoading,
        label,
        labelId,
        className,
    });
    */


    const componentId = useId();
    const inputId = `toggle-${componentId}`;

    const sizeConfig = {
        sm: {
            trackW: 'w-10', // Slightly wider for more travel
            trackH: 'h-5',
            knobSize: 'w-3.5 h-3.5',
            knobTranslate: 18, // (Track width - knob width - padding) e.g., 40px - 14px - (2*1px border) - 2*1.5px padding ~ 22px from edge to edge for knob center
            knobPadding: 'p-[1.5px]', // Padding around the knob within the track
            iconSize: 'w-2 h-2',
            spinnerSize: 'xs',
        },
        md: {
            trackW: 'w-12',
            trackH: 'h-[22px]',
            knobSize: 'w-4 h-4',
            knobTranslate: 26,
            knobPadding: 'p-[3px]',
            iconSize: 'w-2.5 h-2.5',
            spinnerSize: 'sm',
        },
        lg: {
            trackW: 'w-16',
            trackH: 'h-7',
            knobSize: 'w-5 h-5',
            knobTranslate: 34,
            knobPadding: 'p-[4px]',
            iconSize: 'w-3 h-3',
            spinnerSize: 'sm',
        },
    };

    const current = sizeConfig[size] || sizeConfig.md;

    const handleToggle = (e) => {
        if (!disabled && !isLoading && onChange) {
            onChange(e.target.checked);
        }
    };

    const a11yProps = {};
    if (labelId) {
        a11yProps['aria-labelledby'] = labelId;
    } else if (label) {
        a11yProps['aria-label'] = label;
    }

    // Animation Variants
    const trackVariants = {
        unchecked: { backgroundColor: "rgb(203 213 225)" }, // neutral-300
        checked: { backgroundColor: "rgb(225 29 72)" },    // rose-600
        darkUnchecked: { backgroundColor: "rgb(75 85 99)" },  // neutral-600
        darkChecked: { backgroundColor: "rgb(225 29 72)" },   // rose-600
    };

    const knobVariants = {
        unchecked: { x: 0 },
        checked: { x: current.knobTranslate },
    };

    const knobTransition = {
        type: "spring",
        stiffness: 500,
        damping: 25,
        mass: 0.5,
    };

    const iconVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { delay: 0.1 } },
    };

    return (
        <div className={`inline-flex items-center gap-x-2 ${className}`}>
            <label
                className={`relative inline-flex items-center
                           ${isLoading || disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                          `}
                htmlFor={inputId}
            >
                <input
                    type="checkbox"
                    id={inputId}
                    checked={checked}
                    onChange={handleToggle}
                    disabled={disabled || isLoading}
                    className="sr-only peer" // Still using peer for focus rings, though not for knob/track interaction
                    role="switch"
                    aria-checked={checked}
                    {...a11yProps}
                />
                <motion.div // Track
                    className={`relative ${current.trackW} ${current.trackH} ${current.knobPadding}
                                flex items-center rounded-full
                                peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1
                                peer-focus-visible:ring-rose-400 dark:peer-focus-visible:ring-rose-500
                                dark:focus:ring-offset-neutral-900
                              `}
                    variants={trackVariants}
                    animate={checked ? (document.documentElement.classList.contains('dark') ? 'darkChecked' : 'checked') : (document.documentElement.classList.contains('dark') ? 'darkUnchecked' : 'unchecked')}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                    <motion.div // Knob
                        className={`${current.knobSize} bg-white rounded-full shadow-md flex items-center justify-center`}
                        layout // Enables smooth transition of position
                        variants={knobVariants}
                        initial={false} // Don't animate on initial mount based on variants
                        animate={checked ? "checked" : "unchecked"}
                        transition={knobTransition}
                    >
                        <AnimatePresence initial={false} mode="wait">
                            {checked ? (
                                <motion.div
                                    key="check"
                                    variants={iconVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <Icon name="check" className={`${current.iconSize} text-rose-600`} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="cross" // Or a more neutral icon if preferred for "off" state
                                    variants={iconVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    {/* You can put an icon for 'off' state here if desired, e.g., a small circle or dash */}
                                    {/* <Icon name="horizontal_rule" className={`${current.iconSize} text-neutral-400`} /> */}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </label>
            {isLoading && (
                <Spinner
                    size={current.spinnerSize}
                    color="text-neutral-500 dark:text-neutral-400"
                />
            )}
        </div>
    );
};

SimpleToggle.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    isLoading: PropTypes.bool,
    label: PropTypes.string,
    labelId: PropTypes.string,
    className: PropTypes.string,
};

export default SimpleToggle;