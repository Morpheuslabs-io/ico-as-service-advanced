import axios from "axios";
import request from "request";
import crypto from "crypto";
import dotenv from "dotenv";
const Buf = require('safe-buffer').Buffer;

export const setAuthorizationHeader = (token = null) => {
  if (token) {
    axios.defaults.headers.common.authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.authorization;
  }
};

const algorithm = 'aes-256-ctr';
const password = process.env.REACT_APP_RNDKEY;
const IV = Buf.from(crypto.randomBytes(16));

export const encrypt = text => {
  const cipher = crypto.createCipheriv(algorithm, password, IV);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

export const decrypt = text => {
  const decipher = crypto.createCipheriv(algorithm, password, IV);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
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
