import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';

/**
 * A panel that highlights urgent administrative tasks, guiding the superuser
 * to the most important management pages.
 */
const ActionItemsPanel = ({ pendingPayouts }) => {
    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                Action Items
            </h3>

            <div className="flex-grow flex flex-col justify-center">
                {pendingPayouts > 0 ? (
                    <div className="bg-amber-50 dark:bg-amber-900/40 p-4 rounded-lg text-center">
                        <p className="font-semibold text-amber-800 dark:text-amber-200">
                            Payouts Awaiting Processing
                        </p>
                        <p className="text-4xl font-bold text-amber-900 dark:text-amber-100 my-2">
                            {pendingPayouts}
                        </p>
                        <Button
                            as={Link}
                            to="/staff/payouts"
                            variant="solid"
                            color="primary"
                            className="mt-2 w-full"
                        >
                            <Icon name="payments" className="mr-2 h-5 w-5" />
                            Review Payouts
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                        <Icon name="check_circle" className="mx-auto h-12 w-12 text-green-500 mb-3" />
                        <p className="font-medium">No pending actions.</p>
                        <p className="text-sm">Everything is up to date.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

ActionItemsPanel.propTypes = {
    /** The number of payouts that are pending administrative action. */
    pendingPayouts: PropTypes.number,
};

ActionItemsPanel.defaultProps = {
    pendingPayouts: 0,
};


export default ActionItemsPanel;