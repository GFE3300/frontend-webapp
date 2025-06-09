import React, { memo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import WavingBackground from '../../../../components/animations/WavingLine';

// Shared motion props & variants for hover animations
const sharedProps = {
    initial: 'initial',
    whileHover: 'hover',
    transition: { duration: 0.3, ease: 'easeInOut' },
    role: 'button',
    tabIndex: 0,
};

const hoverVariants = {
    initial: { scale: 1, boxShadow: '0px 0px 0px rgba(0,0,0,0)' },
    hover: { scale: 1.05, boxShadow: '0px 4px 10px rgba(0,0,0,0.15)' },
};

const textVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: { opacity: 1, scale: 1, transition: { delay: 0.1 } },
};

// Base color
const BASE_COLOR = '#fb7185';
const COMMON_CLASS = 'relative flex-1 cursor-pointer rounded-xl overflow-hidden';

/** EmptyCell: transparent background */
export const EmptyCell = memo(({ realValue, style }) => (
    <motion.div
        className={COMMON_CLASS}
        style={{ backgroundColor: 'transparent', opacity: 0, ...style }}
        aria-label="No activity"
        whileHover={{ opacity: 1 }}
    >
        <motion.span
            variants={textVariants}
            className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-500"
        >
            {`${realValue}`}
        </motion.span>
    </motion.div >
));
EmptyCell.propTypes = { realValue: PropTypes.number.isRequired, style: PropTypes.object };

/** LowCell: 25–50% intensity with waving background */
export const LowCell = memo(({ realValue, style }) => (
    <motion.div
        {...sharedProps}
        variants={hoverVariants}
        className={COMMON_CLASS}
        style={{ ...style }}
        aria-label={`${realValue}% activity (low)`}
    >
        <WavingBackground
            amplitude={20}
            cycleInterval={8000}
            propagationSpeed={0.3}
            lineColor={BASE_COLOR + '80'}
            lineWidth={3}
            inclinationAngle={-30}
            waveSpacing={8}
            waveVariation={0.02}
            width={style.width}
            height={style.height + 20}
        />
        <motion.span
            variants={textVariants}
            className="
                absolute inset-0 
                flex items-center justify-center 
                text-sm font-semibold text-gray-500 dark:text-gray-400"
        >
            {`${realValue}`}
        </motion.span>
    </motion.div>
));
LowCell.propTypes = { realValue: PropTypes.number.isRequired, style: PropTypes.object };

/** MidCell: 50–75% intensity */
export const MidCell = memo(({ realValue, style }) => (
    <motion.div
        {...sharedProps}
        variants={hoverVariants}
        className={COMMON_CLASS}
        style={{ backgroundColor: `${BASE_COLOR}80`, ...style }}
        aria-label={`${realValue}% activity (medium)`}
    >
        <motion.span
            variants={textVariants}
            className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white"
        >
            {`${realValue}`}
        </motion.span>
    </motion.div>
));
MidCell.propTypes = { realValue: PropTypes.number.isRequired, style: PropTypes.object };

/** HighCell: 75–100% intensity */
export const HighCell = memo(({ realValue, style }) => (
    <motion.div
        {...sharedProps}
        variants={hoverVariants}
        className={COMMON_CLASS}
        style={{ backgroundColor: `${BASE_COLOR}`, ...style }}
        aria-label={`${realValue}% activity (high)`}
    >
        <motion.span
            variants={textVariants}
            className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white"
        >
            {`${realValue}`}
        </motion.span>
    </motion.div>
));
HighCell.propTypes = { realValue: PropTypes.number.isRequired, style: PropTypes.object };