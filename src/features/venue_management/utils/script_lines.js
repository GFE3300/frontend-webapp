/**
 * @auto-managed
 *
 * This file is managed by the I18N script. Any manual changes to this file will be
 * overwritten during the next synchronization. To add or modify text, please
 * update the original string in this file and then run the 'sync' command.
 *
 * @last-synced 2025-06-07 11:26:40 UTC
 */

import i18n from '../../../i18n';

import { t } from '../../../i18n';

// src/features/venue_management/utils/script_lines.js
export const scriptLines = {
    // --- Global Settings ---
    currencySymbol: i18n.t('venue_management.currencySymbol'), // "$"
    currencyFormat: i18n.t('venue_management.currencyFormat'), // e.g., $10.99 // "{symbol}{amount}"
    currencyCode: i18n.t('register.steps.step4Preferences.options.currencies.0.value'), // Example // "USD"
    decimalSeparator: i18n.t('venue_management.decimalSeparator'), // "."
    thousandSeparator: i18n.t('venue_management.thousandSeparator'), // ","
    decimals: 2,

    // --- Common / General ---
    error: i18n.t('venue_management.error'), // "Error"
    info: i18n.t('venue_management.info'), // "Info"
    warning: i18n.t('venue_management.warning'), // "Warning"
    success: i18n.t('venue_management.success'), // "Success"
    loading: i18n.t('venue_management.loading'), // "Loading..."
    tryAgain: i18n.t('payments.components.paymentCancelPage.buttons.tryAgain'), // "Try Again"
    save: i18n.t('venue_management.save'), // "Save"
    cancel: i18n.t('venue_management.cancel'), // "Cancel"
    confirm: i18n.t('venue_management.confirm'), // "Confirm"
    close: i18n.t('venue_management.close'), // "Close"
    yes: i18n.t('venue_management.yes'), // "Yes"
    no: i18n.t('venue_management.no'), // "No"
    next: i18n.t('venue_management.next'), // "Next"
    back: i18n.t('register.components.formStep.buttons.back'), // "Back"
    finish: i18n.t('venue_management.finish'), // "Finish"
    submit: i18n.t('venue_management.submit'), // "Submit"
    search: i18n.t('venue_management.search'), // "Search"
    actions: i18n.t('venue_management.actions'), // "Actions"
    edit: i18n.t('venue_management.edit'), // "Edit"
    delete: i18n.t('venue_management.delete'), // "Delete"
    view: i18n.t('venue_management.view'), // "View"
    add: i18n.t('venue_management.add'), // "Add"
    requiredField: i18n.t('venue_management.requiredField'), // "This field is required."
    noDataAvailable: i18n.t('venue_management.noDataAvailable'), // "No data available."
    page: i18n.t('venue_management.page'), // "Page"
    of: i18n.t('register.components.formStep.progress.of'), // "of"
    items: i18n.t('venue_management.items'), // "Items"
    total: i18n.t('venue_management.total'), // "Total"

    // --- Venue Management Feature ---
    venueManagement: {
        liveOrderDashboard: {
            title: i18n.t('venue_management.venueManagement.liveOrderDashboard.title'), // "Bakery Orders"
            hideSidebar: i18n.t('venue_management.venueManagement.liveOrderDashboard.hideSidebar'), // "Hide Sidebar"
            showSidebar: i18n.t('venue_management.venueManagement.liveOrderDashboard.showSidebar'), // "Show Sidebar"
            liveStatusTitle: i18n.t('venue_management.venueManagement.liveOrderDashboard.liveStatusTitle'), // "Live Table Status (Refreshes {timeAgo})"
            newOrdersLabel: i18n.t('venue_management.venueManagement.liveOrderDashboard.newOrdersLabel'), // "New Orders: {count}"
            activeViewedLabel: i18n.t('venue_management.venueManagement.liveOrderDashboard.activeViewedLabel'), // "Active Viewed: {count}"
            designLayoutButton: i18n.t('venue_management.venueManagement.liveOrderDashboard.designLayoutButton'), // "Design Table Layout"
            simulateOrderButton: i18n.t('venue_management.venueManagement.liveOrderDashboard.simulateOrderButton'), // "Simulate New Order"
            kitchenAreaLabel: i18n.t('venue_management.venueManagement.liveOrderDashboard.kitchenAreaLabel'), // "Kitchen"
            noTablesDefinedTitle: i18n.t('venue_management.venueManagement.liveOrderDashboard.noTablesDefinedTitle'), // "No tables defined yet."
            noTablesDefinedMessage: i18n.t('venue_management.venueManagement.liveOrderDashboard.noTablesDefinedMessage'), // "Click \"Design Table Layout\" to get started."
            footerText: i18n.t('venue_management.venueManagement.liveOrderDashboard.footerText'), // "Bakery Table Management System \u00a9 {year}"
            viewedOrdersTitle: i18n.t('venue_management.venueManagement.liveOrderDashboard.viewedOrdersTitle'), // "Viewed Orders ({count})"
            tableLabel: i18n.t('venue_management.venueManagement.liveOrderDashboard.tableLabel'), // "Table {number}"
            idLabel: i18n.t('venue_management.venueManagement.liveOrderDashboard.idLabel'), // "ID: {id}..."
            delayedStatus: i18n.t('venue_management.venueManagement.liveOrderDashboard.delayedStatus'), // "Delayed"
            activeStatus: i18n.t('venue_management.venueManagement.liveOrderDashboard.activeStatus'), // "Active"
            itemsLabel: i18n.t('venue_management.venueManagement.liveOrderDashboard.itemsLabel'), // "Items:"
            peopleLabel: i18n.t('venue_management.venueManagement.liveOrderDashboard.peopleLabel'), // "People:"
            totalPriceLabel: i18n.t('venue_management.venueManagement.liveOrderDashboard.totalPriceLabel'), // Price will be formatted // "Total: {price}"
            orderDetailsTitle: i18n.t('venue_management.venueManagement.liveOrderDashboard.orderDetailsTitle'), // "Order Details: Table {number}"
            confirmChargeTitle: i18n.t('venue_management.venueManagement.liveOrderDashboard.confirmChargeTitle'), // "Confirm Charge & Clear Table"
            confirmChargeMessage: i18n.t('venue_management.venueManagement.liveOrderDashboard.confirmChargeMessage'), // "Have you charged the client and are ready to clear Table {number}?"
            confirmChargeConfirmText: i18n.t('venue_management.venueManagement.liveOrderDashboard.confirmChargeConfirmText'), // "Yes, Charged & Clear"
            confirmChargeCancelText: i18n.t('venue_management.venueManagement.liveOrderDashboard.confirmChargeCancelText'), // "No, Not Yet"
            alertNoTablesForSimulateTitle: i18n.t('venue_management.venueManagement.liveOrderDashboard.alertNoTablesForSimulateTitle'), // "No Tables Defined"
            alertNoTablesForSimulateMessage: i18n.t('venue_management.venueManagement.liveOrderDashboard.alertNoTablesForSimulateMessage'), // "Please design the table layout first before simulating orders."
            // Strings for alerts coming from useLayoutData will be added when refactoring that hook
        },
        useLayoutData: {
            loadingErrorTitle: i18n.t('venue_management.venueManagement.useLayoutData.loadingErrorTitle'), // "Loading Error"
            loadingErrorMessageDefault: i18n.t('venue_management.venueManagement.useLayoutData.loadingErrorMessageDefault'), // "Could not load venue layout from the server."
            noActiveLayoutMessage: i18n.t('venue_management.venueManagement.useLayoutData.noActiveLayoutMessage'), // "No active layout found on backend. Using default local structure."
            saveErrorTitle: i18n.t('venue_management.venueManagement.useLayoutData.saveErrorTitle'), // "Save Error"
            saveErrorNotLoaded: i18n.t('venue_management.venueManagement.useLayoutData.saveErrorNotLoaded'), // "Layout data is not yet loaded. Please wait and try again."
            saveErrorNoData: i18n.t('venue_management.venueManagement.useLayoutData.saveErrorNoData'), // "No layout data provided to save."
            saveErrorDefault: i18n.t('venue_management.venueManagement.useLayoutData.saveErrorDefault'), // "Could not save venue layout."
            saveErrorDetailsPrefix: i18n.t('venue_management.venueManagement.useLayoutData.saveErrorDetailsPrefix'), // "Details: {details}"
            layoutSavedTitle: i18n.t('venue_management.venueManagement.useLayoutData.layoutSavedTitle'), // "Layout Saved"
            layoutSavedMessage: i18n.t('venue_management.venueManagement.useLayoutData.layoutSavedMessage'), // "Venue layout has been successfully saved."
            resetLocallyTitle: i18n.t('venue_management.venueManagement.useLayoutData.resetLocallyTitle'), // "Layout Reset Locally"
            resetLocallyMessage: i18n.t('venue_management.venueManagement.useLayoutData.resetLocallyMessage'), // "The layout has been reset to default. Save to persist these changes."
        },
        venueDesignerPage: {
            defaultLayoutName: i18n.t('venue_management.venueManagement.venueDesignerPage.defaultLayoutName'), // "Default Venue Layout"
            initializingEditor: i18n.t('venue_management.venueManagement.venueDesignerPage.initializingEditor'), // "Initializing Editor..."
            loadingPreview: i18n.t('venue_management.venueManagement.venueDesignerPage.loadingPreview'), // "Loading Preview..."
            unsavedChangesTitle: i18n.t('venue_management.venueManagement.venueDesignerPage.unsavedChangesTitle'), // "Unsaved Changes"
            switchToPreviewConfirmationMessage: i18n.t('venue_management.venueManagement.venueDesignerPage.switchToPreviewConfirmationMessage'), // "You have unsaved changes. How would you like to proceed to Preview Mode?"
            previewUnsavedButton: i18n.t('venue_management.venueManagement.venueDesignerPage.previewUnsavedButton'), // "Preview Unsaved"
            previewLastSavedButton: i18n.t('venue_management.venueManagement.venueDesignerPage.previewLastSavedButton'), // "Preview Last Saved"
            stayInDesignButton: i18n.t('venue_management.venueManagement.venueDesignerPage.stayInDesignButton'), // "Stay in Design Mode"
            previewingUnsavedAlertTitle: i18n.t('venue_management.venueManagement.venueDesignerPage.previewingUnsavedAlertTitle'), // "Previewing Unsaved Changes"
            previewingUnsavedAlertMessage: i18n.t('venue_management.venueManagement.venueDesignerPage.previewingUnsavedAlertMessage'), // "You are viewing your current unsaved changes. These are not yet saved to the server."
            previewingLastSavedAlertTitle: i18n.t('venue_management.venueManagement.venueDesignerPage.previewingLastSavedAlertTitle'), // "Previewing Last Saved Layout"
            previewingLastSavedAlertMessage: i18n.t('venue_management.venueManagement.venueDesignerPage.previewingLastSavedAlertMessage'), // "Showing the last saved version. Your unsaved changes remain in the editor."
            errorGettingEditorStateTitle: i18n.t('venue_management.error'), // "Error"
            errorGettingEditorStateMessage: i18n.t('venue_management.venueManagement.venueDesignerPage.errorGettingEditorStateMessage'), // "Could not get current editor state for preview. Please save first."
            exitLayoutManagerTitle: i18n.t('venue_management.venueManagement.venueDesignerPage.exitLayoutManagerTitle'), // "Exit Layout Manager"
            exitLayoutManagerConfirmationMessage: i18n.t('venue_management.venueManagement.venueDesignerPage.exitLayoutManagerConfirmationMessage'), // "You have unsaved changes. Are you sure you want to exit and discard them?"
            discardAndExitButton: i18n.t('venue_management.venueManagement.venueDesignerPage.discardAndExitButton'), // "Discard & Exit"
            stayOnPageButton: i18n.t('venue_management.venueManagement.venueDesignerPage.stayOnPageButton'), // "Stay on Page"
            loadingPageTitle: i18n.t('venue_management.venueManagement.venueDesignerPage.loadingPageTitle'), // "Loading Venue Designer..."
            errorPageTitle: i18n.t('venue_management.venueManagement.venueDesignerPage.errorPageTitle'), // "Failed to Load Layout Data"
            errorPageMessage: i18n.t('venue_management.venueManagement.venueDesignerPage.errorPageMessage'), // "Could not initialize layout data. Please try refreshing. If the problem persists, contact support."
            refreshPageButton: i18n.t('venue_management.venueManagement.venueDesignerPage.refreshPageButton'), // "Refresh Page"
        },
        venueDesignerHeader: {
            designModeLabel: i18n.t('venue_management.venueManagement.venueDesignerHeader.designModeLabel'), // "Design"
            previewModeLabel: i18n.t('venue_management.venueManagement.venueDesignerHeader.previewModeLabel'), // "Preview"
            unsavedChangesTooltip: i18n.t('venue_management.venueManagement.venueDesignerPage.unsavedChangesTitle'), // "Unsaved Changes"
            focusModeTooltip: i18n.t('venue_management.venueManagement.venueDesignerHeader.focusModeTooltip'), // "Focus Mode"
            downloadQrTooltip: i18n.t('venue_management.venueManagement.venueDesignerHeader.downloadQrTooltip'), // "Download All QR Codes"
            qrButtonText: i18n.t('venue_management.venueManagement.venueDesignerHeader.qrButtonText'), // Short text for the QR button when space is limited // "QRs"
            // Back to Dashboard tooltip could be added if that button becomes active
            // backToDashboardTooltip: "Back to Dashboard",
        },
        layoutEditor: {
            canvasAreaLabel: i18n.t('venue_management.venueManagement.layoutEditor.canvasAreaLabel'), // "Layout Design Canvas Area"
            mainRegionLabel: i18n.t('venue_management.venueManagement.layoutEditor.canvasAreaLabel'), // For the motion.main // "Layout Design Canvas Area"
            propertiesInspectorRegionLabel: i18n.t('venue_management.venueManagement.layoutEditor.propertiesInspectorRegionLabel'), // If PropertiesInspector is part of LayoutEditor's direct render // "Item Properties Inspector"
            confirmClearTitle: i18n.t('venue_management.venueManagement.layoutEditor.confirmClearTitle'), // "Clear Entire Layout"
            confirmClearMessage: i18n.t('venue_management.venueManagement.layoutEditor.confirmClearMessage'), // "Are you sure you want to clear all items and reset grid settings to default? This action will be recorded in history but directly clearing is a significant step."
            confirmClearConfirmText: i18n.t('venue_management.venueManagement.layoutEditor.confirmClearConfirmText'), // "Yes, Clear All & Reset"
            confirmClearCancelText: i18n.t('venue_management.cancel'), // "Cancel"
            saveErrorNotConfigured: i18n.t('venue_management.venueManagement.layoutEditor.saveErrorNotConfigured'), // "Save function (onSaveTrigger) not configured for LayoutEditor."
            validationErrorTitle: i18n.t('venue_management.venueManagement.layoutEditor.validationErrorTitle'), // Used by validateLayoutForSave // "Layout Validation Error"
            // Messages for validateLayoutForSave (can be more granular if needed)
            validationErrorInvalidTables: i18n.t('venue_management.venueManagement.layoutEditor.validationErrorInvalidTables'), // "Ensure all tables have valid, positive numbers."
            validationErrorDuplicateTableNumbers: i18n.t('venue_management.venueManagement.layoutEditor.validationErrorDuplicateTableNumbers'), // "Table numbers must be unique."
            // Tool interaction messages (might be logged or used in future subtle UI feedback)
            toolSelectedForPlacement: i18n.t('venue_management.venueManagement.layoutEditor.toolSelectedForPlacement'), // "Tool selected for placement: {toolName}"
            toolDeselectedForPlacement: i18n.t('venue_management.venueManagement.layoutEditor.toolDeselectedForPlacement'), // "Tool deselected for placement."
            cellClickedNewItem: i18n.t('venue_management.venueManagement.layoutEditor.cellClickedNewItem'), // "Cell clicked for NEW item placement. Tool: {toolName}, Target: R{row}C{col}"
            cellClickedExistingItem: i18n.t('venue_management.venueManagement.layoutEditor.cellClickedExistingItem'), // "Cell clicked for EXISTING item move. Candidate: {itemId}, Target: R{row}C{col}"
        },
        editorToolbar: {
            toolbarLabel: i18n.t('venue_management.venueManagement.editorToolbar.toolbarLabel'), // "Layout Editor Toolbar"
            elementsCategory: i18n.t('venue_management.venueManagement.editorToolbar.elementsCategory'), // Fallback category name // "Elements"
            categoryLabelSuffix: "", // e.g., " Tools" if you want "Furniture Tools"
            rowsLabel: i18n.t('venue_management.venueManagement.editorToolbar.rowsLabel'), // "R:"
            colsLabel: i18n.t('venue_management.venueManagement.editorToolbar.colsLabel'), // "C:"
            gridRowsAriaLabel: i18n.t('venue_management.venueManagement.editorToolbar.gridRowsAriaLabel'), // "Grid Rows"
            gridColsAriaLabel: i18n.t('venue_management.venueManagement.editorToolbar.gridColsAriaLabel'), // "Grid Columns"
            gridSubdivisionAriaLabel: i18n.t('venue_management.venueManagement.editorToolbar.gridSubdivisionAriaLabel'), // "Grid Subdivision"
            subdivisionOptionSuffix: i18n.t('venue_management.venueManagement.editorToolbar.subdivisionOptionSuffix'), // For 2x2, 4x4 options // "x{value}"
            zoomOutTooltip: i18n.t('venue_management.venueManagement.editorToolbar.zoomOutTooltip'), // "Zoom Out (-)"
            resetZoomTooltip: i18n.t('venue_management.venueManagement.editorToolbar.resetZoomTooltip'), // "Reset Zoom ({percentage}%)"
            zoomInTooltip: i18n.t('venue_management.venueManagement.editorToolbar.zoomInTooltip'), // "Zoom In (+)"
            undoTooltip: i18n.t('venue_management.venueManagement.editorToolbar.undoTooltip'), // "Undo (Ctrl+Z)"
            redoTooltip: i18n.t('venue_management.venueManagement.editorToolbar.redoTooltip'), // "Redo (Ctrl+Y)"
            saveLayoutTooltip: i18n.t('venue_management.venueManagement.editorToolbar.saveLayoutTooltip'), // "Save Layout (Ctrl+S)"
            saveButtonText: i18n.t('venue_management.save'), // Text for save button if not in zen/mobile // "Save"
            clearLayoutTooltip: i18n.t('venue_management.venueManagement.layoutEditor.confirmClearTitle'), // "Clear Entire Layout"
            focusModeEnterTooltip: i18n.t('venue_management.venueManagement.editorToolbar.focusModeEnterTooltip'), // "Enter Focus Mode"
            focusModeExitTooltip: i18n.t('venue_management.venueManagement.editorToolbar.focusModeExitTooltip'), // "Exit Focus Mode (Esc)"
            eraserActivateTooltip: i18n.t('venue_management.venueManagement.editorToolbar.eraserActivateTooltip'), // "Activate Eraser (E)"
            eraserDeactivateTooltip: i18n.t('venue_management.venueManagement.editorToolbar.eraserDeactivateTooltip'), // "Deactivate Eraser (E)"
            // Tool specific tooltips/aria-labels can be constructed dynamically if needed,
            // or added here if they are very specific and static.
            // For DraggableTool itself, its title/aria-label construction will be handled in DraggableTool.jsx
        },
        editorCanvas: {
            mainCanvasAreaLabel: i18n.t('venue_management.venueManagement.editorCanvas.mainCanvasAreaLabel'), // For the main div wrapper // "Venue Layout Design Canvas"
            gridRegionLabel: i18n.t('venue_management.venueManagement.editorCanvas.gridRegionLabel'), // For the grid itself (canvasGridRef) // "Layout Grid Area"
            resizePreviewAriaHidden: i18n.t('venue_management.venueManagement.editorCanvas.resizePreviewAriaHidden'), // Standard for decorative/status elements // "true"
            // If resize preview itself had text (it doesn't currently), that would go here.
        },
        canvasCell: {
            gridCellRoleDescription: i18n.t('venue_management.venueManagement.canvasCell.gridCellRoleDescription'), // Could be used for a more descriptive aria-label if needed // "Layout grid cell"
            // Dynamic aria-labels based on current interaction (e.g., "Place {toolName}", "Move to R{row}C{col}")
            // will be constructed in the component.
            // No explicit static strings seem to be directly rendered by CanvasCell.
            // Tooltips are usually handled by the parent (EditorCanvas/LayoutEditor via draggedItemPreview or activeTool)
            // or by PlacedItem for items themselves.
        },
        placedItem: {
            defaultRendererMissingText: i18n.t('venue_management.venueManagement.placedItem.defaultRendererMissingText'), // "Renderer Missing"
            defaultRendererTypeLabel: i18n.t('venue_management.venueManagement.placedItem.defaultRendererTypeLabel'), // "Type: {itemType}"
            defaultRendererIdLabel: i18n.t('venue_management.venueManagement.placedItem.defaultRendererIdLabel'), // "ID: {itemId}"
            itemBaseTitle: i18n.t('venue_management.venueManagement.placedItem.itemBaseTitle'), // Base for constructing titles // "{itemName}"
            itemFixedSuffix: i18n.t('venue_management.venueManagement.placedItem.itemFixedSuffix'), // "(Fixed)"
            itemProvisionalSuffix: i18n.t('venue_management.venueManagement.placedItem.itemProvisionalSuffix'), // For tables // "(Provisional - Click in Editor to set number)"
            itemMoveCandidateSuffix: i18n.t('venue_management.venueManagement.placedItem.itemMoveCandidateSuffix'), // When it's the moveCandidate // "Click a cell to move {itemName}"
            itemEraserActionText: i18n.t('venue_management.venueManagement.placedItem.itemEraserActionText'), // "Tap to erase {itemName}"
            itemSelectActionText: i18n.t('venue_management.venueManagement.placedItem.itemSelectActionText'), // "Tap to select {itemName}"
            itemDefaultAriaRole: i18n.t('venue_management.venueManagement.placedItem.itemDefaultAriaRole'), // Default role if not otherwise specified by interactions // "button"
        },
        resizeHandle: {
            tooltipPrefix: i18n.t('venue_management.venueManagement.resizeHandle.tooltipPrefix'), // e.g., "Resize North" // "Resize {direction}"
            directionN: i18n.t('venue_management.venueManagement.resizeHandle.directionN'), // "North"
            directionS: i18n.t('venue_management.venueManagement.resizeHandle.directionS'), // "South"
            directionE: i18n.t('venue_management.venueManagement.resizeHandle.directionE'), // "East"
            directionW: i18n.t('venue_management.venueManagement.resizeHandle.directionW'), // "West"
        },
        rotationHandle: {
            tooltip: i18n.t('venue_management.venueManagement.rotationHandle.tooltip'), // "Rotate Item (90\u00b0)"
            ariaLabel: i18n.t('venue_management.venueManagement.rotationHandle.ariaLabel'), // "Rotate Item by 90 degrees"
        },
        propertiesInspector: {
            defaultTitle: i18n.t('venue_management.venueManagement.propertiesInspector.defaultTitle'), // "Properties"
            itemPropertiesTitleSuffix: i18n.t('venue_management.venueManagement.propertiesInspector.defaultTitle'), // e.g., "Table Properties", "{itemName} Properties" // "Properties"
            closeButtonTooltip: i18n.t('venue_management.venueManagement.propertiesInspector.closeButtonTooltip'), // "Close Properties Panel"
            closeButtonAriaLabel: i18n.t('venue_management.venueManagement.propertiesInspector.closeButtonTooltip'), // "Close Properties Panel"
            minimizedTabTooltip: i18n.t('venue_management.venueManagement.propertiesInspector.minimizedTabTooltip'), // For the desktop minimized button // "Show Properties"
            mobilePeekTitleSuffix: i18n.t('venue_management.venueManagement.propertiesInspector.defaultTitle'), // For the mobile peek state, e.g., "Table Properties" // "Properties"
            noItemSelectedMessage: i18n.t('venue_management.venueManagement.propertiesInspector.noItemSelectedMessage'), // "Select an item on the canvas to view its properties."
            // DefaultInspectorContent strings (already in placedItem, but can be aliased or duplicated if preferred for clarity)
            defaultInspectorContent_rendererMissingText: i18n.t('venue_management.venueManagement.placedItem.defaultRendererMissingText'), // Re-using or can be specific // "Renderer Missing"
            defaultInspectorContent_typeLabel: i18n.t('venue_management.venueManagement.placedItem.defaultRendererTypeLabel'), // "Type: {itemType}"
            defaultInspectorContent_idLabel: i18n.t('venue_management.venueManagement.placedItem.defaultRendererIdLabel'), // "ID: {itemId}"
            defaultInspectorContent_noEditorConfigured: i18n.t('venue_management.venueManagement.propertiesInspector.defaultInspectorContent_noEditorConfigured'), // "No specific editor configured for this item type, or the configured key is not matched."
        },
        tableEditor: {
            tableNumberLabel: i18n.t('venue_management.venueManagement.tableEditor.tableNumberLabel'), // "Table Number"
            tableNumberValueNotSet: i18n.t('venue_management.venueManagement.tableEditor.tableNumberValueNotSet'), // "Not Set"
            tableNumberValueProvisional: i18n.t('venue_management.venueManagement.tableEditor.tableNumberValueProvisional'), // "N\u00ba? (Set on table)"
            tableNumberHelpText: i18n.t('venue_management.venueManagement.tableEditor.tableNumberHelpText'), // "Edit number on the table itself. Click to select, then click number to edit."
            seatsLabel: i18n.t('venue_management.venueManagement.tableEditor.seatsLabel'), // "Number of Seats"
            seatsPlaceholder: i18n.t('venue_management.venueManagement.tableEditor.seatsPlaceholder'), // "e.g., 4 or empty for default"
            seatsTooltip: i18n.t('venue_management.venueManagement.tableEditor.seatsTooltip'), // Tooltip for the input field // "Enter a number or leave empty for default seats."
            seatsHelpText: i18n.t('venue_management.venueManagement.tableEditor.seatsTooltip'), // Helper text below input // "Enter a number or leave empty for default seats."
            infoSectionTitle: i18n.t('venue_management.venueManagement.tableEditor.infoSectionTitle'), // Optional title for the info section // "Table Information"
            itemIdLabel: i18n.t('venue_management.venueManagement.tableEditor.itemIdLabel'), // "Item ID:"
            defaultShapeLabel: i18n.t('venue_management.venueManagement.tableEditor.defaultShapeLabel'), // "Default shape:"
            rotationLabel: i18n.t('venue_management.venueManagement.tableEditor.rotationLabel'), // "Rotation:"
            provisionalLabel: i18n.t('venue_management.venueManagement.tableEditor.provisionalLabel'), // "Provisional:"
            fixedLabel: i18n.t('venue_management.venueManagement.tableEditor.fixedLabel'), // "Fixed:"
            yesValue: i18n.t('venue_management.yes'), // "Yes"
            noValue: i18n.t('venue_management.no'), // "No"
        },
        wallEditor: {
            thicknessLabel: i18n.t('venue_management.venueManagement.wallEditor.thicknessLabel'), // "Visual Thickness (minor cells)"
            thicknessTooltip: i18n.t('venue_management.venueManagement.wallEditor.thicknessTooltip'), // "Visual thickness of the wall within its own cell."
            thicknessHelpText: i18n.t('venue_management.venueManagement.wallEditor.thicknessHelpText'), // "Thickness within its own grid cell. Does not affect collision. Max: {maxThickness}."
            infoSectionTitle: i18n.t('venue_management.venueManagement.wallEditor.infoSectionTitle'), // Optional // "Wall Information"
            itemIdLabel: i18n.t('venue_management.venueManagement.tableEditor.itemIdLabel'), // "Item ID:"
            lengthLabel: i18n.t('venue_management.venueManagement.wallEditor.lengthLabel'), // "Length (major units):"
            baseWidthLabel: i18n.t('venue_management.venueManagement.wallEditor.baseWidthLabel'), // "Base Width (minor):"
            baseHeightLabel: i18n.t('venue_management.venueManagement.wallEditor.baseHeightLabel'), // "Base Height (minor):"
            rotationLabel: i18n.t('venue_management.venueManagement.tableEditor.rotationLabel'), // "Rotation:"
            fixedLabel: i18n.t('venue_management.venueManagement.tableEditor.fixedLabel'), // "Fixed:"
            yesValue: i18n.t('venue_management.yes'), // "Yes"
            noValue: i18n.t('venue_management.no'), // "No"
        },
        doorEditor: {
            swingDirectionLabel: i18n.t('venue_management.venueManagement.doorEditor.swingDirectionLabel'), // "Swing Direction"
            leftSwingOption: i18n.t('venue_management.venueManagement.doorEditor.leftSwingOption'), // "Left Swing"
            rightSwingOption: i18n.t('venue_management.venueManagement.doorEditor.rightSwingOption'), // "Right Swing"
            selectSwingPlaceholder: i18n.t('venue_management.venueManagement.doorEditor.selectSwingPlaceholder'), // For Dropdown component // "Select Swing Direction"
            infoSectionTitle: i18n.t('venue_management.venueManagement.doorEditor.infoSectionTitle'), // Optional // "Door Information"
            itemIdLabel: i18n.t('venue_management.venueManagement.tableEditor.itemIdLabel'), // "Item ID:"
            typeLabel: i18n.t('venue_management.venueManagement.doorEditor.typeLabel'), // "Type:"
            standardDoorType: i18n.t('venue_management.venueManagement.doorEditor.standardDoorType'), // Default type if item.shape is missing // "Standard Door"
            rotationLabel: i18n.t('venue_management.venueManagement.tableEditor.rotationLabel'), // "Rotation:"
            fixedLabel: i18n.t('venue_management.venueManagement.tableEditor.fixedLabel'), // "Fixed:"
            yesValue: i18n.t('venue_management.yes'), // "Yes"
            noValue: i18n.t('venue_management.no'), // "No"
        },
        decorEditor: {
            labelOptionalLabel: i18n.t('venue_management.venueManagement.decorEditor.labelOptionalLabel'), // "Label (Optional)"
            labelPlaceholder: i18n.t('venue_management.venueManagement.decorEditor.labelPlaceholder'), // "e.g., Potted Fern, Area Rug"
            labelTooltip: i18n.t('venue_management.venueManagement.decorEditor.labelTooltip'), // "Enter an optional label for this decor item."
            widthLabel: i18n.t('venue_management.venueManagement.decorEditor.widthLabel'), // "Width (minor cells)"
            widthTooltip: i18n.t('venue_management.venueManagement.decorEditor.widthTooltip'), // "Width of the item's base before rotation."
            heightLabel: i18n.t('venue_management.venueManagement.decorEditor.heightLabel'), // "Height (minor cells)"
            heightTooltip: i18n.t('venue_management.venueManagement.decorEditor.heightTooltip'), // "Height of the item's base before rotation."
            dimensionsHelpText: i18n.t('venue_management.venueManagement.decorEditor.dimensionsHelpText'), // "Dimensions apply to the item's base before rotation."
            infoSectionTitle: i18n.t('venue_management.venueManagement.decorEditor.infoSectionTitle'), // Optional // "Decor Information"
            itemIdLabel: i18n.t('venue_management.venueManagement.tableEditor.itemIdLabel'), // "Item ID:"
            decorTypeLabel: i18n.t('venue_management.venueManagement.decorEditor.decorTypeLabel'), // "Decor Type:"
            decorTypeGeneric: i18n.t('venue_management.venueManagement.decorEditor.decorTypeGeneric'), // Fallback if item.decorType is missing // "Generic"
            shapeConfigLabel: i18n.t('venue_management.venueManagement.decorEditor.shapeConfigLabel'), // "Shape Config:"
            rotationLabel: i18n.t('venue_management.venueManagement.tableEditor.rotationLabel'), // "Rotation:"
            fixedLabel: i18n.t('venue_management.venueManagement.tableEditor.fixedLabel'), // "Fixed:"
            yesValue: i18n.t('venue_management.yes'), // "Yes"
            noValue: i18n.t('venue_management.no'), // "No"
        },
        counterEditor: {
            labelOptionalLabel: i18n.t('venue_management.venueManagement.decorEditor.labelOptionalLabel'), // "Label (Optional)"
            labelPlaceholder: i18n.t('venue_management.venueManagement.counterEditor.labelPlaceholder'), // "e.g., Main Bar, Register"
            labelTooltip: i18n.t('venue_management.venueManagement.counterEditor.labelTooltip'), // "Enter an optional label for this counter."
            lengthLabel: i18n.t('venue_management.venueManagement.counterEditor.lengthLabel'), // "Length (major grid units)"
            lengthPlaceholder: i18n.t('venue_management.venueManagement.counterEditor.lengthPlaceholder'), // "e.g., 2"
            lengthTooltip: i18n.t('venue_management.venueManagement.counterEditor.lengthTooltip'), // "Length of the counter along its main axis, in major grid cells."
            lengthHelpText: i18n.t('venue_management.venueManagement.counterEditor.lengthHelpText'), // "Defines length along its main axis. Thickness is 1 major unit."
            invalidItemError: i18n.t('venue_management.venueManagement.counterEditor.invalidItemError'), // Error message if wrong item type // "Error: Invalid item for Counter Editor."
            infoSectionTitle: i18n.t('venue_management.venueManagement.counterEditor.infoSectionTitle'), // Optional // "Counter Information"
            itemIdLabel: i18n.t('venue_management.venueManagement.tableEditor.itemIdLabel'), // "Item ID:"
            decorTypeLabel: i18n.t('venue_management.venueManagement.counterEditor.decorTypeLabel'), // "Decor Type (if any):"
            shapeConfigLabel: i18n.t('venue_management.venueManagement.decorEditor.shapeConfigLabel'), // "Shape Config:"
            rotationLabel: i18n.t('venue_management.venueManagement.tableEditor.rotationLabel'), // "Rotation:"
            actualBaseWidthLabel: i18n.t('venue_management.venueManagement.counterEditor.actualBaseWidthLabel'), // "Actual Base Width (minor):"
            actualBaseHeightLabel: i18n.t('venue_management.venueManagement.counterEditor.actualBaseHeightLabel'), // "Actual Base Height (minor):"
            fixedLabel: i18n.t('venue_management.venueManagement.tableEditor.fixedLabel'), // "Fixed:"
            yesValue: i18n.t('venue_management.yes'), // "Yes"
            noValue: i18n.t('venue_management.no'), // "No"
        },
        tableRenderer: {
            fixedTooltipSuffix: i18n.t('venue_management.venueManagement.placedItem.itemFixedSuffix'), // "(Fixed)"
            provisionalTooltipText: i18n.t('venue_management.venueManagement.tableRenderer.provisionalTooltipText'), // "Provisional Table (Click in Editor to set number)"
            tableTooltipPrefix: i18n.t('venue_management.venueManagement.liveOrderDashboard.tableLabel'), // "Table {number}"
            provisionalDisplayValue: i18n.t('venue_management.venueManagement.tableRenderer.provisionalDisplayValue'), // Text displayed on provisional tables // "N\u00ba?"
            tableNumberPrefix: i18n.t('venue_management.venueManagement.tableRenderer.tableNumberPrefix'), // Prefix for displayed table number, e.g., "T5" // "T"
            tableNumberNotSet: "", // Value if number is null/undefined and not provisional (e.g., display only "T")
        },
        counterRenderer: {
            defaultLabel: i18n.t('venue_management.venueManagement.counterRenderer.defaultLabel'), // Fallback text if item.label is empty // "Counter"
        },
        useLayoutDesignerStateManagement: {
            // Config errors (critical, point to setup issues)
            configErrorMissingConfigTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.configErrorMissingConfigTitle'), // "Configuration Error"
            configErrorMissingConfigMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.configErrorMissingConfigMessage'), // "Missing configuration for item type: {itemType}. Please contact support."
            configErrorMissingFactoryTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.configErrorMissingConfigTitle'), // "Configuration Error"
            configErrorMissingFactoryMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.configErrorMissingFactoryMessage'), // "Missing properties factory for item type: {itemType}. Please contact support."
            factoryErrorTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.factoryErrorTitle'), // "Factory Error"
            factoryErrorMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.factoryErrorMessage'), // "Error creating properties for new item ({itemType})."
            // Dimension/Placement errors
            dimensionErrorTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.dimensionErrorTitle'), // "Dimension Error"
            dimensionErrorMinMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.dimensionErrorMinMessage'), // "Invalid base dimensions for new item. Minimum dimension is {minCells} cell(s)."
            placementErrorTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.placementErrorTitle'), // "Placement Error"
            placementErrorOccupiedOrOutOfBounds: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.placementErrorOccupiedOrOutOfBounds'), // "Cannot place item: Space occupied or out of bounds."
            resizeErrorConflictOrOutOfBounds: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.resizeErrorConflictOrOutOfBounds'), // "Resized/moved item conflicts or is out of bounds."
            // Rotation errors
            rotationErrorTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.rotationErrorTitle'), // "Rotation Error"
            rotationErrorConflictOrOutOfBounds: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.rotationErrorConflictOrOutOfBounds'), // "Cannot rotate: new orientation conflicts or is out of bounds."
            // Sizing errors (e.g., for counters)
            sizingErrorTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.sizingErrorTitle'), // Generic title // "Sizing Error"
            counterSizingErrorConflict: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.counterSizingErrorConflict'), // "Counter cannot be resized: new size conflicts or is out of bounds."
            // Input validation errors
            invalidInputTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidInputTitle'), // "Invalid Input"
            invalidRotationAngle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidRotationAngle'), // "Invalid rotation angle."
            invalidRotationType: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidRotationType'), // "Invalid rotation type."
            counterLengthPositiveError: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.counterLengthPositiveError'), // "Counter length must be a positive number."
            invalidTableNumberTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidTableNumberTitle'), // "Invalid Table Number"
            invalidTableNumberMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidTableNumberMessage'), // "Table number must be a positive integer or empty."
            duplicateTableNumberTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.duplicateTableNumberTitle'), // "Duplicate Table Number"
            duplicateTableNumberMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.duplicateTableNumberMessage'), // "Table number {number} is already in use."
            invalidSeatCountTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidSeatCountTitle'), // "Invalid Seat Count"
            invalidSeatCountMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidSeatCountMessage'), // "Seat count must be a non-negative integer or empty."
            // Grid manipulation
            gridDimensionErrorTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.gridDimensionErrorTitle'), // "Invalid Dimension"
            gridDimensionErrorRange: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.gridDimensionErrorRange'), // "Grid dimensions out of range. Min/Max Rows: {minRows}-{maxRows}, Cols: {minCols}-{maxCols}."
            gridResizeErrorOutOfBoundsTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.gridResizeErrorOutOfBoundsTitle'), // "Resize Error"
            gridResizeErrorOutOfBoundsMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.gridResizeErrorOutOfBoundsMessage'), // "Cannot reduce dimensions. Some items would be out of bounds."
            invalidSubdivisionTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidSubdivisionTitle'), // "Invalid Subdivision"
            invalidSubdivisionMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidSubdivisionMessage'), // "Grid subdivision level is invalid."
            subdivisionChangedTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.subdivisionChangedTitle'), // "Subdivision Changed"
            subdivisionChangedMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.subdivisionChangedMessage'), // "Grid subdivision has been updated. Existing items' dimensions are in minor cells and will not automatically scale. Manual adjustment may be needed if their intended size was relative to major grid units."
            // Clear/Reset actions
            designerClearedTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.designerClearedTitle'), // "Designer Cleared"
            designerClearedMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.designerClearedMessage'), // "All items have been removed from the layout."
            designerResetTitle: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.designerResetTitle'), // "Designer Reset"
            designerResetMessage: i18n.t('venue_management.venueManagement.useLayoutDesignerStateManagement.designerResetMessage'), // "Layout and grid settings have been reset to default."
        },
        useQrCodeManager: {
            // Fetch errors
            qrFetchErrorTitleGeneric: i18n.t('venue_management.venueManagement.useQrCodeManager.qrFetchErrorTitleGeneric'), // "Network Error"
            qrFetchErrorTitleHttp: i18n.t('venue_management.venueManagement.useQrCodeManager.qrFetchErrorTitleHttp'), // "QR Error (HTTP {status})"
            qrFetchErrorMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.qrFetchErrorMessage'), // "Could not fetch QR for Table {tableIdentifier}: {errorMessage}"
            qrFetchServiceUnavailableTitle: i18n.t('venue_management.venueManagement.useQrCodeManager.qrFetchServiceUnavailableTitle'), // "QR Service Info"
            qrFetchServiceUnavailableMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.qrFetchServiceUnavailableMessage'), // "QR code generation for Table {tableIdentifier} is currently unavailable (endpoint not ready)."
            // Download errors/info
            downloadErrorTitle: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadErrorTitle'), // "Download Error"
            downloadErrorInvalidTable: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadErrorInvalidTable'), // "Invalid table data for QR download."
            qrNotAvailableForDownloadTitle: i18n.t('venue_management.venueManagement.useQrCodeManager.qrNotAvailableForDownloadTitle'), // "QR Not Available"
            qrNotAvailableServiceMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.qrNotAvailableServiceMessage'), // "QR code for Table {tableIdentifier} cannot be downloaded as the generation service is unavailable."
            qrNotAvailablePreviouslyFailedMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.qrNotAvailablePreviouslyFailedMessage'), // "QR code for Table {tableIdentifier} could not be generated previously. Try refreshing or check logs."
            qrNotAvailableGenericDownloadError: i18n.t('venue_management.venueManagement.useQrCodeManager.qrNotAvailableGenericDownloadError'), // "Could not download QR for Table {tableIdentifier}. Ensure it can be generated."
            noQrCodesToDownloadTitle: i18n.t('venue_management.venueManagement.useQrCodeManager.noQrCodesToDownloadTitle'), // "No QR Codes"
            noQrCodesToDownloadMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.noQrCodesToDownloadMessage'), // "There are no valid, numbered tables to download QR codes for."
            downloadStartingTitle: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadStartingTitle'), // "Download Starting"
            downloadStartingMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadStartingMessage'), // "Preparing to download available QR code(s) for {count} table(s). This may take a moment."
            downloadStartingSomeUnavailable: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadStartingSomeUnavailable'), // Appended to downloadStartingMessage // " Some QRs are unavailable or errored."
            downloadStartingSomeServiceDisabled: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadStartingSomeServiceDisabled'), // Appended // " Some QRs are unavailable (service disabled)."
            downloadStartingSomeFailed: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadStartingSomeFailed'), // Appended // " Some QRs previously failed to generate."
            downloadCompleteTitle: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadCompleteTitle'), // "Download Complete"
            downloadCompleteMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadCompleteMessage'), // "Successfully downloaded {count} QR codes."
            downloadPartialTitle: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadPartialTitle'), // "Download Partial"
            downloadPartialMessageSuccess: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadPartialMessageSuccess'), // Part 1 // "Successfully downloaded {downloadedCount} QR codes."
            downloadPartialMessageFailed: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadPartialMessageFailed'), // Part 2 (appended) // " {failedCount} failed."
            downloadPartialMessageSkipped: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadPartialMessageSkipped'), // Part 3 (appended) // " {skippedCount} skipped (service unavailable)."
            downloadFailedTitle: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadFailedTitle'), // "Download Failed"
            downloadFailedAllMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadFailedAllMessage'), // "All {count} QR codes could not be downloaded at this time."
            downloadUnavailableAllServiceMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadUnavailableAllServiceMessage'), // "All QR codes are currently unavailable because the generation service is offline."
            downloadIssueMixedTitle: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadIssueMixedTitle'), // "Download Issue"
            downloadIssueMixedMessage: i18n.t('venue_management.venueManagement.useQrCodeManager.downloadIssueMixedMessage'), // "No QR codes downloaded. {failedCount} failed, {skippedCount} skipped (service unavailable)."
        },
        itemConfigs: {
            // Placed Item Display Names (used by ITEM_CONFIGS)
            placedTableDisplayName: i18n.t('venue_management.venueManagement.itemConfigs.placedTableDisplayName'), // "Table"
            placedWallDisplayName: i18n.t('venue_management.venueManagement.itemConfigs.placedWallDisplayName'), // "Wall"
            placedDoorDisplayName: i18n.t('venue_management.venueManagement.itemConfigs.placedDoorDisplayName'), // "Door"
            placedDecorDisplayName: i18n.t('venue_management.venueManagement.itemConfigs.placedDecorDisplayName'), // "Decor"
            placedCounterDisplayName: i18n.t('venue_management.venueManagement.counterRenderer.defaultLabel'), // "Counter"

            // Tool Names (used by toolDefinitions)
            squareTableToolName: i18n.t('venue_management.venueManagement.itemConfigs.squareTableToolName'), // "Square Table"
            rectTableToolName: i18n.t('venue_management.venueManagement.itemConfigs.rectTableToolName'), // Abbreviation kept for consistency with original // "Rect. Table"
            roundTableToolName: i18n.t('venue_management.venueManagement.itemConfigs.roundTableToolName'), // "Round Table"
            counterToolName: i18n.t('venue_management.venueManagement.counterRenderer.defaultLabel'), // "Counter"
            wallToolName: i18n.t('venue_management.venueManagement.itemConfigs.placedWallDisplayName'), // "Wall"
            doorToolName: i18n.t('venue_management.venueManagement.itemConfigs.placedDoorDisplayName'), // "Door"
            plantToolName: i18n.t('venue_management.venueManagement.itemConfigs.plantToolName'), // "Plant"
            rugToolName: i18n.t('venue_management.venueManagement.itemConfigs.rugToolName'), // "Rug"

            // Tool Categories (if we want to localize these too, though original uses hardcoded strings)
            // categoryFurniture: "Furniture",
            // categoryStructure: "Structure",
            // categoryDecor: "Decor",
        },
        draggableTool: {
            tooltipActivePlacement: i18n.t('venue_management.venueManagement.draggableTool.tooltipActivePlacement'), // "Tool '{toolName}' active. Click a cell to place."
            tooltipDefaultZenMode: i18n.t('venue_management.venueManagement.draggableTool.tooltipDefaultZenMode'), // Tooltip in Zen mode is just the name // "{toolName}"
            tooltipDefaultFullMode: i18n.t('venue_management.venueManagement.draggableTool.tooltipDefaultFullMode'), // "Click to select, or Drag to add {toolName}"
            ariaLabelActivePlacement: i18n.t('venue_management.venueManagement.draggableTool.ariaLabelActivePlacement'), // "{toolName} tool. Currently active for placement."
            ariaLabelDefault: i18n.t('venue_management.venueManagement.draggableTool.ariaLabelDefault'), // "{toolName} tool. Click to select or drag to add."
        },
        venueLayoutPreview: {
            previewUnavailableTitle: i18n.t('venue_management.venueManagement.venueLayoutPreview.previewUnavailableTitle'), // "Layout Preview Unavailable"
            previewUnavailableMessage: i18n.t('venue_management.venueManagement.venueLayoutPreview.previewUnavailableMessage'), // "It seems there's no layout data to display, or grid dimensions are invalid. <br />Please design your layout in 'Design Mode' first."
            qrSidebarTitle: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrSidebarTitle'), // "Table QR Codes"
            qrTableNumberLabel: i18n.t('venue_management.venueManagement.liveOrderDashboard.tableLabel'), // "Table {number}"
            qrSeatsLabel: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrSeatsLabel'), // e.g., "4 Seats" // "{seats} Seats"
            qrSeatsNotAvailable: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrSeatsNotAvailable'), // "N/A Seats"
            qrShapeLabel: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrShapeLabel'), // e.g., "square-1x1" // "{shape}"
            qrDownloadButtonTooltip: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrDownloadButtonTooltip'), // "Download QR Code"
            qrStatusLoading: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrStatusLoading'), // Alt text or status if image fails // "Loading QR..."
            qrStatusError: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrStatusError'), // "Error loading QR"
            qrStatusSkipped: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrStatusSkipped'), // "QR Generation Offline"
            qrStatusPending: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrStatusPending'), // "QR Pending"
            qrErrorMessage: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrErrorMessage'), // Displayed below QR if error // "Could not load."
            qrSkippedMessage: i18n.t('venue_management.venueManagement.venueLayoutPreview.qrSkippedMessage'), // Displayed below QR if skipped // "Unavailable."
            noTablesForQrTitle: i18n.t('venue_management.venueManagement.venueLayoutPreview.noTablesForQrTitle'), // "No Tables for QR Codes"
            noTablesForQrMessage: i18n.t('venue_management.venueManagement.venueLayoutPreview.noTablesForQrMessage'), // "Switch to 'Design Mode' to add tables to your layout and assign them numbers."
            downloadAllQrsButtonText: i18n.t('venue_management.venueManagement.venueLayoutPreview.downloadAllQrsButtonText'), // "Download All QRs"
            // Tooltips for items in the grid (can be constructed dynamically)
            gridItemTableTooltip: i18n.t('venue_management.venueManagement.venueLayoutPreview.gridItemTableTooltip'), // "Table {number} - Click to see QR in sidebar"
            gridItemDefaultTooltip: i18n.t('venue_management.venueManagement.placedItem.itemBaseTitle'), // "{itemName}"
        },
        layoutItemRendererUtils: {
            defaultPreviewRendererTitle: i18n.t('venue_management.venueManagement.layoutItemRendererUtils.defaultPreviewRendererTitle'), // "{itemName} (ID: {itemId})"
            defaultPreviewRendererItemNameFallback: i18n.t('venue_management.venueManagement.layoutItemRendererUtils.defaultPreviewRendererItemNameFallback'), // "Unknown Item"
        },
    }
};

// Helper for interpolation
export const interpolate = (str, params) => {
    if (!str || typeof str !== 'string') return '';
    let newStr = str;
    if (params) {
        for (const key in params) {
            newStr = newStr.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
        }
    }
    return newStr;
};

// Helper for currency formatting
export const formatCurrency = (amount, config) => {
    const {
        currencySymbol = scriptLines.currencySymbol,
        currencyFormat = scriptLines.currencyFormat,
        decimalSeparator = scriptLines.decimalSeparator,
        thousandSeparator = scriptLines.thousandSeparator,
        decimals = scriptLines.decimals
    } = config || scriptLines;

    const num = parseFloat(amount);
    if (isNaN(num)) return String(amount);

    const fixedAmount = num.toFixed(decimals);
    let [integerPart, decimalPart] = fixedAmount.split('.');
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    const formattedAmount = decimalPart ? `${integerPart}${decimalSeparator}${decimalPart}` : integerPart;

    return interpolate(currencyFormat, { symbol: currencySymbol, amount: formattedAmount });
};

export default scriptLines;