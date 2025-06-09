import React, { useRef } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GraphHoverGuides
 * Enhances hover inspector with two vertical guide lines:
 *   - One from the top of the graph to the hover point
 *   - One from the hover point down to the bottom of the graph
 * Renders a dot at the exact curve position. Future enhancements: tooltips, multi-series, etc.
 */
export default function GraphHoverGuides({
    size,
    primaryHover,
}) {
    const containerRef = useRef(null);
    const { x: hoverX, y: hoverY } = primaryHover || {};

    return (
        <div
            ref={containerRef}
            style={{ position: 'absolute', top: 0, left: 0, width: size.width, height: size.height, pointerEvents: 'auto' }}
            className='pointer-events-none'
        >
            <AnimatePresence>
                {hoverX != null && hoverY != null && (
                    <>
                        {/* Top guide line */}
                        <motion.div
                            key="top-line"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: hoverY - 12 }}
                            transition={{
                                duration: 0,
                                opacity: { duration: 0.4 },
                            }}
                            exit={{ opacity: 0, height: 0, transition: { duration: 1, ease: 'easeOut' } }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: hoverX - 4,
                                width: 8,
                                height: hoverY - 12,
                                pointerEvents: 'none',
                                zIndex: 10,
                            }}
                            className='
                                bg-gradient-to-t from-purple-600 from-50% to-slate-0 to-100%
                                rounded-b-full
                            '
                        />

                        {/* Bottom guide line */}
                        <motion.div
                            key="bottom-line"
                            initial={{ opacity: 0, height: 0, top: hoverY + size.height + 12 }}
                            animate={{ opacity: 1, height: size.height - hoverY - 12, top: hoverY + 12 }}
                            transition={{
                                duration: 0,
                                opacity: { duration: 0.4 },
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                                top: hoverY + size.height + 12,
                                transition: { duration: 2, ease: 'easeOut' }
                            }}
                            style={{
                                position: 'absolute',
                                top: hoverY + 12,
                                left: hoverX - 4,
                                width: 8,
                                height: size.height - hoverY - 12,
                                pointerEvents: 'none',
                                zIndex: 10,
                            }}
                            className='
                            bg-gradient-to-b from-purple-600 from-50% to-slate-0 to-100%
                            rounded-t-full'
                        />

                        {/* Hover dot */}
                        <motion.div
                            key="hover-dot"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'absolute',
                                top: hoverY - 8,
                                left: hoverX - 8,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                pointerEvents: 'none',
                                zIndex: 11,
                            }}
                            className='
                            flex items-center justify-center
                            bg-purple-600'
                        >
                            <div className='w-2 h-2 bg-white rounded-full' />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

GraphHoverGuides.propTypes = {
    size: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }).isRequired,
    enrichedVectors: PropTypes.array.isRequired,
};
