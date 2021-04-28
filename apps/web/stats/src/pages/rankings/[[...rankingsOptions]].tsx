import { GetServerSideProps } from 'next';
import type { IRanking1v1Format, RankedRegion } from 'corehalla';
import { fetch1v1RankingsFormat } from '@api';
import { Mock1v1Rankings } from '@api/mocks/1v1Rankings';
import { LegendsTab } from '@layout/pages/stats/PlayerStats_LegendsTab';
import { OverviewTab } from '@layout/pages/stats/PlayerStats_OverviewTab';
import { TeamsTab } from '@layout/pages/stats/PlayerStats_TeamsTab';
import { TabLayout } from '@layout/TabLayout';
import Head from 'next/head';
import { Rankings1v1Tab } from '@layout/pages/rankings/Rankings_1v1Tab';

export interface Props {
	bracket: Bracket;
	region: RankedRegion;
	page: string;
	playerSearch: string;
	rankings: IRanking1v1Format[];
}

type Bracket = '1v1' | '2v2' | 'power1v1' | 'power2v2'; // TODO: move this to @types

export interface IRankingsTabs {
	'1v1': RankedRegion | 'all';
	'2v2': RankedRegion | 'all';
	power1v1: null;
	power2v2: null;
}

export default function RankingsPage({
	rankings,
	bracket,
	page,
	region,
	playerSearch,
}: Props) {
	return (
		<>
			<Head>
				<title>
					{region}-{bracket} Rankings | Page {page} • Corehalla
				</title>
			</Head>
			<TabLayout<
				'1v1',
				{
					'1v1': [
						(
							| 'all'
							| 'US-E'
							| 'EU'
							| 'SEA'
							| 'BRZ'
							| 'AUS'
							| 'US-W'
							| 'JPN'
						),
						null
					];
				}
			>
				title={
					`${region}-${bracket} Rankings | Page ${page} • Corehalla` ??
					'Corehalla'
				}
				tabs={{
					'1v1': {
						displayName: '1v1',
						chips: {
							all: 'Global',
							'US-E': null,
							EU: null,
							SEA: null,
							BRZ: null,
							AUS: null,
							'US-W': null,
							JPN: null,
						},
						defaultChip: 'all',
						link: `/rankings/${bracket}/${region}/${page}${
							playerSearch ? `?p=${playerSearch}` : ''
						}`,
						component: Rankings1v1Tab({
							region,
							page,
							playerSearch,
							rankings,
						}),
						sortOptions: null,
						defaultSort: null,
					},
				}}
			/>
		</>
	);
}

export const getServerSideProps: GetServerSideProps<
	Props,
	{ rankingsOptions: [bracket: Bracket, region: RankedRegion, page: string] }
> = async ({ params, query }) => {
	const [bracket, region, page] = params?.rankingsOptions || [];

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
			bracket: bracket || '1v1',
			region: region || 'ALL',
			page: page || '1',
			playerSearch,
			rankings,
		},
	};
};
