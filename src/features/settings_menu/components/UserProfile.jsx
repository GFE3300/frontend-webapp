import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import PersonalInfoCard from './PersonalInfoCard';
import PasswordSecurityCard from './PasswordSecurityCard';
import Spinner from '../../../components/common/Spinner';

const UserProfile = () => {
    const { user, isLoading } = useAuth();

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center p-10 h-full">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PersonalInfoCard user={user} />
            <PasswordSecurityCard />
        </div>
    );
};

export default UserProfile;