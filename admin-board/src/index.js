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
import * as types from "./redux/types";
import {setAuthorizationHeader} from "./containers/Utils/Util";

dotenv.config();
axios.defaults.baseURL = process.env.REACT_APP_DEV_LOCAL ? process.env.REACT_APP_DATA_SERVER_LOCALHOST : process.env.REACT_APP_DATA_SERVER;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.interceptors.response.use( response => response, error => {
  if (error.response.status === 401) {
    localStorage.clear();
    history.push("/login");
  }
  return Promise.reject(error);
});

// Create history object, redux store
const history = createHistory();
const middleware = composeWithDevTools(applyMiddleware(reduxThunk));
const store = middleware(createStore)(combineReducers({rootReducer}));

// Check if saved jwt token exists
if (localStorage.getItem("token") && localStorage.getItem("user")) {
  setAuthorizationHeader(localStorage.getItem("token"));
  store.dispatch({
    type: types.SET_AUTH,
    data: {
      token: localStorage.getItem("token"),
      user: JSON.parse(localStorage.getItem("user")),
    }
  });
}

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

