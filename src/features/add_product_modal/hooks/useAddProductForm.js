// frontend/src/features/add_product_modal/hooks/useAddProductForm.js
import { useState, useCallback, useMemo, useEffect } from 'react';
import * as yup from 'yup';
import scriptLines from '../utils/script_lines';

// --- STAGE 1: Basic Data ---
const step1Schema = yup.object().shape({
    productName: yup.string().required(scriptLines.error_productName_required).max(100, scriptLines.error_productName_maxLength),
    subtitle: yup.string().max(150, scriptLines.error_subtitle_maxLength).nullable(),
    description: yup.string().max(1000, scriptLines.error_description_maxLength).nullable(),
    category: yup.string().required(scriptLines.error_category_required), // Expects category ID (UUID string)
    productAttributes: yup.array().of(
        yup.object().shape({ // This is for the objects stored in formData.productAttributes
            id: yup.string().required(), // UUID of ProductAttributeTag
            label: yup.string().required(),
            iconName: yup.string().nullable(),
        })
    ).max(10, scriptLines.error_productAttributes_maxLength).nullable(),
    productImage: yup.mixed().nullable(), // File object or URL string or null
});

// --- STAGE 2: Editable Attributes ---
const optionSchema = yup.object().shape({
    id: yup.string().required(), // Can be temp ID or DB ID
    name: yup.string().required(scriptLines.error_optionName_required).max(50, scriptLines.error_optionName_maxLength),
    priceAdjustment: yup.number().typeError(scriptLines.error_priceAdjustment_type).default(0).nullable(),
    isDefault: yup.boolean().default(false),
    display_order: yup.number().integer().min(0).default(0).nullable(),
});

const editableAttributeSchema = yup.object().shape({
    id: yup.string().required(), // Can be temp ID or DB ID
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
    id: yup.string().required(), // Can be temp ID or DB ID
    inventoryItemId: yup.string().uuid(scriptLines.error_recipeComponent_inventoryItem_invalidUUID || "Selected ingredient is invalid.").required(scriptLines.error_recipeComponent_inventoryItem_required), // Expects InventoryItem UUID
    inventoryItemName: yup.string().nullable(), // For display, not submitted directly
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
    taxRateId: yup.string().uuid("Invalid Tax Rate ID").nullable(), // Expects TaxRate ID (UUID string) or null
});

// --- STAGE 5: Discounts & Extras ---
const appliedDiscountSchema = yup.object().shape({
    id: yup.string().required(), // UI key, can be temp ID or DB ID
    discount_master: yup.string().uuid(scriptLines.error_appliedDiscount_masterId_invalidUUID || "Selected discount code is invalid.").required(scriptLines.error_appliedDiscount_masterId_required), // UUID of DiscountMaster
    discount_percentage_override: yup.number()
        .typeError(scriptLines.error_appliedDiscount_overridePercentage_type)
        .min(0, scriptLines.error_appliedDiscount_overridePercentage_min)
        .max(100, scriptLines.error_appliedDiscount_overridePercentage_max)
        .nullable(), // Nullable if not percentage type or no override
});

const step5Schema = yup.object().shape({
    appliedDiscounts: yup.array().of(appliedDiscountSchema).nullable(),
    additionalNotes: yup.string().max(500, scriptLines.error_additionalNotes_maxLength).nullable(),
    isTemplateCandidate: yup.boolean().default(false),
});


