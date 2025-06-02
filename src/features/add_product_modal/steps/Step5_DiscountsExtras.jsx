// frontend/src/features/add_product_modal/steps/Step5_DiscountsExtras.jsx
import React, { memo, useState, useCallback, useEffect } from 'react';
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

    const { data: masterCodesData, isLoading: isLoadingMasterCodes, error: masterCodesError, refetch: refetchMasterCodes } = useMasterDiscountCodes({
        // Ensure this hook fetches codes relevant to the activeBusinessId if backend requires it
        // or if ProductDataContext doesn't scope it automatically.
        // For now, assuming ProductDataContext handles scoping or backend handles it.
    });
    const availableMasterCodes = masterCodesData || [];

    const createMasterDiscountMutation = useCreateMasterDiscountCode();

    // Effect to refetch master codes if a new one is successfully created.
    // This ensures the DiscountCodeSelector has the latest list.
    useEffect(() => {
        if (createMasterDiscountMutation.isSuccess) {
            refetchMasterCodes();
        }
    }, [createMasterDiscountMutation.isSuccess, refetchMasterCodes]);

    const handleApplyCode = useCallback((masterCode) => {
        // masterCode is expected to be { id, codeName, description, type, default_value }
        // description here comes from masterCode.internal_description or public_display_name
        const alreadyApplied = (formData.appliedDiscounts || []).some(ad => ad.discount_master === masterCode.id);
        if (alreadyApplied) {
            console.warn(sl.warnDiscountAlreadyApplied);
            // Optionally: toast.warn(sl.warnDiscountAlreadyApplied);
            return;
        }

        const newAppliedDiscount = {
            id: generateId('applied_disc_'), // UI key
            discount_master: masterCode.id,   // FK to DiscountMaster.id
            codeName: masterCode.codeName,
            description: masterCode.description, // This is internal_description
            discount_master_type: masterCode.type,
            discount_master_default_value: parseFloat(masterCode.default_value), // Store as number
            discount_percentage_override: masterCode.type === 'percentage'
                ? parseFloat(masterCode.default_value) // Default override to master's value for percentages
                : null, // No override for fixed amounts
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
            // This error should ideally be caught and displayed by CreateDiscountCodeModal or its parent form
            throw new Error(sl.errorBusinessContextMissing);
        }

        try {
            // Backend expects: code_name, internal_description, type, default_value, requires_code
            // The business ID is injected by the BusinessScopedViewMixin on the backend.
            const payload = {
                code_name: newDiscountDataFromModal.codeName.trim().toUpperCase(), // Backend might uppercase too
                internal_description: newDiscountDataFromModal.description.trim(),
                type: newDiscountDataFromModal.type,
                default_value: parseFloat(newDiscountDataFromModal.value),
                requires_code: newDiscountDataFromModal.requires_code, // This was added in CreateDiscountCodeModal
                // public_display_name can be omitted, backend might generate or leave null
                // applies_to_categories, applies_to_tags can be omitted if not set in this simple modal
            };
            // console.log("Payload to create master discount via Step5:", payload);
            const createdDiscount = await createMasterDiscountMutation.mutateAsync(payload);
            // Successfully created, modal will close itself via its own `onClose` call.
            // The useEffect for createMasterDiscountMutation.isSuccess will trigger refetchMasterCodes.
            return createdDiscount; // Return to modal if it needs it (e.g., to display a success message before closing)
        } catch (err) {
            console.error(sl.errorFailedCreateMasterCode, err);
            const apiErrors = err.response?.data;
            const fieldSpecificErrors = {};
            if (apiErrors && typeof apiErrors === 'object') {
                for (const key in apiErrors) {
                    const frontendKey = {
                        'internal_description': 'description',
                        'default_value': 'discountValue',
                        'code_name': 'codeName',
                        'type': 'discountType',
                        // Map other backend keys to frontend keys if necessary
                    }[key] || key; // Fallback to backend key if no mapping
                    fieldSpecificErrors[frontendKey] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : String(apiErrors[key]);
                }
            }
            if (Object.keys(fieldSpecificErrors).length > 0) {
                err.fieldErrors = fieldSpecificErrors; // Attach for modal to use
            }
            // General error message if no specific field errors were mapped
            if (!err.message && Object.keys(fieldSpecificErrors).length === 0) {
                err.message = sl.errorFormGeneric || "An unexpected error occurred. Please try again.";
            }
            throw err; // Re-throw to be caught by the modal's handleSubmit
        }
    };

    if (isLoadingMasterCodes) {
        return <div className="py-10 text-center">{sl.loadingMasterCodes}</div>;
    }
    if (masterCodesError) {
        return <div className="py-10 text-center text-red-500">{sl.errorLoadingMasterCodesPrefix} {masterCodesError.message}</div>;
    }

    // Prepare appliedDiscounts with full data for AppliedDiscountsManager
    const enrichedAppliedDiscounts = (formData.appliedDiscounts || []).map(ad => {
        // If ad already has all fields (e.g., from edit mode where it's loaded), use them.
        // Otherwise, try to find master details if only master ID is present (less ideal here, should be set on apply).
        // This logic primarily ensures that if data is coming from a fresh application (handleApplyCode), it's already correct.
        // If it's from initial form load (edit mode), getInitialFormData should have set these.
        return {
            id: ad.id,
            discount_master: ad.discount_master,
            codeName: ad.codeName,
            description: ad.description,
            discount_master_type: ad.discount_master_type,
            discount_master_default_value: ad.discount_master_default_value,
            discount_percentage_override: ad.discount_percentage_override,
        };
    });


    return (
        <>
            <motion.div
                layout className="space-y-6 sm:space-y-8 py-2" // Consistent spacing
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            >
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                        {sl.mainTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                        {sl.mainDescription}
                    </p>
                </div>

                <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                    <h3 className="text-md sm:text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-600 pb-2 mb-4">
                        {sl.productSpecificDiscountsTitle}
                    </h3>
                    <AppliedDiscountsManager
                        appliedDiscounts={enrichedAppliedDiscounts}
                        availableMasterCodes={availableMasterCodes.map(mc => ({ // Ensure structure matches selector needs
                            id: mc.id,
                            codeName: mc.code_name,
                            description: mc.internal_description || mc.public_display_name || sl.noDescriptionAvailable,
                            type: mc.type, // Pass type
                            default_value: mc.default_value, // Pass default_value
                        }))}
                        onApplyCode={handleApplyCode}
                        onUpdateAppliedPercentage={handleUpdateAppliedPercentage}
                        onRemoveAppliedCode={handleRemoveAppliedCode}
                        onTriggerCreateNewCode={() => setIsCreateDiscountModalOpen(true)}
                        errors={errors?.appliedDiscounts} // Pass array-level or object of errors
                    />
                </div>

                <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                    <h3 className="text-md sm:text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-600 pb-2 mb-4">
                        {sl.additionalNotesTitle}
                    </h3>
                    <div className='flex h-auto items-end w-full'> {/* Adjusted height to auto */}
                        <InputField
                            label={sl.additionalNotesLabel}
                            className="w-full"
                            isTextArea={true} rows={3} // Reduced rows slightly
                            value={formData.additionalNotes || ''}
                            onChange={(e) => updateField('additionalNotes', e.target.value)}
                            error={errors?.additionalNotes}
                            placeholder={sl.additionalNotesPlaceholder}
                            maxLength={500}
                            hideLabel // Label is part of h3
                        />
                    </div>
                </div>
            </motion.div>

            <CreateDiscountCodeModal
                isOpen={isCreateDiscountModalOpen}
                onClose={() => setIsCreateDiscountModalOpen(false)}
                onCreateDiscount={handleCreateDiscountCode} // This will eventually call createMasterDiscountMutation
                existingCodes={availableMasterCodes.map(c => ({ codeName: c.code_name }))}
            />
        </>
    );
});

Step5_DiscountsExtras_Actual.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
    activeBusinessId: PropTypes.string.isRequired, // Made required for creating discounts
};

Step5_DiscountsExtras_Actual.displayName = 'Step5_DiscountsExtras_Actual';

export default Step5_DiscountsExtras_Actual;