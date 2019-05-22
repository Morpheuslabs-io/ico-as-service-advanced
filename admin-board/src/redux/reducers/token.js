import * as types from '../types';

const initial_state = {
  name: "",
  symbol: "",
  decimals: 0,
  totalSupply: 0,
  ownerAddress: "",
  mintingFinished: false,
  releaseAgent: "",
  mincap: "",
  token: ""
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_TOKEN:
      return {
        ...state,
        ...action.data
      };

    default:
      return state;
  }
}
