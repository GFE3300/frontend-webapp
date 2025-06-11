import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Defines the animation variants for page transitions.
// This creates a subtle fade-in and slide-up effect.
const mainContentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeInOut" } },
};

const MainContentArea = () => {
    // The useLocation hook is essential for tracking route changes.
    const location = useLocation();

    return (
        // The <main> element will contain our animated page content.
        // `overflow-y-auto` allows its content to scroll vertically if it's too long.
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-6">
            {/* AnimatePresence handles the enter and exit animations of its direct child.
                `mode="wait"` ensures the exiting component finishes its animation before the new one enters. */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    className='w-full h-full'
                    variants={mainContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {/* The Outlet component from react-router-dom renders the active nested route's component (e.g., OverviewPage, ProductsPage). */}
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        </main>
    );
};

export default MainContentArea;