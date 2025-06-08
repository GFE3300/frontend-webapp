// src/features/kitchen_display_system/services/kitchenOrderService.js
import apiService from '../../../services/api'; // Assuming a global apiService

const KITCHEN_ORDERS_ENDPOINT = '/api/kitchen/orders'; // Example endpoint

const fetchActiveOrders = async () => {
    try {
        const response = await apiService.get(KITCHEN_ORDERS_ENDPOINT, { params: { status: 'active' } }); // 'active' could mean new, preparing, ready
        return response.data; // Assuming backend returns an array of order objects
    } catch (error) {
        console.error("Error fetching active kitchen orders:", error);
        throw error; // Re-throw to be handled by the hook
    }
};

const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const response = await apiService.patch(`${KITCHEN_ORDERS_ENDPOINT}/${orderId}/status`, { status: newStatus });
        return response.data; // Assuming backend returns the updated order or success message
    } catch (error) {
        console.error(`Error updating order ${orderId} to status ${newStatus}:`, error);
        throw error;
    }
};

export default {
    fetchActiveOrders,
    updateOrderStatus,
};