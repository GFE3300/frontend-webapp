import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { InputField } from '../../../features/register/subcomponents';
import AppliedDiscountsManager from '../stage_5/AppliedDiscountsManager';
import CreateDiscountCodeModal from '../stage_5/CreateDiscountCodeModal';
import { useMasterDiscountCodes, useCreateMasterDiscountCode } from '../../../contexts/ProductDataContext';
import scriptLines from '../utils/script_lines'; // MODIFIED: Adjust path as needed

const generateId = (prefix = 'id_') => `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const Step5_DiscountsExtras_Actual = memo(({ formData, updateField, errors, activeBusinessId }) => {
    const [isCreateDiscountModalOpen, setIsCreateDiscountModalOpen] = useState(false);
    const sl = scriptLines.step5DiscountsExtras; // MODIFIED: Alias for shorter access

    const { data: masterCodesData, isLoading: isLoadingMasterCodes, error: masterCodesError } = useMasterDiscountCodes();
    const availableMasterCodes = masterCodesData || [];

    const createMasterDiscountMutation = useCreateMasterDiscountCode();

    const handleApplyCode = useCallback((masterCode) => {
        const alreadyApplied = (formData.appliedDiscounts || []).some(ad => ad.discount_master === masterCode.id);
        if (alreadyApplied) {
            console.warn(sl.warnDiscountAlreadyApplied); // MODIFIED
            // Optionally: updateField('errors', { ...errors, appliedDiscounts: sl.errorAppliedDiscountsGeneric });
            return;
        }

        const newAppliedDiscount = {
            id: generateId('applied_disc_'),
            discount_master: masterCode.id,
            codeName: masterCode.code_name,
            description: masterCode.description,
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
            console.error(sl.errorMissingBusinessId); // MODIFIED
            throw new Error(sl.errorBusinessContextMissing); // MODIFIED
        }

        try {
            const payload = {
                code_name: newDiscountDataFromModal.codeName,
                description: newDiscountDataFromModal.description,
                type: newDiscountDataFromModal.type,
                default_value: newDiscountDataFromModal.value,
                business: activeBusinessId,
            };
            await createMasterDiscountMutation.mutateAsync(payload);
            setIsCreateDiscountModalOpen(false);
        } catch (err) {
            console.error(sl.errorFailedCreateMasterCode, err); // MODIFIED
            throw err;
        }
    };

    if (isLoadingMasterCodes) {
        return <div className="py-10 text-center">{sl.loadingMasterCodes}</div>; // MODIFIED
    }
    if (masterCodesError) {
        return <div className="py-10 text-center text-red-500">{sl.errorLoadingMasterCodesPrefix} {masterCodesError.message}</div>; // MODIFIED
    }

    return (
        <>
            <motion.div
                layout className="space-y-8 py-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            >
                <div>
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                        {sl.mainTitle} {/* MODIFIED */}
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {sl.mainDescription} {/* MODIFIED */}
                    </p>
                </div>

                <div className="p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-4 dark:border-neutral-600">
                        {sl.productSpecificDiscountsTitle} {/* MODIFIED */}
                    </h3>
                    <AppliedDiscountsManager
                        appliedDiscounts={(formData.appliedDiscounts || []).map(ad => ({
                            id: ad.id,
                            discountCodeId: ad.discount_master,
                            codeName: ad.codeName,
                            description: ad.description,
                            discountPercentage: ad.discount_percentage_override,
                        }))}
                        availableMasterCodes={availableMasterCodes}
                        onApplyCode={handleApplyCode}
                        onUpdateAppliedPercentage={handleUpdateAppliedPercentage}
                        onRemoveAppliedCode={handleRemoveAppliedCode}
                        onTriggerCreateNewCode={() => setIsCreateDiscountModalOpen(true)}
                        formErrors={errors} // Pass all form errors for context if needed by manager
                        errors={errors?.appliedDiscounts}
                    />
                </div>

                <div className="p-5 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-4 dark:border-neutral-600">
                        {sl.additionalNotesTitle} {/* MODIFIED */}
                    </h3>
                    <div className='flex h-15 items-end w-full'>
                        <InputField
                            label={sl.additionalNotesLabel} // MODIFIED
                            className="w-full"
                            isTextArea={true} rows={4}
                            value={formData.additionalNotes || ''}
                            onChange={(e) => updateField('additionalNotes', e.target.value)}
                            error={errors?.additionalNotes}
                            placeholder={sl.additionalNotesPlaceholder} // MODIFIED
                            maxLength={500}
                            hidelabel // Assuming label is shown by h3, if not, remove hidelabel and set label from sl
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
    activeBusinessId: PropTypes.string.isRequired, // Added activeBusinessId to propTypes
};

// Added defaultProp for activeBusinessId if it can sometimes be undefined initially, though isRequired suggests it must be there.
// Step5_DiscountsExtras_Actual.defaultProps = {
//    activeBusinessId: null, 
// };


export default Step5_DiscountsExtras_Actual;