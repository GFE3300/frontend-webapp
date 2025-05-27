import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Core UI for the designer
import LayoutEditor from './LayoutEditor';

// Hooks
import useLayoutData from '../../hooks/useLayoutData'; // Corrected path

// Common Components
import Icon from '../../../../components/common/Icon'; // Corrected path
import ConfirmationModal from '../../../../../components/common/ConfirmationModal'; // Corrected path
import AlertModal from '../../../../../components/animated_alerts/Modal'; // Corrected path

// Constants
import {
    DEFAULT_INITIAL_GRID_ROWS,
    DEFAULT_INITIAL_GRID_COLS,
    DEFAULT_GRID_SUBDIVISION,
} from '../../constants/layoutConstants'; // Corrected path

// Default initial state for the designer if no data is loaded
const STABLE_EMPTY_DESIGN_ITEMS = Object.freeze([]);
const DEFAULT_DESIGN_GRID_CONFIG = Object.freeze({
    rows: DEFAULT_INITIAL_GRID_ROWS,
    cols: DEFAULT_INITIAL_GRID_COLS,
    gridSubdivision: DEFAULT_GRID_SUBDIVISION,
});

// --- Design Guideline Variables ---
// Using Tailwind classes directly for better maintainability and consistency with guidelines.
// These map to your design system's color palette and spacing.

