import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';

const resources = {
    en: {
        translation: translationEN,
    },
    es: {
        translation: translationES,
    },
};

i18n
    // Detect user language
    // Learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // Init i18next
    // For all options read: https://www.i18next.com/overview/configuration-options
    .init({
        resources,
        fallbackLng: 'en',
        debug: import.meta.env.DEV, // Enable debug output in development

        interpolation: {
            escapeValue: false, // React already safes from xss
        },

        detection: {
            // Order and from where user language should be detected
            order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
            // Cache user language in localStorage and cookies
            caches: ['localStorage', 'cookie'],
        },
    });

export default i18n;