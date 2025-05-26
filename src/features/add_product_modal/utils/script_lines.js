const scriptLines = {

    // General
    error_unknownValidation: "An unknown validation error occurred.",

    // Step 1: Basic Data
    error_productName_required: "Product name is required.",
    error_productName_maxLength: "Name too long (max 100 chars).",
    error_subtitle_maxLength: "Subtitle too long (max 150 chars).",
    error_description_maxLength: "Description too long (max 1000 chars).",
    error_category_required: "Category is required.",
    error_productAttributes_maxLength: "Maximum 10 tags allowed.",

    // Step 2: Editable Attributes
    // Option Schema
    error_optionName_required: "Option name is required.",
    error_optionName_maxLength: "Option name too long (max 50 chars).",
    error_priceAdjustment_type: "Price adjustment must be a number.",
    // Editable Attribute Schema
    error_attributeGroupName_required: "Attribute group name is required.",
    error_attributeGroupName_maxLength: "Group name too long (max 50 chars).",
    error_attributeType_required: "Selection type is required.",
    error_attributeOptions_minLength: "At least one option is required for an attribute group.",
    error_attributeOptions_maxLength: "Max 20 options per group.",
    // Step 2 Schema
    error_editableAttributes_maxLength: "Maximum 5 attribute groups allowed.",

    // Step 3: Ingredients
    // Recipe Component Schema
    error_recipeComponent_inventoryItem_required: "Ingredient item is required.",
    error_recipeComponent_quantity_type: "Quantity must be a number.",
    error_recipeComponent_quantity_required: "Quantity is required.",
    error_recipeComponent_quantity_min: "Quantity must be positive.",
    error_recipeComponent_unit_required: "Unit is required.",
    error_recipeComponent_unit_maxLength: "Unit too long (max 20 chars).",
    // Step 3 Schema
    error_productType_required: "Product type is required.",
    error_recipeComponents_minLength_madeInHouse: "At least one ingredient is required for made-in-house products.",
    error_recipeComponents_maxLength_resold: "Resold items cannot have ingredients.",
    error_recipeYields_type_madeInHouse: "Yield must be a number.",
    error_recipeYields_required_madeInHouse: "Recipe yield is required.",
    error_recipeYields_integer_madeInHouse: "Yield must be a whole number.",
    error_recipeYields_min_madeInHouse: "Yield must be at least 1.",

    // Step 4: Pricing
    error_laborCost_type: "Cost must be a number.",
    error_laborCost_min: "Cost cannot be negative.",
    error_sellingPrice_type: "Price must be a number.",
    error_sellingPrice_required: "Selling price is required.",
    error_sellingPrice_min: "Price cannot be negative.",

    // Step 5: Discounts & Extras
    // Applied Discount Schema
    error_appliedDiscount_masterId_required: "Master discount ID is required.",
    error_appliedDiscount_overridePercentage_type: "Override percentage must be a number.",
    error_appliedDiscount_overridePercentage_min: "Min 0%",
    error_appliedDiscount_overridePercentage_max: "Max 100%",
    // Step 5 Schema
    error_additionalNotes_maxLength: "Notes too long (max 500 chars).",

    productName: "Product Name", // Example from prompt, if it exists

    // --- CategoryDropdown ---
    categoryDropdownPlaceholder: "Select or create category",
    categoryDropdownErrorNameEmpty: "Category name cannot be empty.",
    categoryDropdownErrorNameExists: "A category with this name already exists.",
    categoryDropdownCreateNewActionLabel: "Create New Category...",
    categoryDropdownNewNamePlaceholder: "New category name",
    categoryDropdownColorLabel: "Category Color",
    categoryDropdownButtonCancel: "Cancel",
    categoryDropdownButtonCreate: "Create Category",

    // --- color names in defaultCategoryPaletteColors ---
    colorRose: "Rose",
    colorPink: "Pink",
    colorFuchsia: "Fuchsia",
    colorPurple: "Purple",
    colorViolet: "Violet",
    colorIndigo: "Indigo",
    colorBlue: "Blue",
    colorSky: "Sky",
    colorCyan: "Cyan",
    colorTeal: "Teal",
    colorEmerald: "Emerald",
    colorGreen: "Green",
    colorLime: "Lime",
    colorYellow: "Yellow",
    colorAmber: "Amber",
    colorOrange: "Orange",
    colorRed: "Red",
    colorNeutral: "Neutral",

    colorPalette: {
        /**
         * Prefix for the aria-label of each color button.
         * The full aria-label will be constructed as: "[selectColorPrefix] [colorName]".
         * Example: "Select color: Red"
         */
        selectColorPrefix: "Select color:",
    },

    // Common UI elements
    common_cancel: "Cancel",
    common_closeModal_ariaLabel: "Close modal",

    // CustomTagModal specific texts
    customTagModal_title: "Create Custom Tag",
    customTagModal_tagNameLabel: "Tag Name",
    customTagModal_tagNamePlaceholder: "e.g., Sugar Free, Staff Pick",
    customTagModal_error_nameEmpty: "Tag name cannot be empty.",
    customTagModal_error_nameExists: "A tag named \"{tagName}\" already exists.", // Note: {tagName} is a placeholder
    customTagModal_chooseIconLabel: "Choose an Icon (Optional)",
    customTagModal_createTagButton: "Create Tag",

    productIdentifiers_defaultLabel: "Product Attributes",
    productIdentifiers_addTagButton: "Add Tag",
    productIdentifiers_addTag_ariaLabel: "Add custom product attribute or tag",
    productIdentifiers_error_missingData: "Identifier data is missing or invalid.",
    productIdentifiers_error_invalidStructure: "Invalid identifier data structure.",
    productIdentifiers_error_missingSelectedData: "Selected identifiers data is missing or invalid.",
    productIdentifiers_error_missingToggleHandler: "Identifier toggle handler is missing.",
    productIdentifiers_error_missingCreateHandler: "Custom tag creation handler is missing.",
    productIdentifiers_emptyState: "No attributes defined yet. Click \"Add Tag\" to create one.",

    iconPickerErrorDataMissing: "Icon data is missing or invalid.",
    iconPickerErrorhandlerMissing: "Icon selection handler is missing.",
    iconPickerErrorInvalidStructure: "Invalid icon data structure.",
    iconPickerAriaLabel: "Select an icon",

    productImageUploaderDropzoneMessageDefault: "Tap or Drag Your Food Photo",
    productImageUploaderDropzoneSubMessagePattern: "PNG, JPG, WEBP up to {maxFileSizeMB}MB", // Pattern for variable

    // Error Messages
    productImageUploaderErrorFileTooLarge: "Photo is too large. Max {maxFileSizeMB}MB.", // Pattern
    productImageUploaderErrorInvalidFileType: "Invalid file type. Please use JPG, PNG, or WEBP.",
    productImageUploaderErrorFileNotAccepted: "Couldn't accept this file. Please try another.",
    productImageUploaderErrorReadingFile: "Error reading file. Please try again.",
    productImageUploaderErrorInvalidImageData: "Image data is invalid or image could not be loaded. Try a different one.",
    productImageUploaderErrorCouldNotSaveCrop: "Could not save crop. Please select a valid crop area or wait for image to load.",
    productImageUploaderErrorFailedToProcess: "Failed to process image. Please try again.",
    productImageUploaderErrorSavingGeneric: "An error occurred while saving: {errorMessage}", // Pattern
    productImageUploaderErrorSavingDefault: "Please try again.", // Fallback for the generic saving error's dynamic part
    productImageUploaderErrorCouldNotLoadProductImage: "Could not load product image.",
    productImageUploaderErrorCanvasToBlobFailed: "Image processing failed (Canvas to Blob).", // User-friendlier version if needed

    // UI Text (buttons, labels, alt text, status)
    productImageUploaderStatusPreparing: "Preparing photo...",
    productImageUploaderCropAreaAriaLabel: "Image crop area",
    productImageUploaderCropImageAlt: "Image to crop",
    productImageUploaderButtonConfirm: "Confirm",
    productImageUploaderButtonSaving: "Saving...",
    productImageUploaderButtonCancel: "Cancel",
    productImageUploaderFinalImageAlt: "Product",
    productImageUploaderButtonChange: "Change",
    productImageUploaderButtonRemove: "Remove",
    productImageUploaderDropzoneAriaLabel: "Image dropzone: Click or drag and drop an image",

    // Default placeholder text for the textarea
    placeholder: "Tell your customers about this product...",
    // Default label for accessibility (e.g., aria-label for the textarea)
    label: "Description",
    // Error message shown if the 'onSave' prop is missing
    errorMissingOnSave: "Error: Component misconfiguration. Cannot save input.",
    // Title attribute for the error state when 'onSave' is missing
    errorMissingOnSaveTitle: "Component Misconfigured: onSave handler missing",
    // Suffix for character count when limit is exceeded (e.g., "10 over")
    charCountOverLimitSuffix: "over",
    // Prefix for the aria-label of the display mode button (e.g., "Edit Description...")
    ariaEditLabelPrefix: "Edit",
    // Infix for the aria-label of the display mode button (e.g., "... Current value: ...")
    ariaEditLabelInfix: ". Current value:",
    // Text to use in aria-label when the current value is empty
    ariaEditLabelValueEmpty: "empty",

    // Default placeholder text for the input field
    placeholder2: "Enter Product Name",
    // Default accessible label for the input field
    label2: "Product Name",
    // Suffix for character count indicating remaining characters (singular form)
    charCountRemainingSingular: "character remaining",
    // Suffix for character count indicating remaining characters (plural form)
    charCountRemainingPlural: "characters remaining",
    // Prefix for the aria-label of the display mode button (e.g., "Edit Product Name...")
    ariaEditLabelPrefix2: "Edit",
    // Infix for the aria-label of the display mode button (e.g., "... Current value: ...")
    ariaEditLabelInfix2: ". Current value:",
    // Warning message logged to console if selection range cannot be set
    warnCannotSetSelection: "Could not set selection range on input: ",

    // AttributeGroupBuilder specific texts
    attributeGroup_error_invalidGroupData: "Error: Invalid attribute group data.",
    attributeGroup_error_missingGroupIndex: "Error: Missing group index.",
    attributeGroup_error_missingHandler: "Error: Missing critical handler: {handlerName}.", // Placeholder for handlerName

    attributeGroup_groupNameLabel: "Attribute Group Name",
    attributeGroup_groupNamePlaceholder: "e.g., Size, Milk Options",
    attributeGroup_groupName_ariaLabel: "Name for attribute group {groupNumber}", // Placeholder
    attributeGroup_groupName_srLabel: "Attribute Group: {groupNameOrNumber}", // Placeholder

    attributeGroup_typeLabel: "Attribute Type",
    attributeGroup_type_singleSelectLabel: "Single Select (e.g., Radio buttons)",
    attributeGroup_type_multiSelectLabel: "Multi-Select (e.g., Checkboxes)",
    attributeGroup_type_ariaLabel: "Type for attribute group {groupNumber}", // Placeholder

    attributeGroup_requiredLabel: "Required",
    attributeGroup_required_ariaLabel: "Is attribute group {groupNumber} required", // Placeholder

    attributeGroup_removeGroupButton_ariaLabel: "Remove attribute group {groupNameOrNumber}", // Placeholder
    attributeGroup_removeGroupButton_mobileText: "Remove Group",

    attributeGroup_optionsForGroupTitle: "Options for \"{groupName}\"", // Placeholder
    attributeGroup_optionsForThisGroupTitle: "Options for this group", // Fallback

    attributeGroup_addOptionButton: "Add Option",

    // Currency symbols (example, can be expanded)
    currencySymbol_USD: "$",
    currencySymbol_EUR: "€",

    // CreateNewIngredientModal specific texts
    createNewIngredientModal_title: "Create New Inventory Item",
    createNewIngredientModal_close_ariaLabel: "Close modal", // Re-using common_closeModal_ariaLabel is also an option if it's identical

    createNewIngredientModal_itemNameLabel: "Inventory Item Name",
    createNewIngredientModal_itemNamePlaceholder: "e.g., Organic Almond Flour, Whole Milk",

    createNewIngredientModal_measurementTypeLabel: "Primary Measurement Type",
    createNewIngredientModal_measurementTypePlaceholder: "Select type...",
    createNewIngredientModal_measurementType_mass: "Mass (e.g., g, kg, oz, lb)",
    createNewIngredientModal_measurementType_volume: "Volume (e.g., ml, L, tsp, cup)",
    createNewIngredientModal_measurementType_pieces: "Pieces (e.g., pcs, unit, slice)",

    createNewIngredientModal_defaultUnitLabel: "Default Unit (for this item)",
    createNewIngredientModal_defaultUnitPlaceholder: "Select unit...",

    createNewIngredientModal_costPerBaseUnitLabel: "Cost per {baseUnit}", // Placeholder for baseUnit
    createNewIngredientModal_costPerBaseUnitPlaceholder_USD: "e.g., 0.02 (for USD)", // Example, could be generic or currency specific
    createNewIngredientModal_costPerBaseUnitPlaceholder_EUR: "e.g., 0.02 (for EUR)",
    createNewIngredientModal_costPerBaseUnitHelpText: "Enter the cost for one base unit ({baseUnit}) of this item.", // Placeholder for baseUnit

    createNewIngredientModal_error_nameRequired: "Ingredient name is required.",
    createNewIngredientModal_error_nameExists: "An ingredient with this name already exists.",
    createNewIngredientModal_error_measurementTypeRequired: "Primary measurement type is required.",
    createNewIngredientModal_error_defaultUnitRequired: "Default unit for this item is required.",
    createNewIngredientModal_error_costRequired: "Valid cost (e.g., 0.05 or 0) is required.",
    createNewIngredientModal_error_creationFailed: "Failed to create ingredient. Please try again.",

    createNewIngredientModal_button_cancel: "Cancel", // Re-using common_cancel is an option
    createNewIngredientModal_button_createItem: "Create Item",
    createNewIngredientModal_button_creating: "Creating...",

    // General Modal Errors (if not already present)
    modalError_criticalHandlersMissing: "Modal Error: Critical handlers missing.",
    modalError_inventoryDataMissing: "Modal Error: Inventory data missing.",

    // --- New keys for RecipeBuilder ---
    recipeBuilderTitle: "Recipe Ingredients",
    recipeBuilderSubtitle: "Define ingredients for one batch. Drag to reorder.",
    recipeBuilderEstCostPrefix: "Est. Recipe Cost:",
    recipeBuilderEmptyTitle: "Recipe is Empty",
    recipeBuilderEmptySubtitle: "Add ingredients to build your product's recipe.",
    recipeBuilderAddFirstButton: "Add First Ingredient",
    recipeBuilderAddAnotherButton: "Add Another Ingredient",
    recipeBuilderErrorMisconfigured: "Error: Recipe Builder is misconfigured. Please check console for details.",

    recipeComponentRow: {
        // Unit options
        unitSelectIngredientFirst: "Select ingredient first",

        // Console messages (placeholders like {itemName} will be replaced in code)
        warnCostCalculation: "RecipeComponentRow Cost calc issue for {itemName}: QIB {quantityInBaseUnit}, Cost unit {costUnit}, Expected base unit {expectedBaseUnit}",
        errorInvalidNewItem: "RecipeComponentRow: newItemFromBackend received from creation modal is invalid.",
        devErrorInvalidComponentProp: "RecipeComponentRow Dev Error: Invalid `component` prop.",
        devErrorInvalidIndexProp: "RecipeComponentRow Dev Error: `index` prop is required and must be a number.",

        // Ingredient Search InputField
        ingredientLabel: "Ingredient",
        ingredientPlaceholder: "Search or create ingredient...",
        ingredientSrLabelPrefix: "Recipe Ingredient:", // for sr-only label
        ingredientSrLabelItemInfix: "Item",        // for sr-only label, e.g., "Item 1"

        // Suggestions List
        suggestionCreateNewPrefix: "Create new:",
        suggestionNoMatch: "No matching ingredients found.",
        suggestionNoIngredients: "No ingredients available. Start typing to create one.",
        suggestionExactMatch: "Exact match selected.",

        // Quantity InputField
        quantityLabel: "Quantity",
        quantityPlaceholder: "e.g., 100",
        quantityAriaLabelPrefix: "Quantity for",

        // Unit Dropdown
        unitLabel: "Unit",
        unitSelectPlaceholder: "Select...",
        unitAriaLabelPrefix: "Unit for",

        // Estimated Cost
        estimatedCostLabel: "Est. Cost",
        estimatedCostNA: "N/A",

        // Remove Button
        removeButtonAriaLabelPrefix: "Remove ingredient",
        removeButtonTextSmallScreen: "Remove Ingredient"
    },

    // AppliedDiscountRow specific texts
    appliedDiscountRow_defaultDescription: "General discount code",
    appliedDiscountRow_percentageLabel: "Discount Percentage",
    appliedDiscountRow_percentagePlaceholder: "e.g., 10",
    appliedDiscountRow_remove_ariaLabel: "Remove discount {discountName}", // Placeholder for discountName
    appliedDiscountRow_remove_title: "Remove {discountName}", // Placeholder for discountName

    appliedDiscountsManagerNoDiscountsPrimary: "No discounts applied to this product yet.",
    appliedDiscountsManagerNoDiscountsSecondary: "Select a code above or create a new one.",
    appliedDiscountsManagerListHeaderPattern: "Applied Discounts ({count}):", // Pattern for count}


    createDiscountCodeModal: {
        // Modal Title
        title: "Create New Master Discount",
        // Close Button
        closeButtonLabel: "Close create discount modal",
        closeButtonTitle: "Close",

        // InputField Labels
        codeNameLabel: "Discount Code Name",
        descriptionLabel: "Internal Description",
        discountTypeLabel: "Discount Type (for this master code)",
        discountValueLabelPercentage: "Default Discount Percentage",
        discountValueLabelAmount: "Default Discount Amount", // For fixed amount type

        // InputField Placeholders
        codeNamePlaceholder: "e.g., SUMMER2024",
        descriptionPlaceholder: "e.g., Summer campaign 2024, all products",

        // InputField Help Texts
        codeNameHelpText: "Unique code, {minLength}-{maxLength} chars. Customers will use this.", // Placeholders {minLength} and {maxLength}
        descriptionHelpText: "For your reference, not shown to customers.",
        discountTypeHelpText: "Determines how the discount value is interpreted.",
        discountValueHelpTextPercentage: "General percentage for this code. Can be fine-tuned per product.",
        discountValueHelpTextAmount: "General fixed amount for this code.", // For fixed amount type

        // Dropdown Options (Labels for default types)
        discountTypePercentageLabel: "Percentage Off (%)",
        // Add other types if needed, e.g.:
        // discountTypeFixedAmountProductLabel: "Fixed Amount Off Product ({currencySymbol})", // Placeholder {currencySymbol}

        // Validation Error Messages
        errorRequired: "{fieldName} is required.", // Generic required, {fieldName} can be replaced
        errorCodeNameMinLength: "Code must be at least {minLength} characters.",
        errorCodeNameMaxLength: "Code must be at most {maxLength} characters.",
        errorCodeNameExists: "This discount code name already exists.",
        errorDescriptionMaxLength: "Description must be at most {maxLength} characters.",
        errorDiscountValueRequired: "A valid discount value is required.",
        errorDiscountValuePositive: "Discount value must be positive.",
        errorDiscountPercentageMax: "Percentage cannot exceed 100.",
        errorFormGeneric: "An unexpected error occurred. Please try again.", // Generic error on submission failure

        // Button Texts
        cancelButtonText: "Cancel",
        createButtonText: "Create Discount",
        creatingButtonText: "Creating...", // With loading spinner

        // Console Messages
        errorConsoleFailedCreate: "Failed to create discount:"
    },

    // DiscountCodeSelector specific texts
    discountCodeSelector_label: "Add Discount Code to this Product",
    discountCodeSelector_placeholder: "Search existing codes or create new...",
    discountCodeSelector_noMatch: "No matching codes found.",
    discountCodeSelector_createNew: "Create New Discount Code",


    // --- New keys for Step1_BasicData ---
    step1SubtitlePlaceholder: "e.g., Freshly baked daily with organic ingredients",
    step1SubtitleLabel: "Product Subtitle", // Used as aria-label for ProductDescriptionInput
    step1CategoryPlaceholder: "Select or create category", // Placeholder for CategoryDropdown (can override CategoryDropdown's default if desired here)
    step1TagsLabel: "Product Tags/Attributes", // Label for ProductIdentifiers
    step1ImageErrorDefault: "Invalid image", // Default error message for image if not a string

    step2EditableAttributes: {
        // Section Title
        sectionTitle: "Product Customizations",

        // Add Group Button
        addButtonText: "Add Attribute Group",

        // Informational Text
        infoText: "Define options your customers can choose, like size, flavor, or add-ons. These can optionally adjust the price.",

        // Empty State
        emptyStateTitle: "No Customizations Yet",
        emptyStateDescription: "Click \"Add Attribute Group\" to let customers personalize this product."
    },

    // Step3_Ingredients specific texts
    step3_loadingInventory: "Loading inventory items...",
    step3_errorLoadingInventory: "Error loading inventory: {errorMessage}", // Placeholder
    step3_title: "Product Sourcing & Recipe",
    step3_subtitle: "Specify if this product is made in-house or resold. This affects cost calculation.",
    step3_productTypeLabel: "Product Type*",
    step3_productType_madeInHouse: "Made In-House (Uses Recipe)",
    step3_productType_resoldItem: "Resold Item (Direct Stock)",
    step3_recipeYieldsLabel: "Recipe Yields (Units of this product)",
    step3_recipeYieldsPlaceholder: "e.g., 1",
    step3_recipeYieldsHelpText: "How many units of this product does this recipe make?",
    step3_resoldItemInfo: "For resold items, stock is managed directly. The \"Cost to Make\" in the next step will be your purchase price.",
    step3_error_failedToCreateIngredient: "Failed to create ingredient. Please try again.", // General fallback


    // --- New keys for Step4_Pricing ---
    step4LoadingTaxRates: "Loading tax rates...",
    step4ErrorLoadingTaxRatesPattern: "Error loading tax rates: {errorMessage}",
    step4MainTitle: "Pricing Configuration",
    step4MainSubtitle: "Set your product's price, considering costs and desired profit margin.",

    step4CostBreakdownTitle: "Cost Breakdown",
    step4EstCostIngredientsLabel: "Estimated Cost from Ingredients:",
    step4LaborOverheadLabelPattern: "Labor, Packaging & Overheads ({currencySymbol})",
    step4PurchaseCostLabelPattern: "Purchase Cost ({currencySymbol})",
    step4LaborOverheadHelpText: "Additional costs beyond raw ingredients.",
    step4PurchaseCostHelpText: "Your cost to acquire this resold item.",
    step4TotalCalculatedCostLabel: "Total Calculated Cost:",

    step4SellingPriceProfitTitle: "Selling Price & Profit",
    step4SellingPriceLabelPattern: "Your Selling Price ({currencySymbol}) (Excluding Tax)",
    step4WarningPriceBelowCost: "Selling price is below the total calculated cost. This will result in a loss.",
    step4CalcProfitMarginLabel: "Calculated Profit Margin:",
    step4NotApplicable: "N/A",
    step4ProfitPerUnitLabelPattern: "Profit per unit (before tax): {currencySymbol}{profitAmount}",

    step4TaxationTitle: "Taxation",
    step4TaxRateLabel: "Tax Rate (Applied to Selling Price)",
    step4TaxRateNoTaxOption: "No Tax / Tax Included",
    step4TaxAmountLabelPattern: "Tax Amount ({taxRate}%):",
    step4FinalPriceLabel: "Final Selling Price (Incl. Tax):",

    step4SaveAsTemplateLabel: "Use this product as a template for future creations",
    step4SaveAsTemplateHelpText: "If checked, this product's details will pre-fill the form next time you add a new product. Only one product can be the active template per business.",

    step5DiscountsExtras: {
        // Loading/Error states for master codes
        loadingMasterCodes: "Loading discount codes...",
        errorLoadingMasterCodesPrefix: "Error loading discount codes:", // Suffix will be error.message

        // Section Titles and Descriptions
        mainTitle: "Discounts & Extras",
        mainDescription: "Apply discounts or add internal notes for this product.",
        productSpecificDiscountsTitle: "Product-Specific Discounts",
        additionalNotesTitle: "Additional Notes (Optional)",

        // InputField for Additional Notes
        additionalNotesLabel: "Internal Notes or Extra Info",
        additionalNotesPlaceholder: "e.g., Special handling, allergen info not covered by tags, display notes...",

        // Console Warnings/Errors
        warnDiscountAlreadyApplied: "Discount code already applied to this product.",
        errorMissingBusinessId: "Step5: Active business ID is missing. Cannot create discount code.",
        errorBusinessContextMissing: "Your business context is missing. Please try again or contact support.", // For UI if thrown
        errorFailedCreateMasterCode: "Step5: Failed to create master discount code:",
    },


    // AddProductModal specific texts
    addProductModal_noTemplateFound: "No product template found (404). Resetting form.",
    addProductModal_errorFetchingTemplate: "Error fetching product template:",
    addProductModal_error_activeBusinessMissing: "Active business context missing.",
    addProductModal_error_failedToCreateCategory: "Failed to create category.",
    addProductModal_error_categoryCreationFailed: "Category creation failed: {errorMessage}", // Placeholder
    addProductModal_error_failedToCreateTag: "Failed to create tag.",
    addProductModal_error_tagCreationFailed: "Tag creation failed: {errorMessage}", // Placeholder

    addProductModal_toast_imageUploaded: "Image uploaded successfully.",
    addProductModal_toast_imageUploadFailed: "Product data saved, but image upload failed: {errorMessage}", // Placeholder
    addProductModal_toast_imageRemoved: "Image removed.",
    addProductModal_toast_imageRemoveFailed: "Product data saved, but image removal failed: {errorMessage}", // Placeholder
    addProductModal_toast_productUpdated: "Product updated successfully!",
    addProductModal_toast_productAdded: "Product added successfully!",
    addProductModal_error_failedToUpdateProduct: "Failed to update product.",
    addProductModal_error_failedToAddProduct: "Failed to add product.",

    addProductModal_loading_productSetup: "Loading product setup...",
    addProductModal_loading_initialDataError: "Error loading initial data: {errorMessage}", // Placeholder
    addProductModal_loading_initialDataError_fallback: "Please try again.",

    addProductModal_header_placeholderEdit: "Edit Product Name...",
    addProductModal_header_placeholderNew: "Enter Product Name...",

    addProductModal_loading_preparingForm: "Preparing product form...",
    addProductModal_loading_fetchingSettings: "Fetching latest settings and templates.",
    addProductModal_error_couldNotLoadData: "Could not load essential data.",
    addProductModal_error_tryClosingModal: "Please try closing and reopening the modal.",
    addProductModal_button_close: "Close", // Re-use common_cancel if applicable and same text

    addProductModal_error_invalidStep: "Error: Invalid step.",

    // Might need a generic API error parsing fallback if not already covered
    addProductModal_error_apiErrorDefault: "An API error occurred.", // Example


    // --- New keys for ModalFooter ---
    modalFooterBackButton: "Back",
    modalFooterContinueButton: "Continue",
    modalFooterValidatingButton: "Validating...",
    modalFooterCreatingButton: "Creating...",
    modalFooterCreateProductButton: "Create Product",

    modalHeader: {
        // ProductTitleInput placeholders
        titlePlaceholderDefault: "Product Name",
        titlePlaceholderEditMode: "Edit Product Name...",

        // ProductTitleInput labels
        labelDefault: "Product Name",
        labelEditModePrefix: "Editing:",
        labelEditModeFallbackProduct: "Product", // Used if productName is empty in edit mode, e.g., "Editing: Product"

        // Close button aria-label
        closeButtonAriaLabel: "Close modal"
    },


    // ModalStepIndicator specific texts
    modalStepIndicator_nav_ariaLabel: "Product creation steps",
    // Step Names (used in STEPS_CONFIG and aria-labels)
    modalStepIndicator_step_basics: "Basics",
    modalStepIndicator_step_attributes: "Attributes",
    modalStepIndicator_step_ingredients: "Ingredients",
    modalStepIndicator_step_pricing: "Pricing",
    modalStepIndicator_step_discounts: "Discounts",
    // Aria-labels for buttons
    modalStepIndicator_aria_currentStep: "{stepName}, current step", // Placeholder for stepName
    modalStepIndicator_aria_goToStep: "Go to {stepName}", // Placeholder for stepName
    // Note: The plain step name is used as a fallback aria-label for pending steps.
    
    // --- Updated/New keys for ProductFormStep (flattened from previous internal structure) ---
    productFormStepButtonBack: "Back",
    productFormStepButtonContinue: "Continue",
    productFormStepButtonSubmitProduct: "Create Product",
    productFormStepButtonSubmitting: "Creating...", // Used when creating a new product
    productFormStepButtonValidating: "Validating...",
    productFormStepButtonSaving: "Saving...", // Used when isEditMode is true and submitting
    productFormStepButtonSaveChanges: "Save Changes", // Used when isEditMode is true, not submitting

    
    productFormStepErrorSummaryTitle: "Please correct the following to continue:",
    productFormStepErrorSummaryMore: "and {count} more...",
};

export default scriptLines;