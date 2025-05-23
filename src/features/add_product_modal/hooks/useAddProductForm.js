import { useState, useCallback, useMemo, useEffect } from 'react';
import * as yup from 'yup';
import scriptLines from '../utils/script_lines'; // Added import for scriptLines

// --- STAGE 1: Basic Data ---
const step1Schema = yup.object().shape({
    productName: yup.string().required(scriptLines.error_productName_required).max(100, scriptLines.error_productName_maxLength),
    subtitle: yup.string().max(150, scriptLines.error_subtitle_maxLength).nullable(),
    description: yup.string().max(1000, scriptLines.error_description_maxLength).nullable(),
    category: yup.string().required(scriptLines.error_category_required),
    productAttributes: yup.array().of(
        yup.object().shape({
            id: yup.string().required(),
            label: yup.string().required(),
            iconName: yup.string().nullable(),
        })
    ).max(10, scriptLines.error_productAttributes_maxLength).nullable(),
    productImage: yup.mixed().nullable(),
});

// --- STAGE 2: Editable Attributes ---
const optionSchema = yup.object().shape({
    id: yup.string().required(),
    name: yup.string().required(scriptLines.error_optionName_required).max(50, scriptLines.error_optionName_maxLength),
    priceAdjustment: yup.number().typeError(scriptLines.error_priceAdjustment_type).default(0).nullable(),
    isDefault: yup.boolean().default(false),
    display_order: yup.number().integer().min(0).default(0).nullable(),
});

const editableAttributeSchema = yup.object().shape({
    id: yup.string().required(),
    name: yup.string().required(scriptLines.error_attributeGroupName_required).max(50, scriptLines.error_attributeGroupName_maxLength),
    type: yup.string().oneOf(['single_select', 'multi_select']).required(scriptLines.error_attributeType_required),
    isRequired: yup.boolean().default(false),
    options: yup.array().of(optionSchema).min(1, scriptLines.error_attributeOptions_minLength).max(20, scriptLines.error_attributeOptions_maxLength),
    display_order: yup.number().integer().min(0).default(0).nullable(),
});

const step2Schema = yup.object().shape({
    editableAttributes: yup.array().of(editableAttributeSchema).max(5, scriptLines.error_editableAttributes_maxLength).nullable(),
});

// --- STAGE 3: Ingredients ---
const recipeComponentSchema = yup.object().shape({
    id: yup.string().required(),
    inventoryItemId: yup.string().required(scriptLines.error_recipeComponent_inventoryItem_required),
    inventoryItemName: yup.string().nullable(),
    quantity: yup.number().typeError(scriptLines.error_recipeComponent_quantity_type).required(scriptLines.error_recipeComponent_quantity_required).min(0.000001, scriptLines.error_recipeComponent_quantity_min),
    unit: yup.string().required(scriptLines.error_recipeComponent_unit_required).max(20, scriptLines.error_recipeComponent_unit_maxLength),
    display_order: yup.number().integer().min(0).default(0).nullable(),
});

const step3Schema = yup.object().shape({
    productType: yup.string().required(scriptLines.error_productType_required).oneOf(['made_in_house', 'resold_item']),
    recipeComponents: yup.array().when('productType', {
        is: 'made_in_house',
        then: (schema) => schema.of(recipeComponentSchema).min(1, scriptLines.error_recipeComponents_minLength_madeInHouse).nullable(),
        otherwise: (schema) => schema.nullable().max(0, scriptLines.error_recipeComponents_maxLength_resold),
    }),
    recipeYields: yup.number().when('productType', {
        is: 'made_in_house',
        then: (schema) => schema.typeError(scriptLines.error_recipeYields_type_madeInHouse).required(scriptLines.error_recipeYields_required_madeInHouse).integer(scriptLines.error_recipeYields_integer_madeInHouse).min(1, scriptLines.error_recipeYields_min_madeInHouse),
        otherwise: (schema) => schema.nullable().transform(value => (isNaN(value) ? 1 : value)).default(1),
    }),
});

