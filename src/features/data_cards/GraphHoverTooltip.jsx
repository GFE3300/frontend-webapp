import React from 'react';
import PropTypes from 'prop-types';
//eslint-disable-next-line
import { motion } from 'framer-motion';

/**
 * GraphHoverTooltip
 * Displays a tooltip box near the hover point, positioning itself
 * above or below and to the left or right depending on available space.
 */
export default function GraphHoverTooltip({
    size,
    tooltipSize,
    position,
    placement,
    content
}) {
    if (!position || !tooltipSize) return null;

    const hoverX = position.x;
    const tooltipWidth = tooltipSize.width;
    const tooltipHeight = tooltipSize.height;
    const padding = 8;

    // Determine vertical placement: above if there's space, else below
    const placeAbove = placement === 'top';

    // Determine horizontal placement: right if there's space, else left
    const placeRight = hoverX + tooltipWidth + padding < size.width;

    // Compute top/left coordinates
    const top = placeAbove
        ? 0
        : size.height - tooltipHeight - padding;
    const left = placeRight
        ? hoverX + padding * 2
        : hoverX - tooltipWidth - (padding * 2);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, left }}
            transition={{
                duration: 0.5,
                ease: 'easeOut',
                left: { duration: 0.2 },
            }}
            exit={{ opacity: 0, scale: 0.8, left: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
            style={{
                top,
                left: placeRight ? hoverX + 20 : hoverX - tooltipWidth - 20,
                width: tooltipWidth,
                height: tooltipHeight,
            }}
            className='absolute pointer-events-none bg'
        >
            {content}
        </motion.div>
    );
}

GraphHoverTooltip.propTypes = {
    size: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }).isRequired,
    hoverX: PropTypes.number,
    hoverY: PropTypes.number,
    content: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};
