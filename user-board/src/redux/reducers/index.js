import { combineReducers } from 'redux';

import auth from './auth';
import alert from './alert';
import net from './net';

export default combineReducers({
  auth,
  alert,
  net
});
