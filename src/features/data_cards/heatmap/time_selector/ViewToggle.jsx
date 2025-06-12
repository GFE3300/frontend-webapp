import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Icon from '../../../../components/common/Icon';
import sl from '../utils/script_lines';

/**
 * A minimalist collapsible view-mode menu.
 * Shows current mode and expands to select other modes.
 */
export default function ViewModeToggle({ currentView, onChange }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const toggleStrings = sl.heatmap.viewToggle;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [
        { key: 'week', label: toggleStrings.week || 'Week' },
        { key: 'month', label: toggleStrings.month || 'Month' }
    ];

    return (
        <div ref={containerRef} className="relative inline-block text-left">
            {/* Main toggle button */}
            <motion.button
                onClick={() => setOpen((o) => !o)}
                className="
                    px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full 
                    shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 
                    flex items-center justify-between w-24
                    transition duration-200 ease-in-out"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <span className="text-xs font-montserrat font-medium text-gray-800 dark:text-gray-200 capitalize">
                    {currentView === 'week' ? (toggleStrings.week || 'Week') : (toggleStrings.month || 'Month')}
                </span>
                <motion.span
                    className="h-5 text-gray-500 dark:text-gray-400"
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Icon 
                    name="keyboard_arrow_down" 
                    className={`flex items-center justify-center text-2xl text-gray-500 dark:text-gray-400 w-5 h-5`} 
                    style={{ fontSize: '1.25rem' }}
                    />
                </motion.span>
            </motion.button>

            {/* Collapsible options */}
            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 250, damping: 20 } }}
                        exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.15 } }}
                        className="absolute mt-1 w-24 bg-white dark:bg-neutral-900 rounded-lg shadow-lg overflow-hidden z-20"
                    >
                        {options.map(({ key, label }) => (
                            <li key={key}>
                                <button
                                    onClick={() => { onChange(key); setOpen(false); }}
                                    className={clsx(
                                        'w-full text-left px-4 py-2 text-sm transition-colors',
                                        key === currentView
                                            ? 'bg-rose-400 text-white'
                                            : 'bg-transparent text-gray-800 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                    )}
                                >
                                    {label}
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}