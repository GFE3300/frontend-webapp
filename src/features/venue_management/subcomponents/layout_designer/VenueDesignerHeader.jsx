import React, { useCallback, useMemo } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import SegmentedControl from '../../../../components/common/SegmentedControl';
import { useDeviceDetection } from '../../../../hooks/useDeviceDetection';

// Localization
import slRaw from '../../utils/script_lines.js'; // Adjusted path
const sl = slRaw.venueManagement.venueDesignerHeader;

const VenueDesignerHeader = ({
    isEditorModeActive,
    hasUnsavedChanges,
    isSavingLayout,
    isLoadingLayout,
    onToggleMode,
    onDownloadAllQRs,
    onToggleZenMode,
    layoutName = "Venue Layout", // Fallback, should ideally come localized from parent if dynamic
    onAttemptExitPage, // Added for potential back button
}) => {
    const { isMobile } = useDeviceDetection();

    const modeOptions = useMemo(() => [
        { label: sl.designModeLabel || "Design", value: "edit", icon: "design_services" },
        { label: sl.previewModeLabel || "Preview", value: "preview", icon: "visibility" }
    ], []); // sl dependency will re-memoize if language changes

    const currentModeValue = isEditorModeActive ? "edit" : "preview";

    const handleSegmentedControlChange = useCallback((newMode) => {
        if ((newMode === "edit" && !isEditorModeActive) || (newMode === "preview" && isEditorModeActive)) {
            onToggleMode();
        }
    }, [isEditorModeActive, onToggleMode]);

    const actionButtonVariants = {
        hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2, delay: 0.05 } },
    };

    const showTextOnQrButton = !isMobile;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className={`relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-x-3 gap-y-2 
                       p-2.5 sm:p-3 
                       bg-neutral-100/85 dark:bg-neutral-800/85 backdrop-blur-lg
                       border border-neutral-200/70 dark:border-neutral-700/70 
                       shadow-lg rounded-2xl sm:rounded-full mb-3 mx-0
                       w-full`}
        >
            <div className="flex items-center justify-between sm:justify-start min-w-0 w-full sm:w-auto">
                <div className="flex items-center min-w-0">
                    {/* Optional: Back button for mobile */}
                    {isMobile && onAttemptExitPage && (
                        <button
                            onClick={onAttemptExitPage}
                            className="p-2 mr-1 -ml-1 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70"
                            title={sl.backToDashboardTooltip || "Back to Dashboard"} // Example, add to script_lines if used
                        >
                            <Icon name="arrow_back" className="w-5 h-5" />
                        </button>
                    )}
                    <Icon name="space_dashboard" aria-hidden="true" className="w-5 h-5 text-rose-500 dark:text-rose-400 mr-2 flex-shrink-0" style={{ fontSize: "1.25rem" }} />
                    <h2 className="font-montserrat font-semibold text-base sm:text-md text-neutral-700 dark:text-neutral-200 tracking-tight truncate">
                        {layoutName}
                    </h2>
                    {hasUnsavedChanges && isEditorModeActive && (
                        <span title={sl.unsavedChangesTooltip || "Unsaved Changes"} className="ml-2 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0"></span>
                    )}
                    {(isSavingLayout || isLoadingLayout) && (
                        <Icon name="progress_activity" className="w-4 h-4 text-neutral-500 animate-spin ml-2 flex-shrink-0" style={{ fontSize: "1rem" }} />
                    )}
                </div>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-x-2 md:gap-x-3 w-full sm:w-auto">
                <SegmentedControl
                    options={modeOptions}
                    value={currentModeValue}
                    onChange={handleSegmentedControlChange}
                    size="small"
                    className="flex-grow sm:flex-grow-0"
                />

                <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-0.5 sm:mx-1"></div>

                <AnimatePresence mode="wait">
                    {isEditorModeActive ? (
                        <motion.button
                            key="zen-mode-btn"
                            variants={actionButtonVariants}
                            initial="hidden" animate="visible" exit="hidden"
                            onClick={onToggleZenMode}
                            title={sl.focusModeTooltip || "Focus Mode"}
                            className="p-2 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 transition-colors"
                        >
                            <Icon name="fullscreen" className="w-4 h-4 flex items-center justify-center" style={{ fontSize: "1rem" }} />
                        </motion.button>
                    ) : (
                        <motion.button
                            key="download-qrs-btn"
                            variants={actionButtonVariants}
                            initial="hidden" animate="visible" exit="hidden"
                            onClick={onDownloadAllQRs}
                            title={sl.downloadQrTooltip || "Download All QR Codes"}
                            className={`flex items-center h-9 sm:h-8 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white transition-colors`}
                        >
                            <Icon name="qr_code_scanner" className={`w-4 h-4 flex items-center justify-center ${showTextOnQrButton ? 'mr-1.5' : ''}`} style={{ fontSize: "1rem" }} />
                            {showTextOnQrButton && (sl.qrButtonText || "QRs")}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default VenueDesignerHeader;