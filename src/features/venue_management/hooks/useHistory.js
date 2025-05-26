// src/features/venue_management/hooks/useHistory.js
import { useState, useCallback, useRef } from 'react'; // Added useRef

const useHistory = (initialHookArg) => { // Renamed for clarity
    // Store the very first initial state in a ref for potential future use, though not strictly needed for current fix
    const stableInitialArgRef = useRef(initialHookArg);

    const [history, setHistory] = useState([initialHookArg]); // Initialize with the argument
    const [currentIndex, setCurrentIndex] = useState(0);

    const setState = useCallback((actionOrValue, overwrite = false) => {
        const newValue = typeof actionOrValue === 'function'
            ? actionOrValue(history[currentIndex])
            : actionOrValue;

        if (overwrite || currentIndex < history.length - 1) {
            const newHistory = history.slice(0, currentIndex + 1);
            setHistory([...newHistory, newValue]);
            setCurrentIndex(newHistory.length);
        } else {
            setHistory([...history, newValue]);
            setCurrentIndex(history.length - 1 + 1);
        }
    }, [history, currentIndex]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prevIndex => prevIndex - 1);
        }
    }, [currentIndex]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            setCurrentIndex(prevIndex => prevIndex + 1);
        }
    }, [currentIndex, history.length]);

    // This resetHistory will now be stable because its useCallback has an empty dependency array.
    // It now expects the new initial state to be passed explicitly as an argument.
    const resetHistory = useCallback((newInitialStatePassed) => {
        // LayoutDesigner always provides newInitialStatePassed, so we use that.
        // If, in other usages, it might be called without an arg, you could use stableInitialArgRef.current
        if (newInitialStatePassed === undefined) {
             // Fallback, though LayoutDesigner should always provide it.
            setHistory([stableInitialArgRef.current]);
        } else {
            setHistory([newInitialStatePassed]);
        }
        setCurrentIndex(0);
    }, []); // Empty dependency array ensures this function reference is stable

    return {
        state: history[currentIndex],
        setState,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
        resetHistory,
        _dangerouslySetStateWithoutHistory: (newState) => {
            setHistory(prevHistory => {
                const updatedHistory = [...prevHistory];
                updatedHistory[currentIndex] = newState;
                return updatedHistory;
            });
        }
    };
};

export default useHistory;