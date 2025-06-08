import { useState, useEffect, useCallback } from 'react';
import kitchenOrderService from '../services/kitchenOrderService';
import { OrderStatus } from '../constants/kitchenConstants'; // Import OrderStatus

// Sample initial data - replace with API calls
const initialSampleOrders = [
    {
        id: 'order_1', tableNumber: '3', status: OrderStatus.NEW,
        items: [{ id: 'item_a', name: 'Margherita Pizza', quantity: 1, notes: 'Extra basil' }, { id: 'item_b', name: 'Coke', quantity: 2 }],
        orderTime: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
        id: 'order_2', tableNumber: '7A', status: OrderStatus.PREPARING,
        items: [{ id: 'item_c', name: 'Pasta Carbonara', quantity: 1 }, { id: 'item_d', name: 'Red Wine', quantity: 1, notes: 'Glass' }],
        orderTime: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
        id: 'order_3', tableNumber: 'Bar 1', status: OrderStatus.READY,
        items: [{ id: 'item_e', name: 'Espresso', quantity: 2 }],
        orderTime: new Date(Date.now() - 2 * 60000).toISOString()
    },
    { // Example of a served order
        id: 'order_4', tableNumber: '5', status: OrderStatus.SERVED,
        items: [{id: 'item_f', name: 'Cheesecake', quantity: 1}],
        orderTime: new Date(Date.now() - 10 * 60000).toISOString()
    },
    { // Example of a paid order, waiting for completion
        id: 'order_6', tableNumber: 'Patio 2', status: OrderStatus.PAID,
        items: [{id: 'item_h', name: 'Latte', quantity: 2}],
        orderTime: new Date(Date.now() - 25 * 60000).toISOString()
    },
    { // Another order for table 3
        id: 'order_5', tableNumber: '3', status: OrderStatus.NEW,
        items: [{ id: 'item_g', name: 'Water Bottle', quantity: 1 }],
        orderTime: new Date(Date.now() - 1 * 60000).toISOString()
    },
];


const useKitchenOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // const fetchedOrders = await kitchenOrderService.fetchActiveOrders();
            // setOrders(fetchedOrders);
            
            setTimeout(() => {
                // Filter out COMPLETED orders for the active KDS display
                setOrders(initialSampleOrders.filter(o => o.status !== OrderStatus.COMPLETED));
                setIsLoading(false);
            }, 1000);

        } catch (err) {
            console.error("Error fetching kitchen orders:", err);
            setError(err.message || 'Failed to fetch orders');
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateOrderStatus = useCallback(async (orderId, newStatus) => {
        try {
            // await kitchenOrderService.updateOrderStatus(orderId, newStatus);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
                // If the new status is 'completed', filter it out from the active display immediately
                .filter(order => newStatus === OrderStatus.COMPLETED ? order.id !== orderId : true)
            );
            return true;
        } catch (err) {
            console.error("Error updating order status:", err);
            return false;
        }
    }, []);
    
    const addOrder = useCallback((newOrder) => {
        setOrders(prevOrders => [newOrder, ...prevOrders].filter(o => o.status !== OrderStatus.COMPLETED));
    }, []);


    return { orders, isLoading, error, updateOrderStatus, addOrder, fetchOrders };
};

export default useKitchenOrders;