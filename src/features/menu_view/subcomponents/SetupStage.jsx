// frontend/src/features/menu_view/subcomponents/SetupStage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon.jsx';
import NumberStepperfix from '../../../components/common/NumberStepperfix.jsx';
// Assuming InputField from register/subcomponents is styled according to general InputField guidelines (6.2)
// If not, those styles would need to be applied within that component or overridden here.
import { InputField } from '../../register/subcomponents/index.js'; 
import BubbleAnimation from '../../../components/animations/bubble/BubbleAnimation.jsx';
import { cn } from '../../../components/animations/bubble/utils.js';

// --- Debounce function (kept as is from original) ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// --- End debounce function ---

// Animation Constants (Guideline 4.1, 4.3)
const smoothEase = [0.42, 0, 0.58, 1]; // Standard easing
const springTransition = { type: "spring", stiffness: 260, damping: 20 }; // General spring

const stageContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
};

const cardBaseVariants = {
    initial: { scale: 0.9, y: 50, opacity: 0 },
    animate: {
        scale: 1, y: 0, opacity: 1,
        transition: { ...springTransition, delay: 0.1 }
    },
    exit: { scale: 0.95, y: 10, opacity: 0, transition: { duration: 0.2, ease: smoothEase } }
};

const contentSectionVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.25, ease: smoothEase } }
};

const itemFadeInUpVariants = {
    initial: { y: 25, opacity: 0, scale: 0.98 },
    animate: {
        y: 0, opacity: 1, scale: 1,
        transition: { duration: 0.5, ease: smoothEase }
    }
};

const tableNumberTextVariants = {
    initial: { scale: 0.6, opacity: 0, y: 10 },
    animate: {
        scale: [1, 1.25, 1], opacity: 1, y: 0,
        transition: {
            scale: { duration: 0.7, times: [0, 0.5, 1], ease: [0.34, 1.56, 0.64, 1], delay: 0.5 },
            opacity: { duration: 0.4, delay: 0.5, ease: smoothEase },
            y: { duration: 0.4, delay: 0.5, ease: smoothEase }
        }
    }
};

// Color Palette (Guideline 2.1)
const ROSE_PRIMARY_ACCENT = "text-rose-500 dark:text-rose-400"; // Primary accent color for text
const ROSE_PRIMARY_BUTTON_BG = "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500";
const BUTTON_TEXT_ON_ACCENT = "text-white";
const ROSE_PULSE_BG = "bg-rose-200 dark:bg-rose-500/30"; // For pulsing element

const NEUTRAL_CARD_BG = "bg-white dark:bg-neutral-800";
const NEUTRAL_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100";
const NEUTRAL_TEXT_SECONDARY = "text-neutral-600 dark:text-neutral-300";
const NEUTRAL_TEXT_MUTED_LIGHT_BG = "text-white/80"; // For text on dark gradient
const NEUTRAL_TEXT_MUTED_DARK_BG = "dark:text-neutral-400/80"; // For text on light gradient
const NEUTRAL_LABEL_TEXT = "text-neutral-700 dark:text-neutral-300"; // Input labels
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";

const ERROR_TEXT_COLOR = "text-red-500 dark:text-red-400"; // Semantic error

// Typography (Guideline 2.2)
const FONT_SANS = "font-inter"; // Default UI font
const FONT_DISPLAY = "font-montserrat"; // For headings

const HEADING_XL_TEXT = `text-3xl ${FONT_DISPLAY} font-bold`; // H1 equivalent
const HEADING_LG_TEXT = `text-2xl ${FONT_DISPLAY} font-semibold`; // H2 equivalent
const TABLE_NUMBER_TEXT = `text-6xl ${FONT_DISPLAY} font-bold`; // Large display text
const BODY_TEXT_LG = `text-xl ${FONT_SANS}`; // Body Large
const BODY_TEXT_MD = `text-base ${FONT_SANS}`; // Body Medium
const BODY_TEXT_SM = `text-sm ${FONT_SANS}`; // Body Small
const BUTTON_TEXT = `font-semibold ${FONT_SANS}`; // Button text

// Shadows & Elevation (Guideline 2.5)
const CARD_SHADOW = "shadow-2xl"; // Max elevation for overlays
const BUTTON_SHADOW = "shadow-md";

// Borders & Corner Radii (Guideline 2.6)
const CARD_RADIUS = "rounded-2xl"; // Large radius for modal-like card
const BUTTON_RADIUS = "rounded-lg"; // Standard button radius

