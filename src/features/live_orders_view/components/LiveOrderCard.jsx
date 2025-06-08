import React from 'react';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import { scriptLines_liveOrders } from '../utils/script_lines';
import { useBusinessCurrency } from '../../../hooks/useCurrency';
import { formatCurrency } from '../../../utils/formatCurrency';

// Configuration for status-specific styling
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
    SERVED: {
        bgColor: 'bg-green-100 dark:bg-green-800/50',
        textColor: 'text-green-800 dark:text-green-200',
        icon: 'check_circle',
    },
    CANCELED: {
        bgColor: 'bg-red-100 dark:bg-red-800/50',
        textColor: 'text-red-800 dark:text-red-200',
        icon: 'cancel',
    },
    // Adding other statuses for completeness, even if they don't have actions
    PREPARING: {
        bgColor: 'bg-indigo-100 dark:bg-indigo-800/50',
        textColor: 'text-indigo-800 dark:text-indigo-200',
        icon: 'skillet',
    },
    READY_FOR_PICKUP: {
        bgColor: 'bg-teal-100 dark:bg-teal-800/50',
        textColor: 'text-teal-800 dark:text-teal-200',
        icon: 'local_mall',
    },
    DEFAULT: {
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        textColor: 'text-gray-800 dark:text-gray-200',
        icon: 'receipt_long',
    },
};

/**
 * Renders a card displaying the details of a single live order and its actions.
 * @param {{
 *  order: {id: string, status: string, total_amount_payable: string},
 *  onUpdateStatus: (orderId: string, newStatus: string) => void,
 *  isUpdating: boolean
 * }} props
 */
const LiveOrderCard = ({ order, onUpdateStatus, isUpdating }) => {
    const { currency } = useBusinessCurrency();
    const style = orderStatusStyles[order.status] || orderStatusStyles.DEFAULT;
    const statusText = scriptLines_liveOrders.orderStatus[order.status] || order.status;

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
                buttons.push(
                    <Button key="serve" {...commonProps} variant="primary" onClick={() => onUpdateStatus(order.id, 'SERVED')}>
                        {scriptLines_liveOrders.actions.markServed}
                    </Button>,
                    <Button key="cancel" {...commonProps} variant="danger_outline" onClick={() => onUpdateStatus(order.id, 'CANCELLED_BY_BUSINESS')}>
                        {scriptLines_liveOrders.actions.cancel}
                    </Button>
                );
                break;
            default:
                return null; // No actions for SERVED, CANCELED, etc. statuses.
        }
        return <div className="flex items-center space-x-2">{buttons}</div>;
    };


    return (
        <div className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
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
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
                {renderActions()}
            </div>
        </div>
    );
};

export default LiveOrderCard;