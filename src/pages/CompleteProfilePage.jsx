import React, { useState, useEffect } from 'react';
import AnimatedMenu from '../features/onboarding_menu/components/AnimatedMenu';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import {
    WelcomePage,
    PersonalDataPage,
    LocationPage,
    FlavorRankingPage,
    ConfirmationPage, 
    DrinkPreferencesPage
} from '../features/onboarding_menu/pages';


const pagesConfig = [
    {
        front: <WelcomePage />,
        back: <PersonalDataPage />,
        validate: (data) => !!data?.avatar && !!data?.firstName && !!data?.lastName
    },
    {
        front: <LocationPage />,
        back: <FlavorRankingPage />,
        validate: (data) => !!data?.address?.street && !!data?.address?.city && !!data?.address?.country && !!data?.coords
    },
    {
        front: <DrinkPreferencesPage />,
        back: <ConfirmationPage />,
        validate: (data) => data?.drinkPreferences && data.drinkPreferences.length === 3
    }
];

export default function CompleteProfilePage() {
    const [currentPage, setCurrentPage] = useState(-1);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const isMobile = useDeviceDetection(1000);

    useEffect(() => {
        const timer = setTimeout(() => setCurrentPage(0), 750);
        setFormData({
            avatar: '',
            firstName: '',
            lastName: '',
            nickname: '',
            phone: '',
            gender: '',
            locationData: null,
            flavorRanking: [],
            drinkPreferences: [],
            deliveryTime: ''
        });
        return () => clearTimeout(timer);
    }, []);

    const handleNextPage = (newDataFromComponent) => {
        const logicalPageIndex = Math.floor(currentPage / (isMobile ? 1 : 2));
        const dataToValidate = { ...formData, ...(newDataFromComponent || {})};

        let isValid = true;
        if (pagesConfig[logicalPageIndex] && typeof pagesConfig[logicalPageIndex].validate === 'function') {
            isValid = pagesConfig[logicalPageIndex].validate(dataToValidate);
        }

        if (!isValid) {
            setError('Please complete all required fields');
            return;
        }

        setError('');
        setFormData(prev => ({ ...prev, ...(newDataFromComponent || {}) }));
        setCurrentPage(prev => Math.min(prev + 1, pagesConfig.length * 2));
    };

    const handlePrevPage = () => {
        setError('');
        setCurrentPage(prev => Math.max(prev - 1, 0));
    };

    const enhancedPages = pagesConfig.map((pageConf) => ({
        front: React.cloneElement(pageConf.front, {
            nextPage: handleNextPage,
            prevPage: handlePrevPage,
            isRight: true,
            isMobile,
            formData,
            setFormData,
            error
        }),
        back: React.cloneElement(pageConf.back, {
            nextPage: handleNextPage,
            prevPage: handlePrevPage,
            isRight: false,
            isMobile,
            formData,
            setFormData,
            error
        })
    }));

    return (
        <div className="flex min-h-screen items-center justify-center">
            <AnimatedMenu
                pages={enhancedPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            {error && !isMobile && (
                <div className = "fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-lg shadow-md">
                    {error}
                </div>
            )}
        </div>
    );
}