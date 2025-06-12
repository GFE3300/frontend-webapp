import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationPTPT from './locales/pt-PT/translation.json';

const resources = {
    en: {
        translation: translationEN,
    },
    es: {
        translation: translationES,
    },
    'pt-PT': {
        translation: translationPTPT,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',

        supportedLngs: ['en', 'es', 'pt-PT'],
        debug: import.meta.env.DEV,

        interpolation: {
            escapeValue: false,
        },

        detection: {
            order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie'],
        },
    });

export default i18n;

export const t = (key, options) => i18n.t(key, options);
export const interpolate = (key, options) => i18n.t(key, options);