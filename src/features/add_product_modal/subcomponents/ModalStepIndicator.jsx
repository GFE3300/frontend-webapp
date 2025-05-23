// src/features/add_product_modal/subcomponents/ModalStepIndicator.jsx
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Assuming this path is correct

// Configuration for the steps.
// If these steps vary for different modals, consider passing this as a prop.
const STEPS_CONFIG = [
    { name: 'Basics', icon: 'article', key: 'basics' }, // Added key for more robust React keying
    { name: 'Attributes', icon: 'tune', key: 'attributes' },
    { name: 'Ingredients', icon: 'science', key: 'ingredients' },
    { name: 'Pricing', icon: 'payments', key: 'pricing' },
    { name: 'Discounts', icon: 'sell', key: 'discounts' },
];

// Constants for Framer Motion transitions
const ICON_SCALE_TRANSITION = { type: 'spring', stiffness: 300, damping: 15 };
const CHECKMARK_APPEAR_TRANSITION = { type: 'spring', stiffness: 500, damping: 25, delay: 0.1 };


/**
 * ModalStepIndicator component displays the progress through a multi-step modal form.
 * It shows current, completed, and pending steps, and allows navigation to completed steps.
 *
 * @component
 * @param {object} props - The component props.
 * @param {number} props.currentStep - The current active step number (1-indexed).
 * @param {number} [props.totalSteps=STEPS_CONFIG.length] - The total number of steps to display.
 * @param {function} [props.onStepClick] - Callback function when a completed step is clicked. Receives step number.
 * @param {object} props.stepSaved - An object indicating the saved status of each step.
 *                                   Keys are step numbers (1-indexed).
 *                                   Values can be `true` (saved) or `'ticked'` (saved with emphasis).
 */
