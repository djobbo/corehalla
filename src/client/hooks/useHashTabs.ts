import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useHashTabs = <T extends string>(tabs: T[], defaultTab: T): [T] => {
    const { hash } = useLocation<{ hash: T }>();
    const [activeTab, setActiveTab] = useState<T>(defaultTab);

    useEffect(() => {
        const currentTab: T = tabs.includes(hash as T) ? (hash as T) : defaultTab;
        setActiveTab(currentTab);
    }, [hash]);

    return [activeTab];
};
