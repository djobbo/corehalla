// Library imports
import React, { FC, PropsWithChildren, useContext } from 'react';
import styled from 'styled-components';
import { FavoritesContext, IFavorite } from '../providers/FavoritesProvider';

interface Props {
    bannerURI: string;
    title: string;
    favorite: IFavorite;
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
    display: block;
`;

const AddToFavoritesBtn = styled.a<{ isFav?: boolean }>`
    text-transform: uppercase;
    color: var(--accent);
    font-weight: bold;

    ${({ isFav }) =>
        isFav &&
        `
        color: var(--text-2);
    `}
`;

const DescriptionContainer = styled.div`
    margin: 1rem 0;
`;

export const ProfileHeader: FC<PropsWithChildren<Props>> = ({
    bannerURI,
    title,
    favorite,
    children,
}: PropsWithChildren<Props>) => {
    const { isFavorite, addFavorite, removeFavorite } = useContext(FavoritesContext);

    return (
        <div>
            <BannerImg src={bannerURI} alt={`${title}_banner`} />
            <Title>{title}</Title>

            {isFavorite(favorite) ? (
                <AddToFavoritesBtn
                    href="#"
                    onClick={() => {
                        removeFavorite(favorite);
                    }}
                    isFav={true}
                >
                    Remove Favorite
                </AddToFavoritesBtn>
            ) : (
                <AddToFavoritesBtn
                    href="#"
                    onClick={() => {
                        addFavorite(favorite);
                    }}
                >
                    Add Favorite
                </AddToFavoritesBtn>
            )}
            <DescriptionContainer>{children}</DescriptionContainer>
        </div>
    );
};
