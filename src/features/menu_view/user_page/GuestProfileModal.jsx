// frontend/src/features/menu_view/user_page/GuestProfileModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import NumberStepperfix from '../../../components/common/NumberStepperfix';
// Assuming InputField is available from this path as per instructions
// If it's from components/common, adjust the path.
import { InputField } from '../../register/subcomponents/index.js';

// Styling Constants (derived from Userpage.jsx context and design guidelines)
const NEUTRAL_BG_MODAL_CARD = "bg-white dark:bg-neutral-800";
const MODAL_RADIUS = "rounded-2xl";
const MODAL_SHADOW = "shadow-2xl";
const FONT_INTER = "font-inter";
const FONT_MONTSERRAT = "font-montserrat";
const FONT_SANS = "font-sans";
const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const ROSE_ACCENT_RING_FOCUS = "focus:ring-rose-500 dark:focus:ring-rose-400";
const NEUTRAL_TEXT_LABEL = "text-neutral-700 dark:text-neutral-300"; // Adjusted for slightly better contrast on light mode for labels
const INPUT_RADIUS = "rounded-md";
const BODY_TEXT_MEDIUM = "text-sm";
const NEUTRAL_INPUT_BG = "bg-white dark:bg-neutral-700";
const NEUTRAL_BORDER = "border-neutral-300 dark:border-neutral-600";
const NEUTRAL_TEXT_PLACEHOLDER = "placeholder-neutral-500 dark:placeholder-neutral-400";
const ERROR_TEXT_COLOR = "text-red-500 dark:text-red-400";

// Button styles (Ensure these match the desired application-wide button styles)
const BUTTON_BASE_CLASSES = "px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800";
const BUTTON_PRIMARY_BG = "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500"; // Adjusted dark mode hover from Peek Bar
const BUTTON_PRIMARY_TEXT = "text-white";
const BUTTON_SECONDARY_BG = "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600";
const BUTTON_SECONDARY_TEXT = "text-neutral-700 dark:text-neutral-200";

const NEUTRAL_BG_MODAL_FOOTER = "bg-neutral-50 dark:bg-neutral-800/50"; // Keep as per original, slightly different from card
const FULL_PAGE_TEXT_PRIMARY = "text-neutral-900 dark:text-neutral-100"; // For modal title
const STEPPER_BUTTON_RADIUS = "rounded-md";
const STEPPER_INPUT_BG_MODAL_CARD = "bg-white dark:bg-neutral-700";
const STEPPER_INPUT_TEXT_SECONDARY = "text-neutral-700 dark:text-neutral-200";
const STEPPER_BUTTON_BG_OPTION_LIGHT = "bg-neutral-100 dark:bg-neutral-700";
const STEPPER_BUTTON_HOVER_BG_OPTION_LIGHT = "hover:bg-neutral-200 dark:hover:bg-neutral-600";

// Animation
const modalTransition = { type: "spring", stiffness: 320, damping: 28, duration: 0.3 };
const backdropAnimation = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25, ease: "circOut" } };

