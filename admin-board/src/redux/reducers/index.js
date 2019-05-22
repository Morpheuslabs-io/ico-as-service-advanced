import { combineReducers } from 'redux';

import auth from './auth';
import alert from './alert';
import token from './token';
import net from './net';

import wizard from './wizard';
import step1 from './step1';
import step2 from './step2';
import step3 from './step3';
import step5 from './step5';
import error from './error';
import deploy from './deploy';

export default combineReducers({
  auth,
  alert,
  net,
  token,
  wizard,
  step1,
  step2,
  step3,
  step5,
  error,
  deploy
});
