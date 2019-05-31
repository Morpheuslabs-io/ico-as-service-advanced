import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/ie11'; // For IE 11 support
import './polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {createStore, applyMiddleware, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import reduxThunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';
import {Router} from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import rootReducer from './redux/reducers';
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
axios.defaults.baseURL = process.env.REACT_APP_DEV_LOCAL ? process.env.REACT_APP_API_SERVER_LOCALHOST : process.env.REACT_APP_API_SERVER;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Create history object, redux store
const history = createHistory();
const middleware = composeWithDevTools(applyMiddleware(reduxThunk));
const store = middleware(createStore)(combineReducers({rootReducer}));

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App/>
    </Router>
  </Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

