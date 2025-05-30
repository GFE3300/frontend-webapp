import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import Icon from './Icon';

const SegmentedControl = ({ options, value, onChange, size = "normal" }) => {
    const [pillStyle, setPillStyle] = useState({});
    const containerRef = useRef(null);

    // Find the ref of the currently active button
    const refs = options.map(() => useRef(null));
    const activeIndex = options.findIndex(opt => opt.value === value);

    useEffect(() => {
        if (activeIndex !== -1 && refs[activeIndex]?.current && containerRef.current) {
            const activeRef = refs[activeIndex].current;
            const containerRect = containerRef.current.getBoundingClientRect();
            const activeRect = activeRef.getBoundingClientRect();

            setPillStyle({
                left: activeRect.left - containerRect.left,
                width: activeRect.width,
                height: activeRect.height,
            });
        }
    }, [value, options, activeIndex, refs]); // Rerun when value or options change

    const paddingClasses = size === "small" ? "px-2.5 py-1" : "px-3 py-1.5";
    const textSizeClasses = size === "small" ? "text-xs" : "text-xs"; // Can adjust if needed
    const iconSizeClasses = size === "small" ? "w-3.5 h-3.5" : "w-4 h-4";
    const iconFontSize = size === "small" ? "0.875rem" : "0.875rem";
    const iconMargin = size === "small" ? "mr-1" : "mr-1.5";


    return (
        <div
            ref={containerRef}
            className="relative flex space-x-1 bg-neutral-200 dark:bg-neutral-700 p-1 rounded-full font-montserrat"
        >
            {/* Animated Pill Background */}
            {Object.keys(pillStyle).length > 0 && (
                <motion.div
                    className="absolute bg-white dark:bg-neutral-800 shadow-sm rounded-full"
                    initial={false}
                    animate={pillStyle}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
            )}

            {options.map((opt, index) => (
                <button
                    key={opt.value}
                    ref={refs[index]}
                    onClick={() => onChange(opt.value)}
                    className={`relative z-10 ${paddingClasses} ${textSizeClasses} font-medium rounded-md transition-colors duration-200 flex items-center
                        ${value === opt.value
                            ? 'text-rose-600 dark:text-rose-400' // Active text color
                            : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100' // Inactive text color
                        }
                    `}
                >
                    {opt.icon && 
                        <Icon 
                        name={opt.icon} 
                        className={`${iconSizeClasses} ${iconMargin} flex items-center justify-center`} 
                        style={{ fontSize: iconFontSize }}
                        />}
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

export default SegmentedControl;