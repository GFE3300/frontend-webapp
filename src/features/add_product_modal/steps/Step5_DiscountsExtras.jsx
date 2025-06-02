// frontend/src/features/add_product_modal/steps/Step5_DiscountsExtras.jsx
import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { InputField } from '../../../features/register/subcomponents';
import AppliedDiscountsManager from '../stage_5/AppliedDiscountsManager';
import CreateDiscountCodeModal from '../stage_5/CreateDiscountCodeModal';
import { useMasterDiscountCodes, useCreateMasterDiscountCode } from '../../../contexts/ProductDataContext';
import scriptLines from '../utils/script_lines';

const generateId = (prefix = 'id_') => `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const Step5_DiscountsExtras_Actual = memo(({ formData, updateField, errors, activeBusinessId }) => {
    const [isCreateDiscountModalOpen, setIsCreateDiscountModalOpen] = useState(false);
    const sl = scriptLines.step5DiscountsExtras;

    const { data: masterCodesData, isLoading: isLoadingMasterCodes, error: masterCodesError } = useMasterDiscountCodes();
    const availableMasterCodes = masterCodesData || [];

    const createMasterDiscountMutation = useCreateMasterDiscountCode();

    const handleApplyCode = useCallback((masterCode) => {
        const alreadyApplied = (formData.appliedDiscounts || []).some(ad => ad.discount_master === masterCode.id);
        if (alreadyApplied) {
            console.warn(sl.warnDiscountAlreadyApplied);
            return;
        }

        const newAppliedDiscount = {
            id: generateId('applied_disc_'), // UI key
            discount_master: masterCode.id, // Actual FK to DiscountMaster
            codeName: masterCode.code_name,
            description: masterCode.internal_description || masterCode.public_display_name || '', // Prefer internal
            discount_percentage_override: masterCode.type === 'percentage' ? parseFloat(masterCode.default_value) : null,
        };
        updateField('appliedDiscounts', [...(formData.appliedDiscounts || []), newAppliedDiscount]);
    }, [formData.appliedDiscounts, updateField, sl.warnDiscountAlreadyApplied]);

    const handleUpdateAppliedPercentage = useCallback((appliedDiscountUiId, newPercentage) => {
        const updatedList = (formData.appliedDiscounts || []).map(ad =>
            ad.id === appliedDiscountUiId
                ? { ...ad, discount_percentage_override: newPercentage === '' || newPercentage === null ? null : parseFloat(newPercentage) }
                : ad
        );
        updateField('appliedDiscounts', updatedList);
    }, [formData.appliedDiscounts, updateField]);

    const handleRemoveAppliedCode = useCallback((appliedDiscountUiId) => {
        updateField('appliedDiscounts', (formData.appliedDiscounts || []).filter(ad => ad.id !== appliedDiscountUiId));
    }, [formData.appliedDiscounts, updateField]);

    const handleCreateDiscountCode = async (newDiscountDataFromModal) => {
        if (!activeBusinessId) {
            console.error(sl.errorMissingBusinessId);
            throw new Error(sl.errorBusinessContextMissing);
        }

        try {
            const payload = {
                code_name: newDiscountDataFromModal.codeName.trim().toUpperCase(),
                internal_description: newDiscountDataFromModal.description.trim(),
                type: newDiscountDataFromModal.type,
                default_value: parseFloat(newDiscountDataFromModal.value),
                business: activeBusinessId,
                // public_display_name, requires_code, is_active will use backend defaults or further logic
            };
            // console.log("Payload to create master discount:", payload); // For debugging
            await createMasterDiscountMutation.mutateAsync(payload);
            // Modal is expected to close itself on successful submission from its own logic
        } catch (err) {
            console.error(sl.errorFailedCreateMasterCode, err);
            // Propagate field-specific errors if available, or a general message
            const apiErrors = err.response?.data;
            if (apiErrors && typeof apiErrors === 'object') {
                const fieldSpecificErrors = {};
                // Map backend field names to frontend state/field names if they differ
                for (const key in apiErrors) {
                    const frontendKey = {
                        'internal_description': 'description', // map internal_description error to 'description' field
                        'default_value': 'discountValue',     // map default_value error to 'discountValue' field
                        'code_name': 'codeName',               // map code_name error to 'codeName' field
                        'type': 'discountType',               // map type error to 'discountType' field
                        'business': 'form'                    // map business error to general form error for modal
                    }[key] || key;
                    fieldSpecificErrors[frontendKey] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : String(apiErrors[key]);
                }
                if (Object.keys(fieldSpecificErrors).length > 0) {
                    err.fieldErrors = fieldSpecificErrors; // Add structured errors to the error object
                }
            }
            throw err; // Re-throw to be caught by the modal's handleSubmit and display errors
        }
    };

    if (isLoadingMasterCodes) {
        return <div className="py-10 text-center">{sl.loadingMasterCodes}</div>;
    }
    if (masterCodesError) {
        return <div className="py-10 text-center text-red-500">{sl.errorLoadingMasterCodesPrefix} {masterCodesError.message}</div>;
    }

    return (
        <>
            <motion.div
                layout className="space-y-8 py-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            >
                <div>
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                        {sl.mainTitle}
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {sl.mainDescription}
                    </p>
                </div>

                <div className="p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-4 dark:border-neutral-600">
                        {sl.productSpecificDiscountsTitle}
                    </h3>
                    <AppliedDiscountsManager
                        appliedDiscounts={(formData.appliedDiscounts || []).map(ad => ({
                            id: ad.id,
                            discountCodeId: ad.discount_master,
                            codeName: ad.codeName,
                            description: ad.description,
                            discountPercentage: ad.discount_percentage_override,
                        }))}
                        availableMasterCodes={availableMasterCodes.map(mc => ({
                            id: mc.id,
                            codeName: mc.code_name,
                            description: mc.internal_description || mc.public_display_name || '',
                            type: mc.type,
                            default_value: mc.default_value,
                        }))}
                        onApplyCode={handleApplyCode}
                        onUpdateAppliedPercentage={handleUpdateAppliedPercentage}
                        onRemoveAppliedCode={handleRemoveAppliedCode}
                        onTriggerCreateNewCode={() => setIsCreateDiscountModalOpen(true)}
                        errors={errors?.appliedDiscounts} // Pass array-level errors if any
                    />
                    {errors?.appliedDiscounts && typeof errors.appliedDiscounts === 'string' && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.appliedDiscounts}</p>
                    )}
                </div>

                <div className="p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-4 dark:border-neutral-600">
                        {sl.additionalNotesTitle}
                    </h3>
                    <div className='flex h-15 items-end w-full'>
                        <InputField
                            label={sl.additionalNotesLabel}
                            className="w-full"
                            isTextArea={true} rows={4}
                            value={formData.additionalNotes || ''}
                            onChange={(e) => updateField('additionalNotes', e.target.value)}
                            error={errors?.additionalNotes}
                            placeholder={sl.additionalNotesPlaceholder}
                            maxLength={500}
                            hideLabel
                        />
                    </div>
                </div>
            </motion.div>

            <CreateDiscountCodeModal
                isOpen={isCreateDiscountModalOpen}
                onClose={() => setIsCreateDiscountModalOpen(false)}
                onCreateDiscount={handleCreateDiscountCode}
                existingCodes={availableMasterCodes.map(c => ({ codeName: c.code_name }))}
            />
        </>
    );
});

Step5_DiscountsExtras_Actual.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
    activeBusinessId: PropTypes.string, // Kept as optional, but handleCreateDiscountCode checks it
};

Step5_DiscountsExtras_Actual.defaultProps = {
    activeBusinessId: null,
};

export default Step5_DiscountsExtras_Actual;