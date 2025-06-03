// frontend/src/features/menu_view/subcomponents/OrderSummaryPanel.jsx
import React from 'react';
import PropTypes from 'prop-types';

// Assuming some common components like Button and utility for formatting currency
// import Button from '../../../components/common/Button';
// import { formatCurrency } from '../../../utils/currencyUtils';

// Placeholder for formatCurrency if not available
const formatCurrency = (amountInCents) => {
    return `$${(amountInCents / 100).toFixed(2)}`;
};

// Placeholder Button component
const Button = ({ onClick, children, variant = 'primary', disabled = false, style }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            padding: '10px 15px',
            fontSize: '1em',
            cursor: 'pointer',
            backgroundColor: variant === 'primary' ? '#007bff' : '#6c757d', // design_guidelines.txt
            color: 'white', // design_guidelines.txt
            border: 'none',
            borderRadius: '4px', // design_guidelines.txt
            opacity: disabled ? 0.65 : 1,
            ...style
        }}
    >
        {children}
    </button>
);
Button.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired,
    variant: PropTypes.string,
    disabled: PropTypes.bool,
    style: PropTypes.object,
};


const OrderSummaryPanel = ({
    orderItems,
    setOrderItems, // To allow removing items or changing quantity directly in summary
    userName,      // New prop from Userpage.jsx
    numberOfPeople, // New prop from Userpage.jsx
    tableNumber,   // Assuming this already exists or comes from context/props
    // onConfirmOrder, // Original prop for handling order submission logic
}) => {

    const calculateSubtotal = () => {
        return orderItems.reduce((total, item) => total + item.totalPrice, 0);
    };

    const subtotal = calculateSubtotal();
    // const taxRate = 0.08; // Example tax rate, should come from config or backend
    // const taxAmount = subtotal * taxRate;
    // const totalAmount = subtotal + taxAmount;
    const totalAmount = subtotal; // Simplified for now, assuming total is subtotal before tax/fees

    const handleRemoveItem = (itemId) => {
        setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    // TODO: Implement handleQuantityChange if needed in summary panel

    const handleActualConfirmOrder = async () => {
        // This is where the order is sent to the backend
        if (orderItems.length === 0) {
            alert("Your order is empty."); // Or use a more sophisticated notification
            return;
        }

        const orderDetailsPayload = {
            items: orderItems.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
                price_at_order: item.pricePerItem, // Price per item with options
                // notes: item.notes, // If notes are captured
                selected_options: item.selectedOptions.map(opt => ({ // Ensure backend expects this structure
                    group_id: opt.group_id,
                    group_name: opt.group_name,
                    option_id: opt.option_id,
                    option_name: opt.option_name,
                    price_adjustment: opt.price_adjustment,
                })),
            })),
            total_amount: totalAmount,
            // tax_amount: taxAmount, // If applicable
            // subtotal_amount: subtotal, // If applicable

            // --- Task 2.2 Integration ---
            customer_name: userName || null, // Use `customer_name` or actual backend field name. Provide null if not set.
            number_of_guests: numberOfPeople || null, // Use `number_of_guests` or actual backend field name. Provide null if not set.
            // --- End Task 2.2 Integration ---

            table_number: tableNumber || null, // Assuming tableNumber is passed as a prop or from context
            // Add any other required fields: payment_intent_id, special_requests, business_id, table_id etc.
        };

        console.log("Submitting Order Payload:", orderDetailsPayload);

        try {
            // Example: const response = await api.submitOrder(orderDetailsPayload);
            // Handle successful order submission (e.g., navigate to confirmation page, show success message)
            alert("Order submitted successfully! (Mock)");
            setOrderItems([]); // Clear the order
            // Potentially redirect or show a success view
        } catch (error) {
            console.error("Error submitting order:", error);
            alert("There was an issue submitting your order. Please try again.");
            // Handle error (e.g., display error message to user)
        }
    };

    // Inline styles are for demonstration; use design_guidelines.txt for actual styling
    return (
        <div className="order-summary-panel" style={{
            padding: '16px',
            border: '1px solid #ddd', /* design_guidelines.txt */
            borderRadius: '8px', /* design_guidelines.txt */
            background: '#f9f9f9' /* design_guidelines.txt */
        }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px' /* design_guidelines.txt */ }}>Your Order</h2>

            {/* --- Task 2.2 Display: Setup Stage Info --- */}
            <div className="order-setup-info" style={{ marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                {tableNumber && (
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9em' /* design_guidelines.txt */ }}>
                        Table: <strong style={{ /* design_guidelines.txt */ }}>{tableNumber}</strong>
                    </p>
                )}
                {userName && (
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9em' /* design_guidelines.txt */ }}>
                        For: <strong style={{ /* design_guidelines.txt */ }}>{userName}</strong>
                    </p>
                )}
                {numberOfPeople > 0 && ( // Only show if number of people is explicitly set
                    <p style={{ margin: '0', fontSize: '0.9em' /* design_guidelines.txt */ }}>
                        Guests: <strong style={{ /* design_guidelines.txt */ }}>{numberOfPeople}</strong>
                    </p>
                )}
            </div>
            {/* --- End Task 2.2 Display --- */}

            {orderItems.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777' /* design_guidelines.txt */ }}>Your order is empty.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {orderItems.map(item => (
                        <li key={item.id} style={{
                            marginBottom: '12px',
                            paddingBottom: '12px',
                            borderBottom: '1px dashed #eee', /* design_guidelines.txt */
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0' /* design_guidelines.txt */ }}>{item.name} (x{item.quantity})</h4>
                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                    <ul style={{ fontSize: '0.85em', color: '#555', paddingLeft: '15px', margin: '4px 0' /* design_guidelines.txt */ }}>
                                        {item.selectedOptions.map(opt => (
                                            <li key={`${item.id}-${opt.option_id}`}>
                                                {opt.group_name}: {opt.option_name}
                                                {opt.price_adjustment !== 0 && ` (${opt.price_adjustment > 0 ? '+' : ''}${formatCurrency(opt.price_adjustment)})`}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' /* design_guidelines.txt */ }}>{formatCurrency(item.totalPrice)}</p>
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    aria-label={`Remove ${item.name} from order`}
                                    style={{ /* design_guidelines.txt for small/icon button */
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'red', // design_guidelines.txt
                                        cursor: 'pointer',
                                        fontSize: '0.8em'
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {orderItems.length > 0 && (
                <div className="order-totals" style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' /* design_guidelines.txt */ }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {/* 
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div> 
          */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1em' /* design_guidelines.txt */ }}>
                        <span>Total:</span>
                        <span>{formatCurrency(totalAmount)}</span>
                    </div>

                    <Button
                        onClick={handleActualConfirmOrder}
                        variant="primary"
                        disabled={orderItems.length === 0}
                        style={{ width: '100%', marginTop: '20px' /* design_guidelines.txt for primary action button */ }}
                    >
                        Confirm Order ({formatCurrency(totalAmount)})
                    </Button>
                </div>
            )}
        </div>
    );
};

OrderSummaryPanel.propTypes = {
    orderItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        productId: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        basePrice: PropTypes.number.isRequired,
        pricePerItem: PropTypes.number.isRequired,
        totalPrice: PropTypes.number.isRequired,
        selectedOptions: PropTypes.arrayOf(PropTypes.shape({
            group_id: PropTypes.string.isRequired,
            group_name: PropTypes.string.isRequired,
            option_id: PropTypes.string.isRequired,
            option_name: PropTypes.string.isRequired,
            price_adjustment: PropTypes.number.isRequired,
        })),
        image_url: PropTypes.string,
    })).isRequired,
    setOrderItems: PropTypes.func.isRequired,
    userName: PropTypes.string,
    numberOfPeople: PropTypes.number,
    tableNumber: PropTypes.string, // Assuming tableNumber is also a prop
    // onConfirmOrder: PropTypes.func.isRequired, // Kept if Userpage handles the final submission logic
};

OrderSummaryPanel.defaultProps = {
    userName: '',
    numberOfPeople: 0, // Default to 0 or 1 as appropriate
    tableNumber: '',
};

export default React.memo(OrderSummaryPanel);