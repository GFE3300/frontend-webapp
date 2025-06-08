/**
 * @auto-managed
 *
 * This file is managed by the I18N script. Any manual changes to this file will be
 * overwritten during the next synchronization. To add or modify text, please
 * update the original string in this file and then run the 'sync' command.
 *
 * @last-synced 2025-06-08 15:28:16 UTC
 */

import i18n from '../../../i18n';

// This file will be initialized. The i18n manager script will later add the i18n calls.
export const scriptLines_menu_view = {
    userpage: {
        // FullPageError component strings
        errorTitle: i18n.t('products_table.productsTable.productsTableBody.error.title'),
        errorTitleFallback: i18n.t('venue_management.error'),
        errorMessageFallback: i18n.t('menu_view.menu_view.userpage.errorMessageFallback'),
        retryButton: i18n.t('payments.components.paymentCancelPage.buttons.tryAgain'),

        // FullPageSpinner component strings
        loadingActiveOrder: i18n.t('menu_view.menu_view.userpage.loadingActiveOrder'),
        loadingInvalidLink: i18n.t('menu_view.menu_view.userpage.loadingInvalidLink'),
        loadingVenueInfo: i18n.t('menu_view.menu_view.userpage.loadingVenueInfo'),

        // Toast messages
        toastWelcome: i18n.t('menu_view.menu_view.userpage.toastWelcome'),
        toastSettingsSaved: i18n.t('menu_view.menu_view.userpage.toastSettingsSaved'),
        toastOrderPlaced: i18n.t('menu_view.menu_view.userpage.toastOrderPlaced'),

        // UserInteractionModal and error messages
        modalPlacingOrderTitle: i18n.t('menu_view.menu_view.userpage.modalPlacingOrderTitle'),
        modalPlacingOrderMessage: i18n.t('menu_view.menu_view.userpage.modalPlacingOrderMessage'),
        modalOrderFailedTitle: i18n.t('menu_view.menu_view.userpage.modalOrderFailedTitle'),
        errorOrderFailed: i18n.t('menu_view.menu_view.userpage.errorOrderFailed'),
        errorInvalidLinkOrNotFound: i18n.t('menu_view.menu_view.userpage.errorInvalidLinkOrNotFound'),
    },
    orderTracker: {
        // Status configurations
        pendingConfirmationTitle: i18n.t('menu_view.menu_view.orderTracker.pendingConfirmationTitle'),
        pendingConfirmationMessage: i18n.t('menu_view.menu_view.orderTracker.pendingConfirmationMessage'),
        confirmedTitle: i18n.t('menu_view.menu_view.orderTracker.confirmedTitle'),
        confirmedMessage: i18n.t('menu_view.menu_view.orderTracker.confirmedMessage'),
        preparingTitle: i18n.t('menu_view.menu_view.orderTracker.preparingTitle'),
        preparingMessage: i18n.t('menu_view.menu_view.orderTracker.preparingMessage'),
        servedTitle: i18n.t('menu_view.menu_view.orderTracker.servedTitle'),
        servedMessage: i18n.t('menu_view.menu_view.orderTracker.servedMessage'),
        readyForPickupTitle: i18n.t('menu_view.menu_view.orderTracker.readyForPickupTitle'),
        readyForPickupMessage: i18n.t('menu_view.menu_view.orderTracker.readyForPickupMessage'),
        completedTitle: i18n.t('menu_view.menu_view.orderTracker.completedTitle'),
        completedMessage: i18n.t('menu_view.menu_view.orderTracker.completedMessage'),
        cancelledByBusinessTitle: i18n.t('menu_view.menu_view.orderTracker.cancelledByBusinessTitle'),
        cancelledByBusinessMessage: i18n.t('menu_view.menu_view.orderTracker.cancelledByBusinessMessage'),
        cancelledByCustomerTitle: i18n.t('menu_view.menu_view.orderTracker.cancelledByBusinessTitle'),
        cancelledByCustomerMessage: i18n.t('menu_view.menu_view.orderTracker.cancelledByCustomerMessage'),
        defaultTitle: i18n.t('menu_view.menu_view.orderTracker.defaultTitle'),
        defaultMessage: i18n.t('menu_view.menu_view.orderTracker.defaultMessage'),

        // UI elements
        loadingMessage: i18n.t('menu_view.menu_view.orderTracker.loadingMessage'),
        errorTitle: i18n.t('menu_view.menu_view.orderTracker.errorTitle'),
        errorMessageDefault: i18n.t('menu_view.menu_view.orderTracker.errorMessageDefault'),
        backToMenuButton: i18n.t('menu_view.menu_view.orderTracker.backToMenuButton'),
        pickupCodeLabel: i18n.t('menu_view.menu_view.orderTracker.pickupCodeLabel'),
        timerLabel: i18n.t('menu_view.menu_view.orderTracker.timerLabel'),
        placeAnotherOrderButton: i18n.t('menu_view.menu_view.orderTracker.placeAnotherOrderButton'),
    },
    snakesGame: {
        title: i18n.t('menu_view.menu_view.snakesGame.title'),
        highScoreLabel: i18n.t('menu_view.menu_view.snakesGame.highScoreLabel'),
        newGameHint: i18n.t('menu_view.menu_view.snakesGame.newGameHint'),
        scoreLabel: i18n.t('menu_view.menu_view.snakesGame.scoreLabel'),
        pauseHint: i18n.t('menu_view.menu_view.snakesGame.pauseHint'),
        pauseHintInstructions: i18n.t('menu_view.menu_view.snakesGame.pauseHintInstructions'),

        gameOver: {
            title: i18n.t('menu_view.menu_view.snakesGame.gameOver.title'),
            finalScoreLabel: i18n.t('menu_view.menu_view.snakesGame.gameOver.finalScoreLabel'),
            highScoreBeaten: i18n.t('menu_view.menu_view.snakesGame.gameOver.highScoreBeaten'),
            continueHint: i18n.t('menu_view.menu_view.snakesGame.gameOver.continueHint'),
        },

        paused: {
            title: i18n.t('menu_view.menu_view.snakesGame.paused.title'),
            continueHint: i18n.t('menu_view.menu_view.snakesGame.gameOver.continueHint'),
        }
    },
    bottomNav: {
        menuLabel: i18n.t('menu_view.menu_view.bottomNav.menuLabel'),
        myInfoLabel: i18n.t('menu_view.menu_view.bottomNav.myInfoLabel'),
    },
    categoryFilterBar: {
        allCategoryName: i18n.t('menu_view.menu_view.categoryFilterBar.allCategoryName'),
        loadingAriaLabel: i18n.t('menu_view.menu_view.categoryFilterBar.loadingAriaLabel'),
        loadingCategoriesAriaLabel: i18n.t('menu_view.menu_view.categoryFilterBar.loadingCategoriesAriaLabel'),
        filterByCategoryAriaLabel: i18n.t('products_table.productsTable.productsToolbar.filters.categoryAriaLabel'),
        categoryFiltersAriaLabel: i18n.t('menu_view.menu_view.categoryFilterBar.categoryFiltersAriaLabel'),
        errorLoading: i18n.t('menu_view.menu_view.categoryFilterBar.errorLoading'),
        noCategoriesAvailable: i18n.t('menu_view.menu_view.categoryFilterBar.noCategoriesAvailable'),
    },
    menuDisplayLayout: {
        loadingCuisine: i18n.t('menu_view.menu_view.menuDisplayLayout.loadingCuisine'),
        refreshingMenu: i18n.t('menu_view.menu_view.menuDisplayLayout.refreshingMenu'),
        errorTitle: i18n.t('menu_view.menu_view.menuDisplayLayout.errorTitle'),
        errorMessageDefault: i18n.t('menu_view.menu_view.menuDisplayLayout.errorMessageDefault'),
        errorSuggestion: i18n.t('menu_view.menu_view.menuDisplayLayout.errorSuggestion'),
        noResultsTitle: i18n.t('menu_view.menu_view.menuDisplayLayout.noResultsTitle'),
        menuEmptyTitle: i18n.t('menu_view.menu_view.menuDisplayLayout.menuEmptyTitle'),
        noResultsMessage: i18n.t('menu_view.menu_view.menuDisplayLayout.noResultsMessage'),
        menuEmptyMessage: i18n.t('menu_view.menu_view.menuDisplayLayout.menuEmptyMessage'),
        noResultsSuggestion: i18n.t('menu_view.menu_view.menuDisplayLayout.noResultsSuggestion'),
        menuEmptySuggestion: i18n.t('menu_view.menu_view.menuDisplayLayout.menuEmptySuggestion'),
        clearFiltersButton: i18n.t('menu_view.menu_view.menuDisplayLayout.clearFiltersButton'),
        uncategorized: i18n.t('menu_view.menu_view.menuDisplayLayout.uncategorized'),
        otherItemsCategory: i18n.t('menu_view.menu_view.menuDisplayLayout.otherItemsCategory'),
    },
    menuItemCard: {
        unnamedProduct: i18n.t('menu_view.menu_view.menuItemCard.unnamedProduct'),
        unavailable: i18n.t('menu_view.menu_view.menuItemCard.unavailable'),
        viewAction: i18n.t('venue_management.view'),
        addAction: i18n.t('venue_management.add'),
        tagsAriaLabel: i18n.t('menu_view.menu_view.menuItemCard.tagsAriaLabel'),
        moreTagsAriaLabel: i18n.t('menu_view.menu_view.menuItemCard.moreTagsAriaLabel'),
        moreTagsTitle: i18n.t('menu_view.menu_view.menuItemCard.moreTagsTitle'),
        ariaLabel: {
            base: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.base'),
            unavailable: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.unavailable'),
            hasOptions: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.hasOptions'),
            noOptions: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.noOptions'),
        },
        ariaLabelPrice: {
            original: i18n.t('menu_view.menu_view.menuItemCard.ariaLabelPrice.original'),
            discounted: i18n.t('menu_view.menu_view.menuItemCard.ariaLabelPrice.discounted'),
            standard: i18n.t('menu_view.menu_view.menuItemCard.ariaLabelPrice.standard'),
        }
    },
    menuSearchBar: {
        placeholder: i18n.t('menu_view.menu_view.menuSearchBar.placeholder'),
        searchAriaLabel: i18n.t('menu_view.menu_view.menuSearchBar.searchAriaLabel'),
        inputAriaLabel: i18n.t('menu_view.menu_view.menuSearchBar.inputAriaLabel'),
        clearInputAriaLabel: i18n.t('menu_view.menu_view.menuSearchBar.clearInputAriaLabel'),
        suggestionsAriaLabel: i18n.t('menu_view.menu_view.menuSearchBar.suggestionsAriaLabel'),
        loadingSuggestions: i18n.t('menu_view.menu_view.menuSearchBar.loadingSuggestions'),
        errorLoading: i18n.t('menu_view.menu_view.menuSearchBar.errorLoading'),
        noSuggestions: i18n.t('menu_view.menu_view.menuSearchBar.noSuggestions'),
        searchAllPrompt: i18n.t('menu_view.menu_view.menuSearchBar.searchAllPrompt'),
        suggestionTypeProduct: i18n.t('menu_view.menu_view.menuSearchBar.suggestionTypeProduct'),
        suggestionTypeFallback: i18n.t('menu_view.menu_view.menuSearchBar.suggestionTypeFallback'),
    },
    orderItem: {
        unnamedItem: i18n.t('menu_view.menu_view.orderItem.unnamedItem'),
        unitPrice: i18n.t('menu_view.menu_view.orderItem.unitPrice'),
        decreaseQuantityAriaLabel: i18n.t('menu_view.menu_view.orderItem.decreaseQuantityAriaLabel'),
        increaseQuantityAriaLabel: i18n.t('menu_view.menu_view.orderItem.increaseQuantityAriaLabel'),
        ariaLabel: {
            base: i18n.t('menu_view.menu_view.orderItem.ariaLabel.base'),
            discounted: i18n.t('menu_view.menu_view.orderItem.ariaLabel.discounted'),
        },
        ariaLabelPrice: {
            original: i18n.t('menu_view.menu_view.menuItemCard.ariaLabelPrice.original'),
            final: i18n.t('menu_view.menu_view.orderItem.ariaLabelPrice.final'),
        },
    },
    orderSummaryPanel: {
        titlePreview: i18n.t('menu_view.menu_view.orderSummaryPanel.titlePreview'),
        titleYourOrder: i18n.t('menu_view.menu_view.orderSummaryPanel.titleYourOrder'),
        tableLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.tableLabel'),
        forLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.forLabel'),
        guestCountLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.guestCountLabel'),
        guestSingular: i18n.t('menu_view.menu_view.orderSummaryPanel.guestSingular'),
        guestPlural: i18n.t('menu_view.menu_view.orderSummaryPanel.guestPlural'),
        guestFallback: i18n.t('menu_view.menu_view.orderSummaryPanel.guestFallback'),
        emptyOrderTitle: i18n.t('menu_view.menu_view.orderSummaryPanel.emptyOrderTitle'),
        emptyOrderMessageSidebar: i18n.t('menu_view.menu_view.orderSummaryPanel.emptyOrderMessageSidebar'),
        emptyOrderMessageDrawer: i18n.t('menu_view.menu_view.orderSummaryPanel.emptyOrderMessageDrawer'),
        emptyOrderDefaultMessage: i18n.t('menu_view.menu_view.orderSummaryPanel.emptyOrderDefaultMessage'),
        browseMenuButton: i18n.t('menu_view.menu_view.orderSummaryPanel.browseMenuButton'),
        promoCodeLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.promoCodeLabel'),
        promoCodePlaceholder: i18n.t('menu_view.menu_view.orderSummaryPanel.promoCodePlaceholder'),
        removePromoButton: i18n.t('add_product_modal.productImageUploaderButtonRemove'),
        applyPromoButton: i18n.t('menu_view.menu_view.orderSummaryPanel.applyPromoButton'),
        promoFeedback: {
            validating: i18n.t('add_product_modal.modalFooterValidatingButton'),
            inputEmpty: i18n.t('menu_view.menu_view.orderSummaryPanel.promoFeedback.inputEmpty'),
            missingBusinessContext: i18n.t('menu_view.menu_view.orderSummaryPanel.promoFeedback.missingBusinessContext'),
            applied: i18n.t('menu_view.menu_view.orderSummaryPanel.promoFeedback.applied'),
            noApplicableDiscount: i18n.t('menu_view.menu_view.orderSummaryPanel.promoFeedback.noApplicableDiscount'),
        },
        orderNotesLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.orderNotesLabel'),
        orderNotesPreviewLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.orderNotesPreviewLabel'),
        orderNotesPlaceholder: i18n.t('menu_view.menu_view.orderSummaryPanel.orderNotesPlaceholder'),
        subtotalLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.subtotalLabel'),
        discountLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.discountLabel'),
        totalLabel: i18n.t('venue_management.total'),
        placeOrderButton: i18n.t('menu_view.menu_view.orderSummaryPanel.placeOrderButton'),
        processingButton: i18n.t('payments.components.planSelection.buttons.processing'),
    },
    productDetailModal: {
        configureItemTitle: i18n.t('menu_view.menu_view.productDetailModal.configureItemTitle'),
        closeAriaLabel: i18n.t('menu_view.menu_view.productDetailModal.closeAriaLabel'),
        descriptionLabel: i18n.t('add_product_modal.label'),
        unavailableMessage: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.unavailable'),
        requiredLabel: i18n.t('menu_view.menu_view.productDetailModal.requiredLabel'),
        selectionNeededError: i18n.t('menu_view.menu_view.productDetailModal.selectionNeededError'),
        totalLabel: i18n.t('menu_view.menu_view.productDetailModal.totalLabel'),
        addToOrderButton: i18n.t('menu_view.menu_view.productDetailModal.addToOrderButton'),
        unavailableButton: i18n.t('menu_view.menu_view.menuItemCard.unavailable'),
        quantityLabel: i18n.t('menu_view.menu_view.productDetailModal.quantityLabel'),
    },
    setupStage: {
        welcomeTitle: i18n.t('menu_view.menu_view.setupStage.welcomeTitle'),
        atTableLabel: i18n.t('menu_view.menu_view.setupStage.atTableLabel'),
        setupPrompt: i18n.t('menu_view.menu_view.setupStage.setupPrompt'),
        yourNameLabel: i18n.t('menu_view.menu_view.setupStage.yourNameLabel'),
        yourNamePlaceholder: i18n.t('menu_view.menu_view.setupStage.yourNamePlaceholder'),
        nameRequiredError: i18n.t('menu_view.menu_view.setupStage.nameRequiredError'),
        peopleLabel: i18n.t('menu_view.menu_view.setupStage.peopleLabel'),
        startOrderingButton: i18n.t('menu_view.menu_view.setupStage.startOrderingButton'),
        startingButton: i18n.t('menu_view.menu_view.setupStage.startingButton'),
        footerMessage: i18n.t('menu_view.menu_view.setupStage.footerMessage'),
    },
    tagFilterPills: {
        loadingAriaLabel: i18n.t('menu_view.menu_view.tagFilterPills.loadingAriaLabel'),
        loadingTagsAriaLabel: i18n.t('menu_view.menu_view.tagFilterPills.loadingTagsAriaLabel'),
        filterByTagsAriaLabel: i18n.t('menu_view.menu_view.tagFilterPills.filterByTagsAriaLabel'),
        tagFiltersAriaLabel: i18n.t('menu_view.menu_view.tagFilterPills.tagFiltersAriaLabel'),
        errorLoading: i18n.t('menu_view.menu_view.tagFilterPills.errorLoading'),
    },
    guestSettingsModal: {
        title: i18n.t('menu_view.menu_view.guestSettingsModal.title'),
        closeAriaLabel: i18n.t('menu_view.menu_view.guestSettingsModal.closeAriaLabel'),
        orderInfoLegend: i18n.t('menu_view.menu_view.guestSettingsModal.orderInfoLegend'),
        nameLabel: i18n.t('menu_view.menu_view.guestSettingsModal.nameLabel'),
        nameRequiredError: i18n.t('menu_view.menu_view.guestSettingsModal.nameRequiredError'),
        emailLabel: i18n.t('menu_view.menu_view.guestSettingsModal.emailLabel'),
        guestCountLabel: i18n.t('menu_view.menu_view.guestSettingsModal.guestCountLabel'),
        uiPrefsLegend: i18n.t('menu_view.menu_view.guestSettingsModal.uiPrefsLegend'),
        languageLabel: i18n.t('menu_view.menu_view.guestSettingsModal.languageLabel'),
        themeLabel: i18n.t('menu_view.menu_view.guestSettingsModal.themeLabel'),
        cancelButton: i18n.t('venue_management.cancel'),
        saveButton: i18n.t('add_product_modal.productFormStepButtonSaveChanges'),
    },
    orderInteractionController: {
        desktopEmptyMessage: i18n.t('menu_view.menu_view.orderInteractionController.desktopEmptyMessage'),
        peekBar: {
            title: i18n.t('menu_view.menu_view.orderInteractionController.peekBar.title'),
            item_one: i18n.t('menu_view.menu_view.orderInteractionController.peekBar.item_one'),
            item_other: i18n.t('menu_view.menu_view.orderInteractionController.peekBar.item_other'),
        },
        drawerTitle: i18n.t('menu_view.menu_view.orderSummaryPanel.titleYourOrder'),
        closeDrawerAriaLabel: i18n.t('menu_view.menu_view.orderInteractionController.closeDrawerAriaLabel'),
    },
    userPageHeader: {
        defaultBusinessName: i18n.t('menu_view.menu_view.userPageHeader.defaultBusinessName'),
        logoPlaceholderAriaLabel: i18n.t('menu_view.menu_view.userPageHeader.logoPlaceholderAriaLabel'),
        logoAlt: i18n.t('menu_view.menu_view.userPageHeader.logoAlt'),
        tableLabel: i18n.t('menu_view.menu_view.userPageHeader.tableLabel'),
        guestLabel: i18n.t('menu_view.menu_view.userPageHeader.guestLabel'),
        guestFallback: i18n.t('menu_view.menu_view.orderSummaryPanel.guestFallback'),
        settingsAriaLabel: i18n.t('menu_view.menu_view.userPageHeader.settingsAriaLabel'),
        settingsTitle: i18n.t('menu_view.menu_view.guestSettingsModal.title'),
    },
    orderManagement: {
        itemAddedToast: i18n.t('menu_view.menu_view.orderManagement.itemAddedToast'),
        itemFallbackName: i18n.t('add_product_modal.recipeComponentRow.ingredientSrLabelItemInfix'),
        itemDiscountsApplied: i18n.t('menu_view.menu_view.orderManagement.itemDiscountsApplied'),
        orderDiscountPercentage: i18n.t('menu_view.menu_view.orderManagement.orderDiscountPercentage'),
        orderDiscountFixed: i18n.t('menu_view.menu_view.orderManagement.orderDiscountFixed'),
        itemDiscountPercentage: i18n.t('menu_view.menu_view.orderManagement.itemDiscountPercentage'),
        itemDiscountFixed: i18n.t('menu_view.menu_view.orderManagement.itemDiscountFixed'),
    },
    orderTracking: {
        errorMissingId: i18n.t('menu_view.menu_view.orderTracking.errorMissingId'),
    },
    venueContextManager: {
        defaultGuestName: i18n.t('menu_view.menu_view.orderSummaryPanel.guestFallback'),
        updateWarning: i18n.t('menu_view.menu_view.venueContextManager.updateWarning'),
    },
    productUtils: { 
        discountFallbackName: i18n.t('menu_view.menu_view.productUtils.discountFallbackName'),
    }
};

/**
 * A simple string interpolation helper.
 * The I18N manager does not handle this; it must be done in the component.
 * @param {string} str - The string template with {{placeholders}}.
 * @param {object} params - An object with keys matching the placeholders.
 * @returns {string} The interpolated string.
 */
export const interpolate = (str, params) => {
    if (!str || typeof str !== 'string') return '';
    let newStr = str;
    if (params) {
        for (const key in params) {
            newStr = newStr.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), params[key]);
        }
    }
    return newStr;
};