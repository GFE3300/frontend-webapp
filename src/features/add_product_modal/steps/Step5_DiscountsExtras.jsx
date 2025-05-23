import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { InputField } from '../../../features/register/subcomponents'; // Path for generic textarea wrapper
import AppliedDiscountsManager from '../stage_5/AppliedDiscountsManager';
import CreateDiscountCodeModal from '../stage_5/CreateDiscountCodeModal';
import { useMasterDiscountCodes, useCreateMasterDiscountCode } from '../../../contexts/ProductDataContext'; // TanStack hooks

const generateId = (prefix = 'id_') => `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const Step5_DiscountsExtras_Actual = memo(({ formData, updateField, errors, activeBusinessId }) => {
    const [isCreateDiscountModalOpen, setIsCreateDiscountModalOpen] = useState(false);

    const { data: masterCodesData, isLoading: isLoadingMasterCodes, error: masterCodesError } = useMasterDiscountCodes();
    const availableMasterCodes = masterCodesData || [];

    const createMasterDiscountMutation = useCreateMasterDiscountCode();

    const handleApplyCode = useCallback((masterCode) => { // masterCode is { id, codeName, description, type, default_value (from backend) }
        const alreadyApplied = (formData.appliedDiscounts || []).some(ad => ad.discount_master === masterCode.id);
        if (alreadyApplied) {
            console.warn("Discount code already applied to this product.");
            // Optionally: updateField('errors', { ...errors, appliedDiscounts: "This code is already applied." });
            return;
        }

        // Backend expects `discount_master` (ID) and `discount_percentage_override` (Decimal or null)
        // Frontend `formData.appliedDiscounts` stores objects.
        // `codeName` and `description` are for display in `AppliedDiscountRow`.
        const newAppliedDiscount = {
            id: generateId('applied_disc_'), // Temporary client-side ID for list key, backend won't use this
            discount_master: masterCode.id,  // FK to DiscountMaster
            codeName: masterCode.code_name,  // For display
            description: masterCode.description, // For display
            // Default override: if master is percentage, use its value. Otherwise, null (as fixed amounts are not overridden this way)
            discount_percentage_override: masterCode.type === 'percentage' ? parseFloat(masterCode.default_value) : null,
        };
        updateField('appliedDiscounts', [...(formData.appliedDiscounts || []), newAppliedDiscount]);
    }, [formData.appliedDiscounts, updateField]);

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
        if (!activeBusinessId) { // <-- ADD CHECK for activeBusinessId
            console.error("Step5: Active business ID is missing. Cannot create discount code.");
            // Optionally, set a form error that can be displayed in CreateDiscountCodeModal
            // This would require passing a setFormError function to CreateDiscountCodeModal or handling it here.
            // For now, we'll throw, which will be caught by CreateDiscountCodeModal's handleSubmit.
            throw new Error("Your business context is missing. Please try again or contact support.");
        }

        try {
            const payload = {
                code_name: newDiscountDataFromModal.codeName,
                description: newDiscountDataFromModal.description,
                type: newDiscountDataFromModal.type,
                default_value: newDiscountDataFromModal.value,
                business: activeBusinessId, // <-- ADD business ID TO PAYLOAD
            };
            await createMasterDiscountMutation.mutateAsync(payload);
            setIsCreateDiscountModalOpen(false);
        } catch (err) {
            console.error("Step5: Failed to create master discount code:", err);
            throw err; // Re-throw for the modal to potentially display
        }
    };

    if (isLoadingMasterCodes) {
        return <div className="py-10 text-center">Loading discount codes...</div>;
    }
    if (masterCodesError) {
        return <div className="py-10 text-center text-red-500">Error loading discount codes: {masterCodesError.message}</div>;
    }


    return (
        <>
            <motion.div
                layout className="space-y-8 py-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            >
                <div>
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                        Discounts & Extras
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Apply discounts or add internal notes for this product.
                    </p>
                </div>

                <div className="p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-4 dark:border-neutral-600">
                        Product-Specific Discounts
                    </h3>
                    <AppliedDiscountsManager
                        appliedDiscounts={(formData.appliedDiscounts || []).map(ad => ({
                            // Adapt to AppliedDiscountRow's expected prop structure
                            id: ad.id, // temporary UI id
                            discountCodeId: ad.discount_master, // master code ID
                            codeName: ad.codeName, // from when it was selected/fetched
                            description: ad.description,
                            discountPercentage: ad.discount_percentage_override, // the actual override value
                        }))}
                        availableMasterCodes={availableMasterCodes} // Pass fetched master codes
                        onApplyCode={handleApplyCode}
                        onUpdateAppliedPercentage={handleUpdateAppliedPercentage}
                        onRemoveAppliedCode={handleRemoveAppliedCode}
                        onTriggerCreateNewCode={() => setIsCreateDiscountModalOpen(true)}
                        formErrors={errors}
                        errors={errors?.appliedDiscounts} // This can be an array of errors or a string for general error
                    />
                </div>

                <div className="p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-4 dark:border-neutral-600">
                        Additional Notes (Optional)
                    </h3>
                    <div className='flex h-15 items-end w-full'> 
                        <InputField
                            label="Internal Notes or Extra Info" className="w-full"
                            isTextArea={true} rows={4} // Increased rows for better UX
                            value={formData.additionalNotes || ''}
                            onChange={(e) => updateField('additionalNotes', e.target.value)}
                            error={errors?.additionalNotes}
                            placeholder="e.g., Special handling, allergen info not covered by tags, display notes..."
                            maxLength={500}
                            hidelabel
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
};

export default Step5_DiscountsExtras_Actual;