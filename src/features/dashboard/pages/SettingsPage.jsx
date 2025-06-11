import React from 'react';
import { Outlet } from 'react-router-dom';
import SettingsSidebar from '../subcomponents/SettingsSidebar'; // We will create this next

const SettingsPage = () => {
    return (
        <div className="flex flex-col md:flex-row gap-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <SettingsSidebar />
            <main className="flex-1 w-full md:w-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default SettingsPage;