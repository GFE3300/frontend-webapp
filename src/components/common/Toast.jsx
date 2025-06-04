import React, { useEffect } from 'react';
// eslint-disable-next-line
import { motion, useReducedMotion } from 'framer-motion';
import Icon from './Icon'; // Assuming Icon.jsx is in the same common folder

// Styling Constants (Guideline 4.5 - Alerts/Notifications)
// These can be expanded or moved to a theme file later
const TOAST_BASE_STYLE = "flex items-center p-3 rounded-lg shadow-lg text-sm font-medium";
const TOAST_MAX_WIDTH = "max-w-sm w-full"; // Consistent max width for toasts

const TYPE_STYLES = {
    success: {
        bg: "bg-green-500 dark:bg-green-600",
        text: "text-white",
        icon: "check_circle",
        iconColor: "text-white",
        ariaRole: "status"
    },
    error: {
        bg: "bg-red-500 dark:bg-red-600",
        text: "text-white",
        icon: "error",
        iconColor: "text-white",
        ariaRole: "alert"
    },
    info: {
        bg: "bg-sky-500 dark:bg-sky-600",
        text: "text-white",
        icon: "info",
        iconColor: "text-white",
        ariaRole: "status"
    },
    warning: {
        bg: "bg-amber-500 dark:bg-amber-600",
        text: "text-white", // Or black for better contrast on amber
        icon: "warning",
        iconColor: "text-white",
        ariaRole: "alert"
    },
};

const DEFAULT_TYPE_STYLE = TYPE_STYLES.info;

const Toast = ({ id, message, type = 'info', duration, onDismiss }) => {
    const shouldReduceMotion = useReducedMotion();
    const styles = TYPE_STYLES[type] || DEFAULT_TYPE_STYLE;

    useEffect(() => {
        if (duration && onDismiss) {
            const timer = setTimeout(() => {
                onDismiss(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onDismiss]);

    const toastVariants = {
        initial: shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 50, scale: 0.9 },
        animate: shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, scale: 1 },
        exit: shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
    };

    const toastTransition = shouldReduceMotion
        ? { duration: 0.01 } // Quick fade for reduced motion
        : { type: 'spring', stiffness: 400, damping: 30, duration: 0.3 };

    return (
        <motion.div
            layout // Enables smooth reordering if toasts are added/removed
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={toastTransition}
            className={`${TOAST_BASE_STYLE} ${styles.bg} ${styles.text} ${TOAST_MAX_WIDTH} font-inter`}
            role={styles.ariaRole} // Guideline 7: ARIA
            aria-live={styles.ariaRole === "alert" ? "assertive" : "polite"}
            aria-atomic="true"
        >
            {styles.icon && (
                <Icon name={styles.icon} className={`w-6 h-6 mr-3 flex-shrink-0 ${styles.iconColor}`} />
            )}
            <span className="flex-grow">{message}</span>
            {onDismiss && ( // Render dismiss button only if onDismiss is provided (for manual dismissal)
                <button
                    onClick={() => onDismiss(id)}
                    className={`ml-4 p-1 w-6 h-6 rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors`}
                    aria-label="Dismiss notification"
                >
                    <Icon name="close" className={`w-4 h-4 ${styles.iconColor}`} style={{ fontSize: "1rem" }} />
                </button>
            )}
        </motion.div>
    );
};

export default Toast;