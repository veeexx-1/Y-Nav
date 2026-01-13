import { useState, useCallback } from 'react';
import { LinkItem, Category } from '../types';

interface UseBatchEditProps {
    links: LinkItem[];
    categories: Category[];
    displayedLinks: LinkItem[];
    updateData: (links: LinkItem[], categories: Category[]) => void;
}

export function useBatchEdit({ links, categories, displayedLinks, updateData }: UseBatchEditProps) {
    const [isBatchEditMode, setIsBatchEditMode] = useState(false);
    const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

    const toggleBatchEditMode = useCallback(() => {
        setIsBatchEditMode(prev => !prev);
        setSelectedLinks(new Set()); // Clear selections when exiting
    }, []);

    const toggleLinkSelection = useCallback((linkId: string) => {
        setSelectedLinks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(linkId)) {
                newSet.delete(linkId);
            } else {
                newSet.add(linkId);
            }
            return newSet;
        });
    }, []);

    const handleBatchDelete = useCallback(() => {
        if (selectedLinks.size === 0) {
            alert('请先选择要删除的链接');
            return;
        }

        if (confirm(`确定要删除选中的 ${selectedLinks.size} 个链接吗？`)) {
            const newLinks = links.filter(link => !selectedLinks.has(link.id));
            updateData(newLinks, categories);
            setSelectedLinks(new Set());
            setIsBatchEditMode(false);
        }
    }, [selectedLinks, links, categories, updateData]);

    const handleBatchMove = useCallback((targetCategoryId: string) => {
        if (selectedLinks.size === 0) {
            alert('请先选择要移动的链接');
            return;
        }

        const newLinks = links.map(link =>
            selectedLinks.has(link.id) ? { ...link, categoryId: targetCategoryId } : link
        );
        updateData(newLinks, categories);
        setSelectedLinks(new Set());
        setIsBatchEditMode(false);
    }, [selectedLinks, links, categories, updateData]);

    const handleSelectAll = useCallback(() => {
        const currentLinkIds = displayedLinks.map(link => link.id);

        if (selectedLinks.size === currentLinkIds.length && currentLinkIds.every(id => selectedLinks.has(id))) {
            setSelectedLinks(new Set());
        } else {
            setSelectedLinks(new Set(currentLinkIds));
        }
    }, [displayedLinks, selectedLinks]);

    return {
        isBatchEditMode,
        selectedLinks,
        toggleBatchEditMode,
        toggleLinkSelection,
        handleBatchDelete,
        handleBatchMove,
        handleSelectAll
    };
}
