// src/features/kitchen_display_system/services/kitchenOrderService.js
import apiService from '../../../services/api';

const KITCHEN_ORDERS_ENDPOINT = 'orders/kitchen-view/';

const fetchActiveOrders = async (filters) => {
    try {
        const response = await apiService.get(KITCHEN_ORDERS_ENDPOINT, { params: filters });
        return response.data;
    } catch (error) {
        console.error("Error fetching active kitchen orders:", error);
        throw error;
    }
};

/**
 * MODIFIED: Updates the status of a specific order using a payload object.
 * @param {string} orderId - The UUID of the order.
 * @param {object} payload - The data to patch, e.g., { status: 'PREPARING' }.
 * @returns {Promise<object>} A promise that resolves to the updated order object.
 */
const updateOrderStatus = async (orderId, payload) => {
    try {
        // The backend endpoint for updates is on the main orders API.
        const response = await apiService.patch(`orders/${orderId}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating order ${orderId} with payload ${JSON.stringify(payload)}:`, error);
        throw error;
    }
};

export default {
    fetchActiveOrders,
    updateOrderStatus,
};