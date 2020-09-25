import React from 'react';
import ReactDOM from 'react-dom';
import { SharedApp } from '../shared';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Router history={history}>
        <SharedApp />
    </Router>,
    rootElement,
);
