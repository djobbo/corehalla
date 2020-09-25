import React from 'react';
import { renderToString } from 'react-dom/server';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

import { SharedApp } from '../shared';

const apiCacheControl = `public, max-age=180, s-maxage=240`;

export const renderApp = (req, res) => {
    res.set('Cache-Control', apiCacheControl);

    const html = renderToString(
        <Router history={history}>
            <SharedApp />
        </Router>,
    );
    res.send(html);
};
