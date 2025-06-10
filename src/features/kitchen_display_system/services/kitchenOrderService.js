import apiService from '../../../services/api';

const KITCHEN_ORDERS_ENDPOINT = 'orders/kitchen-view/';

/**
 * Fetches active orders for the Kitchen Display System.
 * @param {object} filters - An object containing query parameters, e.g., { status: 'new,preparing' }.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of order objects.
 */
const fetchActiveOrders = async (filters) => {
    try {
        // apiService.get prepends the base URL, so we just need the relative path.
        const response = await apiService.get(KITCHEN_ORDERS_ENDPOINT, { params: filters });
        // Assuming the backend returns the array of orders directly in the response data.
        return response.data;
    } catch (error) {
        console.error("Error fetching active kitchen orders:", error);
        throw error; // Re-throw to be handled by the useQuery hook.
    }
};

/**
 * Updates the status of a specific order.
 * @param {string} orderId - The UUID of the order.
 * @param {string} newStatus - The new status to set for the order.
 * @returns {Promise<object>} A promise that resolves to the updated order object.
 */
const updateOrderStatus = async (orderId, newStatus) => {
    try {
        // Note: The backend endpoint for updates is on the main orders API.
        const response = await apiService.patch(`orders/${orderId}/`, { status: newStatus });
        return response.data;
    } catch (error) {
        console.error(`Error updating order ${orderId} to status ${newStatus}:`, error);
        throw error;
    }
};

export default {
    fetchActiveOrders,
    updateOrderStatus,
};