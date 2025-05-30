import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence is used

// Core UI for the designer
import LayoutEditor from './LayoutEditor';
import VenueLayoutPreview from './VenueLayoutPreview';

// Hooks
import useLayoutData from '../../hooks/useLayoutData';

// Common Components
import Icon from '../../../../components/common/Icon';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// Constants & Utils
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION,
} from '../../constants/layoutConstants';
import { parseBackendLayoutItemsToFrontend } from '../../utils/layoutUtils';

const STABLE_EMPTY_FRONTEND_DESIGN_ITEMS = Object.freeze([]);
const DEFAULT_FRONTEND_GRID_DIMENSIONS = Object.freeze({
    rows: DEFAULT_INITIAL_GRID_ROWS,
    cols: DEFAULT_INITIAL_GRID_COLS,
    gridSubdivision: DEFAULT_GRID_SUBDIVISION,
});

const DEBUG_VD_PAGE = "[VenueDesignerPage DEBUG]";

const VenueDesignerPage = () => {
    const navigate = useNavigate();

    // --- State ---
    const [isEditorModeActive, setIsEditorModeActive] = useState(true); // Start in editor mode
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
    const [isToggleModeConfirmationOpen, setIsToggleModeConfirmationOpen] = useState(false);
    const [pendingToggleModeAction, setPendingToggleModeAction] = useState(null); // 'preview' or 'edit'

    const [isZenMode, setIsZenMode] = useState(false);
    const [alertModalOpen, setAlertModalOpen] = useState(false); // Renamed for clarity
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    // Stores the current state of the editor if user previews without saving
    // This is in FRONTEND format.
    const [unsavedEditorStateForPreview, setUnsavedEditorStateForPreview] = useState(null);


    // --- Callbacks for Modals & Alerts ---
    const openAlert = useCallback((title, message, type = 'info') => {
        // Prevent spamming same error alert. Allow info/success alerts to re-trigger.
        if (alertModalOpen && alertModalContent.title === title && alertModalContent.message === message && type === 'error') {
            return;
        }
        setAlertModalContent({ title, message, type });
        setAlertModalOpen(true);
    }, [alertModalOpen, alertModalContent]);

    const closeAlert = useCallback(() => setAlertModalOpen(false), []);

    // --- Data Fetching & Persistence ---
    const {
        layoutData: backendLayoutData,
        isLoading: isLoadingLayout,
        isSaving: isSavingLayout,
        initialFetchDone,
        saveDesignedLayout,
        // resetLayoutToLocalDefaults, // Keep if explicit reset button is desired beyond LayoutEditor's reset
    } = useLayoutData(openAlert);


    // --- Derived State for Editor and Preview ---
    // This is the "source of truth" for LayoutEditor's initial state, derived from backend.
    // It's in FRONTEND format.
    const layoutDataForEditorInitialization = useMemo(() => {
        console.log(DEBUG_VD_PAGE, "Recalculating layoutDataForEditorInitialization. initialFetchDone:", initialFetchDone, "backendLayoutData exists:", !!backendLayoutData);
        if (!initialFetchDone || !backendLayoutData) {
            return {
                designItems: STABLE_EMPTY_FRONTEND_DESIGN_ITEMS,
                gridDimensions: { ...DEFAULT_FRONTEND_GRID_DIMENSIONS },
                name: 'Default Venue Layout',
                // kitchenArea: null, // If applicable
            };
        }
        const frontendDesignItems = parseBackendLayoutItemsToFrontend(
            backendLayoutData.items || [],
            backendLayoutData.grid_subdivision || DEFAULT_GRID_SUBDIVISION
        );
        return {
            designItems: frontendDesignItems,
            gridDimensions: {
                rows: backendLayoutData.grid_rows || DEFAULT_INITIAL_GRID_ROWS,
                cols: backendLayoutData.grid_cols || DEFAULT_INITIAL_GRID_COLS,
                gridSubdivision: backendLayoutData.grid_subdivision || DEFAULT_GRID_SUBDIVISION,
            },
            name: backendLayoutData.name || 'Default Venue Layout',
            // kitchenArea: backendLayoutData.kitchen_area_definition || null, // If applicable
        };
    }, [initialFetchDone, backendLayoutData]);

    // Key for LayoutEditor to force re-mount if fundamental initial data structure changes.
    const layoutEditorKey = useMemo(() => {
        if (!layoutDataForEditorInitialization) return 'no-editor-data';
        // Create a key based on the data that LayoutEditor initializes with.
        // This primarily uses the name and grid dimensions from the loaded layout.
        // Item changes will be handled by onContentChange. This key is for when the *source* data changes.
        return `editor-init-${layoutDataForEditorInitialization.name}-${JSON.stringify(layoutDataForEditorInitialization.gridDimensions)}`;
    }, [layoutDataForEditorInitialization]);

    // Layout data for preview mode
    const currentLayoutDataForPreview = useMemo(() => {
        // If previewing unsaved changes, use that state. Otherwise, use the state derived from backend.
        if (unsavedEditorStateForPreview) {
            console.log(DEBUG_VD_PAGE, "Previewing with unsavedEditorStateForPreview");
            return unsavedEditorStateForPreview;
        }
        console.log(DEBUG_VD_PAGE, "Previewing with layoutDataForEditorInitialization (synced with backend)");
        return layoutDataForEditorInitialization;
    }, [unsavedEditorStateForPreview, layoutDataForEditorInitialization]);


    // --- Effects ---
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // This effect runs when the editor content changes.
    // It captures the current editor state IF the user is about to switch to preview mode
    // AND they chose to preview unsaved changes.
    // This is a bit tricky; LayoutEditor needs to provide its current state.
    // For now, LayoutEditor's onSaveTrigger effectively gives us this.
    // Let's assume onContentChange in LayoutEditor will update a ref or state here if needed for live preview.
    // For now, `unsavedEditorStateForPreview` will be set more directly when handling mode toggle.

    // --- Event Handlers ---
    const handleContentChangeInEditor = useCallback(() => {
        if (!hasUnsavedChanges) { // Only log/set if changing from false to true
            console.log(DEBUG_VD_PAGE, "Content changed in editor. Setting hasUnsavedChanges to true.");
            setHasUnsavedChanges(true);
        }
    }, [hasUnsavedChanges]);

    const handleSaveLayoutFromEditor = useCallback(async (designedLayoutFromChildInFrontendFormat) => {
        console.log(DEBUG_VD_PAGE, "handleSaveLayoutFromEditor called with:", designedLayoutFromChildInFrontendFormat);
        // Pass the current layout name from editor if available, or use existing backend name
        const layoutToSave = {
            ...designedLayoutFromChildInFrontendFormat,
            name: designedLayoutFromChildInFrontendFormat.name || backendLayoutData?.name || 'Default Venue Layout'
        };

        const success = await saveDesignedLayout(layoutToSave);
        if (success) {
            console.log(DEBUG_VD_PAGE, "Save successful. Setting hasUnsavedChanges to false.");
            setHasUnsavedChanges(false);
            setUnsavedEditorStateForPreview(null); // Clear any temporary preview state
            // alert is handled by useLayoutData
        } else {
            console.error(DEBUG_VD_PAGE, "Save FAILED. hasUnsavedChanges remains true.");
        }
        return success; // Propagate success status
    }, [saveDesignedLayout, backendLayoutData?.name]);


    const handleToggleEditorMode = useCallback(() => {
        const targetMode = isEditorModeActive ? 'preview' : 'edit';
        console.log(DEBUG_VD_PAGE, `Attempting to toggle mode to: ${targetMode}. Unsaved changes: ${hasUnsavedChanges}`);

        if (isEditorModeActive && hasUnsavedChanges) { // From Design (unsaved) to Preview
            setPendingToggleModeAction(targetMode); // Set action to 'preview'
            setIsToggleModeConfirmationOpen(true);
        } else { // No unsaved changes, or going from Preview to Design
            setIsEditorModeActive(prev => !prev);
            if (targetMode === 'edit') { // If switching to edit mode
                setUnsavedEditorStateForPreview(null); // Clear unsaved preview state
            }
        }
    }, [isEditorModeActive, hasUnsavedChanges]);

    const handleToggleModeConfirmation = useCallback(async (action) => {
        // action: 'saveAndToggle', 'toggleWithoutSaving', 'cancel'
        setIsToggleModeConfirmationOpen(false);
        const targetMode = pendingToggleModeAction; // should be 'preview'
        setPendingToggleModeAction(null);

        if (action === 'cancel') return;

        if (action === 'saveAndToggle') {
            // LayoutEditor needs to provide its current state for saving.
            // This is complex as `handleSaveLayoutFromEditor` expects this.
            // We need a way for VenueDesignerPage to request current state from LayoutEditor.
            // For now, this relies on LayoutEditor's onSaveTrigger being called by *its own* save button.
            // This modal implies saving *before* toggling. This means user must click save in toolbar first,
            // or this modal needs to trigger that save.
            // Let's assume user must save via editor's save button for now.
            // If they click "Save & Preview" here, it's a bit redundant if save already happened.
            // A better flow: "You have unsaved changes. Save them before previewing?"
            // This flow assumes the save button in LayoutEditor is the primary way to save.
            // If user clicks "Preview" button in header with unsaved changes, this modal appears.
            // "Save & Preview": Triggers a save, then switches.
            // "Preview Unsaved": Switches, VenueLayoutPreview shows unsaved state.
            // "Cancel": Stays.

            // To implement "Save & Preview", we need LayoutEditor to expose its current state for saving.
            // This will be handled by ensuring `LayoutEditor` passes its current data to `onSaveTrigger`.
            // The current structure of `LayoutEditor` `onSaveTrigger={handleSaveLayoutFromEditor}`
            // implies that `LayoutEditor` will call this with its current data when its internal save is invoked.
            // This confirmation path is for the mode toggle button, not editor's save button.

            // Let's simplify: The save button is in the EditorToolbar, managed by LayoutEditor.
            // If the user clicks the "Preview Layout" button in *this* page's header:
            openAlert("Action Required", "Please use the 'Save' button in the editor's toolbar to save changes before previewing, or choose to preview without saving.", "info");
            // This is a temporary measure. A more robust solution would be to get the current state from LayoutEditor.
            // For now, let's make "Preview Unsaved" the main path if they don't save via toolbar.
            return;
        }

        if (action === 'toggleWithoutSaving') { // Preview unsaved changes
            // This is where we need to get the current state from LayoutEditor.
            // This is the hard part without a ref or callback to get current state.
            // **Assumption for now**: If they "preview without saving", `hasUnsavedChanges` remains true,
            // and `LayoutEditor` retains its internal state. When they switch back to "edit", it's still there.
            // `VenueLayoutPreview` will need `unsavedEditorStateForPreview`.
            // This state MUST be captured from LayoutEditor when `handleToggleEditorMode` is first called.
            // This means `LayoutEditor` must call a function like `onCaptureStateForPreview` when its content changes.
            // For now, we can't get this live state easily. Let's set unsavedEditorStateForPreview to null,
            // and alert the user that preview will show last *saved* data.
            // UPDATE: A better approach is for VenueDesignerPage to ask LayoutEditor for its state
            // if LayoutEditor had an `onCaptureStateRequest` prop or similar.
            // For simplicity and to adhere to "one component at a time", we will assume `unsavedEditorStateForPreview` is managed
            // by a more advanced callback or context in a future iteration.
            // For this iteration, if "Preview without saving" is chosen, preview shows last loaded/saved data.
            // And a flag tells the user this.
            setUnsavedEditorStateForPreview(null); // Forcing preview of saved state for now
            setIsEditorModeActive(false); // Switch to preview
            openAlert("Previewing Last Saved", "Showing the last saved version. Your current changes are not displayed in this preview but remain in the editor.", "info");

        }
    }, [pendingToggleModeAction, openAlert]);


    const handleNavigateToOperationalView = useCallback(() => {
        navigate('/'); // Assuming '/' is the dashboard or operational view
    }, [navigate]);

    const handleAttemptExitPage = useCallback(() => {
        if (hasUnsavedChanges) {
            setIsExitConfirmationOpen(true);
        } else {
            handleNavigateToOperationalView();
        }
    }, [hasUnsavedChanges, handleNavigateToOperationalView]);

    const confirmAndExitPage = useCallback(async (discardChanges) => {
        setIsExitConfirmationOpen(false);
        if (discardChanges) {
            setHasUnsavedChanges(false);
            setUnsavedEditorStateForPreview(null);
            handleNavigateToOperationalView();
        }
    }, [handleNavigateToOperationalView]);

    const toggleZenMode = useCallback(() => {
        setIsZenMode(prev => !prev);
    }, []);

    const headerAnimationVariants = {
        visible: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3, ease: "circOut" } },
        hidden: { opacity: 0, height: 0, y: "-50px", transition: { duration: 0.25, ease: "circIn" } }, // Adjusted y for smoother exit
    };

    if (isLoadingLayout && !initialFetchDone) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900">
                <Icon name="progress_activity" aria-hidden="true" className="w-12 h-12 text-rose-500 dark:text-rose-400 animate-spin" />
                <p className="ml-3 text-lg font-montserrat font-semibold text-rose-700 dark:text-rose-400">
                    Loading Venue Designer...
                </p>
            </div>
        );
    }
    // If initial fetch is done but backendLayoutData is still null (e.g. critical fetch error not caught by useLayoutData for default)
    if (initialFetchDone && !backendLayoutData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900 p-6 text-center">
                <Icon name="error_outline" aria-hidden="true" className="w-16 h-16 text-red-500 dark:text-red-400 mb-4" />
                <h2 className="text-xl font-montserrat font-semibold text-red-700 dark:text-red-400 mb-2">Failed to Load Layout Data</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                    Could not initialize venue layout data. Please try refreshing. If the problem persists, contact support.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    return (
        <div className={`h-screen w-screen flex flex-col fixed inset-0 overflow-hidden antialiased bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 ${isZenMode ? 'zen-mode' : ''}`}>
            <AnimatePresence>
                {!isZenMode && (
                    <motion.header
                        key="venue-designer-page-header"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={headerAnimationVariants}
                        className="h-14 bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700
                                   flex justify-between items-center shrink-0 z-30 px-4 md:px-6"
                        role="banner"
                    >
                        <div className="flex items-center">
                            <Icon name="space_dashboard" aria-hidden="true" className="w-6 h-6 text-rose-500 dark:text-rose-400 mr-2.5" />
                            <h1 className="font-montserrat font-semibold text-lg text-neutral-800 dark:text-neutral-100 tracking-tight">
                                Venue Layout Manager
                                {isSavingLayout && <span className="ml-2 text-xs text-neutral-500">(Saving...)</span>}
                                {isLoadingLayout && initialFetchDone && <span className="ml-2 text-xs text-neutral-500">(Reloading...)</span>}
                            </h1>
                            <span className={`ml-3 text-xs px-2 py-0.5 rounded-full font-medium
                                ${isEditorModeActive ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                                    : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'}`}>
                                {isEditorModeActive ? 'Design Mode' : 'Preview Mode'}
                            </span>
                            {hasUnsavedChanges && ( // Show unsaved changes badge regardless of mode if applicable
                                <span className="ml-3 text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                                    Unsaved Changes
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-3">
                            <button
                                onClick={handleToggleEditorMode}
                                title={isEditorModeActive ? "Switch to Preview Mode" : "Switch to Design Mode"}
                                aria-label={isEditorModeActive ? "Switch to Preview Mode" : "Switch to Design Mode"}
                                className="flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium
                                           bg-neutral-100 text-neutral-600 hover:bg-neutral-200
                                           dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600
                                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                           transition-colors"
                                disabled={isSavingLayout || (isLoadingLayout && initialFetchDone)}
                            >
                                <Icon name={isEditorModeActive ? "visibility" : "edit"} className="w-4 h-4 mr-1.5" />
                                {isEditorModeActive ? "Preview Layout" : "Edit Layout"}
                            </button>
                            <button
                                onClick={handleAttemptExitPage}
                                className="flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-medium
                                           bg-neutral-200 text-neutral-700 hover:bg-neutral-300
                                           dark:bg-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-500
                                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                           transition-colors"
                                title="Exit Manager"
                                disabled={isSavingLayout}
                            >
                                <Icon name="logout" aria-hidden="true" className="w-4 h-4 mr-1.5" />
                                Exit
                            </button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            <main className="flex-1 overflow-hidden relative" role="main">
                {isEditorModeActive ? (
                    initialFetchDone && layoutDataForEditorInitialization ? ( // Ensure data is ready for editor
                        <LayoutEditor
                            key={layoutEditorKey}
                            initialLayout={layoutDataForEditorInitialization}
                            onSaveTrigger={handleSaveLayoutFromEditor}
                            onContentChange={handleContentChangeInEditor}
                            openAlert={openAlert}
                            isZenMode={isZenMode}
                            onToggleZenMode={toggleZenMode}
                        />
                    ) : (
                        // Show a more specific loading/error for editor if initialLayoutForEditor is somehow not ready
                        <div className="flex items-center justify-center h-full">
                            <p>Initializing editor...</p>
                        </div>
                    )
                ) : (
                    initialFetchDone && currentLayoutDataForPreview ? ( // Ensure data is ready for preview
                        <VenueLayoutPreview
                            key={`preview-${layoutEditorKey}`} // Re-key preview if its source data changes
                            layoutData={currentLayoutDataForPreview}
                            openAlert={openAlert}
                            isZenMode={isZenMode}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p>Loading preview...</p>
                        </div>
                    )
                )}
            </main>

            {/* Confirmation Modal for Toggling Mode */}
            <ConfirmationModal
                isOpen={isToggleModeConfirmationOpen}
                onClose={() => { setIsToggleModeConfirmationOpen(false); setPendingToggleModeAction(null); }}
                title="Unsaved Changes"
                message="You have unsaved changes. How would you like to proceed to Preview Mode?"
                customActions={[
                    { text: "Preview Last Saved", onClick: () => handleToggleModeConfirmation('toggleWithoutSaving'), styleType: 'secondary' },
                    // { text: "Save & Preview", onClick: () => handleToggleModeConfirmation('saveAndToggle'), styleType: 'primary' }, // Requires ability to trigger editor's save
                ]}
                cancelText="Stay in Design Mode" // Default cancel action
                onConfirm={() => handleToggleModeConfirmation('toggleWithoutSaving')} // Default action for confirm (if needed, now customActions handle it)
                type="warning"
            />

            {/* Confirmation Modal for Exiting Page */}
            <ConfirmationModal
                isOpen={isExitConfirmationOpen}
                onClose={() => setIsExitConfirmationOpen(false)}
                onConfirm={() => confirmAndExitPage(true)} // Discard changes on confirm
                title="Exit Layout Manager"
                message="You have unsaved changes. Are you sure you want to exit and discard them?"
                confirmText="Discard & Exit"
                cancelText="Stay on Page"
                type="danger"
            />

            {/* General Alert Modal */}
            <ConfirmationModal // Reusing ConfirmationModal for alerts, can be a simpler AlertModal component
                isOpen={alertModalOpen}
                onClose={closeAlert}
                onConfirm={closeAlert} // For alerts, confirm usually just closes it
                title={alertModalContent.title}
                message={alertModalContent.message}
                confirmText="OK"
                type={alertModalContent.type}
                hideCancelButton={true} // Typically alerts don't need a "cancel"
            />
        </div>
    );
};

export default VenueDesignerPage;