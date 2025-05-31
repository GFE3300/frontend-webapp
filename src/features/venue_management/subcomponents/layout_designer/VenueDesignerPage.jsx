import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// New Header Component
import VenueDesignerHeader from './VenueDesignerHeader';

// Core UI
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

const DEBUG_MODE = import.meta.env.NODE_ENV === 'development';
const logDebug = (...args) => { if (DEBUG_MODE) { /* console.log("[VenueDesignerPage DEBUG]", ...args); */ } };

const VenueDesignerPage = () => {
    const navigate = useNavigate();

    const [isEditorModeActive, setIsEditorModeActive] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
    const [isToggleModeConfirmationOpen, setIsToggleModeConfirmationOpen] = useState(false);

    const [isZenMode, setIsZenMode] = useState(false); // This page now controls Zen for its children if header is part of it
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    const openAlert = useCallback((title, message, type = 'info') => {
        // This check was causing openAlert to be unstable if alertModalOpen/alertModalContent were in deps.
        // If this check is critical, it should be done more carefully, e.g., functional update or by Modal component.
        // For now, a simpler stable version:
        // if (alertModalOpen && alertModalContent.title === title && alertModalContent.message === message && type === 'error') return;
        setAlertModalContent({ title, message, type });
        setAlertModalOpen(true);
    }, [setAlertModalContent, setAlertModalOpen]); // Only stable setters as dependencies

    const closeAlert = useCallback(() => setAlertModalOpen(false), []);

    const [unsavedEditorStateForPreview, setUnsavedEditorStateForPreview] = useState(null); // For "Preview Unsaved"

    const {
        layoutData: backendLayoutData,
        isLoading: isLoadingLayout,
        isSaving: isSavingLayout,
        initialFetchDone,
        saveDesignedLayout,
    } = useLayoutData(openAlert);

    const layoutDataForEditorInitialization = useMemo(() => {
        logDebug("Recalculating layoutDataForEditorInitialization. initialFetchDone:", initialFetchDone);
        if (!initialFetchDone || !backendLayoutData) {
            return {
                designItems: STABLE_EMPTY_FRONTEND_DESIGN_ITEMS,
                gridDimensions: { ...DEFAULT_FRONTEND_GRID_DIMENSIONS },
                name: 'Default Venue Layout',
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
        };
    }, [initialFetchDone, backendLayoutData]);

    const layoutEditorKey = useMemo(() => {
        if (!layoutDataForEditorInitialization) return 'no-editor-data';
        return `editor-init-${layoutDataForEditorInitialization.name}-${JSON.stringify(layoutDataForEditorInitialization.gridDimensions)}`;
    }, [layoutDataForEditorInitialization]);

    // This function will be passed to LayoutEditor to capture its current state
    // when the user opts to "Preview Unsaved Changes".
    const captureCurrentEditorState = useCallback((editorState) => {
        logDebug("Capturing current editor state for unsaved preview.");
        setUnsavedEditorStateForPreview(editorState);
    }, []);

    const currentLayoutDataForPreview = useMemo(() => {
        if (unsavedEditorStateForPreview) {
            logDebug("Previewing with dynamically captured unsavedEditorStateForPreview.");
            return unsavedEditorStateForPreview;
        }
        logDebug("Previewing with layoutDataForEditorInitialization (synced with backend or initial default).");
        return layoutDataForEditorInitialization;
    }, [unsavedEditorStateForPreview, layoutDataForEditorInitialization]);


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

    const handleContentChangeInEditor = useCallback(() => {
        if (!hasUnsavedChanges) {
            logDebug("Content changed in editor. Setting hasUnsavedChanges to true.");
            setHasUnsavedChanges(true);
        }
        // When content changes, clear any previously captured "unsaved preview" state,
        // as it's now stale. It will be re-captured if user tries to preview unsaved again.
        setUnsavedEditorStateForPreview(null);
    }, [hasUnsavedChanges]);

    const handleSaveLayoutFromEditor = useCallback(async (designedLayoutFromChildInFrontendFormat) => {
        logDebug("handleSaveLayoutFromEditor called with data from LayoutEditor.");
        const layoutToSave = {
            ...designedLayoutFromChildInFrontendFormat,
            name: designedLayoutFromChildInFrontendFormat.name || backendLayoutData?.name || 'Default Venue Layout'
        };
        const success = await saveDesignedLayout(layoutToSave);
        if (success) {
            logDebug("Save successful. Resetting unsaved changes flag and unsaved preview state.");
            setHasUnsavedChanges(false);
            setUnsavedEditorStateForPreview(null);
        }
        return success;
    }, [saveDesignedLayout, backendLayoutData?.name]);

    // This ref will allow LayoutEditor to provide its current state when needed
    const layoutEditorRef = React.useRef(null);

    const handleAttemptToggleMode = useCallback(() => {
        logDebug(`Attempting to toggle mode. Currently: ${isEditorModeActive ? 'Editor' : 'Preview'}. Unsaved: ${hasUnsavedChanges}`);
        if (isEditorModeActive && hasUnsavedChanges) {
            setIsToggleModeConfirmationOpen(true);
        } else {
            setIsEditorModeActive(prev => !prev);
            if (!isEditorModeActive) { // Switching from Preview to Editor
                setUnsavedEditorStateForPreview(null); // Clear temp preview state
            }
        }
    }, [isEditorModeActive, hasUnsavedChanges]);

    const handleToggleModeConfirmation = useCallback((action) => {
        setIsToggleModeConfirmationOpen(false);
        if (action === 'cancel') return;

        if (action === 'previewUnsaved') {
            if (layoutEditorRef.current && typeof layoutEditorRef.current.getCurrentLayoutSnapshot === 'function') {
                const currentEditorSnapshot = layoutEditorRef.current.getCurrentLayoutSnapshot();
                captureCurrentEditorState(currentEditorSnapshot);
                setIsEditorModeActive(false); // Switch to Preview mode
                openAlert(
                    "Previewing Unsaved Changes",
                    "You are viewing your current unsaved changes. These are not yet saved to the server.",
                    "info"
                );
            } else {
                openAlert("Error", "Could not get current editor state for preview. Please save first.", "error");
            }
        } else if (action === 'previewLastSaved') {
            setUnsavedEditorStateForPreview(null);
            setIsEditorModeActive(false);
            openAlert(
                "Previewing Last Saved Layout",
                "Showing the last saved version. Your unsaved changes remain in the editor.",
                "info"
            );
        }
    }, [openAlert, captureCurrentEditorState]);

    const handleNavigateToOperationalView = useCallback(() => navigate('/'), [navigate]);

    const handleAttemptExitPage = useCallback(() => {
        if (hasUnsavedChanges) setIsExitConfirmationOpen(true);
        else handleNavigateToOperationalView();
    }, [hasUnsavedChanges, handleNavigateToOperationalView]);

    const confirmAndExitPage = useCallback((discardChanges) => {
        setIsExitConfirmationOpen(false);
        if (discardChanges) {
            setHasUnsavedChanges(false);
            setUnsavedEditorStateForPreview(null);
            handleNavigateToOperationalView();
        }
    }, [handleNavigateToOperationalView]);

    const toggleZenMode = useCallback(() => setIsZenMode(prev => !prev), []);

    // Functions to be passed to VenueLayoutPreview for its actions
    const handleDownloadAllQRsForPreview = useCallback(() => {
        // The QR download logic is inside VenueLayoutPreview.
        // This callback is mostly a placeholder if VenueDesignerPage needed to trigger it.
        // For now, VenueLayoutPreview handles its own "Download All QRs" button.
        logDebug("Trigger Download All QRs from Preview (if button were here)");
        // If the button was in VenueDesignerHeader, it would call this,
        // and this would need a ref to VenueLayoutPreview to trigger its internal downloadAllQrs.
        // For simplicity, keeping the button in VenueLayoutPreview's sidebar.
    }, []);


    if (isLoadingLayout && !initialFetchDone) { /* ... loading state ... */ }
    if (initialFetchDone && !backendLayoutData) { /* ... error state ... */ }

    return (
        <div className={`h-screen w-full flex flex-col overflow-hidden antialiased bg-neutral-100 dark:bg-neutral-900 transition-colors duration-300 ${isZenMode ? 'is-zen-mode' : ''}`}>
            {/* VenueDesignerHeader is now part of the main content flow, not fixed globally if this is a tab */}
            {!isZenMode && (
                <VenueDesignerHeader
                    isEditorModeActive={isEditorModeActive}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isSavingLayout={isSavingLayout}
                    isLoadingLayout={isLoadingLayout && initialFetchDone}
                    onToggleMode={handleAttemptToggleMode}
                    onAttemptExitPage={handleAttemptExitPage} // If exit is managed here
                    onToggleZenMode={toggleZenMode} // Pass zen mode toggle
                    layoutName={layoutDataForEditorInitialization.name}
                    // Props for actions specific to header buttons if they exist:
                    // onTriggerSave={layoutEditorRef.current?.triggerSave} // Example if save was in this header
                    onDownloadAllQRs={handleDownloadAllQRsForPreview} // Example if download was here
                />
            )}

            <main className="flex-1 overflow-hidden relative" role="main">
                <AnimatePresence mode="wait">
                    {isEditorModeActive ? (
                        layoutDataForEditorInitialization ? (
                            <motion.div key="layout-editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full w-full">
                                <LayoutEditor
                                    ref={layoutEditorRef} // Add ref to LayoutEditor
                                    key={layoutEditorKey}
                                    initialLayout={layoutDataForEditorInitialization}
                                    onSaveTrigger={handleSaveLayoutFromEditor}
                                    onContentChange={handleContentChangeInEditor}
                                    openAlert={openAlert}
                                    isZenMode={isZenMode}
                                    onToggleZenMode={toggleZenMode} // LayoutEditor controls its own zen aspects
                                />
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-center h-full"><Icon name="progress_activity" className="w-8 h-8 animate-spin mr-2" />Initializing Editor...</div>
                        )
                    ) : (
                        currentLayoutDataForPreview ? (
                            <motion.div key="layout-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full w-full">
                                <VenueLayoutPreview
                                    key={`preview-${layoutEditorKey}-${unsavedEditorStateForPreview ? 'dynamic' : 'static'}`}
                                    layoutData={currentLayoutDataForPreview}
                                    openAlert={openAlert}
                                    isZenMode={isZenMode} // Preview might also respect zen mode
                                />
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-center h-full"><Icon name="progress_activity" className="w-8 h-8 animate-spin mr-2" />Loading Preview...</div>
                        )
                    )}
                </AnimatePresence>
            </main>

            <ConfirmationModal
                isOpen={isToggleModeConfirmationOpen}
                onClose={() => handleToggleModeConfirmation('cancel')}
                title="Unsaved Changes"
                message="You have unsaved changes. How would you like to proceed to Preview Mode?"
                customActions={[
                    { text: "Preview Unsaved", onClick: () => handleToggleModeConfirmation('previewUnsaved'), styleType: 'primary' },
                    { text: "Preview Last Saved", onClick: () => handleToggleModeConfirmation('previewLastSaved'), styleType: 'secondary' },
                ]}
                cancelText="Stay in Design Mode"
                type="warning"
            />
            {/* ... other modals (ExitConfirmation, AlertModal) ... */}
            <ConfirmationModal
                isOpen={isExitConfirmationOpen}
                onClose={() => setIsExitConfirmationOpen(false)}
                onConfirm={() => confirmAndExitPage(true)}
                title="Exit Layout Manager"
                message="You have unsaved changes. Are you sure you want to exit and discard them?"
                confirmText="Discard & Exit"
                cancelText="Stay on Page"
                type="danger"
            />

            <ConfirmationModal
                isOpen={alertModalOpen}
                onClose={closeAlert}
                onConfirm={closeAlert}
                title={alertModalContent.title}
                message={alertModalContent.message}
                confirmText="OK"
                type={alertModalContent.type}
                hideCancelButton={true}
            />
        </div>
    );
};
// Loading and Error states for initial fetch
VenueDesignerPage.Loading = () => (
    <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900">
        <Icon name="progress_activity" aria-hidden="true" className="w-12 h-12 text-rose-500 dark:text-rose-400 animate-spin" />
        <p className="ml-3 text-lg font-montserrat font-semibold text-rose-700 dark:text-rose-400">Loading Venue Designer...</p>
    </div>
);

VenueDesignerPage.Error = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900 p-6 text-center">
        <Icon name="error_outline" aria-hidden="true" className="w-16 h-16 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-montserrat font-semibold text-red-700 dark:text-red-400 mb-2">Failed to Load Layout Data</h2>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">Could not initialize layout data. Please try refreshing. If the problem persists, contact support.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors">Refresh Page</button>
    </div>
);


export default VenueDesignerPage;