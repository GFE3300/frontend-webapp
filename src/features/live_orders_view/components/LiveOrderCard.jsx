import React, { useState, useMemo } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
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
 *  onUpdateStatus: (payload: { orderId: string; status?: string; payment_status?: string }) => void,
 *  isUpdating: boolean
 * }} props
 */
const LiveOrderCard = ({ order, onUpdateStatus, isUpdating }) => {
    const { currency } = useBusinessCurrency();
    const [isExpanded, setIsExpanded] = useState(false);

    const style = orderStatusStyles[order.status] || orderStatusStyles.DEFAULT;
    const statusText = scriptLines_liveOrders.orderStatus[order.status] || order.status;

    // --- NEW: Calculate "time ago" using date-fns ---
    const timeAgo = useMemo(() => {
        try {
            const relevantDate = order.last_updated_timestamp || order.order_timestamp;
            return formatDistanceToNow(parseISO(relevantDate), { addSuffix: true });
        } catch (error) {
            console.error("Error formatting date for order card:", error);
            return "a while ago";
        }
    }, [order.order_timestamp, order.last_updated_timestamp]);

    // --- REFINED: renderActions with bug fix and new "Mark as Paid" button ---
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
                    // FIX: Pass a single payload object
                    <Button key="confirm" {...commonProps} variant="primary" onClick={() => onUpdateStatus({ orderId: order.id, status: 'CONFIRMED' })}>
                        {scriptLines_liveOrders.actions.confirm}
                    </Button>,
                    // FIX: Pass a single payload object
                    <Button key="cancel" {...commonProps} variant="danger_outline" onClick={() => onUpdateStatus({ orderId: order.id, status: 'CANCELLED_BY_BUSINESS' })}>
                        {scriptLines_liveOrders.actions.cancel}
                    </Button>
                );
                break;
            case 'CONFIRMED':
            case 'PREPARING':
                buttons.push(
                    // FIX: Pass a single payload object
                    <Button key="serve" {...commonProps} variant="primary" onClick={() => onUpdateStatus({ orderId: order.id, status: 'SERVED' })}>
                        {scriptLines_liveOrders.actions.markServed}
                    </Button>
                );
                break;
            // NEW: "Served-to-Paid" workflow implementation
            case 'SERVED':
                buttons.push(
                    <Button key="paid" {...commonProps} variant="primary" onClick={() => onUpdateStatus({ orderId: order.id, payment_status: 'PAID' })}>
                        <Icon name="credit_card" style={{ fontSize: '1.25rem' }} className="mr-2" />
                        {scriptLines_liveOrders.actions.markPaid}
                    </Button>
                );
                break;
            default:
                return <p className="text-sm italic text-gray-500">{scriptLines_liveOrders.orderCard.noActions}</p>;
        }
        return <div className="flex w-full items-center space-x-2">{buttons}</div>;
    };

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
        <div className="p-4 overflow-hidden rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 font-inter">
            {/* --- Header Section --- */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {scriptLines_liveOrders.orderCard.idLabel}
                        <span className="ml-1 font-mono">{order.id.substring(0, 8)}...</span>
                    </p>
                    {/* TYPOGRAPHY: Apply font-montserrat to key stat */}
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white font-montserrat">
                        {formatCurrency(order.total_amount_payable, currency)}
                    </p>
                </div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style.bgColor} ${style.textColor}`}>
                    {/* ICON: Sizing mandate */}
                    <Icon name={style.icon} style={{ fontSize: '1rem' }} className="mr-1.5" />
                    {statusText}
                </div>
            </div>

            {/* --- NEW: Sub-header with "time ago" and expand button --- */}
            <div className="flex items-center justify-between mt-4">
                <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    {/* ICON: Sizing mandate */}
                    <Icon name="update" style={{ fontSize: '0.875rem' }} className="mr-1" />
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
                    {/* ICON: Sizing mandate */}
                    <Icon name={isExpanded ? "expand_less" : "expand_more"} style={{ fontSize: '1.25rem' }} className="ml-1" />
                </Button>
            </div>

            {/* --- NEW: Animated expandable details section --- */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">{scriptLines_liveOrders.orderCard.itemsHeader}</h4>
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
                                <h5 className="text-xs font-bold text-gray-600 dark:text-gray-400">{scriptLines_liveOrders.orderCard.notesHeader}:</h5>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap dark:text-gray-300">{order.notes}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Action Footer --- */}
            <div className="flex items-center justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                {renderActions()}
            </div>
        </div>
    );
};

export default LiveOrderCard;