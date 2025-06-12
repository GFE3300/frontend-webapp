import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import Cell from './Cell';
import sl from '../utils/script_lines';

const DEFAULT_ROW_HEADER_WIDTH = 50;
const DEFAULT_GAP = 5;

// Animation configuration
const cellVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (index) => ({
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 10,
            delay: index * 0.05
        }
    })
};

const HeatmapGrid = React.memo(({
    data = [],
    rowLabels = [],
    colLabels = [],
    theme,
    size = { width: 800, height: 600 },
    gap = DEFAULT_GAP,
    maxValue = 0,
    findGroupIndex
}) => {
    const gridStrings = sl.heatmap.heatmapGrid;
    // console.log('HeatmapGrid render', size);
    const rowCount = rowLabels.length;
    const colCount = colLabels.length;

    const { cellWidth, cellHeight, totalWidth, totalHeight } = useMemo(() => {
        const contentWidth = Math.max(0, size.width - DEFAULT_ROW_HEADER_WIDTH - (colCount - 1) * gap);
        const contentHeight = Math.max(0, size.height - (rowCount - 1) * gap);

        return {
            contentWidth,
            contentHeight,
            cellWidth: contentWidth / colCount,
            cellHeight: contentHeight / rowCount,
            totalWidth: DEFAULT_ROW_HEADER_WIDTH + (contentWidth / colCount * colCount) + (gap * (colCount - 1)),
            totalHeight: (contentHeight / rowCount * rowCount) + (gap * (rowCount - 1))
        };
    }, [size, colCount, rowCount, gap]);

    return (
        <motion.div
            className="overflow-visible"
            animate={{
                width: totalWidth,
                height: totalHeight + 24,
            }}
        >
            {/* Grid Body */}
            <div
                className="relative"
                style={{
                    width: totalWidth,
                    height: totalHeight,
                }}
                role="grid"
                aria-label={gridStrings.ariaLabel || 'Data heatmap grid'}
            >
                {rowLabels.map((rowLabel, rowIdx) => {

                    return (
                        <motion.div
                            key={rowIdx}
                            className="absolute flex items-center"
                            style={{
                                top: rowIdx * (cellHeight + gap),
                                height: cellHeight,
                                width: totalWidth,
                            }}
                            role="row"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: rowIdx * 0.05 }}
                        >
                            {/* Row Header */}
                            <div
                                className="
                                    flex items-center justify-start
                                    sticky left-0 bg-background 
                                    pr-1 z-20  
                                    text-sm text-gray-600 dark:text-gray-300"
                                style={{
                                    width: DEFAULT_ROW_HEADER_WIDTH,
                                    height: cellHeight,
                                }}
                                role="rowheader"
                            >
                                <span
                                    className="
                                        font-montserrat font-semibold text-xs
                                        truncate text-ellipsis"
                                >
                                    {rowLabel}
                                </span>
                            </div>

                            {/* Data Cells */}
                            <div
                                className="flex flex-1"
                                style={{
                                    gap: `${gap}px`,
                                    marginLeft: gap,
                                }}
                            >
                                {colLabels.map((_, colIdx) => {
                                    const animationIndex = rowIdx * colCount + colIdx;
                                    const groupIndex = findGroupIndex(data[rowIdx]?.[colIdx]) || 0;                                    
                                    
                                    return (
                                        <motion.div
                                            key={colIdx}
                                            variants={cellVariants}
                                            initial="hidden"
                                            animate="visible"
                                            custom={animationIndex}
                                            onClick={() => console.log(rowIdx, colIdx, data[rowIdx]?.[colIdx] * maxValue / 100)}
                                        >
                                            <Cell
                                                percentage={data[rowIdx]?.[colIdx]  || 0}
                                                level={groupIndex}
                                                maxCustomers={maxValue}
                                                theme={theme}
                                                style={{
                                                    width: cellWidth,
                                                    height: cellHeight,
                                                    flex: `0 0 ${cellWidth}px`,
                                                }}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Column Footers */}
            <motion.div
                className="bg-background z-10"
                style={{
                    width: totalWidth,
                    paddingLeft: DEFAULT_ROW_HEADER_WIDTH,
                    paddingBottom: gap,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div
                    className="flex"
                    style={{
                        gap: `${gap}px`,
                        width: totalWidth - DEFAULT_ROW_HEADER_WIDTH,
                    }}
                >
                    {colLabels.map((label, colIdx) => (
                        <motion.div
                            key={colIdx}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + colIdx * 0.05 }}
                        >
                            <div
                                className="text-center font-montserrat p-1 text-xs font-semibold text-gray-600 dark:text-gray-300"
                                style={{
                                    width: cellWidth,
                                    flex: `0 0 ${cellWidth}px`,
                                }}
                                role="columnheader"
                            >
                                {label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
});

HeatmapGrid.propTypes = {
    rowLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
    colLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.number)
    ).isRequired,
    size: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    gap: PropTypes.number,
    theme: PropTypes.arrayOf(PropTypes.string),
    onCellClick: PropTypes.func,
};

export default HeatmapGrid;