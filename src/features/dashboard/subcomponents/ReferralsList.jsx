import React from 'react';
import PropTypes from 'prop-types';

const ReferralsList = ({ referrals }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Recent Referrals</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Referred Business</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Subscription</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {referrals.length > 0 ? referrals.map(item => (
                            <tr key={item.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">{new Date(item.referral_date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.referred_business_name}</div>
                                    <div className="text-xs text-neutral-500">{item.referred_user_email}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${item.subscription_status?.toLowerCase().includes('active') ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-neutral-100 dark:bg-neutral-700'}`}>
                                        {item.subscription_status || 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="text-center py-8 text-sm text-neutral-500">No recent referrals found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

ReferralsList.propTypes = {
    referrals: PropTypes.array,
};

ReferralsList.defaultProps = {
    referrals: [],
};

export default ReferralsList;