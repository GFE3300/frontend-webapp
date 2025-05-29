// FILE: VenueDesignerPage.jsx
// PATH: C:\Users\Gilberto F\Desktop\Smore\frontend\src\features\venue_management\subcomponents\layout_designer\VenueDesignerPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Core UI for the designer
import LayoutEditor from './LayoutEditor';
// Placeholder for the new/refactored preview component
// import VenueLayoutPreview from './VenueLayoutPreview'; // We will create this next

// Hooks
import useLayoutData from '../../hooks/useLayoutData';

// Common Components
import Icon from '../../../../components/common/Icon';
import ConfirmationModal from '../../../../components/common/ConfirmationModal'; // Corrected path based on file structure
import VenueLayoutPreview from './VenueLayoutPreview';

// Constants
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION,
} from '../../constants/layoutConstants';

// Default initial state for the designer if no data is loaded
const STABLE_EMPTY_DESIGN_ITEMS = Object.freeze([]);
const DEFAULT_DESIGN_GRID_CONFIG = Object.freeze({
    rows: DEFAULT_INITIAL_GRID_ROWS,
    cols: DEFAULT_INITIAL_GRID_COLS,
    gridSubdivision: DEFAULT_GRID_SUBDIVISION,
});

const VenueDesignerPage = () => {
    const navigate = useNavigate();

    // --- State ---
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isEditorModeActive, setIsEditorModeActive] = useState(false); // true for LayoutEditor, false for VenueLayoutPreview
    const [initialLayoutForEditor, setInitialLayoutForEditor] = useState(null); // For LayoutEditor initialization
    const [currentLayoutDataForPreview, setCurrentLayoutDataForPreview] = useState(null); // For VenueLayoutPreview display
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
    const [isZenMode, setIsZenMode] = useState(false);

    // Alert Modal State
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    // --- Callbacks for Modals & Alerts ---
    const openAlert = useCallback((title, message, type = 'info') => {
        // Debounce error alerts with the same message to prevent spamming
        if (isAlertModalOpen && alertModalContent.title === title && alertModalContent.message === message && type === 'error') {
            return;
        }
        setAlertModalContent({ title, message, type });
        setIsAlertModalOpen(true);
    }, [isAlertModalOpen, alertModalContent]);

    const closeAlert = useCallback(() => setIsAlertModalOpen(false), []);

    // --- Data Fetching & Persistence ---
    const { layoutData, saveDesignedLayout } = useLayoutData(openAlert);

    // --- Effects ---
    // Initialize and update layout data for both editor and preview
    useEffect(() => {
        setIsPageLoading(true);
        if (layoutData) {
            const designItems = layoutData.designItems // MODIFIED: Use layoutData.designItems directly
                ? JSON.parse(JSON.stringify(layoutData.designItems))
                : STABLE_EMPTY_DESIGN_ITEMS;

            const gridDimensions = layoutData.gridDimensions // MODIFIED: Use layoutData.gridDimensions directly
                ? { ...layoutData.gridDimensions }
                : { ...DEFAULT_DESIGN_GRID_CONFIG };

            const fullLayout = {
                designItems,
                gridDimensions,
                kitchenArea: layoutData.kitchenArea,
            };

            setInitialLayoutForEditor(fullLayout);
            setCurrentLayoutDataForPreview(fullLayout);

        } else {
            const defaultFullLayout = {
                designItems: STABLE_EMPTY_DESIGN_ITEMS,
                gridDimensions: { ...DEFAULT_DESIGN_GRID_CONFIG },
                kitchenArea: null,
            };
            setInitialLayoutForEditor(defaultFullLayout);
            setCurrentLayoutDataForPreview(defaultFullLayout);
        }
        setIsPageLoading(false);
        setHasUnsavedChanges(false);
    }, [layoutData]);

    // --- Event Handlers ---
    const handleContentChangeInEditor = useCallback(() => {
        setHasUnsavedChanges(true);
    }, []);

    const handleSaveLayoutFromEditor = useCallback(async (designedLayoutFromChild) => {
        const success = await saveDesignedLayout(designedLayoutFromChild);
        if (success) {
            setHasUnsavedChanges(false);
            openAlert("Layout Saved", "Your venue layout has been successfully saved.", "success");
        } else {
            openAlert("Save Failed", "Could not save the layout. Please try again.", "error");
        }
        return success;
    }, [saveDesignedLayout, openAlert]);

    const handleToggleEditorMode = useCallback(() => {
        if (isEditorModeActive && hasUnsavedChanges) {
            openAlert("Previewing Changes", "You are now previewing. Changes are not saved yet.", "info");
        }
        setIsEditorModeActive(prev => !prev);
    }, [isEditorModeActive, hasUnsavedChanges, openAlert]);

    const handleNavigateToOperationalView = useCallback(() => {
        openAlert("Exited Designer", "You have left the Venue Layout Designer.", "info");
        navigate('/');
    }, [navigate, openAlert]);


    const handleAttemptExitPage = useCallback(() => {
        if (hasUnsavedChanges) {
            setIsExitConfirmationOpen(true);
        } else {
            handleNavigateToOperationalView();
        }
    }, [hasUnsavedChanges, handleNavigateToOperationalView]);

    const confirmAndExitPage = useCallback((discardChanges) => {
        setIsExitConfirmationOpen(false);
        if (discardChanges) {
            setHasUnsavedChanges(false);
            handleNavigateToOperationalView();
        }
    }, [handleNavigateToOperationalView]);

    const toggleZenMode = useCallback(() => {
        setIsZenMode(prev => !prev);
    }, []);

    const headerAnimationVariants = {
        visible: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3, ease: "circOut" } },
        hidden: { opacity: 0, height: 0, y: "-100%", transition: { duration: 0.25, ease: "circIn" } },
    };

    const layoutEditorKey = useMemo(() =>
        initialLayoutForEditor ? JSON.stringify(initialLayoutForEditor.gridDimensions) + (initialLayoutForEditor.designItems?.length || 0) : 'no-layout-editor-data',
        [initialLayoutForEditor]
    );

    if (isPageLoading || !initialLayoutForEditor || !currentLayoutDataForPreview) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900">
                <Icon name="progress_activity" aria-hidden="true" className="w-12 h-12 text-rose-500 dark:text-rose-400 animate-spin" />
                <p className="ml-3 text-lg font-montserrat font-semibold text-rose-700 dark:text-rose-400">
                    Loading Designer...
                </p>
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
                            </h1>
                            <span className={`ml-3 text-xs px-2 py-0.5 rounded-full font-medium
                                ${isEditorModeActive ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                                    : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'}`}>
                                {isEditorModeActive ? 'Design Mode' : 'Preview Mode'}
                            </span>
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
                        key={layoutEditorKey}
                        initialLayout={initialLayoutForEditor}
                        onSaveTrigger={handleSaveLayoutFromEditor}
                        onContentChange={handleContentChangeInEditor}
                        openAlert={openAlert}
                        isZenMode={isZenMode}
                        onToggleZenMode={toggleZenMode}
                    />
                ) : (
                    <VenueLayoutPreview
                        layoutData={currentLayoutDataForPreview}
                        openAlert={openAlert}
                        isZenMode={isZenMode}
                    />
                )}
            </main>

            <ConfirmationModal
                isOpen={isExitConfirmationOpen}
                onClose={() => setIsExitConfirmationOpen(false)}
                onConfirm={() => confirmAndExitPage(true)}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to exit and discard them?"
                confirmText="Discard & Exit"
                cancelText="Stay on Page"
                type="warning"
            />

            {/* MODIFIED ConfirmationModal for alerts */}
            <ConfirmationModal
                isOpen={isAlertModalOpen}
                onClose={closeAlert}      // Handles 'X' button, backdrop click, or Escape key
                onConfirm={closeAlert}    // Explicitly wire the "OK" button to closeAlert
                title={alertModalContent.title}
                message={alertModalContent.message}
                confirmText="OK"
                type={alertModalContent.type}
            // By not providing cancelText, the cancel button should be hidden by ConfirmationModal.
            // If it's not, ConfirmationModal would need a prop like `hideCancelButton={true}`
            // or ensure its internal "Cancel" button also calls `onClose`.
            />
        </div>
    );
};

export default VenueDesignerPage;