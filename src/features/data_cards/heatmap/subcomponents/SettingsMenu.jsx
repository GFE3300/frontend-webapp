import { useState, useEffect } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { eachWeekOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import TimeRangeSlider from '../../../../components/common/TimeRangeSlider';
import BlockNumberSelector from '../../../../components/common/BlockNumberSelector';
import Calendar from '../../../../components/common/Calendar';
import NumberStepper from '../../../../components/common/NumberStepper';
import sl from '../utils/script_lines';

/**
 * Calculates the number of weeks that span a given month.
 * A week is counted if it contains any day of the month.
 * @param {Date} date - A date within the target month.
 * @returns {number} The number of weeks.
 */
const getWeeksInMonth = (date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    // { weekStartsOn: 0 } ensures weeks start on Sunday, matching the calendar display.
    return eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 }).length;
};

const SettingsMenu = ({ isOpen, onClose, settings, onUpdate, size }) => {
    const [activeTab, setActiveTab] = useState('week');
    const [isMobile, setIsMobile] = useState(false);
    const menuStrings = sl.heatmap.settingsMenu;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- REFINED: Specific, declarative handlers for each setting ---

    const handleWeekSettingChange = (key, value) => {
        onUpdate(prev => ({
            ...prev,
            week: { ...prev.week, [key]: value }
        }));
    };

    const handleMonthSettingChange = (key, value) => {
        onUpdate(prev => ({
            ...prev,
            month: { ...prev.month, [key]: value }
        }));
    };

    const handleMonthCalendarChange = ({ start }) => {
        // When the month changes, update both the start date and the number of blocks to display.
        onUpdate(prev => ({
            ...prev,
            month: {
                ...prev.month,
                startDate: start,
                numberOfBlocks: getWeeksInMonth(start)
            }
        }));
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 inset-0 bg-neutral-200/30 dark:bg-neutral-900/30 backdrop-blur-sm "
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed w-full md:w-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 inset-0 w-full h-96 bg-neutral-200/80 dark:bg-neutral-900/80 backdrop-blur-lg rounded-4xl shadow-2xl z-50"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div
                            className="flex flex-col h-full"
                        >
                            {/* Mode Switcher */}
                            <div className="relative mx-3 my-3">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-rose-200/50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 rounded-full"
                                    layoutId="mode-switcher-bg"
                                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                                    style={{
                                        width: 'calc(50% - 2px)',
                                        left: activeTab === 'week' ? 2 : 'calc(50% + 2px)'
                                    }}
                                />
                                <div className="relative flex rounded-full overflow-hidden">
                                    {['week', 'month'].map((tab) => (
                                        <button
                                            key={tab}
                                            className={`
                                                flex-1 px-4 py-3 text-sm font-medium
                                                transition-colors duration-200
                                                ${activeTab === tab
                                                    ? 'text-rose-700 dark:text-rose-300'
                                                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                                                }
                                            `}
                                            onClick={() => setActiveTab(tab)}
                                            style={{ zIndex: 1 }}
                                        >
                                            {tab === 'week' ? (menuStrings.weekTab || 'Week') : (menuStrings.monthTab || 'Month')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content Container */}
                            <div className="flex-1 gap-6 overflow-y-auto overflow-x-hidden max-h-[70vh]">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'week' ? (
                                        <motion.div
                                            key="week-content"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`
                                                flex w-full gap-6 px-4 py-6 overflow-hidden 
                                                ${isMobile ? 'flex-cols' : 'flex-row justify-between'}
                                            `}
                                        >
                                            {/* Calendar Column */}
                                            <div className="space-y-4 w-full">
                                                <Calendar
                                                    mode="week"
                                                    onChange={({ start }) => handleWeekSettingChange('startDay', start)}
                                                    initialSelectedStart={settings.week.startDay}
                                                />
                                            </div>

                                            {/* Settings Column */}
                                            <div className="flex flex-col gap-4 w-full">
                                                <NumberStepper
                                                    label={menuStrings.blockStartHourLabel || 'Block Start Hour (0–23)'}
                                                    min={0} max={23}
                                                    value={settings.week.blockStartHour}
                                                    onChange={(v) => handleWeekSettingChange('blockStartHour', v)}
                                                />
                                                <NumberStepper
                                                    label={menuStrings.blockDurationLabel || 'Block Duration (1–24 hours)'}
                                                    min={1} max={24}
                                                    value={settings.week.blockDuration}
                                                    onChange={(v) => handleWeekSettingChange('blockDuration', v)}
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="month-content"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`
                                                grid w-full gap-6 px-4 py-6 overflow-hidden
                                                ${isMobile ? 'grid-cols-1' : 'grid-cols-[300px_1fr]'}
                                            `}
                                        >
                                            {/* Calendar Column */}
                                            <div className="space-y-4 max-w-75">
                                                <Calendar
                                                    mode="month"
                                                    onChange={handleMonthCalendarChange}
                                                    initialSelectedStart={settings.month.startDate}
                                                />
                                            </div>

                                            {/* Settings Column */}
                                            <div className="flex flex-col justify-between max-w-75">
                                                <div>
                                                    <label className="block text-xs text-neutral-500 mb-1">
                                                        {menuStrings.operationalHoursLabel || 'Operational Hours'}
                                                    </label>
                                                    <TimeRangeSlider
                                                        initialStart={settings.month.timeRange.startHour}
                                                        initialEnd={settings.month.timeRange.endHour}
                                                        onChange={({ start, end }) => handleMonthSettingChange(
                                                            'timeRange',
                                                            { startHour: start, endHour: end }
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-neutral-500 mb-4">
                                                        {menuStrings.bufferDaysLabel || 'Buffer Days (0-14)'}
                                                    </label>
                                                    <BlockNumberSelector
                                                        value={settings.month.bufferDays}
                                                        onChange={(v) => handleMonthSettingChange('bufferDays', v)}
                                                        max={14}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SettingsMenu;