import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Modal from '../../../../components/animated_alerts/Modal.jsx';
import Icon from '../../../../components/common/Icon.jsx'; // Adjusted path
import LayoutEditor from './LayoutEditor.jsx'; // Adjusted path

import TableCard from '../live_view/TableCard.jsx';
import OrderDetailsModalContent from '../live_view/OrderDetailsModalContent.jsx';
// import ViewedOrdersSidebar from './ViewedOrdersSidebar'; // If we create this later

import useLayoutData from '../../hooks/useLayoutData.js';
import { timeSince as timeSinceUtil, VENDOR_VIEW_GRID_TRACK_SIZE } from '../../utils/orderUtils.js';
// DEFAULT_LAYOUT_DESIGNER_ROWS/COLS from orderUtils are used by useLayoutData for initialization

const LiveOrderDashboard = () => {
    const [isDesigningLayout, setIsDesigningLayout] = useState(false);

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', type: 'info' });

    const openDashboardAlert = useCallback((title, message, type = 'info') => {
        setAlertModalContent({ title, message, type });
        setIsAlertModalOpen(true);
    }, []);
    const closeDashboardAlert = useCallback(() => setIsAlertModalOpen(false), []);

    const {
        layoutData,
        saveDesignedLayout,
        updateTableStatusAndOrder,
        clearTableOrder,
        placeSimulatedOrder,
        resetLayoutToDefaults,
        tables, // Derived from layoutData in the hook
        currentGridDimensions,
        kitchenArea,
        newOrdersCount, // Derived
        viewedOrders,   // Derived
    } = useLayoutData(openDashboardAlert); // Pass alert fn to the hook

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedTableForModal, setSelectedTableForModal] = useState(null);

    const [isChargeConfirmationOpen, setIsChargeConfirmationOpen] = useState(false);
    const [tableToClear, setTableToClear] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000); // Refresh time for display
        return () => clearInterval(timer);
    }, []);

    const handleTableClick = useCallback((table) => {
        if (table.order) {
            setSelectedTableForModal(table);
            setIsOrderModalOpen(true);
            if (table.status === 'new_order') {
                updateTableStatusAndOrder(table.id, 'viewed_order', table.order);
            }
        }
    }, [updateTableStatusAndOrder]);

    const handleTableRightClick = useCallback((table) => {
        setTableToClear(table);
        setIsChargeConfirmationOpen(true);
    }, []);

    const confirmAndClearOrder = useCallback(() => {
        if (tableToClear) {
            clearTableOrder(tableToClear.id);
        }
        setIsChargeConfirmationOpen(false);
        setTableToClear(null);
    }, [tableToClear, clearTableOrder]);

    const cancelClearOrder = useCallback(() => {
        setIsChargeConfirmationOpen(false);
        setTableToClear(null);
    }, []);

    const handleSimulateNewOrder = useCallback(() => {
        const success = placeSimulatedOrder();
        if (!success && layoutData.tables.length > 0) { // only show if tables exist but are full
            // The hook itself calls openDashboardAlert if no empty tables
        } else if (!success && layoutData.tables.length === 0) {
            openDashboardAlert('No Tables Defined', 'Please design the table layout first before simulating orders.', 'info');
        }
    }, [placeSimulatedOrder, layoutData.tables, openDashboardAlert]);

    const handleSaveDesignedLayout = useCallback((newLayoutDataFromDesigner) => {
        saveDesignedLayout(newLayoutDataFromDesigner);
        setIsDesigningLayout(false);
        // Alert is handled by the useLayoutData hook
    }, [saveDesignedLayout]);

    const numCols = currentGridDimensions.cols;
    let gridGapClass = 'gap-3';
    if (numCols <= 9) gridGapClass = 'gap-4';
    else if (numCols > 16 && numCols <= 25) gridGapClass = 'gap-2';
    else if (numCols > 25) gridGapClass = 'gap-1.5';

    if (isDesigningLayout) {
        return (
            <LayoutEditor
                currentLayout={{ // Pass as an object
                    designItems: tables, // The actual items from useLayoutData's 'tables' property
                    gridDimensions: currentGridDimensions, // The current grid dimensions
                    // kitchenArea could also be passed if LayoutEditor is expected to manage it
                }}
                onSaveLayout={handleSaveDesignedLayout}
                onCancel={() => setIsDesigningLayout(false)}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-tr from-indigo-50 via-white to-pink-50" // Applied to outermost container
        >
            <div className="flex h-screen overflow-hidden">
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 shrink-0">
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="text-3xl font-bold text-indigo-700">Bakery Orders</h1>
                            {viewedOrders.length > 0 && ( // Only show toggle if sidebar has content
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 rounded-md hover:bg-indigo-100 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                                >
                                    <Icon name={isSidebarOpen ? "last_page" : "first_page"} className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 text-center mb-1">Live Table Status (Refreshes {timeSinceUtil(currentTime)})</p>
                        <div className="flex justify-center items-center gap-4 mb-4 text-xs">
                            <span className={`px-2 py-1 rounded-full font-medium ${newOrdersCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                                New Orders: {newOrdersCount}
                            </span>
                            <span className={`px-2 py-1 rounded-full font-medium ${viewedOrders.length > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                                Active Viewed: {viewedOrders.length}
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-2">
                            <button onClick={() => setIsDesigningLayout(true)} className="px-5 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 shadow text-sm">Design Table Layout</button>
                            <button onClick={handleSimulateNewOrder} className="px-5 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow text-sm">Simulate New Order</button>
                        </div>
                    </div>

                    <div className="flex-1 p-4 pt-0 overflow-y-auto">
                        {tables.length > 0 ? (
                            <div
                                className={`grid ${gridGapClass} justify-center relative`}
                                style={{
                                    gridTemplateColumns: `repeat(${numCols}, minmax(0, ${VENDOR_VIEW_GRID_TRACK_SIZE}))`,
                                    maxWidth: '100%',
                                    margin: '0 auto',
                                    paddingBottom: '0.75rem'
                                }}
                            >
                                {kitchenArea && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                        style={{
                                            gridRowStart: kitchenArea.rowStart,
                                            gridColumnStart: kitchenArea.colStart,
                                            gridRowEnd: `span ${kitchenArea.rowEnd - kitchenArea.rowStart + 1}`,
                                            gridColumnEnd: `span ${kitchenArea.colEnd - kitchenArea.colStart + 1}`,
                                            zIndex: 1
                                        }}
                                        className="bg-slate-200 border-2 border-slate-400 rounded-md opacity-60 flex items-center justify-center pointer-events-none"
                                    >
                                        <span className="text-slate-600 font-semibold text-sm">Kitchen</span>
                                    </motion.div>
                                )}
                                <AnimatePresence>
                                    {tables.map(table => (
                                        <TableCard
                                            key={`${table.id}-${table.status}-${table.order?.id || 'noorder'}`} // More robust key
                                            tableData={table}
                                            onClick={handleTableClick}
                                            onRightClick={handleTableRightClick}
                                            gridCols={numCols}
                                            timeSince={timeSinceUtil}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 mt-8 p-6 bg-white rounded-lg shadow">
                                <p className="font-semibold text-lg mb-2">No tables defined yet.</p>
                                <p className="mb-4">Click "Design Table Layout" to get started.</p>
                                <Icon name="table_restaurant" className="w-16 h-16 text-gray-300 mx-auto" />
                            </div>
                        )}
                    </div>

                    <footer className="text-center p-4 text-gray-400 text-xs border-t border-gray-200 bg-gray-50 shrink-0">
                        Bakery Table Management System © {new Date().getFullYear()}
                    </footer>
                </main>

                <AnimatePresence>
                    {isSidebarOpen && viewedOrders.length > 0 && (
                        <motion.aside
                            className="w-72 lg:w-80 xl:w-96 bg-white shadow-lg flex flex-col h-full border-l border-gray-200"
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                        >
                            <div className="p-4 border-b border-gray-200 shrink-0">
                                <h2 className="text-xl font-semibold text-indigo-600">
                                    Viewed Orders ({viewedOrders.length})
                                </h2>
                            </div>
                            <ul className="space-y-3 overflow-y-auto flex-1 p-4">
                                <AnimatePresence>
                                    {viewedOrders.map(table => ( // table here is the full table object which includes order
                                        <motion.li
                                            key={`${table.order.id}-sidebar`}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                                            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                                            className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-base text-purple-700">Table {table.order.tableNumber}</p>
                                                    <p className="text-xs text-gray-500">ID: {table.order.id.substring(0, 15)}...</p>
                                                </div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${(new Date() - new Date(table.order.createdAt)) > 300000 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-800'
                                                    // 300000ms = 5 minutes
                                                    }`}>{(new Date() - new Date(table.order.createdAt)) > 300000 ? 'Delayed' : 'Active'}</span>
                                            </div>
                                            <p className="text-xs mt-1.5 text-gray-600">
                                                <strong>Items:</strong> {table.order.items.map(item => `${item.name} (x${item.qty})`).join(', ')}
                                            </p>
                                            <p className="text-xs text-gray-600"><strong>People:</strong> {table.order.people}</p>
                                            <p className="text-sm font-medium text-gray-700 mt-1">
                                                <strong>Total:</strong> ${table.order.totalPrice.toFixed(2)}
                                            </p>
                                            <p className={`text-[10px] text-gray-500 mt-1 text-right ${(new Date() - new Date(table.order.createdAt)) > 600000 ? 'font-semibold text-amber-600' : ''}`}>
                                                {timeSinceUtil(table.order.createdAt)}
                                            </p>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                title={`Order Details: Table ${selectedTableForModal?.order?.tableNumber || ''}`}
                type="info"
            >
                <OrderDetailsModalContent order={selectedTableForModal?.order} timeSince={timeSinceUtil} />
            </Modal>

            <Modal
                isOpen={isChargeConfirmationOpen}
                onClose={cancelClearOrder}
                title="Confirm Charge & Clear Table"
                type="warning"
                onConfirm={confirmAndClearOrder}
                confirmText="Yes, Charged & Clear"
                cancelText="No, Not Yet"
            >
                <p>Have you charged the client and are ready to clear Table {tableToClear?.number}?</p>
            </Modal>

            <Modal
                isOpen={isAlertModalOpen}
                onClose={closeDashboardAlert}
                title={alertModalContent.title}
                type={alertModalContent.type}
            >
                <p className="text-sm">{alertModalContent.message}</p>
            </Modal>
        </motion.div>
    );
};

export default LiveOrderDashboard;