import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useHashTabs = <T extends string>(tabs: T[], defaultTab: T): [T] => {
    const { hash } = useLocation<{ hash: T }>();
    const tabName = hash.substring(1) as T;
    const [activeTab, setActiveTab] = useState<T>(tabs.includes(tabName) ? tabName : defaultTab);

    useEffect(() => {
        const tabName = hash.substring(1) as T;
        const currentTab: T = tabs.includes(tabName) ? tabName : defaultTab;
        setActiveTab(currentTab);
    }, [hash]);

    return [activeTab];
};
