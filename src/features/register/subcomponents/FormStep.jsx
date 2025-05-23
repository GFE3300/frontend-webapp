import React, { useState, useCallback, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Icon from "../../../components/common/Icon";
import { scriptLines_Components as scriptLines } from '../utils/script_lines';

/**
 * FormStep component renders an individual step within a multi-step form.
 * It is responsible for the layout, animation, and navigation controls of a single step.
 * It displays a title, progress indicator, the step's content (children), and
 * Back/Continue/Submit buttons. Content can be passed as direct React nodes or
 * as a render function for more dynamic scenarios requiring access to form state.
 * This component is memoized, internationalized, and built for production quality.
 *
 * @component FormStep
 * @param {Object} props - Component properties.
 * @param {number} props.stepIndex - The 0-based index of the current step. This is crucial for display and logic. (Required)
 * @param {string} props.title - The title to be displayed for this step. (Required)
 * @param {React.ReactNode|Function} props.children - The content of the step.
 *        If a function, it receives an object `{ formData, errors, updateField }` and should return React nodes. (Required)
 * @param {boolean} [props.isFinalStep=false] - Flag indicating if this is the last step in the form, affecting button text and behavior.
 * @param {Object} props.formState - The global form state object, typically from `useFormState` or a similar state management solution.
 *        Must include `currentStep`, `formData`, `errors`, `generalError`, `validateStep`, `updateFormData`,
 *        `submissionStatus`, and `navigationDirection`. (Required)
 * @param {Function} props.onProceed - Callback function invoked to proceed to the next step (after validation). (Required)
 * @param {Function} props.onBack - Callback function invoked to navigate to the previous step. (Required)
 * @param {Function} [props.onSubmit] - Optional callback function specifically for form submission on the final step.
 *        If not provided and `isFinalStep` is true, `onProceed` (which includes validation) is used by default.
 * @param {string} [props.themeColor=scriptLines.formStep.themeColorDefault] - The primary theme color for accents (e.g., "rose").
 *        Defaults to a value from `scriptLines`.
 * @param {number} [props.totalFormSteps=6] - The total number of steps in the form, used for the progress indicator.
 */
const FormStep = ({
    stepIndex,
    title,
    children,
    isFinalStep = false,
    formState,
    onProceed,
    onBack,
    onSubmit,
    themeColor = '',
    totalFormSteps = 6, // Default total steps, can be overridden by prop
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const prefersReducedMotion = useReducedMotion();

    // Theme classes for dynamic styling based on `themeColor` prop.
    const THEME_CLASSES = {
        rose: {
            buttonPrimary: 'bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-500',
            textAccent: 'text-rose-500', // Example, not used directly in this version but good for extension
            progressBg: 'bg-rose-100 dark:bg-rose-900',
            progressText: 'text-rose-600 dark:text-rose-300',
        },
        // Example of another theme:
        // blue: {
        //     buttonPrimary: 'bg-blue-500 hover:bg-blue-600 focus-visible:ring-blue-500',
        //     textAccent: 'text-blue-500',
        //     progressBg: 'bg-blue-100 dark:bg-blue-900',
        //     progressText: 'text-blue-600 dark:text-blue-300',
        // }
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose; // Fallback to rose theme.

    // Framer Motion animation configurations, respecting `prefersReducedMotion`.
    const animationConfig = {
        stepVariants: {
            enter: (direction = 1) => ({
                x: prefersReducedMotion ? 0 : (direction > 0 ? '80%' : '-80%'),
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 0.98,
            }),
            center: {
                x: 0,
                opacity: 1,
                scale: 1,
                transition: { type: 'spring', stiffness: 260, damping: 30, duration: prefersReducedMotion ? 0 : 0.5 },
            },
            exit: (direction = 1) => ({
                x: prefersReducedMotion ? 0 : (direction < 0 ? '80%' : '-80%'),
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 0.98,
                transition: { type: 'spring', stiffness: 260, damping: 30, duration: prefersReducedMotion ? 0 : 0.3 },
            }),
        },
        contentAnimation: {
            initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: prefersReducedMotion ? 0 : 0.15, duration: prefersReducedMotion ? 0 : 0.4, ease: "circOut" },
        },
        buttonVariants: {
            initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 },
            animate: { opacity: 1, scale: 1, transition: { delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.3 } },
            exit: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.9, transition: { duration: prefersReducedMotion ? 0 : 0.2 } },
        },
    };

    // ===========================================================================
    // State
    // ===========================================================================
    // Tracks if a navigation action (proceed/submit) is currently in progress to prevent multiple submissions.
    const [isNavigating, setIsNavigating] = useState(false);
    // Local error state for displaying errors specific to this component's actions (e.g., unexpected validation error).
    // Also reflects `formState.generalError`.
    const [localError, setLocalError] = useState(formState?.generalError || null);

    // Effect to sync localError with formState.generalError.
    useEffect(() => {
        setLocalError(formState?.generalError || null);
    }, [formState?.generalError]);

    // ===========================================================================
    // Handlers (Memoized for performance)
    // ===========================================================================

    /**
     * Handles proceeding to the next step. It first validates the current step using `formState.validateStep`.
     * If valid, `onProceed` is called. Manages `isNavigating` state and clears/sets `localError`.
     */
    const handleProceedInternal = useCallback(async () => {
        if (isNavigating) return;
        setIsNavigating(true);
        setLocalError(null); // Clear previous local/general error before new action

        try {
            // `formState.currentStep` should ideally align with `stepIndex` passed to this component.
            const isValid = await formState.validateStep(formState.currentStep);
            if (isValid) {
                onProceed();
            } else {
                // `formState.validateStep` is expected to set `formState.errors` and potentially `formState.generalError`.
                // The component will re-render due to `formState` changes, displaying new errors.
                // `localError` will be updated by the useEffect watching `formState.generalError`.
            }
        } catch (error) {
            console.error(scriptLines.formStep.console.validationOrProceedError, error);
            setLocalError(scriptLines.formStep.errors.unexpectedError);
        } finally {
            // Delay resetting `isNavigating` to allow animations and prevent rapid clicks.
            setTimeout(() => setIsNavigating(false), prefersReducedMotion ? 50 : 500);
        }
    }, [isNavigating, formState, onProceed, prefersReducedMotion]);

    /**
     * Unified submission handler for the form within the step.
     * If it's the final step and a specific `onSubmit` prop is provided, it calls that.
     * Otherwise, it defaults to `handleProceedInternal` (which includes validation).
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
     */
    const handleSubmitForm = useCallback(async (e) => {
        e.preventDefault(); // Prevent default browser form submission.
        if (isFinalStep && typeof onSubmit === 'function') {
            onSubmit(); // Caller's `onSubmit` is responsible for its own validation logic (e.g., `formState.submitForm()`) and loading states.
        } else {
            await handleProceedInternal(); // Default action includes validation of the current step.
        }
    }, [isFinalStep, onSubmit, handleProceedInternal]);

    /**
     * Handles navigating to the previous step. Calls the `onBack` prop.
     */
    const handleBackNavigation = useCallback(() => {
        if (isNavigating) return; // Prevent navigation if another action is in progress.
        // No validation needed for going back.
        onBack();
    }, [onBack, isNavigating]);

    // ===========================================================================
    // Validation (Prop Validation - Essential for component integrity)
    // ===========================================================================
    // This section ensures that all required props are provided and are of the correct type.
    // If validation fails, localized error messages are logged and a fallback UI is rendered.

    if (typeof stepIndex !== 'number' || stepIndex < 0) {
        console.error(scriptLines.formStep.console.invalidStepIndexProp);
        return <p className="text-red-500 p-4 text-center">{scriptLines.formStep.errors.stepConfigurationInvalid}</p>;
    }
    if (!title || typeof title !== 'string') {
        // Although title is required by PropTypes, provide a runtime check.
        console.error(scriptLines.formStep.console.invalidTitleProp);
        // Fallback: Render without a title or show an error. For robustness, let's allow rendering without title but log error.
        // title = "Untitled Step"; // Or handle more gracefully. For now, error is logged, rendering continues.
    }
    if (!children) {
        console.error(scriptLines.formStep.console.missingChildrenProp);
        return <p className="text-red-500 p-4 text-center">{scriptLines.formStep.errors.stepContentMissing}</p>;
    }
    if (typeof formState !== 'object' || formState === null || typeof formState.validateStep !== 'function') {
        console.error(scriptLines.formStep.console.invalidFormStateProp);
        return <p className="text-red-500 p-4 text-center">{scriptLines.formStep.errors.formContextUnavailable}</p>;
    }
    if (typeof onProceed !== 'function' || typeof onBack !== 'function') {
        console.error(scriptLines.formStep.console.missingNavigationHandlers);
        return <p className="text-red-500 p-4 text-center">{scriptLines.formStep.errors.navigationHandlersMissing}</p>;
    }
    if (isFinalStep && onSubmit && typeof onSubmit !== 'function') {
        console.warn(scriptLines.formStep.console.invalidOnSubmitProp);
        // `onSubmit` will be ignored, and `handleSubmit` will default to `handleProceed`.
    }

    // ===========================================================================
    // Rendering
    // ===========================================================================
    return (
        <motion.div
            key={`form-step-${stepIndex}`} // Unique key for `AnimatePresence` to detect changes between steps.
            className="form-step-container font-montserrat relative w-full max-w-2xl mx-auto bg-white dark:bg-neutral-800/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-black/20"
            variants={animationConfig.stepVariants}
            custom={formState.navigationDirection} // Pass navigation direction for enter/exit animations.
            initial="enter"
            animate="center"
            exit="exit"
            // Using `role="group"` as `role="form"` should be on the actual `<form>` element.
            // `aria-labelledby` points to the step title for accessibility.
            role="group"
            aria-labelledby={`step-${stepIndex}-title`}
            data-testid={`form-step-${stepIndex}`}
        >
            {/* Step Header: Displays title and progress indicator. */}
            <header className="step-header flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2
                    id={`step-${stepIndex}-title`}
                    className="step-title text-2xl sm:text-3xl font-medium text-neutral-800 dark:text-neutral-100 font-montserrat tracking-tight mb-2 sm:mb-0"
                >
                    {title}
                </h2>
                <div className={`step-progress text-sm font-semibold px-4 py-1.5 rounded-full font-montserrat ${currentTheme.progressBg} ${currentTheme.progressText}`}>
                    {scriptLines.formStep.progress.step} {stepIndex + 1}{' '}
                    <span className="opacity-70 font-medium">{scriptLines.formStep.progress.of} {totalFormSteps}</span>
                </div>
            </header>

            {/* Step Content Area: Renders children within an animated container and a semantic <form> element. */}
            <motion.div
                className="step-content"
                variants={animationConfig.contentAnimation}
                initial="initial"
                animate="animate"
            >
                <form
                    onSubmit={handleSubmitForm} // Handles form submission.
                    className="space-y-12" // Apply consistent spacing if children don't manage it. Original had mt-12, changed for consistency.
                    noValidate // Disable native browser validation; rely on custom validation (e.g., Yup via formState).
                >
                    {/* Render step-specific content (children).
                        If `children` is a function, call it with form context props.
                        This allows children to be more tightly coupled with form state if needed.
                    */}
                    {typeof children === 'function'
                        ? children({
                            formData: formState.formData,
                            errors: formState.errors,
                            updateField: formState.updateFormData, // Assuming updateFormData is the correct function from useFormState
                            // Potentially pass other relevant parts of formState if children need direct access,
                            // e.g., setGeneralError, specific validation functions.
                        })
                        : children}

                    {/* Step Navigation Controls: Back, Continue/Submit buttons. */}
                    <div className="step-controls pt-6 sm:pt-8 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4 border-t border-neutral-200 dark:border-neutral-700 mt-8">
                        {/* Back Button: Visible if not the first step. */}
                        {stepIndex > 0 && (
                            <motion.button
                                type="button" // Important: not type="submit"
                                onClick={handleBackNavigation}
                                disabled={isNavigating} // Disable while another navigation is in progress
                                className="navigation-button back-button w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-montserrat rounded-full font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                variants={animationConfig.buttonVariants}
                                initial="initial" animate="animate" exit="exit"
                                whileHover={{ scale: prefersReducedMotion || isNavigating ? 1 : 1.03 }}
                                whileTap={{ scale: prefersReducedMotion || isNavigating ? 1 : 0.97 }}
                                data-testid="back-button"
                            >
                                <Icon name="chevron_left" className="w-6 h-6" aria-hidden="true" />
                                {scriptLines.formStep.buttons.back}
                            </motion.button>
                        )}

                        {/* Spacer: Ensures Next/Submit button is right-aligned when Back button is hidden. */}
                        {stepIndex === 0 && <div className="sm:w-auto hidden sm:block" style={{ minWidth: 'calc(6rem + 12px)' }} />}

                        {/* Next / Submit Button: Dynamically changes text and action based on `isFinalStep`. */}
                        <motion.button
                            type="submit" // Triggers the <form onSubmit={handleSubmitForm}>.
                            disabled={isNavigating || formState.submissionStatus === 'submitting'}
                            className={`navigation-button ${isFinalStep ? 'submit-button' : 'next-button'} w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white font-montserrat
                                        ${isFinalStep
                                    ? (formState.submissionStatus === 'submitting' ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600 focus-visible:ring-green-500') // Different style for submitting
                                    : `${currentTheme.buttonPrimary}`
                                } 
                                        transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                        disabled:opacity-60 disabled:cursor-not-allowed`}
                            variants={animationConfig.buttonVariants}
                            initial="initial" animate="animate" exit="exit"
                            whileHover={{ scale: (prefersReducedMotion || isNavigating || formState.submissionStatus === 'submitting') ? 1 : 1.03 }}
                            whileTap={{ scale: (prefersReducedMotion || isNavigating || formState.submissionStatus === 'submitting') ? 1 : 0.97 }}
                            data-testid={isFinalStep ? "submit-button" : "next-button"}
                            aria-live="polite" // Announce changes for assistive technologies
                        >
                            {isFinalStep
                                ? (formState.submissionStatus === 'submitting'
                                    ? <> <Icon name="progress_activity" className="animate-spin w-6 h-6 mr-2" /> {scriptLines.formStep.buttons.submitting} </>
                                    : <> <Icon name="check_circle" className="w-6 h-6 mr-2" /> {scriptLines.formStep.buttons.completeRegistration} </>
                                )
                                : <> {scriptLines.formStep.buttons.continue} <Icon name="chevron_right" className="w-6 h-6" aria-hidden="true" /> </>
                            }
                        </motion.button>
                    </div>
                </form>
            </motion.div>

            {/* General Error Display Toast: Shows local errors or `formState.generalError`. */}
            <AnimatePresence>
                {localError && (
                    <motion.div
                        className="error-toast absolute -bottom-14 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] sm:w-auto max-w-md bg-red-500 text-white px-4 py-3 sm:px-6 rounded-full mt-4 flex items-center gap-3 shadow-lg text-sm z-20"
                        initial={{ y: 20, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 10, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        role="alert"
                        data-testid="form-step-error"
                    >
                        <Icon name="error" className="w-6 h-6 flex-shrink-0" />
                        <span className="font-semibold font-montserrat flex-grow">{localError}</span>
                        <button
                            onClick={() => setLocalError(null)}
                            className="ml-auto p-1 -mr-1 h-7 w-7 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                            aria-label="Dismiss error" // Accessibility for close button
                        >
                            <Icon name="close" className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Define prop types for type safety, improved documentation, and developer experience.
FormStep.propTypes = {
    /** The 0-based index of the current step. Required. */
    stepIndex: PropTypes.number.isRequired,
    /** The title to be displayed for this step. Required. */
    title: PropTypes.string.isRequired,
    /** 
     * The content of the step. Can be React nodes or a function. 
     * If a function, it receives `{ formData, errors, updateField }` and must return React nodes. Required.
     */
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
    /** Flag indicating if this is the last step in the form. Optional. */
    isFinalStep: PropTypes.bool,
    /** 
     * The global form state object. Must include specified properties and methods. Required.
     * - `currentStep`: Current active step index.
     * - `formData`: The object holding all form data.
     * - `errors`: Field-specific validation errors.
     * - `generalError`: A general error message for the current step or form.
     * - `validateStep`: Function to validate a specific step.
     * - `updateFormData`: Function to update the formData.
     * - `submissionStatus`: Form submission status ('idle', 'submitting', 'success', 'error').
     * - `navigationDirection`: Indicates direction of navigation (1 for next, -1 for back) for animations.
     */
    formState: PropTypes.shape({
        currentStep: PropTypes.number.isRequired,
        formData: PropTypes.object.isRequired,
        errors: PropTypes.object,
        generalError: PropTypes.string,
        validateStep: PropTypes.func.isRequired,
        updateFormData: PropTypes.func.isRequired,
        submissionStatus: PropTypes.string,
        navigationDirection: PropTypes.oneOf([-1, 1, undefined]),
        // submitForm: PropTypes.func, // Include if `onSubmit` might rely on it via default behavior
    }).isRequired,
    /** Callback function to proceed to the next step. Required. */
    onProceed: PropTypes.func.isRequired,
    /** Callback function to navigate to the previous step. Required. */
    onBack: PropTypes.func.isRequired,
    /** Optional callback for final step submission. If not provided, `onProceed` is used. */
    onSubmit: PropTypes.func,
    /** The primary theme color for accents. Optional. */
    themeColor: PropTypes.string,
    /** Total number of steps in the form for the progress indicator. Optional. */
    totalFormSteps: PropTypes.number,
};

// Specify default props for optional props.
FormStep.defaultProps = {
    isFinalStep: false,
    themeColor: '', // Use localized default
    onSubmit: undefined, // Explicitly undefined
    totalFormSteps: 6, // Default if not passed
};

// Export the component, memoized for performance optimization.
export default memo(FormStep);