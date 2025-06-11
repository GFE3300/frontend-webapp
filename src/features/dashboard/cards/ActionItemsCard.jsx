// src/features/dashboard/cards/ActionItemsCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useActionItems } from '../hooks/useOverviewData';
import Icon from '../../../components/common/Icon';
import { Trans } from 'react-i18next'; // Import Trans component
import { scriptLines_dashboard as sl } from '../utils/script_lines';

const ActionItem = ({ to, icon, iconClass = 'text-primary-500 dark:text-primary-400', children }) => (
    <Link
        to={to}
        className="flex items-center p-3 -mx-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
        <div className="flex-shrink-0">
            <Icon name={icon} className={`h-6 w-6 ${iconClass}`} />
        </div>
        <div className="ml-4 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {children}
        </div>
    </Link>
);

const ActionItemsCard = () => {
    // This hook will suspend while fetching, handled by <Suspense> in OverviewPage
    const data = useActionItems();

    const hasPendingOrders = data.pending_orders?.count > 0;
    const hasManagerAttentionItems = data.manager_attention?.length > 0;
    const hasLowStockAlerts = data.low_stock_alerts?.length > 0;
    const noActionItems = !hasPendingOrders && !hasManagerAttentionItems && !hasLowStockAlerts;

    return (
        <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 flex flex-col">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-4">
                {sl.actionItemsCard.title || 'Mission Briefing'}
            </h2>
            <div className="flex-grow space-y-3">
                {noActionItems && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 dark:text-neutral-400">
                        <Icon name="task_alt" className="h-12 w-12 text-green-500 dark:text-green-400 mb-2" />
                        <p className="font-semibold">{sl.actionItemsCard.noItemsTitle || 'All Systems Clear'}</p>
                        <p className="text-xs mt-1">{sl.actionItemsCard.noItemsSubtitle || 'No pending actions requiring your attention.'}</p>
                    </div>
                )}

                {hasPendingOrders && (
                    <ActionItem
                        to="/dashboard/business/orders"
                        icon="notifications_active"
                        iconClass="text-amber-500 dark:text-amber-400 animate-pulse"
                    >
                        <Trans
                            i18nKey={sl.actionItemsCard.confirmNewOrders}
                            count={data.pending_orders.count}
                            components={{ 1: <strong className="text-neutral-900 dark:text-neutral-100" /> }}
                            defaults="Confirm <1>{{count}} new order</1>"
                        />
                    </ActionItem>
                )}

                {hasManagerAttentionItems && data.manager_attention.map(item => (
                    // NOTE: This should eventually link to a specific order detail page
                    <ActionItem
                        key={item.id}
                        to={`/dashboard/business/orders`}
                        icon="report_problem"
                        iconClass="text-red-500 dark:text-red-400"
                    >
                        <Trans
                            i18nKey={sl.actionItemsCard.attentionNeeded}
                            values={{ display: item.display }}
                            components={{ 1: <strong className="text-neutral-900 dark:text-neutral-100" /> }}
                            defaults="Attention needed for <1>{{display}}</1>"
                        />
                    </ActionItem>
                ))}

                {hasLowStockAlerts && data.low_stock_alerts.map(item => (
                    <ActionItem
                        key={item.id}
                        to="/dashboard/business/inventory"
                        icon="inventory_2"
                        iconClass="text-sky-500 dark:text-sky-400"
                    >
                        <Trans
                            i18nKey={sl.actionItemsCard.lowOnStock}
                            values={{ name: item.name, current_stock: item.current_stock, unit: item.unit }}
                            components={{ 1: <span className="text-neutral-900 dark:text-neutral-100 font-semibold" /> }}
                            defaults="<1>{{name}}</1> is low on stock ({{current_stock}} {{unit}})"
                        />
                    </ActionItem>
                ))}
            </div>
        </div>
    );
};

export default ActionItemsCard;