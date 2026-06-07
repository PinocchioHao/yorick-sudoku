// src/hooks/useTimer.js
import { useState, useEffect, useCallback } from 'react';

export function useTimer(isActive = true) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const resetTimer = useCallback(() => {
        setSeconds(0);
    }, []);

    const formatTime = () => {
        const getSeconds = `0${(seconds % 60)}`.slice(-2);
        const minutes = `${Math.floor(seconds / 60)}`;
        const getMinutes = `0${minutes % 60}`.slice(-2);
        const getHours = `0${Math.floor(seconds / 3600)}`.slice(-2);

        if (Math.floor(seconds / 3600) > 0) {
            return `${getHours}:${getMinutes}:${getSeconds}`;
        }
        return `${getMinutes}:${getSeconds}`;
    };

    return { seconds, formatTime, resetTimer };
}