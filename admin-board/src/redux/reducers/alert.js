import * as types from '../types';

const initial_state = {
  message: ""
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_ALERT:
      return {
        message: action.data
      };

    default:
      return state;
  }
}
