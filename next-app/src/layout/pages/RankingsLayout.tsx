import Head from 'next/head';
import type { Weapon, IRanking1v1Format, RankedRegion } from 'corehalla';

import { MainLayout } from '@layout';

import { GetServerSideProps } from 'next';
import { fetch1v1RankingsFormat } from '@api';
import { PropsWithChildren } from 'react';
import { Mock1v1Rankings } from '@api/mocks/1v1Rankings';

type Bracket = '1v1' | '2v2' | 'power1v1' | 'power2v2';

export interface IRankingsTabs {
	'1v1': RankedRegion | 'all';
	'2v2': RankedRegion | 'all';
	power1v1: null;
	power2v2: null;
}

export interface RankingsProps<T extends Bracket> {
	bracket: T;
	region: RankedRegion;
	page: string;
	playerSearch: string;
	rankings: IRanking1v1Format[];
	onActiveChipChanged?: (chip: IRankingsTabs[T]) => void;
}

const regionChips = {
	all: 'Global',
	'US-E': null,
	EU: null,
	SEA: null,
	BRZ: null,
	AUS: null,
	'US-W': null,
	JPN: null,
};

export function RankingsLayout<T extends Bracket>({
	bracket,
	page,
	region,
	children,
	onActiveChipChanged,
}: PropsWithChildren<RankingsProps<T>>) {
	return (
		<>
			<Head>
				<title>
					{bracket}-{region} Rankings - Page {page} • Corehalla
				</title>
			</Head>
			<MainLayout
				title={
					`${bracket}-${region} Rankings - Page ${page} • Corehalla` ??
					'Corehalla'
				}
				tabs={{
					'1v1': {
						displayName: '1v1',
						link: `/rankings/1v1/${region}`,
						chips: regionChips,
					},
					'2v2': {
						displayName: '2v2',
						link: `/rankings/2v2/${region}`,
						chips: regionChips,
					},
				}}
				onActiveChipChanged={onActiveChipChanged}
			>
				{children}
			</MainLayout>
		</>
	);
}

export function getRankingsProps<T extends Bracket>(
	bracket: T
): GetServerSideProps<
	RankingsProps<T>,
	{ rankingsOptions: [region: RankedRegion, page: string] }
> {
	return async ({ params, query }) => {
		const [region, page] = params?.rankingsOptions || [];

		const playerSearch = query.p?.toString() || '';

		let rankings: IRanking1v1Format[];

		// TODO: Switch Bracket 2v2 1v1power 2v2power

		if (process.env.NODE_ENV === 'production') {
			rankings = await fetch1v1RankingsFormat(process.env.BH_API_KEY, {
				page,
				region,
				name: playerSearch,
			});
		} else {
			rankings = Mock1v1Rankings;
		}

		if (!rankings) return { notFound: true };

		return {
			props: {
				bracket,
				region: region || 'ALL',
				page: page || '1',
				playerSearch,
				rankings,
			},
		};
	};
}
