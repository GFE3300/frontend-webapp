import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

import { useAddProductForm, TOTAL_STEPS } from '../hooks/useAddProductForm';
import ModalHeader from './ModalHeader';
import ModalStepIndicator from './ModalStepIndicator';
import ProductFormStep from './ProductFormStep';
import apiService from '../../../services/api';
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines';

import Step1_BasicData_Actual from '../steps/Step1_BasicData';
import Step2_EditableAttributes_Actual from '../steps/Step2_EditableAttributes';
import Step3_Ingredients_Actual from '../steps/Step3_Ingredients';
import Step4_Pricing_Actual from '../steps/Step4_Pricing';
import Step5_DiscountsExtras_Actual from '../steps/Step5_DiscountsExtras';

import {
    useCategories, useCreateCategory, useUpdateProduct, // Keep useUpdateProduct
    useProductAttributeTags, useCreateProductAttributeTag,
    // useMasterDiscountCodes and useCreateMasterDiscountCode are now used within Step5
} from '../../../contexts/ProductDataContext';
import { useAuth } from '../../../contexts/AuthContext';

const AddProductModal = ({ isOpen, onClose, onProductAdded, initialProductData }) => {
    const formStateHook = useAddProductForm({ initialData: initialProductData });
    const {
        currentStep, formData, errors, stepSaved,
        updateField, updateFormData,
        nextStep, prevStep, resetForm, isCurrentStepValid,
        setErrors, isEditMode,
        validateStep, goToStep,
    } = formStateHook;

    const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError, refetch: refetchCategories } = useCategories({ enabled: isOpen });
    const { data: attributesData, isLoading: isLoadingAttributes, error: attributesError, refetch: refetchAttributes } = useProductAttributeTags({ enabled: isOpen });

    const { user } = useAuth();
    const [isFetchingTemplate, setIsFetchingTemplate] = useState(false);
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

    const createCategoryMutation = useCreateCategory();
    const createAttributeMutation = useCreateProductAttributeTag();
    const updateProductMutation = useUpdateProduct(); // For edits

    useEffect(() => {
        if (isOpen) {
            if (!isEditMode && !initialProductData) { // Only fetch template for new products if no initialData is forced
                setIsFetchingTemplate(true);
                apiService.get('/products/last-template/')
                    .then(response => {
                        const template = response.data;
                        if (template && Object.keys(template).length > 0) {
                            // Map template data to formData structure expected by getInitialFormData
                            const templateFormData = {
                                name: template.name || '',
                                subtitle: template.subtitle || '',
                                description: template.description || '',
                                category: template.category, // Assuming template.category is the ID
                                product_tags_details: template.product_tags_details || [], // Pass full details for mapping in getInitialFormData
                                // image_url: template.image_url, // DO NOT load template image by default
                                product_type: template.product_type || 'made_in_house',
                                recipe_yields: template.recipe_yields,
                                labor_overhead_cost: template.labor_overhead_cost,
                                selling_price_excl_tax: template.selling_price_excl_tax,
                                tax_rate: template.tax_rate, // Assuming template.tax_rate is the ID
                                editable_attribute_groups: template.editable_attribute_groups || [],
                                recipe_components: template.recipe_components || [],
                                // For applied_product_discounts, ensure the template provides the correct structure
                                // that getInitialFormData can map (i.e., with nested discount_master objects)
                                applied_product_discounts: template.applied_product_discounts || [],
                                additional_notes: template.additional_notes || '',
                                is_template_candidate: false, // New products from template are not templates themselves by default
                            };
                            updateFormData(templateFormData); // Update existing formData state
                            // console.log("[AddProductModal Effect] Loaded product from template (image cleared):", templateFormData);
                        } else {
                            resetForm(); // No template, reset to defaults
                        }
                    })
                    .catch(error => {
                        if (error.response && error.response.status === 404) {
                            console.info(scriptLines.addProductModal_noTemplateFound);
                        } else {
                            console.error(scriptLines.addProductModal_errorFetchingTemplate, error);
                        }
                        resetForm(); // Reset on error too
                    })
                    .finally(() => setIsFetchingTemplate(false));
            } else {
                // If editing or initialData is provided, form is already initialized by useAddProductForm's useEffect
                setIsFetchingTemplate(false);
            }
        } else {
            // When modal closes, if not editing, reset the form for next "new product" action
            if (!isEditMode) {
                resetForm();
            }
            setIsFetchingTemplate(false); // Reset fetching state
        }
    }, [isOpen, isEditMode, initialProductData, updateFormData, resetForm]); // Dependencies for re-initialization

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const parseApiErrors = (error, defaultMessage) => {
        const apiError = error.response?.data;
        if (apiError && typeof apiError === 'object') {
            // Handle non_field_errors or detail first
            if (apiError.non_field_errors && Array.isArray(apiError.non_field_errors) && apiError.non_field_errors.length > 0) {
                return apiError.non_field_errors.join(' ');
            }
            if (apiError.detail && typeof apiError.detail === 'string') {
                return apiError.detail;
            }

            // Try to find the first field-specific error message
            const fieldErrorKeys = Object.keys(apiError);
            if (fieldErrorKeys.length > 0) {
                const firstKey = fieldErrorKeys[0];
                let messageContent = apiError[firstKey];

                if (Array.isArray(messageContent) && messageContent.length > 0) {
                    messageContent = messageContent[0]; // Take the first error message for the field
                }

                // If the message content is an object itself (e.g., for nested serializers)
                if (typeof messageContent === 'object' && messageContent !== null) {
                    const nestedKeys = Object.keys(messageContent);
                    if (nestedKeys.length > 0) {
                        const nestedFirstKey = nestedKeys[0];
                        let finalNestedMessage = messageContent[nestedFirstKey];
                        if (Array.isArray(finalNestedMessage) && finalNestedMessage.length > 0) {
                            finalNestedMessage = finalNestedMessage[0];
                        }
                        // Construct a message like "Recipe Components: Quantity: This field is required."
                        return `${firstKey.replace(/_/g, ' ')} - ${nestedFirstKey.replace(/_/g, ' ')}: ${finalNestedMessage}`;
                    }
                    return `${firstKey.replace(/_/g, ' ')}: ${JSON.stringify(messageContent)}`; // Fallback for complex nested error
                }
                return `${firstKey.replace(/_/g, ' ')}: ${messageContent}`;
            }
        }
        return error.message || defaultMessage || scriptLines.addProductModal_error_apiErrorDefault;
    };


    const handleCreateCategory = async (dataFromDropdown) => {
        if (!user?.activeBusinessId) {
            const msg = scriptLines.addProductModal_error_activeBusinessMissing;
            setErrors(prev => ({ ...prev, category: msg, form: msg }));
            throw new Error(msg);
        }
        const payload = {
            name: dataFromDropdown.label,
            color_class: dataFromDropdown.colorClass,
            icon_name: dataFromDropdown.iconName || null,
            // business ID is handled by backend/context
        };
        try {
            const createdCategory = await createCategoryMutation.mutateAsync(payload);
            updateField('category', createdCategory.id); // Update form with new category ID
            refetchCategories(); // Refetch categories list
            return createdCategory;
        } catch (error) {
            const errorMessage = parseApiErrors(error, scriptLines.addProductModal_error_failedToCreateCategory);
            setErrors(prev => ({ ...prev, category: errorMessage, form: scriptLines.addProductModal_error_categoryCreationFailed.replace('{errorMessage}', errorMessage) }));
            throw error; // Propagate error to stop further actions if needed
        }
    };

    const handleCreateAttribute = async (newAttributeData) => {
        if (!user?.activeBusinessId) {
            const msg = scriptLines.addProductModal_error_activeBusinessMissing;
            setErrors(prev => ({ ...prev, productAttributes: msg, customTagModalError: msg, form: msg }));
            throw new Error(msg);
        }
        const payload = {
            name: newAttributeData.label,
            icon_name: newAttributeData.iconName || null,
            // business ID handled by backend/context
        };
        try {
            const createdAttribute = await createAttributeMutation.mutateAsync(payload);
            const attributeForForm = {
                id: createdAttribute.id, // Use the ID from the backend response
                label: createdAttribute.name,
                iconName: createdAttribute.icon_name,
            };
            updateField('productAttributes', [...(formData.productAttributes || []), attributeForForm]);
            refetchAttributes(); // Refetch attributes list
            return createdAttribute; // Return the full backend object if needed by caller
        } catch (error) {
            const errorMessage = parseApiErrors(error, scriptLines.addProductModal_error_failedToCreateTag);
            setErrors(prev => ({ ...prev, customTagModalError: errorMessage, form: scriptLines.addProductModal_error_tagCreationFailed.replace('{errorMessage}', errorMessage) }));
            throw error;
        }
    };

    const handleFinalSubmit = async () => {
        setIsSubmittingProduct(true);
        setErrors(prev => ({ ...prev, form: undefined }));

        const finalStepIsValid = await isCurrentStepValid(); // Validate current step (Step 5)
        if (!finalStepIsValid) {
            await validateStep(TOTAL_STEPS); // Re-run validation to show errors for Step 5
            setIsSubmittingProduct(false);
            return;
        }

        const imageFileToUpload = formData.productImage instanceof File ? formData.productImage : null;
        const imageWasCleared = isEditMode && formData.productImage === null && initialProductData?.image_url;

        const jsonDataPayload = {
            name: formData.productName,
            subtitle: formData.subtitle || null,
            description: formData.description || null,
            // business: user?.activeBusinessId, // Backend should get this from request.user
            category: formData.category || null, // Send category UUID string or null
            product_tags: (formData.productAttributes || []).map(attr => attr.id), // Array of tag UUID strings

            product_type: formData.productType,
            recipe_yields: formData.productType === 'made_in_house' ? (Number(formData.recipeYields) || 1) : 1,
            labor_overhead_cost: formData.laborAndOverheadCost !== null ? Number(formData.laborAndOverheadCost) : 0,
            selling_price_excl_tax: Number(formData.sellingPrice),
            tax_rate: formData.taxRateId || null, // Send tax_rate UUID string or null
            additional_notes: formData.additionalNotes || null,
            is_template_candidate: formData.isTemplateCandidate,

            editable_attribute_groups: formData.editableAttributes.map((group, gIdx) => ({
                ...(group.id && !group.id.startsWith('temp_attr_group_') && !group.id.startsWith('attr_group_') ? { id: group.id } : {}), // Send ID only if it's a DB ID
                name: group.name,
                type: group.type,
                is_required: group.isRequired,
                display_order: gIdx,
                options: group.options.map((opt, oIdx) => ({
                    ...(opt.id && !opt.id.startsWith('temp_opt_') && !opt.id.startsWith('opt_') ? { id: opt.id } : {}), // Send ID only if it's a DB ID
                    name: opt.name,
                    price_adjustment: opt.priceAdjustment !== null ? Number(opt.priceAdjustment) : 0,
                    is_default: opt.isDefault,
                    display_order: oIdx,
                })),
            })),

            recipe_components: formData.recipeComponents.map((comp, cIdx) => ({
                ...(comp.id && typeof comp.id === 'string' && !(comp.id.startsWith('temp_comp_') || comp.id.startsWith('comp_') || comp.id.startsWith('component_')) ? { id: comp.id } : {}), // Send ID only if it's a DB ID
                inventory_item: comp.inventoryItemId, // UUID string of InventoryItem
                quantity: Number(comp.quantity),
                unit: comp.unit,
                display_order: cIdx,
            })),

            // **MODIFIED**: Ensure this structure matches backend expectations
            applied_product_discounts: (formData.appliedDiscounts || []).map(disc => ({
                ...(disc.id && !disc.id.startsWith('temp_applied_disc_') && !disc.id.startsWith('applied_disc_') ? { id: disc.id } : {}), // ID of ProductAppliedDiscount instance
                discount_master: disc.discount_master, // UUID string of DiscountMaster
                discount_percentage_override: disc.discount_master_type === 'percentage'
                    ? (disc.discount_percentage_override !== null ? Number(disc.discount_percentage_override) : null)
                    : null, // Override only for percentage types
            })),
        };
        // console.log('[AddProductModal handleFinalSubmit] Final JSON Data Payload:', JSON.parse(JSON.stringify(jsonDataPayload)));

        try {
            let productDataResponse;
            const requestConfig = { headers: { 'Content-Type': 'application/json' } }; // Explicitly setting, though apiService might default

            if (isEditMode && initialProductData?.id) {
                productDataResponse = await updateProductMutation.mutateAsync({
                    productId: initialProductData.id,
                    data: jsonDataPayload,
                    requestHeaders: requestConfig.headers // Pass headers for this specific call
                });
                // updateProductMutation returns the full Axios response, so data is in response.data
            } else {
                productDataResponse = await apiService.post('/products/', jsonDataPayload, requestConfig);
            }

            let resultingProduct = productDataResponse.data; // Axios response data
            let finalProductId = resultingProduct.id;

            if (imageFileToUpload && finalProductId) {
                try {
                    // console.log(`Uploading image for product ID: ${finalProductId}`);
                    const imageResponse = await apiService.uploadProductImage(finalProductId, imageFileToUpload);
                    if (imageResponse.data && imageResponse.data.image_url) {
                        resultingProduct.image_url = imageResponse.data.image_url; // Update with new URL
                    }
                    toast.info(scriptLines.addProductModal_toast_imageUploaded);
                } catch (imageError) {
                    // console.error("Image upload failed:", imageError.response?.data || imageError.message);
                    const errMsg = parseApiErrors(imageError, "Image upload error.");
                    toast.error(scriptLines.addProductModal_toast_imageUploadFailed.replace('{errorMessage}', errMsg));
                    // Product data itself might have saved, but image failed.
                }
            } else if (imageWasCleared && finalProductId) {
                try {
                    // console.log(`Deleting image for product ID: ${finalProductId}`);
                    await apiService.deleteProductImage(finalProductId);
                    toast.info(scriptLines.addProductModal_toast_imageRemoved);
                    if (resultingProduct.image_url) resultingProduct.image_url = null; // Update local state
                } catch (deleteImageError) {
                    // console.error("Image deletion failed:", deleteImageError.response?.data || deleteImageError.message);
                    const errMsg = parseApiErrors(deleteImageError, "Image removal error.");
                    toast.error(scriptLines.addProductModal_toast_imageRemoveFailed.replace('{errorMessage}', errMsg));
                }
            }

            toast.success(isEditMode ? scriptLines.addProductModal_toast_productUpdated : scriptLines.addProductModal_toast_productAdded);
            onProductAdded(resultingProduct); // Callback with the final product data (potentially updated image_url)
            onClose(); // Close modal

        } catch (apiError) {
            // console.error(isEditMode ? "Error updating product:" : "Error adding product:", apiError.response || apiError.message || apiError);
            const backendErrors = apiError.response?.data;
            const newErrorsState = {};
            const fieldMapping = { // Map backend field names to frontend formData keys
                name: 'productName', selling_price_excl_tax: 'sellingPrice',
                labor_overhead_cost: 'laborAndOverheadCost', recipe_yields: 'recipeYields',
                product_tags: 'productAttributes', tax_rate: 'taxRateId', category: 'category',
                editable_attribute_groups: 'editableAttributes',
                recipe_components: 'recipeComponents',
                applied_product_discounts: 'appliedDiscounts',
            };

            if (backendErrors && typeof backendErrors === 'object') {
                for (const key in backendErrors) {
                    const frontendKey = fieldMapping[key] || key; // Use mapped key or original if no map
                    const errorMessages = Array.isArray(backendErrors[key]) ? backendErrors[key] : [String(backendErrors[key])];

                    // Handle nested errors for array fields
                    if (Array.isArray(errorMessages) && errorMessages.every(e => typeof e === 'object' && e !== null)) {
                        // This is an array of error objects, likely for nested items
                        const nestedErrorsProcessed = errorMessages.map((itemError, idx) => {
                            if (typeof itemError === 'string') return itemError; // Should not happen if every e is object
                            const firstNestedErrorKey = Object.keys(itemError)[0];
                            if (firstNestedErrorKey) {
                                const nestedErrorMsg = Array.isArray(itemError[firstNestedErrorKey]) ? itemError[firstNestedErrorKey][0] : itemError[firstNestedErrorKey];
                                return `${frontendKey}[${idx}].${firstNestedErrorKey}: ${nestedErrorMsg}`; // For dev debugging
                            }
                            return JSON.stringify(itemError); // Fallback for complex nested error
                        }).join('; ');
                        newErrorsState[frontendKey] = nestedErrorsProcessed || "Error with items"; // Generic error for the list
                    } else {
                        newErrorsState[frontendKey] = errorMessages.join(', ');
                    }
                }
            }
            const formMessage = newErrorsState.detail || newErrorsState.non_field_errors || parseApiErrors(apiError, isEditMode ? scriptLines.addProductModal_error_failedToUpdateProduct : scriptLines.addProductModal_error_failedToAddProduct);
            if (newErrorsState.detail) delete newErrorsState.detail;
            if (newErrorsState.non_field_errors) delete newErrorsState.non_field_errors;

            setErrors(prev => ({ ...prev, ...newErrorsState, form: formMessage }));
        } finally {
            setIsSubmittingProduct(false);
        }
    };


    const renderStepContent = () => {
        const commonFormStepProps = {
            formStateHook, // Pass the whole hook's return value
            onProceed: nextStep,
            onBack: prevStep,
            isSubmitting: isSubmittingProduct, // Pass the specific submitting state for this modal
        };

        // Initial loading state for categories and attributes
        if ((isLoadingCategories || isLoadingAttributes || (isFetchingTemplate && !isEditMode)) && !categoriesError && !attributesError) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-10">
                    <Icon name="hourglass_empty" className="w-12 h-12 text-rose-500 animate-spin mb-4 flex items-center justify-center" style={{ fontSize: "2.75rem" }} />
                    <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">{scriptLines.addProductModal_loading_preparingForm}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{scriptLines.addProductModal_loading_fetchingSettings}</p>
                </div>
            );
        }
        // Error state for initial data loading
        if (categoriesError || attributesError) {
            const errorMsg = categoriesError?.message || attributesError?.message || scriptLines.addProductModal_loading_initialDataError_fallback;
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-10 text-center">
                    <Icon name="error_outline" className="w-12 h-12 text-red-500 mb-4" style={{ fontSize: "2.5rem" }} />
                    <p className="text-lg font-medium text-red-700 dark:text-red-400">{scriptLines.addProductModal_error_couldNotLoadData}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        {scriptLines.addProductModal_loading_initialDataError.replace('{errorMessage}', errorMsg)}
                    </p>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-md">
                        {scriptLines.common_cancel || scriptLines.addProductModal_button_close}
                    </button>
                </div>
            );
        }

        switch (currentStep) {
            case 1:
                return (
                    <ProductFormStep key={`step-${currentStep}-content`} stepIndex={0} {...commonFormStepProps}>
                        <Step1_BasicData_Actual
                            formData={formData} updateField={updateField} errors={errors}
                            availableInitialCategories={(categoriesData || []).map(cat => ({ ...cat, value: cat.id, label: cat.name }))}
                            onCategoryCreate={handleCreateCategory}
                            availableInitialAttributes={(attributesData || []).map(attr => ({ ...attr, id: attr.id, label: attr.name, iconName: attr.icon_name }))}
                            onAttributeCreate={handleCreateAttribute}
                            customTagCreationError={errors?.customTagModalError} // Pass specific error for tag modal
                        />
                    </ProductFormStep>
                );
            case 2: return (
                <ProductFormStep key={`step-${currentStep}-content`} stepIndex={1} {...commonFormStepProps}>
                    <Step2_EditableAttributes_Actual formData={formData} updateField={updateField} updateFormData={updateFormData} errors={errors} />
                </ProductFormStep>
            );
            case 3: return (
                <ProductFormStep key={`step-${currentStep}-content`} stepIndex={2} {...commonFormStepProps}>
                    <Step3_Ingredients_Actual formData={formData} updateField={updateField} updateFormData={updateFormData} errors={errors} />
                </ProductFormStep>
            );
            case 4: return (
                <ProductFormStep key={`step-${currentStep}-content`} stepIndex={3} {...commonFormStepProps}>
                    <Step4_Pricing_Actual formData={formData} updateField={updateField} updateFormData={updateFormData} errors={errors} />
                </ProductFormStep>
            );
            case 5:
                return (
                    <ProductFormStep key={`step-${currentStep}-content`} stepIndex={4} isFinalStep={true} onSubmit={handleFinalSubmit} {...commonFormStepProps}>
                        <Step5_DiscountsExtras_Actual
                            formData={formData}
                            updateField={updateField}
                            errors={errors}
                            activeBusinessId={user?.activeBusinessId} // Pass activeBusinessId
                        />
                    </ProductFormStep>
                );
            default:
                return <div className="p-4 text-center text-red-500">{scriptLines.addProductModal_error_invalidStep}</div>;
        }
    };

    if (!isOpen) return null;

    const showInitialLoadingOrErrorView = (isLoadingCategories || isLoadingAttributes || (isFetchingTemplate && !isEditMode && !initialProductData)) || categoriesError || attributesError;


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="add-product-modal-backdrop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[50] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm font-montserrat"
                    onClick={onClose} role="dialog" aria-modal="true"
                    aria-labelledby="add-product-modal-title"
                >
                    <motion.div
                        key="add-product-modal-card"
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.2 }}
                        className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()} role="document"
                    >
                        <ModalHeader
                            onClose={onClose}
                            productName={formData.productName}
                            onProductNameSave={(name) => updateField('productName', name)}
                            productNameError={errors?.productName}
                            titlePlaceholder={isEditMode ? scriptLines.addProductModal_header_placeholderEdit : scriptLines.addProductModal_header_placeholderNew}
                            isEditMode={isEditMode}
                        />
                        <div className="px-4 sm:px-6 pt-2 sm:pt-4 pb-4 flex-grow overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                            {showInitialLoadingOrErrorView ? (
                                <>
                                    {(isLoadingCategories || isLoadingAttributes || (isFetchingTemplate && !isEditMode && !initialProductData)) && !categoriesError && !attributesError && (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-10">
                                            <Icon name="hourglass_empty" className="w-12 h-12 text-rose-500 animate-spin mb-4 flex items-center justify-center" style={{ fontSize: "2.75rem" }} />
                                            <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">{scriptLines.addProductModal_loading_preparingForm}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{scriptLines.addProductModal_loading_fetchingSettings}</p>
                                        </div>
                                    )}
                                    {(categoriesError || attributesError) && (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-10 text-center">
                                            <Icon name="error_outline" className="w-12 h-12 text-red-500 mb-4" style={{ fontSize: "2.5rem" }} />
                                            <p className="text-lg font-medium text-red-700 dark:text-red-400">{scriptLines.addProductModal_error_couldNotLoadData}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                                {scriptLines.addProductModal_loading_initialDataError.replace('{errorMessage}', categoriesError?.message || attributesError?.message || scriptLines.addProductModal_loading_initialDataError_fallback)}
                                            </p>
                                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-md">
                                                {scriptLines.common_cancel || scriptLines.addProductModal_button_close}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <ModalStepIndicator
                                        currentStep={currentStep} totalSteps={TOTAL_STEPS} stepSaved={stepSaved}
                                        onStepClick={async (stepNum) => {
                                            // Allow navigation to previous steps, or to next if current is valid or saved
                                            if (stepNum < currentStep) {
                                                goToStep(stepNum);
                                            } else if (stepNum > currentStep) {
                                                const currentStepIsValidForNav = await formStateHook.validateStep(currentStep);
                                                if (currentStepIsValidForNav) {
                                                    goToStep(stepNum);
                                                }
                                            }
                                        }}
                                    />
                                    {errors?.form && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                            className="my-2 text-xs text-red-600 dark:text-red-400 text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-md flex items-center justify-center gap-1">
                                            <Icon name="error" className="w-6 h-6" /> {errors.form}
                                        </motion.p>
                                    )}
                                    <AnimatePresence mode="wait">
                                        {renderStepContent()}
                                    </AnimatePresence>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

AddProductModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onProductAdded: PropTypes.func.isRequired,
    initialProductData: PropTypes.object,
};

AddProductModal.displayName = 'AddProductModal';

export default AddProductModal;