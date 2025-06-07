import i18n from 'i18next';

export const scriptLines = {
    addProductModal_error_activeBusinessMissing: i18n.t('add_product_modal.addProductModal_error_activeBusinessMissing'), // "Active business context missing."
    categoryDropdown_categoryCreatedSuccess: i18n.t('add_product_modal.categoryDropdown_categoryCreatedSuccess'), // "Category created successfully!"
    customTagModal_tagCreatedSuccess: i18n.t('add_product_modal.customTagModal_tagCreatedSuccess'), // "Tag created successfully!"
    error_unknownValidation: i18n.t('add_product_modal.error_unknownValidation'), // "An unknown validation error occurred."
    error_productName_required: i18n.t('add_product_modal.error_productName_required'), // "Product name is required."
    error_productName_maxLength: i18n.t('add_product_modal.error_productName_maxLength'), // "Name too long (max 100 chars)."
    error_subtitle_maxLength: i18n.t('add_product_modal.error_subtitle_maxLength'), // "Subtitle too long (max 150 chars)."
    error_description_maxLength: i18n.t('add_product_modal.error_description_maxLength'), // "Description too long (max 1000 chars)."
    error_category_required: i18n.t('add_product_modal.error_category_required'), // "Category is required."
    error_productAttributes_maxLength: i18n.t('add_product_modal.error_productAttributes_maxLength'), // "Maximum 10 tags allowed."
    // Option Schema
    error_optionName_required: i18n.t('add_product_modal.error_optionName_required'), // "Option name is required."
    error_optionName_maxLength: i18n.t('add_product_modal.error_optionName_maxLength'), // "Option name too long (max 50 chars)."
    error_priceAdjustment_type: i18n.t('add_product_modal.error_priceAdjustment_type'), // "Price adjustment must be a number."
    error_attributeGroupName_required: i18n.t('add_product_modal.error_attributeGroupName_required'), // "Attribute group name is required."
    error_attributeGroupName_maxLength: i18n.t('add_product_modal.error_attributeGroupName_maxLength'), // "Group name too long (max 50 chars)."
    error_attributeType_required: i18n.t('add_product_modal.error_attributeType_required'), // "Selection type is required."
    error_attributeOptions_minLength: i18n.t('add_product_modal.error_attributeOptions_minLength'), // "At least one option is required for an attribute group."
    error_attributeOptions_maxLength: i18n.t('add_product_modal.error_attributeOptions_maxLength'), // "Max 20 options per group."
    error_editableAttributes_maxLength: i18n.t('add_product_modal.error_editableAttributes_maxLength'), // "Maximum 5 attribute groups allowed."
    // Recipe Component Schema
    error_recipeComponent_inventoryItem_required: i18n.t('add_product_modal.error_recipeComponent_inventoryItem_required'), // "Ingredient item is required."
    error_recipeComponent_quantity_type: i18n.t('add_product_modal.error_recipeComponent_quantity_type'), // "Quantity must be a number."
    error_recipeComponent_quantity_required: i18n.t('add_product_modal.error_recipeComponent_quantity_required'), // "Quantity is required."
    error_recipeComponent_quantity_min: i18n.t('add_product_modal.error_recipeComponent_quantity_min'), // "Quantity must be positive."
    error_recipeComponent_unit_required: i18n.t('add_product_modal.error_recipeComponent_unit_required'), // "Unit is required."
    error_recipeComponent_unit_maxLength: i18n.t('add_product_modal.error_recipeComponent_unit_maxLength'), // "Unit too long (max 20 chars)."
    error_productType_required: i18n.t('add_product_modal.error_productType_required'), // "Product type is required."
    error_recipeComponents_minLength_madeInHouse: i18n.t('add_product_modal.error_recipeComponents_minLength_madeInHouse'), // "At least one ingredient is required for made-in-house products."
    error_recipeComponents_maxLength_resold: i18n.t('add_product_modal.error_recipeComponents_maxLength_resold'), // "Resold items cannot have ingredients."
    error_recipeYields_type_madeInHouse: i18n.t('add_product_modal.error_recipeYields_type_madeInHouse'), // "Yield must be a number."
    error_recipeYields_required_madeInHouse: i18n.t('add_product_modal.error_recipeYields_required_madeInHouse'), // "Recipe yield is required."
    error_recipeYields_integer_madeInHouse: i18n.t('add_product_modal.error_recipeYields_integer_madeInHouse'), // "Yield must be a whole number."
    error_recipeYields_min_madeInHouse: i18n.t('add_product_modal.error_recipeYields_min_madeInHouse'), // "Yield must be at least 1."
    error_laborCost_type: i18n.t('add_product_modal.error_laborCost_type'), // "Cost must be a number."
    error_laborCost_min: i18n.t('add_product_modal.error_laborCost_min'), // "Cost cannot be negative."
    error_sellingPrice_type: i18n.t('add_product_modal.error_sellingPrice_type'), // "Price must be a number."
    error_sellingPrice_required: i18n.t('add_product_modal.error_sellingPrice_required'), // "Selling price is required."
    error_sellingPrice_min: i18n.t('add_product_modal.error_sellingPrice_min'), // "Price cannot be negative."
    // Applied Discount Schema
    error_appliedDiscount_masterId_required: i18n.t('add_product_modal.error_appliedDiscount_masterId_required'), // "Master discount ID is required."
    error_appliedDiscount_overridePercentage_type: i18n.t('add_product_modal.error_appliedDiscount_overridePercentage_type'), // "Override percentage must be a number."
    error_appliedDiscount_overridePercentage_min: i18n.t('add_product_modal.error_appliedDiscount_overridePercentage_min'), // "Min 0%"
    error_appliedDiscount_overridePercentage_max: i18n.t('add_product_modal.error_appliedDiscount_overridePercentage_max'), // "Max 100%"
    error_additionalNotes_maxLength: i18n.t('add_product_modal.error_additionalNotes_maxLength'), // "Notes too long (max 500 chars)."

    productName: i18n.t('add_product_modal.productName'), // "Product Name"

    // --- CategoryDropdown ---
    categoryDropdownPlaceholder: i18n.t('add_product_modal.categoryDropdownPlaceholder'), // "Select or create category"
    categoryDropdownErrorNameEmpty: i18n.t('add_product_modal.categoryDropdownErrorNameEmpty'), // "Category name cannot be empty."
    categoryDropdownErrorNameExists: i18n.t('add_product_modal.categoryDropdownErrorNameExists'), // "A category with this name already exists."
    categoryDropdownCreateNewActionLabel: i18n.t('add_product_modal.categoryDropdownCreateNewActionLabel'), // "Create New Category..."
    categoryDropdownNewNamePlaceholder: i18n.t('add_product_modal.categoryDropdownNewNamePlaceholder'), // "New category name"
    categoryDropdownColorLabel: i18n.t('add_product_modal.categoryDropdownColorLabel'), // "Category Color"
    categoryDropdownButtonCancel: i18n.t('venue_management.cancel'), // "Cancel"
    categoryDropdownButtonCreate: i18n.t('add_product_modal.categoryDropdownButtonCreate'), // "Create Category"
    colorRose: i18n.t('add_product_modal.colorRose'), // "Rose"
    colorPink: i18n.t('add_product_modal.colorPink'), // "Pink"
    colorFuchsia: i18n.t('add_product_modal.colorFuchsia'), // "Fuchsia"
    colorPurple: i18n.t('add_product_modal.colorPurple'), // "Purple"
    colorViolet: i18n.t('add_product_modal.colorViolet'), // "Violet"
    colorIndigo: i18n.t('add_product_modal.colorIndigo'), // "Indigo"
    colorBlue: i18n.t('add_product_modal.colorBlue'), // "Blue"
    colorSky: i18n.t('add_product_modal.colorSky'), // "Sky"
    colorCyan: i18n.t('add_product_modal.colorCyan'), // "Cyan"
    colorTeal: i18n.t('add_product_modal.colorTeal'), // "Teal"
    colorEmerald: i18n.t('add_product_modal.colorEmerald'), // "Emerald"
    colorGreen: i18n.t('add_product_modal.colorGreen'), // "Green"
    colorLime: i18n.t('add_product_modal.colorLime'), // "Lime"
    colorYellow: i18n.t('add_product_modal.colorYellow'), // "Yellow"
    colorAmber: i18n.t('add_product_modal.colorAmber'), // "Amber"
    colorOrange: i18n.t('add_product_modal.colorOrange'), // "Orange"
    colorRed: i18n.t('add_product_modal.colorRed'), // "Red"
    colorNeutral: i18n.t('add_product_modal.colorNeutral'), // "Neutral"

    colorPalette: {
        /**
         * Prefix for the aria-label of each color button.
         * The full aria-label will be constructed as: "[selectColorPrefix] [colorName]".
         * Example: "Select color: Red"
         */
        selectColorPrefix: i18n.t('add_product_modal.colorPalette.selectColorPrefix'), // "Select color:"
    },

    // Common UI elements
    common_cancel: i18n.t('venue_management.cancel'), // "Cancel"
    common_closeModal_ariaLabel: i18n.t('add_product_modal.common_closeModal_ariaLabel'), // "Close modal"
    customTagModal_title: i18n.t('add_product_modal.customTagModal_title'), // "Create Custom Tag"
    customTagModal_tagNameLabel: i18n.t('add_product_modal.customTagModal_tagNameLabel'), // "Tag Name"
    customTagModal_tagNamePlaceholder: i18n.t('add_product_modal.customTagModal_tagNamePlaceholder'), // "e.g., Sugar Free, Staff Pick"
    customTagModal_error_nameEmpty: i18n.t('add_product_modal.customTagModal_error_nameEmpty'), // "Tag name cannot be empty."
    customTagModal_error_nameExists: i18n.t('add_product_modal.customTagModal_error_nameExists'), // "A tag named \"{tagName}\" already exists."
    customTagModal_chooseIconLabel: i18n.t('add_product_modal.customTagModal_chooseIconLabel'), // "Choose an Icon (Optional)"
    customTagModal_createTagButton: i18n.t('add_product_modal.customTagModal_createTagButton'), // "Create Tag"

    productIdentifiers_defaultLabel: i18n.t('add_product_modal.productIdentifiers_defaultLabel'), // "Product Attributes"
    productIdentifiers_addTagButton: i18n.t('add_product_modal.productIdentifiers_addTagButton'), // "Add Tag"
    productIdentifiers_addTag_ariaLabel: i18n.t('add_product_modal.productIdentifiers_addTag_ariaLabel'), // "Add custom product attribute or tag"
    productIdentifiers_error_missingData: i18n.t('add_product_modal.productIdentifiers_error_missingData'), // "Identifier data is missing or invalid."
    productIdentifiers_error_invalidStructure: i18n.t('add_product_modal.productIdentifiers_error_invalidStructure'), // "Invalid identifier data structure."
    productIdentifiers_error_missingSelectedData: i18n.t('add_product_modal.productIdentifiers_error_missingSelectedData'), // "Selected identifiers data is missing or invalid."
    productIdentifiers_error_missingToggleHandler: i18n.t('add_product_modal.productIdentifiers_error_missingToggleHandler'), // "Identifier toggle handler is missing."
    productIdentifiers_error_missingCreateHandler: i18n.t('add_product_modal.productIdentifiers_error_missingCreateHandler'), // "Custom tag creation handler is missing."
    productIdentifiers_emptyState: i18n.t('add_product_modal.productIdentifiers_emptyState'), // "No attributes defined yet. Click \"Add Tag\" to create one."

    iconPickerErrorDataMissing: i18n.t('add_product_modal.iconPickerErrorDataMissing'), // "Icon data is missing or invalid."
    iconPickerErrorhandlerMissing: i18n.t('add_product_modal.iconPickerErrorhandlerMissing'), // "Icon selection handler is missing."
    iconPickerErrorInvalidStructure: i18n.t('add_product_modal.iconPickerErrorInvalidStructure'), // "Invalid icon data structure."
    iconPickerAriaLabel: i18n.t('add_product_modal.iconPickerAriaLabel'), // "Select an icon"

    productImageUploaderDropzoneMessageDefault: i18n.t('add_product_modal.productImageUploaderDropzoneMessageDefault'), // "Tap or Drag Your Food Photo"
    productImageUploaderDropzoneSubMessagePattern: i18n.t('add_product_modal.productImageUploaderDropzoneSubMessagePattern'), // "PNG, JPG, WEBP up to {maxFileSizeMB}MB"

    // Error Messages
    productImageUploaderErrorFileTooLarge: i18n.t('add_product_modal.productImageUploaderErrorFileTooLarge'), // "Photo is too large. Max {maxFileSizeMB}MB."
    productImageUploaderErrorInvalidFileType: i18n.t('add_product_modal.productImageUploaderErrorInvalidFileType'), // "Invalid file type. Please use JPG, PNG, or WEBP."
    productImageUploaderErrorFileNotAccepted: i18n.t('add_product_modal.productImageUploaderErrorFileNotAccepted'), // "Couldn't accept this file. Please try another."
    productImageUploaderErrorReadingFile: i18n.t('add_product_modal.productImageUploaderErrorReadingFile'), // "Error reading file. Please try again."
    productImageUploaderErrorInvalidImageData: i18n.t('add_product_modal.productImageUploaderErrorInvalidImageData'), // "Image data is invalid or image could not be loaded. Try a different one."
    productImageUploaderErrorCouldNotSaveCrop: i18n.t('add_product_modal.productImageUploaderErrorCouldNotSaveCrop'), // "Could not save crop. Please select a valid crop area or wait for image to load."
    productImageUploaderErrorFailedToProcess: i18n.t('add_product_modal.productImageUploaderErrorFailedToProcess'), // "Failed to process image. Please try again."
    productImageUploaderErrorSavingGeneric: i18n.t('add_product_modal.productImageUploaderErrorSavingGeneric'), // "An error occurred while saving: {errorMessage}"
    productImageUploaderErrorSavingDefault: i18n.t('add_product_modal.productImageUploaderErrorSavingDefault'), // "Please try again."
    productImageUploaderErrorCouldNotLoadProductImage: i18n.t('add_product_modal.productImageUploaderErrorCouldNotLoadProductImage'), // "Could not load product image."
    productImageUploaderErrorCanvasToBlobFailed: i18n.t('add_product_modal.productImageUploaderErrorCanvasToBlobFailed'), // "Image processing failed (Canvas to Blob)."

    // UI Text (buttons, labels, alt text, status)
    productImageUploaderStatusPreparing: i18n.t('add_product_modal.productImageUploaderStatusPreparing'), // "Preparing photo..."
    productImageUploaderCropAreaAriaLabel: i18n.t('add_product_modal.productImageUploaderCropAreaAriaLabel'), // "Image crop area"
    productImageUploaderCropImageAlt: i18n.t('add_product_modal.productImageUploaderCropImageAlt'), // "Image to crop"
    productImageUploaderButtonConfirm: i18n.t('venue_management.confirm'), // "Confirm"
    productImageUploaderButtonSaving: i18n.t('add_product_modal.productImageUploaderButtonSaving'), // "Saving..."
    productImageUploaderButtonCancel: i18n.t('venue_management.cancel'), // "Cancel"
    productImageUploaderFinalImageAlt: i18n.t('add_product_modal.productImageUploaderFinalImageAlt'), // "Product"
    productImageUploaderButtonChange: i18n.t('add_product_modal.productImageUploaderButtonChange'), // "Change"
    productImageUploaderButtonRemove: i18n.t('add_product_modal.productImageUploaderButtonRemove'), // "Remove"
    productImageUploaderDropzoneAriaLabel: i18n.t('add_product_modal.productImageUploaderDropzoneAriaLabel'), // "Image dropzone: Click or drag and drop an image"
    placeholder: i18n.t('add_product_modal.placeholder'), // "Tell your customers about this product..."
    label: i18n.t('add_product_modal.label'), // "Description"
    errorMissingOnSave: i18n.t('add_product_modal.errorMissingOnSave'), // "Error: Component misconfiguration. Cannot save input."
    errorMissingOnSaveTitle: i18n.t('add_product_modal.errorMissingOnSaveTitle'), // "Component Misconfigured: onSave handler missing"
    charCountOverLimitSuffix: i18n.t('add_product_modal.charCountOverLimitSuffix'), // "over"
    ariaEditLabelPrefix: i18n.t('venue_management.edit'), // "Edit"
    ariaEditLabelInfix: i18n.t('add_product_modal.ariaEditLabelInfix'), // ". Current value:"
    ariaEditLabelValueEmpty: i18n.t('add_product_modal.ariaEditLabelValueEmpty'), // "empty"
    placeholder2: i18n.t('add_product_modal.placeholder2'), // "Enter Product Name"
    label2: i18n.t('add_product_modal.productName'), // "Product Name"
    charCountRemainingSingular: i18n.t('add_product_modal.charCountRemainingSingular'), // "character remaining"
    charCountRemainingPlural: i18n.t('add_product_modal.charCountRemainingPlural'), // "characters remaining"
    ariaEditLabelPrefix2: i18n.t('venue_management.edit'), // "Edit"
    ariaEditLabelInfix2: i18n.t('add_product_modal.ariaEditLabelInfix'), // ". Current value:"
    warnCannotSetSelection: i18n.t('add_product_modal.warnCannotSetSelection'), // "Could not set selection range on input: "
    attributeGroup_error_invalidGroupData: i18n.t('add_product_modal.attributeGroup_error_invalidGroupData'), // "Error: Invalid attribute group data."
    attributeGroup_error_missingGroupIndex: i18n.t('add_product_modal.attributeGroup_error_missingGroupIndex'), // "Error: Missing group index."
    attributeGroup_error_missingHandler: i18n.t('add_product_modal.attributeGroup_error_missingHandler'), // "Error: Missing critical handler: {handlerName}."

    attributeGroup_groupNameLabel: i18n.t('add_product_modal.attributeGroup_groupNameLabel'), // "Attribute Group Name"
    attributeGroup_groupNamePlaceholder: i18n.t('add_product_modal.attributeGroup_groupNamePlaceholder'), // "e.g., Size, Milk Options"
    attributeGroup_groupName_ariaLabel: i18n.t('add_product_modal.attributeGroup_groupName_ariaLabel'), // "Name for attribute group {groupNumber}"
    attributeGroup_groupName_srLabel: i18n.t('add_product_modal.attributeGroup_groupName_srLabel'), // "Attribute Group: {groupNameOrNumber}"

    attributeGroup_typeLabel: i18n.t('add_product_modal.attributeGroup_typeLabel'), // "Attribute Type"
    attributeGroup_type_singleSelectLabel: i18n.t('add_product_modal.attributeGroup_type_singleSelectLabel'), // "Single Select (e.g., Radio buttons)"
    attributeGroup_type_multiSelectLabel: i18n.t('add_product_modal.attributeGroup_type_multiSelectLabel'), // "Multi-Select (e.g., Checkboxes)"
    attributeGroup_type_ariaLabel: i18n.t('add_product_modal.attributeGroup_type_ariaLabel'), // "Type for attribute group {groupNumber}"

    attributeGroup_requiredLabel: i18n.t('add_product_modal.attributeGroup_requiredLabel'), // "Required"
    attributeGroup_required_ariaLabel: i18n.t('add_product_modal.attributeGroup_required_ariaLabel'), // "Is attribute group {groupNumber} required"

    attributeGroup_removeGroupButton_ariaLabel: i18n.t('add_product_modal.attributeGroup_removeGroupButton_ariaLabel'), // "Remove attribute group {groupNameOrNumber}"
    attributeGroup_removeGroupButton_mobileText: i18n.t('add_product_modal.attributeGroup_removeGroupButton_mobileText'), // "Remove Group"

    attributeGroup_optionsForGroupTitle: i18n.t('add_product_modal.attributeGroup_optionsForGroupTitle'), // "Options for \"{groupName}\""
    attributeGroup_optionsForThisGroupTitle: i18n.t('add_product_modal.attributeGroup_optionsForThisGroupTitle'), // "Options for this group"

    attributeGroup_addOptionButton: i18n.t('add_product_modal.attributeGroup_addOptionButton'), // "Add Option"
    currencySymbol_USD: i18n.t('venue_management.currencySymbol'), // "$"
    currencySymbol_EUR: i18n.t('add_product_modal.currencySymbol_EUR'), // "\u20ac"
    createNewIngredientModal_title: i18n.t('add_product_modal.createNewIngredientModal_title'), // "Create New Inventory Item"
    createNewIngredientModal_close_ariaLabel: i18n.t('add_product_modal.common_closeModal_ariaLabel'), // "Close modal"

    createNewIngredientModal_itemNameLabel: i18n.t('add_product_modal.createNewIngredientModal_itemNameLabel'), // "Inventory Item Name"
    createNewIngredientModal_itemNamePlaceholder: i18n.t('add_product_modal.createNewIngredientModal_itemNamePlaceholder'), // "e.g., Organic Almond Flour, Whole Milk"

    createNewIngredientModal_measurementTypeLabel: i18n.t('add_product_modal.createNewIngredientModal_measurementTypeLabel'), // "Primary Measurement Type"
    createNewIngredientModal_measurementTypePlaceholder: i18n.t('add_product_modal.createNewIngredientModal_measurementTypePlaceholder'), // "Select type..."
    createNewIngredientModal_measurementType_mass: i18n.t('add_product_modal.createNewIngredientModal_measurementType_mass'), // "Mass (e.g., g, kg, oz, lb)"
    createNewIngredientModal_measurementType_volume: i18n.t('add_product_modal.createNewIngredientModal_measurementType_volume'), // "Volume (e.g., ml, L, tsp, cup)"
    createNewIngredientModal_measurementType_pieces: i18n.t('add_product_modal.createNewIngredientModal_measurementType_pieces'), // "Pieces (e.g., pcs, unit, slice)"

    createNewIngredientModal_defaultUnitLabel: i18n.t('add_product_modal.createNewIngredientModal_defaultUnitLabel'), // "Default Unit (for this item)"
    createNewIngredientModal_defaultUnitPlaceholder: i18n.t('add_product_modal.createNewIngredientModal_defaultUnitPlaceholder'), // "Select unit..."

    createNewIngredientModal_costPerBaseUnitLabel: i18n.t('add_product_modal.createNewIngredientModal_costPerBaseUnitLabel'), // "Cost per {baseUnit}"
    createNewIngredientModal_costPerBaseUnitPlaceholder_USD: i18n.t('add_product_modal.createNewIngredientModal_costPerBaseUnitPlaceholder_USD'), // "e.g., 0.02 (for USD)"
    createNewIngredientModal_costPerBaseUnitPlaceholder_EUR: i18n.t('add_product_modal.createNewIngredientModal_costPerBaseUnitPlaceholder_EUR'), // "e.g., 0.02 (for EUR)"
    createNewIngredientModal_costPerBaseUnitHelpText: i18n.t('add_product_modal.createNewIngredientModal_costPerBaseUnitHelpText'), // "Enter the cost for one base unit ({baseUnit}) of this item."

    createNewIngredientModal_error_nameRequired: i18n.t('add_product_modal.createNewIngredientModal_error_nameRequired'), // "Ingredient name is required."
    createNewIngredientModal_error_nameExists: i18n.t('add_product_modal.createNewIngredientModal_error_nameExists'), // "An ingredient with this name already exists."
    createNewIngredientModal_error_measurementTypeRequired: i18n.t('add_product_modal.createNewIngredientModal_error_measurementTypeRequired'), // "Primary measurement type is required."
    createNewIngredientModal_error_defaultUnitRequired: i18n.t('add_product_modal.createNewIngredientModal_error_defaultUnitRequired'), // "Default unit for this item is required."
    createNewIngredientModal_error_costRequired: i18n.t('add_product_modal.createNewIngredientModal_error_costRequired'), // "Valid cost (e.g., 0.05 or 0) is required."
    createNewIngredientModal_error_creationFailed: i18n.t('add_product_modal.createNewIngredientModal_error_creationFailed'), // "Failed to create ingredient. Please try again."

    createNewIngredientModal_button_cancel: i18n.t('venue_management.cancel'), // "Cancel"
    createNewIngredientModal_button_createItem: i18n.t('add_product_modal.createNewIngredientModal_button_createItem'), // "Create Item"
    createNewIngredientModal_button_creating: i18n.t('add_product_modal.createNewIngredientModal_button_creating'), // "Creating..."
    modalError_criticalHandlersMissing: i18n.t('add_product_modal.modalError_criticalHandlersMissing'), // "Modal Error: Critical handlers missing."
    modalError_inventoryDataMissing: i18n.t('add_product_modal.modalError_inventoryDataMissing'), // "Modal Error: Inventory data missing."
    recipeBuilderTitle: i18n.t('add_product_modal.recipeBuilderTitle'), // "Recipe Ingredients"
    recipeBuilderSubtitle: i18n.t('add_product_modal.recipeBuilderSubtitle'), // "Define ingredients for one batch. Drag to reorder."
    recipeBuilderEstCostPrefix: i18n.t('add_product_modal.recipeBuilderEstCostPrefix'), // "Est. Recipe Cost:"
    recipeBuilderEmptyTitle: i18n.t('add_product_modal.recipeBuilderEmptyTitle'), // "Recipe is Empty"
    recipeBuilderEmptySubtitle: i18n.t('add_product_modal.recipeBuilderEmptySubtitle'), // "Add ingredients to build your product's recipe."
    recipeBuilderAddFirstButton: i18n.t('add_product_modal.recipeBuilderAddFirstButton'), // "Add First Ingredient"
    recipeBuilderAddAnotherButton: i18n.t('add_product_modal.recipeBuilderAddAnotherButton'), // "Add Another Ingredient"
    recipeBuilderErrorMisconfigured: i18n.t('add_product_modal.recipeBuilderErrorMisconfigured'), // "Error: Recipe Builder is misconfigured. Please check console for details."

    recipeComponentRow: {
        // Unit options
        unitSelectIngredientFirst: i18n.t('add_product_modal.recipeComponentRow.unitSelectIngredientFirst'), // "Select ingredient first"
        warnCostCalculation: i18n.t('add_product_modal.recipeComponentRow.warnCostCalculation'), // "RecipeComponentRow Cost calc issue for {itemName}: QIB {quantityInBaseUnit}, Cost unit {costUnit}, Expected base unit {expectedBaseUnit}"
        errorInvalidNewItem: i18n.t('add_product_modal.recipeComponentRow.errorInvalidNewItem'), // "RecipeComponentRow: newItemFromBackend received from creation modal is invalid."
        devErrorInvalidComponentProp: i18n.t('add_product_modal.recipeComponentRow.devErrorInvalidComponentProp'), // "RecipeComponentRow Dev Error: Invalid `component` prop."
        devErrorInvalidIndexProp: i18n.t('add_product_modal.recipeComponentRow.devErrorInvalidIndexProp'), // "RecipeComponentRow Dev Error: `index` prop is required and must be a number."
        ingredientLabel: i18n.t('add_product_modal.recipeComponentRow.ingredientLabel'), // "Ingredient"
        ingredientPlaceholder: i18n.t('add_product_modal.recipeComponentRow.ingredientPlaceholder'), // "Search or create ingredient..."
        ingredientSrLabelPrefix: i18n.t('add_product_modal.recipeComponentRow.ingredientSrLabelPrefix'), // "Recipe Ingredient:"
        ingredientSrLabelItemInfix: i18n.t('add_product_modal.recipeComponentRow.ingredientSrLabelItemInfix'), // "Item"

        // Suggestions List
        suggestionCreateNewPrefix: i18n.t('add_product_modal.recipeComponentRow.suggestionCreateNewPrefix'), // "Create new:"
        suggestionNoMatch: i18n.t('add_product_modal.recipeComponentRow.suggestionNoMatch'), // "No matching ingredients found."
        suggestionNoIngredients: i18n.t('add_product_modal.recipeComponentRow.suggestionNoIngredients'), // "No ingredients available. Start typing to create one."
        suggestionExactMatch: i18n.t('add_product_modal.recipeComponentRow.suggestionExactMatch'), // "Exact match selected."
        quantityLabel: i18n.t('add_product_modal.recipeComponentRow.quantityLabel'), // "Quantity"
        quantityPlaceholder: i18n.t('add_product_modal.recipeComponentRow.quantityPlaceholder'), // "e.g., 100"
        quantityAriaLabelPrefix: i18n.t('add_product_modal.recipeComponentRow.quantityAriaLabelPrefix'), // "Quantity for"
        unitLabel: i18n.t('add_product_modal.recipeComponentRow.unitLabel'), // "Unit"
        unitSelectPlaceholder: i18n.t('add_product_modal.recipeComponentRow.unitSelectPlaceholder'), // "Select..."
        unitAriaLabelPrefix: i18n.t('add_product_modal.recipeComponentRow.unitAriaLabelPrefix'), // "Unit for"
        estimatedCostLabel: i18n.t('add_product_modal.recipeComponentRow.estimatedCostLabel'), // "Est. Cost"
        estimatedCostNA: i18n.t('add_product_modal.recipeComponentRow.estimatedCostNA'), // "N/A"
        removeButtonAriaLabelPrefix: i18n.t('add_product_modal.recipeComponentRow.removeButtonAriaLabelPrefix'), // "Remove ingredient"
        removeButtonTextSmallScreen: i18n.t('add_product_modal.recipeComponentRow.removeButtonTextSmallScreen'), // "Remove Ingredient"
    },

    // AppliedDiscountRow specific texts
    appliedDiscountRow_defaultDescription: i18n.t('add_product_modal.appliedDiscountRow_defaultDescription'), // "General discount code"
    appliedDiscountRow_percentageLabel: i18n.t('add_product_modal.appliedDiscountRow_percentageLabel'), // "Discount Percentage"
    appliedDiscountRow_percentagePlaceholder: i18n.t('add_product_modal.appliedDiscountRow_percentagePlaceholder'), // "e.g., 10"
    appliedDiscountRow_remove_ariaLabel: i18n.t('add_product_modal.appliedDiscountRow_remove_ariaLabel'), // "Remove discount {discountName}"
    appliedDiscountRow_remove_title: i18n.t('add_product_modal.appliedDiscountRow_remove_title'), // "Remove {discountName}"

    appliedDiscountsManagerNoDiscountsPrimary: i18n.t('add_product_modal.appliedDiscountsManagerNoDiscountsPrimary'), // "No discounts applied to this product yet."
    appliedDiscountsManagerNoDiscountsSecondary: i18n.t('add_product_modal.appliedDiscountsManagerNoDiscountsSecondary'), // "Select a code above or create a new one."
    appliedDiscountsManagerListHeaderPattern: i18n.t('add_product_modal.appliedDiscountsManagerListHeaderPattern'), // "Applied Discounts ({count}):"


    createDiscountCodeModal: {
        // Modal Title
        title: i18n.t('add_product_modal.createDiscountCodeModal.title'), // "Create New Master Discount"
        closeButtonLabel: i18n.t('add_product_modal.createDiscountCodeModal.closeButtonLabel'), // "Close create discount modal"
        closeButtonTitle: i18n.t('venue_management.close'), // "Close"
        codeNameLabel: i18n.t('add_product_modal.createDiscountCodeModal.codeNameLabel'), // "Discount Code Name"
        descriptionLabel: i18n.t('add_product_modal.createDiscountCodeModal.descriptionLabel'), // "Internal Description"
        discountTypeLabel: i18n.t('add_product_modal.createDiscountCodeModal.discountTypeLabel'), // "Discount Type (for this master code)"
        discountValueLabelPercentage: i18n.t('add_product_modal.createDiscountCodeModal.discountValueLabelPercentage'), // "Default Discount Percentage"
        discountValueLabelAmount: i18n.t('add_product_modal.createDiscountCodeModal.discountValueLabelAmount'), // "Default Discount Amount"

        // InputField Placeholders
        codeNamePlaceholder: i18n.t('add_product_modal.createDiscountCodeModal.codeNamePlaceholder'), // "e.g., SUMMER2024"
        descriptionPlaceholder: i18n.t('add_product_modal.createDiscountCodeModal.descriptionPlaceholder'), // "e.g., Summer campaign 2024, all products"
        codeNameHelpText: i18n.t('add_product_modal.createDiscountCodeModal.codeNameHelpText'), // "Unique code, {minLength}-{maxLength} chars. Customers will use this."
        descriptionHelpText: i18n.t('add_product_modal.createDiscountCodeModal.descriptionHelpText'), // "For your reference, not shown to customers."
        discountTypeHelpText: i18n.t('add_product_modal.createDiscountCodeModal.discountTypeHelpText'), // "Determines how the discount value is interpreted."
        discountValueHelpTextPercentage: i18n.t('add_product_modal.createDiscountCodeModal.discountValueHelpTextPercentage'), // "General percentage for this code. Can be fine-tuned per product."
        discountValueHelpTextAmount: i18n.t('add_product_modal.createDiscountCodeModal.discountValueHelpTextAmount'), // "General fixed amount for this code."

        // Dropdown Options (Labels for default types)
        discountTypePercentageLabel: i18n.t('add_product_modal.createDiscountCodeModal.discountTypePercentageLabel'), // "Percentage Off (%)"
        // discountTypeFixedAmountProductLabel: "Fixed Amount Off Product ({currencySymbol})", // Placeholder {currencySymbol}

        // Validation Error Messages
        errorRequired: i18n.t('add_product_modal.createDiscountCodeModal.errorRequired'), // "{fieldName} is required."
        errorCodeNameMinLength: i18n.t('add_product_modal.createDiscountCodeModal.errorCodeNameMinLength'), // "Code must be at least {minLength} characters."
        errorCodeNameMaxLength: i18n.t('add_product_modal.createDiscountCodeModal.errorCodeNameMaxLength'), // "Code must be at most {maxLength} characters."
        errorCodeNameExists: i18n.t('add_product_modal.createDiscountCodeModal.errorCodeNameExists'), // "This discount code name already exists."
        errorDescriptionMaxLength: i18n.t('add_product_modal.createDiscountCodeModal.errorDescriptionMaxLength'), // "Description must be at most {maxLength} characters."
        errorDiscountValueRequired: i18n.t('add_product_modal.createDiscountCodeModal.errorDiscountValueRequired'), // "A valid discount value is required."
        errorDiscountValuePositive: i18n.t('add_product_modal.createDiscountCodeModal.errorDiscountValuePositive'), // "Discount value must be positive."
        errorDiscountPercentageMax: i18n.t('add_product_modal.createDiscountCodeModal.errorDiscountPercentageMax'), // "Percentage cannot exceed 100."
        errorFormGeneric: i18n.t('register.components.formStep.errors.unexpectedError'), // "An unexpected error occurred. Please try again."

        // Button Texts
        cancelButtonText: i18n.t('venue_management.cancel'), // "Cancel"
        createButtonText: i18n.t('add_product_modal.createDiscountCodeModal.createButtonText'), // "Create Discount"
        creatingButtonText: i18n.t('add_product_modal.createNewIngredientModal_button_creating'), // "Creating..."

        // Console Messages
        errorConsoleFailedCreate: i18n.t('add_product_modal.createDiscountCodeModal.errorConsoleFailedCreate'), // "Failed to create discount:"
    },

    // DiscountCodeSelector specific texts
    discountCodeSelector_label: i18n.t('add_product_modal.discountCodeSelector_label'), // "Add Discount Code to this Product"
    discountCodeSelector_placeholder: i18n.t('add_product_modal.discountCodeSelector_placeholder'), // "Search existing codes or create new..."
    discountCodeSelector_noMatch: i18n.t('add_product_modal.discountCodeSelector_noMatch'), // "No matching codes found."
    discountCodeSelector_createNew: i18n.t('add_product_modal.discountCodeSelector_createNew'), // "Create New Discount Code"
    step1SubtitlePlaceholder: i18n.t('add_product_modal.step1SubtitlePlaceholder'), // "e.g., Freshly baked daily with organic ingredients"
    step1SubtitleLabel: i18n.t('add_product_modal.step1SubtitleLabel'), // "Product Subtitle"
    step1CategoryPlaceholder: i18n.t('add_product_modal.categoryDropdownPlaceholder'), // "Select or create category"
    step1TagsLabel: i18n.t('add_product_modal.step1TagsLabel'), // "Product Tags/Attributes"
    step1ImageErrorDefault: i18n.t('add_product_modal.step1ImageErrorDefault'), // "Invalid image"

    step2EditableAttributes: {
        // Section Title
        sectionTitle: i18n.t('add_product_modal.step2EditableAttributes.sectionTitle'), // "Product Customizations"
        addButtonText: i18n.t('add_product_modal.step2EditableAttributes.addButtonText'), // "Add Attribute Group"
        infoText: i18n.t('add_product_modal.step2EditableAttributes.infoText'), // "Define options your customers can choose, like size, flavor, or add-ons. These can optionally adjust the price."
        emptyStateTitle: i18n.t('add_product_modal.step2EditableAttributes.emptyStateTitle'), // "No Customizations Yet"
        emptyStateDescription: i18n.t('add_product_modal.step2EditableAttributes.emptyStateDescription'), // "Click \"Add Attribute Group\" to let customers personalize this product."
    },

    // Step3_Ingredients specific texts
    step3_loadingInventory: i18n.t('add_product_modal.step3_loadingInventory'), // "Loading inventory items..."
    step3_errorLoadingInventory: i18n.t('add_product_modal.step3_errorLoadingInventory'), // "Error loading inventory: {errorMessage}"
    step3_title: i18n.t('add_product_modal.step3_title'), // "Product Sourcing & Recipe"
    step3_subtitle: i18n.t('add_product_modal.step3_subtitle'), // "Specify if this product is made in-house or resold. This affects cost calculation."
    step3_productTypeLabel: i18n.t('add_product_modal.step3_productTypeLabel'), // "Product Type*"
    step3_productType_madeInHouse: i18n.t('add_product_modal.step3_productType_madeInHouse'), // "Made In-House (Uses Recipe)"
    step3_productType_resoldItem: i18n.t('add_product_modal.step3_productType_resoldItem'), // "Resold Item (Direct Stock)"
    step3_recipeYieldsLabel: i18n.t('add_product_modal.step3_recipeYieldsLabel'), // "Recipe Yields (Units of this product)"
    step3_recipeYieldsPlaceholder: i18n.t('add_product_modal.step3_recipeYieldsPlaceholder'), // "e.g., 1"
    step3_recipeYieldsHelpText: i18n.t('add_product_modal.step3_recipeYieldsHelpText'), // "How many units of this product does this recipe make?"
    step3_resoldItemInfo: i18n.t('add_product_modal.step3_resoldItemInfo'), // "For resold items, stock is managed directly. The \"Cost to Make\" in the next step will be your purchase price."
    step3_error_failedToCreateIngredient: i18n.t('add_product_modal.createNewIngredientModal_error_creationFailed'), // "Failed to create ingredient. Please try again."


    // --- New keys for Step4_Pricing ---
    step4LoadingTaxRates: i18n.t('add_product_modal.step4LoadingTaxRates'), // "Loading tax rates..."
    step4ErrorLoadingTaxRatesPattern: i18n.t('add_product_modal.step4ErrorLoadingTaxRatesPattern'), // "Error loading tax rates: {errorMessage}"
    step4MainTitle: i18n.t('add_product_modal.step4MainTitle'), // "Pricing Configuration"
    step4MainSubtitle: i18n.t('add_product_modal.step4MainSubtitle'), // "Set your product's price, considering costs and desired profit margin."

    step4CostBreakdownTitle: i18n.t('add_product_modal.step4CostBreakdownTitle'), // "Cost Breakdown"
    step4EstCostIngredientsLabel: i18n.t('add_product_modal.step4EstCostIngredientsLabel'), // "Estimated Cost from Ingredients:"
    step4LaborOverheadLabelPattern: i18n.t('add_product_modal.step4LaborOverheadLabelPattern'), // "Labor, Packaging & Overheads ({currencySymbol})"
    step4PurchaseCostLabelPattern: i18n.t('add_product_modal.step4PurchaseCostLabelPattern'), // "Purchase Cost ({currencySymbol})"
    step4LaborOverheadHelpText: i18n.t('add_product_modal.step4LaborOverheadHelpText'), // "Additional costs beyond raw ingredients."
    step4PurchaseCostHelpText: i18n.t('add_product_modal.step4PurchaseCostHelpText'), // "Your cost to acquire this resold item."
    step4TotalCalculatedCostLabel: i18n.t('add_product_modal.step4TotalCalculatedCostLabel'), // "Total Calculated Cost:"

    step4SellingPriceProfitTitle: i18n.t('add_product_modal.step4SellingPriceProfitTitle'), // "Selling Price & Profit"
    step4SellingPriceLabelPattern: i18n.t('add_product_modal.step4SellingPriceLabelPattern'), // "Your Selling Price ({currencySymbol}) (Excluding Tax)"
    step4WarningPriceBelowCost: i18n.t('add_product_modal.step4WarningPriceBelowCost'), // "Selling price is below the total calculated cost. This will result in a loss."
    step4CalcProfitMarginLabel: i18n.t('add_product_modal.step4CalcProfitMarginLabel'), // "Calculated Profit Margin:"
    step4NotApplicable: i18n.t('add_product_modal.recipeComponentRow.estimatedCostNA'), // "N/A"
    step4ProfitPerUnitLabelPattern: i18n.t('add_product_modal.step4ProfitPerUnitLabelPattern'), // "Profit per unit (before tax): {currencySymbol}{profitAmount}"

    step4TaxationTitle: i18n.t('add_product_modal.step4TaxationTitle'), // "Taxation"
    step4TaxRateLabel: i18n.t('add_product_modal.step4TaxRateLabel'), // "Tax Rate (Applied to Selling Price)"
    step4TaxRateNoTaxOption: i18n.t('add_product_modal.step4TaxRateNoTaxOption'), // "No Tax / Tax Included"
    step4TaxAmountLabelPattern: i18n.t('add_product_modal.step4TaxAmountLabelPattern'), // "Tax Amount ({taxRate}%):"
    step4FinalPriceLabel: i18n.t('add_product_modal.step4FinalPriceLabel'), // "Final Selling Price (Incl. Tax):"

    step4SaveAsTemplateLabel: i18n.t('add_product_modal.step4SaveAsTemplateLabel'), // "Use this product as a template for future creations"
    step4SaveAsTemplateHelpText: i18n.t('add_product_modal.step4SaveAsTemplateHelpText'), // "If checked, this product's details will pre-fill the form next time you add a new product. Only one product can be the active template per business."

    step5DiscountsExtras: {
        // Loading/Error states for master codes
        loadingMasterCodes: i18n.t('add_product_modal.step5DiscountsExtras.loadingMasterCodes'), // "Loading discount codes..."
        errorLoadingMasterCodesPrefix: i18n.t('add_product_modal.step5DiscountsExtras.errorLoadingMasterCodesPrefix'), // "Error loading discount codes:"

        // Section Titles and Descriptions
        mainTitle: i18n.t('add_product_modal.step5DiscountsExtras.mainTitle'), // "Discounts & Extras"
        mainDescription: i18n.t('add_product_modal.step5DiscountsExtras.mainDescription'), // "Apply discounts or add internal notes for this product."
        productSpecificDiscountsTitle: i18n.t('add_product_modal.step5DiscountsExtras.productSpecificDiscountsTitle'), // "Product-Specific Discounts"
        additionalNotesTitle: i18n.t('add_product_modal.step5DiscountsExtras.additionalNotesTitle'), // "Additional Notes (Optional)"
        additionalNotesLabel: i18n.t('add_product_modal.step5DiscountsExtras.additionalNotesLabel'), // "Internal Notes or Extra Info"
        additionalNotesPlaceholder: i18n.t('add_product_modal.step5DiscountsExtras.additionalNotesPlaceholder'), // "e.g., Special handling, allergen info not covered by tags, display notes..."
        warnDiscountAlreadyApplied: i18n.t('add_product_modal.step5DiscountsExtras.warnDiscountAlreadyApplied'), // "Discount code already applied to this product."
        errorMissingBusinessId: i18n.t('add_product_modal.step5DiscountsExtras.errorMissingBusinessId'), // "Step5: Active business ID is missing. Cannot create discount code."
        errorBusinessContextMissing: i18n.t('add_product_modal.step5DiscountsExtras.errorBusinessContextMissing'), // "Your business context is missing. Please try again or contact support."
        errorFailedCreateMasterCode: i18n.t('add_product_modal.step5DiscountsExtras.errorFailedCreateMasterCode'), // "Step5: Failed to create master discount code:"

        errorLoadingMasterCodesTitle: i18n.t('add_product_modal.step5DiscountsExtras.errorLoadingMasterCodesTitle'), // "Error Loading Discounts"
    },


    // AddProductModal specific texts
    addProductModal_noTemplateFound: i18n.t('add_product_modal.addProductModal_noTemplateFound'), // "No product template found (404). Resetting form."
    addProductModal_errorFetchingTemplate: i18n.t('add_product_modal.addProductModal_errorFetchingTemplate'), // "Error fetching product template:"
    addProductModal_error_failedToCreateCategory: i18n.t('add_product_modal.addProductModal_error_failedToCreateCategory'), // "Failed to create category."
    addProductModal_error_categoryCreationFailed: i18n.t('add_product_modal.addProductModal_error_categoryCreationFailed'), // "Category creation failed: {errorMessage}"
    addProductModal_error_failedToCreateTag: i18n.t('add_product_modal.addProductModal_error_failedToCreateTag'), // "Failed to create tag."
    addProductModal_error_tagCreationFailed: i18n.t('add_product_modal.addProductModal_error_tagCreationFailed'), // "Tag creation failed: {errorMessage}"

    addProductModal_toast_imageUploaded: i18n.t('add_product_modal.addProductModal_toast_imageUploaded'), // "Image uploaded successfully."
    addProductModal_toast_imageUploadFailed: i18n.t('add_product_modal.addProductModal_toast_imageUploadFailed'), // "Product data saved, but image upload failed: {errorMessage}"
    addProductModal_toast_imageRemoved: i18n.t('add_product_modal.addProductModal_toast_imageRemoved'), // "Image removed."
    addProductModal_toast_imageRemoveFailed: i18n.t('add_product_modal.addProductModal_toast_imageRemoveFailed'), // "Product data saved, but image removal failed: {errorMessage}"
    addProductModal_toast_productUpdated: i18n.t('add_product_modal.addProductModal_toast_productUpdated'), // "Product updated successfully!"
    addProductModal_toast_productAdded: i18n.t('add_product_modal.addProductModal_toast_productAdded'), // "Product added successfully!"
    addProductModal_error_failedToUpdateProduct: i18n.t('add_product_modal.addProductModal_error_failedToUpdateProduct'), // "Failed to update product."
    addProductModal_error_failedToAddProduct: i18n.t('add_product_modal.addProductModal_error_failedToAddProduct'), // "Failed to add product."

    addProductModal_loading_productSetup: i18n.t('add_product_modal.addProductModal_loading_productSetup'), // "Loading product setup..."
    addProductModal_loading_initialDataError: i18n.t('add_product_modal.addProductModal_loading_initialDataError'), // "Error loading initial data: {errorMessage}"
    addProductModal_loading_initialDataError_fallback: i18n.t('add_product_modal.productImageUploaderErrorSavingDefault'), // "Please try again."

    addProductModal_header_placeholderEdit: i18n.t('add_product_modal.addProductModal_header_placeholderEdit'), // "Edit Product Name..."
    addProductModal_header_placeholderNew: i18n.t('add_product_modal.addProductModal_header_placeholderNew'), // "Enter Product Name..."

    addProductModal_loading_preparingForm: i18n.t('add_product_modal.addProductModal_loading_preparingForm'), // "Preparing product form..."
    addProductModal_loading_fetchingSettings: i18n.t('add_product_modal.addProductModal_loading_fetchingSettings'), // "Fetching latest settings and templates."
    addProductModal_error_couldNotLoadData: i18n.t('add_product_modal.addProductModal_error_couldNotLoadData'), // "Could not load essential data."
    addProductModal_error_tryClosingModal: i18n.t('add_product_modal.addProductModal_error_tryClosingModal'), // "Please try closing and reopening the modal."
    addProductModal_button_close: i18n.t('venue_management.close'), // "Close"

    addProductModal_error_invalidStep: i18n.t('add_product_modal.addProductModal_error_invalidStep'), // "Error: Invalid step."
    addProductModal_error_apiErrorDefault: i18n.t('add_product_modal.addProductModal_error_apiErrorDefault'), // "An API error occurred."


    // --- New keys for ModalFooter ---
    modalFooterBackButton: i18n.t('register.components.formStep.buttons.back'), // "Back"
    modalFooterContinueButton: i18n.t('register.components.formStep.buttons.continue'), // "Continue"
    modalFooterValidatingButton: i18n.t('add_product_modal.modalFooterValidatingButton'), // "Validating..."
    modalFooterCreatingButton: i18n.t('add_product_modal.createNewIngredientModal_button_creating'), // "Creating..."
    modalFooterCreateProductButton: i18n.t('add_product_modal.modalFooterCreateProductButton'), // "Create Product"

    modalHeader: {
        // ProductTitleInput placeholders
        titlePlaceholderDefault: i18n.t('add_product_modal.productName'), // "Product Name"
        titlePlaceholderEditMode: i18n.t('add_product_modal.addProductModal_header_placeholderEdit'), // "Edit Product Name..."
        labelDefault: i18n.t('add_product_modal.productName'), // "Product Name"
        labelEditModePrefix: i18n.t('add_product_modal.modalHeader.labelEditModePrefix'), // "Editing:"
        labelEditModeFallbackProduct: i18n.t('add_product_modal.productImageUploaderFinalImageAlt'), // "Product"

        // Close button aria-label
        closeButtonAriaLabel: i18n.t('add_product_modal.common_closeModal_ariaLabel'), // "Close modal"
    },


    // ModalStepIndicator specific texts
    modalStepIndicator_nav_ariaLabel: i18n.t('add_product_modal.modalStepIndicator_nav_ariaLabel'), // "Product creation steps"
    modalStepIndicator_step_basics: i18n.t('add_product_modal.modalStepIndicator_step_basics'), // "Basics"
    modalStepIndicator_step_attributes: i18n.t('add_product_modal.modalStepIndicator_step_attributes'), // "Attributes"
    modalStepIndicator_step_ingredients: i18n.t('add_product_modal.modalStepIndicator_step_ingredients'), // "Ingredients"
    modalStepIndicator_step_pricing: i18n.t('add_product_modal.modalStepIndicator_step_pricing'), // "Pricing"
    modalStepIndicator_step_discounts: i18n.t('add_product_modal.modalStepIndicator_step_discounts'), // "Discounts"
    modalStepIndicator_aria_currentStep: i18n.t('add_product_modal.modalStepIndicator_aria_currentStep'), // "{stepName}, current step"
    modalStepIndicator_aria_goToStep: i18n.t('add_product_modal.modalStepIndicator_aria_goToStep'), // "Go to {stepName}"
    // Note: The plain step name is used as a fallback aria-label for pending steps.

    // --- Updated/New keys for ProductFormStep (flattened from previous internal structure) ---
    productFormStepButtonBack: i18n.t('register.components.formStep.buttons.back'), // "Back"
    productFormStepButtonContinue: i18n.t('register.components.formStep.buttons.continue'), // "Continue"
    productFormStepButtonSubmitProduct: i18n.t('add_product_modal.modalFooterCreateProductButton'), // "Create Product"
    productFormStepButtonSubmitting: i18n.t('add_product_modal.createNewIngredientModal_button_creating'), // "Creating..."
    productFormStepButtonValidating: i18n.t('add_product_modal.modalFooterValidatingButton'), // "Validating..."
    productFormStepButtonSaving: i18n.t('add_product_modal.productImageUploaderButtonSaving'), // "Saving..."
    productFormStepButtonSaveChanges: i18n.t('add_product_modal.productFormStepButtonSaveChanges'), // "Save Changes"


    productFormStepErrorSummaryTitle: i18n.t('add_product_modal.productFormStepErrorSummaryTitle'), // "Please correct the following to continue:"
    productFormStepErrorSummaryMore: i18n.t('add_product_modal.productFormStepErrorSummaryMore'), // "and {count} more..."
};

export default scriptLines;