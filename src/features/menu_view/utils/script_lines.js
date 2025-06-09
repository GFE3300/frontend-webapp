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
        errorTitle: i18n.t('products_table.productsTable.productsTableBody.error.title'), // "Oops! Something went wrong."
        errorTitleFallback: i18n.t('venue_management.error'), // "Error"
        errorMessageFallback: i18n.t('menu_view.menu_view.userpage.errorMessageFallback'), // "We encountered an issue."
        retryButton: i18n.t('payments.components.paymentCancelPage.buttons.tryAgain'), // "Try Again"
        loadingActiveOrder: i18n.t('menu_view.menu_view.userpage.loadingActiveOrder'), // "Checking for active orders..."
        loadingInvalidLink: i18n.t('menu_view.menu_view.userpage.loadingInvalidLink'), // "Invalid link..."
        loadingVenueInfo: i18n.t('menu_view.menu_view.userpage.loadingVenueInfo'), // "Loading Restaurant Info..."
        toastWelcome: i18n.t('menu_view.menu_view.userpage.toastWelcome'), // "Welcome, {{userName}}! Ready to order."
        toastSettingsSaved: i18n.t('menu_view.menu_view.userpage.toastSettingsSaved'), // "Your settings have been saved!"
        toastOrderPlaced: i18n.t('menu_view.menu_view.userpage.toastOrderPlaced'), // "Order #{{orderId}}... Placed!"
        modalPlacingOrderTitle: i18n.t('menu_view.menu_view.userpage.modalPlacingOrderTitle'), // "Placing Order..."
        modalPlacingOrderMessage: i18n.t('menu_view.menu_view.userpage.modalPlacingOrderMessage'), // "Please wait while we submit your order."
        modalOrderFailedTitle: i18n.t('menu_view.menu_view.userpage.modalOrderFailedTitle'), // "Order Failed"
        errorOrderFailed: i18n.t('menu_view.menu_view.userpage.errorOrderFailed'), // "Failed to place order. Please try again or alert staff."
        errorInvalidLinkOrNotFound: i18n.t('menu_view.menu_view.userpage.errorInvalidLinkOrNotFound'), // "This link is invalid or the restaurant is not found."
    },
    orderTracker: {
        // Status configurations
        pendingConfirmationTitle: i18n.t('menu_view.menu_view.orderTracker.pendingConfirmationTitle'), // "Waiting for Confirmation"
        pendingConfirmationMessage: i18n.t('menu_view.menu_view.orderTracker.pendingConfirmationMessage'), // "The kitchen will confirm your order shortly."
        confirmedTitle: i18n.t('menu_view.menu_view.orderTracker.confirmedTitle'), // "Order Confirmed!"
        confirmedMessage: i18n.t('menu_view.menu_view.orderTracker.confirmedMessage'), // "We've received your order and will start preparing it soon."
        preparingTitle: i18n.t('menu_view.menu_view.orderTracker.preparingTitle'), // "Your Order is Being Prepared"
        preparingMessage: i18n.t('menu_view.menu_view.orderTracker.preparingMessage'), // "Our chefs are working their magic. It won't be long!"
        servedTitle: i18n.t('menu_view.menu_view.orderTracker.servedTitle'), // "Your Order is on its Way!"
        servedMessage: i18n.t('menu_view.menu_view.orderTracker.servedMessage'), // "Look out for our staff bringing your items."
        readyForPickupTitle: i18n.t('menu_view.menu_view.orderTracker.readyForPickupTitle'), // "Ready for Pickup!"
        readyForPickupMessage: i18n.t('menu_view.menu_view.orderTracker.readyForPickupMessage'), // "Please show your pickup code at the counter."
        completedTitle: i18n.t('menu_view.menu_view.orderTracker.completedTitle'), // "Order Complete!"
        completedMessage: i18n.t('menu_view.menu_view.orderTracker.completedMessage'), // "Thank you for your order. Enjoy!"
        cancelledByBusinessTitle: i18n.t('menu_view.menu_view.orderTracker.cancelledByBusinessTitle'), // "Order Cancelled"
        cancelledByBusinessMessage: i18n.t('menu_view.menu_view.orderTracker.cancelledByBusinessMessage'), // "There was an issue with the order. Please see staff for details."
        cancelledByCustomerTitle: i18n.t('menu_view.menu_view.orderTracker.cancelledByBusinessTitle'), // "Order Cancelled"
        cancelledByCustomerMessage: i18n.t('menu_view.menu_view.orderTracker.cancelledByCustomerMessage'), // "Your order has been successfully cancelled."
        defaultTitle: i18n.t('menu_view.menu_view.orderTracker.defaultTitle'), // "Order Status Unknown"
        defaultMessage: i18n.t('menu_view.menu_view.orderTracker.defaultMessage'), // "We're currently updating the order status."
        loadingMessage: i18n.t('menu_view.menu_view.orderTracker.loadingMessage'), // "Loading your order status..."
        errorTitle: i18n.t('menu_view.menu_view.orderTracker.errorTitle'), // "Could Not Load Order"
        errorMessageDefault: i18n.t('menu_view.menu_view.orderTracker.errorMessageDefault'), // "An unknown error occurred. Please show this screen to a staff member."
        backToMenuButton: i18n.t('menu_view.menu_view.orderTracker.backToMenuButton'), // "Back to Menu"
        pickupCodeLabel: i18n.t('menu_view.menu_view.orderTracker.pickupCodeLabel'), // "Pickup Code"
        timerLabel: i18n.t('menu_view.menu_view.orderTracker.timerLabel'), // "Time in current state: "
        placeAnotherOrderButton: i18n.t('menu_view.menu_view.orderTracker.placeAnotherOrderButton'), // "Place Another Order"
    },
    snakesGame: {
        title: i18n.t('menu_view.menu_view.snakesGame.title'), // "Snake Game"
        highScoreLabel: i18n.t('menu_view.menu_view.snakesGame.highScoreLabel'), // "High Score: "
        newGameHint: i18n.t('menu_view.menu_view.snakesGame.newGameHint'), // "Click anywhere to start"
        scoreLabel: i18n.t('menu_view.menu_view.snakesGame.scoreLabel'), // "Score"
        pauseHint: i18n.t('menu_view.menu_view.snakesGame.pauseHint'), // "PAUSE:"
        pauseHintInstructions: i18n.t('menu_view.menu_view.snakesGame.pauseHintInstructions'), // "Click Anywhere or Press"

        gameOver: {
            title: i18n.t('menu_view.menu_view.snakesGame.gameOver.title'), // "Game Over"
            finalScoreLabel: i18n.t('menu_view.menu_view.snakesGame.gameOver.finalScoreLabel'), // "Your Final Score: "
            highScoreBeaten: i18n.t('menu_view.menu_view.snakesGame.gameOver.highScoreBeaten'), // "\ud83c\udfc6 You beat the high score! \ud83c\udfc6"
            continueHint: i18n.t('menu_view.menu_view.snakesGame.gameOver.continueHint'), // "(Click anywhere to continue)"
        },

        paused: {
            title: i18n.t('menu_view.menu_view.snakesGame.paused.title'), // "Paused"
            continueHint: i18n.t('menu_view.menu_view.snakesGame.gameOver.continueHint'), // "(Click anywhere to continue)"
        }
    },
    bottomNav: {
        menuLabel: i18n.t('menu_view.menu_view.bottomNav.menuLabel'), // "Menu"
        myInfoLabel: i18n.t('menu_view.menu_view.bottomNav.myInfoLabel'), // "My Info"
    },
    categoryFilterBar: {
        allCategoryName: i18n.t('menu_view.menu_view.categoryFilterBar.allCategoryName'), // "All"
        loadingAriaLabel: i18n.t('menu_view.menu_view.categoryFilterBar.loadingAriaLabel'), // "Loading category filters"
        loadingCategoriesAriaLabel: i18n.t('menu_view.menu_view.categoryFilterBar.loadingCategoriesAriaLabel'), // "Loading categories..."
        filterByCategoryAriaLabel: i18n.t('products_table.productsTable.productsToolbar.filters.categoryAriaLabel'), // "Filter by category"
        categoryFiltersAriaLabel: i18n.t('menu_view.menu_view.categoryFilterBar.categoryFiltersAriaLabel'), // "Category filters"
        errorLoading: i18n.t('menu_view.menu_view.categoryFilterBar.errorLoading'), // "Could not load categories."
        noCategoriesAvailable: i18n.t('menu_view.menu_view.categoryFilterBar.noCategoriesAvailable'), // "No categories available."
    },
    menuDisplayLayout: {
        loadingCuisine: i18n.t('menu_view.menu_view.menuDisplayLayout.loadingCuisine'), // "Loading Cuisine..."
        refreshingMenu: i18n.t('menu_view.menu_view.menuDisplayLayout.refreshingMenu'), // "Refreshing menu..."
        errorTitle: i18n.t('menu_view.menu_view.menuDisplayLayout.errorTitle'), // "Oops! Could not load menu."
        errorMessageDefault: i18n.t('menu_view.menu_view.menuDisplayLayout.errorMessageDefault'), // "There was a problem fetching the menu items."
        errorSuggestion: i18n.t('menu_view.menu_view.menuDisplayLayout.errorSuggestion'), // "Please try again in a moment, or contact staff if the issue persists."
        noResultsTitle: i18n.t('menu_view.menu_view.menuDisplayLayout.noResultsTitle'), // "No Results Found"
        menuEmptyTitle: i18n.t('menu_view.menu_view.menuDisplayLayout.menuEmptyTitle'), // "Menu Empty"
        noResultsMessage: i18n.t('menu_view.menu_view.menuDisplayLayout.noResultsMessage'), // "No menu items match your current selection."
        menuEmptyMessage: i18n.t('menu_view.menu_view.menuDisplayLayout.menuEmptyMessage'), // "The menu is currently empty."
        noResultsSuggestion: i18n.t('menu_view.menu_view.menuDisplayLayout.noResultsSuggestion'), // "Try adjusting your search or filters."
        menuEmptySuggestion: i18n.t('menu_view.menu_view.menuDisplayLayout.menuEmptySuggestion'), // "Please check back later or ask our staff for assistance."
        clearFiltersButton: i18n.t('menu_view.menu_view.menuDisplayLayout.clearFiltersButton'), // "Clear Filters & Search"
        uncategorized: i18n.t('menu_view.menu_view.menuDisplayLayout.uncategorized'), // "Uncategorized"
        otherItemsCategory: i18n.t('menu_view.menu_view.menuDisplayLayout.otherItemsCategory'), // "Other Items"
    },
    menuItemCard: {
        unnamedProduct: i18n.t('menu_view.menu_view.menuItemCard.unnamedProduct'), // "Unnamed Product"
        unavailable: i18n.t('menu_view.menu_view.menuItemCard.unavailable'), // "Unavailable"
        viewAction: i18n.t('venue_management.view'), // "View"
        addAction: i18n.t('venue_management.add'), // "Add"
        tagsAriaLabel: i18n.t('menu_view.menu_view.menuItemCard.tagsAriaLabel'), // "Product tags"
        moreTagsAriaLabel: i18n.t('menu_view.menu_view.menuItemCard.moreTagsAriaLabel'), // "and {{count}} more tags"
        moreTagsTitle: i18n.t('menu_view.menu_view.menuItemCard.moreTagsTitle'), // "+{{count}} more tags"
        ariaLabel: {
            base: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.base'), // "{{name}}, price {{price}}."
            unavailable: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.unavailable'), // "This item is currently unavailable."
            hasOptions: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.hasOptions'), // "Tap to view details and configure options."
            noOptions: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.noOptions'), // "Tap to add to order."
        },
        ariaLabelPrice: {
            original: i18n.t('menu_view.menu_view.menuItemCard.ariaLabelPrice.original'), // "Original price {{price}}"
            discounted: i18n.t('menu_view.menu_view.menuItemCard.ariaLabelPrice.discounted'), // "Discounted price {{price}}"
            standard: i18n.t('menu_view.menu_view.menuItemCard.ariaLabelPrice.standard'), // "Price {{price}}"
        }
    },
    menuSearchBar: {
        placeholder: i18n.t('menu_view.menu_view.menuSearchBar.placeholder'), // "Search menu..."
        searchAriaLabel: i18n.t('menu_view.menu_view.menuSearchBar.searchAriaLabel'), // "Menu search"
        inputAriaLabel: i18n.t('menu_view.menu_view.menuSearchBar.inputAriaLabel'), // "Search menu items, categories, or tags"
        clearInputAriaLabel: i18n.t('menu_view.menu_view.menuSearchBar.clearInputAriaLabel'), // "Clear search input"
        suggestionsAriaLabel: i18n.t('menu_view.menu_view.menuSearchBar.suggestionsAriaLabel'), // "Search results"
        loadingSuggestions: i18n.t('menu_view.menu_view.menuSearchBar.loadingSuggestions'), // "Searching..."
        errorLoading: i18n.t('menu_view.menu_view.menuSearchBar.errorLoading'), // "Error loading suggestions."
        noSuggestions: i18n.t('menu_view.menu_view.menuSearchBar.noSuggestions'), // "No suggestions for \"{{term}}\"."
        searchAllPrompt: i18n.t('menu_view.menu_view.menuSearchBar.searchAllPrompt'), // "Search all items for \"{{term}}\""
        suggestionTypeProduct: i18n.t('menu_view.menu_view.menuSearchBar.suggestionTypeProduct'), // "In: {{categoryName}}"
        suggestionTypeFallback: i18n.t('menu_view.menu_view.menuSearchBar.suggestionTypeFallback'), // "{{type}}"
    },
    orderItem: {
        unnamedItem: i18n.t('menu_view.menu_view.orderItem.unnamedItem'), // "Unnamed Item"
        unitPrice: i18n.t('menu_view.menu_view.orderItem.unitPrice'), // "/ unit"
        decreaseQuantityAriaLabel: i18n.t('menu_view.menu_view.orderItem.decreaseQuantityAriaLabel'), // "Decrease quantity of {{itemName}}"
        increaseQuantityAriaLabel: i18n.t('menu_view.menu_view.orderItem.increaseQuantityAriaLabel'), // "Increase quantity of {{itemName}}"
        ariaLabel: {
            base: i18n.t('menu_view.menu_view.orderItem.ariaLabel.base'), // "{{itemName}}, quantity {{quantity}}, final price {{finalPrice}}"
            discounted: i18n.t('menu_view.menu_view.orderItem.ariaLabel.discounted'), // " (discounted from {{originalPrice}}, {{discountDescription}})"
        },
        ariaLabelPrice: {
            original: i18n.t('menu_view.menu_view.menuItemCard.ariaLabelPrice.original'), // "Original price {{price}}"
            final: i18n.t('menu_view.menu_view.orderItem.ariaLabelPrice.final'), // "Current total price {{price}}"
        },
    },
    orderSummaryPanel: {
        titlePreview: i18n.t('menu_view.menu_view.orderSummaryPanel.titlePreview'), // "Order Preview"
        titleYourOrder: i18n.t('menu_view.menu_view.orderSummaryPanel.titleYourOrder'), // "Your Order"
        tableLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.tableLabel'), // "Table: {{tableNumber}}"
        forLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.forLabel'), // "For: {{userName}}"
        guestCountLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.guestCountLabel'), // " ({{count}} {{plural}})"
        guestSingular: i18n.t('menu_view.menu_view.orderSummaryPanel.guestSingular'), // "guest"
        guestPlural: i18n.t('menu_view.menu_view.orderSummaryPanel.guestPlural'), // "guests"
        guestFallback: i18n.t('menu_view.menu_view.orderSummaryPanel.guestFallback'), // "Guest"
        emptyOrderTitle: i18n.t('menu_view.menu_view.orderSummaryPanel.emptyOrderTitle'), // "Your Order is Empty"
        emptyOrderMessageSidebar: i18n.t('menu_view.menu_view.orderSummaryPanel.emptyOrderMessageSidebar'), // "Add items from the menu."
        emptyOrderMessageDrawer: i18n.t('menu_view.menu_view.orderSummaryPanel.emptyOrderMessageDrawer'), // "Tap 'Menu' to explore!"
        emptyOrderDefaultMessage: i18n.t('menu_view.menu_view.orderSummaryPanel.emptyOrderDefaultMessage'), // "Add items to get started."
        browseMenuButton: i18n.t('menu_view.menu_view.orderSummaryPanel.browseMenuButton'), // "Browse Menu"
        promoCodeLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.promoCodeLabel'), // "Promo Code"
        promoCodePlaceholder: i18n.t('menu_view.menu_view.orderSummaryPanel.promoCodePlaceholder'), // "Enter promo code"
        removePromoButton: i18n.t('add_product_modal.productImageUploaderButtonRemove'), // "Remove"
        applyPromoButton: i18n.t('menu_view.menu_view.orderSummaryPanel.applyPromoButton'), // "Apply"
        promoFeedback: {
            validating: i18n.t('add_product_modal.modalFooterValidatingButton'), // "Validating..."
            inputEmpty: i18n.t('menu_view.menu_view.orderSummaryPanel.promoFeedback.inputEmpty'), // "Please enter a promo code."
            missingBusinessContext: i18n.t('menu_view.menu_view.orderSummaryPanel.promoFeedback.missingBusinessContext'), // "Business information is missing."
            applied: i18n.t('menu_view.menu_view.orderSummaryPanel.promoFeedback.applied'), // "Discount applied!"
            noApplicableDiscount: i18n.t('menu_view.menu_view.orderSummaryPanel.promoFeedback.noApplicableDiscount'), // "Code is valid, but no applicable discount for current order."
        },
        orderNotesLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.orderNotesLabel'), // "Order Notes"
        orderNotesPreviewLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.orderNotesPreviewLabel'), // "(Preview)"
        orderNotesPlaceholder: i18n.t('menu_view.menu_view.orderSummaryPanel.orderNotesPlaceholder'), // "e.g., no onions, extra spicy..."
        subtotalLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.subtotalLabel'), // "Subtotal"
        discountLabel: i18n.t('menu_view.menu_view.orderSummaryPanel.discountLabel'), // "Discount ({{promoCode}})"
        totalLabel: i18n.t('venue_management.total'), // "Total"
        placeOrderButton: i18n.t('menu_view.menu_view.orderSummaryPanel.placeOrderButton'), // "Place Order"
        processingButton: i18n.t('payments.components.planSelection.buttons.processing'), // "Processing..."
    },
    productDetailModal: {
        configureItemTitle: i18n.t('menu_view.menu_view.productDetailModal.configureItemTitle'), // "Configure Item"
        closeAriaLabel: i18n.t('menu_view.menu_view.productDetailModal.closeAriaLabel'), // "Close product options"
        descriptionLabel: i18n.t('add_product_modal.label'), // "Description"
        unavailableMessage: i18n.t('menu_view.menu_view.menuItemCard.ariaLabel.unavailable'), // "This item is currently unavailable."
        requiredLabel: i18n.t('menu_view.menu_view.productDetailModal.requiredLabel'), // "(Required)"
        selectionNeededError: i18n.t('menu_view.menu_view.productDetailModal.selectionNeededError'), // "Please make a selection for {{groupName}}."
        totalLabel: i18n.t('menu_view.menu_view.productDetailModal.totalLabel'), // "Total:"
        addToOrderButton: i18n.t('menu_view.menu_view.productDetailModal.addToOrderButton'), // "Add {{quantity}} to Order"
        unavailableButton: i18n.t('menu_view.menu_view.menuItemCard.unavailable'), // "Unavailable"
        quantityLabel: i18n.t('menu_view.menu_view.productDetailModal.quantityLabel'), // "Item quantity"
    },
    setupStage: {
        welcomeTitle: i18n.t('menu_view.menu_view.setupStage.welcomeTitle'), // "Welcome!"
        atTableLabel: i18n.t('menu_view.menu_view.setupStage.atTableLabel'), // "You are at Table"
        setupPrompt: i18n.t('menu_view.menu_view.setupStage.setupPrompt'), // "Let's get you set up!"
        yourNameLabel: i18n.t('menu_view.menu_view.setupStage.yourNameLabel'), // "Your Name"
        yourNamePlaceholder: i18n.t('menu_view.menu_view.setupStage.yourNamePlaceholder'), // "e.g., Alex Smith"
        nameRequiredError: i18n.t('menu_view.menu_view.setupStage.nameRequiredError'), // "Please enter your name to continue."
        peopleLabel: i18n.t('menu_view.menu_view.setupStage.peopleLabel'), // "Number of people ordering"
        startOrderingButton: i18n.t('menu_view.menu_view.setupStage.startOrderingButton'), // "Start Ordering"
        startingButton: i18n.t('menu_view.menu_view.setupStage.startingButton'), // "Starting..."
        footerMessage: i18n.t('menu_view.menu_view.setupStage.footerMessage'), // "Enjoy your meal! If you need assistance, please alert our staff."
    },
    tagFilterPills: {
        loadingAriaLabel: i18n.t('menu_view.menu_view.tagFilterPills.loadingAriaLabel'), // "Loading tag filters"
        loadingTagsAriaLabel: i18n.t('menu_view.menu_view.tagFilterPills.loadingTagsAriaLabel'), // "Loading tags..."
        filterByTagsAriaLabel: i18n.t('menu_view.menu_view.tagFilterPills.filterByTagsAriaLabel'), // "Filter by tags"
        tagFiltersAriaLabel: i18n.t('menu_view.menu_view.tagFilterPills.tagFiltersAriaLabel'), // "Tag filters"
        errorLoading: i18n.t('menu_view.menu_view.tagFilterPills.errorLoading'), // "Could not load tags."
    },
    guestSettingsModal: {
        title: i18n.t('menu_view.menu_view.guestSettingsModal.title'), // "Guest Settings"
        closeAriaLabel: i18n.t('menu_view.menu_view.guestSettingsModal.closeAriaLabel'), // "Close settings"
        orderInfoLegend: i18n.t('menu_view.menu_view.guestSettingsModal.orderInfoLegend'), // "Order Information"
        nameLabel: i18n.t('menu_view.menu_view.guestSettingsModal.nameLabel'), // "Name for this Order"
        nameRequiredError: i18n.t('menu_view.menu_view.guestSettingsModal.nameRequiredError'), // "Please enter a name for the order."
        emailLabel: i18n.t('menu_view.menu_view.guestSettingsModal.emailLabel'), // "Email for Receipt (Optional)"
        guestCountLabel: i18n.t('menu_view.menu_view.guestSettingsModal.guestCountLabel'), // "Number of guests"
        uiPrefsLegend: i18n.t('menu_view.menu_view.guestSettingsModal.uiPrefsLegend'), // "UI Preferences"
        languageLabel: i18n.t('menu_view.menu_view.guestSettingsModal.languageLabel'), // "Language"
        themeLabel: i18n.t('menu_view.menu_view.guestSettingsModal.themeLabel'), // "Theme"
        cancelButton: i18n.t('venue_management.cancel'), // "Cancel"
        saveButton: i18n.t('add_product_modal.productFormStepButtonSaveChanges'), // "Save Changes"
    },
    orderInteractionController: {
        desktopEmptyMessage: i18n.t('menu_view.menu_view.orderInteractionController.desktopEmptyMessage'), // "Your order summary will appear here once you add items."
        peekBar: {
            title: i18n.t('menu_view.menu_view.orderInteractionController.peekBar.title'), // "View Your Order"
            item_one: i18n.t('menu_view.menu_view.orderInteractionController.peekBar.item_one'), // "({{count}} item)"
            item_other: i18n.t('menu_view.menu_view.orderInteractionController.peekBar.item_other'), // "({{count}} items)"
        },
        drawerTitle: i18n.t('menu_view.menu_view.orderSummaryPanel.titleYourOrder'), // "Your Order"
        closeDrawerAriaLabel: i18n.t('menu_view.menu_view.orderInteractionController.closeDrawerAriaLabel'), // "Close order summary"
    },
    userPageHeader: {
        defaultBusinessName: i18n.t('menu_view.menu_view.userPageHeader.defaultBusinessName'), // "Restaurant Menu"
        logoPlaceholderAriaLabel: i18n.t('menu_view.menu_view.userPageHeader.logoPlaceholderAriaLabel'), // "{{businessName}} logo placeholder"
        logoAlt: i18n.t('menu_view.menu_view.userPageHeader.logoAlt'), // "{{businessName}} logo"
        tableLabel: i18n.t('menu_view.menu_view.userPageHeader.tableLabel'), // "Table:"
        guestLabel: i18n.t('menu_view.menu_view.userPageHeader.guestLabel'), // "For:"
        guestFallback: i18n.t('menu_view.menu_view.orderSummaryPanel.guestFallback'), // "Guest"
        settingsAriaLabel: i18n.t('menu_view.menu_view.userPageHeader.settingsAriaLabel'), // "Open guest settings"
        settingsTitle: i18n.t('menu_view.menu_view.guestSettingsModal.title'), // "Guest Settings"
    },
    orderManagement: {
        itemAddedToast: i18n.t('menu_view.menu_view.orderManagement.itemAddedToast'), // "\"{{itemName}}\" added to order!"
        itemFallbackName: i18n.t('add_product_modal.recipeComponentRow.ingredientSrLabelItemInfix'), // "Item"
        itemDiscountsApplied: i18n.t('menu_view.menu_view.orderManagement.itemDiscountsApplied'), // "Item Discounts Applied"
        orderDiscountPercentage: i18n.t('menu_view.menu_view.orderManagement.orderDiscountPercentage'), // "{{value}}% Off Order"
        orderDiscountFixed: i18n.t('menu_view.menu_view.orderManagement.orderDiscountFixed'), // "{{value}} Off Order"
        itemDiscountPercentage: i18n.t('menu_view.menu_view.orderManagement.itemDiscountPercentage'), // "{{value}}% off"
        itemDiscountFixed: i18n.t('menu_view.menu_view.orderManagement.itemDiscountFixed'), // "{{value}} off"
    },
    orderTracking: {
        errorMissingId: i18n.t('menu_view.menu_view.orderTracking.errorMissingId'), // "Order ID is required to track status."
    },
    venueContextManager: {
        defaultGuestName: i18n.t('menu_view.menu_view.orderSummaryPanel.guestFallback'), // "Guest"
        updateWarning: i18n.t('menu_view.menu_view.venueContextManager.updateWarning'), // "updateVenueUserDetails called before context was initialized."
    },
    productUtils: { 
        discountFallbackName: i18n.t('menu_view.menu_view.productUtils.discountFallbackName'), // "Discount"
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