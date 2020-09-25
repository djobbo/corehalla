import React from 'react';
import { renderToString } from 'react-dom/server';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

import { SharedApp } from '../shared';

const htmlWrapper = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <link rel="icon" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/favicon.png" />

        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="#212121" name="theme-color" />
        <meta content="Corehalla - Brawlhalla Stats & Rankings" name="description" />

        <title>Corehalla</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik:400,600,700&display=swap" />
        <link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials" />
        <link rel="stylesheet" href="/assets/styles/styles.css" />
        <script defer src="/assets/js/bundle.js"></script>
    </head>
    <body>
        <noscript>You need to enable JavaScript to access Corehalla.</noscript>
        <div id="root"><!-- ### App ### --></div>
        <script>
            /* window.addEventListener('load', async () => {
                if ('serviceWorker' in navigator) {
                    try {
                        await navigator.serviceWorker.register('./worker.js');
                    } catch (e) {
                        console.error('Service Worker registration failed.');
                    }
                }
            }); */
        </script>
    </body>
</html>
`;

const apiCacheControl = `public, max-age=180, s-maxage=240`;

export const renderApp = (req, res) => {
    res.set('Cache-Control', apiCacheControl);

    const html = htmlWrapper.replace(
        '<!-- ### App ### -->',
        renderToString(
            <Router history={history}>
                <SharedApp />
            </Router>,
        ),
    );
    res.send(html);
};
