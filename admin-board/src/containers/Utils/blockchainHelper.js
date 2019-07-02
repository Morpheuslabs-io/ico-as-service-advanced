import swal from "sweetalert2";
import Web3 from "web3";

import {getNormalGasPrice} from "./Util";

import CROWDSALE_TOKEN_CONTRACT from "../../artifacts/CrowdsaleTokenExt";
import MINTED_TOKEN_CAPPED_CROWDSALE_EXT_CONTRACT from '../../artifacts/MintedTokenCappedCrowdsaleExt';
import FLAT_PRICING_CONTRACT from '../../artifacts/FlatPricingExt';

import AIRDROP_CONTRACT from '../../artifacts/Airdrop';

// let _web3 = null;
// if (typeof(window.web3) !== 'undefined') {
//   _web3 = window.web3;
// }

let web3 = null;
if (typeof(window.web3) !== 'undefined') {
  web3 = new Web3(window.web3.currentProvider);
}

// let web3 = new Web3(_web3.currentProvider);
let crowdsaleTokenContract = web3.eth.contract(CROWDSALE_TOKEN_CONTRACT.abi);
let mintedTokenCappedCrowdsaleExtContract = web3.eth.contract(MINTED_TOKEN_CAPPED_CROWDSALE_EXT_CONTRACT.abi);
let flatPricingContract = web3.eth.contract(FLAT_PRICING_CONTRACT.abi);

let airdropContract = web3.eth.contract(AIRDROP_CONTRACT.abi);

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
  try {
    let addr = web3 !== null ? web3.eth.accounts[0] : null
    console.log(`getMetamaskAddress: ${addr}`);
    return addr
  } catch (err) {
    return null
  }
};

export const preCheckMetaMask = async () => {
  if (!web3) {
    swal("Metamask is not available. Please install Metamask extension and sign in.", "", "warning");
  }

  const isMetamaskApproved = await window.ethereum._metamask.isApproved();
  if (!isMetamaskApproved) {
    try {
      await window.ethereum.enable();
    } catch (e) {
      // User denied access
      swal("Please allow Metamask", "", "warning");
      return;
    }
  }
  
  // console.log('web3.version:', web3.version.network);

  web3.eth.getAccounts(function (error, accounts) {
    if (error) {
      swal("Cannot access Metamask account", "", "warning");
    }
    if (accounts.length === 0) {
      swal("Please sign in Metamask account", "", "warning");
    } else {
      console.log(`preCheckMetaMask - OK (current account:${accounts[0]})`);
    }
  })
}

export const getNetworkName = () => {
  let networkId
  try {
    networkId = web3.version.network
  } catch (err) {
    console.log('getNetworkName - Error:', err);
    return ""
  }
  
  let networkName = ""

  switch (networkId) {
    case "1":
      networkName = "Mainnet";
      break;
    case "2":
    networkName = "Morden";
    break;
    case "3":
      networkName = "Ropsten";
      break;
    case "4":
      networkName = "Rinkeby";
      break;
    case "42":
      networkName = "Kovan";
      break;
    default:
      networkName = "Unknown";
  }

  return networkName
}

export const isContractOwner = (contractOwner) => {
  let curSignInAddr = getMetamaskAddress()
  if (curSignInAddr !== contractOwner) {
    swal(`Currently-signed-in address (${curSignInAddr.substring(0,10)} ...) is not contract owner`, "", "error");
    return false;
  } else {
    return true;
  }
}

