import React from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * StaticChar
 * Renders non-numeric characters (e.g., commas, decimal points, minus)
 * with a subtle fade-in/out animation via Framer Motion.
 */
const StaticChar = ({ char }) => (
    <AnimatePresence>
        <motion.span
            className="block text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {char}
        </motion.span>
    </AnimatePresence>
);

StaticChar.propTypes = {
    /**
     * The character to display (e.g., ',', '.', '-')
     */
    char: PropTypes.string.isRequired,
};

export default StaticChar;
