import { IRanking2v2Format } from 'corehalla.js';
import { motion } from 'framer-motion';
// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';
import { SectionSeparator } from '../../components/PageSection';

// Components imports
import { RankingsItem2v2 } from '../../components/RankingsItem';

interface Props {
    rankings: IRanking2v2Format[];
}

const Wrapper = styled.div`
    margin: 0 1rem;
`;

export const Rankings2v2Tab: FC<Props> = ({ rankings }: Props) => {
    return (
        <Wrapper>
            {rankings.map((team, i) => (
                <motion.div layout key={`${team.players[0].id}+${team.players[1].id}`}>
                    <SectionSeparator />
                    <RankingsItem2v2 key={i} team={team} />
                </motion.div>
            ))}
        </Wrapper>
    );
};
