import React from 'react';
import PropTypes from 'prop-types';

/**
 * Gets a descriptive CSS class for the status badge based on its active state.
 * @param {boolean} isActive - Whether the referral is active for commission.
 * @returns {string} Tailwind CSS classes for the badge.
 */
const getStatusBadgeClass = (isActive) => {
    return isActive
        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
};

/**
 * Formats the status boolean into a user-friendly string.
 * @param {boolean} isActive - The status of the referral.
 * @returns {string} 'Active' or 'Inactive'.
 */
const formatStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
};

/**
 * Displays a list of recent referrals in a clean, readable table format,
 * indicating their commission-earning status.
 */
const ReferralsList = ({ referrals }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Recent Referrals</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Referred Business</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Commission Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 text-sm">
                        {referrals && referrals.length > 0 ? referrals.map(item => (
                            <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="font-medium text-neutral-800 dark:text-neutral-200">{item.business_name}</div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{item.referred_user_email}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(item.is_active_for_commission)}`}>
                                        {formatStatusText(item.is_active_for_commission)}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="text-center py-10 text-sm text-neutral-500">
                                    No recent referrals found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

ReferralsList.propTypes = {
    /** An array of referral objects, fetched from the affiliate's dashboard API. */
    referrals: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        created_at: PropTypes.string.isRequired,
        business_name: PropTypes.string.isRequired,
        referred_user_email: PropTypes.string.isRequired,
        is_active_for_commission: PropTypes.bool.isRequired,
    })),
};

ReferralsList.defaultProps = {
    referrals: [],
};

export default ReferralsList;