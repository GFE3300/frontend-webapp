import React, { useState, useCallback, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, useReducedMotion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines'; // Import centralized scriptLines

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
 *   @param {boolean} [props.formStateHook.isEditMode] - Indicates if the form is in edit mode.
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
    themeColor = 'rose', // Default theme color kept static, not from scriptLines text
}) => {
    const prefersReducedMotion = useReducedMotion();
    const [isNavigating, setIsNavigating] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isButtonValidating, setIsButtonValidating] = useState(false);

    const THEME_CLASSES = {
        rose: {
            buttonPrimaryBg: 'bg-rose-500 hover:bg-rose-600',
            buttonPrimaryRing: 'focus-visible:ring-rose-500',
            buttonFinalBg: 'bg-green-500 hover:bg-green-600',
            buttonFinalRing: 'focus-visible:ring-green-500',
        },
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const { isEditMode } = formStateHook;

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

    useEffect(() => {
        let isActive = true;
        const checkStepValidity = async () => {
            if (formStateHook.currentStep === stepIndex + 1) {
                if (isActive) setIsButtonValidating(true);
                const valid = await formStateHook.isCurrentStepValid();
                if (isActive) {
                    setIsButtonDisabled(!valid);
                    setIsButtonValidating(false);
                }
            } else {
                if (isActive) {
                    setIsButtonDisabled(true);
                    setIsButtonValidating(false);
                }
            }
        };

        checkStepValidity();
        return () => { isActive = false; };
    }, [formStateHook.isCurrentStepValid, formStateHook.formData, formStateHook.currentStep, stepIndex]);

    const handleProceedInternal = useCallback(async () => {
        if (isNavigating || formStateHook.submissionStatus === 'submitting' || isButtonValidating) return;
        setIsNavigating(true);
        setIsButtonValidating(true);
        const isValid = await formStateHook.validateStep(formStateHook.currentStep);
        setIsButtonValidating(false);
        if (isValid) {
            onProceed();
        }
        setTimeout(() => setIsNavigating(false), 500);
    }, [isNavigating, formStateHook, onProceed, isButtonValidating]);

    const handleSubmitForm = useCallback(async (e) => {
        e.preventDefault();
        if (isNavigating || formStateHook.submissionStatus === 'submitting' || isButtonValidating) return;
        if (isFinalStep) {
            if (typeof onSubmit === 'function') {
                onSubmit();
            }
        } else {
            await handleProceedInternal();
        }
    }, [isFinalStep, onSubmit, handleProceedInternal, isNavigating, formStateHook.submissionStatus, isButtonValidating]);

    const handleBackNavigation = useCallback(() => {
        if (isNavigating || formStateHook.submissionStatus === 'submitting') return;
        onBack();
    }, [onBack, isNavigating, formStateHook.submissionStatus]);

    const finalButtonDisabledState = formStateHook.submissionStatus === 'submitting' || isButtonDisabled || isButtonValidating || isNavigating;

    // Localized button texts
    const backButtonText = scriptLines.productFormStepButtonBack || "Back";
    const continueButtonText = scriptLines.productFormStepButtonContinue || "Continue";
    const submitProductButtonText = scriptLines.productFormStepButtonSubmitProduct || "Create Product";
    const submittingButtonText = scriptLines.productFormStepButtonSubmitting || "Creating...";
    const validatingButtonText = scriptLines.productFormStepButtonValidating || "Validating...";
    const savingChangesButtonText = scriptLines.productFormStepButtonSaving || "Saving..."; // For edit mode
    const saveChangesButtonText = scriptLines.productFormStepButtonSaveChanges || "Save Changes"; // For edit mode

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
                    <div className="step-controls absolute w-full bottom-0 pt-6 sm:pt-8 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3 sm:gap-4 bg-gradient-to-t from-white dark:from-neutral-800 from-70% to-neutral-0/0 dark:to-neutral-0 to-90%"> {/* Removed pt-6 sm:pt-8 from here as it was doubled */}
                        {formStateHook.currentStep > 1 ? (
                            <motion.button
                                type="button"
                                onClick={handleBackNavigation}
                                className="navigation-button back-button w-full sm:w-auto flex items-center justify-center gap-x-2 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-full transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:opacity-60"
                                whileHover={{ scale: (prefersReducedMotion || isNavigating || formStateHook.submissionStatus === 'submitting') ? 1 : 1.02 }}
                                whileTap={{ scale: (prefersReducedMotion || isNavigating || formStateHook.submissionStatus === 'submitting') ? 1 : 0.98 }}
                            >
                                <Icon name="chevron_left" className="w-6 h-6" aria-hidden="true" />
                                {backButtonText}
                            </motion.button>
                        ) : (
                            <div className="hidden sm:block sm:w-auto" style={{ minWidth: 'calc(6rem + 20px)' }} />
                        )}

                        <motion.button
                            type="submit"
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
                                <><Icon name="progress_activity" className="animate-spin w-6 h-6 mr-2" /> {validatingButtonText}</>
                            ) : isFinalStep ? (
                                formStateHook.submissionStatus === 'submitting' ? (
                                    <><Icon name="progress_activity" className="animate-spin w-6 h-6 mr-2" /> {isEditMode ? savingChangesButtonText : submittingButtonText}</>
                                ) : (
                                    <><Icon name={isEditMode ? "save" : "add_task"} className="w-6 h-6 mr-2" /> {isEditMode ? saveChangesButtonText : submitProductButtonText}</>
                                )
                            ) : (
                                <>{continueButtonText} <Icon name="chevron_right" className="w-6 h-6 ml-1.5" aria-hidden="true" /></>
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
        isEditMode: PropTypes.bool, // Added isEditMode
    }).isRequired,
    onProceed: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    themeColor: PropTypes.string,
};

ProductFormStep.defaultProps = { // Added defaultProp for isEditMode in formStateHook
    formStateHook: {
        isEditMode: false,
    }
};


export default memo(ProductFormStep);