// FILE: src/features/dashboard/pages/VenuePage.jsx
// MODIFIED: Implementing Venue Page by integrating VenueDesignerPage.
import React from 'react';
import VenueDesignerPage from '../../venue_management/subcomponents/layout_designer/VenueDesignerPage';

const VenuePage = () => {
    return (
        <div className="venue-page h-full flex flex-col"> {/* Ensure VenuePage takes full height if VenueDesignerPage needs it */}
            {/* 
                The page title "Venue & Table Management" is typically handled by the DashboardHeader or a specific header
                within VenueDesignerPage itself if it's meant to be more integrated.
                For now, this page just acts as a container for VenueDesignerPage.
                If a separate title is needed specifically on this page wrapper, it can be added here.
                e.g., 
                <header className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Venue & Table Management</h1>
                </header>
            */}
            <div className="flex-grow h-full overflow-visible">
                <VenueDesignerPage />
            </div>
        </div>
    );
};

export default VenuePage;