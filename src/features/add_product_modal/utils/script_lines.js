import i18n from 'i18next';

export const scriptLines = {
    addProductModal_error_activeBusinessMissing: i18n.t('add_product_modal.addProductModal_error_activeBusinessMissing'),
    categoryDropdown_categoryCreatedSuccess: i18n.t('add_product_modal.categoryDropdown_categoryCreatedSuccess'),
    customTagModal_tagCreatedSuccess: i18n.t('add_product_modal.customTagModal_tagCreatedSuccess'),

    // General
    error_unknownValidation: i18n.t('add_product_modal.error_unknownValidation'),

    // Step 1: Basic Data
    error_productName_required: i18n.t('add_product_modal.error_productName_required'),
    error_productName_maxLength: i18n.t('add_product_modal.error_productName_maxLength'),
    error_subtitle_maxLength: i18n.t('add_product_modal.error_subtitle_maxLength'),
    error_description_maxLength: i18n.t('add_product_modal.error_description_maxLength'),
    error_category_required: i18n.t('add_product_modal.error_category_required'),
    error_productAttributes_maxLength: i18n.t('add_product_modal.error_productAttributes_maxLength'),

    // Step 2: Editable Attributes
    // Option Schema
    error_optionName_required: i18n.t('add_product_modal.error_optionName_required'),
    error_optionName_maxLength: i18n.t('add_product_modal.error_optionName_maxLength'),
    error_priceAdjustment_type: i18n.t('add_product_modal.error_priceAdjustment_type'),
    // Editable Attribute Schema
    error_attributeGroupName_required: i18n.t('add_product_modal.error_attributeGroupName_required'),
    error_attributeGroupName_maxLength: i18n.t('add_product_modal.error_attributeGroupName_maxLength'),
    error_attributeType_required: i18n.t('add_product_modal.error_attributeType_required'),
    error_attributeOptions_minLength: i18n.t('add_product_modal.error_attributeOptions_minLength'),
    error_attributeOptions_maxLength: i18n.t('add_product_modal.error_attributeOptions_maxLength'),
    // Step 2 Schema
    error_editableAttributes_maxLength: i18n.t('add_product_modal.error_editableAttributes_maxLength'),

    // Step 3: Ingredients
    // Recipe Component Schema
    error_recipeComponent_inventoryItem_required: i18n.t('add_product_modal.error_recipeComponent_inventoryItem_required'),
    error_recipeComponent_quantity_type: i18n.t('add_product_modal.error_recipeComponent_quantity_type'),
    error_recipeComponent_quantity_required: i18n.t('add_product_modal.error_recipeComponent_quantity_required'),
    error_recipeComponent_quantity_min: i18n.t('add_product_modal.error_recipeComponent_quantity_min'),
    error_recipeComponent_unit_required: i18n.t('add_product_modal.error_recipeComponent_unit_required'),
    error_recipeComponent_unit_maxLength: i18n.t('add_product_modal.error_recipeComponent_unit_maxLength'),
    // Step 3 Schema
    error_productType_required: i18n.t('add_product_modal.error_productType_required'),
    error_recipeComponents_minLength_madeInHouse: i18n.t('add_product_modal.error_recipeComponents_minLength_madeInHouse'),
    error_recipeComponents_maxLength_resold: i18n.t('add_product_modal.error_recipeComponents_maxLength_resold'),
    error_recipeYields_type_madeInHouse: i18n.t('add_product_modal.error_recipeYields_type_madeInHouse'),
    error_recipeYields_required_madeInHouse: i18n.t('add_product_modal.error_recipeYields_required_madeInHouse'),
    error_recipeYields_integer_madeInHouse: i18n.t('add_product_modal.error_recipeYields_integer_madeInHouse'),
    error_recipeYields_min_madeInHouse: i18n.t('add_product_modal.error_recipeYields_min_madeInHouse'),

    // Step 4: Pricing
    error_laborCost_type: i18n.t('add_product_modal.error_laborCost_type'),
    error_laborCost_min: i18n.t('add_product_modal.error_laborCost_min'),
    error_sellingPrice_type: i18n.t('add_product_modal.error_sellingPrice_type'),
    error_sellingPrice_required: i18n.t('add_product_modal.error_sellingPrice_required'),
    error_sellingPrice_min: i18n.t('add_product_modal.error_sellingPrice_min'),

    // Step 5: Discounts & Extras
    // Applied Discount Schema
    error_appliedDiscount_masterId_required: i18n.t('add_product_modal.error_appliedDiscount_masterId_required'),
    error_appliedDiscount_overridePercentage_type: i18n.t('add_product_modal.error_appliedDiscount_overridePercentage_type'),
    error_appliedDiscount_overridePercentage_min: i18n.t('add_product_modal.error_appliedDiscount_overridePercentage_min'),
    error_appliedDiscount_overridePercentage_max: i18n.t('add_product_modal.error_appliedDiscount_overridePercentage_max'),
    // Step 5 Schema
    error_additionalNotes_maxLength: i18n.t('add_product_modal.error_additionalNotes_maxLength'),

    productName: i18n.t('add_product_modal.productName'), // Example from prompt, if it exists

    // --- CategoryDropdown ---
    categoryDropdownPlaceholder: i18n.t('add_product_modal.categoryDropdownPlaceholder'),
    categoryDropdownErrorNameEmpty: i18n.t('add_product_modal.categoryDropdownErrorNameEmpty'),
    categoryDropdownErrorNameExists: i18n.t('add_product_modal.categoryDropdownErrorNameExists'),
    categoryDropdownCreateNewActionLabel: i18n.t('add_product_modal.categoryDropdownCreateNewActionLabel'),
    categoryDropdownNewNamePlaceholder: i18n.t('add_product_modal.categoryDropdownNewNamePlaceholder'),
    categoryDropdownColorLabel: i18n.t('add_product_modal.categoryDropdownColorLabel'),
    categoryDropdownButtonCancel: i18n.t('venue_management.cancel'),
    categoryDropdownButtonCreate: i18n.t('add_product_modal.categoryDropdownButtonCreate'),

    // --- color names in defaultCategoryPaletteColors ---
    colorRose: i18n.t('add_product_modal.colorRose'),
    colorPink: i18n.t('add_product_modal.colorPink'),
    colorFuchsia: i18n.t('add_product_modal.colorFuchsia'),
    colorPurple: i18n.t('add_product_modal.colorPurple'),
    colorViolet: i18n.t('add_product_modal.colorViolet'),
    colorIndigo: i18n.t('add_product_modal.colorIndigo'),
    colorBlue: i18n.t('add_product_modal.colorBlue'),
    colorSky: i18n.t('add_product_modal.colorSky'),
    colorCyan: i18n.t('add_product_modal.colorCyan'),
    colorTeal: i18n.t('add_product_modal.colorTeal'),
    colorEmerald: i18n.t('add_product_modal.colorEmerald'),
    colorGreen: i18n.t('add_product_modal.colorGreen'),
    colorLime: i18n.t('add_product_modal.colorLime'),
    colorYellow: i18n.t('add_product_modal.colorYellow'),
    colorAmber: i18n.t('add_product_modal.colorAmber'),
    colorOrange: i18n.t('add_product_modal.colorOrange'),
    colorRed: i18n.t('add_product_modal.colorRed'),
    colorNeutral: i18n.t('add_product_modal.colorNeutral'),

    colorPalette: {
        /**
         * Prefix for the aria-label of each color button.
         * The full aria-label will be constructed as: "[selectColorPrefix] [colorName]".
         * Example: "Select color: Red"
         */
        selectColorPrefix: i18n.t('add_product_modal.colorPalette.selectColorPrefix'),
    },

    // Common UI elements
    common_cancel: i18n.t('venue_management.cancel'),
    common_closeModal_ariaLabel: i18n.t('add_product_modal.common_closeModal_ariaLabel'),

    // CustomTagModal specific texts
    customTagModal_title: i18n.t('add_product_modal.customTagModal_title'),
    customTagModal_tagNameLabel: i18n.t('add_product_modal.customTagModal_tagNameLabel'),
    customTagModal_tagNamePlaceholder: i18n.t('add_product_modal.customTagModal_tagNamePlaceholder'),
    customTagModal_error_nameEmpty: i18n.t('add_product_modal.customTagModal_error_nameEmpty'),
    customTagModal_error_nameExists: i18n.t('add_product_modal.customTagModal_error_nameExists'), // Note: {tagName} is a placeholder
    customTagModal_chooseIconLabel: i18n.t('add_product_modal.customTagModal_chooseIconLabel'),
    customTagModal_createTagButton: i18n.t('add_product_modal.customTagModal_createTagButton'),

    productIdentifiers_defaultLabel: i18n.t('add_product_modal.productIdentifiers_defaultLabel'),
    productIdentifiers_addTagButton: i18n.t('add_product_modal.productIdentifiers_addTagButton'),
    productIdentifiers_addTag_ariaLabel: i18n.t('add_product_modal.productIdentifiers_addTag_ariaLabel'),
    productIdentifiers_error_missingData: i18n.t('add_product_modal.productIdentifiers_error_missingData'),
    productIdentifiers_error_invalidStructure: i18n.t('add_product_modal.productIdentifiers_error_invalidStructure'),
    productIdentifiers_error_missingSelectedData: i18n.t('add_product_modal.productIdentifiers_error_missingSelectedData'),
    productIdentifiers_error_missingToggleHandler: i18n.t('add_product_modal.productIdentifiers_error_missingToggleHandler'),
    productIdentifiers_error_missingCreateHandler: i18n.t('add_product_modal.productIdentifiers_error_missingCreateHandler'),
    productIdentifiers_emptyState: i18n.t('add_product_modal.productIdentifiers_emptyState'),

    iconPickerErrorDataMissing: i18n.t('add_product_modal.iconPickerErrorDataMissing'),
    iconPickerErrorhandlerMissing: i18n.t('add_product_modal.iconPickerErrorhandlerMissing'),
    iconPickerErrorInvalidStructure: i18n.t('add_product_modal.iconPickerErrorInvalidStructure'),
    iconPickerAriaLabel: i18n.t('add_product_modal.iconPickerAriaLabel'),

    productImageUploaderDropzoneMessageDefault: i18n.t('add_product_modal.productImageUploaderDropzoneMessageDefault'),
    productImageUploaderDropzoneSubMessagePattern: i18n.t('add_product_modal.productImageUploaderDropzoneSubMessagePattern'), // Pattern for variable

    // Error Messages
    productImageUploaderErrorFileTooLarge: i18n.t('add_product_modal.productImageUploaderErrorFileTooLarge'), // Pattern
    productImageUploaderErrorInvalidFileType: i18n.t('add_product_modal.productImageUploaderErrorInvalidFileType'),
    productImageUploaderErrorFileNotAccepted: i18n.t('add_product_modal.productImageUploaderErrorFileNotAccepted'),
    productImageUploaderErrorReadingFile: i18n.t('add_product_modal.productImageUploaderErrorReadingFile'),
    productImageUploaderErrorInvalidImageData: i18n.t('add_product_modal.productImageUploaderErrorInvalidImageData'),
    productImageUploaderErrorCouldNotSaveCrop: i18n.t('add_product_modal.productImageUploaderErrorCouldNotSaveCrop'),
    productImageUploaderErrorFailedToProcess: i18n.t('add_product_modal.productImageUploaderErrorFailedToProcess'),
    productImageUploaderErrorSavingGeneric: i18n.t('add_product_modal.productImageUploaderErrorSavingGeneric'), // Pattern
    productImageUploaderErrorSavingDefault: i18n.t('add_product_modal.productImageUploaderErrorSavingDefault'), // Fallback for the generic saving error's dynamic part
    productImageUploaderErrorCouldNotLoadProductImage: i18n.t('add_product_modal.productImageUploaderErrorCouldNotLoadProductImage'),
    productImageUploaderErrorCanvasToBlobFailed: i18n.t('add_product_modal.productImageUploaderErrorCanvasToBlobFailed'), // User-friendlier version if needed

    // UI Text (buttons, labels, alt text, status)
    productImageUploaderStatusPreparing: i18n.t('add_product_modal.productImageUploaderStatusPreparing'),
    productImageUploaderCropAreaAriaLabel: i18n.t('add_product_modal.productImageUploaderCropAreaAriaLabel'),
    productImageUploaderCropImageAlt: i18n.t('add_product_modal.productImageUploaderCropImageAlt'),
    productImageUploaderButtonConfirm: i18n.t('venue_management.confirm'),
    productImageUploaderButtonSaving: i18n.t('add_product_modal.productImageUploaderButtonSaving'),
    productImageUploaderButtonCancel: i18n.t('venue_management.cancel'),
    productImageUploaderFinalImageAlt: i18n.t('add_product_modal.productImageUploaderFinalImageAlt'),
    productImageUploaderButtonChange: i18n.t('add_product_modal.productImageUploaderButtonChange'),
    productImageUploaderButtonRemove: i18n.t('add_product_modal.productImageUploaderButtonRemove'),
    productImageUploaderDropzoneAriaLabel: i18n.t('add_product_modal.productImageUploaderDropzoneAriaLabel'),

    // Default placeholder text for the textarea
    placeholder: i18n.t('add_product_modal.placeholder'),
    // Default label for accessibility (e.g., aria-label for the textarea)
    label: i18n.t('add_product_modal.label'),
    // Error message shown if the 'onSave' prop is missing
    errorMissingOnSave: i18n.t('add_product_modal.errorMissingOnSave'),
    // Title attribute for the error state when 'onSave' is missing
    errorMissingOnSaveTitle: i18n.t('add_product_modal.errorMissingOnSaveTitle'),
    // Suffix for character count when limit is exceeded (e.g., "10 over")
    charCountOverLimitSuffix: i18n.t('add_product_modal.charCountOverLimitSuffix'),
    // Prefix for the aria-label of the display mode button (e.g., "Edit Description...")
    ariaEditLabelPrefix: i18n.t('venue_management.edit'),
    // Infix for the aria-label of the display mode button (e.g., "... Current value: ...")
    ariaEditLabelInfix: i18n.t('add_product_modal.ariaEditLabelInfix'),
    // Text to use in aria-label when the current value is empty
    ariaEditLabelValueEmpty: i18n.t('add_product_modal.ariaEditLabelValueEmpty'),

    // Default placeholder text for the input field
    placeholder2: i18n.t('add_product_modal.placeholder2'),
    // Default accessible label for the input field
    label2: i18n.t('add_product_modal.productName'),
    // Suffix for character count indicating remaining characters (singular form)
    charCountRemainingSingular: i18n.t('add_product_modal.charCountRemainingSingular'),
    // Suffix for character count indicating remaining characters (plural form)
    charCountRemainingPlural: i18n.t('add_product_modal.charCountRemainingPlural'),
    // Prefix for the aria-label of the display mode button (e.g., "Edit Product Name...")
    ariaEditLabelPrefix2: i18n.t('venue_management.edit'),
    // Infix for the aria-label of the display mode button (e.g., "... Current value: ...")
    ariaEditLabelInfix2: i18n.t('add_product_modal.ariaEditLabelInfix'),
    // Warning message logged to console if selection range cannot be set
    warnCannotSetSelection: i18n.t('add_product_modal.warnCannotSetSelection'),

    // AttributeGroupBuilder specific texts
    attributeGroup_error_invalidGroupData: i18n.t('add_product_modal.attributeGroup_error_invalidGroupData'),
    attributeGroup_error_missingGroupIndex: i18n.t('add_product_modal.attributeGroup_error_missingGroupIndex'),
    attributeGroup_error_missingHandler: i18n.t('add_product_modal.attributeGroup_error_missingHandler'), // Placeholder for handlerName

    attributeGroup_groupNameLabel: i18n.t('add_product_modal.attributeGroup_groupNameLabel'),
    attributeGroup_groupNamePlaceholder: i18n.t('add_product_modal.attributeGroup_groupNamePlaceholder'),
    attributeGroup_groupName_ariaLabel: i18n.t('add_product_modal.attributeGroup_groupName_ariaLabel'), // Placeholder
    attributeGroup_groupName_srLabel: i18n.t('add_product_modal.attributeGroup_groupName_srLabel'), // Placeholder

    attributeGroup_typeLabel: i18n.t('add_product_modal.attributeGroup_typeLabel'),
    attributeGroup_type_singleSelectLabel: i18n.t('add_product_modal.attributeGroup_type_singleSelectLabel'),
    attributeGroup_type_multiSelectLabel: i18n.t('add_product_modal.attributeGroup_type_multiSelectLabel'),
    attributeGroup_type_ariaLabel: i18n.t('add_product_modal.attributeGroup_type_ariaLabel'), // Placeholder

    attributeGroup_requiredLabel: i18n.t('add_product_modal.attributeGroup_requiredLabel'),
    attributeGroup_required_ariaLabel: i18n.t('add_product_modal.attributeGroup_required_ariaLabel'), // Placeholder

    attributeGroup_removeGroupButton_ariaLabel: i18n.t('add_product_modal.attributeGroup_removeGroupButton_ariaLabel'), // Placeholder
    attributeGroup_removeGroupButton_mobileText: i18n.t('add_product_modal.attributeGroup_removeGroupButton_mobileText'),

    attributeGroup_optionsForGroupTitle: i18n.t('add_product_modal.attributeGroup_optionsForGroupTitle'), // Placeholder
    attributeGroup_optionsForThisGroupTitle: i18n.t('add_product_modal.attributeGroup_optionsForThisGroupTitle'), // Fallback

    attributeGroup_addOptionButton: i18n.t('add_product_modal.attributeGroup_addOptionButton'),

    // Currency symbols (example, can be expanded)
    currencySymbol_USD: i18n.t('venue_management.currencySymbol'),
    currencySymbol_EUR: i18n.t('add_product_modal.currencySymbol_EUR'),

    // CreateNewIngredientModal specific texts
    createNewIngredientModal_title: i18n.t('add_product_modal.createNewIngredientModal_title'),
    createNewIngredientModal_close_ariaLabel: i18n.t('add_product_modal.common_closeModal_ariaLabel'), // Re-using common_closeModal_ariaLabel is also an option if it's identical

    createNewIngredientModal_itemNameLabel: i18n.t('add_product_modal.createNewIngredientModal_itemNameLabel'),
    createNewIngredientModal_itemNamePlaceholder: i18n.t('add_product_modal.createNewIngredientModal_itemNamePlaceholder'),

    createNewIngredientModal_measurementTypeLabel: i18n.t('add_product_modal.createNewIngredientModal_measurementTypeLabel'),
    createNewIngredientModal_measurementTypePlaceholder: i18n.t('add_product_modal.createNewIngredientModal_measurementTypePlaceholder'),
    createNewIngredientModal_measurementType_mass: i18n.t('add_product_modal.createNewIngredientModal_measurementType_mass'),
    createNewIngredientModal_measurementType_volume: i18n.t('add_product_modal.createNewIngredientModal_measurementType_volume'),
    createNewIngredientModal_measurementType_pieces: i18n.t('add_product_modal.createNewIngredientModal_measurementType_pieces'),

    createNewIngredientModal_defaultUnitLabel: i18n.t('add_product_modal.createNewIngredientModal_defaultUnitLabel'),
    createNewIngredientModal_defaultUnitPlaceholder: i18n.t('add_product_modal.createNewIngredientModal_defaultUnitPlaceholder'),

    createNewIngredientModal_costPerBaseUnitLabel: i18n.t('add_product_modal.createNewIngredientModal_costPerBaseUnitLabel'), // Placeholder for baseUnit
    createNewIngredientModal_costPerBaseUnitPlaceholder_USD: i18n.t('add_product_modal.createNewIngredientModal_costPerBaseUnitPlaceholder_USD'), // Example, could be generic or currency specific
    createNewIngredientModal_costPerBaseUnitPlaceholder_EUR: i18n.t('add_product_modal.createNewIngredientModal_costPerBaseUnitPlaceholder_EUR'),
    createNewIngredientModal_costPerBaseUnitHelpText: i18n.t('add_product_modal.createNewIngredientModal_costPerBaseUnitHelpText'), // Placeholder for baseUnit

    createNewIngredientModal_error_nameRequired: i18n.t('add_product_modal.createNewIngredientModal_error_nameRequired'),
    createNewIngredientModal_error_nameExists: i18n.t('add_product_modal.createNewIngredientModal_error_nameExists'),
    createNewIngredientModal_error_measurementTypeRequired: i18n.t('add_product_modal.createNewIngredientModal_error_measurementTypeRequired'),
    createNewIngredientModal_error_defaultUnitRequired: i18n.t('add_product_modal.createNewIngredientModal_error_defaultUnitRequired'),
    createNewIngredientModal_error_costRequired: i18n.t('add_product_modal.createNewIngredientModal_error_costRequired'),
    createNewIngredientModal_error_creationFailed: i18n.t('add_product_modal.createNewIngredientModal_error_creationFailed'),

    createNewIngredientModal_button_cancel: i18n.t('venue_management.cancel'), // Re-using common_cancel is an option
    createNewIngredientModal_button_createItem: i18n.t('add_product_modal.createNewIngredientModal_button_createItem'),
    createNewIngredientModal_button_creating: i18n.t('add_product_modal.createNewIngredientModal_button_creating'),

    // General Modal Errors (if not already present)
    modalError_criticalHandlersMissing: i18n.t('add_product_modal.modalError_criticalHandlersMissing'),
    modalError_inventoryDataMissing: i18n.t('add_product_modal.modalError_inventoryDataMissing'),

    // --- New keys for RecipeBuilder ---
    recipeBuilderTitle: i18n.t('add_product_modal.recipeBuilderTitle'),
    recipeBuilderSubtitle: i18n.t('add_product_modal.recipeBuilderSubtitle'),
    recipeBuilderEstCostPrefix: i18n.t('add_product_modal.recipeBuilderEstCostPrefix'),
    recipeBuilderEmptyTitle: i18n.t('add_product_modal.recipeBuilderEmptyTitle'),
    recipeBuilderEmptySubtitle: i18n.t('add_product_modal.recipeBuilderEmptySubtitle'),
    recipeBuilderAddFirstButton: i18n.t('add_product_modal.recipeBuilderAddFirstButton'),
    recipeBuilderAddAnotherButton: i18n.t('add_product_modal.recipeBuilderAddAnotherButton'),
    recipeBuilderErrorMisconfigured: i18n.t('add_product_modal.recipeBuilderErrorMisconfigured'),

    recipeComponentRow: {
        // Unit options
        unitSelectIngredientFirst: i18n.t('add_product_modal.recipeComponentRow.unitSelectIngredientFirst'),

        // Console messages (placeholders like {itemName} will be replaced in code)
        warnCostCalculation: i18n.t('add_product_modal.recipeComponentRow.warnCostCalculation'),
        errorInvalidNewItem: i18n.t('add_product_modal.recipeComponentRow.errorInvalidNewItem'),
        devErrorInvalidComponentProp: i18n.t('add_product_modal.recipeComponentRow.devErrorInvalidComponentProp'),
        devErrorInvalidIndexProp: i18n.t('add_product_modal.recipeComponentRow.devErrorInvalidIndexProp'),

        // Ingredient Search InputField
        ingredientLabel: i18n.t('add_product_modal.recipeComponentRow.ingredientLabel'),
        ingredientPlaceholder: i18n.t('add_product_modal.recipeComponentRow.ingredientPlaceholder'),
        ingredientSrLabelPrefix: i18n.t('add_product_modal.recipeComponentRow.ingredientSrLabelPrefix'), // for sr-only label
        ingredientSrLabelItemInfix: i18n.t('add_product_modal.recipeComponentRow.ingredientSrLabelItemInfix'),        // for sr-only label, e.g., "Item 1"

        // Suggestions List
        suggestionCreateNewPrefix: i18n.t('add_product_modal.recipeComponentRow.suggestionCreateNewPrefix'),
        suggestionNoMatch: i18n.t('add_product_modal.recipeComponentRow.suggestionNoMatch'),
        suggestionNoIngredients: i18n.t('add_product_modal.recipeComponentRow.suggestionNoIngredients'),
        suggestionExactMatch: i18n.t('add_product_modal.recipeComponentRow.suggestionExactMatch'),

        // Quantity InputField
        quantityLabel: i18n.t('add_product_modal.recipeComponentRow.quantityLabel'),
        quantityPlaceholder: i18n.t('add_product_modal.recipeComponentRow.quantityPlaceholder'),
        quantityAriaLabelPrefix: i18n.t('add_product_modal.recipeComponentRow.quantityAriaLabelPrefix'),

        // Unit Dropdown
        unitLabel: i18n.t('add_product_modal.recipeComponentRow.unitLabel'),
        unitSelectPlaceholder: i18n.t('add_product_modal.recipeComponentRow.unitSelectPlaceholder'),
        unitAriaLabelPrefix: i18n.t('add_product_modal.recipeComponentRow.unitAriaLabelPrefix'),

        // Estimated Cost
        estimatedCostLabel: i18n.t('add_product_modal.recipeComponentRow.estimatedCostLabel'),
        estimatedCostNA: i18n.t('add_product_modal.recipeComponentRow.estimatedCostNA'),

        // Remove Button
        removeButtonAriaLabelPrefix: i18n.t('add_product_modal.recipeComponentRow.removeButtonAriaLabelPrefix'),
        removeButtonTextSmallScreen: i18n.t('add_product_modal.recipeComponentRow.removeButtonTextSmallScreen')
    },

    // AppliedDiscountRow specific texts
    appliedDiscountRow_defaultDescription: i18n.t('add_product_modal.appliedDiscountRow_defaultDescription'),
    appliedDiscountRow_percentageLabel: i18n.t('add_product_modal.appliedDiscountRow_percentageLabel'),
    appliedDiscountRow_percentagePlaceholder: i18n.t('add_product_modal.appliedDiscountRow_percentagePlaceholder'),
    appliedDiscountRow_remove_ariaLabel: i18n.t('add_product_modal.appliedDiscountRow_remove_ariaLabel'), // Placeholder for discountName
    appliedDiscountRow_remove_title: i18n.t('add_product_modal.appliedDiscountRow_remove_title'), // Placeholder for discountName

    appliedDiscountsManagerNoDiscountsPrimary: i18n.t('add_product_modal.appliedDiscountsManagerNoDiscountsPrimary'),
    appliedDiscountsManagerNoDiscountsSecondary: i18n.t('add_product_modal.appliedDiscountsManagerNoDiscountsSecondary'),
    appliedDiscountsManagerListHeaderPattern: i18n.t('add_product_modal.appliedDiscountsManagerListHeaderPattern'), // Pattern for count}


    createDiscountCodeModal: {
        // Modal Title
        title: i18n.t('add_product_modal.createDiscountCodeModal.title'),
        // Close Button
        closeButtonLabel: i18n.t('add_product_modal.createDiscountCodeModal.closeButtonLabel'),
        closeButtonTitle: i18n.t('venue_management.close'),

        // InputField Labels
        codeNameLabel: i18n.t('add_product_modal.createDiscountCodeModal.codeNameLabel'),
        descriptionLabel: i18n.t('add_product_modal.createDiscountCodeModal.descriptionLabel'),
        discountTypeLabel: i18n.t('add_product_modal.createDiscountCodeModal.discountTypeLabel'),
        discountValueLabelPercentage: i18n.t('add_product_modal.createDiscountCodeModal.discountValueLabelPercentage'),
        discountValueLabelAmount: i18n.t('add_product_modal.createDiscountCodeModal.discountValueLabelAmount'), // For fixed amount type

        // InputField Placeholders
        codeNamePlaceholder: i18n.t('add_product_modal.createDiscountCodeModal.codeNamePlaceholder'),
        descriptionPlaceholder: i18n.t('add_product_modal.createDiscountCodeModal.descriptionPlaceholder'),

        // InputField Help Texts
        codeNameHelpText: i18n.t('add_product_modal.createDiscountCodeModal.codeNameHelpText'), // Placeholders {minLength} and {maxLength}
        descriptionHelpText: i18n.t('add_product_modal.createDiscountCodeModal.descriptionHelpText'),
        discountTypeHelpText: i18n.t('add_product_modal.createDiscountCodeModal.discountTypeHelpText'),
        discountValueHelpTextPercentage: i18n.t('add_product_modal.createDiscountCodeModal.discountValueHelpTextPercentage'),
        discountValueHelpTextAmount: i18n.t('add_product_modal.createDiscountCodeModal.discountValueHelpTextAmount'), // For fixed amount type

        // Dropdown Options (Labels for default types)
        discountTypePercentageLabel: i18n.t('add_product_modal.createDiscountCodeModal.discountTypePercentageLabel'),
        // Add other types if needed, e.g.:
        // discountTypeFixedAmountProductLabel: "Fixed Amount Off Product ({currencySymbol})", // Placeholder {currencySymbol}

        // Validation Error Messages
        errorRequired: i18n.t('add_product_modal.createDiscountCodeModal.errorRequired'), // Generic required, {fieldName} can be replaced
        errorCodeNameMinLength: i18n.t('add_product_modal.createDiscountCodeModal.errorCodeNameMinLength'),
        errorCodeNameMaxLength: i18n.t('add_product_modal.createDiscountCodeModal.errorCodeNameMaxLength'),
        errorCodeNameExists: i18n.t('add_product_modal.createDiscountCodeModal.errorCodeNameExists'),
        errorDescriptionMaxLength: i18n.t('add_product_modal.createDiscountCodeModal.errorDescriptionMaxLength'),
        errorDiscountValueRequired: i18n.t('add_product_modal.createDiscountCodeModal.errorDiscountValueRequired'),
        errorDiscountValuePositive: i18n.t('add_product_modal.createDiscountCodeModal.errorDiscountValuePositive'),
        errorDiscountPercentageMax: i18n.t('add_product_modal.createDiscountCodeModal.errorDiscountPercentageMax'),
        errorFormGeneric: i18n.t('register.components.formStep.errors.unexpectedError'), // Generic error on submission failure

        // Button Texts
        cancelButtonText: i18n.t('venue_management.cancel'),
        createButtonText: i18n.t('add_product_modal.createDiscountCodeModal.createButtonText'),
        creatingButtonText: i18n.t('add_product_modal.createNewIngredientModal_button_creating'), // With loading spinner

        // Console Messages
        errorConsoleFailedCreate: i18n.t('add_product_modal.createDiscountCodeModal.errorConsoleFailedCreate')
    },

    // DiscountCodeSelector specific texts
    discountCodeSelector_label: i18n.t('add_product_modal.discountCodeSelector_label'),
    discountCodeSelector_placeholder: i18n.t('add_product_modal.discountCodeSelector_placeholder'),
    discountCodeSelector_noMatch: i18n.t('add_product_modal.discountCodeSelector_noMatch'),
    discountCodeSelector_createNew: i18n.t('add_product_modal.discountCodeSelector_createNew'),


    // --- New keys for Step1_BasicData ---
    step1SubtitlePlaceholder: i18n.t('add_product_modal.step1SubtitlePlaceholder'),
    step1SubtitleLabel: i18n.t('add_product_modal.step1SubtitleLabel'), // Used as aria-label for ProductDescriptionInput
    step1CategoryPlaceholder: i18n.t('add_product_modal.categoryDropdownPlaceholder'), // Placeholder for CategoryDropdown (can override CategoryDropdown's default if desired here)
    step1TagsLabel: i18n.t('add_product_modal.step1TagsLabel'), // Label for ProductIdentifiers
    step1ImageErrorDefault: i18n.t('add_product_modal.step1ImageErrorDefault'), // Default error message for image if not a string

    step2EditableAttributes: {
        // Section Title
        sectionTitle: i18n.t('add_product_modal.step2EditableAttributes.sectionTitle'),

        // Add Group Button
        addButtonText: i18n.t('add_product_modal.step2EditableAttributes.addButtonText'),

        // Informational Text
        infoText: i18n.t('add_product_modal.step2EditableAttributes.infoText'),

        // Empty State
        emptyStateTitle: i18n.t('add_product_modal.step2EditableAttributes.emptyStateTitle'),
        emptyStateDescription: i18n.t('add_product_modal.step2EditableAttributes.emptyStateDescription')
    },

    // Step3_Ingredients specific texts
    step3_loadingInventory: i18n.t('add_product_modal.step3_loadingInventory'),
    step3_errorLoadingInventory: i18n.t('add_product_modal.step3_errorLoadingInventory'), // Placeholder
    step3_title: i18n.t('add_product_modal.step3_title'),
    step3_subtitle: i18n.t('add_product_modal.step3_subtitle'),
    step3_productTypeLabel: i18n.t('add_product_modal.step3_productTypeLabel'),
    step3_productType_madeInHouse: i18n.t('add_product_modal.step3_productType_madeInHouse'),
    step3_productType_resoldItem: i18n.t('add_product_modal.step3_productType_resoldItem'),
    step3_recipeYieldsLabel: i18n.t('add_product_modal.step3_recipeYieldsLabel'),
    step3_recipeYieldsPlaceholder: i18n.t('add_product_modal.step3_recipeYieldsPlaceholder'),
    step3_recipeYieldsHelpText: i18n.t('add_product_modal.step3_recipeYieldsHelpText'),
    step3_resoldItemInfo: i18n.t('add_product_modal.step3_resoldItemInfo'),
    step3_error_failedToCreateIngredient: i18n.t('add_product_modal.createNewIngredientModal_error_creationFailed'), // General fallback


    // --- New keys for Step4_Pricing ---
    step4LoadingTaxRates: i18n.t('add_product_modal.step4LoadingTaxRates'),
    step4ErrorLoadingTaxRatesPattern: i18n.t('add_product_modal.step4ErrorLoadingTaxRatesPattern'),
    step4MainTitle: i18n.t('add_product_modal.step4MainTitle'),
    step4MainSubtitle: i18n.t('add_product_modal.step4MainSubtitle'),

    step4CostBreakdownTitle: i18n.t('add_product_modal.step4CostBreakdownTitle'),
    step4EstCostIngredientsLabel: i18n.t('add_product_modal.step4EstCostIngredientsLabel'),
    step4LaborOverheadLabelPattern: i18n.t('add_product_modal.step4LaborOverheadLabelPattern'),
    step4PurchaseCostLabelPattern: i18n.t('add_product_modal.step4PurchaseCostLabelPattern'),
    step4LaborOverheadHelpText: i18n.t('add_product_modal.step4LaborOverheadHelpText'),
    step4PurchaseCostHelpText: i18n.t('add_product_modal.step4PurchaseCostHelpText'),
    step4TotalCalculatedCostLabel: i18n.t('add_product_modal.step4TotalCalculatedCostLabel'),

    step4SellingPriceProfitTitle: i18n.t('add_product_modal.step4SellingPriceProfitTitle'),
    step4SellingPriceLabelPattern: i18n.t('add_product_modal.step4SellingPriceLabelPattern'),
    step4WarningPriceBelowCost: i18n.t('add_product_modal.step4WarningPriceBelowCost'),
    step4CalcProfitMarginLabel: i18n.t('add_product_modal.step4CalcProfitMarginLabel'),
    step4NotApplicable: i18n.t('add_product_modal.recipeComponentRow.estimatedCostNA'),
    step4ProfitPerUnitLabelPattern: i18n.t('add_product_modal.step4ProfitPerUnitLabelPattern'),

    step4TaxationTitle: i18n.t('add_product_modal.step4TaxationTitle'),
    step4TaxRateLabel: i18n.t('add_product_modal.step4TaxRateLabel'),
    step4TaxRateNoTaxOption: i18n.t('add_product_modal.step4TaxRateNoTaxOption'),
    step4TaxAmountLabelPattern: i18n.t('add_product_modal.step4TaxAmountLabelPattern'),
    step4FinalPriceLabel: i18n.t('add_product_modal.step4FinalPriceLabel'),

    step4SaveAsTemplateLabel: i18n.t('add_product_modal.step4SaveAsTemplateLabel'),
    step4SaveAsTemplateHelpText: i18n.t('add_product_modal.step4SaveAsTemplateHelpText'),

    step5DiscountsExtras: {
        // Loading/Error states for master codes
        loadingMasterCodes: i18n.t('add_product_modal.step5DiscountsExtras.loadingMasterCodes'),
        errorLoadingMasterCodesPrefix: i18n.t('add_product_modal.step5DiscountsExtras.errorLoadingMasterCodesPrefix'), // Suffix will be error.message

        // Section Titles and Descriptions
        mainTitle: i18n.t('add_product_modal.step5DiscountsExtras.mainTitle'),
        mainDescription: i18n.t('add_product_modal.step5DiscountsExtras.mainDescription'),
        productSpecificDiscountsTitle: i18n.t('add_product_modal.step5DiscountsExtras.productSpecificDiscountsTitle'),
        additionalNotesTitle: i18n.t('add_product_modal.step5DiscountsExtras.additionalNotesTitle'),

        // InputField for Additional Notes
        additionalNotesLabel: i18n.t('add_product_modal.step5DiscountsExtras.additionalNotesLabel'),
        additionalNotesPlaceholder: i18n.t('add_product_modal.step5DiscountsExtras.additionalNotesPlaceholder'),

        // Console Warnings/Errors
        warnDiscountAlreadyApplied: i18n.t('add_product_modal.step5DiscountsExtras.warnDiscountAlreadyApplied'),
        errorMissingBusinessId: i18n.t('add_product_modal.step5DiscountsExtras.errorMissingBusinessId'),
        errorBusinessContextMissing: i18n.t('add_product_modal.step5DiscountsExtras.errorBusinessContextMissing'), // For UI if thrown
        errorFailedCreateMasterCode: i18n.t('add_product_modal.step5DiscountsExtras.errorFailedCreateMasterCode'),

        errorLoadingMasterCodesTitle: i18n.t('add_product_modal.step5DiscountsExtras.errorLoadingMasterCodesTitle')
    },


    // AddProductModal specific texts
    addProductModal_noTemplateFound: i18n.t('add_product_modal.addProductModal_noTemplateFound'),
    addProductModal_errorFetchingTemplate: i18n.t('add_product_modal.addProductModal_errorFetchingTemplate'),
    addProductModal_error_activeBusinessMissing: i18n.t('add_product_modal.addProductModal_error_activeBusinessMissing'),
    addProductModal_error_failedToCreateCategory: i18n.t('add_product_modal.addProductModal_error_failedToCreateCategory'),
    addProductModal_error_categoryCreationFailed: i18n.t('add_product_modal.addProductModal_error_categoryCreationFailed'), // Placeholder
    addProductModal_error_failedToCreateTag: i18n.t('add_product_modal.addProductModal_error_failedToCreateTag'),
    addProductModal_error_tagCreationFailed: i18n.t('add_product_modal.addProductModal_error_tagCreationFailed'), // Placeholder

    addProductModal_toast_imageUploaded: i18n.t('add_product_modal.addProductModal_toast_imageUploaded'),
    addProductModal_toast_imageUploadFailed: i18n.t('add_product_modal.addProductModal_toast_imageUploadFailed'), // Placeholder
    addProductModal_toast_imageRemoved: i18n.t('add_product_modal.addProductModal_toast_imageRemoved'),
    addProductModal_toast_imageRemoveFailed: i18n.t('add_product_modal.addProductModal_toast_imageRemoveFailed'), // Placeholder
    addProductModal_toast_productUpdated: i18n.t('add_product_modal.addProductModal_toast_productUpdated'),
    addProductModal_toast_productAdded: i18n.t('add_product_modal.addProductModal_toast_productAdded'),
    addProductModal_error_failedToUpdateProduct: i18n.t('add_product_modal.addProductModal_error_failedToUpdateProduct'),
    addProductModal_error_failedToAddProduct: i18n.t('add_product_modal.addProductModal_error_failedToAddProduct'),

    addProductModal_loading_productSetup: i18n.t('add_product_modal.addProductModal_loading_productSetup'),
    addProductModal_loading_initialDataError: i18n.t('add_product_modal.addProductModal_loading_initialDataError'), // Placeholder
    addProductModal_loading_initialDataError_fallback: i18n.t('add_product_modal.productImageUploaderErrorSavingDefault'),

    addProductModal_header_placeholderEdit: i18n.t('add_product_modal.addProductModal_header_placeholderEdit'),
    addProductModal_header_placeholderNew: i18n.t('add_product_modal.addProductModal_header_placeholderNew'),

    addProductModal_loading_preparingForm: i18n.t('add_product_modal.addProductModal_loading_preparingForm'),
    addProductModal_loading_fetchingSettings: i18n.t('add_product_modal.addProductModal_loading_fetchingSettings'),
    addProductModal_error_couldNotLoadData: i18n.t('add_product_modal.addProductModal_error_couldNotLoadData'),
    addProductModal_error_tryClosingModal: i18n.t('add_product_modal.addProductModal_error_tryClosingModal'),
    addProductModal_button_close: i18n.t('venue_management.close'), // Re-use common_cancel if applicable and same text

    addProductModal_error_invalidStep: i18n.t('add_product_modal.addProductModal_error_invalidStep'),

    // Might need a generic API error parsing fallback if not already covered
    addProductModal_error_apiErrorDefault: i18n.t('add_product_modal.addProductModal_error_apiErrorDefault'), // Example


    // --- New keys for ModalFooter ---
    modalFooterBackButton: i18n.t('register.components.formStep.buttons.back'),
    modalFooterContinueButton: i18n.t('register.components.formStep.buttons.continue'),
    modalFooterValidatingButton: i18n.t('add_product_modal.modalFooterValidatingButton'),
    modalFooterCreatingButton: i18n.t('add_product_modal.createNewIngredientModal_button_creating'),
    modalFooterCreateProductButton: i18n.t('add_product_modal.modalFooterCreateProductButton'),

    modalHeader: {
        // ProductTitleInput placeholders
        titlePlaceholderDefault: i18n.t('add_product_modal.productName'),
        titlePlaceholderEditMode: i18n.t('add_product_modal.addProductModal_header_placeholderEdit'),

        // ProductTitleInput labels
        labelDefault: i18n.t('add_product_modal.productName'),
        labelEditModePrefix: i18n.t('add_product_modal.modalHeader.labelEditModePrefix'),
        labelEditModeFallbackProduct: i18n.t('add_product_modal.productImageUploaderFinalImageAlt'), // Used if productName is empty in edit mode, e.g., "Editing: Product"

        // Close button aria-label
        closeButtonAriaLabel: i18n.t('add_product_modal.common_closeModal_ariaLabel')
    },


    // ModalStepIndicator specific texts
    modalStepIndicator_nav_ariaLabel: i18n.t('add_product_modal.modalStepIndicator_nav_ariaLabel'),
    // Step Names (used in STEPS_CONFIG and aria-labels)
    modalStepIndicator_step_basics: i18n.t('add_product_modal.modalStepIndicator_step_basics'),
    modalStepIndicator_step_attributes: i18n.t('add_product_modal.modalStepIndicator_step_attributes'),
    modalStepIndicator_step_ingredients: i18n.t('add_product_modal.modalStepIndicator_step_ingredients'),
    modalStepIndicator_step_pricing: i18n.t('add_product_modal.modalStepIndicator_step_pricing'),
    modalStepIndicator_step_discounts: i18n.t('add_product_modal.modalStepIndicator_step_discounts'),
    // Aria-labels for buttons
    modalStepIndicator_aria_currentStep: i18n.t('add_product_modal.modalStepIndicator_aria_currentStep'), // Placeholder for stepName
    modalStepIndicator_aria_goToStep: i18n.t('add_product_modal.modalStepIndicator_aria_goToStep'), // Placeholder for stepName
    // Note: The plain step name is used as a fallback aria-label for pending steps.

    // --- Updated/New keys for ProductFormStep (flattened from previous internal structure) ---
    productFormStepButtonBack: i18n.t('register.components.formStep.buttons.back'),
    productFormStepButtonContinue: i18n.t('register.components.formStep.buttons.continue'),
    productFormStepButtonSubmitProduct: i18n.t('add_product_modal.modalFooterCreateProductButton'),
    productFormStepButtonSubmitting: i18n.t('add_product_modal.createNewIngredientModal_button_creating'), // Used when creating a new product
    productFormStepButtonValidating: i18n.t('add_product_modal.modalFooterValidatingButton'),
    productFormStepButtonSaving: i18n.t('add_product_modal.productImageUploaderButtonSaving'), // Used when isEditMode is true and submitting
    productFormStepButtonSaveChanges: i18n.t('add_product_modal.productFormStepButtonSaveChanges'), // Used when isEditMode is true, not submitting


    productFormStepErrorSummaryTitle: i18n.t('add_product_modal.productFormStepErrorSummaryTitle'),
    productFormStepErrorSummaryMore: i18n.t('add_product_modal.productFormStepErrorSummaryMore'),
};

export default scriptLines;