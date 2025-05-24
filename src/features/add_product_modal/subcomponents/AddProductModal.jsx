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
    useCategories, useCreateCategory, useUpdateProduct,
    useProductAttributeTags, useCreateProductAttributeTag,
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

    const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useCategories({ enabled: isOpen });
    const { data: attributesData, isLoading: isLoadingAttributes, error: attributesError } = useProductAttributeTags({ enabled: isOpen });

    const { user } = useAuth();
    const [isFetchingTemplate, setIsFetchingTemplate] = useState(false);
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

    const createCategoryMutation = useCreateCategory();
    const createAttributeMutation = useCreateProductAttributeTag();
    const updateProductMutation = useUpdateProduct();

    useEffect(() => {
        if (isOpen) {
            if (!isEditMode && !initialProductData) {
                setIsFetchingTemplate(true);
                apiService.get('/products/last-template/')
                    .then(response => {
                        const template = response.data;
                        if (template && Object.keys(template).length > 0) {
                            const templateFormData = { /* ... mapping logic ... */
                                productName: template.name || '',
                                subtitle: template.subtitle || '',
                                description: template.description || '',
                                category: template.category || '',
                                productAttributes: (template.product_tags_details || []).map(tag => ({
                                    id: tag.id, label: tag.name, iconName: tag.icon_name || null,
                                })),
                                productImage: null,
                                editableAttributes: (template.editable_attribute_groups || []).map(group => ({
                                    id: group.id, name: group.name, type: group.type, isRequired: group.is_required, display_order: group.display_order || 0,
                                    options: (group.options || []).map(opt => ({
                                        id: opt.id, name: opt.name, priceAdjustment: parseFloat(opt.price_adjustment || 0), isDefault: opt.is_default, display_order: opt.display_order || 0
                                    })),
                                })),
                                productType: template.product_type || 'made_in_house',
                                recipeComponents: (template.recipe_components || []).map(comp => ({
                                    id: comp.id, inventoryItemId: comp.inventory_item, inventoryItemName: comp.inventory_item_details?.name || '',
                                    quantity: Number(comp.quantity || 0), unit: comp.unit, display_order: comp.display_order || 0
                                })),
                                recipeYields: Number(template.recipe_yields) || 1,
                                laborAndOverheadCost: template.labor_overhead_cost != null ? parseFloat(template.labor_overhead_cost) : null,
                                sellingPrice: template.selling_price_excl_tax != null ? parseFloat(template.selling_price_excl_tax) : null,
                                taxRateId: template.tax_rate || null,
                                appliedDiscounts: (template.applied_product_discounts || []).map(ad => ({
                                    id: ad.id, discount_master: ad.discount_master, codeName: ad.discount_master_code_name,
                                    description: ad.discount_master_description || '',
                                    discount_percentage_override: ad.discount_percentage_override != null ? parseFloat(ad.discount_percentage_override) : null,
                                })),
                                additionalNotes: template.additional_notes || '',
                                isTemplateCandidate: false,
                            };
                            updateFormData(templateFormData);
                            // console.log("[AddProductModal Effect] Loaded product from template (image cleared):", templateFormData); // Dev log
                        } else {
                            resetForm();
                        }
                    })
                    .catch(error => {
                        if (error.response && error.response.status === 404) {
                            console.info(scriptLines.addProductModal_noTemplateFound);
                        } else {
                            console.error(scriptLines.addProductModal_errorFetchingTemplate, error);
                        }
                        resetForm();
                    })
                    .finally(() => setIsFetchingTemplate(false));
            } else {
                setIsFetchingTemplate(false);
            }
        } else {
            setIsFetchingTemplate(false);
        }
    }, [isOpen, isEditMode, initialProductData, updateFormData, resetForm]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // useEffect(() => { // Dev log
    //     if (isOpen) {
    //         console.log("[AddProductModal Content Render] formData:", JSON.parse(JSON.stringify(formData)));
    //     }
    // }, [isOpen, formData, currentStep]);

    const parseApiErrors = (error, defaultMessage) => {
        if (error.response?.data) {
            const data = error.response.data;
            if (typeof data === 'object' && !Array.isArray(data)) {
                const fieldErrorKeys = Object.keys(data);
                if (fieldErrorKeys.length > 0) {
                    const firstKey = fieldErrorKeys[0];
                    let message = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
                    if (typeof message === 'object' && message !== null) {
                        const nestedKeys = Object.keys(message);
                        if (nestedKeys.length > 0) {
                            const nestedFirstKey = nestedKeys[0];
                            message = `${nestedFirstKey}: ${Array.isArray(message[nestedFirstKey]) ? message[nestedFirstKey][0] : message[nestedFirstKey]}`;
                        } else {
                            message = JSON.stringify(message);
                        }
                    }
                    // Dynamic field name, difficult to fully localize without backend sending localized field names or codes
                    return `${firstKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${message}`;
                }
            }
            if (data.detail) return data.detail;
            if (typeof data === 'string') return data;
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
            business: user.activeBusinessId,
        };
        try {
            const createdCategory = await createCategoryMutation.mutateAsync(payload);
            updateField('category', createdCategory.id);
            return createdCategory;
        } catch (error) {
            const errorMessage = parseApiErrors(error, scriptLines.addProductModal_error_failedToCreateCategory);
            setErrors(prev => ({ ...prev, category: errorMessage, form: scriptLines.addProductModal_error_categoryCreationFailed.replace('{errorMessage}', errorMessage) }));
            throw error;
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
            business: user.activeBusinessId,
        };
        try {
            const createdAttribute = await createAttributeMutation.mutateAsync(payload);
            const attributeForForm = {
                id: createdAttribute.id,
                label: createdAttribute.name,
                iconName: createdAttribute.icon_name,
            };
            updateField('productAttributes', [...(formData.productAttributes || []), attributeForForm]);
            return createdAttribute;
        } catch (error) {
            const errorMessage = parseApiErrors(error, scriptLines.addProductModal_error_failedToCreateTag);
            setErrors(prev => ({ ...prev, customTagModalError: errorMessage, form: scriptLines.addProductModal_error_tagCreationFailed.replace('{errorMessage}', errorMessage) }));
            throw error;
        }
    };

    const handleFinalSubmit = async () => {
        setIsSubmittingProduct(true);
        setErrors(prev => ({ ...prev, form: undefined }));

        const finalStepIsValid = await isCurrentStepValid();
        if (!finalStepIsValid) {
            await validateStep(TOTAL_STEPS);
            setIsSubmittingProduct(false);
            return;
        }

        const imageFileToUpload = formData.productImage instanceof File ? formData.productImage : null;
        const imageWasCleared = isEditMode && formData.productImage === null && initialProductData?.image_url;

        const jsonDataPayload = {
            name: formData.productName,
            subtitle: formData.subtitle || null,
            description: formData.description || null,
            business: user?.activeBusinessId,
            category: formData.category || null,
            product_tags: (formData.productAttributes || []).map(attr => attr.id),
            product_type: formData.productType,
            recipe_yields: formData.productType === 'made_in_house' ? (Number(formData.recipeYields) || 1) : 1,
            labor_overhead_cost: formData.laborAndOverheadCost !== null ? Number(formData.laborAndOverheadCost) : 0,
            selling_price_excl_tax: Number(formData.sellingPrice),
            tax_rate: formData.taxRateId || null,
            additional_notes: formData.additionalNotes || null,
            is_template_candidate: formData.isTemplateCandidate,
            editable_attribute_groups: formData.editableAttributes.map((group, gIdx) => ({
                ...(group.id && !group.id.startsWith('attr_group_') ? { id: group.id } : {}),
                name: group.name, type: group.type, is_required: group.isRequired, display_order: gIdx,
                options: group.options.map((opt, oIdx) => ({
                    ...(opt.id && !opt.id.startsWith('opt_') ? { id: opt.id } : {}),
                    name: opt.name, price_adjustment: opt.priceAdjustment !== null ? Number(opt.priceAdjustment) : 0,
                    is_default: opt.isDefault, display_order: oIdx,
                })),
            })),
            recipe_components: formData.recipeComponents.map((comp, cIdx) => ({
                ...(comp.id && typeof comp.id === 'string' && !(comp.id.startsWith('comp_') || comp.id.startsWith('component_')) ? { id: comp.id } : {}),
                inventory_item: comp.inventoryItemId, quantity: Number(comp.quantity), unit: comp.unit, display_order: cIdx,
            })),
            applied_product_discounts: formData.appliedDiscounts.map(disc => ({
                ...(disc.id && !disc.id.startsWith('applied_disc_') ? { id: disc.id } : {}),
                discount_master: disc.discount_master,
                discount_percentage_override: disc.discount_percentage_override !== null ? Number(disc.discount_percentage_override) : null,
            })),
        };
        // console.log('[handleFinalSubmit] JSON Data Payload:', JSON.parse(JSON.stringify(jsonDataPayload))); // Dev log

        try {
            let productDataResponse;
            const jsonRequestConfig = { headers: { 'Content-Type': 'application/json' } };

            if (isEditMode) {
                productDataResponse = await updateProductMutation.mutateAsync({
                    productId: initialProductData.id,
                    data: jsonDataPayload,
                    requestHeaders: jsonRequestConfig.headers
                });
            } else {
                productDataResponse = await apiService.post('/products/', jsonDataPayload, jsonRequestConfig);
            }

            let resultingProduct = productDataResponse.data;
            let finalProductId = resultingProduct.id;

            if (imageFileToUpload && finalProductId) {
                try {
                    const imageResponse = await apiService.uploadProductImage(finalProductId, imageFileToUpload);
                    if (imageResponse.data && imageResponse.data.image_url) {
                        resultingProduct.image_url = imageResponse.data.image_url;
                    }
                    toast.info(scriptLines.addProductModal_toast_imageUploaded);
                } catch (imageError) {
                    const errMsg = parseApiErrors(imageError, "Image upload error."); // "Image upload error." can be localized too
                    toast.error(scriptLines.addProductModal_toast_imageUploadFailed.replace('{errorMessage}', errMsg));
                }
            } else if (imageWasCleared && finalProductId) {
                try {
                    await apiService.deleteProductImage(finalProductId);
                    toast.info(scriptLines.addProductModal_toast_imageRemoved);
                    if (resultingProduct.image_url) resultingProduct.image_url = null;
                } catch (deleteImageError) {
                    const errMsg = parseApiErrors(deleteImageError, "Image removal error."); // "Image removal error." can be localized
                    toast.error(scriptLines.addProductModal_toast_imageRemoveFailed.replace('{errorMessage}', errMsg));
                }
            }

            toast.success(isEditMode ? scriptLines.addProductModal_toast_productUpdated : scriptLines.addProductModal_toast_productAdded);
            onProductAdded(resultingProduct);
            onClose();

        } catch (apiError) {
            // console.error(isEditMode ? "Error updating product:" : "Error adding product:", apiError.response || apiError); // Dev log
            const backendErrors = apiError.response?.data;
            const newErrorsState = {};
            if (backendErrors && typeof backendErrors === 'object') {
                for (const key in backendErrors) {
                    const frontendKey = {
                        name: 'productName', selling_price_excl_tax: 'sellingPrice',
                        labor_overhead_cost: 'laborAndOverheadCost', recipe_yields: 'recipeYields',
                        product_tags: 'productAttributes', tax_rate: 'taxRateId', category: 'category',
                        editable_attribute_groups: 'editableAttributes',
                        recipe_components: 'recipeComponents',
                        applied_product_discounts: 'appliedDiscounts',
                    }[key] || key;

                    newErrorsState[frontendKey] = Array.isArray(backendErrors[key]) ? backendErrors[key].join(', ') : String(backendErrors[key]);

                    if (Array.isArray(backendErrors[key]) && (key === 'editable_attribute_groups' || key === 'recipe_components' || key === 'applied_product_discounts')) {
                        backendErrors[key].forEach((itemError, idx) => {
                            if (itemError && typeof itemError === 'object' && Object.keys(itemError).length > 0) {
                                const firstNestedKey = Object.keys(itemError)[0];
                                newErrorsState[`${frontendKey}[${idx}].${firstNestedKey}`] = Array.isArray(itemError[firstNestedKey]) ? itemError[firstNestedKey][0] : itemError[firstNestedKey];
                            } else if (typeof itemError === 'string') {
                                newErrorsState[`${frontendKey}[${idx}]._general`] = itemError;
                            }
                        });
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
            formStateHook,
            onProceed: nextStep,
            onBack: prevStep,
            isSubmitting: isSubmittingProduct,
        };

        if (isLoadingCategories || isLoadingAttributes || (isFetchingTemplate && !isEditMode)) {
            return (
                <div className="flex justify-center items-center h-120">
                    <Icon name="hourglass_empty" className="w-8 h-8 text-rose-500 animate-spin" style={{ fontSize: "2rem" }} />
                    <p className="ml-3 text-neutral-600 dark:text-neutral-300">{scriptLines.addProductModal_loading_productSetup}</p>
                </div>
            );
        }
        if (categoriesError || attributesError) {
            const errorMsg = categoriesError?.message || attributesError?.message || scriptLines.addProductModal_loading_initialDataError_fallback;
            return (
                <div className="text-red-500 p-4 text-center">
                    <Icon name="error_outline" className="w-10 h-10 mx-auto mb-2" />
                    {scriptLines.addProductModal_loading_initialDataError.replace('{errorMessage}', errorMsg)}
                </div>
            );
        }

        switch (currentStep) {
            case 1:
                return (
                    <ProductFormStep key={currentStep} stepIndex={0} {...commonFormStepProps}>
                        <Step1_BasicData_Actual
                            formData={formData} updateField={updateField} errors={errors}
                            availableInitialCategories={(categoriesData || []).map(cat => ({ ...cat, value: cat.id, label: cat.name }))}
                            onCategoryCreate={handleCreateCategory}
                            availableInitialAttributes={(attributesData || []).map(attr => ({ ...attr, id: attr.id, label: attr.name, iconName: attr.icon_name }))}
                            onAttributeCreate={handleCreateAttribute}
                            customTagCreationError={errors?.customTagModalError}
                        />
                    </ProductFormStep>
                );
            case 2: /* ... */ return (
                <ProductFormStep key={currentStep} stepIndex={1} {...commonFormStepProps}>
                    <Step2_EditableAttributes_Actual formData={formData} updateField={updateField} errors={errors} />
                </ProductFormStep>
            );
            case 3: /* ... */ return (
                <ProductFormStep key={currentStep} stepIndex={2} {...commonFormStepProps}>
                    <Step3_Ingredients_Actual formData={formData} updateField={updateField} updateFormData={updateFormData} errors={errors} />
                </ProductFormStep>
            );
            case 4: /* ... */ return (
                <ProductFormStep key={currentStep} stepIndex={3} {...commonFormStepProps}>
                    <Step4_Pricing_Actual formData={formData} updateField={updateField} updateFormData={updateFormData} errors={errors} />
                </ProductFormStep>
            );
            case 5:
                return (
                    <ProductFormStep key={currentStep} stepIndex={4} isFinalStep={true} onSubmit={handleFinalSubmit} {...commonFormStepProps}>
                        <Step5_DiscountsExtras_Actual
                            formData={formData}
                            updateField={updateField}
                            errors={errors}
                            activeBusinessId={user?.activeBusinessId}
                        />
                    </ProductFormStep>
                );
            default:
                return <div className="p-4 text-center text-red-500">{scriptLines.addProductModal_error_invalidStep}</div>;
        }
    };

    if (!isOpen) return null;

    const showInitialLoadingOrError = isLoadingCategories || isLoadingAttributes || (isFetchingTemplate && !isEditMode) || categoriesError || attributesError;

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
                            {showInitialLoadingOrError ? (
                                <>
                                    {(isLoadingCategories || isLoadingAttributes || (isFetchingTemplate && !isEditMode)) && (
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
                                                {categoriesError?.message || attributesError?.message || scriptLines.addProductModal_error_tryClosingModal}
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
                                            if (stepNum < currentStep || (stepNum === currentStep + 1 && await formStateHook.isCurrentStepValid())) {
                                                const currentStepContentIsValid = await formStateHook.validateStep(currentStep);
                                                if (currentStepContentIsValid || (errors && Object.keys(errors).length > 0 && !Object.keys(errors).some(k => k !== 'form'))) {
                                                    goToStep(stepNum);
                                                } else if (stepNum < currentStep) {
                                                    goToStep(stepNum);
                                                }
                                            } else if (stepSaved[stepNum - 1] === true || stepSaved[stepNum - 1] === 'ticked') {
                                                goToStep(stepNum);
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

export default AddProductModal;