import { useState, useEffect, useRef, useCallback } from 'react';
import { SearchMode, ExternalSearchSource, SearchConfig } from '../types';
import { SEARCH_CONFIG_KEY } from '../utils/constants';

// Default search sources
const buildDefaultSearchSources = (): ExternalSearchSource[] => {
    const now = Date.now();
    return [
        { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q={query}', icon: 'Search', enabled: true, createdAt: now },
        { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}', icon: 'Search', enabled: true, createdAt: now },
        { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={query}', icon: 'Globe', enabled: true, createdAt: now },
        { id: 'sogou', name: '搜狗', url: 'https://www.sogou.com/web?query={query}', icon: 'Globe', enabled: true, createdAt: now },
        { id: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text={query}', icon: 'Globe', enabled: true, createdAt: now },
        { id: 'github', name: 'GitHub', url: 'https://github.com/search?q={query}', icon: 'Github', enabled: true, createdAt: now },
        { id: 'linuxdo', name: 'Linux.do', url: 'https://linux.do/search?q={query}', icon: 'Terminal', enabled: true, createdAt: now },
        { id: 'bilibili', name: 'B站', url: 'https://search.bilibili.com/all?keyword={query}', icon: 'Play', enabled: true, createdAt: now },
        { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query={query}', icon: 'Video', enabled: true, createdAt: now },
        { id: 'wikipedia', name: '维基', url: 'https://zh.wikipedia.org/wiki/Special:Search?search={query}', icon: 'BookOpen', enabled: true, createdAt: now }
    ];
};

export function useSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState<SearchMode>('external');
    const [externalSearchSources, setExternalSearchSources] = useState<ExternalSearchSource[]>([]);
    const [selectedSearchSource, setSelectedSearchSource] = useState<ExternalSearchSource | null>(null);
    const [showSearchSourcePopup, setShowSearchSourcePopup] = useState(false);
    const [hoveredSearchSource, setHoveredSearchSource] = useState<ExternalSearchSource | null>(null);
    const [isIconHovered, setIsIconHovered] = useState(false);
    const [isPopupHovered, setIsPopupHovered] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Save search config to localStorage
    const saveSearchConfig = useCallback((sources: ExternalSearchSource[], mode: SearchMode, selected?: ExternalSearchSource | null) => {
        const searchConfig: SearchConfig = {
            mode,
            externalSources: sources,
            selectedSource: selected !== undefined ? selected : selectedSearchSource
        };
        setExternalSearchSources(sources);
        setSearchMode(mode);
        if (selected !== undefined) {
            setSelectedSearchSource(selected);
        }
        localStorage.setItem(SEARCH_CONFIG_KEY, JSON.stringify(searchConfig));
    }, [selectedSearchSource]);

    // Handle search mode change
    const handleSearchModeChange = useCallback((mode: SearchMode) => {
        setSearchMode(mode);
        if (mode === 'external' && externalSearchSources.length === 0) {
            const defaultSources = buildDefaultSearchSources();
            saveSearchConfig(defaultSources, mode, defaultSources[0]);
        } else {
            saveSearchConfig(externalSearchSources, mode);
        }
    }, [externalSearchSources, saveSearchConfig]);

    // Handle search source selection
    const handleSearchSourceSelect = useCallback((source: ExternalSearchSource) => {
        setSelectedSearchSource(source);
        saveSearchConfig(externalSearchSources, searchMode, source);
        if (searchQuery.trim()) {
            const searchUrl = source.url.replace('{query}', encodeURIComponent(searchQuery));
            window.open(searchUrl, '_blank');
        }
        setShowSearchSourcePopup(false);
        setHoveredSearchSource(null);
    }, [externalSearchSources, searchMode, searchQuery, saveSearchConfig]);

    // Handle external search
    const handleExternalSearch = useCallback(() => {
        if (searchQuery.trim() && searchMode === 'external') {
            if (externalSearchSources.length === 0) {
                const defaultSources = buildDefaultSearchSources();
                saveSearchConfig(defaultSources, 'external', defaultSources[0]);
                const searchUrl = defaultSources[0].url.replace('{query}', encodeURIComponent(searchQuery));
                window.open(searchUrl, '_blank');
                return;
            }

            let source = selectedSearchSource;
            if (!source) {
                const enabledSources = externalSearchSources.filter(s => s.enabled);
                if (enabledSources.length > 0) {
                    source = enabledSources[0];
                }
            }

            if (source) {
                const searchUrl = source.url.replace('{query}', encodeURIComponent(searchQuery));
                window.open(searchUrl, '_blank');
            }
        }
    }, [searchQuery, searchMode, externalSearchSources, selectedSearchSource, saveSearchConfig]);

    // Restore search config
    const restoreSearchConfig = useCallback((config: SearchConfig) => {
        saveSearchConfig(config.externalSources, config.mode, config.selectedSource);
    }, [saveSearchConfig]);

    // Toggle mobile search
    const toggleMobileSearch = useCallback(() => {
        setIsMobileSearchOpen(prev => !prev);
        if (searchMode !== 'external') {
            handleSearchModeChange('external');
        }
    }, [searchMode, handleSearchModeChange]);

    // Initialize from localStorage
    useEffect(() => {
        const savedSearchConfig = localStorage.getItem(SEARCH_CONFIG_KEY);
        if (savedSearchConfig) {
            try {
                const parsed = JSON.parse(savedSearchConfig) as SearchConfig;
                if (parsed?.mode) {
                    setSearchMode(parsed.mode);
                    setExternalSearchSources(parsed.externalSources || []);
                    if (parsed.selectedSource) {
                        setSelectedSearchSource(parsed.selectedSource);
                    }
                }
            } catch (e) { }
        } else {
            const defaultSources = buildDefaultSearchSources();
            setSearchMode('external');
            setExternalSearchSources(defaultSources);
            setSelectedSearchSource(defaultSources[0] || null);
        }
    }, []);

    // Handle popup visibility with delay
    useEffect(() => {
        if (isIconHovered || isPopupHovered) {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
            setShowSearchSourcePopup(true);
        } else {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
            hideTimeoutRef.current = setTimeout(() => {
                setShowSearchSourcePopup(false);
                setHoveredSearchSource(null);
            }, 100);
        }

        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, [isIconHovered, isPopupHovered]);

    return {
        searchQuery,
        setSearchQuery,
        searchMode,
        externalSearchSources,
        selectedSearchSource,
        showSearchSourcePopup,
        setShowSearchSourcePopup,
        hoveredSearchSource,
        setHoveredSearchSource,
        isIconHovered,
        setIsIconHovered,
        isPopupHovered,
        setIsPopupHovered,
        isMobileSearchOpen,
        setIsMobileSearchOpen,
        handleSearchModeChange,
        handleSearchSourceSelect,
        handleExternalSearch,
        saveSearchConfig,
        restoreSearchConfig,
        toggleMobileSearch
    };
}
