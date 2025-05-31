// features\venue_management\subcomponents\layout_designer\VenueDesignerPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // Added useRef
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

    const [isZenMode, setIsZenMode] = useState(false);
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    const openAlert = useCallback((title, message, type = 'info') => {
        setAlertModalContent({ title, message, type });
        setAlertModalOpen(true);
    }, [setAlertModalContent, setAlertModalOpen]); // Stable dependencies

    const closeAlert = useCallback(() => setAlertModalOpen(false), []);

    const [unsavedEditorStateForPreview, setUnsavedEditorStateForPreview] = useState(null);

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

    const layoutEditorRef = React.useRef(null);

    // Refs for state values to stabilize callbacks
    const isEditorModeActiveRef = useRef(isEditorModeActive);
    const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

    useEffect(() => {
        isEditorModeActiveRef.current = isEditorModeActive;
    }, [isEditorModeActive]);

    useEffect(() => {
        hasUnsavedChangesRef.current = hasUnsavedChanges;
    }, [hasUnsavedChanges]);

    const handleAttemptToggleMode = useCallback(() => {
        logDebug(`Attempting to toggle mode. Currently: ${isEditorModeActiveRef.current ? 'Editor' : 'Preview'}. Unsaved: ${hasUnsavedChangesRef.current}`);
        if (isEditorModeActiveRef.current && hasUnsavedChangesRef.current) {
            setIsToggleModeConfirmationOpen(true);
        } else {
            setIsEditorModeActive(prevIsEditorModeActive => {
                const newIsEditorModeActive = !prevIsEditorModeActive;
                if (!newIsEditorModeActive) { // If toggling TO preview mode
                    setUnsavedEditorStateForPreview(null);
                }
                return newIsEditorModeActive;
            });
        }
    }, [setIsToggleModeConfirmationOpen, setIsEditorModeActive, setUnsavedEditorStateForPreview]); // Dependencies are now stable setters

    const handleToggleModeConfirmation = useCallback((action) => {
        setIsToggleModeConfirmationOpen(false);
        if (action === 'cancel') return;

        if (action === 'previewUnsaved') {
            if (layoutEditorRef.current && typeof layoutEditorRef.current.getCurrentLayoutSnapshot === 'function') {
                const currentEditorSnapshot = layoutEditorRef.current.getCurrentLayoutSnapshot();
                captureCurrentEditorState(currentEditorSnapshot);
                setIsEditorModeActive(false);
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
    }, [openAlert, captureCurrentEditorState]); // setIsEditorModeActive removed as it's handled by the callback from `handleAttemptToggleMode` now

    const handleNavigateToOperationalView = useCallback(() => navigate('/'), [navigate]);

    const handleAttemptExitPage = useCallback(() => {
        if (hasUnsavedChangesRef.current) setIsExitConfirmationOpen(true); // Use ref here
        else handleNavigateToOperationalView();
    }, [handleNavigateToOperationalView]); // hasUnsavedChanges removed, using ref

    const confirmAndExitPage = useCallback((discardChanges) => {
        setIsExitConfirmationOpen(false);
        if (discardChanges) {
            setHasUnsavedChanges(false);
            setUnsavedEditorStateForPreview(null);
            handleNavigateToOperationalView();
        }
    }, [handleNavigateToOperationalView]);

    const toggleZenMode = useCallback(() => setIsZenMode(prev => !prev), []);

    const handleDownloadAllQRsForPreview = useCallback(() => {
        logDebug("Trigger Download All QRs from Preview (if button were here)");
    }, []);


    if (isLoadingLayout && !initialFetchDone) {
        return <VenueDesignerPage.Loading />;
    }
    if (initialFetchDone && !backendLayoutData) {
        return <VenueDesignerPage.Error />;
    }

    return (
        <div className={`h-screen w-full flex flex-col overflow-hidden antialiased bg-neutral-100 dark:bg-neutral-900 transition-colors duration-300 ${isZenMode ? 'is-zen-mode' : ''}`}>
            {!isZenMode && (
                <VenueDesignerHeader
                    isEditorModeActive={isEditorModeActive}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isSavingLayout={isSavingLayout}
                    isLoadingLayout={isLoadingLayout && initialFetchDone} // Show loading only after initial fetch if still loading
                    onToggleMode={handleAttemptToggleMode}
                    onAttemptExitPage={handleAttemptExitPage}
                    onToggleZenMode={toggleZenMode}
                    layoutName={layoutDataForEditorInitialization.name}
                    onDownloadAllQRs={handleDownloadAllQRsForPreview}
                />
            )}

            <main className="flex-1 overflow-hidden relative" role="main">
                <AnimatePresence mode="wait">
                    {isEditorModeActive ? (
                        layoutDataForEditorInitialization ? (
                            <motion.div key="layout-editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full w-full">
                                <LayoutEditor
                                    ref={layoutEditorRef}
                                    key={layoutEditorKey}
                                    initialLayout={layoutDataForEditorInitialization}
                                    onSaveTrigger={handleSaveLayoutFromEditor}
                                    onContentChange={handleContentChangeInEditor}
                                    openAlert={openAlert}
                                    isZenMode={isZenMode}
                                    onToggleZenMode={toggleZenMode}
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
                                    isZenMode={isZenMode}
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
                type={alertModalContent.type}
                hideCancelButton={true}
            />
        </div>
    );
};

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