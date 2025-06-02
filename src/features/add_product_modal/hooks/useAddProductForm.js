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
    // codeName, description, etc., are for UI logic based on selected discount_master, not direct user input validation here
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

    // console.log("[getInitialFormData] Mapping from initialProductData:", JSON.parse(JSON.stringify(initialProductData)));

    return {
        ...defaults,
        // Step 1 Data
        productName: initialProductData.name || '',
        subtitle: initialProductData.subtitle || '',
        description: initialProductData.description || '',
        category: initialProductData.category || '', // Expects category ID string (UUID)
        productAttributes: (initialProductData.product_tags_details || []).map(tag => ({
            id: tag.id, // UUID of ProductAttributeTag
            label: tag.name,
            iconName: tag.icon_name || null,
        })),
        productImage: initialProductData.image_url || null, // URL string or null

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

        // Step 4 Data
        recipeComponents: (initialProductDataFromProp?.recipe_components || []).map((comp, index) => {
            let invItemId = null; // Will store the UUID string of the InventoryItem
            let invItemName = ''; // For UI display in the RecipeComponentRow search input

            // Defensive check: Ensure 'comp' is a valid object
            if (comp && typeof comp === 'object') {
                if (comp.inventory_item) {
                    // Backend contract: comp.inventory_item is the UUID string (PK) of the InventoryItem.
                    // Ensure it's treated as a string, even if backend sends it as a number (unlikely for UUIDs).
                    invItemId = String(comp.inventory_item);

                    // Prioritize name from nested details (inventory_item_details)
                    if (comp.inventory_item_details && typeof comp.inventory_item_details.name === 'string') {
                        invItemName = comp.inventory_item_details.name;
                    } else {
                        // Fallback: If inventory_item_details.name is missing, try to find the name
                        // from a list of all available inventory items (if provided within initialProductDataFromProp).
                        // This is a secondary fallback; the primary source should be inventory_item_details.
                        const availableItemsList = (initialProductDataFromProp?.availableInventoryItemsForLookup ||
                            initialProductDataFromProp?.availableInventoryItems ||
                            []);
                        const foundItem = availableItemsList.find(item => String(item.id) === invItemId);

                        if (foundItem && typeof foundItem.name === 'string') {
                            invItemName = foundItem.name;
                        } else {
                            // If name is still not found, use a placeholder. This indicates a potential
                            // data consistency issue or that the inventory item is new/not fully detailed.
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
                // If comp.inventory_item is null or undefined, invItemId and invItemName remain as initialized (null, '').
                // This is fine for a recipe component row that doesn't have an ingredient selected yet.
            } else {
                // If 'comp' is not a valid object (e.g., null in the array), log an error and skip.
                console.error('[getInitialFormData] Invalid recipe component structure:', comp);
                // Return a minimal valid structure or filter this out later. For now, create a blank-ish entry.
                return {
                    id: generateTempId('invalid_comp_'),
                    inventoryItemId: null,
                    inventoryItemName: '',
                    quantity: '',
                    unit: '',
                    display_order: index,
                };
            }

            // Ensure 'quantity' is a number for the form state, or an empty string if not set/invalid.
            let quantityValue;
            if (comp.quantity !== null && comp.quantity !== undefined && String(comp.quantity).trim() !== '') {
                const numQuantity = Number(comp.quantity);
                // If parsing results in NaN (e.g., non-numeric string), set to empty string for the input field.
                // Otherwise, use the parsed number.
                quantityValue = isNaN(numQuantity) ? '' : numQuantity;
            } else {
                quantityValue = ''; // Default to empty string for the input if null, undefined, or whitespace.
            }

            return {
                // Retain existing RecipeComponent ID (from DB) if present, otherwise generate a temporary one for new/template rows.
                id: comp.id || generateTempId('comp_'),
                inventoryItemId: invItemId,     // This MUST be the UUID string of the InventoryItem or null.
                inventoryItemName: invItemName, // This is primarily for initializing the search input in RecipeComponentRow.
                quantity: quantityValue,
                unit: comp.unit || '',          // Default to empty string if not present.
                // Use display_order from data if valid, otherwise fallback to array index.
                // Ensure display_order is a non-negative integer.
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
        taxRateId: initialProductData.tax_rate || null, // Expects tax_rate ID string (UUID) or null

        // Step 5 Data
        // Backend ProductSerializer (GET /products/{id}/) for `applied_product_discounts`
        // should return an array where each item is:
        // {
        //   id: "ProductAppliedDiscount_UUID",
        //   discount_master: { id: "DiscountMaster_UUID", code_name: "...", internal_description: "...", type: "...", default_value: "..." },
        //   discount_percentage_override: "..." | null
        // }
        appliedDiscounts: (initialProductData.applied_product_discounts || []).map(applied => {
            if (!applied.discount_master || typeof applied.discount_master !== 'object' || !applied.discount_master.id) {
                console.warn("Applied discount in initialProductData is missing valid discount_master details:", applied);
                return null;
            }
            const master = applied.discount_master;
            return {
                id: applied.id || generateTempId('applied_disc_'), // ID of ProductAppliedDiscount instance
                discount_master: master.id, // UUID of the DiscountMaster
                codeName: master.code_name || 'N/A',
                description: master.internal_description || master.public_display_name || '',
                discount_master_type: master.type,
                discount_master_default_value: parseFloat(master.default_value),
                discount_percentage_override: applied.discount_percentage_override != null
                    ? parseFloat(applied.discount_percentage_override)
                    // If override is null AND type is percentage, then the effective value is master's default.
                    // The form field for override should reflect this or be clearable.
                    : (master.type === 'percentage' ? parseFloat(master.default_value) : null),
            };
        }).filter(Boolean),

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
                    // Ensure error.path is defined, which Yup should provide.
                    if (error.path) {
                        stepErrors[error.path] = error.message;
                    } else {
                        // Fallback for errors without a path, though unusual for Yup field errors.
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