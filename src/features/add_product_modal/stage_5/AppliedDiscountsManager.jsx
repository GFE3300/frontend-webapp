import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import DiscountCodeSelector from './DiscountCodeSelector'; // Assuming path
import AppliedDiscountRow from './AppliedDiscountRow';     // Assuming path
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines'; // Added import

/**
 * @component AppliedDiscountsManager
 * @description Manages the selection and display of applied discount codes for a product.
 * It integrates a selector for adding new discount codes and lists currently applied discounts,
 * allowing for percentage updates and removal.
 *
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.appliedDiscounts - Array of currently applied discount objects.
 *   Each object should match the `appliedDiscount` prop shape of `AppliedDiscountRow`.
 * @param {Array<Object>} props.availableMasterCodes - Array of all master discount codes available for selection.
 *   (Shape depends on `DiscountCodeSelector` needs, typically `{ id, codeName, description, ... }`)
 * @param {Function} props.onApplyCode - Callback invoked when a master code is selected from `DiscountCodeSelector`.
 *   Receives the selected master code object. The parent is responsible for creating the appliedDiscount instance.
 * @param {Function} props.onUpdateAppliedPercentage - Callback invoked when an applied discount's percentage is changed.
 *   Receives `appliedDiscountId` (string) and `newPercentage` (number | string).
 * @param {Function} props.onRemoveAppliedCode - Callback invoked to remove an applied discount.
 *   Receives `appliedDiscountId` (string).
 * @param {Function} props.onTriggerCreateNewCode - Callback invoked to trigger the opening of a modal/form for creating a new master discount code.
 * @param {Object|string} [props.errors] - Error messages. Can be a string for an array-level error
 *   (e.g., "Maximum 5 discounts allowed") or an object for item-specific or selector errors.
 *   If an object, it can have a `selector` key for `DiscountCodeSelector` errors, or be an array-like
 *   object mapping to errors for `AppliedDiscountRow` instances (e.g., `errors[index].discountPercentage`).
 */
const AppliedDiscountsManager = ({
    appliedDiscounts,
    availableMasterCodes,
    onApplyCode,
    onUpdateAppliedPercentage,
    onRemoveAppliedCode,
    onTriggerCreateNewCode,
    errors,
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const errorTextAnimation = {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.2 }
    };

    // ===========================================================================
    // Derived State & Memoization
    // ===========================================================================

    const appliedCodeMasterIds = useMemo(() =>
        appliedDiscounts.map(ad => ad.discountCodeId),
        [appliedDiscounts]
    );

    const arrayLevelError = errors && typeof errors === 'string' ? errors : null;

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <div className="space-y-4 font-montserrat">
            {/* Discount Code Selector Component */}
            <DiscountCodeSelector
                availableCodes={availableMasterCodes}
                appliedCodeIds={appliedCodeMasterIds}
                onSelectCode={onApplyCode}
                onCreateNew={onTriggerCreateNewCode}
                error={errors && errors.selector}
            />

            {/* Display Array-Level Error */}
            <AnimatePresence>
                {arrayLevelError && (
                    <motion.p
                        {...errorTextAnimation}
                        className="text-xs text-red-600 dark:text-red-400 p-2.5 bg-red-50 dark:bg-red-900/30 rounded-md flex items-center gap-1.5"
                        role="alert"
                        data-testid="array-level-error"
                    >
                        <Icon name="error_outline" className="w-4 h-4 flex-shrink-0" />
                        {arrayLevelError}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Placeholder for No Applied Discounts */}
            {appliedDiscounts.length === 0 && !arrayLevelError && (
                <div
                    className="text-center py-6 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700/10 mt-3"
                    data-testid="no-discounts-placeholder"
                >
                    <Icon name="local_offer" className="w-10 h-10 mx-auto text-neutral-400 dark:text-neutral-500 mb-3" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        {scriptLines.appliedDiscountsManagerNoDiscountsPrimary || "No discounts applied to this product yet."}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {scriptLines.appliedDiscountsManagerNoDiscountsSecondary || "Select a code above or create a new one."}
                    </p>
                </div>
            )}

            {/* List of Applied Discount Rows */}
            {appliedDiscounts.length > 0 && (
                <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 px-1">
                        {(scriptLines.appliedDiscountsManagerListHeaderPattern || "Applied Discounts ({count}):")
                            .replace('{count}', appliedDiscounts.length)}
                    </h4>
                    <AnimatePresence initial={false}>
                        {appliedDiscounts.map((appliedDiscountItem, index) => (
                            <AppliedDiscountRow
                                key={appliedDiscountItem.id}
                                appliedDiscount={appliedDiscountItem}
                                onPercentageChange={onUpdateAppliedPercentage}
                                onRemove={onRemoveAppliedCode}
                                error={errors && errors[index] && errors[index].discountPercentage}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

AppliedDiscountsManager.propTypes = {
    appliedDiscounts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            discountCodeId: PropTypes.string.isRequired,
            codeName: PropTypes.string.isRequired,
            description: PropTypes.string,
            discountPercentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        })
    ).isRequired,
    availableMasterCodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    onApplyCode: PropTypes.func.isRequired,
    onUpdateAppliedPercentage: PropTypes.func.isRequired,
    onRemoveAppliedCode: PropTypes.func.isRequired,
    onTriggerCreateNewCode: PropTypes.func.isRequired,
    errors: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            selector: PropTypes.string,
        }),
        PropTypes.arrayOf(
            PropTypes.shape({
                discountPercentage: PropTypes.string,
            })
        )
    ]),
};

AppliedDiscountsManager.defaultProps = {
    errors: null,
};

export default memo(AppliedDiscountsManager);