import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';

/**
 * A responsive table for displaying a list of affiliates.
 * Provides actions for editing and viewing detailed analytics for each affiliate.
 */
const AffiliatesTable = ({ affiliates, onEdit }) => {

    if (!affiliates || affiliates.length === 0) {
        return (
            <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
                <Icon name="group_off" className="mx-auto h-12 w-12 mb-4 text-neutral-400" />
                <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200">No Affiliates Found</h3>
                <p className="text-sm mt-1">Get started by creating your first affiliate partner.</p>
            </div>
        );
    }


    return (
        <div className="overflow-x-auto font-montserrat">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Name / Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Referral Code</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Commission</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {affiliates.map((affiliate) => {
                        return (
                            <tr key={affiliate.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{affiliate.name || 'N/A'}</div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{affiliate.user_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200">
                                        {affiliate.referral_code}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    {(parseFloat(affiliate.commission_rate) * 100).toFixed(1)}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${affiliate.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200'
                                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
                                        }`}>
                                        {affiliate.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => onEdit(affiliate)}>
                                        <Icon name="edit" className="w-4 h-4" style={{ fontSize: '1rem' }} />
                                    </Button>
                                    <Link to={`/staff/manage-affiliates/${affiliate.id}`}>
                                        <Button size="sm" variant="ghost">
                                            <Icon name="monitoring" className="w-4 h-4" style={{ fontSize: '1rem' }} />
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
        </div>
    );
};

AffiliatesTable.propTypes = {
    affiliates: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        user_email: PropTypes.string.isRequired,
        referral_code: PropTypes.string.isRequired,
        commission_rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        is_active: PropTypes.bool.isRequired,
    })).isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default AffiliatesTable;