// --- STAGE 4: Pricing ---
const step4Schema = yup.object().shape({
    laborAndOverheadCost: yup.number().typeError(scriptLines.error_laborCost_type).min(0, scriptLines.error_laborCost_min).nullable().default(0),
    sellingPrice: yup.number().typeError(scriptLines.error_sellingPrice_type).required(scriptLines.error_sellingPrice_required).min(0, scriptLines.error_sellingPrice_min),
    taxRateId: yup.string().nullable(),
});

// --- STAGE 5: Discounts & Extras ---
const appliedDiscountSchema = yup.object().shape({
    id: yup.string().required(),
    discount_master: yup.string().required(scriptLines.error_appliedDiscount_masterId_required),
    codeName: yup.string().nullable(),
    description: yup.string().nullable(),
    discount_percentage_override: yup.number()
        .typeError(scriptLines.error_appliedDiscount_overridePercentage_type)
        .min(0, scriptLines.error_appliedDiscount_overridePercentage_min)
        .max(100, scriptLines.error_appliedDiscount_overridePercentage_max)
        .nullable(),
});

const step5Schema = yup.object().shape({
    appliedDiscounts: yup.array().of(appliedDiscountSchema).nullable(),
    additionalNotes: yup.string().max(500, scriptLines.error_additionalNotes_maxLength).nullable(),
    isTemplateCandidate: yup.boolean().default(false),
});


export const TOTAL_STEPS = 5;

