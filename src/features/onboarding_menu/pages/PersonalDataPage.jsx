import { useState, useRef } from 'react';
//eslint-disable-next-line
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import Navigation from './Navigation';

export const PersonalDataPage = ({ prevPage: onBack, nextPage: onNext, isMobile, isRight, formData }) => {
    const inputRef = useRef(null);
    const [localData, setLocalData] = useState(formData);

    const handleSubmit = () => {
        if (
            !localData.firstName && !localData.lastName && !localData.nickname &&
            !localData.phone && !localData.gender
        ) return;
        onNext(localData);
    };

    const handleAvatarClick = () => {
        inputRef.current.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setLocalData({ ...localData, avatar: url });
        }
    };

    return (
        <div
            className="w-full h-144 py-6 px-6 relative overflow-hidden"
        >
            {/* Header & Avatar */}
            <div
                className="flex flex-row items-center gap-4"
                onClick={handleAvatarClick}
            >
                <div
                    className="
                    w-15 h-15 rounded-full border-4 border-[var(--color-gold)]
                    flex items-center justify-center cursor-pointer overflow-hidden text-[var(--color-cream)]"
                    style={{
                        background: `linear-gradient(18deg,var(--color-gold) 0%,rgb(238, 203, 89) 95%)`,
                    }}
                >
                    {localData.avatar ? (
                        <img src={localData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <Icon
                            name={'person_add'}
                            style={{ fontSize: '2rem' }}
                            variations={{ fill: 0, weight: 300, grade: 0, opsz: 48 }}
                        />
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    className="hidden"
                    onChange={handleAvatarChange}
                />
                <div
                    className="
                    font-playfair h-full 
                    flex flex-col items-start justify-center gap-1
                    text-xl text-[var(--color-chocolate)]"
                >
                    <h2 className='font-bold text-2xl'> Your Profile </h2>
                    <p className="text-[var(--color-chocolate)] text-sm">Click and add your profile picture</p>
                </div>
            </div>

            {/* Form Fields */}
            <div className="mt-4 flex-1 flex flex-col justify-start space-y-6">
                {/* First Name */}
                <div className="font-playfair text-lg flex flex-row items-center mb-2 font-semibold text-[var(--color-chocolate)]">
                    What's your name?
                </div>
                <div className="relative flex flex-row items-center text-sm gap-6">
                    <input
                        type="text"
                        value={localData.firstname}
                        onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
                        placeholder="First Name"
                        className="w-full px-2 h-8 border-b-2 border-[var(--color-chocolate)] focus:outline-none"
                    />
                    <input
                        type="text"
                        value={localData.lastname}
                        onChange={(e) => setLocalData({ ...localData, lastName: e.target.value })}
                        placeholder="Last Name"
                        className="w-full px-2 h-8 border-b-2 border-[var(--color-chocolate)] focus:outline-none"
                    />
                </div>

                {/* Last Name */}
                <div className="font-playfair text-lg flex flex-row items-center mb-2 font-semibold text-[var(--color-chocolate)]">
                    What do you like to be called?
                </div>
                <div className="relative flex flex-row items-center text-sm gap-6">
                    <input
                        type="text"
                        value={localData.nickname}
                        onChange={(e) => setLocalData({ ...localData, nickname: e.target.value })}
                        placeholder="Nickname"
                        className="w-full px-2 h-8 border-b-2 border-[var(--color-chocolate)] focus:outline-none"
                    />
                </div>

                {/* Phone */}
                <div className="font-playfair text-lg flex flex-row items-center mb-2 font-semibold text-[var(--color-chocolate)]">
                    What about your phone number?
                </div>
                <div className="relative flex flex-row items-center text-sm gap-6">
                    <input
                        type="tel"
                        value={localData.phone}
                        onChange={(e) => setLocalData({ ...localData, phone: e.target.value })}
                        placeholder="+34 600 123 456"
                        className="w-full px-2 h-8 border-b-2 border-[var(--color-chocolate)] focus:outline-none"
                    />
                </div>

                {/* Gender */}
                <div className="font-playfair text-lg flex flex-row items-center mb-3 font-semibold text-[var(--color-chocolate)]">
                    What's your gender?
                </div>
                <div className="relative flex items-center justify-center text-sm gap-6">
                    <GenderSelector selected={localData.gender} onSelect={(value) => setLocalData({ ...localData, gender: value })} />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 justify-end mt-7">
                <Navigation
                    onNext={handleSubmit}
                    onBack={onBack}
                    isRight={isRight}
                    isMobile={isMobile}
                />
            </div>
        </div>
    );
};

const options = [
    { label: 'Female', value: 'female', icon: 'woman' },
    { label: 'Male', value: 'male', icon: 'man' },
    { label: 'Other', value: 'other', icon: 'settings_accessibility' }
];

const GenderSelector = ({ selected, onSelect }) => {
    return (
        <div className="space-x-6 flex items-center justify-center">
            {options.map(opt => {
                const isActive = selected === opt.value;
                return (
                    <div key={opt.value} className='flex flex-col justify-center items-center gap-1 '>
                        <motion.button
                            key={opt.value}
                            onClick={() => onSelect(opt.value)}
                            className={`
                        w-12 h-12 rounded-full flex items-center justify-center 
                        cursor-pointer border-2 border-[var(--color-gold)]
                        ${isActive
                                    ? 'text-[var(--color-white)] shadow-lg'
                                    : 'text-[var(--color-charcoal)] border-2 border-[var(--color-mauve)]'}
                        `}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            style={{
                                background:
                                    isActive
                                        ? `linear-gradient(18deg,var(--color-gold) 0%,rgb(238, 203, 89) 95%)`
                                        : 'none',
                            }}
                        >
                            <Icon
                                name={opt.icon}
                                className="w-6 h-6"
                            />
                        </motion.button>
                        <span className="text-[var(--color-chocolate)] text-xs">{opt.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default GenderSelector;
