import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useTabs = <T extends string>(tabs: T[], defaultTab: T): [T] => {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<T>((router.query.tab ?? defaultTab) as T);

    useEffect(() => {
        const tabName = (router.query.tab ?? defaultTab) as T;
        const currentTab: T = tabs.includes(tabName) ? tabName : defaultTab;
        setActiveTab(currentTab);
    }, [router.query.tab]);

    return [activeTab];
};
