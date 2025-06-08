import React from 'react';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';
import { scriptLines_liveOrders, t } from '../utils/script_lines';
import LiveOrderCard from './LiveOrderCard'; // This will be created in the next step.

/**
 * A modal to display all orders associated with a selected table.
 *
 * @param {{
 *   tableData: object,
 *   onClose: () => void,
 *   onUpdateOrderStatus: (orderId: string, newStatus: string) => void,
 *   isUpdating: boolean
 * }} props
 */
const TableOrdersModal = ({ tableData, onClose, onUpdateOrderStatus, isUpdating }) => {
    if (!tableData) {
        return null;
    }

    const { table_number, total_guests, orders } = tableData;
    const guestsText = t(scriptLines_liveOrders.guestsSummary, { count: total_guests });
    const ordersText = t(scriptLines_liveOrders.ordersSummary, { count: orders.length });

    return (
        // Backdrop with a subtle blur effect
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            {/* Modal Content */}
            <div
                className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t(scriptLines_liveOrders.modal.title, { tableNumber: table_number })}
                        </h2>
                        <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                                <Icon name="group" className="w-5 h-5 mr-1.5" />
                                {guestsText}
                            </span>
                            <span className="flex items-center">
                                <Icon name="receipt_long" className="w-5 h-5 mr-1.5" />
                                {ordersText}
                            </span>
                        </div>
                    </div>
                    <Button onClick={onClose} variant="ghost" className="!p-2" aria-label="Close modal">
                        <Icon name="close" className="w-6 h-6" />
                    </Button>
                </header>

                {/* Body */}
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
                    <div className="space-y-4">
                        {orders && orders.length > 0 ? (
                            orders.map(order => (
                                <LiveOrderCard
                                    key={order.id}
                                    order={order}
                                    onUpdateStatus={onUpdateOrderStatus}
                                    isUpdating={isUpdating}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <Icon name="inbox" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">{scriptLines_liveOrders.modal.noOrdersFound}</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <Button onClick={onClose} variant="secondary">
                        {scriptLines_liveOrders.modal.closeButton}
                    </Button>
                </footer>
            </div>
        </div>
    );
};

export default TableOrdersModal;