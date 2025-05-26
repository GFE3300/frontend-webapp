// src/features/venue_management/components/live_view/OrderDetailsModalContent.jsx
import React from 'react';
// timeSince utility would be imported, e.g., from '../../../utils/orderUtils'

// Placeholder for timeSince
const placeholderTimeSince = (dateString) => {
    if (!dateString) return '';
    return `${Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)}m ago`;
};

const OrderDetailsModalContent = ({ order, timeSince = placeholderTimeSince }) => {
    if (!order) {
        return <p className="text-sm text-gray-500">No order details available.</p>;
    }

    return (
        <div className="text-xs text-gray-700 space-y-1.5">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>People:</strong> {order.people}</p>
            <p><strong>Placed:</strong> {timeSince(order.createdAt)}</p>
            <div>
                <strong>Items:</strong>
                <ul className="list-disc pl-4 mt-1">
                    {order.items.map((item, i) => (
                        <li key={i}>{item.name} (x{item.qty})</li>
                    ))}
                </ul>
            </div>
            <p className="text-sm font-semibold mt-2">
                <strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}
            </p>
        </div>
    );
};

export default OrderDetailsModalContent;