import * as types from '../types';

const initial_state = {
  type: 'rinkeby'
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_NET:
      return {
        type: action.data
      };

    default:
      return state;
  }
}
