// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';

interface Props {
    bannerURI: string;
    title: string;
}

const BannerImg = styled.img`
    width: 100%;
    height: 6rem;
    object-fit: cover;
    object-position: center;
`;

const Title = styled.h1`
    color: var(--text);
    font-size: 1.5rem;
    font-weight: 600;
`;

export const ProfileHeader: FC<Props> = ({ bannerURI, title }: Props) => {
    return (
        <div>
            <BannerImg src={bannerURI} alt={`${title}_banner`} />
            <Title>{title}</Title>
        </div>
    );
};
