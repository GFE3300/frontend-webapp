import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

/**
 * A component that allows users to switch the application language.
 * It displays buttons for available languages and visually indicates the active language.
 * On change, it first optimistically updates the UI via i18next. If the user is authenticated,
 * it then attempts to persist the preference via an API call. If the API call fails,
 * it reverts the language change and notifies the user with a toast.
 */
const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const { isAuthenticated, updateUser } = useAuth();
    const { addToast } = useToast();

    const handleChangeLanguage = useCallback(async (lang) => {
        const originalLang = i18n.language;
        // Prevent redundant changes
        if (originalLang.startsWith(lang)) return;

        // 1. Optimistically change the UI language first for immediate feedback.
        await i18n.changeLanguage(lang);

        // 2. If the user is authenticated, attempt to persist the change.
        if (isAuthenticated) {
            try {
                await apiService.updateCurrentUser({ language: lang });
                // Update local auth context state after successful API call
                updateUser({ language: lang });
            } catch (error) {
                console.error("Failed to persist language preference:", error);
                
                // 3. If API call fails, revert the language and notify the user.
                await i18n.changeLanguage(originalLang);
                addToast({
                    type: 'error',
                    title: 'Update Failed',
                    message: 'Could not save your language preference. Please try again.',
                });
            }
        }
    }, [i18n, isAuthenticated, addToast, updateUser]);

    const languages = [
        { code: 'en', label: 'EN' },
        { code: 'es', label: 'ES' },
    ];

    return (
        <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleChangeLanguage(lang.code)}
                    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${i18n.language.startsWith(lang.code)
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                    aria-pressed={i18n.language.startsWith(lang.code)}
                    aria-label={`Switch to ${lang.label === 'EN' ? 'English' : 'Spanish'}`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitcher;