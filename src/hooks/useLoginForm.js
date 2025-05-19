import { useState, useCallback } from 'react';
import * as yup from 'yup'; // For validation

// If you have localized strings for validation, import them here
// import { scriptLines_useLoginForm as scriptLines } from '../utils/script_lines_login'; // Example

// Define validation schema (can be localized)
const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email format.").required("Email is required."),
    password: yup.string().required("Password is required."),
});

export const useLoginForm = (initialEmail = '', initialPassword = '') => {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState(initialPassword);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState(null);

    const validate = useCallback(async () => {
        try {
            await loginSchema.validate({ email, password }, { abortEarly: false });
            setErrors({});
            setGeneralError(null);
            return true;
        } catch (err) {
            const fieldErrors = {};
            if (err.inner) {
                err.inner.forEach(error => {
                    fieldErrors[error.path] = error.message;
                });
            } else {
                fieldErrors.general = err.message || "Validation failed.";
            }
            setErrors(fieldErrors);
            if (fieldErrors.general) setGeneralError(fieldErrors.general);
            else setGeneralError("Please correct the errors above."); // Or use localized string
            return false;
        }
    }, [email, password]);

    const resetForm = useCallback(() => {
        setEmail('');
        setPassword('');
        setErrors({});
        setIsSubmitting(false);
        setGeneralError(null);
    }, []);

    return {
        email,
        setEmail,
        password,
        setPassword,
        errors,
        setErrors, // To manually set errors from API response
        isSubmitting,
        setIsSubmitting,
        generalError,
        setGeneralError,
        validate,
        resetForm,
    };
};