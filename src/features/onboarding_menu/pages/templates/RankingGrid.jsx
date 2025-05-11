import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Icon from '../../../../components/common/Icon';

export default function RankingBadges({
    options,
    value = [],
    onChange,
    maxSelections = 3
}) {
    const handleItemClick = (item) => {
        const isSelected = value.some(sel => sel.key === item.key);
        let newSelection;

        if (isSelected) {
            // Deselect item
            newSelection = value.filter(sel => sel.key !== item.key);
        } else if (value.length < maxSelections) {
            // Select new item
            newSelection = [...value, item];
        } else {
            // Max selections reached
            return;
        }

        onChange?.(newSelection);
    };

    return (
        <div className="w-full mx-auto">
            <div className="grid grid-cols-3 gap-6">
                {options.map(item => {
                    const isSelected = value.some(sel => sel.key === item.key);
                    const [start, end] = item.gradient;
                    const isDisabled = value.length >= maxSelections && !isSelected;

                    return (
                        <motion.div
                            key={item.key}
                            onClick={() => !isDisabled && handleItemClick(item)}
                            className={clsx(
                                "relative flex flex-col items-center",
                                isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                            )}
                            style={{ perspective: 1000 }}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            {/* Interactive Badge Orb */}
                            <motion.div
                                style={{
                                    backgroundImage: `linear-gradient(45deg, ${start}, ${end})`,
                                    borderColor: start
                                }}
                                animate={{
                                    boxShadow: isSelected
                                        ? [`0 0 12px ${end}`, `0 0 24px ${end}`]
                                        : 'inset 2px 2px 6px rgba(255,255,255,0.6), inset -2px -2px 6px rgba(0,0,0,0.1)',
                                    opacity: isDisabled ? 0.5 : 1
                                }}
                                transition={{
                                    boxShadow: isSelected
                                        ? { duration: 1.6, repeat: Infinity, repeatType: 'reverse' }
                                        : { duration: 0.3 }
                                }}
                                className={clsx(
                                    'h-16 w-16 rounded-full flex items-center justify-center',
                                    'text-white text-xl border-2 relative',
                                    isSelected && 'ring-2 ring-offset-2 ring-offset-white'
                                )}
                                whileHover={!isDisabled ? { scale: 1.05 } : undefined}
                                whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                            >
                                {/* Selection States */}
                                <AnimatePresence>
                                    {isSelected ? (
                                        <motion.span
                                            key="check"
                                            className="absolute w-6 h-6 text-2xl"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ type: 'spring' }}
                                        >
                                            <Icon name="check" className="w-6 h-6" />
                                        </motion.span>
                                    ) : (
                                        <motion.img
                                            key="icon"
                                            src={item.icon}
                                            alt={item.label}
                                            className="w-8 h-8"
                                            initial={{ scale: 1 }}
                                            whileHover={{ scale: 1.2 }}
                                            transition={{ type: 'spring' }}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Label with Selection Status */}
                            <motion.span
                                className={clsx(
                                    "mt-2 text-xs font-medium font-inter",
                                    isSelected ? "text-[var(--color-chocolate)]" : "text-gray-500"
                                )}
                                animate={{
                                    opacity: isDisabled ? 0.7 : 1,
                                    y: isSelected ? 2 : 0
                                }}
                            >
                                {item.label}
                            </motion.span>

                            {/* Selection Counter Badge */}
                            {isSelected && (
                                <motion.div
                                    className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 shadow-sm text-xs font-bold text-[var(--color-chocolate)]"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    {value.findIndex(sel => sel.key === item.key) + 1}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}