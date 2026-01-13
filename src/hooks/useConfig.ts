import { useState, useEffect, useCallback } from 'react';
import { WebDavConfig, AIConfig, SiteSettings } from '../types';
import { WEBDAV_CONFIG_KEY, AI_CONFIG_KEY, SITE_SETTINGS_KEY } from '../utils/constants';

const DEFAULT_AI_CONFIG: AIConfig = {
    provider: 'gemini',
    apiKey: '',
    baseUrl: '',
    model: 'gemini-2.5-flash'
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
    title: 'CloudNav - 我的导航',
    navTitle: 'CloudNav',
    favicon: '',
    cardStyle: 'detailed'
};

const DEFAULT_WEBDAV_CONFIG: WebDavConfig = {
    url: '',
    username: '',
    password: '',
    enabled: false
};

export function useConfig() {
    // WebDAV Config
    const [webDavConfig, setWebDavConfig] = useState<WebDavConfig>(DEFAULT_WEBDAV_CONFIG);

    // AI Config
    const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
        const saved = localStorage.getItem(AI_CONFIG_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) { }
        }
        return DEFAULT_AI_CONFIG;
    });

    // Site Settings
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
        const saved = localStorage.getItem(SITE_SETTINGS_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) { }
        }
        return DEFAULT_SITE_SETTINGS;
    });

    // Save WebDAV config
    const saveWebDavConfig = useCallback((config: WebDavConfig) => {
        setWebDavConfig(config);
        localStorage.setItem(WEBDAV_CONFIG_KEY, JSON.stringify(config));
    }, []);

    // Save AI config
    const saveAIConfig = useCallback((config: AIConfig, newSiteSettings?: SiteSettings) => {
        setAiConfig(config);
        localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));

        if (newSiteSettings) {
            setSiteSettings(newSiteSettings);
            localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(newSiteSettings));
        }
    }, []);

    // Restore AI config (from backup)
    const restoreAIConfig = useCallback((config: AIConfig) => {
        setAiConfig(config);
        localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
    }, []);

    // Update site settings (e.g., card style)
    const updateSiteSettings = useCallback((updates: Partial<SiteSettings>) => {
        setSiteSettings(prev => {
            const newSettings = { ...prev, ...updates };
            localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(newSettings));
            return newSettings;
        });
    }, []);

    // Handle view mode change
    const handleViewModeChange = useCallback((cardStyle: 'detailed' | 'simple') => {
        updateSiteSettings({ cardStyle });
    }, [updateSiteSettings]);

    // Load WebDAV config on mount
    useEffect(() => {
        const savedWebDav = localStorage.getItem(WEBDAV_CONFIG_KEY);
        if (savedWebDav) {
            try {
                setWebDavConfig(JSON.parse(savedWebDav));
            } catch (e) { }
        }
    }, []);

    // Update page title and favicon when site settings change
    useEffect(() => {
        if (siteSettings.title) {
            document.title = siteSettings.title;
        }

        if (siteSettings.favicon) {
            const existingFavicons = document.querySelectorAll('link[rel="icon"]');
            existingFavicons.forEach(favicon => favicon.remove());

            const favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.href = siteSettings.favicon;
            document.head.appendChild(favicon);
        }
    }, [siteSettings.title, siteSettings.favicon]);

    // Derived values
    const navTitleText = siteSettings.navTitle || 'CloudNav';
    const navTitleShort = navTitleText.slice(0, 2);

    return {
        // WebDAV
        webDavConfig,
        saveWebDavConfig,

        // AI Config
        aiConfig,
        saveAIConfig,
        restoreAIConfig,

        // Site Settings
        siteSettings,
        updateSiteSettings,
        handleViewModeChange,

        // Derived
        navTitleText,
        navTitleShort
    };
}
