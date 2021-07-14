import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useTabs = <T extends string>(tabs: T[], defaultTab: T): [T] => {
    const { query } = useRouter();

    const [activeTab, setActiveTab] = useState<T>((query.tab ?? defaultTab) as T);

    useEffect(() => {
        const tabName = (query.tab ?? defaultTab) as T;
        const currentTab: T = tabs.includes(tabName) ? tabName : defaultTab;
        setActiveTab(currentTab);
    }, [query.tab]);

    return [activeTab];
};
