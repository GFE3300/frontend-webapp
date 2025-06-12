import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import InteractiveDonutChart from './subcomponents/InteractiveDonutChart';
import { formatCurrency } from '../../../../utils/formatCurrency';
import AnimatedNumber from '../../../../components/animated_number/animated-number';
import InteractiveLineChart from './subcomponents/InteractiveLineChart';
import { useCurrency } from '../../../../hooks/useCurrency';
import { scriptLines_dashboard as sl } from '../../utils/script_lines'; // I18N
import { interpolate } from '../../../../i18n'; // I18N Helper

const DefaultView = ({ data, currency, isHovered, hoveredData, onChartHover, onChartLeave = () => { } }) => {
    const { current_value = 0, comparison_percentage = 0, today_trend = [], yesterday_trend = [] } = data || {};
    const isPositive = comparison_percentage >= 0;
    const trendIcon = isPositive ? 'trending_up' : 'trending_down';
    const [showVsYesterday, setShowVsYesterday] = useState(false);
    const { currencySymbol } = useCurrency();

    useEffect(() => {
        const timer = setTimeout(() => setShowVsYesterday(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    const displayValue = hoveredData ? hoveredData.today : current_value;

    return (
        <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full justify-between font-montserrat"
        >
            {/* Top Section - Now just the value and comparison text */}
            <div className="flex-grow flex flex-col justify-center">
                <AnimatePresence>
                    {hoveredData && (
                        <motion.p
                            key="comparison"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs text-neutral-500 mb-1"
                        >
                            {interpolate(sl.revenueCard.vsYesterdayComparison || 'vs {{value}} yesterday', { value: formatCurrency(hoveredData.yesterday, currency) })}
                        </motion.p>
                    )}
                </AnimatePresence>
                <div className="text-4xl font-bold text-neutral-800 dark:text-neutral-50">
                    <AnimatedNumber value={displayValue} />
                    {currencySymbol}
                </div>
            </div>

            {/* Bottom Section - Chart and trend pill */}
            <div className="h-10 border-t border-neutral-200 dark:border-neutral-700 flex items-center">
                <AnimatePresence mode="wait">
                    {isHovered ? (
                        <motion.div
                            key="chart"
                            className="w-full h-8 pt-1" // Reduced height
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        >
                            <InteractiveLineChart
                                todayData={today_trend}
                                yesterdayData={yesterday_trend}
                                onHoverDataChange={onChartHover}
                                onHoverEnd={onChartLeave}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pill"
                            layout
                            className={`flex items-center text-sm font-semibold rounded-full px-2 py-0.5 ${isPositive ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-500/20' : 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-500/20'}`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        >
                            <Icon name={trendIcon} className="w-4 h-4 mr-1" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 700, grade: 0, opsz: 48 }} />
                            <span>{Math.abs(comparison_percentage).toFixed(1)}%</span>
                            <AnimatePresence>
                                {showVsYesterday && (
                                    <motion.p
                                        className="ml-1 h-4 flex items-center overflow-hidden truncate max-w-[200px]"
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto', transition: { delay: 0.1 } }}
                                    >
                                        {sl.revenueCard.vsYesterday || 'vs yesterday'}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const InsightView = ({ data, currency }) => {
    const { avg_spend_per_guest = 0, category_breakdown = [] } = data || {};

    const chartData = useMemo(() => {
        const categoryColors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#7C3AED', '#6D28D9'];
        return category_breakdown.map((item, index) => ({
            value: parseFloat(item.revenue) || 0,
            color: item.color || categoryColors[index % categoryColors.length],
            label: item.category_name,
        }));
    }, [category_breakdown]);


    return (
        <motion.div
            key="insight"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full w-full justify-between font-montserrat"
        >
            <div className="flex-grow flex items-center justify-start w-full">
                <InteractiveDonutChart data={chartData} size={80} strokeWidth={15} />
            </div>
            <div className="mt-2 pt-2 flex items-start border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">{sl.revenueCard.avgSpendPerGuest || 'Avg. Spend / Guest'}</span>
                <span className="font-semibold text-neutral-800 dark:text-white">
                    {formatCurrency(parseFloat(avg_spend_per_guest) || 0, currency)}
                </span>
            </div>
        </motion.div>
    );
};

const DailyRevenueCard = ({ data, insightData }) => {
    const [isInsightVisible, setInsightVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [hoveredData, setHoveredData] = useState(null);
    const { currency } = useCurrency();

    const handleChartHover = (newData) => setHoveredData(newData);
    const handleChartLeave = () => setHoveredData(null);

    return (
        <motion.div
            layout
            onClick={() => setInsightVisible(!isInsightVisible)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="rounded-3xl overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-neutral-800 dark:to-purple-900/20 shadow-lg h-48 w-full cursor-pointer flex flex-col p-4"
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            transition={{ duration: 0.2 }}
        >
            {/* --- NEW: Stable Header --- */}
            <div className="flex w-full justify-between items-start text-neutral-500 dark:text-neutral-300 mb-2">
                <h3 className="font-medium text-lg font-montserrat">
                    {isInsightVisible ? (sl.revenueCard.titleInsight || 'Revenue Engine') : (sl.revenueCard.title || 'Revenue Today')}
                </h3>
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-700 shrink-0">
                    <Icon name="monitoring" className="w-4 h-4 text-purple-500" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 600, grade: 0, opsz: 48 }} />
                </div>
            </div>

            {/* --- Animated Content Area --- */}
            <div className="flex-grow flex flex-col">
                <AnimatePresence mode="wait">
                    {isInsightVisible ? (
                        <InsightView data={insightData} currency={currency} />
                    ) : (
                        <DefaultView
                            data={data}
                            currency={currency}
                            isHovered={isHovered}
                            hoveredData={hoveredData}
                            onChartHover={handleChartHover}
                            onChartLeave={handleChartLeave}
                        />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default DailyRevenueCard;