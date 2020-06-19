import React, { useState, useEffect } from 'react';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import qs from 'qs';
import { history } from '../../history';

import './styles.scss';

import { Loader } from '../../components/Loader';

import { IRankingFormat, IRanking1v1Format, IRanking2v2Format, RankedRegion } from 'corehalla.js';

export const RankingsPage: React.FC = () => {
    const { search } = useLocation();

    const match = useRouteMatch<{
        region: string;
        bracket: string;
        page: string;
    }>('/rankings/:bracket/:region/:page');

    const params = match ? match.params : { bracket: '1v1', region: 'all', page: '1' };

    const [loading, setLoading] = useState(true);
    const [, setError] = useState(false);
    const [rankings, setRankings] = useState<IRankingFormat[]>([]);
    const [region, setRegion] = useState<RankedRegion>((params.region as RankedRegion) || 'all');
    const [bracket, setBracket] = useState<'1v1' | '2v2'>((params.bracket || '1v1') as '1v1' | '2v2');
    const [page] = useState(parseInt(params.page, 10) || 1);

    const [player] = useState((qs.parse(search.substring(1)).p as string) || '');

    const regions: RankedRegion[] = ['us-e', 'eu', 'brz', 'aus', 'us-w', 'sea', 'jpn'];

    useEffect(() => {
        setLoading(true);
        if (process.env.NODE_ENV === 'production') {
            const abortController = new AbortController();
            const signal = abortController.signal;

            fetch(`/api/rankings/${bracket}/${region}/${page}?player=${player}`, { signal })
                .then(async (res) => {
                    const data = await res.json();
                    setRankings(data);
                    setLoading(false);
                })
                .catch(() => {
                    setError(true);
                });

            return () => abortController.abort();
        } else {
            const timeout = setTimeout(async () => {
                const { Rankings } = await import('../../mockups/1v1Rankings');
                setRankings(Rankings);
                setLoading(false);
            }, 250);

            return () => clearTimeout(timeout);
        }
    }, []);

    useEffect(() => {
        history.push(`/rankings/${bracket}/${region}/${page}?p=${player}`);
    }, [bracket, region, page, player]);

    return (
        <div className="RankingsPage">
            {loading ? (
                <Loader />
            ) : (
                <main>
                    <div className="filters-container">
                        <div>
                            <label htmlFor="filter-select">Region</label>
                            <select onChange={(e) => setRegion(e.target.value as RankedRegion)} name="filter-selector">
                                <option value="">Any</option>
                                {regions.map((r, i) => (
                                    <option key={i} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filter-select">Bracket</label>
                            <select
                                onChange={(e) => setBracket(e.target.value as '1v1' | '2v2')}
                                name="filter-selector"
                            >
                                <option value="">1v1</option>
                                <option value="2v2">2v2</option>
                                {/* <option value='Power'>Power</option> */}
                            </select>
                        </div>
                    </div>
                    <div className="rankings-container">
                        {bracket === '1v1' && <Rankings1v1 rankings={rankings as IRanking1v1Format[]} />}
                        {bracket === '2v2' && <Rankings2v2 rankings={rankings as IRanking2v2Format[]} />}
                    </div>
                </main>
            )}
        </div>
    );
};

function Rankings1v1({ rankings }: { rankings: IRanking1v1Format[] }) {
    return (
        <>
            {rankings.map((p, i) => (
                <Rankings1v1Item key={p.id + Math.random()} player={p} i={i} />
            ))}
        </>
    );
}

function Rankings1v1Item({ player, i }: { player: IRanking1v1Format; i: number }) {
    return (
        <div className="card rankings-item" style={{ '--delay': `${0.015 * i}s` } as React.CSSProperties}>
            <p className="stat stat-small rank">{player.rank}</p>
            <p>{player.region}</p>
            <p className="stat name">
                <Link to={`/stats/player/${player.id}`}>{player.name}</Link>
                <span className="stat-desc">(id: {player.id})</span>
            </p>
            <p>{player.tier}</p>
            <p>
                {player.games} ({player.wins}W - {player.games - player.wins}L)
            </p>
            <p>{((player.wins / player.games) * 100).toFixed(1)}%</p>
            <p>{player.rating}</p>
            <p>{player.peak}</p>
        </div>
    );
}

function Rankings2v2({ rankings }: { rankings: IRanking2v2Format[] }) {
    return (
        <>
            {rankings.map((team, i) => (
                <Rankings2v2Item key={Math.random()} team={team} i={i} />
            ))}
        </>
    );
}

function Rankings2v2Item({ team, i }: { team: IRanking2v2Format; i: number }) {
    return (
        <div className="card rankings-item" style={{ '--delay': `${0.015 * i}s` } as React.CSSProperties}>
            <p className="stat stat-medium rank">{team.rank}</p>
            <p>{team.region}</p>
            <p className="stat name">
                <a href={`/stats/player/${team.players[0].id}`}>{team.players[0].name}</a>
                <span className="stat-desc">(id: {team.players[0].id})</span>
            </p>
            <p className="stat name">
                <a href={`/stats/player/${team.players[1].id}`}>{team.players[1].name}</a>
                <span className="stat-desc">(id: {team.players[1].id})</span>
            </p>
            <p>{team.tier}</p>
            <p>
                {team.games} ({team.wins}W - {team.games - team.wins}L)
            </p>
            <p>{((team.wins / team.games) * 100).toFixed(1)}%</p>
            <p>{team.rating}</p>
            <p>{team.peak}</p>
        </div>
    );
}

export default RankingsPage;
