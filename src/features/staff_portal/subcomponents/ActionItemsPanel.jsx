import React from 'react';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import { Link } from 'react-router-dom';

/**
 * Placeholder for the Admin Action Items panel.
 * This will display urgent stats and links to management pages.
 */
const ActionItemsPanel = () => {
    // This will be replaced with props data later.
    const payoutsAwaiting = 5;

    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Action Items</h3>
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/40 p-4 rounded-lg">
                <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-200">Payouts Awaiting Processing</p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{payoutsAwaiting}</p>
                </div>
                <Button as={Link} to="/staff/payouts" variant="solid" color="primary">
                    <Icon name="payments" className="mr-2 h-5 w-5" />
                    Review Payouts
                </Button>
            </div>
        </div>
    );
};

export default ActionItemsPanel;