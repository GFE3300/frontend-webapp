// frontend/src/features/add_product_modal/hooks/useAddProductForm.js
import { useState, useCallback, useMemo, useEffect } from 'react'; // Added useEffect
import * as yup from 'yup';

// ... (Keep all your existing schemas: step1Schema, optionSchema, etc.) ...
// --- STAGE 1: Basic Data ---
const step1Schema = yup.object().shape({
    productName: yup.string().required("Product name is required.").max(100, "Name too long (max 100 chars)."),
    subtitle: yup.string().max(150, "Subtitle too long (max 150 chars).").nullable(),
    description: yup.string().max(1000, "Description too long (max 1000 chars).").nullable(),
    category: yup.string().required("Category is required."), // Store category ID
    productAttributes: yup.array().of(
        yup.object().shape({ // This is the shape of how tags are STORED in formData
            id: yup.string().required(), // This is the tag's actual ID
            label: yup.string().required(), // This is the tag's name
            iconName: yup.string().nullable(),
        })
    ).max(10, "Maximum 10 tags allowed.").nullable(),
    productImage: yup.mixed().nullable(), // Can be File, URL string, or null
});

// --- STAGE 2: Editable Attributes ---
const optionSchema = yup.object().shape({
    id: yup.string().required(), // Can be temp client ID or backend UUID
    name: yup.string().required("Option name is required.").max(50, "Option name too long."),
    priceAdjustment: yup.number().typeError("Price adjustment must be a number.").default(0).nullable(),
    isDefault: yup.boolean().default(false),
    display_order: yup.number().integer().min(0).default(0).nullable(), // Added
});

const editableAttributeSchema = yup.object().shape({
    id: yup.string().required(), // Can be temp client ID or backend UUID
    name: yup.string().required("Attribute group name is required.").max(50, "Group name too long."),
    type: yup.string().oneOf(['single_select', 'multi_select']).required("Selection type is required."),
    isRequired: yup.boolean().default(false),
    options: yup.array().of(optionSchema).min(1, "At least one option is required for an attribute group.").max(20, "Max 20 options per group."),
    display_order: yup.number().integer().min(0).default(0).nullable(), // Added
});

const step2Schema = yup.object().shape({
    editableAttributes: yup.array().of(editableAttributeSchema).max(5, "Maximum 5 attribute groups allowed.").nullable(),
});

// --- STAGE 3: Ingredients ---
const recipeComponentSchema = yup.object().shape({
    id: yup.string().required(), // Can be temp client ID or backend UUID
    inventoryItemId: yup.string().required("Ingredient item is required."), // FK to InventoryItem
    inventoryItemName: yup.string().nullable(), // For display, convenience
    quantity: yup.number().typeError("Quantity must be a number.").required("Quantity is required.").min(0.000001, "Quantity must be positive."),
    unit: yup.string().required("Unit is required.").max(20, "Unit too long."),
    display_order: yup.number().integer().min(0).default(0).nullable(), // Added
});

const step3Schema = yup.object().shape({
    productType: yup.string().required("Product type is required.").oneOf(['made_in_house', 'resold_item']),
    recipeComponents: yup.array().when('productType', {
        is: 'made_in_house',
        then: (schema) => schema.of(recipeComponentSchema).min(1, "At least one ingredient is required for made-in-house products.").nullable(), // Allow nullable for initial state if user switches type
        otherwise: (schema) => schema.nullable().max(0, "Resold items cannot have ingredients."), // Ensure empty for resold
    }),
    recipeYields: yup.number().when('productType', {
        is: 'made_in_house',
        then: (schema) => schema.typeError("Yield must be a number.").required("Recipe yield is required.").integer("Yield must be a whole number.").min(1, "Yield must be at least 1."),
        otherwise: (schema) => schema.nullable().transform(value => (isNaN(value) ? 1 : value)).default(1), // Default to 1 for resold
    }),
});

// --- STAGE 4: Pricing ---
const step4Schema = yup.object().shape({
    laborAndOverheadCost: yup.number().typeError("Cost must be a number.").min(0, "Cost cannot be negative.").nullable().default(0),
    sellingPrice: yup.number().typeError("Price must be a number.").required("Selling price is required.").min(0, "Price cannot be negative."),
    taxRateId: yup.string().nullable(), // Store tax rate ID
});

// --- STAGE 5: Discounts & Extras ---
const appliedDiscountSchema = yup.object().shape({
    id: yup.string().required(), // UI temporary ID or backend ProductAppliedDiscount ID
    discount_master: yup.string().required("Master discount ID is required."), // FK to DiscountMaster
    codeName: yup.string().nullable(), // For display convenience
    description: yup.string().nullable(), // For display convenience
    discount_percentage_override: yup.number()
        .typeError("Override percentage must be a number.")
        .min(0, "Min 0%")
        .max(100, "Max 100%")
        .nullable(),
});

