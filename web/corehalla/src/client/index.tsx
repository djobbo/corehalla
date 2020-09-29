import React from 'react';
import ReactDOM from 'react-dom';
import { SharedApp } from '../shared';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { SSRProvider } from '../shared/providers/SSRProvider';

const history = createBrowserHistory();

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Router history={history}>
        <SSRProvider>
            {/* TODO: Might cause a problem on the server, since provider is only on the client */}
            <SharedApp />
        </SSRProvider>
    </Router>,
    rootElement,
);
