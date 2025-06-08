import React, { useState, useEffect, useCallback, useMemo } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon.jsx';
import NumberStepperfix from '../../../components/common/NumberStepperfix.jsx';
import { InputField } from '../../register/subcomponents/index.js';
import BubbleAnimation from '../../../components/animations/bubble/BubbleAnimation.jsx';
import { cn } from '../../../components/animations/bubble/utils.js';
import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION

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

const smoothEase = [0.42, 0, 0.58, 1];
const springTransition = { type: "spring", stiffness: 260, damping: 20 };

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

const ROSE_PRIMARY_ACCENT = "text-rose-500 dark:text-rose-400";
const ROSE_PRIMARY_BUTTON_BG = "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500";
const BUTTON_TEXT_ON_ACCENT = "text-white";
const ROSE_PULSE_BG = "bg-rose-200 dark:bg-rose-500/30";

const NEUTRAL_CARD_BG = "bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm";
const NEUTRAL_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100";
const NEUTRAL_TEXT_SECONDARY = "text-neutral-600 dark:text-neutral-300";
const NEUTRAL_TEXT_MUTED_LIGHT_BG = "text-white/80";
const NEUTRAL_TEXT_MUTED_DARK_BG = "dark:text-neutral-200/80";
const NEUTRAL_LABEL_TEXT = "text-neutral-700 dark:text-neutral-300";
const NEUTRAL_TEXT_MUTED = "text-neutral-800 dark:text-neutral-400";

const ERROR_TEXT_COLOR = "text-red-500 dark:text-red-400";

const FONT_SANS = "font-inter";
const FONT_DISPLAY = "font-montserrat";

const HEADING_XL_TEXT = `text-3xl ${FONT_DISPLAY} font-bold`;
const HEADING_LG_TEXT = `text-2xl ${FONT_DISPLAY} font-semibold`;
const TABLE_NUMBER_TEXT = `text-6xl ${FONT_DISPLAY} font-bold`;
const BODY_TEXT_LG = `text-xl ${FONT_SANS}`;
const BODY_TEXT_MD = `text-base ${FONT_SANS}`;
const BODY_TEXT_SM = `text-sm ${FONT_SANS}`;
const BUTTON_TEXT = `font-semibold ${FONT_SANS}`;

const CARD_SHADOW = "shadow-2xl";
const BUTTON_SHADOW = "shadow-md";

const CARD_RADIUS = "rounded-3xl";
const BUTTON_RADIUS = "rounded-full";

// Bubble Animation Colors
const LIGHT_MODE_PARTICLE_COLORS = ['#FFFFFF', '#FFE4E6', '#FB7185', '#F43F5E', '#FED7AA', '#FDE68A']; // White, rose-100, rose-400, rose-500, amber-200, yellow-200
const DARK_MODE_PARTICLE_COLORS = ['#FFF1F2', '#FFE4E6', '#E11D48', '#F43F5E', '#FB7185', '#FDBA74']; // rose-50, rose-100, rose-600, rose-500, rose-400, amber-400

