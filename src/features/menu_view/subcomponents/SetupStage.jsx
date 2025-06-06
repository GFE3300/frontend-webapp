import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon.jsx'; // REVIEW: Ensure this path is correct & Icon component is stable.
import NumberStepperfix from '../../../components/common/NumberStepperfix.jsx'; // REVIEW: Ensure this path is correct & NumberStepperfix is stable and styled as desired.
import { InputField } from '../../register/subcomponents/index.js'; // REVIEW: Ensure this path is correct & InputField is stable and styled as desired.
import BubbleAnimation from '../../../components/animations/bubble/BubbleAnimation.jsx'; // REVIEW: Ensure this path is correct & BubbleAnimation is stable.
import { cn } from '../../../components/animations/bubble/utils.js'; // REVIEW: Ensure this path is correct.

// --- Simple debounce function (or import from lodash/your utils) ---
// This is fine as is, or use a library version if preferred.
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
    // ojBEVOIQREBGGPVIAEUBBTROIUBTRENVP
}
// --- End debounce function ---


const smoothEase = [0.42, 0, 0.58, 1];

const stageContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
};

const cardBaseVariants = {
    initial: { scale: 0.9, y: 50, opacity: 0 },
    animate: {
        scale: 1,
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
        }
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
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: smoothEase }
    }
};

const tableNumberTextVariants = {
    initial: { scale: 0.6, opacity: 0, y: 10 },
    animate: {
        scale: [1, 1.25, 1],
        opacity: 1,
        y: 0,
        transition: {
            scale: {
                duration: 0.7,
                times: [0, 0.5, 1],
                ease: [0.34, 1.56, 0.64, 1],
                delay: 0.5,
            },
            opacity: { duration: 0.4, delay: 0.5, ease: smoothEase },
            y: { duration: 0.4, delay: 0.5, ease: smoothEase }
        }
    }
};

// REVIEW: Ensure these theme colors align with your application's theme.
const LIGHT_MODE_PARTICLE_COLORS = ['#FFFFFF', '#ece24c', '#000000', '#2357df', '#ff8b07', '#3dcf91'];
const DARK_MODE_PARTICLE_COLORS = ['#FF69B4', '#FFA500', '#FFC0CB', '#F08080', '#FFD700'];
const LIGHT_MODE_BACKGROUND_GRADIENT = "bg-gradient-to-br from-red-500 via-pink-500 to-rose-600";
const DARK_MODE_BACKGROUND_GRADIENT = "bg-gradient-to-br from-purple-600 via-indigo-800 to-black";


