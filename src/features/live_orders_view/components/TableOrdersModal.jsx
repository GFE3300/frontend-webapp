import React from 'react';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';
import { scriptLines_liveOrders, t } from '../utils/script_lines';
import LiveOrderCard from './LiveOrderCard';

/**
 * A modal to display all orders associated with a selected table.
 * It's designed to be clean, informative, and provide a clear hierarchy of information.
 *
 * @param {{
 *   tableData: object,
 *   onClose: () => void,
 *   onUpdateOrderStatus: (payload: { orderId: string; status?: string; payment_status?: string }) => void,
 *   isUpdating: boolean
 * }} props
 */
const TableOrdersModal = ({ tableData, onClose, onUpdateOrderStatus, isUpdating }) => {
    // This check is crucial. If tableData is null (e.g., when the modal is closed),
    // the component should render nothing to avoid errors.
    if (!tableData) {
        return null;
    }

    const { table_number, total_guests, orders } = tableData;

    // Use our i18n t function for pluralization
    const guestsText = t(scriptLines_liveOrders.guestsSummary, { count: total_guests });
    const ordersText = t(scriptLines_liveOrders.ordersSummary, { count: orders.length });

    return (
        // Backdrop: covers the screen with a semi-transparent, blurred background.
        // Clicking the backdrop calls the onClose handler.
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            {/* Modal Content: Uses stopPropagation to prevent clicks inside from closing the modal. */}
            <div
                className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 flex flex-col max-h-[90vh] animate-slide-up-fast font-inter"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Sticky header with title, summary stats, and a close button. */}
                <header className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white">
                            {t(scriptLines_liveOrders.modal.title, { tableNumber: table_number })}
                        </h2>
                        <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                                <Icon name="group" style={{ fontSize: '1.25rem' }} className="mr-1.5" />
                                {guestsText}
                            </span>
                            <span className="flex items-center">
                                <Icon name="receipt_long" style={{ fontSize: '1.25rem' }} className="mr-1.5" />
                                {ordersText}
                            </span>
                        </div>
                    </div>
                    <Button onClick={onClose} variant="ghost" className="!p-2" aria-label="Close modal">
                        <Icon name="close" style={{ fontSize: '1.5rem' }} />
                    </Button>
                </header>

                {/* Body: Scrollable area for the list of order cards. */}
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
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
                            // Empty state if a table is active but has no orders (e.g., waiting to order).
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <Icon name="inbox" style={{ fontSize: '4rem' }} className="mx-auto mb-4 opacity-50" />
                                <p className="text-lg">{t(scriptLines_liveOrders.modal.noOrdersFound)}</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer: A clean, sticky footer with a primary action button. */}
                <footer className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                    <Button onClick={onClose} variant="secondary">
                        {t(scriptLines_liveOrders.modal.closeButton)}
                    </Button>
                </footer>
            </div>
        </div>
    );
};

export default TableOrdersModal;