const ModalStepIndicator = memo(({
    currentStep,
    totalSteps = STEPS_CONFIG.length, // Default to the length of the config
    onStepClick,
    stepSaved, // Expected: { 1: true, 2: 'ticked', ... }
}) => {
    // Memoization relies on stable props. `onStepClick` should be wrapped in `useCallback` by parent.
    // `stepSaved` should be a stable object reference if its contents haven't changed.

    const visibleSteps = STEPS_CONFIG.slice(0, totalSteps);

    return (
        <nav aria-label="Product creation steps" className="mb-6 px-2 sm:px-0">
            <ol className="flex items-center justify-center space-x-1 sm:space-x-2" role="list">
                {visibleSteps.map((step, index) => {
                    const stepNumber = index + 1;

                    // Determine step states
                    const isTicked = stepSaved[stepNumber] === 'ticked';
                    const isGenerallySaved = stepSaved[stepNumber] === true;
                    const isPastStep = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    // A step is considered "completed" if it's ticked, saved, or a past step.
                    const isEffectivelyComplete = isTicked || isGenerallySaved || isPastStep;

                    // Clickability: can click if effectively complete, not current, and handler exists.
                    const canClick = isEffectivelyComplete && !isCurrent && typeof onStepClick === 'function';

                    // Determine styling based on state
                    let circleClasses = 'bg-neutral-200 dark:bg-neutral-700';
                    let iconClasses = 'text-neutral-500 dark:text-neutral-400';
                    let textClasses = 'text-neutral-500 dark:text-neutral-400'; // Default: more subdued for pending
                    let iconName = step.icon;

                    if (isTicked) {
                        circleClasses = 'bg-green-600 text-white'; // Darker, confident green
                        iconClasses = 'text-white';
                        textClasses = 'text-neutral-700 dark:text-neutral-200';
                        iconName = 'check_circle'; // Stronger affirmation icon
                    } else if (isCurrent) {
                        circleClasses = 'bg-rose-500 text-white'; // BakeFlow accent color
                        iconClasses = 'text-white';
                        textClasses = 'text-rose-600 dark:text-rose-400 font-semibold';
                        // Icon remains step.icon
                    } else if (isEffectivelyComplete) { // Completed but not ticked, and not current
                        circleClasses = 'bg-green-500 text-white'; // Standard green
                        iconClasses = 'text-white';
                        textClasses = 'text-neutral-700 dark:text-neutral-200';
                        iconName = 'check'; // Standard checkmark
                    }
                    // Else, it's a pending step and uses the default styling.

                    const connectorIsActive = isEffectivelyComplete; // Connector from this step is active if step is complete.

                    return (
                        <React.Fragment key={step.key || step.name}> {/* Use provided key or fallback to name */}
                            <li className="flex flex-col items-center" role="listitem">
                                <button
                                    type="button"
                                    onClick={() => canClick && onStepClick(stepNumber)}
                                    disabled={!canClick && !isCurrent} // Current step is not "clickable" to navigate, but not disabled in appearance.
                                    className={`
                                        flex flex-col items-center text-center p-1 sm:p-2 rounded-lg transition-colors duration-150 ease-in-out
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 dark:focus-visible:ring-offset-neutral-800
                                        ${canClick ? 'hover:bg-neutral-100 dark:hover:bg-neutral-700/60 cursor-pointer' : ''}
                                        ${isCurrent ? 'cursor-default' : ''}
                                        ${!canClick && !isCurrent ? 'cursor-not-allowed opacity-60' : 'opacity-100'}
                                    `}
                                    aria-current={isCurrent ? 'step' : undefined}
                                    aria-label={isCurrent ? `${step.name}, current step` : (isEffectivelyComplete ? `Go to ${step.name}` : step.name)}
                                >
                                    <motion.div
                                        className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${circleClasses} transition-colors duration-300 ease-in-out mb-1 shadow-md`}
                                        animate={isCurrent ? { scale: 1.12, y: -2 } : { scale: 1, y: 0 }}
                                        transition={ICON_SCALE_TRANSITION}
                                    >
                                        {isTicked ? (
                                            <motion.div
                                                key={`icon-ticked-${stepNumber}`} // Key for transition on change
                                                className='w-6 h-6'
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={CHECKMARK_APPEAR_TRANSITION}
                                            >
                                                <Icon name={iconName} className={`w-6 h-6 ${iconClasses}`} />
                                            </motion.div>
                                        ) : isEffectivelyComplete && !isCurrent ? (
                                            <motion.div
                                                key={`icon-completed-${stepNumber}`}
                                                className='w-6 h-6'
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }} // if it changes from this state
                                                transition={CHECKMARK_APPEAR_TRANSITION}
                                            >
                                                <Icon name={iconName} className={`w-6 h-6 ${iconClasses}`} />
                                            </motion.div>
                                        ) : (
                                            <Icon name={iconName} className={`w-6 h-6 ${iconClasses} transition-colors duration-300 ease-in-out`} />
                                        )}
                                    </motion.div>
                                    <span className={`text-xs sm:text-sm ${textClasses} transition-colors duration-150 ease-in-out`}>
                                        {step.name}
                                    </span>
                                </button>
                            </li>
                            {stepNumber < visibleSteps.length && (
                                <li aria-hidden="true" className="flex-1 hidden sm:flex items-center mx-1 sm:mx-1.5 mt-[-1.75rem] sm:mt-[-2rem]"> {/* Adjusted margin for better alignment with circle centers */}
                                    <div
                                        className={`h-0.5 w-full rounded-full transition-colors duration-500 ease-in-out
                                            ${connectorIsActive ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                                    />
                                </li>
                            )}
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
});

ModalStepIndicator.displayName = 'ModalStepIndicator';

ModalStepIndicator.propTypes = {
    /** The current active step number (1-indexed). */
    currentStep: PropTypes.number.isRequired,
    /** The total number of steps to display. Defaults to the length of `STEPS_CONFIG`. */
    totalSteps: PropTypes.number,
    /** Callback function triggered when a completed (and not current) step's button is clicked. Receives the step number (1-indexed). */
    onStepClick: PropTypes.func,
    /**
     * An object indicating the saved status of each step.
     * Keys are step numbers (1-indexed).
     * Values can be `true` (step data is saved/valid) or `'ticked'` (step is saved and confirmed with emphasis).
     * Example: `{ 1: true, 2: 'ticked' }`
     */
    stepSaved: PropTypes.objectOf(
        PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['ticked'])])
    ).isRequired,
};

export default ModalStepIndicator;