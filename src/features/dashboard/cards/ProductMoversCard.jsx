import React, { useState, Suspense } from 'react';
import { useProductMovers } from '../hooks/useOverviewData';
import SegmentedControl from '../../../components/common/SegmentedControl';
import Icon from '../../../components/common/Icon';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useAuth } from '../../../contexts/AuthContext';
import { scriptLines_dashboard as sl } from '../utils/script_lines';

const ProductMoversCard = () => {
    const [period, setPeriod] = useState('today');

    // These options now get their labels from script_lines
    const periodOptions = [
        { label: sl.productMoversCard.periodToday || 'Today', value: 'today' },
        { label: sl.productMoversCard.periodWeek || 'Week', value: 'week' },
        { label: sl.productMoversCard.periodMonth || 'Month', value: 'month' },
    ];

    return (
        <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                    {sl.productMoversCard.title || "Today's Hot Sheet"}
                </h2>
                <div className="mt-3 sm:mt-0">
                    <SegmentedControl
                        options={periodOptions}
                        value={period}
                        onChange={setPeriod}
                        name="productMoversPeriod"
                    />
                </div>
            </div>
            {/* The Suspense boundary is placed here to refetch content when the key changes */}
            <Suspense fallback={<ProductMoversCardSkeleton />}>
                <ProductMoversContent period={period} />
            </Suspense>
        </div>
    );
};


const MoverList = ({ title, icon, iconClass, items, currency }) => {
    const hasItems = items && items.length > 0;

    return (
        <div className="flex-1">
            <h3 className="flex items-center text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-3">
                <Icon name={icon} className={`h-5 w-5 mr-2 ${iconClass}`} />
                {title}
            </h3>
            <ul className="space-y-2">
                {hasItems ? items.slice(0, 5).map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-neutral-800 dark:text-neutral-100 truncate pr-2">{item.name}</span>
                        <span className="font-semibold text-neutral-600 dark:text-neutral-300 flex-shrink-0">
                            {formatCurrency(item.revenue, currency)}
                        </span>
                    </li>
                )) : (
                    <li className="text-center text-xs text-neutral-400 dark:text-neutral-500 py-4">
                        {sl.productMoversCard.noData || 'No data for this period.'}
                    </li>
                )}
            </ul>
        </div>
    );
};

const ProductMoversContent = ({ period }) => {
    // This hook will suspend while fetching, handled by <Suspense>
    const data = useProductMovers(period);
    const { user } = useAuth(); // To get the business's currency

    return (
        <div className="mt-4 flex flex-col sm:flex-row gap-6 sm:gap-8">
            <MoverList
                title={sl.productMoversCard.topItemsTitle || 'Top 5 Selling Items'}
                icon="trending_up"
                iconClass="text-green-500"
                items={data.top_movers}
                currency={user?.activeBusinessCurrency}
            />
            <MoverList
                title={sl.productMoversCard.bottomItemsTitle || 'Bottom 5 Selling Items'}
                icon="trending_down"
                iconClass="text-red-500"
                items={data.bottom_movers}
                currency={user?.activeBusinessCurrency}
            />
        </div>
    );
};

// Use a separate skeleton component for the content part
const ProductMoversCardSkeleton = () => (
    <div className="mt-4 flex flex-col sm:flex-row gap-6 sm:gap-8 animate-pulse">
        <div className="flex-1">
            <div className="h-5 w-3/5 bg-neutral-200 dark:bg-neutral-700 rounded-md mb-4"></div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                    <div className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                    <div className="h-4 w-1/5 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                    <div className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                </div>
            </div>
        </div>
        <div className="flex-1">
            <div className="h-5 w-3/5 bg-neutral-200 dark:bg-neutral-700 rounded-md mb-4"></div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                    <div className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                    <div className="h-4 w-1/5 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                </div>
            </div>
        </div>
    </div>
);


export default ProductMoversCard;