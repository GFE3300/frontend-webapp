import React, { useState, useCallback, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, useReducedMotion } from 'framer-motion';
import Icon from '../../../components/common/Icon';

// Default script lines, consider moving to a shared constants/localization file
const scriptLines = {
    formStep: {
        buttons: {
            back: "Back",
            continue: "Continue",
            submitProduct: "Create Product",
            submitting: "Creating...",
            validating: "Validating...",
        },
        themeColorDefault: "rose",
    }
};

/**
 * @component ProductFormStep
 * @description A wrapper component for individual steps in a multi-step form.
 * It handles the animation between steps and provides navigation buttons (Back, Continue/Submit).
 *
 * @param {Object} props - Component properties.
 * @param {number} props.stepIndex - 0-indexed internal identifier for this specific step's content.
 * @param {React.ReactNode} props.children - The actual form content for this step.
 * @param {boolean} [props.isFinalStep=false] - Indicates if this is the last step in the form.
 * @param {Object} props.formStateHook - The state and methods from the `useAddProductForm` hook.
 *   @param {number} props.formStateHook.currentStep - The current active step number (1-indexed).
 *   @param {Object} props.formStateHook.formData - The current state of the form data.
 *   @param {Object} [props.formStateHook.errors] - Current validation errors.
 *   @param {Function} props.formStateHook.validateStep - Async function to validate a specific step.
 *   @param {string} [props.formStateHook.submissionStatus] - Status of the form submission (e.g., 'submitting').
 *   @param {number} [props.formStateHook.navigationDirection] - Direction of navigation (-1 for back, 1 for forward).
 *   @param {Function} props.formStateHook.isCurrentStepValid - Async function to check if the current step's data is valid.
 * @param {Function} props.onProceed - Callback function to proceed to the next step.
 * @param {Function} props.onBack - Callback function to go to the previous step.
 * @param {Function} [props.onSubmit] - Callback function for final form submission (only used if `isFinalStep` is true).
 * @param {string} [props.themeColor='rose'] - Theme color for primary actions.
 */
