import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { IFavorite } from '../../../util/fetchFavorites';

import './styles.scss';
import { Card } from '../../../components/Card';

interface Props {
    fav: IFavorite;
}

export const FavoriteCard: FC<Props> = ({ fav }: Props) => {
    return (
        <Link to={fav.link}>
            <Card className="favorite-card">
                <p className="name">{fav.name}</p>
                <p className="id">id: {fav.id}</p>
                <img src={fav.thumbURI} alt={fav.name} />
            </Card>
        </Link>
    );
};
