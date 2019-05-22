import * as types from '../types';

export const setAuth = (auth) => (dispatch, getState) => {
  dispatch({
    type: types.SET_AUTH,
    data: auth
  });
};

export const setAlert = (alert) => (dispatch, getState) => {
  dispatch({
    type: types.SET_ALERT,
    data: alert
  });
};

export const setNet = (net) => (dispatch, getState) => {
  console.log('setNet:', net);
  dispatch({
    type: types.SET_NET,
    data: net
  });
};
