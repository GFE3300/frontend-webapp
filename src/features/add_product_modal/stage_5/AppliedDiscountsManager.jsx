// frontend/src/features/add_product_modal/stage_5/AppliedDiscountsManager.jsx
import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import DiscountCodeSelector from './DiscountCodeSelector';
import AppliedDiscountRow from './AppliedDiscountRow';
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines'; // Correct import

const AppliedDiscountsManager = memo(({
    appliedDiscounts,
    availableMasterCodes,
    onApplyCode,
    onUpdateAppliedPercentage,
    onRemoveAppliedCode,
    onTriggerCreateNewCode,
    errors,
}) => {
    // CORRECTED: 'sl' should be 'scriptLines' directly if keys are like 'appliedDiscountsManagerNoDiscountsPrimary'
    const sl = scriptLines; // Change this line

    const errorTextAnimation = {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.2 }
    };

    const appliedCodeMasterIds = useMemo(() =>
        appliedDiscounts.map(ad => ad.discount_master),
        [appliedDiscounts]
    );

    const arrayLevelError = (errors && typeof errors.appliedDiscounts === 'string')
        ? errors.appliedDiscounts
        : (typeof errors === 'string' ? errors : null);


    return (
        <div className="space-y-4 font-montserrat">
            <DiscountCodeSelector
                availableCodes={availableMasterCodes}
                appliedCodeIds={appliedCodeMasterIds}
                onSelectCode={onApplyCode}
                onCreateNew={onTriggerCreateNewCode}
                error={errors && errors.selector}
            />

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

            {appliedDiscounts.length === 0 && !arrayLevelError && (
                <div
                    className="text-center py-6 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700/10 mt-3"
                    data-testid="no-discounts-placeholder"
                >
                    <Icon name="local_offer" className="w-10 h-10 mx-auto text-neutral-400 dark:text-neutral-500 mb-3" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        {/* CORRECTED: Access directly from 'sl' (which is scriptLines) */}
                        {sl.appliedDiscountsManagerNoDiscountsPrimary || "No discounts applied to this product yet."}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {sl.appliedDiscountsManagerNoDiscountsSecondary || "Select a code above or create a new one."}
                    </p>
                </div>
            )}

            {appliedDiscounts.length > 0 && (
                <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 px-1">
                        {/* CORRECTED: Access directly from 'sl' */}
                        {(sl.appliedDiscountsManagerListHeaderPattern || "Applied Discounts ({count}):")
                            .replace('{count}', String(appliedDiscounts.length))}
                    </h4>
                    <AnimatePresence initial={false}>
                        {appliedDiscounts.map((appliedDiscountItem, index) => (
                            <AppliedDiscountRow
                                key={appliedDiscountItem.id}
                                appliedDiscount={appliedDiscountItem}
                                onPercentageChange={onUpdateAppliedPercentage}
                                onRemove={onRemoveAppliedCode}
                                error={
                                    errors &&
                                    Array.isArray(errors.appliedDiscounts) &&
                                    errors.appliedDiscounts[index] &&
                                    errors.appliedDiscounts[index].discount_percentage_override
                                }
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
});

AppliedDiscountsManager.propTypes = {
    appliedDiscounts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            discount_master: PropTypes.string.isRequired,
            codeName: PropTypes.string.isRequired,
            description: PropTypes.string,
            discount_master_type: PropTypes.string.isRequired,
            discount_master_default_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            discount_percentage_override: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.oneOf([null])]),
        })
    ).isRequired,
    availableMasterCodes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        codeName: PropTypes.string.isRequired,
        description: PropTypes.string,
        type: PropTypes.string.isRequired,
        default_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })).isRequired,
    onApplyCode: PropTypes.func.isRequired,
    onUpdateAppliedPercentage: PropTypes.func.isRequired,
    onRemoveAppliedCode: PropTypes.func.isRequired,
    onTriggerCreateNewCode: PropTypes.func.isRequired,
    errors: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            selector: PropTypes.string,
            appliedDiscounts: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.arrayOf(
                    PropTypes.shape({
                        discount_percentage_override: PropTypes.string,
                    })
                )
            ])
        })
    ]),
};

AppliedDiscountsManager.defaultProps = {
    errors: null,
};

AppliedDiscountsManager.displayName = 'AppliedDiscountsManager';

export default AppliedDiscountsManager;