function SetupStage({ tableNumber, onSetupComplete, theme }) {
    const [userName, setUserName] = useState('');
    const [actualNumberOfPeople, setActualNumberOfPeople] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [nameError, setNameError] = useState('');
    const [animationStep, setAnimationStep] = useState('revealTable');

    useEffect(() => {
        if (animationStep === 'revealTable') {
            // REVIEW: 3000ms (3 seconds) for reveal. Adjust if needed for your desired UX.
            const timer = setTimeout(() => {
                setAnimationStep('showForm');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [animationStep]);

    const debouncedSetActualNumberOfPeople = useMemo(
        () => debounce((newValue) => {
            setActualNumberOfPeople(newValue);
        }, 60), // REVIEW: Debounce time (60ms). Adjust if stepper feels laggy or too responsive.
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
        // REVIEW: 750ms artificial delay. For production, remove if `onSetupComplete` handles async ops.
        setTimeout(() => {
            // CRITICAL: Ensure `onSetupComplete` in `Userpage.jsx` correctly sets `appStage` to 'main'.
            onSetupComplete({ userName, numberOfPeople: actualNumberOfPeople, tableNumber }); // Pass tableNumber back as well
        }, 750);
    };

    // REVIEW: Check if `theme` prop is correctly passed from `Userpage.jsx` and influences these.
    const currentParticleColors = theme === 'dark' ? DARK_MODE_PARTICLE_COLORS : LIGHT_MODE_PARTICLE_COLORS;
    const currentBackgroundGradient = theme === 'dark' ? DARK_MODE_BACKGROUND_GRADIENT : LIGHT_MODE_BACKGROUND_GRADIENT;

    return (
        <motion.div
            variants={stageContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 font-sans"
        >
            {/* REVIEW: Ensure BubbleAnimation is visually performing as expected. */}
            <BubbleAnimation
                containerClassName={cn(currentBackgroundGradient)}
                particleColors={currentParticleColors}
                particleCount={1000} // REVIEW: Particle count, adjust for performance/visuals.
            />

            <motion.div
                variants={cardBaseVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative z-10 w-full max-w-md bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-2xl text-center overflow-hidden"
            // REVIEW: Ensure p-8, rounded-2xl, shadow-2xl match desired "original look".
            >
                <AnimatePresence mode="wait">
                    {animationStep === 'revealTable' && (
                        <motion.div
                            key="tableRevealContent"
                            variants={contentSectionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-2" // REVIEW: Adjust spacing if needed.
                        >
                            <motion.div variants={itemFadeInUpVariants}>
                                {/* REVIEW: Icon size, color, margin. */}
                                <Icon name="table_restaurant" className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-3" />
                            </motion.div>
                            <motion.h1 variants={itemFadeInUpVariants} className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                                Welcome!
                            </motion.h1>
                            <motion.p variants={itemFadeInUpVariants} className="text-xl text-neutral-600 dark:text-neutral-300 mt-1">
                                You are at Table
                            </motion.p>
                            <motion.p
                                variants={tableNumberTextVariants}
                                initial="initial"
                                animate="animate"
                                className="text-6xl font-bold text-red-600 dark:text-red-500 my-3"
                            // REVIEW: Font size, color, margins for table number. `tableNumber` prop is key.
                            >
                                {tableNumber}
                            </motion.p>
                            <motion.div variants={itemFadeInUpVariants} className="pt-3">
                                <div className="h-1 w-20 bg-red-200 dark:bg-red-500/30 mx-auto rounded-full animate-pulse"></div>
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
                                <Icon name="table_restaurant" className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-2" />
                                <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
                                    Table {tableNumber}
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Let's get you set up!</p>
                            </motion.div>

                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                                <motion.div variants={itemFadeInUpVariants}>
                                    {/* REVIEW: Styling of InputField comes from its own component. Ensure it matches. */}
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
                                        required // HTML5 required attribute
                                    />
                                </motion.div>

                                <motion.div variants={itemFadeInUpVariants}>
                                    <label htmlFor="numberOfPeople" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 text-left mb-1.5">
                                        Number of Guests
                                    </label>
                                    {/* REVIEW: Styling of NumberStepperfix. Ensure it matches. */}
                                    <NumberStepperfix
                                        id="numberOfPeople"
                                        min={1}
                                        max={12} // REVIEW: Max guests, adjust if needed.
                                        value={actualNumberOfPeople}
                                        onChange={handleNumberOfPeopleChange}
                                        label="" // Visually hidden label assumed, ensure accessibility if not.
                                        inputClassName="text-center dark:bg-neutral-700 dark:text-neutral-100 h-10"
                                        buttonClassName="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-10 h-10"
                                        containerClassName="flex justify-center items-center"
                                    />
                                </motion.div>

                                <motion.button
                                    variants={itemFadeInUpVariants}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-800 disabled:opacity-60 flex items-center justify-center"
                                    // REVIEW: Button styling (colors, padding, shadow, font).
                                    whileHover={{ scale: isLoading ? 1 : 1.03, y: isLoading ? 0 : -2 }}
                                    whileTap={{ scale: isLoading ? 1 : 0.97 }}
                                >
                                    {isLoading ? (
                                        <>
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
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: animationStep === 'showForm' ? 1.0 : 3.2, duration: 0.6, ease: smoothEase } }}
                className="relative z-10 mt-8 text-sm text-white/80 dark:text-neutral-400/80"
            // REVIEW: Footer text styling and content.
            >
                Enjoy your meal! If you need assistance, please alert our staff.
            </motion.p>
        </motion.div>
    );
}

export default SetupStage;