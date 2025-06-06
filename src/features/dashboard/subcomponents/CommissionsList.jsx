import React from 'react';
import PropTypes from 'prop-types';

const CommissionsList = ({ commissions }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Recent Commissions</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Referred Business</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Commission</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {commissions.length > 0 ? commissions.map(item => (
                            <tr key={item.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">{new Date(item.calculation_date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.referred_business_name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-semibold text-green-600 dark:text-green-400">€{parseFloat(item.commission_earned).toFixed(2)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-neutral-600 dark:text-neutral-300">
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-700">{item.payout_status_display}</span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-sm text-neutral-500">No recent commissions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

CommissionsList.propTypes = {
    commissions: PropTypes.array,
};

CommissionsList.defaultProps = {
    commissions: [],
};

export default CommissionsList;