import styles from '~styles/Layout.module.scss';
// Library imports
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

// Components imports
import { AppBar } from '@AppBar';
import { useTabs } from '~hooks/useTabs';
import { Layout } from './Layout';

export type ITabComponent<Chip extends string, Sort extends string> = (
    active: boolean,
    activeChip: Chip,
    activeSort: Sort,
) => ReactNode;

interface ITab<Chip extends string, Sort extends string> {
    displayName: string;
    link: string;
    component: ITabComponent<Chip, Sort>;
    chips: { [k in Chip]: string } | null;
    defaultChip: Chip;
    sortOptions: { [k in Sort]: string } | null;
    defaultSort: Sort;
}

interface Props<TabName extends string, Tabs extends { [k in TabName]: [Chips: string, SortOptions: string] }> {
    tabs: {
        [k in TabName]: ITab<Tabs[k][0], Tabs[k][1]>;
    };
    title: string;
    loading?: boolean;
}

export function TabLayout<
    TabName extends string,
    Tabs extends { [k in TabName]: [Chips: string, SortOptions: string] }
>({ tabs, title }: PropsWithChildren<Props<TabName, Tabs>>): JSX.Element {
    const [activeTab] = useTabs(Object.keys(tabs) as TabName[], Object.keys(tabs)[0] as TabName);

    const [activeChip, setActiveChip] = useState(tabs[activeTab].defaultChip ?? null);

    const [activeSort, setActiveSort] = useState(tabs[activeTab].defaultSort ?? null);

    useEffect(() => {
        setActiveChip(tabs[activeTab].defaultChip ?? null);
    }, [activeTab]);

    return (
        <Layout>
            <AppBar
                tabs={(Object.entries(tabs) as [TabName, ITab<Tabs[TabName][0], Tabs[TabName][1]>][]).map(
                    ([tabName, { displayName, link }]) => ({
                        displayName: displayName || tabName,
                        link: link || `#${tabName}`,
                        active: activeTab === tabName,
                    }),
                )}
                chips={
                    tabs[activeTab]?.chips &&
                    (Object.entries(tabs[activeTab]?.chips) as [Tabs[TabName][0], string][])?.map(
                        ([chipName, displayName]) => ({
                            displayName: displayName || chipName,
                            active: activeChip === chipName,
                            action: () => setActiveChip(chipName),
                        }),
                    )
                }
                sort={
                    tabs[activeTab].sortOptions
                        ? {
                              options: Object.entries(tabs[activeTab].sortOptions) as [
                                  Tabs[TabName][1] & string,
                                  string,
                              ][],
                              action: setActiveSort,
                          }
                        : null
                }
                title={title}
            />
            <main className={styles.container}>
                {(Object.entries(tabs) as [
                    TabName,
                    ITab<Tabs[TabName][0], Tabs[TabName][1]>,
                ][]).map(([tabName, { component }]) => component(tabName === activeTab, activeChip, activeSort))}
            </main>
        </Layout>
    );
}
