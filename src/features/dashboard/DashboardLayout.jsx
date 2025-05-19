import React from 'react';
import PropTypes from 'prop-types';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar'; // Placeholder

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
            <Sidebar /> {/* Sidebar will be on the left */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900 p-6">
                    {/* This is where the specific dashboard page content will go */}
                    {children}
                </main>
            </div>
        </div>
    );
};

DashboardLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DashboardLayout;