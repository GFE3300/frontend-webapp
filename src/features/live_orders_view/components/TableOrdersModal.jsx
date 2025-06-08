import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';
import { scriptLines_liveOrders } from '../utils/script_lines';
import i18n from '../../../i18n';
import LiveOrderCard from './LiveOrderCard';

/**
 * A modal to display all orders associated with a selected table, with smooth animations.
 *
 * @param {{
 *   tableData: object | null,
 *   onClose: () => void,
 *   onUpdateOrderStatus: (payload: { orderId: string; status?: string; payment_status?: string }) => void,
 *   isUpdating: boolean
 * }} props
 */
const TableOrdersModal = ({ tableData, onClose, onUpdateOrderStatus, isUpdating }) => {
    return (
        <AnimatePresence>
            {tableData && (
                // --- REFINED: Added backdrop-blur-sm for a more polished look ---
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                    aria-modal="true"
                    role="dialog"
                >
                    {/* --- REFINED: Implemented fade-in and slide-up animation --- */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 flex flex-col max-h-[90vh] font-inter"
                        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
                    >
                        <header className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div>
                                {/* TYPOGRAPHY: font-montserrat for the main title */}
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-montserrat">
                                    {i18n.t(scriptLines_liveOrders.modal.title, { tableNumber: tableData.table_number })}
                                </h2>
                                <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center">
                                        {/* ICON: Sizing mandate */}
                                        <Icon name="group" style={{ fontSize: '1.25rem' }} className="mr-1.5" />
                                        {i18n.t(scriptLines_liveOrders.guestsSummary, { count: tableData.total_guests })}
                                    </span>
                                    <span className="flex items-center">
                                        {/* ICON: Sizing mandate */}
                                        <Icon name="receipt_long" style={{ fontSize: '1.25rem' }} className="mr-1.5" />
                                        {i18n.t(scriptLines_liveOrders.ordersSummary, { count: tableData.orders.length })}
                                    </span>
                                </div>
                            </div>
                            <Button onClick={onClose} variant="ghost" className="!p-2" aria-label="Close modal">
                                {/* ICON: Sizing mandate */}
                                <Icon name="close" style={{ fontSize: '1.5rem' }} />
                            </Button>
                        </header>

                        <main className="flex-1 p-4 overflow-y-auto sm:p-6 bg-gray-50 dark:bg-gray-800/50">
                            <div className="space-y-4">
                                {tableData.orders && tableData.orders.length > 0 ? (
                                    tableData.orders.map(order => (
                                        <LiveOrderCard
                                            key={order.id}
                                            order={order}
                                            onUpdateStatus={onUpdateOrderStatus}
                                            isUpdating={isUpdating}
                                        />
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                        {/* ICON: Sizing mandate */}
                                        <Icon name="inbox" style={{ fontSize: '4rem' }} className="mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">{i18n.t(scriptLines_liveOrders.modal.noOrdersFound)}</p>
                                    </div>
                                )}
                            </div>
                        </main>

                        <footer className="flex justify-end p-4 bg-white border-t border-gray-200 dark:bg-gray-800 flex-shrink-0">
                            <Button onClick={onClose} variant="secondary">
                                {i18n.t(scriptLines_liveOrders.modal.closeButton)}
                            </Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TableOrdersModal;