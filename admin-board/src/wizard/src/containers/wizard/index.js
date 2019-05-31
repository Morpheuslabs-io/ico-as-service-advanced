import React, {Component} from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom';
import {bindActionCreators} from 'redux';
import contract from 'truffle-contract';
import SweetAlert from 'sweetalert-react';
import moment from 'moment';
import Spinner from 'react-spinkit';

import 'sweetalert/dist/sweetalert.css';

import Stepper from '../../components/wizard/Stepper';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';
import Step5 from './step5';
import BottomButtons from './BottomButtons';
// import {setError, setStep, setStep2, setStep3, setDeploy} from '../../redux/actions';
import {setError, setStep, setStep2, setStep3, setDeploy} from '../../redux/actions';
import {countDecimalPlaces, diffDates, isValidEmailAddress, isValidAddress, toFixed, validMetamask} from '../../components/wizard/Utils';
import {
  preCheckMetaMask,
  getMetamaskAddress
} from "../../../../containers/Utils/blockchainHelper";
import axios from "axios";
import _ from "lodash";

let web3 = null;
if (typeof(window.web3) !== 'undefined') {
  web3 = window.web3;
}

let axiosWizard = axios.create({
  baseURL: '',
  headers: {
    post: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
});

class Wizard extends Component {

  state = {
    resultShow: false,
    resultTitle: '',
    resultText: '',
    resultType: 'warning',
    spinnerShow: false
  };

  constructor(props) {
    super(props);
  };

  handleContinueStep = async () => {
    const {step, step2, step3, error, setError, setStep3} = this.props;
    switch (step) {
      case 1:
        if (step === 5) return;
        this.props.setStep(step + 1);
        break;
      case 2:
        let errorName, errorTicker, errorDecimals;
        if (step2.name === '')
          errorName = 'This field is required';
        else
          errorName = '';

        if (step2.ticker === '')
          errorTicker = 'This field is required';
        else
          errorTicker = '';
        if (step2.ticker.length > 5)
          errorTicker = 'Please enter a valid ticker between 1-5 characters';
        if (step2.ticker !== '' && !(/^[a-z0-9]+$/i.test(step2.ticker)))
          errorTicker = 'Only alphanumeric characters';

        if (step2.decimals === '')
          errorDecimals = 'This field is required';
        else
          errorDecimals = '';
        if (step2.decimals > 18)
          errorDecimals = 'Should not be greater than 18';
        if (step2.decimals < 0)
          errorDecimals = 'Should not be less than 0';

        setError({
          ...error,
          errorName: errorName,
          errorTicker: errorTicker,
          errorDecimals: errorDecimals,
        });

        if (errorName === '' && errorTicker === '' && errorDecimals === '') {
          setStep3({
            ...step3,
            wallet_address: '',
          });

          if (step === 5) return;
          this.props.setStep(step + 1);
        }
        break;
      case 3:
        let errorWalletAddress, errorEmailAddress, errorMincap, errorCustomGas;
        let existError = false;

        if (step3.wallet_address === '' || !isValidAddress(step3.wallet_address)) {
          errorWalletAddress = 'Please enter a valid address';
          existError = true;
        }
        else
          errorWalletAddress = '';

        if (step3.email_address === '' || !isValidEmailAddress(step3.email_address)) {
          errorEmailAddress = 'Please enter a valid email address';
          existError = true;
        }
        else
          errorEmailAddress = '';

        if (step3.gasPrice === '' || step3.gasPrice < 0.1) {
          errorCustomGas = 'Should be greater than 0.1';
          existError = true;
        }
        else
          errorCustomGas = '';

        if (step3.mincap === '' || step3.mincap <= 0) {
          errorMincap = 'Please enter a valid number greater or equal than 0';
          existError = true;
        }
        else
          errorMincap = '';

        let validMincap = false;
        for (const id in step3.tiers) {
          if (parseFloat(step3.mincap) < parseFloat(step3.tiers[id].supply)) {
            validMincap = true;
            break;
          }
        }
        if (!validMincap) {
          errorMincap = 'Should be less or equal than the supply of some tier';
          existError = true;
        }

        let errorTiers = error.errorTiers;
        for (const id in step3.tiers) {
          let errorTierName = '';
          if (!step3.tiers[id].tierName) {
            errorTierName = 'This field is required';
            existError = true;
          }

          let errorRate = '';
          if (step3.tiers[id].rate <= 0) {
            errorRate = 'Please enter a valid number greater than 0. Should be integer. Should not be greater than 1 quintillion (10^18)';
            existError = true;
          }

          let errorSupply = '';
          if (step3.tiers[id].supply <= 0) {
            errorSupply = 'Please enter a valid number greater than 0';
            existError = true;
          }
          let startError = '', endError = '', errorLock = '';

          if (!step3.tiers[id].startDate || !step3.tiers[id].startTime)
            startError = 'Should not be empty';
          if (!step3.tiers[id].endDate || !step3.tiers[id].endTime)
            endError = 'Should not be empty';
          if (!step3.tiers[id].lockDate || !step3.tiers[id].unlockDate)
            errorLock = 'Should not be empty';
          if (startError || endError || errorLock)
          {
            errorTiers[id] = {
              startError,
              endError,
              errorLock,
              errorTierName,
              errorRate,
              errorSupply,
            };
            existError = true;
            continue;
          }

          const diffS = diffDates(moment(), moment(), step3.tiers[id].startDate, step3.tiers[id].startTime);
          const diffE = diffDates(moment(), moment(), step3.tiers[id].endDate, step3.tiers[id].endTime);
          let diffL = diffDates(step3.tiers[id].lockDate, moment(), step3.tiers[id].unlockDate, moment());
          if (diffS <= 0 || diffE <= 0) {
            startError = diffS < 0 ? 'Should be set in the future' : '';
            endError = diffE < 0 ? 'Should be set in the future' : '';
            existError = true;
          } else {
            let diff = diffDates(step3.tiers[id].startDate, step3.tiers[id].startTime, step3.tiers[id].endDate, step3.tiers[id].endTime);
            if (diff <= 0) {
              startError = 'Should be previous than same tier\'s End Time';
              endError = 'Should be later than same tier\'s Start Time';
              existError = true;
            } else if (id != 0) {
              diff = diffDates(step3.tiers[id - 1].endDate, step3.tiers[id - 1].endTime, step3.tiers[id].startDate, step3.tiers[id].startTime);
              if (diff <= 0) {
                startError = 'Should be same or next than previous tier\'s End Time';
                existError = true;
              }
            }
          }
          if (diffL <= 0) {
            errorLock = 'Unlock date should be next than lock date.';
            existError = true;
          } else {
            diffL = diffDates(step3.tiers[step3.tiers.length - 1].endDate, moment(), step3.tiers[id].unlockDate, moment());
            if (diffL <= 0) {
              errorLock = 'Unlock date should be next than last tier\'s datetime';
              existError = true;
            } else {
              diffL = diffDates(moment(), moment(), step3.tiers[id].lockDate, moment());
              if (diffL <= 0) {
                errorLock = 'Lock date should be set in the future';
                existError = true;
              }
            }
          }
          errorTiers[id] = {
            startError,
            endError,
            errorLock,
            errorTierName,
            errorRate,
            errorSupply,
          };
        }
        setError({
          ...error,
          errorWalletAddress: errorWalletAddress,
          errorEmailAddress: errorEmailAddress,
          errorCustomGas: errorCustomGas,
          errorMincap: errorMincap,
          errorTiers,
        });

        if (!existError) {
          if (step === 5) return;
          this.props.setStep(step + 1);
          const isError = await this.setParamContracts();
          if (!isError) {
            await this.handleStoreICO();
          }
        }
        break;
      case 4:
        if (step === 5) return;
        this.props.setStep(step + 1);
        break;
      case 5:
        this.props.history.push('/contracts');
        this.props.setStep(1);
        return;
    }
    window.scrollTo(0, 0);
  };

  setParamContracts = async () => {

    this.setState({
      spinnerShow: true
    });

    let myTiers = this.props.step3.tiers;
    for (let i = 0; i < myTiers.length; i++){
      myTiers[i].startDate = myTiers[i].startDate.format('YYYY-MM-DD');
      myTiers[i].startTime = myTiers[i].startTime.format('HH:mm:SS');

      myTiers[i].endDate = myTiers[i].endDate.format('YYYY-MM-DD');
      myTiers[i].endTime = myTiers[i].endTime.format('HH:mm:SS');
    }

    let step2 = this.props.step2;
    let step3 = this.props.step3;
    step3.tiers = myTiers;
    
    console.log('step2:', step2);
    console.log('step3:', step3);

    let data = '';
    let isError = false;

    axiosWizard.defaults.baseURL = this.props.net.type === 'rinkeby' ? process.env.REACT_APP_CHAIN_API_RINKEBY : process.env.REACT_APP_CHAIN_API_MAINNET;
    
    if (process.env.REACT_APP_DEV_LOCAL == 1) {
      axiosWizard.defaults.baseURL = process.env.REACT_APP_WIZARD_API_LOCALHOST
    }

    console.log('axiosWizard.defaults.baseURL:', axiosWizard.defaults.baseURL);

    try {
      let response = await axiosWizard.post("/setparam", {
        step2,
        step3
      });

      console.log('setparam resp: ', response);
      
      if (response.data.status == true) {
        let respData = response.data.data;
        data = respData.data;

        if (step3.email_address) {
          data += 'Your ICO contracts are being finalized.\n';
          data += 'This might take long depending on Ethereum network status.\n';
          data += 'Once done, a notification will be sent to your provided email:\n';
          data += step3.email_address;
        }

        let dataCrowdsale = respData.dataCrowdsale;
        let dataPricing = respData.dataPricing;
        let dataFinalizedAgent = respData.dataFinalizedAgent;

        let d_tiers = this.props.deploy.d_tiers;
        console.log('this.props.deploy.d_tiers:', this.props.deploy.d_tiers);
        // return
        for (let i=0; i<dataCrowdsale.length; i++) {
          d_tiers[i].crowdsale = (dataCrowdsale[i]);
          d_tiers[i].pricingStrategy = (dataPricing[i]);
          d_tiers[i].finalizeAgent = (dataFinalizedAgent[i]);

          d_tiers[i].token = respData.dataToken;

          setDeploy({
            ...this.props.deploy,
            d_tiers
          });
        }
      } else {
        data = response.data.message;
        isError = true;
      }
    } catch (err) {
      console.log('setparam err: ', err);
      isError = true;
    }

    this.setState({
      spinnerShow: false,
      resultShow: true,
      resultTitle: isError ? 'Internal Service Error' : 'Success',
      resultText: data,
      resultType: isError ? 'error' : 'success'
    });

    // Only when server returns the predeployed addresses without any setting of params
    // setTimeout(() => {
    //   this.setState({
    //     spinnerShow: false,
    //     resultShow: true
    //   })
    // }, 2000);

    return isError;
  }

  promisify = (inner) =>
    new Promise((resolve, reject) =>
      inner((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      })
    );

  handleBackStep = () => {
    const {step} = this.props;
    if (step === 1) return;
    this.props.setStep(step - 1);
    window.scrollTo(0, 0);
  };

  handleStoreICO = async () => {
    const {auth, net} = this.props;

    const {name, ticker, decimals, reserved_token} = this.props.step2;
    const {wallet_address, mincap, enableWhitelisting, tiers} = this.props.step3;
    const {vestings} = this.props.step5;
    const {deploy} = this.props;

    let initSupply = 0;
    let myTiers = this.props.step3.tiers;
    for (let i = 0; i < myTiers.length; i++){
      initSupply += parseFloat(myTiers[i].supply);

      // Join startDate and startTime together into one entry
      myTiers[i].startDate = moment(myTiers[i].startDate + ' ' + myTiers[i].startTime, 'YYYY-MM-DD HH:mm:SS').unix() * 1000

      // Join endDate and endTime together into one entry
      myTiers[i].endDate = moment(myTiers[i].endDate + ' ' + myTiers[i].endTime, 'YYYY-MM-DD HH:mm:SS').unix() * 1000
    }

    let crowdsaleAddr = [];
    let pricingStrategyAddr = [];
    let finalizeAgentAddr = [];
    let tokenAddr=''
    for (let i=0; i < deploy.d_tiers.length; i++) {
      crowdsaleAddr.push(deploy.d_tiers[i].crowdsale);
      pricingStrategyAddr.push(deploy.d_tiers[i].pricingStrategy);
      finalizeAgentAddr.push(deploy.d_tiers[i].finalizeAgent);
      tokenAddr = deploy.d_tiers[i].token;
    }

    const params = {
      "token": {
        "name": name,
        "symbol": ticker,
        "totalSupply": initSupply,
        "decimal": decimals
      },
      "ownerAddress": wallet_address,
      "mincap": mincap,
      "whitelisted": enableWhitelisting,
      "tiers": myTiers,
      "contractAddress": {
        "token": tokenAddr,
        "crowdsale": crowdsaleAddr,
        "pricingStrategy": pricingStrategyAddr,
        "finalizeAgent": finalizeAgentAddr
      },
      "reservedTokens": reserved_token,
      "vestings": vestings,
      "network": net.type,
    };

    console.log('handleStoreICO - params:', params);

    try {
      let response = await axios.post("admin/contract" + "/?t=" + auth.token, params);
      localStorage.clear();
    } catch (err) {
      console.log('handleStoreICO - Error:', err);
    }
  };

  render() {
    preCheckMetaMask()
    let stepContent = null;
    const {step} = this.props;

    // Skip step4
    if (step == 4){
      this.props.setStep(5);
    }
    
    switch (step) {
      case 1:
        stepContent = <Step1/>;
        break;
      case 2:
        stepContent = <Step2/>;
        break;
      case 3:
        stepContent = <Step3/>;
        break;
      case 4:
        stepContent = <Step4/>;
        break;
      case 5:
        stepContent = <Step5/>;
        break;
    }

    if (this.state.spinnerShow) {
      return (
        <Spinner 
          className='justify-content-center align-items-center mx-auto' 
          name='three-bounce' color='#00B1EF' style={{ width: 100, margin: 250 }}
          noFadeIn
        />
      );
    } else { 
      return (
        <div className='page-content wizard'>
          <Stepper step={step}/>
          
          <div className='page-wrapper d-flex flex-column'>
            {stepContent}

            <BottomButtons step={step} onContinue={this.handleContinueStep} onBack={this.handleBackStep} onInvest={this.handleStoreICO}/>
            <SweetAlert show={this.state.resultShow} type={this.state.resultType} title={this.state.resultTitle} text={this.state.resultText}
                        onConfirm={() => this.setState({resultShow: false})}/>
          </div>
        </div>
      );
    }
  }
}


function mapStateToProps(state) {
  return {
    step: state.rootReducer.wizard.step,
    step1: state.rootReducer.step1,
    step2: state.rootReducer.step2,
    step3: state.rootReducer.step3,
    step5: state.rootReducer.step5,
    error: state.rootReducer.error,
    deploy: state.rootReducer.deploy,
    token: state.rootReducer.token,
    auth: state.rootReducer.auth,
    net: state.rootReducer.net
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setStep: bindActionCreators(setStep, dispatch),
    setStep2: bindActionCreators(setStep2, dispatch),
    setStep3: bindActionCreators(setStep3, dispatch),
    setError: bindActionCreators(setError, dispatch),
    setDeploy: bindActionCreators(setDeploy, dispatch),
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Wizard)
);
