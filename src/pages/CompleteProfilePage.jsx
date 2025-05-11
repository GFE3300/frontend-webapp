import React, { useState, useEffect } from 'react';
import AnimatedMenu from '../features/onboarding_menu/components/AnimatedMenu';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import {
    WelcomePage,
    PersonalDataPage,
    LocationPage,
    FlavorRankingPage,
    ConfirmationPage, 
    BreadPreferencesPage
} from '../features/onboarding_menu/pages';

const pages = [
    {
        front: <WelcomePage />,
        back: <PersonalDataPage />,
        validate: (data) => !!data?.firstName && !!data?.lastName
    },
    {
        front: <LocationPage />,
        back: <FlavorRankingPage />,
        validate: (data) => !!data?.deliveryTime
    },
    {
        front: <BreadPreferencesPage />,
        back: <ConfirmationPage />,
        validate: (data) => !!data?.avatar
    }
];

export default function CompleteProfilePage() {
    const [currentPage, setCurrentPage] = useState(-1);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const isMobile = useDeviceDetection(1000);

    useEffect(() => {
        setTimeout(() => setCurrentPage(0), 750);
        setFormData({
            avatar: '',
            firstName: '',
            lastName: '',
            nickname: '',
            phone: '',
            gender: '',
        });
    }, []);

    const handleNextPage = (newData) => {
        const pageIndex = Math.floor(currentPage / (isMobile ? 1 : 2));
        const validation = pages[pageIndex]?.validate(newData || formData);
        console.log('Validation:', validation, 'Page Index:', pageIndex, 'Current Page:', currentPage);

            if (!validation && currentPage >= 1) {
            setError('Please complete all required fields');
            return;
        }

        setError('');
        setFormData(prev => ({ ...prev, ...newData }));
        setCurrentPage(prev => Math.min(prev + (isMobile ? 1 : 2), pages.length * 2));
    };

    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - (isMobile ? 1 : 2), 0));

    const enhancedPages = pages.map((page) => ({
        front: React.cloneElement(page.front, {
            nextPage: handleNextPage,
            prevPage: handlePrevPage,
            isRight: true,
            isMobile,
            formData
        }),
        back: React.cloneElement(page.back, {
            nextPage: handleNextPage,
            prevPage: handlePrevPage,
            isRight: false,
            isMobile,
            formData
        })
    }));

    return (
        <div className="flex min-h-screen items-center justify-center">
            <AnimatedMenu
                pages={enhancedPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                isMobile={isMobile}
                error={error}
            />
        </div>
    );
}