function GuestProfileModal({
    isOpen,
    onClose,
    currentUserName,
    currentNumberOfPeople,
    onProfileUpdate
}) {
    const [name, setName] = useState('');
    const [people, setPeople] = useState(1);
    const [nameError, setNameError] = useState('');

    const modalContentRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setName(currentUserName || '');
            setPeople(currentNumberOfPeople || 1);
            setNameError('');
            // Initial focus on close button for accessibility
            const timer = setTimeout(() => closeButtonRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, currentUserName, currentNumberOfPeople]);

    const handleSave = () => {
        if (name.trim() === '') {
            setNameError("Please enter a name.");
            return;
        }
        setNameError('');
        onProfileUpdate({ newUserName: name.trim(), newNumberOfPeople: people });
        // onClose(); // Userpage.jsx will handle closing after update
    };

    // Focus trap logic
    useEffect(() => {
        if (!isOpen) return;
        const focusableElements = modalContentRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) { lastElement.focus(); event.preventDefault(); }
                } else {
                    if (document.activeElement === lastElement) { firstElement.focus(); event.preventDefault(); }
                }
            } else if (event.key === 'Escape') {
                onClose();
            }
        };

        const currentModalContent = modalContentRef.current;
        currentModalContent?.addEventListener('keydown', handleKeyDown);
        return () => currentModalContent?.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
                        {...backdropAnimation}
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.div
                        ref={modalContentRef}
                        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm ${FONT_INTER} ${NEUTRAL_BG_MODAL_CARD} ${MODAL_RADIUS} ${MODAL_SHADOW} z-50 flex flex-col overflow-hidden`}
                        style={{ maxHeight: 'calc(100vh - 40px)' }}
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={modalTransition}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="guest-profile-title"
                    >
                        <div className={`flex items-start justify-between p-4 sm:p-5 border-b ${NEUTRAL_BORDER_LIGHTER}`}>
                            <h3 id="guest-profile-title" className={`${FONT_MONTSERRAT} font-semibold text-lg ${FULL_PAGE_TEXT_PRIMARY}`}>
                                Edit Your Info
                            </h3>
                            <button
                                ref={closeButtonRef}
                                onClick={onClose}
                                className={`p-1.5 rounded-full ${NEUTRAL_TEXT_MUTED} hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 ${ROSE_ACCENT_RING_FOCUS} transition-colors`}
                                aria-label="Close edit info"
                            >
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-5 space-y-4">
                            <div>
                                <InputField
                                    id="guestNameModal"
                                    label="Name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); if (nameError && e.target.value.trim()) setNameError(''); }}
                                    placeholder="Your Name"
                                    labelClassName={`${FONT_SANS} ${BODY_TEXT_MEDIUM} font-medium ${NEUTRAL_TEXT_LABEL} text-left`}
                                    inputClassName={`w-full h-10 px-3 py-2 ${INPUT_RADIUS} ${BODY_TEXT_MEDIUM} ${FULL_PAGE_TEXT_PRIMARY} ${NEUTRAL_INPUT_BG} focus:ring-2 ${ROSE_ACCENT_RING_FOCUS} outline-none ${NEUTRAL_TEXT_PLACEHOLDER} border ${NEUTRAL_BORDER} transition-colors duration-150 ${nameError ? 'border-red-500 ring-red-500' : ''}`}
                                    error={nameError} // InputField should handle displaying this
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="guestPeopleModal" className={`block text-sm font-medium mb-1.5 ${NEUTRAL_TEXT_LABEL}`}>Number of Guests</label>
                                <NumberStepperfix
                                    id="guestPeopleModal"
                                    min={1}
                                    max={12}
                                    value={people}
                                    onChange={setPeople}
                                    label="Number of guests" // For screen readers
                                    hideLabel={true} // Visual label handled above
                                    inputClassName={`text-center h-10 ${STEPPER_BUTTON_RADIUS} border ${NEUTRAL_BORDER} ${STEPPER_INPUT_BG_MODAL_CARD} ${STEPPER_INPUT_TEXT_SECONDARY} focus:ring-2 ${ROSE_ACCENT_RING_FOCUS} shadow-sm`}
                                    buttonClassName={`w-10 h-10 ${STEPPER_BUTTON_RADIUS} ${STEPPER_BUTTON_BG_OPTION_LIGHT} ${STEPPER_BUTTON_HOVER_BG_OPTION_LIGHT} ${STEPPER_INPUT_TEXT_SECONDARY} focus:ring-2 ${ROSE_ACCENT_RING_FOCUS} shadow-sm`}
                                    containerClassName="flex justify-center items-center space-x-2"
                                />
                            </div>
                        </div>

                        <div className={`p-4 sm:p-5 border-t ${NEUTRAL_BORDER_LIGHTER} ${NEUTRAL_BG_MODAL_FOOTER} flex justify-end space-x-3`}>
                            <button
                                type="button"
                                onClick={onClose}
                                className={`${BUTTON_BASE_CLASSES} ${BUTTON_SECONDARY_BG} ${BUTTON_SECONDARY_TEXT} ${ROSE_ACCENT_RING_FOCUS}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className={`${BUTTON_BASE_CLASSES} ${BUTTON_PRIMARY_BG} ${BUTTON_PRIMARY_TEXT} ${ROSE_ACCENT_RING_FOCUS}`}
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default GuestProfileModal;