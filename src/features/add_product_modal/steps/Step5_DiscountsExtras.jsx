import React, { memo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify'; // Assuming react-toastify for notifications

import { InputField } from '../../../features/register/subcomponents';
import AppliedDiscountsManager from '../stage_5/AppliedDiscountsManager';
import CreateDiscountCodeModal from '../stage_5/CreateDiscountCodeModal';
import { useMasterDiscountCodes, useCreateMasterDiscountCode } from '../../../contexts/ProductDataContext';
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines';

const generateId = (prefix = 'id_') => `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const Step5_DiscountsExtras_Actual = memo(({ formData, updateField, errors, activeBusinessId }) => {
    const [isCreateDiscountModalOpen, setIsCreateDiscountModalOpen] = useState(false);
    const sl = scriptLines.step5DiscountsExtras; // Alias for cleaner access

    const {
        data: masterCodesData,
        isLoading: isLoadingMasterCodes,
        error: masterCodesError,
        refetch: refetchMasterCodes
    } = useMasterDiscountCodes({
        // Assuming ProductDataContext or backend handles scoping by businessId if necessary
        // If not, and businessId needs to be passed to the hook:
        // enabled: !!activeBusinessId, 
        // queryKey: queryKeys.masterDiscountCodes(activeBusinessId) // Example if queryKey needs businessId
    });
    const availableMasterCodes = masterCodesData || [];

    const createMasterDiscountMutation = useCreateMasterDiscountCode();

    useEffect(() => {
        if (createMasterDiscountMutation.isSuccess) {
            refetchMasterCodes();
            // Toast for success is handled in handleCreateDiscountCode to provide context
        }
        // No need to show error toast here for createMasterDiscountMutation.isError,
        // as handleCreateDiscountCode re-throws the error for CreateDiscountCodeModal to handle.
    }, [createMasterDiscountMutation.isSuccess, refetchMasterCodes]);

    const handleApplyCode = useCallback((masterCode) => {
        const alreadyApplied = (formData.appliedDiscounts || []).some(ad => ad.discount_master === masterCode.id);
        if (alreadyApplied) {
            console.warn(sl.warnDiscountAlreadyApplied);
            toast.warn(sl.warnDiscountAlreadyApplied);
            return;
        }

        const newAppliedDiscount = {
            id: generateId('applied_disc_'),
            discount_master: masterCode.id,
            codeName: masterCode.codeName,
            description: masterCode.description,
            discount_master_type: masterCode.type,
            discount_master_default_value: parseFloat(masterCode.default_value),
            discount_percentage_override: masterCode.type === 'percentage'
                ? parseFloat(masterCode.default_value)
                : null,
        };
        updateField('appliedDiscounts', [...(formData.appliedDiscounts || []), newAppliedDiscount]);
        toast.success(sl.toast_discountAppliedToProduct || `Discount "${masterCode.codeName}" applied.`);
    }, [formData.appliedDiscounts, updateField, sl]);

    const handleUpdateAppliedPercentage = useCallback((appliedDiscountUiId, newPercentage) => {
        const updatedList = (formData.appliedDiscounts || []).map(ad =>
            ad.id === appliedDiscountUiId
                ? { ...ad, discount_percentage_override: newPercentage === '' || newPercentage === null ? null : parseFloat(newPercentage) }
                : ad
        );
        updateField('appliedDiscounts', updatedList);
    }, [formData.appliedDiscounts, updateField]);

    const handleRemoveAppliedCode = useCallback((appliedDiscountUiId) => {
        const removedDiscount = (formData.appliedDiscounts || []).find(ad => ad.id === appliedDiscountUiId);
        updateField('appliedDiscounts', (formData.appliedDiscounts || []).filter(ad => ad.id !== appliedDiscountUiId));
        if (removedDiscount) {
            toast.info((sl.toast_discountRemovedFromProduct || `Discount "{codeName}" removed.`).replace('{codeName}', removedDiscount.codeName));
        }
    }, [formData.appliedDiscounts, updateField, sl]);

    const handleCreateDiscountCode = async (newDiscountDataFromModal) => {
        if (!activeBusinessId) {
            const errorMessage = sl.errorBusinessContextMissing || "Business context is missing. Cannot create discount.";
            console.error(sl.errorMissingBusinessId);
            toast.error(errorMessage);
            // Prepare error for the modal
            const errorToThrow = new Error(errorMessage);
            errorToThrow.fieldErrors = { form: errorMessage };
            throw errorToThrow;
        }

        try {
            const payload = {
                code_name: newDiscountDataFromModal.codeName.trim().toUpperCase(),
                internal_description: newDiscountDataFromModal.description.trim(),
                type: newDiscountDataFromModal.type,
                default_value: parseFloat(newDiscountDataFromModal.value),
                requires_code: newDiscountDataFromModal.requires_code,
                business: activeBusinessId, // Explicitly pass business ID
            };

            const createdDiscount = await createMasterDiscountMutation.mutateAsync(payload);
            toast.success((sl.toast_masterDiscountCreatedSuccess || `Master discount "{codeName}" created successfully!`).replace('{codeName}', createdDiscount.code_name));
            setIsCreateDiscountModalOpen(false); // Close modal on success
            return createdDiscount;
        } catch (err) {
            console.error(sl.errorFailedCreateMasterCode, err);
            const apiErrors = err.response?.data;
            const fieldSpecificErrors = {};
            let generalErrorMessage = sl.errorFormGeneric || "An unexpected error occurred. Please try again.";

            if (apiErrors && typeof apiErrors === 'object') {
                for (const key in apiErrors) {
                    const frontendKey = {
                        'internal_description': 'description',
                        'default_value': 'discountValue',
                        'code_name': 'codeName',
                        'type': 'discountType',
                        'business': 'form',
                        'non_field_errors': 'form',
                        'detail': 'form',
                    }[key] || key;
                    const message = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : String(apiErrors[key]);
                    if (frontendKey === 'form') generalErrorMessage = message;
                    else fieldSpecificErrors[frontendKey] = message;
                }
            } else if (err.message) {
                generalErrorMessage = err.message;
            }

            toast.error(generalErrorMessage);
            const errorToThrow = new Error(generalErrorMessage);
            if (Object.keys(fieldSpecificErrors).length > 0) {
                errorToThrow.fieldErrors = fieldSpecificErrors;
            }
            throw errorToThrow;
        }
    };

    if (isLoadingMasterCodes) {
        return <div className="py-10 text-center text-neutral-600 dark:text-neutral-300">{sl.loadingMasterCodes}</div>;
    }
    if (masterCodesError) {
        return (
            <div className="py-10 px-4 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Icon name="error_outline" className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">{sl.errorLoadingMasterCodesTitle || "Error Loading Discounts"}</p>
                <p className="text-sm">{sl.errorLoadingMasterCodesPrefix} {masterCodesError.message}</p>
            </div>
        );
    }

    const enrichedAppliedDiscounts = (formData.appliedDiscounts || []).map(ad => ({
        id: ad.id,
        discount_master: ad.discount_master,
        codeName: ad.codeName,
        description: ad.description,
        discount_master_type: ad.discount_master_type,
        discount_master_default_value: ad.discount_master_default_value,
        discount_percentage_override: ad.discount_percentage_override,
    }));

    return (
        <>
            <motion.div
                layout
                className="space-y-6 sm:space-y-8 py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
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
                        availableMasterCodes={availableMasterCodes.map(mc => ({
                            id: mc.id,
                            codeName: mc.code_name,
                            description: mc.internal_description || mc.public_display_name || sl.noDescriptionAvailable,
                            type: mc.type,
                            default_value: mc.default_value,
                        }))}
                        onApplyCode={handleApplyCode}
                        onUpdateAppliedPercentage={handleUpdateAppliedPercentage}
                        onRemoveAppliedCode={handleRemoveAppliedCode}
                        onTriggerCreateNewCode={() => setIsCreateDiscountModalOpen(true)}
                        errors={errors?.appliedDiscounts}
                    />
                </div>

                <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                    <h3 className="text-md sm:text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-600 pb-2 mb-4">
                        {sl.additionalNotesTitle}
                    </h3>
                    <div className='flex h-auto items-end w-full'>
                        <InputField
                            label={sl.additionalNotesLabel}
                            className="w-full h-15 flex items-end"
                            isTextArea={true} rows={3}
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
    activeBusinessId: PropTypes.string.isRequired,
};

Step5_DiscountsExtras_Actual.displayName = 'Step5_DiscountsExtras_Actual';

export default Step5_DiscountsExtras_Actual;