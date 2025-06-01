// src/features/venue_management/utils/script_lines.js
export const scriptLines = {
    // --- Global Settings ---
    currencySymbol: "$",
    currencyFormat: "{symbol}{amount}", // e.g., $10.99
    currencyCode: "USD", // Example
    decimalSeparator: ".",
    thousandSeparator: ",",
    decimals: 2,

    // --- Common / General ---
    error: "Error",
    info: "Info",
    warning: "Warning",
    success: "Success",
    loading: "Loading...",
    tryAgain: "Try Again",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    yes: "Yes",
    no: "No",
    next: "Next",
    back: "Back",
    finish: "Finish",
    submit: "Submit",
    search: "Search",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    add: "Add",
    requiredField: "This field is required.",
    noDataAvailable: "No data available.",
    page: "Page",
    of: "of",
    items: "Items",
    total: "Total",

    // --- Venue Management Feature ---
    venueManagement: {
        liveOrderDashboard: {
            title: "Bakery Orders",
            hideSidebar: "Hide Sidebar",
            showSidebar: "Show Sidebar",
            liveStatusTitle: "Live Table Status (Refreshes {timeAgo})",
            newOrdersLabel: "New Orders: {count}",
            activeViewedLabel: "Active Viewed: {count}",
            designLayoutButton: "Design Table Layout",
            simulateOrderButton: "Simulate New Order",
            kitchenAreaLabel: "Kitchen",
            noTablesDefinedTitle: "No tables defined yet.",
            noTablesDefinedMessage: "Click \"Design Table Layout\" to get started.",
            footerText: "Bakery Table Management System © {year}",
            viewedOrdersTitle: "Viewed Orders ({count})",
            tableLabel: "Table {number}",
            idLabel: "ID: {id}...",
            delayedStatus: "Delayed",
            activeStatus: "Active",
            itemsLabel: "Items:",
            peopleLabel: "People:",
            totalPriceLabel: "Total: {price}", // Price will be formatted
            orderDetailsTitle: "Order Details: Table {number}",
            confirmChargeTitle: "Confirm Charge & Clear Table",
            confirmChargeMessage: "Have you charged the client and are ready to clear Table {number}?",
            confirmChargeConfirmText: "Yes, Charged & Clear",
            confirmChargeCancelText: "No, Not Yet",
            alertNoTablesForSimulateTitle: "No Tables Defined",
            alertNoTablesForSimulateMessage: "Please design the table layout first before simulating orders.",
            // Strings for alerts coming from useLayoutData will be added when refactoring that hook
        },
        useLayoutData: {
            loadingErrorTitle: "Loading Error",
            loadingErrorMessageDefault: "Could not load venue layout from the server.",
            noActiveLayoutMessage: "No active layout found on backend. Using default local structure.",
            saveErrorTitle: "Save Error",
            saveErrorNotLoaded: "Layout data is not yet loaded. Please wait and try again.",
            saveErrorNoData: "No layout data provided to save.",
            saveErrorDefault: "Could not save venue layout.",
            saveErrorDetailsPrefix: "Details: {details}",
            layoutSavedTitle: "Layout Saved",
            layoutSavedMessage: "Venue layout has been successfully saved.",
            resetLocallyTitle: "Layout Reset Locally",
            resetLocallyMessage: "The layout has been reset to default. Save to persist these changes.",
        },
        venueDesignerPage: {
            defaultLayoutName: "Default Venue Layout",
            initializingEditor: "Initializing Editor...",
            loadingPreview: "Loading Preview...",
            unsavedChangesTitle: "Unsaved Changes",
            switchToPreviewConfirmationMessage: "You have unsaved changes. How would you like to proceed to Preview Mode?",
            previewUnsavedButton: "Preview Unsaved",
            previewLastSavedButton: "Preview Last Saved",
            stayInDesignButton: "Stay in Design Mode",
            previewingUnsavedAlertTitle: "Previewing Unsaved Changes",
            previewingUnsavedAlertMessage: "You are viewing your current unsaved changes. These are not yet saved to the server.",
            previewingLastSavedAlertTitle: "Previewing Last Saved Layout",
            previewingLastSavedAlertMessage: "Showing the last saved version. Your unsaved changes remain in the editor.",
            errorGettingEditorStateTitle: "Error",
            errorGettingEditorStateMessage: "Could not get current editor state for preview. Please save first.",
            exitLayoutManagerTitle: "Exit Layout Manager",
            exitLayoutManagerConfirmationMessage: "You have unsaved changes. Are you sure you want to exit and discard them?",
            discardAndExitButton: "Discard & Exit",
            stayOnPageButton: "Stay on Page",
            loadingPageTitle: "Loading Venue Designer...",
            errorPageTitle: "Failed to Load Layout Data",
            errorPageMessage: "Could not initialize layout data. Please try refreshing. If the problem persists, contact support.",
            refreshPageButton: "Refresh Page",
        },
        venueDesignerHeader: {
            designModeLabel: "Design",
            previewModeLabel: "Preview",
            unsavedChangesTooltip: "Unsaved Changes",
            focusModeTooltip: "Focus Mode",
            downloadQrTooltip: "Download All QR Codes",
            qrButtonText: "QRs", // Short text for the QR button when space is limited
            // Back to Dashboard tooltip could be added if that button becomes active
            // backToDashboardTooltip: "Back to Dashboard",
        },
        layoutEditor: {
            canvasAreaLabel: "Layout Design Canvas Area",
            mainRegionLabel: "Layout Design Canvas Area", // For the motion.main
            propertiesInspectorRegionLabel: "Item Properties Inspector", // If PropertiesInspector is part of LayoutEditor's direct render
            confirmClearTitle: "Clear Entire Layout",
            confirmClearMessage: "Are you sure you want to clear all items and reset grid settings to default? This action will be recorded in history but directly clearing is a significant step.",
            confirmClearConfirmText: "Yes, Clear All & Reset",
            confirmClearCancelText: "Cancel",
            saveErrorNotConfigured: "Save function (onSaveTrigger) not configured for LayoutEditor.",
            validationErrorTitle: "Layout Validation Error", // Used by validateLayoutForSave
            // Messages for validateLayoutForSave (can be more granular if needed)
            validationErrorInvalidTables: "Ensure all tables have valid, positive numbers.",
            validationErrorDuplicateTableNumbers: "Table numbers must be unique.",
            // Tool interaction messages (might be logged or used in future subtle UI feedback)
            toolSelectedForPlacement: "Tool selected for placement: {toolName}",
            toolDeselectedForPlacement: "Tool deselected for placement.",
            cellClickedNewItem: "Cell clicked for NEW item placement. Tool: {toolName}, Target: R{row}C{col}",
            cellClickedExistingItem: "Cell clicked for EXISTING item move. Candidate: {itemId}, Target: R{row}C{col}",
        },
        editorToolbar: {
            toolbarLabel: "Layout Editor Toolbar",
            elementsCategory: "Elements", // Fallback category name
            categoryLabelSuffix: "", // e.g., " Tools" if you want "Furniture Tools"
            rowsLabel: "R:",
            colsLabel: "C:",
            gridRowsAriaLabel: "Grid Rows",
            gridColsAriaLabel: "Grid Columns",
            gridSubdivisionAriaLabel: "Grid Subdivision",
            subdivisionOptionSuffix: "x{value}", // For 2x2, 4x4 options
            zoomOutTooltip: "Zoom Out (-)",
            resetZoomTooltip: "Reset Zoom ({percentage}%)",
            zoomInTooltip: "Zoom In (+)",
            undoTooltip: "Undo (Ctrl+Z)",
            redoTooltip: "Redo (Ctrl+Y)",
            saveLayoutTooltip: "Save Layout (Ctrl+S)",
            saveButtonText: "Save", // Text for save button if not in zen/mobile
            clearLayoutTooltip: "Clear Entire Layout",
            focusModeEnterTooltip: "Enter Focus Mode",
            focusModeExitTooltip: "Exit Focus Mode (Esc)",
            eraserActivateTooltip: "Activate Eraser (E)",
            eraserDeactivateTooltip: "Deactivate Eraser (E)",
            // Tool specific tooltips/aria-labels can be constructed dynamically if needed,
            // or added here if they are very specific and static.
            // For DraggableTool itself, its title/aria-label construction will be handled in DraggableTool.jsx
        },
        editorCanvas: {
            mainCanvasAreaLabel: "Venue Layout Design Canvas", // For the main div wrapper
            gridRegionLabel: "Layout Grid Area", // For the grid itself (canvasGridRef)
            resizePreviewAriaHidden: "true", // Standard for decorative/status elements
            // If resize preview itself had text (it doesn't currently), that would go here.
        },
        canvasCell: {
            gridCellRoleDescription: "Layout grid cell", // Could be used for a more descriptive aria-label if needed
            // Dynamic aria-labels based on current interaction (e.g., "Place {toolName}", "Move to R{row}C{col}")
            // will be constructed in the component.
            // No explicit static strings seem to be directly rendered by CanvasCell.
            // Tooltips are usually handled by the parent (EditorCanvas/LayoutEditor via draggedItemPreview or activeTool)
            // or by PlacedItem for items themselves.
        },
        placedItem: {
            defaultRendererMissingText: "Renderer Missing",
            defaultRendererTypeLabel: "Type: {itemType}",
            defaultRendererIdLabel: "ID: {itemId}",
            itemBaseTitle: "{itemName}", // Base for constructing titles
            itemFixedSuffix: "(Fixed)",
            itemProvisionalSuffix: "(Provisional - Click in Editor to set number)", // For tables
            itemMoveCandidateSuffix: "Click a cell to move {itemName}", // When it's the moveCandidate
            itemEraserActionText: "Tap to erase {itemName}",
            itemSelectActionText: "Tap to select {itemName}",
            itemDefaultAriaRole: "button", // Default role if not otherwise specified by interactions
        },
        resizeHandle: {
            tooltipPrefix: "Resize {direction}", // e.g., "Resize North"
            directionN: "North",
            directionS: "South",
            directionE: "East",
            directionW: "West",
        },
        rotationHandle: {
            tooltip: "Rotate Item (90°)",
            ariaLabel: "Rotate Item by 90 degrees",
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