// Helper to generate temporary client-side IDs
const generateTempId = (prefix = 'temp_') => `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getInitialFormData = (initialProductData = null) => {
    const defaults = {
        productName: '', subtitle: '', description: '', category: '', productAttributes: [], productImage: null,
        editableAttributes: [],
        productType: 'made_in_house', recipeComponents: [], recipeYields: 1, estimatedCostFromIngredients: 0,
        laborAndOverheadCost: null, sellingPrice: null, taxRateId: null,
        appliedDiscounts: [], additionalNotes: '', isTemplateCandidate: false,
        _prevStep: 0, navigationDirection: 1,
    };

    if (!initialProductData || Object.keys(initialProductData).length === 0) {
        return defaults;
    }
    // console.log("[getInitialFormData] Mapping from initialProductData:", initialProductData); // Developer log, no localization needed

    return {
        ...defaults,
        productName: initialProductData.name || '',
        subtitle: initialProductData.subtitle || '',
        description: initialProductData.description || '',
        category: initialProductData.category || '',
        productAttributes: (initialProductData.product_tags_details || []).map(tag => ({
            id: tag.id,
            label: tag.name,
            iconName: tag.icon_name || null,
        })),
        productImage: initialProductData.image_url || null,

        editableAttributes: (initialProductData.editable_attribute_groups || []).map(group => ({
            id: group.id || generateTempId('attr_group_'),
            name: group.name || '',
            type: group.type || 'single_select',
            isRequired: group.is_required || false,
            display_order: group.display_order !== undefined ? group.display_order : 0,
            options: (group.options || []).map(opt => ({
                id: opt.id || generateTempId('opt_'),
                name: opt.name || '',
                priceAdjustment: opt.price_adjustment != null ? parseFloat(opt.price_adjustment) : 0,
                isDefault: opt.is_default || false,
                display_order: opt.display_order !== undefined ? opt.display_order : 0,
            })),
        })),

        productType: initialProductData.product_type || 'made_in_house',
        recipeComponents: (initialProductData.recipe_components || []).map(comp => ({
            id: comp.id || generateTempId('comp_'),
            inventoryItemId: comp.inventory_item || '',
            inventoryItemName: comp.inventory_item_details?.name || '',
            quantity: comp.quantity != null ? Number(comp.quantity) : '',
            unit: comp.unit || '',
            display_order: comp.display_order !== undefined ? comp.display_order : 0,
        })),
        recipeYields: initialProductData.product_type === 'made_in_house'
            ? (initialProductData.recipe_yields != null ? Number(initialProductData.recipe_yields) : 1)
            : 1,

        laborAndOverheadCost: initialProductData.labor_overhead_cost != null ? parseFloat(initialProductData.labor_overhead_cost) : null,
        sellingPrice: initialProductData.selling_price_excl_tax != null ? parseFloat(initialProductData.selling_price_excl_tax) : null,
        taxRateId: initialProductData.tax_rate || null,

        appliedDiscounts: (initialProductData.applied_product_discounts || []).map(ad => ({
            id: ad.id || generateTempId('applied_disc_'),
            discount_master: ad.discount_master,
            codeName: ad.discount_master_code_name || '',
            description: ad.discount_master_description || '',
            discount_percentage_override: ad.discount_percentage_override != null ? parseFloat(ad.discount_percentage_override) : null,
        })),
        additionalNotes: initialProductData.additional_notes || '',
        isTemplateCandidate: initialProductData.is_template_candidate || false,
        _prevStep: 0,
        navigationDirection: 1,
    };
};


export const useAddProductForm = ({ initialData: initialProductDataFromProp = null } = {}) => {
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState(() => {
        // console.log("[useAddProductForm useState Initializer] initialProductDataFromProp:", initialProductDataFromProp); // Developer log
        const data = getInitialFormData(initialProductDataFromProp);
        // console.log("[useAddProductForm useState Initializer] Initial formData:", data); // Developer log
        return data;
    });

    const [errors, setErrors] = useState({});
    const [stepSaved, setStepSaved] = useState({});

    const isEditMode = useMemo(() => !!initialProductDataFromProp, [initialProductDataFromProp]);

    useEffect(() => {
        // console.log("[useAddProductForm Effect] Triggered. isEditMode:", isEditMode, "initialProductDataFromProp:", initialProductDataFromProp); // Developer log
        const newFormData = getInitialFormData(initialProductDataFromProp);
        setFormData(newFormData);
        setCurrentStep(1);
        setErrors({});
        setStepSaved({});
        // console.log("[useAddProductForm Effect] Set formData to:", JSON.parse(JSON.stringify(newFormData))); // Developer log
    }, [initialProductDataFromProp, isEditMode]);


    const schemas = useMemo(() => [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema], []);


    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            if (newErrors[field]) delete newErrors[field];
            const baseFieldKey = field.split('[')[0];
            if (newErrors[baseFieldKey] && typeof newErrors[baseFieldKey] === 'string') {
                delete newErrors[baseFieldKey];
            }
            Object.keys(newErrors).forEach(errKey => {
                if (errKey.startsWith(baseFieldKey + '.') || errKey.startsWith(baseFieldKey + '[')) {
                    delete newErrors[errKey];
                }
            });
            return newErrors;
        });

        if (field === 'productType') {
            if (value === 'resold_item') {
                setFormData(prev => ({ ...prev, recipeComponents: [], recipeYields: 1, estimatedCostFromIngredients: 0 }));
                setErrors(prevErrs => {
                    const newErrs = { ...prevErrs };
                    delete newErrs.recipeComponents;
                    delete newErrs.recipeYields;
                    Object.keys(newErrs).forEach(key => {
                        if (key.startsWith('recipeComponents[')) delete newErrs[key];
                    });
                    return newErrs;
                });
            }
        }
        setStepSaved(prev => ({ ...prev, [currentStep]: false }));
    }, [currentStep, formData.recipeComponents]);

    const updateFormData = useCallback((newFormDataChunk) => {
        setFormData(prev => ({ ...prev, ...newFormDataChunk }));
        setErrors(prevErrors => {
            const updatedErrors = { ...prevErrors };
            Object.keys(newFormDataChunk).forEach(field => {
                if (updatedErrors[field]) delete updatedErrors[field];
                const baseKey = field.split('[')[0];
                Object.keys(updatedErrors).forEach(errKey => {
                    if (errKey.startsWith(baseKey + '[') || errKey.startsWith(baseKey + '.')) {
                        delete updatedErrors[errKey];
                    }
                });
            });
            return updatedErrors;
        });
        setStepSaved({});
    }, []);

    const validateStep = useCallback(async (stepNumberToValidate = currentStep) => {
        const schema = schemas[stepNumberToValidate - 1];
        if (!schema) return true;

        const dataToValidate = {
            productName: formData.productName,
            subtitle: formData.subtitle,
            description: formData.description,
            category: formData.category,
            productAttributes: formData.productAttributes,
            productImage: formData.productImage,
            editableAttributes: formData.editableAttributes,
            productType: formData.productType,
            recipeComponents: formData.recipeComponents,
            recipeYields: formData.recipeYields,
            laborAndOverheadCost: formData.laborAndOverheadCost,
            sellingPrice: formData.sellingPrice,
            taxRateId: formData.taxRateId,
            appliedDiscounts: formData.appliedDiscounts,
            additionalNotes: formData.additionalNotes,
            isTemplateCandidate: formData.isTemplateCandidate,
        };


        try {
            await schema.validate(dataToValidate, { abortEarly: false });
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                const schemaFieldKeys = Object.keys(schema.fields);
                schemaFieldKeys.forEach(key => {
                    delete newErrors[key];
                    Object.keys(newErrors).forEach(errorKey => {
                        if (errorKey.startsWith(key + '.') || errorKey.startsWith(key + '[')) {
                            delete newErrors[errorKey];
                        }
                    });
                });
                delete newErrors[`step${stepNumberToValidate}_general`];
                return newErrors;
            });
            return true;
        } catch (err) {
            const stepErrors = {};
            if (err.inner && err.inner.length > 0) {
                err.inner.forEach(error => {
                    stepErrors[error.path] = error.message;
                });
            } else {
                stepErrors[`step${stepNumberToValidate}_general`] = err.message || scriptLines.error_unknownValidation; // Used scriptLines here
            }
            setErrors(prevErrors => ({ ...prevErrors, ...stepErrors }));
            return false;
        }
    }, [formData, schemas, currentStep]);

    const goToStep = useCallback(async (stepNum) => {
        if (stepNum === currentStep) return;
        setFormData(prev => ({
            ...prev,
            _prevStep: currentStep,
            navigationDirection: stepNum > currentStep ? 1 : -1,
        }));
        setCurrentStep(stepNum);
    }, [currentStep]);

    const nextStep = useCallback(async () => {
        const isValid = await validateStep(currentStep);
        if (isValid && currentStep < TOTAL_STEPS) {
            const fromStep = currentStep;
            setStepSaved(prev => ({ ...prev, [fromStep]: true }));
            setFormData(prev => ({ ...prev, _prevStep: fromStep, navigationDirection: 1 }));
            setCurrentStep(prev => prev + 1);

            setTimeout(() => setStepSaved(prev => ({ ...prev, [fromStep]: 'ticked' })), 300);
            setTimeout(() => setStepSaved(prev => ({ ...prev, [fromStep]: true })), 1500);
        }
    }, [currentStep, validateStep]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            setFormData(prev => ({ ...prev, _prevStep: currentStep, navigationDirection: -1 }));
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const isCurrentStepValid = useCallback(async () => {
        const schema = schemas[currentStep - 1];
        if (!schema) return true;
        const dataToValidate = {
            productName: formData.productName, subtitle: formData.subtitle, description: formData.description, category: formData.category, productAttributes: formData.productAttributes, productImage: formData.productImage,
            editableAttributes: formData.editableAttributes, productType: formData.productType, recipeComponents: formData.recipeComponents, recipeYields: formData.recipeYields,
            laborAndOverheadCost: formData.laborAndOverheadCost, sellingPrice: formData.sellingPrice, taxRateId: formData.taxRateId,
            appliedDiscounts: formData.appliedDiscounts, additionalNotes: formData.additionalNotes, isTemplateCandidate: formData.isTemplateCandidate,
        };
        try {
            await schema.validate(dataToValidate, { abortEarly: true });
            return true;
        } catch {
            return false;
        }
    }, [formData, currentStep, schemas]);

    const resetForm = useCallback(() => {
        // console.log("[useAddProductForm resetForm] Resetting form. initialProductDataFromProp:", initialProductDataFromProp); // Developer log
        setFormData(getInitialFormData(initialProductDataFromProp));
        setErrors({});
        setCurrentStep(1);
        setStepSaved({});
    }, [initialProductDataFromProp]);

    return {
        currentStep, formData, errors, stepSaved,
        updateField, updateFormData,
        validateStep, nextStep, prevStep, resetForm, isCurrentStepValid,
        setCurrentStep, setErrors,
        TOTAL_STEPS,
        navigationDirection: formData.navigationDirection,
        goToStep,
        isEditMode,
    };
};