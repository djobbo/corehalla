import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import { SharedApp } from '../shared';

const apiCacheControl = `public, max-age=180, s-maxage=240`;

export const renderApp = (req, res) => {
    res.set('Cache-Control', apiCacheControl);

    const html = renderToString(
        <StaticRouter location={req.url}>
            <SharedApp />
        </StaticRouter>,
    );
    res.send(html);
};
