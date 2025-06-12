import React, { useRef, useState } from 'react';
// eslint-disable-next-line
import { AnimatePresence, motion } from 'framer-motion';
import {
    startOfWeek,
    startOfMonth,
    endOfMonth,
    eachWeekOfInterval,
} from 'date-fns';
import { MetricProvider } from '../../shared/context/MetricProvider';
import GridContainer from './GridContainer';
import WeekHeatmapView from '../views/WeekHeatmapView';
import MonthHeatmapView from '../views/MonthHeatmapView';
import { useResponsiveSize } from '../../../../hooks/useResponsiveSize';
import SettingsMenu from './SettingsMenu';
import HeatmapHeader from './HeatmapHeader';
import Icon from '../../../../components/common/Icon';
import sl from '../utils/script_lines';

/**
 * Calculates the number of weeks that span a given month.
 * @param {Date} date - A date within the target month.
 * @returns {number} The number of weeks.
 */
const getWeeksInMonth = (date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    return eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 }).length;
};


/**
 * Main heatmap card content component with week/month view switching
 * @component
 */
function CustomerHeatmapCardContent() {
    const containerRef = useRef(null);
    const size = useResponsiveSize(containerRef);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState('week');
    const [indexLabels, setIndexLabels] = useState([]);
    const [colorRanges, setColorRanges] = useState([]);

    // --- REFINED: The useEffect to correct state is gone. State is now correct on first render. ---
    const [settings, setSettings] = useState(() => {
        const initialMonthDate = startOfMonth(new Date());
        return {
            week: {
                blockStartHour: 8,
                blockDuration: 4,
                numberOfDays: 7,
                startDay: startOfWeek(new Date())
            },
            month: {
                startDate: initialMonthDate,
                numberOfBlocks: getWeeksInMonth(initialMonthDate),
                timeRange: { startHour: 8, endHour: 16 },
                bufferDays: 7,
            }
        };
    });

    return (
        <div
            className="relative flex flex-col items-center justify-center w-full h-90"
        >
            <TitleBar setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />
            <motion.div
                className="relative py-8 px-6 w-full bg-white dark:bg-neutral-800 shadow-xl rounded-4xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <HeatmapHeader
                    viewMode={viewMode}
                    onViewChange={setViewMode}
                    indexLabels={indexLabels}
                    colorRanges={colorRanges}
                />

                <div className='flex flex-col items-center justify-center w-full max-h-[calc(100%-60px)]'>
                    <GridContainer size={size} ref={containerRef}>
                        {viewMode === 'week' ? (
                            <WeekHeatmapView
                                settings={settings.week}
                                setColorRanges={setColorRanges}
                                setIndexLabels={setIndexLabels}
                            />
                        ) : (
                            <MonthHeatmapView
                                settings={settings.month}
                                setColorRanges={setColorRanges}
                                setIndexLabels={setIndexLabels}
                            />
                        )}
                    </GridContainer>

                    <SettingsMenu
                        isOpen={isMenuOpen}
                        onClose={() => setIsMenuOpen(false)}
                        settings={settings}
                        onUpdate={setSettings}
                        size={size}
                    />
                </div>
            </motion.div>
        </div>
    );
}

const TitleBar = ({ setIsMenuOpen, isMenuOpen }) => {
    const cardStrings = sl.heatmap.customerHeatmapCard;
    return (
        <motion.div
            className="flex w-full justify-between items-center gap-4 mb-1 px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <div className="flex items-center gap-3">
                <motion.div
                    className="flex items-center justify-center h-10 w-10 p-2 rounded-xl bg-white dark:bg-neutral-800"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Icon
                        name="group"
                        className="w-5 h-5 text-rose-400 dark:text-rose-400"
                        variations={{ fill: 1, weight: 700, grade: 0, opsz: 48 }}
                        style={{ fontSize: '20px' }}
                    />
                </motion.div>
                <div className="flex h-full justify-center items-end">
                    <h2 className="text-xl font-montserrat font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
                        {cardStrings.title || 'Customer Activity'}
                    </h2>
                </div>
            </div>
            <AnimatePresence>
                <div className="flex items-center gap-2">
                    <motion.button
                        className="
                            flex items-center justify-center p-2 w-10 h-10
                            bg-white dark:bg-neutral-800
                            hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-xl transition-colors relative"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={cardStrings.openSettingsAriaLabel || 'Open settings'}
                    >
                        {isMenuOpen ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isMenuOpen ? 1 : 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full"
                            >
                                <Icon
                                    name="close"
                                    className="w-6 h-6 text-gray-600 dark:text-gray-300"
                                    variations={{ fill: 1, weight: 500, grade: 0, opsz: 48 }}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: !isMenuOpen ? 1 : 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full"
                            >
                                <Icon
                                    name="more_vert"
                                    className="w-6 h-6 text-gray-600 dark:text-gray-300"
                                    variations={{ fill: 1, weight: 400, grade: 0, opsz: 48 }}
                                />
                            </motion.div>
                        )}
                    </motion.button>
                </div>
            </AnimatePresence>
        </motion.div>
    );
};

export default function CustomerHeatmapCard() {
    return (
        <CustomerHeatmapCardContent />
    );
}