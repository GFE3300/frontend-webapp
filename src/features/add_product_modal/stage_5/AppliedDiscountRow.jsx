// src/features/add_product_modal/components/AppliedDiscountRow.jsx

// 1. Imports
import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { InputField } from '../../register/subcomponents'; // Assuming path is correct
import Icon from '../../../components/common/Icon';

/**
 * @component AppliedDiscountRow
 * @description Displays a single applied discount with its details, an input field for its percentage,
 * and a button to remove it. Includes animation for add/remove.
 *
 * @param {Object} props - Component properties.
 * @param {Object} props.appliedDiscount - The applied discount object.
 *   @param {string} props.appliedDiscount.id - Unique identifier for this applied discount instance.
 *   @param {string} props.appliedDiscount.discountCodeId - Identifier of the master discount code.
 *   @param {string} props.appliedDiscount.codeName - Name of the discount code.
 *   @param {string} [props.appliedDiscount.description] - Optional description of the discount.
 *   @param {number} [props.appliedDiscount.discountPercentage] - The percentage value of the discount.
 * @param {Function} props.onPercentageChange - Callback function invoked when the discount percentage changes.
 *   Receives `appliedDiscount.id` (string) and `newPercentage` (number) as arguments.
 * @param {Function} props.onRemove - Callback function invoked when the remove button is clicked.
 *   Receives `appliedDiscount.id` (string) as an argument.
 * @param {string} [props.error] - Error message specific to this row's percentage input.
 */
const AppliedDiscountRow = ({
    appliedDiscount,
    onPercentageChange,
    onRemove,
    error,
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================

    // Framer Motion animation variants for the row
    const rowAnimationVariants = {
        layout: "position", // Enables layout animation
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
        transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 },
    };

    const inputId = `discount-percentage-${appliedDiscount.id}`;

    // ===========================================================================
    // Validation
    // ===========================================================================
    // Core validation is handled by PropTypes (e.g., `appliedDiscount` structure, required functions).
    // No specific runtime validation needed here for rendering, as the component can gracefully handle
    // missing optional fields like `description` or `discountPercentage`.

    // ===========================================================================
    // Event Handlers & Callbacks
    // ===========================================================================

    /**
     * Handles the change event of the percentage input field.
     * Parses the value to a float and calls `onPercentageChange`.
     */
    const handlePercentageChange = useCallback((e) => {
        const value = e.target.value;
        // Allow empty string for user to clear input, otherwise parse as float.
        // The parent/validation logic should handle empty string vs. 0 vs. actual number.
        const newPercentage = value === '' ? '' : parseFloat(value);
        onPercentageChange(appliedDiscount.id, newPercentage);
    }, [onPercentageChange, appliedDiscount.id]);

    /**
     * Handles the click event of the remove button.
     * Calls `onRemove` with the applied discount's ID.
     */
    const handleRemove = useCallback(() => {
        onRemove(appliedDiscount.id);
    }, [onRemove, appliedDiscount.id]);

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <motion.div
            {...rowAnimationVariants}
            className="flex items-center gap-x-3 p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700/40 shadow-sm"
            data-testid={`applied-discount-row-${appliedDiscount.id}`}
        >
            {/* Discount Information Section */}
            <div className="flex-grow">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100" data-testid="discount-code-name">
                    {appliedDiscount.codeName}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400" data-testid="discount-description">
                    {appliedDiscount.description || 'General discount code'}
                </p>
            </div>

            {/* Percentage Input Section */}
            <div className="w-45 flex-shrink-0">
                {/* Wrapper to align InputField if it has internal margins/paddings affecting alignment */}
                <div className='flex h-15 items-end w-full'>
                    <InputField
                        id={inputId} // Added ID for label association
                        label="Discount Percentage" // Used for accessibility even if visually hidden
                        className="w-full" // Class for the InputField's own wrapper
                        type="number"
                        value={appliedDiscount.discountPercentage === null || appliedDiscount.discountPercentage === undefined ? '' : appliedDiscount.discountPercentage}
                        onChange={handlePercentageChange}
                        placeholder="e.g., 10"
                        min="0"
                        max="100"
                        step="0.01" // Allow for decimal percentages if needed, adjust as per requirements
                        required // HTML5 required, actual validation should be more robust
                        error={error}
                        suffix="%"
                        hideLabel // Visually hide the label, but it's there for screen readers
                        classNameWrapper="mb-0 w-full" // Ensure wrapper takes full width and no bottom margin
                        aria-describedby={error ? `error-${inputId}` : undefined}
                    />
                </div>
            </div>

            {/* Remove Button Section */}
            <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-700"
                aria-label={`Remove discount ${appliedDiscount.codeName}`}
                title={`Remove ${appliedDiscount.codeName}`}
                data-testid="remove-discount-button"
            >
                <Icon name="remove_circle" className="w-6 h-6" />
            </button>
        </motion.div>
    );
};

AppliedDiscountRow.propTypes = {
    appliedDiscount: PropTypes.shape({
        id: PropTypes.string.isRequired,
        discountCodeId: PropTypes.string.isRequired,
        codeName: PropTypes.string.isRequired,
        description: PropTypes.string,
        discountPercentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // Allow string for empty input
    }).isRequired,
    onPercentageChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    error: PropTypes.string,
};

AppliedDiscountRow.defaultProps = {
    error: null,
    // `appliedDiscount.description` and `appliedDiscount.discountPercentage` can be undefined/null
    // and are handled in rendering.
};

// Export with memo as props are objects/functions and might not change frequently
// if parent manages state immutably.
export default memo(AppliedDiscountRow);