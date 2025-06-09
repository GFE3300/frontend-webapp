import { createContext, useContext, useState } from 'react';
import { startOfMonth } from 'date-fns';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        timeRange: { startHour: 8, endHour: 16 },
        bufferDays: 7,
        currentMonth: startOfMonth(new Date())
    });

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);