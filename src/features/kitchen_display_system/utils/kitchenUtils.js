// src/features/kitchen_display_system/utils/kitchenUtils.js

/**
 * Example utility function for the kitchen display.
 * This could be used to calculate estimated completion times, format data, etc.
 */
export const calculateRemainingPrepTime = (order) => {
    if (!order || !order.orderTime || typeof order.estimatedPrepTime !== 'number') {
        return null;
    }
    const orderPlacedAt = new Date(order.orderTime);
    const estimatedEndTime = new Date(orderPlacedAt.getTime() + order.estimatedPrepTime * 60000); // prep time in minutes
    const now = new Date();

    const remainingMillis = estimatedEndTime.getTime() - now.getTime();
    if (remainingMillis <= 0) {
        return 0; // Or indicate "Overdue"
    }
    return Math.ceil(remainingMillis / 60000); // Remaining minutes
};

// Add more utility functions as needed.