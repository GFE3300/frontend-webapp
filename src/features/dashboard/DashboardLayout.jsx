import React from 'react';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import MainContentArea from './MainContentArea'; // Import the new MainContentArea

const DashboardLayout = () => { // Children prop removed as Outlet is used
    return (
        <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
            <Sidebar /> {/* Sidebar is now part of the flex layout */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />
                <MainContentArea /> {/* MainContentArea now wraps Outlet */}
            </div>
        </div>
    );
};

export default DashboardLayout;