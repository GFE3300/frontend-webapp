import React, { memo, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import ProductDescriptionInput from '../stage_1/ProductDescriptionInput';
import CategoryDropdown from '../stage_1/CategoryDropdown';
import ProductIdentifiers from '../stage_1/ProductIdentifiers';
import ProductImageUploader from '../stage_1/ProductImageUploader';
import scriptLines from '../utils/script_lines'; // Added import

// ProductTitleInput is handled by ModalHeader in AddProductModal.jsx

const Step1_BasicData_Actual = memo(({
    formData,
    updateField,
    errors,
    availableInitialCategories,
    onCategoryCreate,
    availableInitialAttributes,
    onAttributeCreate,
}) => {

    const currentImageSrc = useMemo(() => {
        if (formData.productImage instanceof File) {
            return URL.createObjectURL(formData.productImage);
        }
        if (typeof formData.productImage === 'string') {
            return formData.productImage;
        }
        return null;
    }, [formData.productImage]);

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
                newSelectedAttributes = [...(formData.productAttributes || [])];
            }
        }
        updateField('productAttributes', newSelectedAttributes);
    };

    const handleCreateAndToggleAttribute = async (newTagData) => {
        try {
            const createdAttribute = await onAttributeCreate(newTagData);
            if (createdAttribute) {
                const attributeForForm = {
                    id: createdAttribute.id,
                    label: createdAttribute.name,
                    iconName: createdAttribute.icon_name,
                };
                updateField('productAttributes', [...(formData.productAttributes || []), attributeForForm]);
            }
        } catch (error) {
            console.error("Step1: Failed to create and toggle attribute", error);
        }
    };


    return (
        <div className="space-y-6 md:space-y-8 py-2">
            <div>
                <ProductDescriptionInput
                    initialValue={formData.subtitle}
                    onSave={(value) => updateField('subtitle', value)}
                    placeholder={scriptLines.step1SubtitlePlaceholder || "e.g., Freshly baked daily with organic ingredients"}
                    maxLength={150}
                    minRows={1}
                    maxHeightPx={100}
                    error={errors?.subtitle}
                    label={scriptLines.step1SubtitleLabel || "Product Subtitle"}
                    onCustomTagCreate={handleCreateAndToggleAttribute}
                    customTagCreationError={errors?.customTagCreationError}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-6 md:gap-y-8 items-start">
                <div className="space-y-6 md:space-y-8">
                    <CategoryDropdown
                        id="product-category"
                        options={availableInitialCategories.map(cat => ({ ...cat, value: cat.id, label: cat.name }))}
                        value={formData.category}
                        onChange={(value) => updateField('category', value)}
                        onNewCategorySubmit={onCategoryCreate}
                        error={errors?.category}
                        placeholder={scriptLines.step1CategoryPlaceholder || "Select or create category"}
                    />

                    <ProductIdentifiers
                        label={scriptLines.step1TagsLabel || "Product Tags/Attributes"}
                        allAvailableIdentifiers={availableInitialAttributes.map(attr => ({ ...attr, label: attr.name, iconName: attr.icon_name }))}
                        selectedIdentifiers={(formData.productAttributes || []).map(attr => attr.id)}
                        onToggleIdentifier={handleToggleAttribute}
                        onCustomTagCreate={handleCreateAndToggleAttribute}
                    />
                    {errors?.productAttributes && typeof errors.productAttributes === 'string' && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.productAttributes}</p>
                    )}
                </div>

                <div className="flex flex-col items-center">
                    <ProductImageUploader
                        onImageUpload={(file) => updateField('productImage', file)}
                        initialSrc={currentImageSrc}
                        maxFileSizeMB={20} // This could potentially be localized if shown to user, but ProductImageUploader handles its own sub-message
                        className="w-full max-w-[17rem] mx-auto"
                        // dropzoneMessage and dropzoneSubMessage will be picked up from ProductImageUploader's localized defaults
                    />
                    {errors?.productImage && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400 text-center">
                            {typeof errors.productImage === 'string' 
                                ? errors.productImage 
                                : (scriptLines.step1ImageErrorDefault || 'Invalid image')}
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
    errors: PropTypes.object,
    availableInitialCategories: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        colorClass: PropTypes.string,
    })).isRequired,
    onCategoryCreate: PropTypes.func.isRequired,
    availableInitialAttributes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        icon_name: PropTypes.string,
    })).isRequired,
    onAttributeCreate: PropTypes.func.isRequired,
    customTagCreationError: PropTypes.string, // Note: This seems redundant if errors.customTagCreationError is used above. Consolidate if possible.
    productAttributes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // Likely an error for productAttributes array, often a string.
};

Step1_BasicData_Actual.defaultProps = {
    errors: {},
};

export default Step1_BasicData_Actual;