import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';

// Core UI for the designer
import LayoutEditor from './LayoutEditor';
import VenueLayoutPreview from './VenueLayoutPreview';

// Hooks
import useLayoutData from '../../hooks/useLayoutData';

// Common Components
import Icon from '../../../../components/common/Icon';
import ConfirmationModal from '../../../../components/common/ConfirmationModal'; // Corrected path based on file structure

// Constants & Utils
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION,
} from '../../constants/layoutConstants';
import { parseBackendLayoutItemsToFrontend } from '../../utils/layoutUtils'; // Import the parser

// Default initial state for the designer if no data is loaded (frontend format)
const STABLE_EMPTY_FRONTEND_DESIGN_ITEMS = Object.freeze([]);
const DEFAULT_FRONTEND_GRID_DIMENSIONS = Object.freeze({
    rows: DEFAULT_INITIAL_GRID_ROWS,
    cols: DEFAULT_INITIAL_GRID_COLS,
    gridSubdivision: DEFAULT_GRID_SUBDIVISION,
});

const VenueDesignerPage = () => {
    const navigate = useNavigate();

    // --- State ---
    // isPageLoading is now primarily driven by useLayoutData's isLoading
    const [isEditorModeActive, setIsEditorModeActive] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
    const [isZenMode, setIsZenMode] = useState(false);

    // Alert Modal State
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    // --- Callbacks for Modals & Alerts ---
    const openAlert = useCallback((title, message, type = 'info') => {
        if (isAlertModalOpen && alertModalContent.title === title && alertModalContent.message === message && type === 'error') {
            return;
        }
        setAlertModalContent({ title, message, type });
        setIsAlertModalOpen(true);
    }, [isAlertModalOpen, alertModalContent]);

    const closeAlert = useCallback(() => setIsAlertModalOpen(false), []);

    // --- Data Fetching & Persistence ---
    // useLayoutData now returns:
    // layoutData (in backend format: {id, name, grid_rows, grid_cols, grid_subdivision, items: [...]})
    // isLoading, isSaving, initialFetchDone
    // saveDesignedLayout (expects frontend-formatted layout)
    // resetLayoutToLocalDefaults
    const {
        layoutData: backendLayoutData, // Renamed for clarity
        isLoading: isLoadingLayout,
        isSaving: isSavingLayout,
        initialFetchDone,
        saveDesignedLayout,
        // resetLayoutToLocalDefaults // If needed, can be re-added
    } = useLayoutData(openAlert);

    // --- Derived State for Editor and Preview ---
    // These will hold the layout data in FRONTEND format after parsing
    const initialLayoutForEditor = useMemo(() => {
        if (!initialFetchDone || !backendLayoutData) {
            // Return a default structure if data not yet fetched or is null
            return {
                designItems: STABLE_EMPTY_FRONTEND_DESIGN_ITEMS,
                gridDimensions: { ...DEFAULT_FRONTEND_GRID_DIMENSIONS },
                // kitchenArea handling: If kitchenArea is part of backendLayoutData, map it here.
                // Otherwise, it might be derived or managed separately within LayoutEditor.
                // For now, assuming kitchenArea might come from backendLayoutData or be null.
                kitchenArea: backendLayoutData?.kitchen_area_definition || null, // Example if backend had it
            };
        }
        // Parse backend items to frontend format
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
            kitchenArea: backendLayoutData.kitchen_area_definition || null, // Example
        };
    }, [initialFetchDone, backendLayoutData]);

    // currentLayoutDataForPreview should reflect the most up-to-date state,
    // which could be the saved state from backend, or if unsaved changes exist,
    // it might need to get that from LayoutEditor (more complex scenario).
    // For simplicity now, preview will show the last saved state.
    // If live preview of unsaved changes is needed, this logic would be more involved.
    const currentLayoutDataForPreview = useMemo(() => {
        // This uses the same logic as initialLayoutForEditor, effectively showing the
        // last fetched/saved state. If LayoutEditor internally updates its state and we want
        // preview to reflect that *before* saving, we'd need to lift editor's current state up.
        // For now, Preview shows the "source of truth" from useLayoutData.
        return initialLayoutForEditor;
    }, [initialLayoutForEditor]);


    // --- Effects ---
    // This effect is for the "beforeunload" browser event if needed.
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


    // --- Event Handlers ---
    const handleContentChangeInEditor = useCallback(() => {
        setHasUnsavedChanges(true);
    }, []);

    const handleSaveLayoutFromEditor = useCallback(async (designedLayoutFromChildInFrontendFormat) => {
        // designedLayoutFromChildInFrontendFormat contains designItems in frontend format
        // and gridDimensions.
        // saveDesignedLayout from useLayoutData expects this structure.
        const success = await saveDesignedLayout(designedLayoutFromChildInFrontendFormat);
        if (success) {
            setHasUnsavedChanges(false);
            // openAlert is handled by useLayoutData on success/failure of save
        }
        return success;
    }, [saveDesignedLayout]);

    const handleToggleEditorMode = useCallback(() => {
        if (isEditorModeActive && hasUnsavedChanges) {
            openAlert("Previewing Unsaved Changes", "You are now previewing. Changes are not yet saved to the server.", "info");
        } else if (!isEditorModeActive && hasUnsavedChanges) {
            openAlert("Editing Unsaved Changes", "You are back in Design Mode with unsaved changes.", "info");
        }
        setIsEditorModeActive(prev => !prev);
    }, [isEditorModeActive, hasUnsavedChanges, openAlert]);

    const handleNavigateToOperationalView = useCallback(() => {
        // No alert here, as it implies changes are handled or discarded.
        // Alert for "Exited Designer" could be if navigate was successful from dashboard.
        navigate('/');
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
            setHasUnsavedChanges(false); // Mark as not having unsaved changes before navigating
            handleNavigateToOperationalView();
        }
        // If !discardChanges, they chose "Stay on Page", so do nothing.
    }, [handleNavigateToOperationalView]);

    const toggleZenMode = useCallback(() => {
        setIsZenMode(prev => !prev);
    }, []);

    const headerAnimationVariants = {
        visible: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3, ease: "circOut" } },
        hidden: { opacity: 0, height: 0, y: "-100%", transition: { duration: 0.25, ease: "circIn" } },
    };

    // Key for LayoutEditor to force re-mount if fundamental initial data structure changes significantly.
    // This helps reset its internal useHistory state if a completely new layout is loaded.
    const layoutEditorKey = useMemo(() => {
        if (!initialLayoutForEditor) return 'no-editor-data';
        return JSON.stringify({
            grid: initialLayoutForEditor.gridDimensions,
            itemCount: initialLayoutForEditor.designItems?.length || 0,
            // Potentially include a hash or version of items if deep reset is needed
        });
    }, [initialLayoutForEditor]);


    if (isLoadingLayout && !initialFetchDone) { // Show loading only on initial fetch
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900">
                <Icon name="progress_activity" aria-hidden="true" className="w-12 h-12 text-rose-500 dark:text-rose-400 animate-spin" />
                <p className="ml-3 text-lg font-montserrat font-semibold text-rose-700 dark:text-rose-400">
                    Loading Venue Designer...
                </p>
            </div>
        );
    }

    if (!initialFetchDone && !backendLayoutData) { // If fetch failed and we have no data (stuck)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900 p-6 text-center">
                <Icon name="error_outline" aria-hidden="true" className="w-16 h-16 text-red-500 dark:text-red-400 mb-4" />
                <h2 className="text-xl font-montserrat font-semibold text-red-700 dark:text-red-400 mb-2">Failed to Load Layout</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                    We couldn't retrieve your venue layout data. Please check your internet connection and try refreshing the page.
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
        <div className="h-screen w-screen flex flex-col fixed inset-0 overflow-hidden antialiased bg-neutral-100 dark:bg-neutral-900">
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
                            {hasUnsavedChanges && isEditorModeActive && (
                                <span className="ml-3 text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                                    Unsaved
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
                                disabled={isSavingLayout}
                            >
                                <Icon name={isEditorModeActive ? "visibility" : "edit"} className="w-4 h-4 mr-1.5" />
                                {isEditorModeActive ? "Preview Layout" : "Edit Layout"}
                            </button>
                            <button
                                onClick={handleAttemptExitPage}
                                className="flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-medium
                                           bg-neutral-200 text-neutral-700 hover:bg-neutral-300
                                           dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600
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
                    <LayoutEditor
                        key={layoutEditorKey} // Ensure editor remounts if initial data changes drastically
                        initialLayout={initialLayoutForEditor} // Pass frontend-formatted layout
                        onSaveTrigger={handleSaveLayoutFromEditor}
                        onContentChange={handleContentChangeInEditor}
                        openAlert={openAlert}
                        isZenMode={isZenMode}
                        onToggleZenMode={toggleZenMode}
                    />
                ) : (
                    <VenueLayoutPreview
                        // Pass frontend-formatted layout, and key it if its data source can change
                        key={`preview-${layoutEditorKey}`}
                        layoutData={currentLayoutDataForPreview}
                        openAlert={openAlert}
                        isZenMode={isZenMode} // Pass ZenMode to preview if it needs to adapt
                    />
                )}
            </main>

            <ConfirmationModal
                isOpen={isExitConfirmationOpen}
                onClose={() => setIsExitConfirmationOpen(false)}
                onConfirm={() => confirmAndExitPage(true)} // Discard changes on confirm
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to exit and discard them?"
                confirmText="Discard & Exit"
                cancelText="Stay on Page"
                type="warning"
            />

            <ConfirmationModal
                isOpen={isAlertModalOpen}
                onClose={closeAlert}
                onConfirm={closeAlert}
                title={alertModalContent.title}
                message={alertModalContent.message}
                confirmText="OK"
                type={alertModalContent.type}
            />
        </div>
    );
};

export default VenueDesignerPage;