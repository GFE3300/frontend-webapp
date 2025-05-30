import React from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import SegmentedControl from '../../../../components/common/SegmentedControl';

const VenueDesignerHeader = ({
    isEditorModeActive,
    hasUnsavedChanges,
    isSavingLayout,
    isLoadingLayout,
    onToggleMode,
    onDownloadAllQRs,
    onToggleZenMode,
    layoutName = "Venue Layout"
}) => {
    const modeOptions = [
        { label: "Design", value: "edit", icon: "design_services" },
        { label: "Preview", value: "preview", icon: "visibility" }
    ];
    const currentModeValue = isEditorModeActive ? "edit" : "preview";

    // Animation variants for conditional action buttons
    const actionButtonVariants = {
        hidden: { opacity: 0, x: -10, transition: { duration: 0.2 } },
        visible: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-3 pl-5
                       bg-neutral-100/90 dark:bg-neutral-800/90 backdrop-blur-md 
                       border border-neutral-200/70 dark:border-neutral-700/70 
                       shadow-sm mb-3 mx-auto w-full rounded-full"
        >
            {/* Left Section: Title & Status */}
            <div className="flex items-center min-w-0"> {/* min-w-0 for better flex truncation */}
                <Icon name="space_dashboard" aria-hidden="true" className="w-5 h-5 text-rose-500 dark:text-rose-400 mr-2 flex-shrink-0" style={{ fontSize: "1.25rem" }}/>
                <h2 className="font-montserrat font-semibold text-md text-neutral-700 dark:text-neutral-200 tracking-tight truncate">
                    {layoutName}
                </h2>
                {hasUnsavedChanges && isEditorModeActive && (
                    <span title="Unsaved Changes" className="ml-2 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0"></span>
                )}
                {(isSavingLayout || isLoadingLayout) && (
                    <Icon name="progress_activity" className="w-4 h-4 text-neutral-500 animate-spin ml-2 flex-shrink-0" style={{ fontSize: "1rem" }} />
                )}
            </div>

            {/* Center/Right Section: Mode Toggle & Actions */}
            <div className="flex items-center gap-x-2 md:gap-x-3">
                <SegmentedControl
                    options={modeOptions}
                    value={currentModeValue}
                    onChange={(newMode) => {
                        if ((newMode === "edit" && !isEditorModeActive) || (newMode === "preview" && isEditorModeActive)) {
                            onToggleMode();
                        }
                    }}
                    size="small" // Using the smaller size variant
                />

                <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1"></div> {/* Subtle Separator */}

                <AnimatePresence mode="wait"> {/* mode="wait" ensures one exits before other enters */}
                    {isEditorModeActive ? (
                        <motion.button
                            key="zen-mode-btn"
                            variants={actionButtonVariants}
                            initial="hidden" animate="visible" exit="hidden"
                            onClick={onToggleZenMode}
                            title="Focus Mode"
                            className="p-2 w-8 h-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <Icon name="fullscreen" className="w-4 h-4 flex items-center justify-center" style={{ fontSize: "1rem" }} />
                        </motion.button>
                    ) : (
                        <motion.button
                            key="download-qrs-btn"
                            variants={actionButtonVariants}
                            initial="hidden" animate="visible" exit="hidden"
                            onClick={onDownloadAllQRs}
                            title="Download All QR Codes"
                            className="flex items-center px-3 py-2 rounded-full text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                        >
                            <Icon name="qr_code_scanner" className="w-4 h-4 flex items-center justify-center mr-2" style={{ fontSize: "1rem" }} />
                            QRs
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default VenueDesignerHeader;