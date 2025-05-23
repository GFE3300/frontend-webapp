import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Adjust path
import scriptLines from '../utils/script_lines'; // Added import

const ModalFooter = memo(({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    onSubmit,
    isSubmitting,
    isStepValid,
    formData,
}) => {
    const [isNextDisabledState, setIsNextDisabledState] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        let isActive = true;
        const checkValidity = async () => {
            if (typeof isStepValid !== 'function') {
                if (isActive) setIsNextDisabledState(true);
                return;
            }
            if (isActive) setIsValidating(true);
            const valid = await isStepValid();
            if (isActive) {
                setIsNextDisabledState(!valid);
                setIsValidating(false);
            }
        };

        checkValidity();
        return () => { isActive = false; };
    }, [isStepValid, currentStep, formData]);

    const buttonVariants = {
        hover: { scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 10 } },
        tap: { scale: 0.97 }
    };

    const finalIsNextDisabled = isSubmitting || isNextDisabledState || isValidating;

    const backButtonText = scriptLines.modalFooterBackButton || "Back";
    const continueButtonText = scriptLines.modalFooterContinueButton || "Continue";
    const validatingButtonText = scriptLines.modalFooterValidatingButton || "Validating...";
    const creatingButtonText = scriptLines.modalFooterCreatingButton || "Creating...";
    const createProductButtonText = scriptLines.modalFooterCreateProductButton || "Create Product";

    return (
        <footer className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-xl sticky bottom-0">
            <div className="flex justify-between items-center">
                {currentStep > 1 ? (
                    <motion.button
                        type="button"
                        onClick={onBack}
                        className="px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        {backButtonText}
                    </motion.button>
                ) : (
                    <div /> 
                )}

                {currentStep < totalSteps ? (
                    <motion.button
                        type="button"
                        onClick={onNext}
                        disabled={finalIsNextDisabled} // Ensure disabled attribute is set
                        className={`px-5 py-2.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                            ${(finalIsNextDisabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        variants={buttonVariants}
                        whileHover={!(finalIsNextDisabled) ? "hover" : ""}
                        whileTap={!(finalIsNextDisabled) ? "tap" : ""}
                    >
                        {isValidating ? (
                            <><Icon name="progress_activity" className="animate-spin w-4 h-4 mr-1.5 inline-block" /> {validatingButtonText}</>
                        ) : (
                            <>{continueButtonText} <Icon name="arrow_forward" className="w-4 h-4 ml-1.5 inline-block" /></>
                        )}
                    </motion.button>
                ) : (
                    <motion.button
                        type="button"
                        onClick={onSubmit}
                        disabled={finalIsNextDisabled} // Ensure disabled attribute is set
                        className={`px-5 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                            ${(finalIsNextDisabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        variants={buttonVariants}
                        whileHover={!(finalIsNextDisabled) ? "hover" : ""}
                        whileTap={!(finalIsNextDisabled) ? "tap" : ""}
                    >
                        {isSubmitting ? (
                            <><Icon name="progress_activity" className="animate-spin w-4 h-4 mr-1.5 inline-block" /> {creatingButtonText}</>
                        ) : isValidating ? (
                            <><Icon name="progress_activity" className="animate-spin w-4 h-4 mr-1.5 inline-block" /> {validatingButtonText}</>
                        ) : (
                            <><Icon name="add_task" className="w-4 h-4 mr-1.5 inline-block" /> {createProductButtonText}</>
                        )}
                    </motion.button>
                )}
            </div>
        </footer>
    );
});

ModalFooter.propTypes = {
    currentStep: PropTypes.number.isRequired,
    totalSteps: PropTypes.number.isRequired,
    onBack: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool,
    isStepValid: PropTypes.func.isRequired,
    formData: PropTypes.object.isRequired,
};

ModalFooter.defaultProps = {
    isSubmitting: false,
};

export default ModalFooter;