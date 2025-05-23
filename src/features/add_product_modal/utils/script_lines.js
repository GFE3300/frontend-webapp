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
};

export default scriptLines;