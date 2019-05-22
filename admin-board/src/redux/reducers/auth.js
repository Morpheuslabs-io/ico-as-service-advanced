import * as types from '../types';

const initial_state = {
  token: null
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_AUTH:
      return {
        ...state,
        ...action.data
      };

    default:
      return state;
  }
}
