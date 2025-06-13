import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../../../components/common/Icon';
import { scriptLines_dashboard as sl } from '../utils/script_lines';

const SettingsSidebar = () => {
    // MODIFICATION: Added 'Team Members' to the settings links array.
    const settingsLinks = [
        { name: sl.settingsSidebar.userProfile || 'User Profile', to: 'profile', icon: 'person' },
        { name: sl.settingsSidebar.businessProfile || 'Business Profile', to: 'business', icon: 'storefront' },
        { name: sl.settingsSidebar.billing || 'Billing', to: 'billing', icon: 'credit_card' },
        { name: sl.settingsSidebar.teamMembers || 'Team Members', to: 'team', icon: 'groups' },
    ];

    const getLinkClassName = ({ isActive }) => {
        const baseClasses = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200';
        if (isActive) {
            return `${baseClasses} bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300`;
        }
        return `${baseClasses} text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50`;
    };

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-2">
                {settingsLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.to}
                        className={getLinkClassName}
                        end
                    >
                        <Icon name={link.icon} className="w-5 h-5" />
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default SettingsSidebar;