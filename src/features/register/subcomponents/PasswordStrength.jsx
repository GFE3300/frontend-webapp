export const PasswordStrength = ({ strength }) => {
    const strengthLevels = {
        weak: { width: '33%', color: 'bg-red-500', text: 'Weak' },
        fair: { width: '66%', color: 'bg-yellow-500', text: 'Fair' },
        strong: { width: '100%', color: 'bg-green-500', text: 'Strong' }
    };
    const level = strengthLevels[strength] || strengthLevels.weak;

    return (
        <div className="mt-2 mx-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${level.color} transition-all duration-300`}
                    style={{ width: level.width }}
                />
            </div>
            <span className={`text-xs ${level.color.replace('bg', 'text')} font-medium font-montserrat`}>
                {level.text}
            </span>
        </div>
    );
};