import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const mainContentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeInOut" } },
};

const MainContentArea = () => {
    const location = useLocation();

    return (
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-6 bg-neutral-100 dark:bg-neutral-900">
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname} // Key change triggers animation
                    className='w-full h-full'
                    variants={mainContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        </main>
    );
};

export default MainContentArea;