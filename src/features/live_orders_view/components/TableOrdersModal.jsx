import React from 'react';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';
import { scriptLines_liveOrders } from '../utils/script_lines';
import LiveOrderCard from './LiveOrderCard';
import { t } from '../../../i18n';
// import LiveOrderCard from './LiveOrderCard'; // We will create this in the next step

/**
 * A modal to display all orders associated with a selected table.
 *
 * @param {{
 *   tableData: object,
 *   onClose: () => void,
 *   onUpdateOrderStatus: (orderId: string, newStatus: string) => void // Will be used later
 * }} props
 */
const TableOrdersModal = ({ tableData, onClose, onUpdateOrderStatus, isUpdating }) => {
    if (!tableData) {
        return null;
    }

    const { table_number, total_guests, orders } = tableData;

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            {/* Modal Content */}
            <div
                className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 flex flex-col max-h-[90vh] transition-transform duration-300 transform scale-95"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
                // Simple entry animation
                style={{ transform: 'scale(1)', opacity: 1 }}
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t(scriptLines_liveOrders.modalTitle, { tableNumber: table_number })}
                        </h2>
                        <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                                <Icon name="group" className="w-5 h-5 mr-1.5" />
                                {total_guests} {scriptLines_liveOrders.guestsLabel}
                            </span>
                            <span className="flex items-center">
                                <Icon name="receipt_long" className="w-5 h-5 mr-1.5" />
                                {orders.length} {scriptLines_liveOrders.ordersLabel}
                            </span>
                        </div>
                    </div>
                    <Button onClick={onClose} variant="ghost" className="!p-2" aria-label="Close modal">
                        <Icon name="close" className="w-6 h-6" />
                    </Button>
                </header>

                {/* Body */}
                <main className="flex-1 p-4 overflow-y-auto">
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
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Icon name="inbox" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>{scriptLines_liveOrders.noOrdersFound}</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <Button onClick={onClose} variant="secondary">
                        {scriptLines_liveOrders.closeButton}
                    </Button>
                </footer>
            </div>
        </div>
    );
};

export default TableOrdersModal;