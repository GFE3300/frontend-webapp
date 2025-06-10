// src/features/kitchen_display_system/components/OrderDetailModal.jsx
import React from 'react';
import Modal from '../../../components/animated_alerts/Modal';
import OrderItemList from './OrderItemList';
import OrderStatusBadge from './OrderStatusBadge';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { scriptLines_kitchenDisplaySystem } from '../utils/script_lines';
import i18n from '../../../i18n';

const sl = scriptLines_kitchenDisplaySystem.orderCard;
const slPage = scriptLines_kitchenDisplaySystem.page;
const slModal = scriptLines_kitchenDisplaySystem.modal;

const OrderDetailModal = ({ order, onClose, onUpdateStatus }) => {
    if (!order) return null;

    const timeAgo = order.order_timestamp ? formatDistanceToNowStrict(parseISO(order.order_timestamp)) : (sl.timeAgoNA || 'N/A');

    const getNextStatusAndAction = () => {
        switch (order.status) {
            case 'PENDING_CONFIRMATION': return { nextStatus: 'CONFIRMED', actionText: sl.actionConfirm };
            case 'CONFIRMED': return { nextStatus: 'PREPARING', actionText: sl.actionStartPreparing };
            case 'PREPARING': return { nextStatus: 'READY_FOR_PICKUP', actionText: sl.actionMarkAsReady };
            case 'READY_FOR_PICKUP': return { nextStatus: 'SERVED', actionText: sl.actionMarkServed };
            default: return { nextStatus: null, actionText: "" };
        }
    };

    const { nextStatus, actionText } = getNextStatusAndAction();

    const orderIdentifier = order.table_number
        ? i18n.t(slPage.tableLabel, { tableNumber: order.table_number })
        : (order.pickup_code ? i18n.t(sl.pickupIdentifier, { pickupCode: order.pickup_code }) : (sl.defaultIdentifier || 'Order'));

    return (
        <Modal isOpen={!!order} onClose={onClose} size="lg">
            <div className="p-1">
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{i18n.t(slModal.title, { identifier: orderIdentifier })}</h3>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{i18n.t(sl.timeAgo, { time: timeAgo })}</p>
                </div>

                {/* Body */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {order.notes && (
                        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                            <h4 className="font-semibold text-sm text-yellow-800 dark:text-yellow-200 mb-1">{slModal.notes}</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">{order.notes}</p>
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-2">{slModal.items}</h4>
                        <OrderItemList items={order.items} isDetailed={true} />
                    </div>
                </div>

                {/* Footer */}

    
            </div>
        </Modal>
    );
};

export default OrderDetailModal;