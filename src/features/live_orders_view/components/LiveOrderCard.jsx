import React, { useState, useMemo } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns'; // A robust library for relative time calculation.
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import { scriptLines_liveOrders } from '../utils/script_lines';
import { useBusinessCurrency } from '../../../hooks/useCurrency';
import { formatCurrency } from '../../../utils/formatCurrency';

// Configuration for status-specific styling to visually represent the order's state.
const orderStatusStyles = {
    PENDING_CONFIRMATION: {
        bgColor: 'bg-yellow-100 dark:bg-yellow-800/50',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        icon: 'hourglass_top',
    },
    CONFIRMED: {
        bgColor: 'bg-blue-100 dark:bg-blue-800/50',
        textColor: 'text-blue-800 dark:text-blue-200',
        icon: 'thumb_up',
    },
    PREPARING: {
        bgColor: 'bg-indigo-100 dark:bg-indigo-800/50',
        textColor: 'text-indigo-800 dark:text-indigo-200',
        icon: 'skillet',
    },
    SERVED: {
        bgColor: 'bg-green-100 dark:bg-green-800/50',
        textColor: 'text-green-800 dark:text-green-200',
        icon: 'check_circle',
    },
    CANCELLED_BY_BUSINESS: {
        bgColor: 'bg-red-100 dark:bg-red-800/50',
        textColor: 'text-red-800 dark:text-red-200',
        icon: 'cancel',
    },
    DEFAULT: {
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        textColor: 'text-gray-800 dark:text-gray-200',
        icon: 'receipt_long',
    },
};

/**
 * Renders an interactive card for a single live order, featuring expandable details
 * and contextual action buttons based on its current status.
 *
 * @param {{
 *  order: object,
 *  onUpdateStatus: (orderId: string, newStatus: string) => void,
 *  isUpdating: boolean
 * }} props
 */
const LiveOrderCard = ({ order, onUpdateStatus, isUpdating }) => {
    const { currency } = useBusinessCurrency();
    const [isExpanded, setIsExpanded] = useState(false);

    const style = orderStatusStyles[order.status] || orderStatusStyles.DEFAULT;
    const statusText = scriptLines_liveOrders.orderStatus[order.status] || order.status;

    // Memoize the relative time calculation to prevent re-computing on every render.
    const timeAgo = useMemo(() => {
        try {
            // Use last_updated_timestamp for a more accurate "time since last action" feel.
            const relevantDate = order.last_updated_timestamp || order.order_timestamp;
            return formatDistanceToNow(parseISO(relevantDate), { addSuffix: true });
        } catch (error) {
            console.error("Error formatting date for order card:", error);
            return "a while ago";
        }
    }, [order.order_timestamp, order.last_updated_timestamp]);

    // Determines which action buttons to display based on the order's status.
    const renderActions = () => {
        const buttons = [];
        const commonProps = {
            size: 'sm',
            disabled: isUpdating,
            className: 'flex-grow justify-center'
        };

        switch (order.status) {
            case 'PENDING_CONFIRMATION':
                buttons.push(
                    <Button key="confirm" {...commonProps} variant="primary" onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}>
                        {scriptLines_liveOrders.actions.confirm}
                    </Button>,
                    <Button key="cancel" {...commonProps} variant="danger_outline" onClick={() => onUpdateStatus(order.id, 'CANCELLED_BY_BUSINESS')}>
                        {scriptLines_liveOrders.actions.cancel}
                    </Button>
                );
                break;
            case 'CONFIRMED':
            case 'PREPARING': // Staff can mark as served from either of these states
                buttons.push(
                    <Button key="serve" {...commonProps} variant="primary" onClick={() => onUpdateStatus(order.id, 'SERVED')}>
                        {scriptLines_liveOrders.actions.markServed}
                    </Button>
                );
                break;
            default:
                // Final states like SERVED or CANCELED have no further actions.
                return <p className="text-sm text-gray-500 italic">No actions available.</p>;
        }
        return <div className="flex w-full items-center space-x-2">{buttons}</div>;
    };

    // Renders a formatted list of selected options for an order item.
    const renderOrderItemOptions = (options) => {
        if (!options || options.length === 0) return null;
        return (
            <ul className="pl-5 text-xs text-gray-500 dark:text-gray-400">
                {options.map(opt => (
                    <li key={opt.option_id}>- {opt.group_name}: {opt.option_name}</li>
                ))}
            </ul>
        );
    }

    return (
        <div className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
            {/* --- Main Info Row --- */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {scriptLines_liveOrders.orderCard.idLabel}
                        <span className="font-mono ml-1">{order.id.substring(0, 8)}...</span>
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(order.total_amount_payable, currency)}
                    </p>
                </div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style.bgColor} ${style.textColor}`}>
                    <Icon name={style.icon} className="w-4 h-4 mr-1.5" />
                    {statusText}
                </div>
            </div>

            {/* --- Time & Expand Button --- */}
            <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    <Icon name="update" className="w-3 h-3 mr-1 inline-block" />
                    {timeAgo}
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                    title={isExpanded ? scriptLines_liveOrders.orderCard.collapseTooltip : scriptLines_liveOrders.orderCard.expandTooltip}
                >
                    {isExpanded ? "Hide" : "Show"} Details
                    <Icon name={isExpanded ? "expand_less" : "expand_more"} className="w-5 h-5 ml-1" />
                </Button>
            </div>

            {/* --- Expandable Details Section --- */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{scriptLines_liveOrders.orderCard.itemsHeader}</h4>
                    <ul className="space-y-2">
                        {order.items.map(item => (
                            <li key={item.id}>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.quantity} x {item.product_name_snapshot}
                                </div>
                                {renderOrderItemOptions(item.selected_options_snapshot)}
                            </li>
                        ))}
                    </ul>
                    {order.notes && (
                        <div className="mt-3">
                            <h5 className="text-xs font-bold text-gray-600 dark:text-gray-400">Notes:</h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{order.notes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* --- Actions Section --- */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
                {renderActions()}
            </div>
        </div>
    );
};

export default LiveOrderCard;