const VenueDesignerPage = () => {
    const navigate = useNavigate();

    // --- State ---
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [initialLayoutForEditor, setInitialLayoutForEditor] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
    const [isZenMode, setIsZenMode] = useState(false);

    // Alert Modal State
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    // --- Callbacks for Modals & Alerts ---
    const openAlert = useCallback((title, message, type = 'info') => {
        if (isAlertModalOpen && alertModalContent.title === title && alertModalContent.message === message && type === 'error') return;
        setAlertModalContent({ title, message, type });
        setIsAlertModalOpen(true);
    }, [isAlertModalOpen, alertModalContent]);

    const closeAlert = useCallback(() => setIsAlertModalOpen(false), []);

    // --- Data Fetching & Persistence ---
    const { layoutData, saveDesignedLayout } = useLayoutData(openAlert);

    // --- Effects ---
    // Prepare initial layout data for LayoutEditor when layoutData is available or changes.
    useEffect(() => {
        setIsPageLoading(true);
        if (layoutData) {
            // Ensure a deep clone for designItems to prevent direct mutation issues if layoutData.tables is somehow mutated elsewhere
            const designItems = layoutData.tables && layoutData.tables.length > 0
                ? JSON.parse(JSON.stringify(layoutData.tables))
                : STABLE_EMPTY_DESIGN_ITEMS;

            const gridDimensions = layoutData.currentGridDimensions
                ? { ...layoutData.currentGridDimensions }
                : { ...DEFAULT_DESIGN_GRID_CONFIG };

            setInitialLayoutForEditor({
                designItems,
                gridDimensions,
                // kitchenArea: layoutData.kitchenArea, // Pass if LayoutEditor handles this
            });
        } else {
            setInitialLayoutForEditor({
                designItems: STABLE_EMPTY_DESIGN_ITEMS,
                gridDimensions: { ...DEFAULT_DESIGN_GRID_CONFIG },
            });
        }
        setIsPageLoading(false);
        setHasUnsavedChanges(false); // Reset unsaved changes flag upon loading/reloading data
    }, [layoutData]);

    // --- Event Handlers ---
    const handleContentChange = useCallback(() => {
        setHasUnsavedChanges(true);
    }, []);

    const handleSaveLayout = useCallback(async (designedLayoutFromChild) => {
        const success = await saveDesignedLayout(designedLayoutFromChild); // saveDesignedLayout from useLayoutData now returns boolean or similar
        if (success) {
            setHasUnsavedChanges(false);
            // Update initialLayoutForEditor to reflect the newly saved state, preventing "unsaved changes" warnings.
            setInitialLayoutForEditor({
                designItems: JSON.parse(JSON.stringify(designedLayoutFromChild.designItems)),
                gridDimensions: { ...designedLayoutFromChild.gridDimensions },
            });
        }
        return success; // Propagate success
    }, [saveDesignedLayout]);

    const handleSaveAndExitLayout = useCallback(async (designedLayoutFromChild) => {
        const savedSuccessfully = await handleSaveLayout(designedLayoutFromChild);
        if (savedSuccessfully) {
            navigate('/venue/operational'); // TODO: Replace with your actual operational view route constant
        }
    }, [handleSaveLayout, navigate]);

    const handleAttemptExit = useCallback(() => {
        if (hasUnsavedChanges) {
            setIsExitConfirmationOpen(true);
        } else {
            navigate('/venue/operational'); // TODO: Define this route constant
        }
    }, [hasUnsavedChanges, navigate]);

    const confirmAndExit = useCallback((discardChanges) => {
        setIsExitConfirmationOpen(false);
        if (discardChanges) {
            setHasUnsavedChanges(false); // Allow exit without saving
            navigate('/venue/operational'); // TODO: Define this route constant
        }
        // If discardChanges is false, user clicked "Stay on Page" or similar cancel action.
    }, [navigate]);

    const toggleZenMode = useCallback(() => {
        setIsZenMode(prev => !prev);
    }, []);

    const headerAnimationVariants = {
        visible: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3, ease: "circOut" } },
        hidden: { opacity: 0, height: 0, y: "-100%", transition: { duration: 0.25, ease: "circIn" } },
    };

    // Key for LayoutEditor: Forces re-initialization if the core structure of initial data changes.
    // This is particularly useful if the user clears the layout and starts fresh, or loads a new one.
    const layoutEditorKey = useMemo(() =>
        JSON.stringify(initialLayoutForEditor.gridDimensions) + (initialLayoutForEditor.designItems?.length || 0),
        [initialLayoutForEditor]
    );

    // --- Render Logic ---
    if (isPageLoading || !initialLayoutForEditor) {
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
                                   flex justify-between items-center shrink-0 z-50 px-4 md:px-6" // Guideline: px-6
                        role="banner"
                    >
                        <div className="flex items-center">
                            <Icon name="space_dashboard" aria-hidden="true" className="w-6 h-6 text-rose-500 dark:text-rose-400 mr-2.5" />
                            <h1 className="font-montserrat font-semibold text-lg text-neutral-800 dark:text-neutral-100 tracking-tight">
                                Venue Layout Designer
                            </h1>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-3">
                            <button
                                onClick={toggleZenMode}
                                title="Toggle Zen Mode"
                                aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                                className="flex items-center justify-center w-9 h-9 p-0 rounded-lg text-neutral-600 dark:text-neutral-400
                                           hover:bg-neutral-100 dark:hover:bg-neutral-700
                                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                           transition-colors"
                            >
                                <Icon name={isZenMode ? "fullscreen_exit" : "fullscreen"} className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleAttemptExit}
                                className="flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-medium
                                           bg-neutral-200 text-neutral-700 hover:bg-neutral-300
                                           dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600
                                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                           transition-colors"
                                title="Exit Designer"
                            >
                                <Icon name="logout" aria-hidden="true" className="w-4 h-4 mr-1.5" />
                                Exit Designer
                            </button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            <main className="flex-1 overflow-hidden relative" role="main">
                <LayoutEditor
                    key={layoutEditorKey}
                    initialLayout={initialLayoutForEditor}
                    onSaveTrigger={handleSaveLayout}
                    onSaveAndExitTrigger={handleSaveAndExitLayout}
                    onContentChange={handleContentChange}
                    openAlert={openAlert}
                    isZenMode={isZenMode}
                    onToggleZenMode={toggleZenMode}
                />
            </main>

            <ConfirmationModal
                isOpen={isExitConfirmationOpen}
                onClose={() => setIsExitConfirmationOpen(false)}
                onConfirm={() => confirmAndExit(true)} // true = discard changes
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to exit and discard them?"
                confirmText="Discard & Exit"
                cancelText="Stay on Page"
                type="warning" // Uses 'warning' semantic color from guidelines
            />

            <AlertModal
                isOpen={isAlertModalOpen}
                onClose={closeAlert}
                title={alertModalContent.title}
                type={alertModalContent.type}
            >
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{alertModalContent.message}</p>
            </AlertModal>
        </div>
    );
};

export default VenueDesignerPage;