// FILE: src/features/staff_portal/subcomponents/CommissionsList.jsx
// ACTION: CREATE (recreating the moved component)

import React from 'react';
import PropTypes from 'prop-types';

// Helper to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

const CommissionsList = ({ commissions }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Recent Commissions</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Date</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Referred Business</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Commission</th>
                            <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 text-sm">
                        {commissions && commissions.length > 0 ? commissions.map(item => (
                            <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                <td className="px-4 py-2 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                                    {new Date(item.calculation_date || item.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap font-medium text-neutral-800 dark:text-neutral-200">
                                    {item.referred_business_name}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right font-semibold text-green-600 dark:text-green-400">
                                    {formatCurrency(item.commission_earned)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-center">
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200">
                                        {item.payout_status_display || 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-sm text-neutral-500">
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
    commissions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        calculation_date: PropTypes.string,
        created_at: PropTypes.string.isRequired,
        referred_business_name: PropTypes.string.isRequired,
        commission_earned: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        payout_status_display: PropTypes.string,
    })),
};

CommissionsList.defaultProps = {
    commissions: [],
};

export default CommissionsList;