export const TOTAL_STEPS = 5;
const generateTempId = (prefix = 'temp_') => `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getInitialFormData = (initialProductData = null, initialProductDataFromProp = null) => {
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

    console.log("[getInitialFormData] Received initialProductData:", JSON.parse(JSON.stringify(initialProductData)));

    let appliedDiscountsSource = null;
    let sourceName = "";

    if (initialProductData.all_applied_discounts_admin && Array.isArray(initialProductData.all_applied_discounts_admin)) {
        appliedDiscountsSource = initialProductData.all_applied_discounts_admin;
        sourceName = "all_applied_discounts_admin";
        console.log("[getInitialFormData] Using 'all_applied_discounts_admin' for applied discounts population.");
    } else if (initialProductData.applied_product_discounts && Array.isArray(initialProductData.applied_product_discounts)) {
        appliedDiscountsSource = initialProductData.applied_product_discounts;
        sourceName = "applied_product_discounts (fallback)";
        console.warn("[getInitialFormData] Warning: 'all_applied_discounts_admin' not found in initialProductData. Falling back to 'applied_product_discounts'. Admin view of discounts might be incomplete.");
    } else if (initialProductData.active_applied_product_discounts && Array.isArray(initialProductData.active_applied_product_discounts)) {
        appliedDiscountsSource = initialProductData.active_applied_product_discounts;
        sourceName = "active_applied_product_discounts (last resort fallback)";
        console.warn("[getInitialFormData] Warning: Neither 'all_applied_discounts_admin' nor 'applied_product_discounts' found. Falling back to 'active_applied_product_discounts'. This is likely not suitable for admin editing.");
    } else {
        appliedDiscountsSource = [];
        sourceName = "none (default empty array)";
        console.log("[getInitialFormData] No source for applied discounts found in initialProductData. Defaulting to empty array.");
    }

    let mappedAppliedDiscounts = [];

    if (sourceName === "all_applied_discounts_admin") {
        mappedAppliedDiscounts = (appliedDiscountsSource || []).map(item => {
            if (!item.discount_master || !item.discount_master_code_name || !item.discount_master_type || item.discount_master_default_value == null) {
                console.warn("[getInitialFormData] Item in 'all_applied_discounts_admin' is missing critical discount_master details:", item);
                return null;
            }

            let overrideValue = null;
            if (item.discount_percentage_override !== null && item.discount_percentage_override !== undefined) {
                overrideValue = parseFloat(item.discount_percentage_override);
            } else if (item.discount_master_type === 'percentage') {
                overrideValue = parseFloat(item.discount_master_default_value);
            }

            const descriptionText = item.discount_master_code_name || `Discount (${item.discount_master_type})`;

            return {
                id: item.id || generateTempId('applied_disc_'),
                discount_master: item.discount_master,
                codeName: item.discount_master_code_name,
                description: descriptionText,
                discount_master_type: item.discount_master_type,
                discount_master_default_value: parseFloat(item.discount_master_default_value),
                discount_percentage_override: overrideValue,
            };
        }).filter(Boolean);
        console.log("[getInitialFormData] Mapped appliedDiscounts from 'all_applied_discounts_admin':", JSON.parse(JSON.stringify(mappedAppliedDiscounts)));
    } else if (sourceName.includes("fallback")) {
        // This handles 'applied_product_discounts' and 'active_applied_product_discounts' (which have nested discount_master object)
        mappedAppliedDiscounts = (appliedDiscountsSource || []).map(applied => {
            const master = applied.discount_master;

            let masterDetails = {};
            if (typeof master === 'object' && master !== null && master.id) {
                masterDetails = {
                    id: master.id,
                    code_name: master.code_name || 'N/A',
                    internal_description: master.internal_description || '',
                    public_display_name: master.public_display_name || '',
                    type: master.type,
                    default_value: master.default_value,
                };
            } else {
                console.warn("[getInitialFormData] Fallback discount item is missing valid discount_master object:", applied);
                return null;
            }

            let overrideValue = null;
            if (applied.discount_percentage_override !== null && applied.discount_percentage_override !== undefined) {
                overrideValue = parseFloat(applied.discount_percentage_override);
            } else if (masterDetails.type === 'percentage') {
                overrideValue = parseFloat(masterDetails.default_value);
            }

            return {
                id: applied.id || generateTempId('applied_disc_'),
                discount_master: masterDetails.id,
                codeName: masterDetails.code_name,
                description: masterDetails.internal_description || masterDetails.public_display_name || masterDetails.code_name || `Discount (${masterDetails.type})`,
                discount_master_type: masterDetails.type,
                discount_master_default_value: parseFloat(masterDetails.default_value),
                discount_percentage_override: overrideValue,
            };
        }).filter(Boolean);
        console.log(`[getInitialFormData] Mapped appliedDiscounts from fallback source '${sourceName}':`, JSON.parse(JSON.stringify(mappedAppliedDiscounts)));
    }


    return {
        ...defaults,
        // Step 1 Data
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

        // Step 2 Data
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

        // Step 3 Data
        productType: initialProductData.product_type || 'made_in_house',
        recipeComponents: (initialProductDataFromProp?.recipe_components || []).map((comp, index) => {
            let invItemId = null;
            let invItemName = '';

            if (comp && typeof comp === 'object') {
                if (comp.inventory_item) {
                    invItemId = String(comp.inventory_item);
                    if (comp.inventory_item_details && typeof comp.inventory_item_details.name === 'string') {
                        invItemName = comp.inventory_item_details.name;
                    } else {
                        const availableItemsList = (initialProductDataFromProp?.availableInventoryItemsForLookup ||
                            initialProductDataFromProp?.availableInventoryItems ||
                            []);
                        const foundItem = availableItemsList.find(item => String(item.id) === invItemId);
                        if (foundItem && typeof foundItem.name === 'string') {
                            invItemName = foundItem.name;
                        } else {
                            invItemName = invItemId ? `Item (ID: ${invItemId.substring(0, 8)}...)` : '';
                            if (invItemId) {
                                console.warn(
                                    `[getInitialFormData] Could not resolve name for inventory item ID ${invItemId}. ` +
                                    `'inventory_item_details.name' was missing in product data, and the item was not found ` +
                                    `in the provided 'availableInventoryItems' list. Using fallback name.`
                                );
                            }
                        }
                    }
                }
            } else {
                console.error('[getInitialFormData] Invalid recipe component structure:', comp);
                return {
                    id: generateTempId('invalid_comp_'),
                    inventoryItemId: null, inventoryItemName: '', quantity: '', unit: '', display_order: index,
                };
            }
            let quantityValue;
            if (comp.quantity !== null && comp.quantity !== undefined && String(comp.quantity).trim() !== '') {
                const numQuantity = Number(comp.quantity);
                quantityValue = isNaN(numQuantity) ? '' : numQuantity;
            } else {
                quantityValue = '';
            }
            return {
                id: comp.id || generateTempId('comp_'),
                inventoryItemId: invItemId, inventoryItemName: invItemName, quantity: quantityValue, unit: comp.unit || '',
                display_order: (comp.display_order !== null && comp.display_order !== undefined && Number.isInteger(Number(comp.display_order)) && Number(comp.display_order) >= 0)
                    ? Number(comp.display_order)
                    : index,
            };
        }),
        recipeYields: initialProductData.product_type === 'made_in_house'
            ? (initialProductData.recipe_yields != null ? Number(initialProductData.recipe_yields) : 1)
            : 1,

        // Step 4 Data
        laborAndOverheadCost: initialProductData.labor_overhead_cost != null ? parseFloat(initialProductData.labor_overhead_cost) : null,
        sellingPrice: initialProductData.selling_price_excl_tax != null ? parseFloat(initialProductData.selling_price_excl_tax) : null,
        taxRateId: initialProductData.tax_rate || null,

        // Step 5 Data
        appliedDiscounts: mappedAppliedDiscounts,

        additionalNotes: initialProductData.additional_notes || '',
        isTemplateCandidate: initialProductData.is_template_candidate || false,
        _prevStep: 0,
        navigationDirection: 1,
    };
};


export const useAddProductForm = ({ initialData: initialProductDataFromProp = null } = {}) => {
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState(() => {
        const data = getInitialFormData(initialProductDataFromProp, initialProductDataFromProp);
        return data;
    });

    const [errors, setErrors] = useState({});
    const [stepSaved, setStepSaved] = useState({});

    const isEditMode = useMemo(() => !!initialProductDataFromProp, [initialProductDataFromProp]);

    useEffect(() => {
        const newFormData = getInitialFormData(initialProductDataFromProp, initialProductDataFromProp);
        setFormData(newFormData);
        setCurrentStep(1);
        setErrors({});
        setStepSaved({});
    }, [initialProductDataFromProp]);


    const schemas = useMemo(() => [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema], []);


    const updateField = useCallback((field, value) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'productType') {
                if (value === 'resold_item') {
                    newState.recipeComponents = [];
                    newState.recipeYields = 1;
                    newState.estimatedCostFromIngredients = 0;
                } else if (value === 'made_in_house' && (newState.recipeYields == null || newState.recipeYields < 1)) {
                    newState.recipeYields = 1;
                }
            }
            return newState;
        });

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
        setStepSaved(prev => ({ ...prev, [currentStep]: false }));
    }, [currentStep]);

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

        const schemaFieldKeys = Object.keys(schema.fields);
        const dataToValidate = {};
        schemaFieldKeys.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(formData, key)) {
                dataToValidate[key] = formData[key];
            }
        });

        try {
            await schema.validate(dataToValidate, { abortEarly: false });
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
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
                    if (error.path) {
                        stepErrors[error.path] = error.message;
                    } else {
                        stepErrors[`step${stepNumberToValidate}_general_unknown_path`] = error.message;
                    }
                });
            } else {
                stepErrors[`step${stepNumberToValidate}_general`] = err.message || scriptLines.error_unknownValidation;
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

        const schemaFieldKeys = Object.keys(schema.fields);
        const dataToValidate = {};
        schemaFieldKeys.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(formData, key)) {
                dataToValidate[key] = formData[key];
            }
        });

        try {
            await schema.validate(dataToValidate, { abortEarly: true });
            return true;
        } catch {
            return false;
        }
    }, [formData, currentStep, schemas]);

    const resetForm = useCallback(() => {
        setFormData(getInitialFormData(initialProductDataFromProp, initialProductDataFromProp));
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
        schemas,
    };
};