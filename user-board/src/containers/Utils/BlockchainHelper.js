import swal from "sweetalert2";
import Web3 from "web3";

import {getNormalGasPrice} from "./Util";

import CROWDSALE_TOKEN_CONTRACT from "../../artifacts/CrowdsaleTokenExt";
import MINTED_TOKEN_CAPPED_CROWDSALE_EXT_CONTRACT from '../../artifacts/MintedTokenCappedCrowdsaleExt';
import FLAT_PRICING_CONTRACT from '../../artifacts/FlatPricingExt';

let _web3 = null;
if (typeof(window.web3) !== 'undefined') {
  _web3 = window.web3;
}
let web3 = new Web3(_web3.currentProvider);
let crowdsaleTokenContract = web3.eth.contract(CROWDSALE_TOKEN_CONTRACT.abi);
let mintedTokenCappedCrowdsaleExtContract = web3.eth.contract(MINTED_TOKEN_CAPPED_CROWDSALE_EXT_CONTRACT.abi);
let flatPricingContract = web3.eth.contract(FLAT_PRICING_CONTRACT.abi);

const GAS = process.env.REACT_APP_GAS;
const GASPRICE = process.env.REACT_APP_GAS_PRICE;

// promisify(cb => contractX.transferOwnership(wallet_address, gasOpt, cb));
export const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  );

export const getMetamaskAddress = () => {
  if (_web3 != null) {
    let w = new Web3(_web3.currentProvider);
    if (w.eth.accounts.length > 0) {
      return w.eth.accounts[0];
    } else {
      return null;
    }
  } else {
    swal("Please install your metamask", "", "warning");
    return null;
  }
};

export const isValidAddress = (address) => {
  if (_web3 != null) {
    let w = new Web3(_web3.currentProvider);
    return w.isAddress(address);
  } else
    return false;
};

export const balanceOfToken = (tokenAddress, investorAddress) => {
  const instance = crowdsaleTokenContract.at(tokenAddress);
  return new Promise((resolve, reject) => instance.balanceOf(investorAddress, (err, res) => {
    if (err) return reject(err);
    else return resolve(Number(res));
  }));
};

export const getInvestmentStatus = async (addresses) => {
  const wallet = getMetamaskAddress();
  const promises = [];
  for (const address of addresses) {
    const instance = mintedTokenCappedCrowdsaleExtContract.at(address);
     promises.push(new Promise((resolve, reject) => instance.investedAmountOf(wallet, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    })));
  }

  return Promise.all(promises).then(data => {
    let weiAmount = 0;
    for (let i = 0; i < data.length; i++) {
      weiAmount += Number(data[i]);
    }
    return weiAmount;
  });
};

export const updateStartTime = (crowdsaleAddress, dateTime) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  return new Promise((resolve, reject) => instance.setStartsAt(dateTime, gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  // });
};

export const formatAddress = (addr) => {
  return (addr.substring(0,20) + '...')
}

export const getTokenDetails = (tokenAddress) => {
  const instance = crowdsaleTokenContract.at(tokenAddress);
  const name = new Promise((resolve, reject) => instance.name((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const symbol = new Promise((resolve, reject) => instance.symbol((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const decimals = new Promise((resolve, reject) => instance.decimals((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const totalSupply = new Promise((resolve, reject) => instance.totalSupply((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const owner = new Promise((resolve, reject) => instance.owner((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const mintingFinished = new Promise((resolve, reject) => instance.mintingFinished((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const minCap = new Promise((resolve, reject) => instance.minCap((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));

  return Promise.all([name, symbol, decimals, totalSupply, owner, mintingFinished, minCap]).then(data => {
    return {
      name: data[0],
      symbol: data[1],
      decimals: Number(data[2]),
      totalSupply: Number(data[3]),
      ownerAddress: data[4],
      mintingFinished: data[5],
      mincap: Number(data[6]),
    };
  });
};

export const getCrowdsaleDetails = async (crowdsaleAddress) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  const name = new Promise((resolve, reject) => instance.name((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const startsAt = new Promise((resolve, reject) => instance.startsAt((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const endsAt = new Promise((resolve, reject) => instance.endsAt((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const halted = new Promise((resolve, reject) => instance.halted((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const finalized = new Promise((resolve, reject) => instance.finalized((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const supply = new Promise((resolve, reject) => instance.maximumSellableTokens((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const tokensSold = new Promise((resolve, reject) => instance.tokensSold((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));

  return Promise.all([name, startsAt, endsAt, halted, finalized, supply, tokensSold]).then(data => {
    return {
      name: data[0],
      startsAt: Number(data[1]),
      endsAt: Number(data[2]),
      halted: data[3],
      finalized: data[4],
      supply: Number(data[5]),
      tokensSold: Number(data[6]),
      address: crowdsaleAddress,
    };
  });
};

export const getPricingStrategyDetails = (pricingAddress) => {
  const instance = flatPricingContract.at(pricingAddress);
  const rate = new Promise((resolve, reject) => instance.oneTokenInWei((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));

  return Promise.all([rate]).then(data => {
    return {
      rate: Number(data[0]),
    };
  });
};

export const buyTokens = (crowdsaleAddress, amount) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const weiAmount = web3.toWei(amount, 'ether');
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress(),
    value: weiAmount
  };

  return new Promise((resolve, reject) => instance.buy(gasOpt, (err, res) => {
    if (err) return reject(err);
    else {
      const invested = instance.Invested({investor: getMetamaskAddress()});
      return resolve(new Promise((resolve, reject) => invested.watch((err, res) => {
        if (err) return reject(err);
        else return resolve(res);
      })));
    }
  }));
  // });
};
