import type { IRanking1v1Format } from 'corehalla';
import { motion } from 'framer-motion';
// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';
import { SectionSeparator } from '../../components/PageSection';

// Components imports
import { RankingsItem1v1 } from '../../components/RankingsItem';

interface Props {
    rankings: IRanking1v1Format[];
}

const Wrapper = styled.div`
    margin: 0 1rem;
`;

export const Rankings1v1Tab: FC<Props> = ({ rankings }: Props) => {
    return (
        <Wrapper>
            {rankings.map((player, i) => (
                <motion.div layout key={player.id}>
                    {i !== 0 && <SectionSeparator />}
                    <RankingsItem1v1 key={i} player={player} />
                </motion.div>
            ))}
        </Wrapper>
    );
};
