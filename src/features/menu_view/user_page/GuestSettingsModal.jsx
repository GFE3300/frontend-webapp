import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Icon from '../../../components/common/Icon.jsx';
import NumberStepperfix from '../../../components/common/NumberStepperfix.jsx';
import { InputField } from '../../register/subcomponents/index.js';
import LanguageSwitcher from '../../../components/common/LanguageSwitcher.jsx';
import { ThemeToggleButton } from '../../../utils/ThemeToggleButton.jsx';
import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION

// --- Styling & Theming Constants ---
const NEUTRAL_BG_MODAL_CARD = "bg-white dark:bg-neutral-800";
const NEUTRAL_BG_MODAL_FOOTER = "bg-neutral-50 dark:bg-neutral-700/60";
const NEUTRAL_TEXT_PRIMARY = "text-neutral-900 dark:text-neutral-100";
const NEUTRAL_TEXT_SECONDARY = "text-neutral-700 dark:text-neutral-200";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700";

const BUTTON_BASE_CLASSES = "px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800";
const BUTTON_PRIMARY_BG = "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500";
const BUTTON_PRIMARY_TEXT = "text-white";
const BUTTON_SECONDARY_BG = "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600";
const BUTTON_SECONDARY_TEXT = "text-neutral-700 dark:text-neutral-200";
const ROSE_ACCENT_RING_FOCUS = "focus-visible:ring-rose-500";

const FONT_MONTSERRAT = "font-montserrat";
const MODAL_RADIUS = "rounded-2xl";
const MODAL_SHADOW = "shadow-2xl";

// --- Animation Variants ---
const modalTransitionDefault = { type: "spring", stiffness: 320, damping: 28 };
const backdropAnimationDefault = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25, ease: "circOut" } };
const reducedMotionTransition = { duration: 0.01 };

function GuestSettingsModal({
    isOpen,
    onClose,
    currentSettings,
    onSave
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [people, setPeople] = useState(1);
    const [nameError, setNameError] = useState('');

    const modalContentRef = useRef(null);
    const closeButtonRef = useRef(null);
    const nameInputRef = useRef(null);

    const shouldReduceMotion = useReducedMotion();
    const modalTransition = shouldReduceMotion ? reducedMotionTransition : modalTransitionDefault;
    const backdropAnimation = shouldReduceMotion ? { ...backdropAnimationDefault, transition: reducedMotionTransition } : backdropAnimationDefault;

    useEffect(() => {
        if (isOpen) {
            setName(currentSettings?.name || '');
            setEmail(currentSettings?.email || '');
            setPeople(currentSettings?.people || 1);
            setNameError('');
            const timer = setTimeout(() => closeButtonRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen, currentSettings]);

    // Focus Trap and Escape Key handler
    useEffect(() => {
        if (!isOpen) return;
        const modalElement = modalContentRef.current;
        if (!modalElement) return;

        const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
            else if (event.key === 'Tab') {
                if (event.shiftKey && document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        };
        modalElement.addEventListener('keydown', handleKeyDown);
        return () => modalElement.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSave = useCallback(() => {
        if (name.trim() === '') {
            setNameError(sl.guestSettingsModal.nameRequiredError || "Please enter a name for the order.");
            nameInputRef.current?.focus();
            return;
        }
        setNameError('');
        onSave({
            newUserName: name.trim(),
            newUserEmail: email.trim(),
            newNumberOfPeople: people,
        });
    }, [name, email, people, onSave]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="fixed inset-0 z-40 bg-black/60 dark:bg-black/70 backdrop-blur-sm" variants={backdropAnimation} initial="initial" animate="animate" exit="exit" onClick={onClose} aria-hidden="true" />
                    <motion.div
                        ref={modalContentRef}
                        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md ${NEUTRAL_BG_MODAL_CARD} ${MODAL_RADIUS} ${MODAL_SHADOW} z-50 flex flex-col overflow-hidden`}
                        style={{ maxHeight: 'calc(100vh - 40px)' }}
                        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={modalTransition}
                        role="dialog" aria-modal="true" aria-labelledby="guest-settings-modal-title"
                    >
                        <header className={`flex items-start justify-between p-4 sm:p-5 border-b ${NEUTRAL_BORDER_LIGHTER}`}>
                            <h2 id="guest-settings-modal-title" className={`${FONT_MONTSERRAT} font-semibold text-lg ${NEUTRAL_TEXT_PRIMARY}`}>{sl.guestSettingsModal.title || "Guest Settings"}</h2>
                            <button ref={closeButtonRef} onClick={onClose} className={`p-1.5 rounded-full ${NEUTRAL_TEXT_MUTED} hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 ${ROSE_ACCENT_RING_FOCUS} transition-colors`} aria-label={sl.guestSettingsModal.closeAriaLabel || "Close settings"}>
                                <Icon name="close" className="w-5 h-5" style={{ fontSize: "1.25rem" }} />
                            </button>
                        </header>

                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex-1 contents">
                            <main className="p-4 sm:p-5 space-y-6 flex-1 overflow-y-auto">
                                <fieldset>
                                    <legend className="text-base w-full font-montserrat font-semibold text-neutral-800 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-4">{sl.guestSettingsModal.orderInfoLegend || "Order Information"}</legend>
                                    <div className="space-y-4 mt-4">
                                        <InputField ref={nameInputRef} id="guestNameSettingsInput" label={sl.guestSettingsModal.nameLabel || "Name for this Order"} value={name} onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }} error={nameError} required />
                                        <InputField id="guestEmailSettingsInput" label={sl.guestSettingsModal.emailLabel || "Email for Receipt (Optional)"} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        <div>
                                            <label className='block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2'>{sl.guestSettingsModal.guestCountLabel || "Number of guests"}</label>
                                            <NumberStepperfix id="guestPeopleSettingsInput" min={1} max={20} value={people} onChange={setPeople} label={sl.guestSettingsModal.guestCountLabel || "Number of guests"} hideLabel={true} />
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset>
                                    <legend className="text-base w-full font-montserrat font-semibold text-neutral-800 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-4">{sl.guestSettingsModal.uiPrefsLegend || "UI Preferences"}</legend>
                                    <div className="space-y-4 mt-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{sl.guestSettingsModal.languageLabel || "Language"}</label>
                                            <LanguageSwitcher />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{sl.guestSettingsModal.themeLabel || "Theme"}</label>
                                            <ThemeToggleButton />
                                        </div>
                                    </div>
                                </fieldset>
                            </main>

                            <footer className={`p-4 sm:p-5 border-t ${NEUTRAL_BORDER_LIGHTER} ${NEUTRAL_BG_MODAL_FOOTER} flex justify-end space-x-3`}>
                                <button type="button" onClick={onClose} className={`${BUTTON_BASE_CLASSES} ${BUTTON_SECONDARY_BG} ${BUTTON_SECONDARY_TEXT} ${ROSE_ACCENT_RING_FOCUS}`}>{sl.guestSettingsModal.cancelButton || "Cancel"}</button>
                                <button type="submit" className={`${BUTTON_BASE_CLASSES} ${BUTTON_PRIMARY_BG} ${BUTTON_PRIMARY_TEXT} ${ROSE_ACCENT_RING_FOCUS}`}>{sl.guestSettingsModal.saveButton || "Save Changes"}</button>
                            </footer>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default GuestSettingsModal;