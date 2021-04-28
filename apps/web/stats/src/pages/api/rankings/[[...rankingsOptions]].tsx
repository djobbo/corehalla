import { fetch1v1RankingsFormat } from '@corehalla/core';
import type { NextApiRequest, NextApiResponse } from 'next';
import { RankedRegion } from '@corehalla/types';
import { Mock1v1Rankings } from '@corehalla/mocks';

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const [bracket, region, page] =
		(req.query?.rankingsOptions as [
			bracket: '1v1' | '2v2',
			region: RankedRegion,
			page: string
		]) || [];
	const playerSearch = req.query?.p as string;

	if (process.env.NODE_ENV === 'production') {
		if (!bracket || !region || !page) {
			// TODO: verify types (bracket = 1v1 | 2v2 etc)
			res.status(400).json({ error: 'Bad Request' });
			return;
		}

		const rankings = await fetch1v1RankingsFormat(process.env.BH_API_KEY, {
			name: playerSearch ?? '',
			region,
			page,
		});

		res.status(200).json(rankings);
		return;
	}

	res.status(200).json(Mock1v1Rankings);
};

// export function getRankingsProps<T extends Bracket>(
// 	bracket: T
// ): GetServerSideProps<
// 	RankingsProps<T>,
// 	{ rankingsOptions: [region: RankedRegion, page: string] }
// > {
// 	return async ({ params, query }) => {
// 		const [region, page] = params?.rankingsOptions || [];

// 		const playerSearch = query.p?.toString() || '';

// 		let rankings: IRanking1v1Format[];

// 		// TODO: Switch Bracket 2v2 1v1power 2v2power

// 		if (process.env.NODE_ENV === 'production') {
// 			rankings = await fetch1v1RankingsFormat(process.env.BH_API_KEY, {
// 				page,
// 				region,
// 				name: playerSearch,
// 			});
// 		} else {
// 			rankings = Mock1v1Rankings;
// 		}

// 		if (!rankings) return { notFound: true };

// 		return {
// 			props: {
// 				bracket,
// 				region: region || 'ALL',
// 				page: page || '1',
// 				playerSearch,
// 				rankings,
// 			},
// 		};
// 	};
// }
