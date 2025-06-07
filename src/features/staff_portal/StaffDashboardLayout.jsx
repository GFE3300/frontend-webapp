// FILE: src/features/staff_portal/StaffDashboardLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar'; // This will be created in the next step
import MainContentArea from '../dashboard/MainContentArea'; // Reusing the existing MainContentArea for consistent page transitions and padding
import DashboardHeader from '../dashboard/DashboardHeader'; // Reusing the existing Header

const StaffDashboardLayout = () => {
    return (
        <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
            {/* StaffSidebar will be created next. It will contain staff-specific navigation. */}
            <StaffSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* 
                    We can reuse the existing DashboardHeader. It's designed to be generic enough,
                    displaying the user's active business and profile info, which is relevant for both
                    customer-facing and internal staff dashboards. If a different header is ever needed,
                    this can be swapped out.
                */}
                <DashboardHeader />

                {/* 
                    We reuse MainContentArea to ensure consistent page transition animations
                    and padding across the entire application, maintaining a cohesive look and feel.
                */}
                <MainContentArea>
                    <Outlet />
                </MainContentArea>
            </div>
        </div>
    );
};

export default StaffDashboardLayout;