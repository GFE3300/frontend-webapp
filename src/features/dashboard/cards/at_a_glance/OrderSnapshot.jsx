// src/features/dashboard/cards/at_a_glance/OrderSnapshot.jsx

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../../components/common/Icon';

const attentionVariants = {
    pulse: {
        backgroundColor: ["rgba(239, 68, 68, 0)", "rgba(239, 68, 68, 0.15)", "rgba(239, 68, 68, 0)"],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const confirmationVariants = {
    glow: {
        filter: [
            "drop-shadow(0 0 0px rgba(245, 158, 11, 0))",
            "drop-shadow(0 0 8px rgba(245, 158, 11, 0.7))",
            "drop-shadow(0 0 0px rgba(245, 158, 11, 0))",
        ],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const OrderSnapshot = ({ data }) => {
    const { count = 0, needs_confirmation = false, needs_attention = false } = data || {};

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            {needs_attention && (
                <motion.div
                    className="absolute inset-0"
                    variants={attentionVariants}
                    animate="pulse"
                    title="One or more orders need manager attention"
                />
            )}
            <motion.div
                className="flex flex-col items-center justify-center"
                variants={confirmationVariants}
                animate={needs_confirmation ? "glow" : ""}
                title={needs_confirmation ? "You have new orders to confirm" : ""}
            >
                <Icon name="receipt_long" className="text-4xl text-neutral-600 dark:text-neutral-300" />
                <span className="text-5xl font-bold text-neutral-800 dark:text-neutral-100 mt-2">
                    {count}
                </span>
            </motion.div>
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mt-1">
                Live Orders
            </span>
        </div>
    );
};

export default OrderSnapshot;