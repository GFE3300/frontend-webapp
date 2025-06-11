import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';

import VenueDesignerHeader from './VenueDesignerHeader';
import LayoutEditor from './LayoutEditor';
import VenueLayoutPreview from './VenueLayoutPreview';
import useLayoutData from '../../hooks/useLayoutData';
import Icon from '../../../../components/common/Icon';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION,
} from '../../constants/layoutConstants';
import { parseBackendLayoutItemsToFrontend } from '../../utils/layoutUtils';

// Localization
import slRaw from '../../utils/script_lines.js'; // No interpolate needed directly here but good practice
const sl = slRaw.venueManagement.venueDesignerPage;
const slCommon = slRaw; // For general strings like "Error", "Info"

const STABLE_EMPTY_FRONTEND_DESIGN_ITEMS = Object.freeze([]);
const DEFAULT_FRONTEND_GRID_DIMENSIONS = Object.freeze({
    rows: DEFAULT_INITIAL_GRID_ROWS,
    cols: DEFAULT_INITIAL_GRID_COLS,
    gridSubdivision: DEFAULT_GRID_SUBDIVISION,
});

const DEBUG_MODE = import.meta.env.NODE_ENV === 'development';
const logDebug = (...args) => { if (DEBUG_MODE) { console.log("[VenueDesignerPage DEBUG]", ...args); } };

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
    }, []);

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
                name: sl.defaultLayoutName || 'Default Venue Layout',
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
            name: backendLayoutData.name || sl.defaultLayoutName || 'Default Venue Layout',
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
                e.returnValue = ''; // Standard for most browsers
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
        // When content changes in editor, assume we are no longer previewing a specific "unsaved" state.
        // The editor itself is now the source of truth for any unsaved data.
        setUnsavedEditorStateForPreview(null);
    }, [hasUnsavedChanges]);

    const handleSaveLayoutFromEditor = useCallback(async (designedLayoutFromChildInFrontendFormat) => {
        logDebug("handleSaveLayoutFromEditor called with data from LayoutEditor.");
        const layoutToSave = {
            ...designedLayoutFromChildInFrontendFormat,
            name: designedLayoutFromChildInFrontendFormat.name || backendLayoutData?.name || (sl.defaultLayoutName || 'Default Venue Layout')
        };
        const success = await saveDesignedLayout(layoutToSave);
        if (success) {
            logDebug("Save successful. Resetting unsaved changes flag and unsaved preview state.");
            setHasUnsavedChanges(false);
            setUnsavedEditorStateForPreview(null);
        }
        return success;
    }, [saveDesignedLayout, backendLayoutData?.name]);

    const layoutEditorRef = useRef(null); // Changed React.useRef to useRef

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
                if (!newIsEditorModeActive) {
                    setUnsavedEditorStateForPreview(null);
                }
                return newIsEditorModeActive;
            });
        }
    }, []); // Dependencies are stable setters

    const handleToggleModeConfirmation = useCallback((action) => {
        setIsToggleModeConfirmationOpen(false);
        if (action === 'cancel') return;

        if (action === 'previewUnsaved') {
            if (layoutEditorRef.current && typeof layoutEditorRef.current.getCurrentLayoutSnapshot === 'function') {
                const currentEditorSnapshot = layoutEditorRef.current.getCurrentLayoutSnapshot();
                captureCurrentEditorState(currentEditorSnapshot);
                setIsEditorModeActive(false);
                openAlert(
                    sl.previewingUnsavedAlertTitle || "Previewing Unsaved Changes",
                    sl.previewingUnsavedAlertMessage || "You are viewing your current unsaved changes. These are not yet saved to the server.",
                    "info"
                );
            } else {
                openAlert(
                    sl.errorGettingEditorStateTitle || slCommon.error || "Error",
                    sl.errorGettingEditorStateMessage || "Could not get current editor state for preview. Please save first.",
                    "error"
                );
            }
        } else if (action === 'previewLastSaved') {
            setUnsavedEditorStateForPreview(null); // Clear any temp preview state
            setIsEditorModeActive(false); // Switch to preview mode
            openAlert(
                sl.previewingLastSavedAlertTitle || "Previewing Last Saved Layout",
                sl.previewingLastSavedAlertMessage || "Showing the last saved version. Your unsaved changes remain in the editor.",
                "info"
            );
        }
    }, [openAlert, captureCurrentEditorState]);

    const handleNavigateToOperationalView = useCallback(() => navigate('/'), [navigate]);

    const handleAttemptExitPage = useCallback(() => {
        if (hasUnsavedChangesRef.current) setIsExitConfirmationOpen(true);
        else handleNavigateToOperationalView();
    }, [handleNavigateToOperationalView]);

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
        // This function would likely be passed to VenueLayoutPreview if the button is there
        // For now, it's tied to the header's context.
    }, []);


    if (isLoadingLayout && !initialFetchDone) {
        return <VenueDesignerPage.Loading />;
    }
    // initialFetchDone but backendLayoutData is still null/undefined usually indicates an unrecoverable error from useLayoutData
    if (initialFetchDone && !backendLayoutData) {
        return <VenueDesignerPage.Error />;
    }

    return (
        <div className={`relative h-full w-full overflow-visible antialiased bg-transparent transition-colors duration-300 ${isZenMode ? 'is-zen-mode' : ''}`}>

            {!isZenMode && (
                <VenueDesignerHeader
                    isEditorModeActive={isEditorModeActive}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isSavingLayout={isSavingLayout}
                    isLoadingLayout={isLoadingLayout && initialFetchDone}
                    onToggleMode={handleAttemptToggleMode}
                    onAttemptExitPage={handleAttemptExitPage} // This prop might be for a "back" button not shown
                    onToggleZenMode={toggleZenMode}
                    layoutName={layoutDataForEditorInitialization.name}
                    onDownloadAllQRs={handleDownloadAllQRsForPreview} // Passed to header
                />
            )}

            <main className="flex-1 h-[calc(100%-124px)] sm:h-[calc(100%-72px)] overflow-visible">
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
                            <div className="flex items-center justify-center h-full">
                                <Icon name="progress_activity" className="w-8 h-8 animate-spin mr-2" />
                                {sl.initializingEditor || "Initializing Editor..."}
                            </div>
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
                            <div className="flex items-center justify-center h-full">
                                <Icon name="progress_activity" className="w-8 h-8 animate-spin mr-2" />
                                {sl.loadingPreview || "Loading Preview..."}
                            </div>
                        )
                    )}
                </AnimatePresence>
            </main>

            <ConfirmationModal
                isOpen={isToggleModeConfirmationOpen}
                onClose={() => handleToggleModeConfirmation('cancel')}
                title={sl.unsavedChangesTitle || "Unsaved Changes"}
                message={sl.switchToPreviewConfirmationMessage || "You have unsaved changes. How would you like to proceed to Preview Mode?"}
                customActions={[
                    { text: sl.previewUnsavedButton || "Preview Unsaved", onClick: () => handleToggleModeConfirmation('previewUnsaved'), styleType: 'primary' },
                    { text: sl.previewLastSavedButton || "Preview Last Saved", onClick: () => handleToggleModeConfirmation('previewLastSaved'), styleType: 'secondary' },
                ]}
                cancelText={sl.stayInDesignButton || "Stay in Design Mode"}
                type="warning"
            />
            <ConfirmationModal
                isOpen={isExitConfirmationOpen}
                onClose={() => setIsExitConfirmationOpen(false)}
                onConfirm={() => confirmAndExitPage(true)}
                title={sl.exitLayoutManagerTitle || "Exit Layout Manager"}
                message={sl.exitLayoutManagerConfirmationMessage || "You have unsaved changes. Are you sure you want to exit and discard them?"}
                confirmText={sl.discardAndExitButton || "Discard & Exit"}
                cancelText={sl.stayOnPageButton || "Stay on Page"}
                type="danger"
            />

            <ConfirmationModal
                isOpen={alertModalOpen}
                onClose={closeAlert}
                onConfirm={closeAlert} // For simple alerts, confirm acts as close
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
        <Icon name="progress_activity" aria-hidden="true" className="w-12 h-12 text-rose-500 dark:text-rose-400 animate-spin" style={{ fontSize: '3rem' }} />
        <p className="ml-3 text-lg font-montserrat font-semibold text-rose-700 dark:text-rose-400">
            {sl.loadingPageTitle || "Loading Venue Designer..."}
        </p>
    </div>
);

VenueDesignerPage.Error = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900 p-6 text-center">
        <Icon name="error_outline" aria-hidden="true" className="w-16 h-16 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-montserrat font-semibold text-red-700 dark:text-red-400 mb-2">
            {sl.errorPageTitle || "Failed to Load Layout Data"}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
            {sl.errorPageMessage || "Could not initialize layout data. Please try refreshing. If the problem persists, contact support."}
        </p>
        <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-rose-500 text-white font-medium rounded-full font-montserrat hover:bg-rose-600 transition-colors"
        >
            {sl.refreshPageButton || "Refresh Page"}
        </button>
    </div>
);

export default VenueDesignerPage;