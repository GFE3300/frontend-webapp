import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { WORDS } from '../language_script/script_lines';

/**
 * Temporal granularity selector with animated visual feedback
 * @component
 * @param {Object} props - Component properties
 * @param {'day'|'week'|'month'} props.mode - Currently active mode
 * @param {Function} props.onChange - Mode change handler
 * @returns {JSX.Element} Interactive mode selection tabs
 */
const ModeTabs = ({ mode, onChange }) => {
    const containerRef = useRef(null);
    const tabs = useMemo(() => ['day', 'week', 'month'], []);

    /**
     * Handles keyboard navigation between mode tabs
     * @param {KeyboardEvent} e - Keyboard event
     */
    const handleKeyDown = useCallback((e) => {
        const currentIndex = tabs.indexOf(mode);
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowRight':
                newIndex = (currentIndex + 1) % tabs.length;
                break;
            case 'ArrowLeft':
                newIndex = (currentIndex + tabs.length - 1) % tabs.length;
                break;
            default:
                return;
        }

        e.preventDefault();
        onChange(tabs[newIndex]);
        containerRef.current?.children[newIndex]?.focus();
    }, [mode, onChange, tabs]);

    // Register keyboard event listeners
    useEffect(() => {
        const container = containerRef.current;
        container?.addEventListener('keydown', handleKeyDown);
        return () => container?.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    /**
     * Renders individual mode tab with selection state
     * @param {string} tab - Tab identifier
     * @returns {JSX.Element} Interactive tab element
     */
    const renderTab = (tab) => {
        const isSelected = mode === tab;
        const label = tab.charAt(0).toUpperCase() + tab.slice(1);

        // Base styles for every tab button
        const baseBtn = [
            'relative',
            'font-montserrat',
            'px-3',
            'py-2',
            'text-sm',
            'font-medium',
            'tracking-wide',
            'transition-colors',
            'dark:focus:ring-purple-300'
        ].join(' ');

        // Text color for light / dark / hover
        const textColor = isSelected
            ? 'text-neutral-200 dark:text-neutral-100'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-purple-500';

        return (
            <li key={tab} role="presentation">
                <button
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => onChange(tab)}
                    className={`${baseBtn} ${textColor}`}
                >
                    <span className="relative z-20">
                        {WORDS[label]}
                    </span>
                    {isSelected && (
                        <motion.span
                            layout
                            layoutId="modeIndicator"
                            className="
                                absolute z-10
                                inset-x-0
                                bottom-1
                                h-7
                                bg-purple-500
                                dark:bg-purple-400
                                rounded-full
                            "
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 20
                            }}
                        />
                    )}
                </button>
            </li>
        );
    };

    return (
        <ul
            ref={containerRef}
            role="tablist"
            aria-label="Temporal granularity selection"
            className="
                relative
                flex items-center
                justify-between
                bg-neutral-100
                dark:bg-neutral-800
                rounded-full
                py-1 px-2
            "
        >
            {/* Tabs */}
            {tabs.map(renderTab)}
        </ul >
    );
};

ModeTabs.propTypes = {
    mode: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default ModeTabs;