const LIGHT_MODE_BACKGROUND_GRADIENT = "bg-gradient-to-br from-rose-500 via-rose-500 to-purple-400"; // Warm, inviting gradient
const DARK_MODE_BACKGROUND_GRADIENT = "bg-gradient-to-br from-rose-900 via-rose-900/80 to-purple-900"; // Darker, subtle rose hint


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
            }, 2500);
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
            setNameError(sl.setupStage.nameRequiredError || "Please enter your name to continue.");
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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
        >
            <BubbleAnimation
                containerClassName={cn(currentBackgroundGradient)}
                particleColors={currentParticleColors}
                particleCount={800}
            />

            <motion.div
                variants={cardBaseVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`relative z-10 w-full max-w-md ${NEUTRAL_CARD_BG} p-6 sm:p-8 ${CARD_RADIUS} ${CARD_SHADOW} text-center overflow-hidden ${FONT_SANS}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={animationStep === 'revealTable' ? "welcome-heading" : "setup-form-heading"}
            >
                <AnimatePresence mode="wait">
                    {animationStep === 'revealTable' && (
                        <motion.div
                            key="tableRevealContent"
                            variants={contentSectionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-2 h-90"
                        >
                            <motion.div variants={itemFadeInUpVariants}>
                                <Icon name="menu_book" className={`w-16 h-16 ${ROSE_PRIMARY_ACCENT} mx-auto mb-3`} style={{ fontSize: '2rem' }} />
                            </motion.div>
                            <motion.h1 variants={itemFadeInUpVariants} id="welcome-heading" className={`${HEADING_XL_TEXT} ${NEUTRAL_TEXT_PRIMARY}`}>
                                {sl.setupStage.welcomeTitle || "Welcome!"}
                            </motion.h1>
                            <motion.p variants={itemFadeInUpVariants} className={`${BODY_TEXT_LG} ${NEUTRAL_TEXT_SECONDARY} mt-1`}>
                                {sl.setupStage.atTableLabel || "You are at Table"}
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
                            className="space-y-4 h-90"
                        >
                            <motion.div variants={itemFadeInUpVariants} className="mb-6">
                                <Icon name="table_restaurant" className={`w-12 h-12 ${ROSE_PRIMARY_ACCENT} mx-auto mb-2`} style={{ fontSize: '2rem' }} />
                                <h2 id="setup-form-heading" className={`${HEADING_LG_TEXT} ${NEUTRAL_TEXT_PRIMARY}`}>
                                    Table {tableNumber}
                                </h2>
                                <p className={`${BODY_TEXT_SM} ${NEUTRAL_TEXT_MUTED} font-montserrat mt-1`}>{sl.setupStage.setupPrompt || "Let's get you set up!"}</p>
                            </motion.div>

                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                                <motion.div variants={itemFadeInUpVariants}>
                                    <InputField
                                        id="userName"
                                        label={sl.setupStage.yourNameLabel || "Your Name"}
                                        type="text"
                                        value={userName}
                                        onChange={(e) => {
                                            setUserName(e.target.value);
                                            if (nameError && e.target.value.trim() !== '') setNameError('');
                                        }}
                                        placeholder={sl.setupStage.yourNamePlaceholder || "e.g., Alex Smith"}
                                        error={nameError}
                                        required
                                        className='flex items-end h-15'
                                        labelClassName='text-xs font-medium text-neutral-700 dark:text-neutral-400'
                                    />
                                </motion.div>

                                <motion.div variants={itemFadeInUpVariants}>
                                    <NumberStepperfix
                                        id="numberOfPeople"
                                        min={1}
                                        max={12}
                                        value={actualNumberOfPeople}
                                        onChange={handleNumberOfPeopleChange}
                                        label={sl.setupStage.peopleLabel || "Number of people ordering"}
                                        hideLabel={true}
                                        inputClassName={`text-center dark:bg-neutral-700 dark:text-neutral-100 h-10 ${BUTTON_RADIUS}`}
                                        buttonClassName={`bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-10 h-10 ${BUTTON_RADIUS}`}
                                        containerClassName="flex justify-center items-center"
                                        labelClassName='text-xs font-medium text-neutral-700 dark:text-neutral-400'
                                    />
                                </motion.div>

                                <motion.button
                                    variants={itemFadeInUpVariants}
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full text-sm font-montserrat ${ROSE_PRIMARY_BUTTON_BG} ${BUTTON_TEXT_ON_ACCENT} ${BUTTON_TEXT} py-2 px-4 ${BUTTON_RADIUS} ${BUTTON_SHADOW} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:focus:ring-offset-neutral-800 disabled:opacity-60 flex items-center justify-center`}
                                    whileHover={{ scale: isLoading ? 1 : 1.03, y: isLoading ? 0 : -2 }}
                                    whileTap={{ scale: isLoading ? 1 : 0.97 }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Icon name="progress_activity" className="w-4 h-4 mr-2 animate-spin" style={{ fontSize: '1rem' }} variations={{ fill: 0, weight: 800, grade: 0, opsz: 48 }} />
                                            {sl.setupStage.startingButton || "Starting..."}
                                        </>
                                    ) : (
                                        sl.setupStage.startOrderingButton || "Start Ordering"
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: animationStep === 'showForm' ? 1.0 : 2.7, duration: 0.6, ease: smoothEase } }}
                className={`relative font-montserrat z-10 mt-8 ${BODY_TEXT_SM} ${theme === 'dark' ? NEUTRAL_TEXT_MUTED_DARK_BG : NEUTRAL_TEXT_MUTED_LIGHT_BG}`}
            >
                {sl.setupStage.footerMessage || "Enjoy your meal! If you need assistance, please alert our staff."}
            </motion.p>
        </motion.div>
    );
}

export default SetupStage;