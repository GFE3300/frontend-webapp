import React, { useState, useEffect, memo, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { InputField, Dropdown } from '../../register/subcomponents';
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines';

// Define discount type options using scriptLines for labels
const getDiscountTypeOptions = (currencySymbol = '$') => [
    { value: 'percentage', label: scriptLines.createDiscountCodeModal.discountTypePercentageLabel || 'Percentage Off Product (%)' },
    { value: 'fixed_amount_product', label: (scriptLines.createDiscountCodeModal.discountTypeFixedAmountProductLabel || 'Fixed Amount Off Product ({currencySymbol})').replace('{currencySymbol}', currencySymbol) },
];


const CreateDiscountCodeModal = ({
    isOpen,
    onClose,
    onCreateDiscount,
    existingCodes,
    // discountTypeOptions prop is kept if parent wants to override, but default is now dynamic
    discountTypeOptions: discountTypeOptionsProp,
}) => {
    const [codeName, setCodeName] = useState('');
    const [description, setDescription] = useState(''); // This maps to internal_description
    const [discountType, setDiscountType] = useState('');
    const [discountValue, setDiscountValue] = useState('');
    const [errors, setErrors] = useState({});
    const [isCreating, setIsCreating] = useState(false);

    const codeNameInputRef = useRef(null);
    const sl = scriptLines.createDiscountCodeModal;
    const currencySymbol = scriptLines.currencySymbolDefault || '$'; // Or from a global config

    // Use passed options or generate default ones
    const currentDiscountTypeOptions = useMemo(() => 
        discountTypeOptionsProp || getDiscountTypeOptions(currencySymbol),
        [discountTypeOptionsProp, currencySymbol]
    );
    
    useEffect(() => {
        if (isOpen) {
            setCodeName('');
            setDescription('');
            // Set default discountType from potentially dynamic options
            setDiscountType(currentDiscountTypeOptions[0]?.value || 'percentage');
            setDiscountValue('');
            setErrors({});
            setIsCreating(false);
            const timer = setTimeout(() => codeNameInputRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen, currentDiscountTypeOptions]);

    const CODE_NAME_MIN_LENGTH = 3;
    const CODE_NAME_MAX_LENGTH = 25;
    const DESCRIPTION_MAX_LENGTH = 100;

    const validateForm = useCallback(() => {
        const newErrors = {};
        const trimmedCodeName = codeName.trim();
        const trimmedDescription = description.trim();

        if (!trimmedCodeName) {
            newErrors.codeName = sl.errorRequired.replace('{fieldName}', sl.codeNameLabel);
        } else if (trimmedCodeName.length < CODE_NAME_MIN_LENGTH) {
            newErrors.codeName = sl.errorCodeNameMinLength.replace('{minLength}', String(CODE_NAME_MIN_LENGTH));
        } else if (trimmedCodeName.length > CODE_NAME_MAX_LENGTH) {
            newErrors.codeName = sl.errorCodeNameMaxLength.replace('{maxLength}', String(CODE_NAME_MAX_LENGTH));
        } else if (existingCodes.some(c => c.codeName.toLowerCase() === trimmedCodeName.toLowerCase())) {
            newErrors.codeName = sl.errorCodeNameExists;
        }

        if (!trimmedDescription) {
            // This description is for 'internal_description'
            newErrors.description = sl.errorRequired.replace('{fieldName}', sl.descriptionLabel);
        } else if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
            newErrors.description = sl.errorDescriptionMaxLength.replace('{maxLength}', String(DESCRIPTION_MAX_LENGTH));
        }

        const numDiscountValue = parseFloat(discountValue);
        if (discountValue === '' || isNaN(numDiscountValue)) {
            newErrors.discountValue = sl.errorDiscountValueRequired;
        } else if (numDiscountValue <= 0) {
            newErrors.discountValue = sl.errorDiscountValuePositive;
        } else if (discountType === 'percentage' && numDiscountValue > 100) {
            newErrors.discountValue = sl.errorDiscountPercentageMax;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [codeName, description, discountValue, discountType, existingCodes, sl]);

    const handleSubmit = useCallback(async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (!validateForm()) return;

        setIsCreating(true);
        setErrors(prev => ({ ...prev, form: null })); // Clear general form error

        try {
            const discountDataForParent = { // Data to be sent to parent (Step5)
                codeName: codeName.trim(), // Uppercasing will happen in Step5 or backend
                description: description.trim(), // This is internal_description
                type: discountType,
                value: parseFloat(discountValue),
            };
            await onCreateDiscount(discountDataForParent); // This calls handleCreateDiscountCode in Step5
            onClose(); // Close modal on success
        } catch (error) {
            console.error(sl.errorConsoleFailedCreate, error);
            if (error.fieldErrors) { // Check for structured field errors from parent
                setErrors(prev => ({ ...prev, ...error.fieldErrors, form: null }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    form: error.message || sl.errorFormGeneric
                }));
            }
        } finally {
            setIsCreating(false);
        }
    }, [validateForm, codeName, description, discountType, discountValue, onCreateDiscount, onClose, sl]);
    
    const backdropVariants = { /* ... (no change) ... */ };
    const modalVariants = { /* ... (no change) ... */ };

    const codeNameHelp = sl.codeNameHelpText
        .replace('{minLength}', String(CODE_NAME_MIN_LENGTH))
        .replace('{maxLength}', String(CODE_NAME_MAX_LENGTH));

    const discountValueLabelText = discountType === 'percentage' 
        ? sl.discountValueLabelPercentage 
        : sl.discountValueLabelAmount.replace('{currencySymbol}', currencySymbol);
    const discountValueHelpText = discountType === 'percentage' 
        ? sl.discountValueHelpTextPercentage 
        : sl.discountValueHelpTextAmount.replace('{currencySymbol}', currencySymbol);
    const discountValueSuffix = discountType === 'percentage' ? "%" : currencySymbol;


    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="create-discount-backdrop"
                    variants={backdropVariants} initial="initial" animate="animate" exit="exit"
                    className="fixed inset-0 z-[60] w-full overflow-x-hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-montserrat mb-0"
                    onClick={onClose}
                    data-testid="create-discount-modal-backdrop"
                >
                    <motion.div
                        key="create-discount-content"
                        variants={modalVariants}
                        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog" aria-modal="true" aria-labelledby="create-discount-modal-title"
                        data-testid="create-discount-modal-content"
                    >
                        <div className="px-6 pt-5 pb-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700">
                            <h2 id="create-discount-modal-title" className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                                {sl.title}
                            </h2>
                            <button
                                type="button" onClick={onClose}
                                className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                aria-label={sl.closeButtonLabel} title={sl.closeButtonTitle}
                                data-testid="close-modal-button"
                            >
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="max-h-[65vh] overflow-y-auto">
                            <div className="px-6 py-5 space-y-6"> {/* Reduced space-y-12 to space-y-6 */}
                                <InputField
                                    ref={codeNameInputRef}
                                    id="newDiscountCodeName" label={sl.codeNameLabel}
                                    value={codeName} onChange={e => setCodeName(e.target.value)} // Uppercasing at submission
                                    error={errors.codeName} required placeholder={sl.codeNamePlaceholder}
                                    maxLength={CODE_NAME_MAX_LENGTH} helptext={codeNameHelp}
                                />
                                <InputField
                                    id="newDiscountDescription" label={sl.descriptionLabel}
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    error={errors.description} required placeholder={sl.descriptionPlaceholder}
                                    maxLength={DESCRIPTION_MAX_LENGTH} helptext={sl.descriptionHelpText}
                                    isTextArea rows={3} // Make it a textarea
                                />
                                <Dropdown
                                    id="newDiscountType" label={sl.discountTypeLabel}
                                    options={currentDiscountTypeOptions} // Use dynamic options
                                    value={discountType} onChange={setDiscountType}
                                    error={errors.discountType} helptext={sl.discountTypeHelpText}
                                />
                                <InputField
                                    id="newDiscountValue" label={discountValueLabelText}
                                    type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)}
                                    error={errors.discountValue}
                                    min="0.01" step={discountType === 'percentage' ? "1" : "0.01"}
                                    max={discountType === 'percentage' ? "100" : undefined}
                                    required suffix={discountValueSuffix} helptext={discountValueHelpText}
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
                                    type="button" onClick={onClose} disabled={isCreating}
                                    className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:opacity-70"
                                >
                                    {sl.cancelButtonText}
                                </button>
                                <button
                                    type="submit" disabled={isCreating || Object.keys(errors).some(key => errors[key] && key !== 'form')}
                                    className="px-5 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? (
                                        <><Icon name="progress_activity" className="w-4 h-4 animate-spin inline mr-2" />{sl.creatingButtonText}</>
                                    ) : (
                                        sl.createButtonText
                                    )}
                                </button>
                            </div>
                        </form>
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

// Default props for discountTypeOptions can be removed if getDiscountTypeOptions is always used internally
// CreateDiscountCodeModal.defaultProps = {
//    discountTypeOptions: getDiscountTypeOptions(), // This would call it at module load time
// };

export default memo(CreateDiscountCodeModal);