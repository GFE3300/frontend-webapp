import React from 'react';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import MainContentArea from './MainContentArea'; // Import the new MainContentArea component.

const DashboardLayout = () => { // The `children` prop has been removed from the function signature.
    return (

        <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
            <Sidebar />

            {/* This flex container holds the rest of the UI, allowing the main content to scroll independently. */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />
                <MainContentArea />
            </div>
        </div>
    );
};

export default DashboardLayout;