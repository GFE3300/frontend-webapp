import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { scriptLines_dashboard as sl } from '../utils/script_lines'; // Import script lines
import { interpolate } from '../../../i18n'; // Import interpolate helper

/**
 * A personalized, time-aware greeting component for the dashboard overview.
 */
const DashboardGreeting = () => {
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return sl.dashboardGreeting.goodMorning || "Good morning";
        }
        if (hour >= 12 && hour < 18) {
            return sl.dashboardGreeting.goodAfternoon || "Good afternoon";
        }
        return sl.dashboardGreeting.goodEvening || "Good evening";
    };

    const greeting = getGreeting();
    // Provide a fallback 'Agent' name that fits the theme if the user's name isn't available yet.
    const firstName = user?.firstName || (sl.dashboardGreeting.fallbackName || 'Agent');

    const fullGreeting = interpolate(sl.dashboardGreeting.greeting || '{{greeting}}, {{firstName}}.', {
        greeting,
        firstName
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
        >
            <h1 className="font-montserrat text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {fullGreeting}
            </h1>
            <p className="mt-1 text-md text-neutral-500 dark:text-neutral-400">
                {sl.dashboardGreeting.subtitle || 'Here is the real-time pulse of your business operations.'}
            </p>
        </motion.div>
    );
};

export default DashboardGreeting;