import React from 'react';
import PropTypes from 'prop-types';

const ReferralsList = ({ referrals }) => {

    const getStatusBadgeClass = (status) => {
        if (!status) return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('active') || lowerStatus.includes('trialing')) {
            return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
        }
        if (lowerStatus.includes('canceled')) {
            return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
        }
        return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Recent Referrals</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Date</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Referred Business</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Subscription Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 text-sm">
                        {referrals && referrals.length > 0 ? referrals.map(item => (
                            <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                <td className="px-4 py-2 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                                    {new Date(item.referral_date || item.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="font-medium text-neutral-800 dark:text-neutral-200">{item.referred_business_name}</div>
                                    <div className="text-xs text-neutral-500">{item.referred_user_email}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClass(item.subscription_status)}`}>
                                        {item.subscription_status || 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="text-center py-8 text-sm text-neutral-500">
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
    referrals: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        referral_date: PropTypes.string,
        created_at: PropTypes.string.isRequired,
        referred_business_name: PropTypes.string.isRequired,
        referred_user_email: PropTypes.string.isRequired,
        subscription_status: PropTypes.string,
    })),
};

ReferralsList.defaultProps = {
    referrals: [],
};

export default ReferralsList;