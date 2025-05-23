// src/features/add_product_modal/steps/Step1_BasicData.jsx
import React, { memo, useMemo, useEffect } from 'react'; // Added useEffect
import PropTypes from 'prop-types';

import ProductDescriptionInput from '../stage_1/ProductDescriptionInput';
import CategoryDropdown from '../stage_1/CategoryDropdown';
import ProductIdentifiers from '../stage_1/ProductIdentifiers';
import ProductImageUploader from '../stage_1/ProductImageUploader';
// ProductTitleInput is handled by ModalHeader in AddProductModal.jsx

const Step1_BasicData_Actual = memo(({
    formData,
    updateField,
    errors,
    availableInitialCategories, // Passed from AddProductModal (fetched from API)
    onCategoryCreate,         // Passed from AddProductModal to handle API call
    availableInitialAttributes, // Passed from AddProductModal (fetched from API)
    onAttributeCreate,        // Passed from AddProductModal to handle API call
}) => {

    const currentImageSrc = useMemo(() => {
        if (formData.productImage instanceof File) {
            return URL.createObjectURL(formData.productImage);
        }
        if (typeof formData.productImage === 'string') { // Existing URL (from template or previous upload)
            return formData.productImage;
        }
        return null;
    }, [formData.productImage]);

    // Cleanup object URL
    useEffect(() => {
        let objectUrl = null;
        if (formData.productImage instanceof File) {
            objectUrl = URL.createObjectURL(formData.productImage);
        }
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [formData.productImage]);


    const handleToggleAttribute = (attributeId) => {
        const currentAttributeIds = (formData.productAttributes || []).map(attr => attr.id);
        const isSelected = currentAttributeIds.includes(attributeId);
        let newSelectedAttributes;

        if (isSelected) {
            newSelectedAttributes = (formData.productAttributes || []).filter(attr => attr.id !== attributeId);
        } else {
            const attributeToAdd = availableInitialAttributes.find(attr => attr.id === attributeId);
            if (attributeToAdd) {
                newSelectedAttributes = [...(formData.productAttributes || []), attributeToAdd];
            } else {
                newSelectedAttributes = [...(formData.productAttributes || [])]; // Should not happen if ID is from available
            }
        }
        updateField('productAttributes', newSelectedAttributes);
    };

    const handleCreateAndToggleAttribute = async (newTagData) => { // newTagData is { label, iconName }
        try {
            const createdAttribute = await onAttributeCreate(newTagData); // Expects a promise that resolves to the new attribute object {id, name, icon_name}
            if (createdAttribute) {
                // The onAttributeCreate in AddProductModal should update the TanStack query cache,
                // making `availableInitialAttributes` refetch/update.
                // Then, auto-select it. Map backend 'name' to 'label' and 'icon_name' to 'iconName' if needed for consistency with UI components.
                const attributeForForm = {
                    id: createdAttribute.id,
                    label: createdAttribute.name, // Assuming backend returns 'name'
                    iconName: createdAttribute.icon_name, // Assuming backend returns 'icon_name'
                };
                updateField('productAttributes', [...(formData.productAttributes || []), attributeForForm]);
            }
        } catch (error) {
            // Error is handled by onAttributeCreate in AddProductModal, potentially setting form errors
            console.error("Step1: Failed to create and toggle attribute", error);
        }
    };


    return (
        <div className="space-y-6 md:space-y-8 py-2"> {/* Added some vertical padding */}
            {/* Subtitle Input */}
            <div>
                <ProductDescriptionInput
                    initialValue={formData.subtitle}
                    onSave={(value) => updateField('subtitle', value)}
                    placeholder="e.g., Freshly baked daily with organic ingredients"
                    maxLength={150}
                    minRows={1}
                    maxHeightPx={100}
                    error={errors?.subtitle}
                    label="Product Subtitle" // Aria-label for the input
                    onCustomTagCreate={handleCreateAndToggleAttribute}
                    customTagCreationError={errors?.customTagCreationError}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-6 md:gap-y-8 items-start">
                <div className="space-y-6 md:space-y-8">
                    <CategoryDropdown
                        id="product-category"
                        options={availableInitialCategories.map(cat => ({ ...cat, value: cat.id, label: cat.name }))} // Adapt to CategoryDropdown's expected props
                        value={formData.category} // Should be category ID
                        onChange={(value) => updateField('category', value)}
                        onNewCategorySubmit={onCategoryCreate}
                        error={errors?.category}
                        placeholder="Select or create category"
                    />

                    <ProductIdentifiers
                        label="Product Tags/Attributes"
                        allAvailableIdentifiers={availableInitialAttributes.map(attr => ({ ...attr, label: attr.name, iconName: attr.icon_name }))} // Adapt from backend model
                        selectedIdentifiers={(formData.productAttributes || []).map(attr => attr.id)} // Send array of IDs
                        onToggleIdentifier={handleToggleAttribute}
                        onCustomTagCreate={handleCreateAndToggleAttribute}
                    />
                    {errors?.productAttributes && typeof errors.productAttributes === 'string' && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.productAttributes}</p>
                    )}
                </div>

                <div className="flex flex-col items-center">
                    <ProductImageUploader
                        onImageUpload={(file) => updateField('productImage', file)} // file is File object or null
                        initialSrc={currentImageSrc} // string (URL) or null
                        maxFileSizeMB={20}
                        className="w-full max-w-[17rem] mx-auto"
                    />
                    {errors?.productImage && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400 text-center">
                            {typeof errors.productImage === 'string' ? errors.productImage : 'Invalid image'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});

Step1_BasicData_Actual.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    // updateFormData: PropTypes.func.isRequired, // Keep if needed
    errors: PropTypes.object,
    availableInitialCategories: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        colorClass: PropTypes.string,
    })).isRequired,
    onCategoryCreate: PropTypes.func.isRequired,
    availableInitialAttributes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired, // Backend likely uses 'name'
        icon_name: PropTypes.string,    // Backend likely uses 'icon_name'
    })).isRequired,
    onAttributeCreate: PropTypes.func.isRequired,
    customTagCreationError: PropTypes.string,
    productAttributes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

Step1_BasicData_Actual.defaultProps = {
    errors: {},
};

export default Step1_BasicData_Actual;