// Library imports
import { PropsWithChildren, useEffect, useState } from 'react';

// Components imports
import { AppBar } from '@components/AppBar';
import { SideNav } from '@components/SideNav';
import { Page } from '@components/Page';
import { useTabs } from '@hooks/useTabs';

interface ITab<Chip extends string> {
	displayName?: string;
	chips: { [k in Chip]: string };
	defaultChip?: Chip;
	link?: string;
}

interface Props<
	Tabs extends { [k in Tab]: ITab<keyof Tabs[k]['chips'] & string> },
	Tab extends keyof Tabs
> {
	tabs: Tabs;
	title: string;
	loading?: boolean;
	onActiveChipChanged?: (chip: keyof Tabs[Tab]['chips'] & string) => void;
}

export function MainLayout<
	Tabs extends { [k in Tab]: ITab<keyof Tabs[k]['chips'] & string> },
	Tab extends keyof Tabs & string
>({
	tabs,
	title,
	children,
	onActiveChipChanged,
}: PropsWithChildren<Props<Tabs, Tab>>) {
	const [activeTab] = useTabs(
		Object.keys(tabs) as Tab[],
		Object.keys(tabs)[0] as Tab
	);

	const [activeChip, setActiveChip] = useState(
		tabs[activeTab].defaultChip ?? null
	);

	useEffect(() => {
		onActiveChipChanged?.(activeChip);
	}, [activeChip]);

	return (
		<>
			<div>
				<AppBar
					tabs={(Object.entries(tabs) as [
						Tab,
						ITab<keyof Tabs[Tab]['chips'] & string>
					][]).map(([tabName, { displayName, link }]) => ({
						displayName: displayName || tabName,
						link: link || `#${tabName}`,
						active: activeTab === tabName,
					}))}
					chips={(Object.entries(tabs[activeTab]?.chips) as [
						keyof Tabs[Tab]['chips'] & string,
						string
					][])?.map(([chipName, displayName]) => ({
						displayName: displayName || chipName,
						active: activeChip === chipName,
						action: () => setActiveChip(chipName),
					}))}
					title={title}
				/>
				<Page>
					<main>{children}</main>
				</Page>
			</div>
			<SideNav />
		</>
	);
}