export const isUiEnabled = (uiConfigData, uiName) => {
  if (uiConfigData.indexOf(uiName.toLowerCase()) === -1) {
    swal(`${uiName.toUpperCase()} is not enabled`, "", "warning");
    return false;
  } else {
    return true;
  }
}

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
  const releaseAgent = new Promise((resolve, reject) => instance.releaseAgent((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const minCap = new Promise((resolve, reject) => instance.minCap((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));

  return Promise.all([name, symbol, decimals, totalSupply, owner, mintingFinished, releaseAgent, minCap]).then(data => {
    return {
      name: data[0],
      symbol: data[1],
      decimals: Number(data[2]),
      totalSupply: Number(data[3]),
      ownerAddress: data[4],
      mintingFinished: data[5],
      releaseAgent: data[6],
      mincap: Number(data[7]),
    };
  });
};

export const isValidAddress = (address) => {
  if (typeof(window.web3) !== 'undefined') {
    web3 = window.web3;
  }
  if (web3 != null) {
    let w = new Web3(web3.currentProvider);
    return w.isAddress(address);
  } else
    return false;
};

export const validMetamask = () => {
  if (typeof(window.web3) !== 'undefined') {
    web3 = window.web3;
  }
  if (typeof web3 === 'undefined' || web3 === null) {
    return 0;
  } else {
    const account = web3.eth.accounts[0];
    if (!account) {
      return 1;
    }
    return 2;
  }
}

export const transferOwnershipOfToken = (tokenAddress, toAddress) => {
  const instance = crowdsaleTokenContract.at(tokenAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  return new Promise((resolve, reject) => instance.transferOwnership(toAddress, gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  // });
};

export const balanceOfToken = (tokenAddress, investorAddress) => {
  const instance = crowdsaleTokenContract.at(tokenAddress);
  return new Promise((resolve, reject) => instance.balanceOf(investorAddress, (err, res) => {
    if (err) return reject(err);
    else return resolve(Number(res));
  }));
};

export const claimTokens = (tokenAddress, claimTokenAddress) => {
  const instance = crowdsaleTokenContract.at(tokenAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  return new Promise((resolve, reject) => instance.claimTokens(claimTokenAddress, gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  // });
};

export const getCrowdsaleInst = async (crowdsaleAddress) => {
  const instance = await mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  return instance;
}

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
  const multisigWallet = new Promise((resolve, reject) => instance.multisigWallet((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const minimumFundingGoal = new Promise((resolve, reject) => instance.minimumFundingGoal((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const isWhiteListed = new Promise((resolve, reject) => instance.isWhiteListed((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const isMinimumGoalReached = new Promise((resolve, reject) => instance.isMinimumGoalReached((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const isCrowdsaleFull = new Promise((resolve, reject) => instance.isCrowdsaleFull((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const investorCount = new Promise((resolve, reject) => instance.investorCount((err, res) => {
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
  const canDistributeReservedTokens = new Promise((resolve, reject) => instance.canDistributeReservedTokens((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const areReservedTokensDistributed = new Promise((resolve, reject) => instance.areReservedTokensDistributed((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const supply = new Promise((resolve, reject) => instance.maximumSellableTokens((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const weiRaised = new Promise((resolve, reject) => instance.weiRaised((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const tokensSold = new Promise((resolve, reject) => instance.tokensSold((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  const owner = new Promise((resolve, reject) => instance.owner((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));

  return Promise.all([name, startsAt, endsAt, multisigWallet, minimumFundingGoal, isWhiteListed, isMinimumGoalReached,
    isCrowdsaleFull, investorCount, halted, finalized, canDistributeReservedTokens, areReservedTokensDistributed, supply, weiRaised, tokensSold, owner]).then(data => {
    return {
      name: data[0],
      startsAt: Number(data[1]),
      endsAt: Number(data[2]),
      multisigWallet: data[3],
      minimumFundingGoal: Number(data[4]),
      isWhiteListed: data[5],
      isMinimumGoalReached: data[6],
      isCrowdsaleFull: data[7],
      investorCount: Number(data[8]),
      halted: data[9],
      finalized: data[10],
      canDistributeReservedTokens: data[11],
      areReservedTokensDistributed: data[12],
      supply: Number(data[13]),
      weiRaised: Number(data[14]),
      tokensSold: Number(data[15]),
      owner: data[16]
    };
  });
};

export const getPricingStrategyDetails = (pricingAddress) => {
  console.log(`getPricingStrategyDetails: ${pricingAddress}`);
  const instance = flatPricingContract.at(pricingAddress);
  const rate = new Promise((resolve, reject) => instance.oneTokenInWei((err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));

  return Promise.all([rate]).then(data => {
    return {
      oneTokenInWei: Number(data[0]),
    };
  });
};

export const doAirdrop = (erc20Address, airdropAddress, addresses, amounts) => {
  const instance = airdropContract.at(airdropAddress);

  const gasOpt = {
    from: getMetamaskAddress()
  };
  
  console.log('doAirdrop - erc20Address:', erc20Address, ', airdropAddress:', airdropAddress, ', addresses:', addresses, ', amounts:', amounts, ', gasOpt:', gasOpt);
  
  return new Promise((resolve, reject) => instance.doAirDrop(erc20Address, amounts, addresses, gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
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

export const updateEndTime = (crowdsaleAddress, dateTime) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  return new Promise((resolve, reject) => instance.setEndsAt(dateTime, gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  // });
};

export const updateRate = (crowdsaleAddress, rate) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  return new Promise((resolve, reject) => instance.updateRate(rate, gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  // });
};

export const updateHaltStatus = (crowdsaleAddress, state) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  if (state) {
    return new Promise((resolve, reject) => instance.halt(gasOpt, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    }));
  } else {
    return new Promise((resolve, reject) => instance.unhalt(gasOpt, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    }));
  }
  // });
};

export const updateBeneficiary = (crowdsaleAddresses, newAddr) => {
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  let promises = [];
  for (const crowdsaleAddress of crowdsaleAddresses) {
    const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
    promises.push(new Promise((resolve, reject) => instance.setMultisig(newAddr, gasOpt, (err, res) => {
        if (err) return reject(err);
        else return resolve(res);
      }))
    );
  }
  return Promise.all(promises).then(() => true);
  // });
};

export const finazlieCrowdsale = (crowdsaleAddress) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  return new Promise((resolve, reject) => instance.finalize(gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  // });
};

export const addWhitelist = (crowdsaleAddress, whitelist) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  console.log('whitelist:', whitelist);
  return new Promise((resolve, reject) => instance.setEarlyParticipantWhitelist(whitelist.w_address, true, whitelist.w_min, whitelist.w_max, gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  // });
};

export const setWhiteListMultiple = (crowdsaleAddress, whitelist, status, minCap, maxCap) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  return new Promise((resolve, reject) => instance.setEarlyParticipantWhitelistMultiple(whitelist, status, minCap, maxCap, gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  // });
};

export const distributeReservedToken = (crowdsaleAddress) => {
  const instance = mintedTokenCappedCrowdsaleExtContract.at(crowdsaleAddress);
  // return getNormalGasPrice().then(gasPrice => {
  const gasOpt = {
    gas: GAS,
    gasPrice: GASPRICE,
    from: getMetamaskAddress()
  };
  return new Promise((resolve, reject) => instance.distributeReservedTokens(20, gasOpt, (err, res) => {
    if (err) return reject(err);
    else return resolve(res);
  }));
  // });
};
