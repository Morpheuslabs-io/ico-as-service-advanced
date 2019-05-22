import Web3 from "web3";
import swal from "sweetalert2";
import request from "request";

export const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

let web3 = null;

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

export const getMetamaskAddress = () => {
  if (typeof(window.web3) !== 'undefined') {
    web3 = window.web3;
  }
  if (web3 != null) {
    let w = new Web3(web3.currentProvider);
    if (w.eth.accounts.length > 0) {
      return w.eth.accounts[0];
    } else {
      swal("Please unlock your metamask", "", "warning");
      return null;
    }
  } else {
    swal("Please install your metamask", "", "warning");
    return null;
  }
};

export const httpGet = (route) => {
  return new Promise(function (resolve, reject) {
    request.get(route, (er, res, body) => {
      if (er) return reject(er);
      body = JSON.parse(body);
      return resolve(body);
    });
  });
};

export const getNormalGasPrice = () => {
  return httpGet("https://www.etherchain.org/api/gasPriceOracle").then(result => {
    return result.standard * 1000000000;
  });
};

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
