// src/hooks/useI18n.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { locales } from '../locales';

const I18nContext = createContext();

export function I18nProvider({ children }) {
    // 默认使用中文，你可以根据需求甚至读取浏览器的默认语言
    const [language, setLanguage] = useState('en');

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
    }, []);

    // 核心的翻译函数 t
    const t = useCallback((key) => {
        const keys = key.split('.');
        let result = locales[language];
        for (const k of keys) {
            if (result === undefined) break;
            result = result[k];
        }
        // 如果找不到对应的翻译，返回 key 作为 fallback
        return result !== undefined ? result : key;
    }, [language]);

    return (
        <I18nContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}