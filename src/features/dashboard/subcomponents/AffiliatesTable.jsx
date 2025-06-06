import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';

const AffiliatesTable = ({ affiliates, onEdit }) => {

    if (!affiliates || affiliates.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <Icon name="group_off" className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">No Affiliates Found</h3>
                <p className="text-sm">Get started by creating your first affiliate partner.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Referral Code</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Commission</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {affiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{affiliate.name}</div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">{affiliate.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                                    {affiliate.referral_code}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                                {(parseFloat(affiliate.commission_rate) * 100).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${affiliate.is_active
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
                                    }`}>
                                    {affiliate.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <Button size="sm" variant="outline" onClick={() => onEdit(affiliate)}>Edit</Button>
                                <Button as={Link} to={`/dashboard/business/affiliates/${affiliate.id}`} size="sm" variant="ghost">View Details</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

AffiliatesTable.propTypes = {
    affiliates: PropTypes.array.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default AffiliatesTable;