const ProductFormStep = ({
    stepIndex,
    children,
    isFinalStep = false,
    formStateHook,
    onProceed,
    onBack,
    onSubmit,
    themeColor = scriptLines.formStep.themeColorDefault,
}) => {
    const prefersReducedMotion = useReducedMotion();
    const [isNavigating, setIsNavigating] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isButtonValidating, setIsButtonValidating] = useState(false);

    // Theme classes for buttons
    const THEME_CLASSES = {
        rose: {
            buttonPrimaryBg: 'bg-rose-500 hover:bg-rose-600',
            buttonPrimaryRing: 'focus-visible:ring-rose-500',
            buttonFinalBg: 'bg-green-500 hover:bg-green-600',
            buttonFinalRing: 'focus-visible:ring-green-500',
        },
        // Add other themes if needed (e.g., blue, teal)
        // blue: { buttonPrimaryBg: 'bg-blue-500 hover:bg-blue-600', ... }
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const { isEditMode } = formStateHook; // Get isEditMode from the hook

    // Animation configuration for step transitions
    const animationConfig = {
        stepVariants: {
            enter: (direction = 1) => ({
                x: prefersReducedMotion ? 0 : (direction > 0 ? '50%' : '-50%'),
                opacity: 0,
            }),
            center: {
                x: 0,
                opacity: 1,
                transition: { type: 'spring', stiffness: 300, damping: 30, duration: prefersReducedMotion ? 0 : 0.35 },
            },
            exit: (direction = 1) => ({
                x: prefersReducedMotion ? 0 : (direction < 0 ? '50%' : '-50%'),
                opacity: 0,
                transition: { type: 'spring', stiffness: 300, damping: 30, duration: prefersReducedMotion ? 0 : 0.2 },
            }),
        },
    };

    // Effect to update the disabled state of the Continue/Submit button based on current step validity
    useEffect(() => {
        let isActive = true;
        const checkStepValidity = async () => {
            // Only re-evaluate if this step is the one currently active in the modal
            if (formStateHook.currentStep === stepIndex + 1) { // formStateHook.currentStep is 1-indexed
                if (isActive) setIsButtonValidating(true);
                const valid = await formStateHook.isCurrentStepValid(); // isCurrentStepValid is an async function
                if (isActive) {
                    setIsButtonDisabled(!valid);
                    setIsButtonValidating(false);
                }
            } else {
                // If this specific ProductFormStep instance is not the active one,
                // its buttons shouldn't be interactive. However, the disabled state should reflect
                // the actual current step's validity. For simplicity, assume it's managed.
                // This effect primarily cares about its *own* content's validity when it *is* the current step.
                if (isActive) {
                    setIsButtonDisabled(true); // Default to disabled if not the active step, prevents premature enabling.
                    setIsButtonValidating(false);
                }
            }
        };

        checkStepValidity();
        return () => { isActive = false; }; // Cleanup to prevent state updates on unmounted component
    }, [formStateHook.isCurrentStepValid, formStateHook.formData, formStateHook.currentStep, stepIndex]);

    // Handler for proceeding to the next step
    const handleProceedInternal = useCallback(async () => {
        if (isNavigating || formStateHook.submissionStatus === 'submitting' || isButtonValidating) return;

        setIsNavigating(true);
        setIsButtonValidating(true);

        // Validate the current step before allowing progression
        const isValid = await formStateHook.validateStep(formStateHook.currentStep);

        setIsButtonValidating(false);

        if (isValid) {
            onProceed(); // Call the nextStep function from useAddProductForm
        }
        // Reset navigation lock after a delay to allow animations
        setTimeout(() => setIsNavigating(false), 500); // Adjust timeout based on animation duration

    }, [isNavigating, formStateHook, onProceed, isButtonValidating]);

    // Handler for submitting the entire form (or proceeding if not the final step)
    const handleSubmitForm = useCallback(async (e) => {
        e.preventDefault(); // Prevent default browser form submission
        if (isNavigating || formStateHook.submissionStatus === 'submitting' || isButtonValidating) return;

        if (isFinalStep) {
            if (typeof onSubmit === 'function') {
                onSubmit(); // Call the final submission handler from AddProductModal
            }
        } else {
            await handleProceedInternal(); // Otherwise, just proceed to the next step
        }
    }, [isFinalStep, onSubmit, handleProceedInternal, isNavigating, formStateHook.submissionStatus, isButtonValidating]);

    // Handler for navigating to the previous step
    const handleBackNavigation = useCallback(() => {
        if (isNavigating || formStateHook.submissionStatus === 'submitting') return;
        onBack(); // Call the prevStep function from useAddProductForm
    }, [onBack, isNavigating, formStateHook.submissionStatus]);

    // Final determination of whether the main action button (Continue/Submit) should be disabled
    const finalButtonDisabledState = formStateHook.submissionStatus === 'submitting' || isButtonDisabled || isButtonValidating || isNavigating;

    return (
        <motion.div
            className="product-form-step-animation-wrapper"
            custom={formStateHook.navigationDirection}
            variants={animationConfig.stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
        >
            <div className="product-form-step-content-wrapper font-montserrat pt-4 pb-2">
                <form onSubmit={handleSubmitForm} className="relative" noValidate>
                    <div className='space-y-6 md:space-y-8 h-120 px-1 pb-32 sm:pb-18 overflow-y-auto'>
                        {children}
                    </div>
                    <div className="step-controls absolute w-full bottom-0 pt-6 sm:pt-8 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3 sm:gap-4 pt-6 sm:pt-8 bg-gradient-to-t from-white dark:from-neutral-800 from-70% to-neutral-0/0 dark:to-neutral-900 to-90%">
                        {formStateHook.currentStep > 1 ? (
                            <motion.button
                                type="button"
                                onClick={handleBackNavigation}
                                disabled={isNavigating || formStateHook.submissionStatus === 'submitting'}
                                className="navigation-button back-button w-full sm:w-auto flex items-center justify-center gap-x-2 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-full transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:opacity-60"
                                whileHover={{ scale: (prefersReducedMotion || isNavigating || formStateHook.submissionStatus === 'submitting') ? 1 : 1.02 }}
                                whileTap={{ scale: (prefersReducedMotion || isNavigating || formStateHook.submissionStatus === 'submitting') ? 1 : 0.98 }}
                            >
                                <Icon name="chevron_left" className="w-6 h-6" aria-hidden="true" />
                                {scriptLines.formStep.buttons.back}
                            </motion.button>
                        ) : (
                            <div className="hidden sm:block sm:w-auto" style={{ minWidth: 'calc(6rem + 20px)' }} />
                        )}

                        <motion.button
                            type="submit"
                            disabled={finalButtonDisabledState}
                            className={`navigation-button submit-button w-full sm:w-auto flex items-center justify-center gap-x-2 px-5 py-2.5 text-sm font-semibold text-white 
                                        ${isFinalStep
                                    ? (formStateHook.submissionStatus === 'submitting' ? 'bg-gray-400 cursor-wait' : `${currentTheme.buttonFinalBg} ${currentTheme.buttonFinalRing}`)
                                    : `${currentTheme.buttonPrimaryBg} ${currentTheme.buttonPrimaryRing}`
                                } 
                                        rounded-full transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                        disabled:opacity-60 disabled:cursor-not-allowed`}
                            whileHover={{ scale: (prefersReducedMotion || finalButtonDisabledState) ? 1 : 1.02 }}
                            whileTap={{ scale: (prefersReducedMotion || finalButtonDisabledState) ? 1 : 0.98 }}
                            aria-live="polite"
                        >
                            {isButtonValidating ? (
                                <><Icon name="progress_activity" className="animate-spin w-6 h-6 mr-2" /> {scriptLines.formStep.buttons.validating}</>
                            ) : isFinalStep ? (
                                formStateHook.submissionStatus === 'submitting' ? (
                                    <><Icon name="progress_activity" className="animate-spin w-6 h-6 mr-2" /> {isEditMode ? "Saving..." : scriptLines.formStep.buttons.submitting}</>
                                ) : (
                                    <><Icon name={isEditMode ? "save" : "add_task"} className="w-6 h-6 mr-2" /> {isEditMode ? "Save Changes" : scriptLines.formStep.buttons.submitProduct}</>
                                )
                            ) : (
                                <>{scriptLines.formStep.buttons.continue} <Icon name="chevron_right" className="w-6 h-6 ml-1.5" aria-hidden="true" /></>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

ProductFormStep.propTypes = {
    stepIndex: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired,
    isFinalStep: PropTypes.bool,
    formStateHook: PropTypes.shape({
        currentStep: PropTypes.number.isRequired,
        formData: PropTypes.object.isRequired,
        errors: PropTypes.object,
        validateStep: PropTypes.func.isRequired,
        submissionStatus: PropTypes.string,
        navigationDirection: PropTypes.oneOf([-1, 1, undefined]),
        isCurrentStepValid: PropTypes.func.isRequired,
    }).isRequired,
    onProceed: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onSubmit: PropTypes.func, // Required only if isFinalStep is true
    themeColor: PropTypes.string,
};

export default memo(ProductFormStep);