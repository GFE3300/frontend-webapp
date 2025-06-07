import { t } from '../../../i18n';

// src/features/venue_management/utils/script_lines.js
export const scriptLines = {
    // --- Global Settings ---
    currencySymbol: t('venue_management.currencySymbol'),
    currencyFormat: t('venue_management.currencyFormat'), // e.g., $10.99
    currencyCode: t('register.steps.step4Preferences.options.currencies.0.value'), // Example
    decimalSeparator: t('venue_management.decimalSeparator'),
    thousandSeparator: t('venue_management.thousandSeparator'),
    decimals: 2,

    // --- Common / General ---
    error: t('venue_management.error'),
    info: t('venue_management.info'),
    warning: t('venue_management.warning'),
    success: t('venue_management.success'),
    loading: t('venue_management.loading'),
    tryAgain: t('payments.components.paymentCancelPage.buttons.tryAgain'),
    save: t('venue_management.save'),
    cancel: t('venue_management.cancel'),
    confirm: t('venue_management.confirm'),
    close: t('venue_management.close'),
    yes: t('venue_management.yes'),
    no: t('venue_management.no'),
    next: t('venue_management.next'),
    back: t('register.components.formStep.buttons.back'),
    finish: t('venue_management.finish'),
    submit: t('venue_management.submit'),
    search: t('venue_management.search'),
    actions: t('venue_management.actions'),
    edit: t('venue_management.edit'),
    delete: t('venue_management.delete'),
    view: t('venue_management.view'),
    add: t('venue_management.add'),
    requiredField: t('venue_management.requiredField'),
    noDataAvailable: t('venue_management.noDataAvailable'),
    page: t('venue_management.page'),
    of: t('register.components.formStep.progress.of'),
    items: t('venue_management.items'),
    total: t('venue_management.total'),

    // --- Venue Management Feature ---
    venueManagement: {
        liveOrderDashboard: {
            title: t('venue_management.venueManagement.liveOrderDashboard.title'),
            hideSidebar: t('venue_management.venueManagement.liveOrderDashboard.hideSidebar'),
            showSidebar: t('venue_management.venueManagement.liveOrderDashboard.showSidebar'),
            liveStatusTitle: t('venue_management.venueManagement.liveOrderDashboard.liveStatusTitle'),
            newOrdersLabel: t('venue_management.venueManagement.liveOrderDashboard.newOrdersLabel'),
            activeViewedLabel: t('venue_management.venueManagement.liveOrderDashboard.activeViewedLabel'),
            designLayoutButton: t('venue_management.venueManagement.liveOrderDashboard.designLayoutButton'),
            simulateOrderButton: t('venue_management.venueManagement.liveOrderDashboard.simulateOrderButton'),
            kitchenAreaLabel: t('venue_management.venueManagement.liveOrderDashboard.kitchenAreaLabel'),
            noTablesDefinedTitle: t('venue_management.venueManagement.liveOrderDashboard.noTablesDefinedTitle'),
            noTablesDefinedMessage: t('venue_management.venueManagement.liveOrderDashboard.noTablesDefinedMessage'),
            footerText: t('venue_management.venueManagement.liveOrderDashboard.footerText'),
            viewedOrdersTitle: t('venue_management.venueManagement.liveOrderDashboard.viewedOrdersTitle'),
            tableLabel: t('venue_management.venueManagement.liveOrderDashboard.tableLabel'),
            idLabel: t('venue_management.venueManagement.liveOrderDashboard.idLabel'),
            delayedStatus: t('venue_management.venueManagement.liveOrderDashboard.delayedStatus'),
            activeStatus: t('venue_management.venueManagement.liveOrderDashboard.activeStatus'),
            itemsLabel: t('venue_management.venueManagement.liveOrderDashboard.itemsLabel'),
            peopleLabel: t('venue_management.venueManagement.liveOrderDashboard.peopleLabel'),
            totalPriceLabel: t('venue_management.venueManagement.liveOrderDashboard.totalPriceLabel'), // Price will be formatted
            orderDetailsTitle: t('venue_management.venueManagement.liveOrderDashboard.orderDetailsTitle'),
            confirmChargeTitle: t('venue_management.venueManagement.liveOrderDashboard.confirmChargeTitle'),
            confirmChargeMessage: t('venue_management.venueManagement.liveOrderDashboard.confirmChargeMessage'),
            confirmChargeConfirmText: t('venue_management.venueManagement.liveOrderDashboard.confirmChargeConfirmText'),
            confirmChargeCancelText: t('venue_management.venueManagement.liveOrderDashboard.confirmChargeCancelText'),
            alertNoTablesForSimulateTitle: t('venue_management.venueManagement.liveOrderDashboard.alertNoTablesForSimulateTitle'),
            alertNoTablesForSimulateMessage: t('venue_management.venueManagement.liveOrderDashboard.alertNoTablesForSimulateMessage'),
            // Strings for alerts coming from useLayoutData will be added when refactoring that hook
        },
        useLayoutData: {
            loadingErrorTitle: t('venue_management.venueManagement.useLayoutData.loadingErrorTitle'),
            loadingErrorMessageDefault: t('venue_management.venueManagement.useLayoutData.loadingErrorMessageDefault'),
            noActiveLayoutMessage: t('venue_management.venueManagement.useLayoutData.noActiveLayoutMessage'),
            saveErrorTitle: t('venue_management.venueManagement.useLayoutData.saveErrorTitle'),
            saveErrorNotLoaded: t('venue_management.venueManagement.useLayoutData.saveErrorNotLoaded'),
            saveErrorNoData: t('venue_management.venueManagement.useLayoutData.saveErrorNoData'),
            saveErrorDefault: t('venue_management.venueManagement.useLayoutData.saveErrorDefault'),
            saveErrorDetailsPrefix: t('venue_management.venueManagement.useLayoutData.saveErrorDetailsPrefix'),
            layoutSavedTitle: t('venue_management.venueManagement.useLayoutData.layoutSavedTitle'),
            layoutSavedMessage: t('venue_management.venueManagement.useLayoutData.layoutSavedMessage'),
            resetLocallyTitle: t('venue_management.venueManagement.useLayoutData.resetLocallyTitle'),
            resetLocallyMessage: t('venue_management.venueManagement.useLayoutData.resetLocallyMessage'),
        },
        venueDesignerPage: {
            defaultLayoutName: t('venue_management.venueManagement.venueDesignerPage.defaultLayoutName'),
            initializingEditor: t('venue_management.venueManagement.venueDesignerPage.initializingEditor'),
            loadingPreview: t('venue_management.venueManagement.venueDesignerPage.loadingPreview'),
            unsavedChangesTitle: t('venue_management.venueManagement.venueDesignerPage.unsavedChangesTitle'),
            switchToPreviewConfirmationMessage: t('venue_management.venueManagement.venueDesignerPage.switchToPreviewConfirmationMessage'),
            previewUnsavedButton: t('venue_management.venueManagement.venueDesignerPage.previewUnsavedButton'),
            previewLastSavedButton: t('venue_management.venueManagement.venueDesignerPage.previewLastSavedButton'),
            stayInDesignButton: t('venue_management.venueManagement.venueDesignerPage.stayInDesignButton'),
            previewingUnsavedAlertTitle: t('venue_management.venueManagement.venueDesignerPage.previewingUnsavedAlertTitle'),
            previewingUnsavedAlertMessage: t('venue_management.venueManagement.venueDesignerPage.previewingUnsavedAlertMessage'),
            previewingLastSavedAlertTitle: t('venue_management.venueManagement.venueDesignerPage.previewingLastSavedAlertTitle'),
            previewingLastSavedAlertMessage: t('venue_management.venueManagement.venueDesignerPage.previewingLastSavedAlertMessage'),
            errorGettingEditorStateTitle: t('venue_management.error'),
            errorGettingEditorStateMessage: t('venue_management.venueManagement.venueDesignerPage.errorGettingEditorStateMessage'),
            exitLayoutManagerTitle: t('venue_management.venueManagement.venueDesignerPage.exitLayoutManagerTitle'),
            exitLayoutManagerConfirmationMessage: t('venue_management.venueManagement.venueDesignerPage.exitLayoutManagerConfirmationMessage'),
            discardAndExitButton: t('venue_management.venueManagement.venueDesignerPage.discardAndExitButton'),
            stayOnPageButton: t('venue_management.venueManagement.venueDesignerPage.stayOnPageButton'),
            loadingPageTitle: t('venue_management.venueManagement.venueDesignerPage.loadingPageTitle'),
            errorPageTitle: t('venue_management.venueManagement.venueDesignerPage.errorPageTitle'),
            errorPageMessage: t('venue_management.venueManagement.venueDesignerPage.errorPageMessage'),
            refreshPageButton: t('venue_management.venueManagement.venueDesignerPage.refreshPageButton'),
        },
        venueDesignerHeader: {
            designModeLabel: t('venue_management.venueManagement.venueDesignerHeader.designModeLabel'),
            previewModeLabel: t('venue_management.venueManagement.venueDesignerHeader.previewModeLabel'),
            unsavedChangesTooltip: t('venue_management.venueManagement.venueDesignerPage.unsavedChangesTitle'),
            focusModeTooltip: t('venue_management.venueManagement.venueDesignerHeader.focusModeTooltip'),
            downloadQrTooltip: t('venue_management.venueManagement.venueDesignerHeader.downloadQrTooltip'),
            qrButtonText: t('venue_management.venueManagement.venueDesignerHeader.qrButtonText'), // Short text for the QR button when space is limited
            // Back to Dashboard tooltip could be added if that button becomes active
            // backToDashboardTooltip: "Back to Dashboard",
        },
        layoutEditor: {
            canvasAreaLabel: t('venue_management.venueManagement.layoutEditor.canvasAreaLabel'),
            mainRegionLabel: t('venue_management.venueManagement.layoutEditor.canvasAreaLabel'), // For the motion.main
            propertiesInspectorRegionLabel: t('venue_management.venueManagement.layoutEditor.propertiesInspectorRegionLabel'), // If PropertiesInspector is part of LayoutEditor's direct render
            confirmClearTitle: t('venue_management.venueManagement.layoutEditor.confirmClearTitle'),
            confirmClearMessage: t('venue_management.venueManagement.layoutEditor.confirmClearMessage'),
            confirmClearConfirmText: t('venue_management.venueManagement.layoutEditor.confirmClearConfirmText'),
            confirmClearCancelText: t('venue_management.cancel'),
            saveErrorNotConfigured: t('venue_management.venueManagement.layoutEditor.saveErrorNotConfigured'),
            validationErrorTitle: t('venue_management.venueManagement.layoutEditor.validationErrorTitle'), // Used by validateLayoutForSave
            // Messages for validateLayoutForSave (can be more granular if needed)
            validationErrorInvalidTables: t('venue_management.venueManagement.layoutEditor.validationErrorInvalidTables'),
            validationErrorDuplicateTableNumbers: t('venue_management.venueManagement.layoutEditor.validationErrorDuplicateTableNumbers'),
            // Tool interaction messages (might be logged or used in future subtle UI feedback)
            toolSelectedForPlacement: t('venue_management.venueManagement.layoutEditor.toolSelectedForPlacement'),
            toolDeselectedForPlacement: t('venue_management.venueManagement.layoutEditor.toolDeselectedForPlacement'),
            cellClickedNewItem: t('venue_management.venueManagement.layoutEditor.cellClickedNewItem'),
            cellClickedExistingItem: t('venue_management.venueManagement.layoutEditor.cellClickedExistingItem'),
        },
        editorToolbar: {
            toolbarLabel: t('venue_management.venueManagement.editorToolbar.toolbarLabel'),
            elementsCategory: t('venue_management.venueManagement.editorToolbar.elementsCategory'), // Fallback category name
            categoryLabelSuffix: "", // e.g., " Tools" if you want "Furniture Tools"
            rowsLabel: t('venue_management.venueManagement.editorToolbar.rowsLabel'),
            colsLabel: t('venue_management.venueManagement.editorToolbar.colsLabel'),
            gridRowsAriaLabel: t('venue_management.venueManagement.editorToolbar.gridRowsAriaLabel'),
            gridColsAriaLabel: t('venue_management.venueManagement.editorToolbar.gridColsAriaLabel'),
            gridSubdivisionAriaLabel: t('venue_management.venueManagement.editorToolbar.gridSubdivisionAriaLabel'),
            subdivisionOptionSuffix: t('venue_management.venueManagement.editorToolbar.subdivisionOptionSuffix'), // For 2x2, 4x4 options
            zoomOutTooltip: t('venue_management.venueManagement.editorToolbar.zoomOutTooltip'),
            resetZoomTooltip: t('venue_management.venueManagement.editorToolbar.resetZoomTooltip'),
            zoomInTooltip: t('venue_management.venueManagement.editorToolbar.zoomInTooltip'),
            undoTooltip: t('venue_management.venueManagement.editorToolbar.undoTooltip'),
            redoTooltip: t('venue_management.venueManagement.editorToolbar.redoTooltip'),
            saveLayoutTooltip: t('venue_management.venueManagement.editorToolbar.saveLayoutTooltip'),
            saveButtonText: t('venue_management.save'), // Text for save button if not in zen/mobile
            clearLayoutTooltip: t('venue_management.venueManagement.layoutEditor.confirmClearTitle'),
            focusModeEnterTooltip: t('venue_management.venueManagement.editorToolbar.focusModeEnterTooltip'),
            focusModeExitTooltip: t('venue_management.venueManagement.editorToolbar.focusModeExitTooltip'),
            eraserActivateTooltip: t('venue_management.venueManagement.editorToolbar.eraserActivateTooltip'),
            eraserDeactivateTooltip: t('venue_management.venueManagement.editorToolbar.eraserDeactivateTooltip'),
            // Tool specific tooltips/aria-labels can be constructed dynamically if needed,
            // or added here if they are very specific and static.
            // For DraggableTool itself, its title/aria-label construction will be handled in DraggableTool.jsx
        },
        editorCanvas: {
            mainCanvasAreaLabel: t('venue_management.venueManagement.editorCanvas.mainCanvasAreaLabel'), // For the main div wrapper
            gridRegionLabel: t('venue_management.venueManagement.editorCanvas.gridRegionLabel'), // For the grid itself (canvasGridRef)
            resizePreviewAriaHidden: t('venue_management.venueManagement.editorCanvas.resizePreviewAriaHidden'), // Standard for decorative/status elements
            // If resize preview itself had text (it doesn't currently), that would go here.
        },
        canvasCell: {
            gridCellRoleDescription: t('venue_management.venueManagement.canvasCell.gridCellRoleDescription'), // Could be used for a more descriptive aria-label if needed
            // Dynamic aria-labels based on current interaction (e.g., "Place {toolName}", "Move to R{row}C{col}")
            // will be constructed in the component.
            // No explicit static strings seem to be directly rendered by CanvasCell.
            // Tooltips are usually handled by the parent (EditorCanvas/LayoutEditor via draggedItemPreview or activeTool)
            // or by PlacedItem for items themselves.
        },
        placedItem: {
            defaultRendererMissingText: t('venue_management.venueManagement.placedItem.defaultRendererMissingText'),
            defaultRendererTypeLabel: t('venue_management.venueManagement.placedItem.defaultRendererTypeLabel'),
            defaultRendererIdLabel: t('venue_management.venueManagement.placedItem.defaultRendererIdLabel'),
            itemBaseTitle: t('venue_management.venueManagement.placedItem.itemBaseTitle'), // Base for constructing titles
            itemFixedSuffix: t('venue_management.venueManagement.placedItem.itemFixedSuffix'),
            itemProvisionalSuffix: t('venue_management.venueManagement.placedItem.itemProvisionalSuffix'), // For tables
            itemMoveCandidateSuffix: t('venue_management.venueManagement.placedItem.itemMoveCandidateSuffix'), // When it's the moveCandidate
            itemEraserActionText: t('venue_management.venueManagement.placedItem.itemEraserActionText'),
            itemSelectActionText: t('venue_management.venueManagement.placedItem.itemSelectActionText'),
            itemDefaultAriaRole: t('venue_management.venueManagement.placedItem.itemDefaultAriaRole'), // Default role if not otherwise specified by interactions
        },
        resizeHandle: {
            tooltipPrefix: t('venue_management.venueManagement.resizeHandle.tooltipPrefix'), // e.g., "Resize North"
            directionN: t('venue_management.venueManagement.resizeHandle.directionN'),
            directionS: t('venue_management.venueManagement.resizeHandle.directionS'),
            directionE: t('venue_management.venueManagement.resizeHandle.directionE'),
            directionW: t('venue_management.venueManagement.resizeHandle.directionW'),
        },
        rotationHandle: {
            tooltip: t('venue_management.venueManagement.rotationHandle.tooltip'),
            ariaLabel: t('venue_management.venueManagement.rotationHandle.ariaLabel'),
        },
        propertiesInspector: {
            defaultTitle: t('venue_management.venueManagement.propertiesInspector.defaultTitle'),
            itemPropertiesTitleSuffix: t('venue_management.venueManagement.propertiesInspector.defaultTitle'), // e.g., "Table Properties", "{itemName} Properties"
            closeButtonTooltip: t('venue_management.venueManagement.propertiesInspector.closeButtonTooltip'),
            closeButtonAriaLabel: t('venue_management.venueManagement.propertiesInspector.closeButtonTooltip'),
            minimizedTabTooltip: t('venue_management.venueManagement.propertiesInspector.minimizedTabTooltip'), // For the desktop minimized button
            mobilePeekTitleSuffix: t('venue_management.venueManagement.propertiesInspector.defaultTitle'), // For the mobile peek state, e.g., "Table Properties"
            noItemSelectedMessage: t('venue_management.venueManagement.propertiesInspector.noItemSelectedMessage'),
            // DefaultInspectorContent strings (already in placedItem, but can be aliased or duplicated if preferred for clarity)
            defaultInspectorContent_rendererMissingText: t('venue_management.venueManagement.placedItem.defaultRendererMissingText'), // Re-using or can be specific
            defaultInspectorContent_typeLabel: t('venue_management.venueManagement.placedItem.defaultRendererTypeLabel'),
            defaultInspectorContent_idLabel: t('venue_management.venueManagement.placedItem.defaultRendererIdLabel'),
            defaultInspectorContent_noEditorConfigured: t('venue_management.venueManagement.propertiesInspector.defaultInspectorContent_noEditorConfigured'),
        },
        tableEditor: {
            tableNumberLabel: t('venue_management.venueManagement.tableEditor.tableNumberLabel'),
            tableNumberValueNotSet: t('venue_management.venueManagement.tableEditor.tableNumberValueNotSet'),
            tableNumberValueProvisional: t('venue_management.venueManagement.tableEditor.tableNumberValueProvisional'),
            tableNumberHelpText: t('venue_management.venueManagement.tableEditor.tableNumberHelpText'),
            seatsLabel: t('venue_management.venueManagement.tableEditor.seatsLabel'),
            seatsPlaceholder: t('venue_management.venueManagement.tableEditor.seatsPlaceholder'),
            seatsTooltip: t('venue_management.venueManagement.tableEditor.seatsTooltip'), // Tooltip for the input field
            seatsHelpText: t('venue_management.venueManagement.tableEditor.seatsTooltip'), // Helper text below input
            infoSectionTitle: t('venue_management.venueManagement.tableEditor.infoSectionTitle'), // Optional title for the info section
            itemIdLabel: t('venue_management.venueManagement.tableEditor.itemIdLabel'),
            defaultShapeLabel: t('venue_management.venueManagement.tableEditor.defaultShapeLabel'),
            rotationLabel: t('venue_management.venueManagement.tableEditor.rotationLabel'),
            provisionalLabel: t('venue_management.venueManagement.tableEditor.provisionalLabel'),
            fixedLabel: t('venue_management.venueManagement.tableEditor.fixedLabel'),
            yesValue: t('venue_management.yes'),
            noValue: t('venue_management.no'),
        },
        wallEditor: {
            thicknessLabel: t('venue_management.venueManagement.wallEditor.thicknessLabel'),
            thicknessTooltip: t('venue_management.venueManagement.wallEditor.thicknessTooltip'),
            thicknessHelpText: t('venue_management.venueManagement.wallEditor.thicknessHelpText'),
            infoSectionTitle: t('venue_management.venueManagement.wallEditor.infoSectionTitle'), // Optional
            itemIdLabel: t('venue_management.venueManagement.tableEditor.itemIdLabel'),
            lengthLabel: t('venue_management.venueManagement.wallEditor.lengthLabel'),
            baseWidthLabel: t('venue_management.venueManagement.wallEditor.baseWidthLabel'),
            baseHeightLabel: t('venue_management.venueManagement.wallEditor.baseHeightLabel'),
            rotationLabel: t('venue_management.venueManagement.tableEditor.rotationLabel'),
            fixedLabel: t('venue_management.venueManagement.tableEditor.fixedLabel'),
            yesValue: t('venue_management.yes'),
            noValue: t('venue_management.no'),
        },
        doorEditor: {
            swingDirectionLabel: t('venue_management.venueManagement.doorEditor.swingDirectionLabel'),
            leftSwingOption: t('venue_management.venueManagement.doorEditor.leftSwingOption'),
            rightSwingOption: t('venue_management.venueManagement.doorEditor.rightSwingOption'),
            selectSwingPlaceholder: t('venue_management.venueManagement.doorEditor.selectSwingPlaceholder'), // For Dropdown component
            infoSectionTitle: t('venue_management.venueManagement.doorEditor.infoSectionTitle'), // Optional
            itemIdLabel: t('venue_management.venueManagement.tableEditor.itemIdLabel'),
            typeLabel: t('venue_management.venueManagement.doorEditor.typeLabel'),
            standardDoorType: t('venue_management.venueManagement.doorEditor.standardDoorType'), // Default type if item.shape is missing
            rotationLabel: t('venue_management.venueManagement.tableEditor.rotationLabel'),
            fixedLabel: t('venue_management.venueManagement.tableEditor.fixedLabel'),
            yesValue: t('venue_management.yes'),
            noValue: t('venue_management.no'),
        },
        decorEditor: {
            labelOptionalLabel: t('venue_management.venueManagement.decorEditor.labelOptionalLabel'),
            labelPlaceholder: t('venue_management.venueManagement.decorEditor.labelPlaceholder'),
            labelTooltip: t('venue_management.venueManagement.decorEditor.labelTooltip'),
            widthLabel: t('venue_management.venueManagement.decorEditor.widthLabel'),
            widthTooltip: t('venue_management.venueManagement.decorEditor.widthTooltip'),
            heightLabel: t('venue_management.venueManagement.decorEditor.heightLabel'),
            heightTooltip: t('venue_management.venueManagement.decorEditor.heightTooltip'),
            dimensionsHelpText: t('venue_management.venueManagement.decorEditor.dimensionsHelpText'),
            infoSectionTitle: t('venue_management.venueManagement.decorEditor.infoSectionTitle'), // Optional
            itemIdLabel: t('venue_management.venueManagement.tableEditor.itemIdLabel'),
            decorTypeLabel: t('venue_management.venueManagement.decorEditor.decorTypeLabel'),
            decorTypeGeneric: t('venue_management.venueManagement.decorEditor.decorTypeGeneric'), // Fallback if item.decorType is missing
            shapeConfigLabel: t('venue_management.venueManagement.decorEditor.shapeConfigLabel'),
            rotationLabel: t('venue_management.venueManagement.tableEditor.rotationLabel'),
            fixedLabel: t('venue_management.venueManagement.tableEditor.fixedLabel'),
            yesValue: t('venue_management.yes'),
            noValue: t('venue_management.no'),
        },
        counterEditor: {
            labelOptionalLabel: t('venue_management.venueManagement.decorEditor.labelOptionalLabel'),
            labelPlaceholder: t('venue_management.venueManagement.counterEditor.labelPlaceholder'),
            labelTooltip: t('venue_management.venueManagement.counterEditor.labelTooltip'),
            lengthLabel: t('venue_management.venueManagement.counterEditor.lengthLabel'),
            lengthPlaceholder: t('venue_management.venueManagement.counterEditor.lengthPlaceholder'),
            lengthTooltip: t('venue_management.venueManagement.counterEditor.lengthTooltip'),
            lengthHelpText: t('venue_management.venueManagement.counterEditor.lengthHelpText'),
            invalidItemError: t('venue_management.venueManagement.counterEditor.invalidItemError'), // Error message if wrong item type
            infoSectionTitle: t('venue_management.venueManagement.counterEditor.infoSectionTitle'), // Optional
            itemIdLabel: t('venue_management.venueManagement.tableEditor.itemIdLabel'),
            decorTypeLabel: t('venue_management.venueManagement.counterEditor.decorTypeLabel'),
            shapeConfigLabel: t('venue_management.venueManagement.decorEditor.shapeConfigLabel'),
            rotationLabel: t('venue_management.venueManagement.tableEditor.rotationLabel'),
            actualBaseWidthLabel: t('venue_management.venueManagement.counterEditor.actualBaseWidthLabel'),
            actualBaseHeightLabel: t('venue_management.venueManagement.counterEditor.actualBaseHeightLabel'),
            fixedLabel: t('venue_management.venueManagement.tableEditor.fixedLabel'),
            yesValue: t('venue_management.yes'),
            noValue: t('venue_management.no'),
        },
        tableRenderer: {
            fixedTooltipSuffix: t('venue_management.venueManagement.placedItem.itemFixedSuffix'),
            provisionalTooltipText: t('venue_management.venueManagement.tableRenderer.provisionalTooltipText'),
            tableTooltipPrefix: t('venue_management.venueManagement.liveOrderDashboard.tableLabel'),
            provisionalDisplayValue: t('venue_management.venueManagement.tableRenderer.provisionalDisplayValue'), // Text displayed on provisional tables
            tableNumberPrefix: t('venue_management.venueManagement.tableRenderer.tableNumberPrefix'), // Prefix for displayed table number, e.g., "T5"
            tableNumberNotSet: "", // Value if number is null/undefined and not provisional (e.g., display only "T")
        },
        counterRenderer: {
            defaultLabel: t('venue_management.venueManagement.counterRenderer.defaultLabel'), // Fallback text if item.label is empty
        },
        useLayoutDesignerStateManagement: {
            // Config errors (critical, point to setup issues)
            configErrorMissingConfigTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.configErrorMissingConfigTitle'),
            configErrorMissingConfigMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.configErrorMissingConfigMessage'),
            configErrorMissingFactoryTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.configErrorMissingConfigTitle'),
            configErrorMissingFactoryMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.configErrorMissingFactoryMessage'),
            factoryErrorTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.factoryErrorTitle'),
            factoryErrorMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.factoryErrorMessage'),
            // Dimension/Placement errors
            dimensionErrorTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.dimensionErrorTitle'),
            dimensionErrorMinMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.dimensionErrorMinMessage'),
            placementErrorTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.placementErrorTitle'),
            placementErrorOccupiedOrOutOfBounds: t('venue_management.venueManagement.useLayoutDesignerStateManagement.placementErrorOccupiedOrOutOfBounds'),
            resizeErrorConflictOrOutOfBounds: t('venue_management.venueManagement.useLayoutDesignerStateManagement.resizeErrorConflictOrOutOfBounds'),
            // Rotation errors
            rotationErrorTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.rotationErrorTitle'),
            rotationErrorConflictOrOutOfBounds: t('venue_management.venueManagement.useLayoutDesignerStateManagement.rotationErrorConflictOrOutOfBounds'),
            // Sizing errors (e.g., for counters)
            sizingErrorTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.sizingErrorTitle'), // Generic title
            counterSizingErrorConflict: t('venue_management.venueManagement.useLayoutDesignerStateManagement.counterSizingErrorConflict'),
            // Input validation errors
            invalidInputTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidInputTitle'),
            invalidRotationAngle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidRotationAngle'),
            invalidRotationType: t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidRotationType'),
            counterLengthPositiveError: t('venue_management.venueManagement.useLayoutDesignerStateManagement.counterLengthPositiveError'),
            invalidTableNumberTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidTableNumberTitle'),
            invalidTableNumberMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidTableNumberMessage'),
            duplicateTableNumberTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.duplicateTableNumberTitle'),
            duplicateTableNumberMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.duplicateTableNumberMessage'),
            invalidSeatCountTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidSeatCountTitle'),
            invalidSeatCountMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidSeatCountMessage'),
            // Grid manipulation
            gridDimensionErrorTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.gridDimensionErrorTitle'),
            gridDimensionErrorRange: t('venue_management.venueManagement.useLayoutDesignerStateManagement.gridDimensionErrorRange'),
            gridResizeErrorOutOfBoundsTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.gridResizeErrorOutOfBoundsTitle'),
            gridResizeErrorOutOfBoundsMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.gridResizeErrorOutOfBoundsMessage'),
            invalidSubdivisionTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidSubdivisionTitle'),
            invalidSubdivisionMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.invalidSubdivisionMessage'),
            subdivisionChangedTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.subdivisionChangedTitle'),
            subdivisionChangedMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.subdivisionChangedMessage'),
            // Clear/Reset actions
            designerClearedTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.designerClearedTitle'),
            designerClearedMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.designerClearedMessage'),
            designerResetTitle: t('venue_management.venueManagement.useLayoutDesignerStateManagement.designerResetTitle'),
            designerResetMessage: t('venue_management.venueManagement.useLayoutDesignerStateManagement.designerResetMessage'),
        },
        useQrCodeManager: {
            // Fetch errors
            qrFetchErrorTitleGeneric: t('venue_management.venueManagement.useQrCodeManager.qrFetchErrorTitleGeneric'),
            qrFetchErrorTitleHttp: t('venue_management.venueManagement.useQrCodeManager.qrFetchErrorTitleHttp'),
            qrFetchErrorMessage: t('venue_management.venueManagement.useQrCodeManager.qrFetchErrorMessage'),
            qrFetchServiceUnavailableTitle: t('venue_management.venueManagement.useQrCodeManager.qrFetchServiceUnavailableTitle'),
            qrFetchServiceUnavailableMessage: t('venue_management.venueManagement.useQrCodeManager.qrFetchServiceUnavailableMessage'),
            // Download errors/info
            downloadErrorTitle: t('venue_management.venueManagement.useQrCodeManager.downloadErrorTitle'),
            downloadErrorInvalidTable: t('venue_management.venueManagement.useQrCodeManager.downloadErrorInvalidTable'),
            qrNotAvailableForDownloadTitle: t('venue_management.venueManagement.useQrCodeManager.qrNotAvailableForDownloadTitle'),
            qrNotAvailableServiceMessage: t('venue_management.venueManagement.useQrCodeManager.qrNotAvailableServiceMessage'),
            qrNotAvailablePreviouslyFailedMessage: t('venue_management.venueManagement.useQrCodeManager.qrNotAvailablePreviouslyFailedMessage'),
            qrNotAvailableGenericDownloadError: t('venue_management.venueManagement.useQrCodeManager.qrNotAvailableGenericDownloadError'),
            noQrCodesToDownloadTitle: t('venue_management.venueManagement.useQrCodeManager.noQrCodesToDownloadTitle'),
            noQrCodesToDownloadMessage: t('venue_management.venueManagement.useQrCodeManager.noQrCodesToDownloadMessage'),
            downloadStartingTitle: t('venue_management.venueManagement.useQrCodeManager.downloadStartingTitle'),
            downloadStartingMessage: t('venue_management.venueManagement.useQrCodeManager.downloadStartingMessage'),
            downloadStartingSomeUnavailable: t('venue_management.venueManagement.useQrCodeManager.downloadStartingSomeUnavailable'), // Appended to downloadStartingMessage
            downloadStartingSomeServiceDisabled: t('venue_management.venueManagement.useQrCodeManager.downloadStartingSomeServiceDisabled'), // Appended
            downloadStartingSomeFailed: t('venue_management.venueManagement.useQrCodeManager.downloadStartingSomeFailed'), // Appended
            downloadCompleteTitle: t('venue_management.venueManagement.useQrCodeManager.downloadCompleteTitle'),
            downloadCompleteMessage: t('venue_management.venueManagement.useQrCodeManager.downloadCompleteMessage'),
            downloadPartialTitle: t('venue_management.venueManagement.useQrCodeManager.downloadPartialTitle'),
            downloadPartialMessageSuccess: t('venue_management.venueManagement.useQrCodeManager.downloadPartialMessageSuccess'), // Part 1
            downloadPartialMessageFailed: t('venue_management.venueManagement.useQrCodeManager.downloadPartialMessageFailed'), // Part 2 (appended)
            downloadPartialMessageSkipped: t('venue_management.venueManagement.useQrCodeManager.downloadPartialMessageSkipped'), // Part 3 (appended)
            downloadFailedTitle: t('venue_management.venueManagement.useQrCodeManager.downloadFailedTitle'),
            downloadFailedAllMessage: t('venue_management.venueManagement.useQrCodeManager.downloadFailedAllMessage'),
            downloadUnavailableAllServiceMessage: t('venue_management.venueManagement.useQrCodeManager.downloadUnavailableAllServiceMessage'),
            downloadIssueMixedTitle: t('venue_management.venueManagement.useQrCodeManager.downloadIssueMixedTitle'),
            downloadIssueMixedMessage: t('venue_management.venueManagement.useQrCodeManager.downloadIssueMixedMessage'),
        },
        itemConfigs: {
            // Placed Item Display Names (used by ITEM_CONFIGS)
            placedTableDisplayName: t('venue_management.venueManagement.itemConfigs.placedTableDisplayName'),
            placedWallDisplayName: t('venue_management.venueManagement.itemConfigs.placedWallDisplayName'),
            placedDoorDisplayName: t('venue_management.venueManagement.itemConfigs.placedDoorDisplayName'),
            placedDecorDisplayName: t('venue_management.venueManagement.itemConfigs.placedDecorDisplayName'),
            placedCounterDisplayName: t('venue_management.venueManagement.counterRenderer.defaultLabel'),

            // Tool Names (used by toolDefinitions)
            squareTableToolName: t('venue_management.venueManagement.itemConfigs.squareTableToolName'),
            rectTableToolName: t('venue_management.venueManagement.itemConfigs.rectTableToolName'), // Abbreviation kept for consistency with original
            roundTableToolName: t('venue_management.venueManagement.itemConfigs.roundTableToolName'),
            counterToolName: t('venue_management.venueManagement.counterRenderer.defaultLabel'),
            wallToolName: t('venue_management.venueManagement.itemConfigs.placedWallDisplayName'),
            doorToolName: t('venue_management.venueManagement.itemConfigs.placedDoorDisplayName'),
            plantToolName: t('venue_management.venueManagement.itemConfigs.plantToolName'),
            rugToolName: t('venue_management.venueManagement.itemConfigs.rugToolName'),

            // Tool Categories (if we want to localize these too, though original uses hardcoded strings)
            // categoryFurniture: "Furniture",
            // categoryStructure: "Structure",
            // categoryDecor: "Decor",
        },
        draggableTool: {
            tooltipActivePlacement: t('venue_management.venueManagement.draggableTool.tooltipActivePlacement'),
            tooltipDefaultZenMode: t('venue_management.venueManagement.draggableTool.tooltipDefaultZenMode'), // Tooltip in Zen mode is just the name
            tooltipDefaultFullMode: t('venue_management.venueManagement.draggableTool.tooltipDefaultFullMode'),
            ariaLabelActivePlacement: t('venue_management.venueManagement.draggableTool.ariaLabelActivePlacement'),
            ariaLabelDefault: t('venue_management.venueManagement.draggableTool.ariaLabelDefault'),
        },
        venueLayoutPreview: {
            previewUnavailableTitle: t('venue_management.venueManagement.venueLayoutPreview.previewUnavailableTitle'),
            previewUnavailableMessage: t('venue_management.venueManagement.venueLayoutPreview.previewUnavailableMessage'),
            qrSidebarTitle: t('venue_management.venueManagement.venueLayoutPreview.qrSidebarTitle'),
            qrTableNumberLabel: t('venue_management.venueManagement.liveOrderDashboard.tableLabel'),
            qrSeatsLabel: t('venue_management.venueManagement.venueLayoutPreview.qrSeatsLabel'), // e.g., "4 Seats"
            qrSeatsNotAvailable: t('venue_management.venueManagement.venueLayoutPreview.qrSeatsNotAvailable'),
            qrShapeLabel: t('venue_management.venueManagement.venueLayoutPreview.qrShapeLabel'), // e.g., "square-1x1"
            qrDownloadButtonTooltip: t('venue_management.venueManagement.venueLayoutPreview.qrDownloadButtonTooltip'),
            qrStatusLoading: t('venue_management.venueManagement.venueLayoutPreview.qrStatusLoading'), // Alt text or status if image fails
            qrStatusError: t('venue_management.venueManagement.venueLayoutPreview.qrStatusError'),
            qrStatusSkipped: t('venue_management.venueManagement.venueLayoutPreview.qrStatusSkipped'),
            qrStatusPending: t('venue_management.venueManagement.venueLayoutPreview.qrStatusPending'),
            qrErrorMessage: t('venue_management.venueManagement.venueLayoutPreview.qrErrorMessage'), // Displayed below QR if error
            qrSkippedMessage: t('venue_management.venueManagement.venueLayoutPreview.qrSkippedMessage'), // Displayed below QR if skipped
            noTablesForQrTitle: t('venue_management.venueManagement.venueLayoutPreview.noTablesForQrTitle'),
            noTablesForQrMessage: t('venue_management.venueManagement.venueLayoutPreview.noTablesForQrMessage'),
            downloadAllQrsButtonText: t('venue_management.venueManagement.venueLayoutPreview.downloadAllQrsButtonText'),
            // Tooltips for items in the grid (can be constructed dynamically)
            gridItemTableTooltip: t('venue_management.venueManagement.venueLayoutPreview.gridItemTableTooltip'),
            gridItemDefaultTooltip: t('venue_management.venueManagement.placedItem.itemBaseTitle'),
        },
        layoutItemRendererUtils: {
            defaultPreviewRendererTitle: t('venue_management.venueManagement.layoutItemRendererUtils.defaultPreviewRendererTitle'),
            defaultPreviewRendererItemNameFallback: t('venue_management.venueManagement.layoutItemRendererUtils.defaultPreviewRendererItemNameFallback'),
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