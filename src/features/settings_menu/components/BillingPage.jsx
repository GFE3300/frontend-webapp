import React from 'react';
import { motion } from 'framer-motion';

// Import the card component that will be displayed on this page.
import BillingCard from './BillingCard';

/**
 * The main container component for the "/settings/billing" route.
 * It provides a consistent layout and entry animation for the billing section.
 */
const BillingPage = () => {
    return (
        // The motion.div provides a subtle fade-in and slide-up animation
        // that matches the other top-level setting pages.
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <BillingCard />
        </motion.div>
    );
};

export default BillingPage;