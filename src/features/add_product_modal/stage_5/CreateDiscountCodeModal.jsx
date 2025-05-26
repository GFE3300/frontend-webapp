import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { InputField, Dropdown } from '../../register/subcomponents';
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines';

// Default discount type options (values remain, labels come from scriptLines)
const defaultDiscountTypeOptions = [
    { value: 'percentage', label: scriptLines.createDiscountCodeModal.discountTypePercentageLabel },
    // Example for other types:
    // { value: 'fixed_amount_product', label: scriptLines.createDiscountCodeModal.discountTypeFixedAmountProductLabel.replace('{currencySymbol}', '€') },
];

/**
 * @component CreateDiscountCodeModal
 * @description A modal dialog for creating new master discount codes.
 */
const CreateDiscountCodeModal = ({
    isOpen,
    onClose,
    onCreateDiscount,
    existingCodes,
    discountTypeOptions = defaultDiscountTypeOptions,
}) => {
    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [codeName, setCodeName] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState(discountTypeOptions[0]?.value || 'percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [errors, setErrors] = useState({});
    const [isCreating, setIsCreating] = useState(false);

    const codeNameInputRef = useRef(null);
    const sl = scriptLines.createDiscountCodeModal; // MODIFIED: Alias for shorter access

    // ===========================================================================
    // Configuration
    // ===========================================================================
    const backdropVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
    };
    const modalVariants = {
        initial: { scale: 0.9, opacity: 0, y: 30 },
        animate: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.25, ease: "circOut" } },
        exit: { scale: 0.9, opacity: 0, y: 30, transition: { duration: 0.2, ease: "circIn" } },
    };

    const CODE_NAME_MIN_LENGTH = 3;
    const CODE_NAME_MAX_LENGTH = 25;
    const DESCRIPTION_MAX_LENGTH = 100;

    // ===========================================================================
    // Effects
    // ===========================================================================
    useEffect(() => {
        if (isOpen) {
            setCodeName('');
            setDescription('');
            setDiscountType(discountTypeOptions[0]?.value || 'percentage');
            setDiscountValue('');
            setErrors({});
            setIsCreating(false);
            const timer = setTimeout(() => codeNameInputRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen, discountTypeOptions]);

    // ===========================================================================
    // Validation Logic
    // ===========================================================================
    const validateForm = useCallback(() => {
        const newErrors = {};
        const trimmedCodeName = codeName.trim();
        const trimmedDescription = description.trim();

        if (!trimmedCodeName) {
            newErrors.codeName = sl.errorRequired.replace('{fieldName}', sl.codeNameLabel); // MODIFIED
        } else if (trimmedCodeName.length < CODE_NAME_MIN_LENGTH) {
            newErrors.codeName = sl.errorCodeNameMinLength.replace('{minLength}', String(CODE_NAME_MIN_LENGTH)); // MODIFIED
        } else if (trimmedCodeName.length > CODE_NAME_MAX_LENGTH) {
            newErrors.codeName = sl.errorCodeNameMaxLength.replace('{maxLength}', String(CODE_NAME_MAX_LENGTH)); // MODIFIED
        } else if (existingCodes.some(c => c.codeName.toLowerCase() === trimmedCodeName.toLowerCase())) {
            newErrors.codeName = sl.errorCodeNameExists; // MODIFIED
        }

        if (!trimmedDescription) {
            newErrors.description = sl.errorRequired.replace('{fieldName}', sl.descriptionLabel); // MODIFIED
        } else if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
            newErrors.description = sl.errorDescriptionMaxLength.replace('{maxLength}', String(DESCRIPTION_MAX_LENGTH)); // MODIFIED
        }

        const numDiscountValue = parseFloat(discountValue);
        if (discountValue === '' || isNaN(numDiscountValue)) {
            newErrors.discountValue = sl.errorDiscountValueRequired; // MODIFIED
        } else if (numDiscountValue <= 0) {
            newErrors.discountValue = sl.errorDiscountValuePositive; // MODIFIED
        } else if (discountType === 'percentage' && numDiscountValue > 100) {
            newErrors.discountValue = sl.errorDiscountPercentageMax; // MODIFIED
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [codeName, description, discountValue, discountType, existingCodes, sl]);

    // ===========================================================================
    // Event Handlers
    // ===========================================================================
    const handleSubmit = useCallback(async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (!validateForm()) return;

        setIsCreating(true);
        setErrors(prev => ({ ...prev, form: null }));

        try {
            const discountData = {
                codeName: codeName.trim().toUpperCase(),
                description: description.trim(),
                type: discountType,
                value: parseFloat(discountValue),
            };
            await onCreateDiscount(discountData);
            onClose();
        } catch (error) {
            console.error(sl.errorConsoleFailedCreate, error); // MODIFIED
            setErrors(prev => ({
                ...prev,
                form: error.message || sl.errorFormGeneric // MODIFIED
            }));
        } finally {
            setIsCreating(false);
        }
    }, [validateForm, codeName, description, discountType, discountValue, onCreateDiscount, onClose, sl]);

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    const codeNameHelp = sl.codeNameHelpText
        .replace('{minLength}', String(CODE_NAME_MIN_LENGTH))
        .replace('{maxLength}', String(CODE_NAME_MAX_LENGTH));

    const discountValueLabelText = discountType === 'percentage' ? sl.discountValueLabelPercentage : sl.discountValueLabelAmount;
    const discountValueHelpText = discountType === 'percentage' ? sl.discountValueHelpTextPercentage : sl.discountValueHelpTextAmount;
    // Assuming currency symbol needs to be dynamic, it would be passed or from a global config
    const currencySymbol = "€"; // Example, should ideally come from a config or prop
    const discountValueSuffix = discountType === 'percentage' ? "%" : currencySymbol;


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="create-discount-backdrop"
                    variants={backdropVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="fixed inset-0 z-[60] w-full overflow-x-hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-montserrat"
                    onClick={onClose}
                    data-testid="create-discount-modal-backdrop"
                >
                    <motion.div
                        key="create-discount-content"
                        variants={modalVariants}
                        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-discount-modal-title"
                        data-testid="create-discount-modal-content"
                    >
                        <div className="px-6 pt-5 pb-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700">
                            <h2 id="create-discount-modal-title" className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                                {sl.title} {/* MODIFIED */}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                aria-label={sl.closeButtonLabel} // MODIFIED
                                title={sl.closeButtonTitle} // MODIFIED
                                data-testid="close-modal-button"
                            >
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-12 max-h-[65vh] overflow-y-auto">
                            <InputField
                                ref={codeNameInputRef}
                                className="mt-6"
                                id="newDiscountCodeName"
                                label={sl.codeNameLabel} // MODIFIED
                                value={codeName}
                                onChange={e => setCodeName(e.target.value.toUpperCase())}
                                error={errors.codeName}
                                required
                                placeholder={sl.codeNamePlaceholder} // MODIFIED
                                maxLength={CODE_NAME_MAX_LENGTH}
                                helptext={codeNameHelp} // MODIFIED
                                classNameWrapper="relative"
                            />
                            <InputField
                                id="newDiscountDescription"
                                label={sl.descriptionLabel} // MODIFIED
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                error={errors.description}
                                required
                                placeholder={sl.descriptionPlaceholder} // MODIFIED
                                maxLength={DESCRIPTION_MAX_LENGTH}
                                helptext={sl.descriptionHelpText} // MODIFIED
                                classNameWrapper="relative"
                            />
                            <Dropdown
                                id="newDiscountType"
                                label={sl.discountTypeLabel} // MODIFIED
                                options={discountTypeOptions} // Labels for options should come from scriptLines via defaultDiscountTypeOptions
                                value={discountType}
                                onChange={setDiscountType}
                                error={errors.discountType}
                                helptext={sl.discountTypeHelpText} // MODIFIED
                                classNameWrapper="relative"
                            />
                            <InputField
                                id="newDiscountValue"
                                label={discountValueLabelText} // MODIFIED
                                type="number"
                                value={discountValue}
                                onChange={e => setDiscountValue(e.target.value)}
                                error={errors.discountValue}
                                min="0.01"
                                step={discountType === 'percentage' ? "1" : "0.01"}
                                max={discountType === 'percentage' ? "100" : undefined}
                                required
                                suffix={discountValueSuffix} // MODIFIED (suffix needs to be dynamic)
                                helptext={discountValueHelpText} // MODIFIED
                                classNameWrapper="relative"
                            />

                            {errors.form && (
                                <p className="text-sm text-red-600 dark:text-red-400 p-2.5 bg-red-50 dark:bg-red-900/30 rounded-md flex items-center gap-1.5" role="alert" data-testid="form-level-error">
                                    <Icon name="error_outline" className="w-6 h-6 flex-shrink-0" />
                                    {errors.form}
                                </p>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-700/60 rounded-b-xl flex justify-end items-center space-x-3 border-t border-neutral-200 dark:border-neutral-700">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isCreating}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:opacity-70"
                            >
                                {sl.cancelButtonText} {/* MODIFIED */}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isCreating || Object.keys(errors).some(key => errors[key] && key !== 'form')}
                                className="px-5 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isCreating ? (
                                    <><Icon name="progress_activity" className="w-4 h-4 animate-spin inline mr-2" />{sl.creatingButtonText}</> // MODIFIED
                                ) : (
                                    sl.createButtonText // MODIFIED
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

CreateDiscountCodeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreateDiscount: PropTypes.func.isRequired,
    existingCodes: PropTypes.arrayOf(PropTypes.shape({
        codeName: PropTypes.string.isRequired,
    })).isRequired,
    discountTypeOptions: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })),
};

CreateDiscountCodeModal.defaultProps = {
    // discountTypeOptions are now initialized with localized labels at the top
    // So, we can remove it from here IF the localized `defaultDiscountTypeOptions` at the top is sufficient
    // If `discountTypeOptions` prop can be passed to override, then this default might still be needed
    // but it won't be localized unless the passed prop itself is localized.
    // For now, assuming the top-level definition handles the default.
};

export default memo(CreateDiscountCodeModal);