const step5Schema = yup.object().shape({
    appliedDiscounts: yup.array().of(appliedDiscountSchema).nullable(),
    additionalNotes: yup.string().max(500, "Notes too long (max 500 chars).").nullable(),
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

    if (!initialProductData || Object.keys(initialProductData).length === 0) { // Check if empty object too
        return defaults;
    }
    console.log("[getInitialFormData] Mapping from initialProductData:", initialProductData);

    return {
        ...defaults,
        productName: initialProductData.name || '',
        subtitle: initialProductData.subtitle || '',
        description: initialProductData.description || '',
        category: initialProductData.category || '', // This is category ID
        productAttributes: (initialProductData.product_tags_details || []).map(tag => ({
            id: tag.id,
            label: tag.name,
            iconName: tag.icon_name || null,
        })),
        productImage: initialProductData.image_url || null, // Store URL, file handled separately

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
            inventoryItemId: comp.inventory_item || '', // This is InventoryItem ID
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
        taxRateId: initialProductData.tax_rate || null, // This is TaxRate ID

        appliedDiscounts: (initialProductData.applied_product_discounts || []).map(ad => ({
            id: ad.id || generateTempId('applied_disc_'),
            discount_master: ad.discount_master, // This is DiscountMaster ID
            codeName: ad.discount_master_code_name || '',
            description: ad.discount_master_description || '', // Make sure your backend provides this if needed
            discount_percentage_override: ad.discount_percentage_override != null ? parseFloat(ad.discount_percentage_override) : null,
        })),
        additionalNotes: initialProductData.additional_notes || '',
        isTemplateCandidate: initialProductData.is_template_candidate || false,
        _prevStep: 0, // Reset navigation state
        navigationDirection: 1, // Reset navigation state
    };
};


export const useAddProductForm = ({ initialData: initialProductDataFromProp = null } = {}) => {
    const [currentStep, setCurrentStep] = useState(1);

    // Initialize formData using the helper, considering initialProductDataFromProp
    const [formData, setFormData] = useState(() => {
        // Initial call on hook mount
        console.log("[useAddProductForm useState Initializer] initialProductDataFromProp:", initialProductDataFromProp);
        const data = getInitialFormData(initialProductDataFromProp);
        console.log("[useAddProductForm useState Initializer] Initial formData:", data);
        return data;
    });

    const [errors, setErrors] = useState({});
    const [stepSaved, setStepSaved] = useState({});

    const isEditMode = useMemo(() => !!initialProductDataFromProp, [initialProductDataFromProp]);

    useEffect(() => {
        // This effect runs when initialProductDataFromProp changes AFTER the initial mount,
        // or if the hook re-renders and initialProductDataFromProp has a new reference (even if same content).
        console.log("[useAddProductForm Effect] Triggered. isEditMode:", isEditMode, "initialProductDataFromProp:", initialProductDataFromProp);
        const newFormData = getInitialFormData(initialProductDataFromProp);
        setFormData(newFormData);
        setCurrentStep(1); // Reset to first step
        setErrors({});
        setStepSaved({});
        console.log("[useAddProductForm Effect] Set formData to:", JSON.parse(JSON.stringify(newFormData)));
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
            Object.keys(newErrors).forEach(errKey => { // Clear nested errors like 'editableAttributes[0].name'
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
            } else if (value === 'made_in_house' && (!formData.recipeComponents || formData.recipeComponents.length === 0)) {
                // Optionally add a default empty ingredient if switching to made_in_house and no ingredients exist
                // setFormData(prev => ({ ...prev, recipeComponents: [{ id: generateTempId('comp_'), inventoryItemId: '', quantity: '', unit: '' }] }));
            }
        }
        setStepSaved(prev => ({ ...prev, [currentStep]: false }));
    }, [currentStep, formData.recipeComponents]); // Added formData.recipeComponents

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

        // Create a new object for validation, ensuring all defaults from schema are applied if fields are missing in formData
        // This is important because Yup might skip validation for undefined fields unless .defined() or .required() is used.
        // Or, ensure your initial formData has ALL possible keys from ALL schemas.
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
                    delete newErrors[key]; // Clear direct field errors
                    Object.keys(newErrors).forEach(errorKey => { // Clear nested errors like 'editableAttributes[0].name'
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
                stepErrors[`step${stepNumberToValidate}_general`] = err.message || "An unknown validation error occurred.";
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
        // Similar to validateStep, prepare data for validation
        const dataToValidate = { /* ... construct dataToValidate from formData like in validateStep ... */
            productName: formData.productName, subtitle: formData.subtitle, description: formData.description, category: formData.category, productAttributes: formData.productAttributes, productImage: formData.productImage,
            editableAttributes: formData.editableAttributes, productType: formData.productType, recipeComponents: formData.recipeComponents, recipeYields: formData.recipeYields,
            laborAndOverheadCost: formData.laborAndOverheadCost, sellingPrice: formData.sellingPrice, taxRateId: formData.taxRateId,
            appliedDiscounts: formData.appliedDiscounts, additionalNotes: formData.additionalNotes, isTemplateCandidate: formData.isTemplateCandidate,
        };
        try {
            await schema.validate(dataToValidate, { abortEarly: true }); // Abort early for quick check
            return true;
        } catch {
            return false;
        }
    }, [formData, currentStep, schemas]);

    const resetForm = useCallback(() => {
        console.log("[useAddProductForm resetForm] Resetting form. initialProductDataFromProp:", initialProductDataFromProp);
        setFormData(getInitialFormData(initialProductDataFromProp)); // Use prop here to reset to original edit data or defaults
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
        isEditMode, // Expose edit mode status
    };
};