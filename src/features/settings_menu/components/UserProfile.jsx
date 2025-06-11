import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import PersonalInfoCard from './PersonalInfoCard';
import PasswordSecurityCard from './PasswordSecurityCard';
import Spinner from '../../../components/common/Spinner';

/**
 * UserProfile component serves as a "smart" container for the user settings page.
 * It is responsible for fetching the authenticated user data and managing the
 * loading state. Once the user data is available, it passes it down to its
 * child components, ensuring a clean and robust one-way data flow.
 */
const UserProfile = () => {
    const { user, isLoading } = useAuth();

    // While the user object is being fetched, display a loading spinner.
    // This prevents child components from rendering with null or incomplete data,
    // which is a critical step in ensuring data integrity.
    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center p-10 h-full">
                <Spinner size="lg" />
            </div>
        );
    }

    // Once data is loaded, render the settings layout.
    // The `user` object is passed as a prop to child components, establishing
    // this component as the source of truth.
    return (
        <div className="space-y-8">
            <PersonalInfoCard user={user} />
            <PasswordSecurityCard />
        </div>
    );
};

export default UserProfile; 