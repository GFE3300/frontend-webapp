import React from 'react';
import PropTypes from 'prop-types';

// Helper to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount || 0));
};

// Helper to get status-specific styling
const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
    const lowerStatus = status.toLowerCase();

    switch (lowerStatus) {
        case 'paid_out':
            return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
        case 'ready_for_payout':
            return 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200';
        case 'included_in_payout':
            return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
        case 'on_hold':
            return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
        case 'voided':
            return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
        default: // 'pending' and other statuses
            return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
    }
};

// Helper to format status text for display
const formatStatusText = (status) => {
    if (!status) return 'N/A';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Displays a list of recent commission records in a clean, readable table format.
 */
const CommissionsList = ({ commissions }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Recent Commissions</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Referred Business</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Commission</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 text-sm">
                        {commissions && commissions.length > 0 ? commissions.map(item => (
                            <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-800 dark:text-neutral-200">
                                    {item.business_name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-green-600 dark:text-green-400">
                                    {formatCurrency(item.amount)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                                        {formatStatusText(item.status)}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-sm text-neutral-500">
                                    No recent commissions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

CommissionsList.propTypes = {
    /** An array of commission objects, fetched from the affiliate's dashboard API. */
    commissions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        created_at: PropTypes.string.isRequired,
        business_name: PropTypes.string.isRequired,
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        status: PropTypes.string.isRequired,
    })),
};

CommissionsList.defaultProps = {
    commissions: [],
};

export default CommissionsList;