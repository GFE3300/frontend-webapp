import React, { memo } from 'react';
import { Link } from 'react-router-dom';

import Icon from '../../components/common/Icon';
import BusinessSwitcher from './header/BusinessSwitcher';
import UserProfileWidget from './header/UserProfileWidget';
import { scriptLines_dashboard as sl } from './utils/script_lines'; // Import script lines

const DashboardHeader = () => {
    return (
        <div className="fixed top-0 left-0 right-0 z-40 p-4 print:hidden">
            <div className="flex items-center justify-between h-12">
                {/* Left Zone: Identity & Context */}
                <div className="flex items-center space-x-4">
                    {/* Left Zone: Logo Name */}
                    <Link to="/dashboard/business" className="flex font-montserrat items-center">
                        <span className="text-2xl mr-4 text-white dark:text-neutral-100">Crumb<strong>Data</strong></span>
                    </Link>
                    <BusinessSwitcher />
                </div>

                {/* Right Zone: User Control */}
                <div className="flex items-center space-x-4">
                    <button
                        title={sl.dashboardHeader.notificationsTitle || 'Notifications'}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Icon name="notifications" />
                    </button>

                    {/* The new, self-contained widget */}
                    <UserProfileWidget />
                </div>
            </div>
        </div>
    );
};

export default memo(DashboardHeader);