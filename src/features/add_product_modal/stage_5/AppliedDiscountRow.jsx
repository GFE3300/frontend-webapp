// frontend/src/features/add_product_modal/stage_5/AppliedDiscountRow.jsx
import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { InputField } from '../../register/subcomponents';
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines'; // Correct import

const AppliedDiscountRow = memo(({
    appliedDiscount,
    onPercentageChange,
    onRemove,
    error,
}) => {
    // CORRECTED: 'sl' should be 'scriptLines' directly
    const sl = scriptLines;
    const currencySymbol = sl.currencySymbolDefault || '$';

    const rowAnimationVariants = {
        layout: "position",
        initial: { opacity: 0, x: -20, height: 0 },
        animate: { opacity: 1, x: 0, height: 'auto', transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 } },
        exit: { opacity: 0, x: 20, height: 0, transition: { duration: 0.2 } },
    };

    const inputId = `discount-percentage-override-${appliedDiscount.id}`;

    const handlePercentageChange = useCallback((e) => {
        const value = e.target.value;
        const newPercentage = value === '' ? null : parseFloat(value);
        onPercentageChange(appliedDiscount.id, newPercentage);
    }, [onPercentageChange, appliedDiscount.id]);

    const handleRemove = useCallback(() => {
        onRemove(appliedDiscount.id);
    }, [onRemove, appliedDiscount.id]);

    const isPercentageType = appliedDiscount.discount_master_type === 'percentage';

    let valueDisplay = '';
    let valueSuffix = '';

    if (isPercentageType) {
        valueDisplay = appliedDiscount.discount_percentage_override !== null && appliedDiscount.discount_percentage_override !== undefined
            ? appliedDiscount.discount_percentage_override
            : (appliedDiscount.discount_master_default_value !== null && appliedDiscount.discount_master_default_value !== undefined
                ? parseFloat(appliedDiscount.discount_master_default_value)
                : '');
        valueSuffix = '%';
    } else if (appliedDiscount.discount_master_type === 'fixed_amount_product') {
        valueDisplay = appliedDiscount.discount_master_default_value !== null && appliedDiscount.discount_master_default_value !== undefined
            ? parseFloat(appliedDiscount.discount_master_default_value).toFixed(2)
            : 'N/A';
        valueSuffix = currencySymbol;
    }


    const overrideLabel = useMemo(() => {
        if (!isPercentageType) return '';
        const masterValue = appliedDiscount.discount_master_default_value;
        const currentOverride = appliedDiscount.discount_percentage_override;

        // CORRECTED: Access key directly from 'sl' (which is scriptLines)
        if (currentOverride !== null && currentOverride !== undefined && parseFloat(currentOverride) !== parseFloat(masterValue)) {
            return sl.appliedDiscountRow_overrideActiveLabel.replace('{value}', `${parseFloat(masterValue)}%`);
        }
        return sl.appliedDiscountRow_overridePercentageLabel; // This key should exist in script_lines.js
    }, [isPercentageType, appliedDiscount.discount_master_default_value, appliedDiscount.discount_percentage_override, sl]);


    return (
        <motion.div
            {...rowAnimationVariants}
            className="flex flex-col sm:flex-row sm:items-end gap-x-3 gap-y-3 p-3 border border-neutral-200 dark:border-neutral-600/80 rounded-lg bg-white dark:bg-neutral-800/60 shadow-sm hover:shadow-md transition-shadow duration-200"
            data-testid={`applied-discount-row-${appliedDiscount.id}`}
        >
            <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate" data-testid="discount-code-name" title={appliedDiscount.codeName}>
                    {appliedDiscount.codeName}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate" data-testid="discount-description" title={appliedDiscount.description}>
                    {appliedDiscount.description || sl.appliedDiscountRow_defaultDescription}
                </p>
                <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                    {isPercentageType
                        // CORRECTED: Access keys directly from 'sl'
                        ? `${sl.appliedDiscountRow_typePercentage || 'Type: Percentage'}: ${parseFloat(appliedDiscount.discount_master_default_value).toFixed(0)}%`
                        : `${(sl.appliedDiscountRow_typeFixedAmount || 'Type: Fixed Amount ({currencySymbol})').replace('{currencySymbol}', currencySymbol)}: ${currencySymbol}${parseFloat(appliedDiscount.discount_master_default_value).toFixed(2)}`
                    }
                </div>
            </div>

            <div className="w-full sm:w-36 md:w-40 flex-shrink-0">
                {isPercentageType ? (
                    <div className='flex h-15 items-end w-full'>
                        <InputField
                            id={inputId}
                            label={overrideLabel} // This now uses the corrected logic
                            type="number"
                            value={appliedDiscount.discount_percentage_override === null || appliedDiscount.discount_percentage_override === undefined ? '' : appliedDiscount.discount_percentage_override}
                            onChange={handlePercentageChange}
                            placeholder={parseFloat(appliedDiscount.discount_master_default_value).toFixed(0)}
                            min="0"
                            max="100"
                            step="0.01"
                            error={error}
                            suffix="%"
                            hideLabel={false}
                            labelClassName="text-xs !text-neutral-500 dark:!text-neutral-400"
                            classNameWrapper="mb-0 w-full"
                            inputClassName="text-sm"
                            aria-describedby={error ? `error-${inputId}` : undefined}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col h-15 justify-end">
                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-0.5">
                            {sl.appliedDiscountRow_fixedAmountValueLabel}
                        </label>
                        <div className="h-9 flex items-center text-sm px-3 rounded-full bg-neutral-100 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-200 font-medium">
                            {valueDisplay !== 'N/A' ? `${valueSuffix}${valueDisplay}` : valueDisplay}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full sm:w-auto flex justify-end sm:self-end mt-2 sm:mt-0">
                <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-300 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-600/50"
                    // CORRECTED: Access keys directly from 'sl'
                    aria-label={sl.appliedDiscountRow_remove_ariaLabel.replace('{discountName}', appliedDiscount.codeName)}
                    title={sl.appliedDiscountRow_remove_title.replace('{discountName}', appliedDiscount.codeName)}
                    data-testid="remove-discount-button"
                >
                    <Icon name="remove_circle_outline" className="w-6 h-6" />
                </button>
            </div>
        </motion.div>
    );
});

AppliedDiscountRow.propTypes = {
    appliedDiscount: PropTypes.shape({
        id: PropTypes.string.isRequired,
        discount_master: PropTypes.string.isRequired,
        codeName: PropTypes.string.isRequired,
        description: PropTypes.string,
        discount_master_type: PropTypes.oneOf(['percentage', 'fixed_amount_product', 'order_total_percentage', 'order_total_fixed_amount']).isRequired,
        discount_master_default_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        discount_percentage_override: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.oneOf([null])]),
    }).isRequired,
    onPercentageChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    error: PropTypes.string,
};

AppliedDiscountRow.defaultProps = {
    error: null,
};

AppliedDiscountRow.displayName = 'AppliedDiscountRow';

export default AppliedDiscountRow;