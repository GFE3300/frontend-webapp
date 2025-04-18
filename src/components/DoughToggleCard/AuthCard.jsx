import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import axios from 'axios';
import { ToggleSwitch } from './ToggleSwitch';
import { AuthForm } from './AuthForm';
import { RollingPin } from './RollingPin';
import { getErrorMessage } from '../../utils/getErrorMessage';

const AuthCard = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!isLogin && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords must match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const endpoint = isLogin ? 'login' : 'register';
            const url = `http://localhost:8000/api/auth/${endpoint}/`;
            const payload = {
                email: formData.email,
                password: formData.password
            };

            const { data } = await axios.post(url, payload);

            console.log(isLogin ? 'Login successful!' : 'Registration successful!', data);
            setFormData({ email: '', password: '', confirmPassword: '' });
            setApiError('');
        } catch (error) {
            setApiError(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    // Rest of the component remains unchanged
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (apiError) setApiError('');
    };

    const handleToggle = (newState) => {
        if (isLogin === newState) return;
        setIsAnimating(true);
        setIsLogin(newState);
        setTimeout(() => setIsAnimating(false), 600);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9F5F0]">
            <motion.div
                layout
                className="relative w-full max-w-[90%] md:w-[400px] bg-[#F5EFE6] rounded-xl shadow-md p-8"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{
                    height: isLogin ? 500 : 600
                }}
            >
                {/* Rest of the JSX remains unchanged */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-[#6F4E37] mb-2">
                        S'more
                    </h1>
                    <p className="text-[#6F4E37]/80">Bake your next order</p>
                </div>

                <ToggleSwitch isLogin={isLogin} setIsLogin={handleToggle} />

                <RollingPin isAnimating={isAnimating} />

                <form onSubmit={handleSubmit}>
                    <AuthForm
                        isLogin={isLogin}
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                        isLoading={isLoading}
                        handleSubmit={handleSubmit}
                        apiError={apiError}
                    />
                </form>

                <div aria-live="polite" className="sr-only">
                    {isLogin ? 'Login form' : 'Registration form'}
                </div>
            </motion.div>
        </div>
    );
};

export default AuthCard;