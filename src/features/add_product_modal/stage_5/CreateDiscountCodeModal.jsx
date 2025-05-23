import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { InputField, Dropdown } from '../../register/subcomponents'; // Assuming path
import Icon from '../../../components/common/Icon'; // Assuming path

// Default discount type options
const defaultDiscountTypeOptions = [
    { value: 'percentage', label: 'Percentage Off (%)' },
    // { value: 'fixed_amount_product', label: 'Fixed Amount Off Product (€)' }, // Example of other types
];

/**
 * @component CreateDiscountCodeModal
 * @description A modal dialog for creating new master discount codes. It includes fields for
 * code name, description, discount type, and discount value, along with validation.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {Function} props.onClose - Callback function invoked when the modal requests to be closed.
 * @param {Function} props.onCreateDiscount - Asynchronous callback function invoked upon successful form submission.
 *   It receives a `discountData` object: `{ codeName: string, description: string, type: string, value: number }`.
 *   It should return the newly created discount object or throw an error if creation fails.
 * @param {Array<Object>} props.existingCodes - An array of existing discount code objects, typically `{ codeName: string }`,
 *   used to check for duplicate code names (case-insensitive).
 * @param {Array<Object>} [props.discountTypeOptions=defaultDiscountTypeOptions] - Options for the discount type dropdown.
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
    const [errors, setErrors] = useState({}); // For field-specific and form-level errors
    const [isCreating, setIsCreating] = useState(false); // Loading state for submission

    const codeNameInputRef = useRef(null); // Ref for the first input field for autofocus

    // ===========================================================================
    // Configuration
    // ===========================================================================

    // Framer Motion animation variants
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
    const CODE_NAME_MAX_LENGTH = 25; // Max length for discount code
    const DESCRIPTION_MAX_LENGTH = 100; // Max length for description

    // ===========================================================================
    // Effects
    // ===========================================================================

    // Effect to reset form state when modal opens and focus the first input
    useEffect(() => {
        if (isOpen) {
            setCodeName('');
            setDescription('');
            setDiscountType(discountTypeOptions[0]?.value || 'percentage');
            setDiscountValue('');
            setErrors({});
            setIsCreating(false);

            const timer = setTimeout(() => {
                codeNameInputRef.current?.focus();
            }, 150);
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
            newErrors.codeName = 'Discount code name is required.';
        } else if (trimmedCodeName.length < CODE_NAME_MIN_LENGTH) {
            newErrors.codeName = `Code must be at least ${CODE_NAME_MIN_LENGTH} characters.`;
        } else if (trimmedCodeName.length > CODE_NAME_MAX_LENGTH) {
            newErrors.codeName = `Code must be at most ${CODE_NAME_MAX_LENGTH} characters.`;
        } else if (existingCodes.some(c => c.codeName.toLowerCase() === trimmedCodeName.toLowerCase())) {
            newErrors.codeName = 'This discount code name already exists.';
        }

        if (!trimmedDescription) {
            newErrors.description = 'Description is required.';
        } else if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
            newErrors.description = `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`;
        }

        const numDiscountValue = parseFloat(discountValue);
        if (discountValue === '' || isNaN(numDiscountValue)) {
            newErrors.discountValue = 'A valid discount value is required.';
        } else if (numDiscountValue <= 0) {
            newErrors.discountValue = 'Discount value must be positive.';
        } else if (discountType === 'percentage' && numDiscountValue > 100) {
            newErrors.discountValue = 'Percentage cannot exceed 100.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [codeName, description, discountValue, discountType, existingCodes]);

    // ===========================================================================
    // Event Handlers
    // ===========================================================================

    const handleSubmit = useCallback(async (e) => {
        // e might be passed if the button was somehow still inside a form that got submitted by other means
        // but typically, for type="button", e will be the click event.
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        if (!validateForm()) return;

        setIsCreating(true);
        setErrors(prev => ({ ...prev, form: null })); // Clear previous form-level error

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
            console.error("Failed to create discount:", error);
            setErrors(prev => ({
                ...prev,
                form: error.message || 'An unexpected error occurred. Please try again.'
            }));
        } finally {
            setIsCreating(false);
        }
    }, [validateForm, codeName, description, discountType, discountValue, onCreateDiscount, onClose]);

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
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
                        {/* Modal Header */}
                        <div className="px-6 pt-5 pb-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700">
                            <h2 id="create-discount-modal-title" className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                                Create New Master Discount
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                aria-label="Close create discount modal"
                                title="Close"
                                data-testid="close-modal-button"
                            >
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body: Form Fields */}
                        <div className="px-6 py-5 space-y-12 max-h-[65vh] overflow-y-auto">
                            <InputField
                                ref={codeNameInputRef}
                                className="mt-6"
                                id="newDiscountCodeName"
                                label="Discount Code Name"
                                value={codeName}
                                onChange={e => setCodeName(e.target.value.toUpperCase())}
                                error={errors.codeName}
                                required
                                placeholder="e.g., SUMMER2024"
                                maxLength={CODE_NAME_MAX_LENGTH}
                                helptext={`Unique code, ${CODE_NAME_MIN_LENGTH}-${CODE_NAME_MAX_LENGTH} chars. Customers will use this.`}
                                classNameWrapper="relative"
                            />
                            <InputField
                                id="newDiscountDescription"
                                label="Internal Description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                error={errors.description}
                                required
                                placeholder="e.g., Summer campaign 2024, all products"
                                maxLength={DESCRIPTION_MAX_LENGTH}
                                helptext="For your reference, not shown to customers."
                                classNameWrapper="relative"
                            />
                            <Dropdown
                                id="newDiscountType"
                                label="Discount Type (for this master code)"
                                options={discountTypeOptions}
                                value={discountType}
                                onChange={setDiscountType}
                                error={errors.discountType}
                                helptext="Determines how the discount value is interpreted."
                                classNameWrapper="relative"
                            />
                            <InputField
                                id="newDiscountValue"
                                label={discountType === 'percentage' ? "Default Discount Percentage" : "Default Discount Amount"}
                                type="number"
                                value={discountValue}
                                onChange={e => setDiscountValue(e.target.value)}
                                error={errors.discountValue}
                                min="0.01"
                                step={discountType === 'percentage' ? "1" : "0.01"}
                                max={discountType === 'percentage' ? "100" : undefined}
                                required
                                suffix={discountType === 'percentage' ? "%" : "€"}
                                helptext={discountType === 'percentage' ? "General percentage for this code. Can be fine-tuned per product." : "General fixed amount for this code."}
                                classNameWrapper="relative"
                            />

                            {errors.form && (
                                <p className="text-sm text-red-600 dark:text-red-400 p-2.5 bg-red-50 dark:bg-red-900/30 rounded-md flex items-center gap-1.5" role="alert" data-testid="form-level-error">
                                    <Icon name="error_outline" className="w-6 h-6 flex-shrink-0" />
                                    {errors.form}
                                </p>
                            )}
                        </div>

                        {/* Modal Footer: Action Buttons */}
                        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-700/60 rounded-b-xl flex justify-end items-center space-x-3 border-t border-neutral-200 dark:border-neutral-700">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isCreating}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:opacity-70"
                            >
                                Cancel
                            </button>
                            <button
                                type="button" // Important: Changed from "submit"
                                onClick={handleSubmit} // Important: Added onClick handler
                                disabled={isCreating || Object.keys(errors).some(key => errors[key] && key !== 'form')}
                                className="px-5 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isCreating ? (
                                    <><Icon name="progress_activity" className="w-4 h-4 animate-spin inline mr-2" />Creating...</>
                                ) : (
                                    "Create Discount"
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
    discountTypeOptions: defaultDiscountTypeOptions,
};

export default memo(CreateDiscountCodeModal);