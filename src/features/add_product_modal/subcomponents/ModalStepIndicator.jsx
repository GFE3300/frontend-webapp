import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines'; // IMPORTED scriptLines

// Configuration for the steps.
// These will now use scriptLines for names.
// We'll define STEPS_CONFIG inside the component or make it a memoized constant
// to ensure it can access scriptLines after it's initialized.

// Constants for Framer Motion transitions
const ICON_SCALE_TRANSITION = { type: 'spring', stiffness: 300, damping: 15 };
const CHECKMARK_APPEAR_TRANSITION = { type: 'spring', stiffness: 500, damping: 25, delay: 0.1 };

const ModalStepIndicator = memo(({
    currentStep,
    totalSteps, // Removed default here, will be derived from STEPS_CONFIG
    onStepClick,
    stepSaved,
}) => {
    // Define STEPS_CONFIG here or use useMemo if it depends on props/state not available globally
    const STEPS_CONFIG = useMemo(() => [
        { name: scriptLines.modalStepIndicator_step_basics, icon: 'article', key: 'basics' },
        { name: scriptLines.modalStepIndicator_step_attributes, icon: 'tune', key: 'attributes' },
        { name: scriptLines.modalStepIndicator_step_ingredients, icon: 'science', key: 'ingredients' },
        { name: scriptLines.modalStepIndicator_step_pricing, icon: 'payments', key: 'pricing' },
        { name: scriptLines.modalStepIndicator_step_discounts, icon: 'sell', key: 'discounts' },
    ], []); // Empty dependency array means it's created once per component instance

    const effectiveTotalSteps = totalSteps === undefined ? STEPS_CONFIG.length : totalSteps;
    const visibleSteps = STEPS_CONFIG.slice(0, effectiveTotalSteps);

    return (
        <nav aria-label={scriptLines.modalStepIndicator_nav_ariaLabel} className="mb-6 px-2 sm:px-0">
            <ol className="flex items-center justify-center space-x-1 sm:space-x-2" role="list">
                {visibleSteps.map((step, index) => {
                    const stepNumber = index + 1;

                    const isTicked = stepSaved[stepNumber] === 'ticked';
                    const isGenerallySaved = stepSaved[stepNumber] === true;
                    const isPastStep = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isEffectivelyComplete = isTicked || isGenerallySaved || isPastStep;
                    const canClick = isEffectivelyComplete && !isCurrent && typeof onStepClick === 'function';

                    let circleClasses = 'bg-neutral-200 dark:bg-neutral-700';
                    let iconClasses = 'text-neutral-500 dark:text-neutral-400';
                    let textClasses = 'text-neutral-500 dark:text-neutral-400';
                    let iconName = step.icon;
                    let ariaLabelValue = step.name; // Default aria-label

                    if (isTicked) {
                        circleClasses = 'bg-green-600 text-white';
                        iconClasses = 'text-white';
                        textClasses = 'text-neutral-700 dark:text-neutral-200';
                        iconName = 'check_circle';
                        ariaLabelValue = scriptLines.modalStepIndicator_aria_goToStep.replace('{stepName}', step.name);
                    } else if (isCurrent) {
                        circleClasses = 'bg-rose-500 text-white';
                        iconClasses = 'text-white';
                        textClasses = 'text-rose-600 dark:text-rose-400 font-semibold';
                        ariaLabelValue = scriptLines.modalStepIndicator_aria_currentStep.replace('{stepName}', step.name);
                    } else if (isEffectivelyComplete) {
                        circleClasses = 'bg-green-500 text-white';
                        iconClasses = 'text-white';
                        textClasses = 'text-neutral-700 dark:text-neutral-200';
                        iconName = 'check';
                        ariaLabelValue = scriptLines.modalStepIndicator_aria_goToStep.replace('{stepName}', step.name);
                    }
                    // For pending steps, ariaLabelValue remains just step.name.

                    const connectorIsActive = isEffectivelyComplete;

                    return (
                        <React.Fragment key={step.key || step.name}>
                            <li className="flex flex-col items-center" role="listitem">
                                <button
                                    type="button"
                                    onClick={() => canClick && onStepClick(stepNumber)}
                                    disabled={!canClick && !isCurrent}
                                    className={`
                                        flex flex-col items-center text-center p-1 sm:p-2 rounded-lg transition-colors duration-150 ease-in-out
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 dark:focus-visible:ring-offset-neutral-800
                                        ${canClick ? 'hover:bg-neutral-100 dark:hover:bg-neutral-700/60 cursor-pointer' : ''}
                                        ${isCurrent ? 'cursor-default' : ''}
                                        ${!canClick && !isCurrent ? 'cursor-not-allowed opacity-60' : 'opacity-100'}
                                    `}
                                    aria-current={isCurrent ? 'step' : undefined}
                                    aria-label={ariaLabelValue}
                                >
                                    <motion.div
                                        className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${circleClasses} transition-colors duration-300 ease-in-out mb-1 shadow-md`}
                                        animate={isCurrent ? { scale: 1.12, y: -2 } : { scale: 1, y: 0 }}
                                        transition={ICON_SCALE_TRANSITION}
                                    >
                                        {isTicked ? (
                                            <motion.div
                                                key={`icon-ticked-${stepNumber}`}
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
                                                exit={{ scale: 0, opacity: 0 }}
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
                                <li aria-hidden="true" className="flex-1 hidden sm:flex items-center mx-1 sm:mx-1.5 mt-[-1.75rem] sm:mt-[-2rem]">
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
    currentStep: PropTypes.number.isRequired,
    totalSteps: PropTypes.number,
    onStepClick: PropTypes.func,
    stepSaved: PropTypes.objectOf(
        PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['ticked'])])
    ).isRequired,
};

// ModalStepIndicator.defaultProps = { // No longer needed if totalSteps is derived or always passed
// totalSteps is not explicitly defaulted here anymore as it's derived from STEPS_CONFIG.length or passed.
// };

export default ModalStepIndicator;