// InputField / NumberStepperfix are assumed to follow their own guideline adherence from 6.2 / 6.11

// Bubble Animation Colors (Guideline 1 Engaging & Modern, using Rose accents)
const LIGHT_MODE_PARTICLE_COLORS = ['#FFFFFF', '#FFE4E6', '#FB7185', '#F43F5E', '#FED7AA', '#FDE68A']; // White, rose-100, rose-400, rose-500, amber-200, yellow-200
const DARK_MODE_PARTICLE_COLORS =  ['#FFF1F2', '#FFE4E6', '#E11D48', '#F43F5E', '#FB7185', '#FDBA74']; // rose-50, rose-100, rose-600, rose-500, rose-400, amber-400

const LIGHT_MODE_BACKGROUND_GRADIENT = "bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400"; // Warm, inviting gradient
const DARK_MODE_BACKGROUND_GRADIENT = "bg-gradient-to-br from-neutral-900 via-rose-900/80 to-neutral-800"; // Darker, subtle rose hint


function SetupStage({ tableNumber, onSetupComplete, theme }) {
    const [userName, setUserName] = useState('');
    const [actualNumberOfPeople, setActualNumberOfPeople] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [nameError, setNameError] = useState('');
    const [animationStep, setAnimationStep] = useState('revealTable');

    useEffect(() => {
        if (animationStep === 'revealTable') {
            const timer = setTimeout(() => {
                setAnimationStep('showForm');
            }, 2500); // Slightly reduced reveal time
            return () => clearTimeout(timer);
        }
    }, [animationStep]);

    const debouncedSetActualNumberOfPeople = useMemo(
        () => debounce((newValue) => {
            setActualNumberOfPeople(newValue);
        }, 60),
        []
    );

    const handleNumberOfPeopleChange = useCallback((newValue) => {
        debouncedSetActualNumberOfPeople(newValue);
    }, [debouncedSetActualNumberOfPeople]);


    const handleSubmit = () => {
        if (userName.trim() === '') {
            setNameError("Please enter your name to continue.");
            return;
        }
        setNameError('');
        setIsLoading(true);
        setTimeout(() => {
            onSetupComplete({ userName, numberOfPeople: actualNumberOfPeople, tableNumber });
        }, 750);
    };

    const currentParticleColors = theme === 'dark' ? DARK_MODE_PARTICLE_COLORS : LIGHT_MODE_PARTICLE_COLORS;
    const currentBackgroundGradient = theme === 'dark' ? DARK_MODE_BACKGROUND_GRADIENT : LIGHT_MODE_BACKGROUND_GRADIENT;

    return (
        <motion.div
            variants={stageContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6" // Standard padding
        >
            <BubbleAnimation
                containerClassName={cn(currentBackgroundGradient)}
                particleColors={currentParticleColors}
                particleCount={800} // Reduced for potentially better perf on more devices
            />

            <motion.div
                variants={cardBaseVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`relative z-10 w-full max-w-md ${NEUTRAL_CARD_BG} p-6 sm:p-8 ${CARD_RADIUS} ${CARD_SHADOW} text-center overflow-hidden ${FONT_SANS}`}
                role="dialog" // Guideline 7: ARIA
                aria-modal="true"
                aria-labelledby={animationStep === 'revealTable' ? "welcome-heading" : "setup-form-heading"}
            >
                <AnimatePresence mode="wait"> {/* mode="wait" for smoother transitions between steps */}
                    {animationStep === 'revealTable' && (
                        <motion.div
                            key="tableRevealContent"
                            variants={contentSectionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-2" // Guideline 3.2 Spacing (8px)
                        >
                            <motion.div variants={itemFadeInUpVariants}>
                                {/* Icon (Guideline 2.3 Extra Large for hero) */}
                                <Icon name="table_restaurant" className={`w-16 h-16 ${ROSE_PRIMARY_ACCENT} mx-auto mb-3`} />
                            </motion.div>
                            <motion.h1 variants={itemFadeInUpVariants} id="welcome-heading" className={`${HEADING_XL_TEXT} ${NEUTRAL_TEXT_PRIMARY}`}>
                                Welcome!
                            </motion.h1>
                            <motion.p variants={itemFadeInUpVariants} className={`${BODY_TEXT_LG} ${NEUTRAL_TEXT_SECONDARY} mt-1`}>
                                You are at Table
                            </motion.p>
                            <motion.p
                                variants={tableNumberTextVariants}
                                initial="initial"
                                animate="animate"
                                className={`${TABLE_NUMBER_TEXT} ${ROSE_PRIMARY_ACCENT} my-3`}
                            >
                                {tableNumber}
                            </motion.p>
                            <motion.div variants={itemFadeInUpVariants} className="pt-3">
                                <div className={`h-1 w-20 ${ROSE_PULSE_BG} mx-auto rounded-full animate-pulse`}></div>
                            </motion.div>
                        </motion.div>
                    )}

                    {animationStep === 'showForm' && (
                        <motion.div
                            key="formContent"
                            variants={contentSectionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <motion.div variants={itemFadeInUpVariants} className="mb-6">
                                <Icon name="table_restaurant" className={`w-12 h-12 ${ROSE_PRIMARY_ACCENT} mx-auto mb-2`} />
                                <h2 id="setup-form-heading" className={`${HEADING_LG_TEXT} ${NEUTRAL_TEXT_PRIMARY}`}>
                                    Table {tableNumber}
                                </h2>
                                <p className={`${BODY_TEXT_SM} ${NEUTRAL_TEXT_MUTED} mt-1`}>Let's get you set up!</p>
                            </motion.div>

                            {/* Form structure (Guideline 6.2, 6.11, 6.1) */}
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6"> {/* Spacing 24px */}
                                <motion.div variants={itemFadeInUpVariants}>
                                    {/* InputField is external, assuming it follows Guideline 6.2 */}
                                    <InputField
                                        id="userName"
                                        label="Your Name"
                                        type="text"
                                        value={userName}
                                        onChange={(e) => {
                                            setUserName(e.target.value);
                                            if (nameError && e.target.value.trim() !== '') setNameError('');
                                        }}
                                        placeholder="e.g., Alex Smith"
                                        error={nameError}
                                        required // Guideline 7: ARIA implied
                                        labelClassName={`${FONT_SANS} ${BODY_TEXT_SM} font-medium ${NEUTRAL_LABEL_TEXT} text-left`} // Matching Guideline 2.2 for labels
                                    />
                                </motion.div>

                                <motion.div variants={itemFadeInUpVariants}>
                                    <label htmlFor="numberOfPeople" className={`block ${FONT_SANS} ${BODY_TEXT_SM} font-medium ${NEUTRAL_LABEL_TEXT} text-left mb-1.5`}>
                                        Number of Guests
                                    </label>
                                    {/* NumberStepperfix (Guideline 6.11 Steppers) */}
                                    <NumberStepperfix
                                        id="numberOfPeople"
                                        min={1}
                                        max={12}
                                        value={actualNumberOfPeople}
                                        onChange={handleNumberOfPeopleChange}
                                        label="Number of guests" // For screen readers
                                        hideLabel={true} // Visually hidden as label is above
                                        inputClassName={`text-center dark:bg-neutral-700 dark:text-neutral-100 h-10 ${BUTTON_RADIUS}`} // Matching input style
                                        buttonClassName={`bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-10 h-10 ${BUTTON_RADIUS}`}
                                        containerClassName="flex justify-center items-center"
                                    />
                                </motion.div>

                                {/* Submit Button (Guideline 6.1 Primary Button) */}
                                <motion.button
                                    variants={itemFadeInUpVariants}
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full ${ROSE_PRIMARY_BUTTON_BG} ${BUTTON_TEXT_ON_ACCENT} ${BUTTON_TEXT} py-3 px-4 ${BUTTON_RADIUS} ${BUTTON_SHADOW} transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:focus:ring-offset-neutral-800 disabled:opacity-60 flex items-center justify-center`}
                                    whileHover={{ scale: isLoading ? 1 : 1.03, y: isLoading ? 0 : -2 }}
                                    whileTap={{ scale: isLoading ? 1 : 0.97 }}
                                >
                                    {isLoading ? (
                                        <>
                                            {/* Spinner (Guideline 4.5 Feedback) */}
                                            <Icon name="progress_activity" className="w-5 h-5 mr-2 animate-spin" /> 
                                            Starting...
                                        </>
                                    ) : (
                                        "Start Ordering"
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            {/* Footer Text (Guideline 2.2 Body Small) */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: animationStep === 'showForm' ? 1.0 : 2.7, duration: 0.6, ease: smoothEase } }}
                className={`relative z-10 mt-8 ${BODY_TEXT_SM} ${theme === 'dark' ? NEUTRAL_TEXT_MUTED_DARK_BG : NEUTRAL_TEXT_MUTED_LIGHT_BG }`}
            >
                Enjoy your meal! If you need assistance, please alert our staff.
            </motion.p>
        </motion.div>
    );
}

export default SetupStage;