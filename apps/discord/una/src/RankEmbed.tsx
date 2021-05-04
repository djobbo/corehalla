import { IPlayerStatsFormat } from '@corehalla/types';
import {
    Author,
    Break,
    Description,
    EmbedWrapper,
    Field,
    React,
    Span,
    Timestamp,
    Title,
    Wrapper,
} from 'fancy-discord.js/lib/Embeds';

interface Props {
    type: 'stats' | 'ranked';
    playerStats: IPlayerStatsFormat;
    iconUrl?: string | null;
}

export const RankEmbed = ({ playerStats: { name, season, wins, games }, iconUrl, type }: Props): EmbedWrapper => {
    return (
        <Wrapper>
            <Title>
                {type === 'stats' ? '📈' : '🥇'} {name}
            </Title>
            <Author name="Corehalla" iconURL={iconUrl ?? undefined} />
            <Description>
                React with {type === 'ranked' ? '📈 to view general stats' : '🥇 to view current season stats'}
            </Description>
            {type === 'ranked' ? (
                <Wrapper>
                    <Field title="Region" inline>
                        {season.region}
                    </Field>
                    <Field title="1v1 Rating" inline>
                        {/* FIXME: allow numbers */}
                        <Span bold>{season.tier}</Span> ({season.rating.toString()} / {season.peak.toString()} Peak)
                        <Break />
                        {season.wins.toString()} Wins / {(season.games - season.wins).toString()} Losses (
                        {season.games.toString()} Games)
                        <Break />
                        {(season.wins / season.games).toFixed(2)}% Winrate
                    </Field>
                </Wrapper>
            ) : (
                <Field title="Games">
                    {wins.toString()} Wins / {(games - wins).toString()} Losses ({games.toString()} Games)
                    <Break />
                    {(wins / season.games).toFixed(2)}% Winrate
                </Field>
            )}
            <Timestamp timestamp={Date.now()} />
            {/* FIXME: <Url>asdas</Url> */}
        </Wrapper>
    );
};
