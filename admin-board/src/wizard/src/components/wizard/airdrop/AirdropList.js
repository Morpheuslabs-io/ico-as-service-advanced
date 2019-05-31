import React, {Component} from 'react';
import {Row, Col} from 'reactstrap';
import InputField from '../InputField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Papa from 'papaparse';

import {setError, setStep3} from '../../../redux/actions';
import SweetAlert from 'sweetalert-react';
import Spinner from 'react-spinkit';
import swal from "sweetalert2";
import AirdropModal from './AirdropModal'

import {
  isValidAddress,
  getMetamaskAddress,
  getNetworkName,
  preCheckMetaMask
} from "../../../containers/Airdrop/blockchainHelperAirDrop"

class AirdropList extends Component {

  state = {
    address: '',
    amount: 0,
    
    erc20Address: '',
    errorErc20Address: '',

    errorAddress: '',
    errorAmount: '',
    errorWMax: '',
    
    alertShow: false,
    alertTitle: '',
    alertText: '',
    
    airdroplist: [],
    spinnerShow: false,

    showModal: false,
    resourceHandleErr: false,
    isProcessing: false

  };

  handleChange = (name, value) => {
    this.setState({
      [name]: value,
    })
  };

  handleBlurAddress = () => {
    const address = this.state.address;
    let errorAddress = '';
    if (address === '' || !isValidAddress(address))
      errorAddress = 'The inserted address is invalid';
    else
      errorAddress = '';
    this.setState({
      errorAddress,
    });
  };

  handleBlurERC20Address = () => {
    const address = this.state.erc20Address;
    let errorAddress = '';
    if (address === '' || !isValidAddress(address))
      errorAddress = 'The inserted address is invalid';
    else
      errorAddress = '';
    this.setState({
      errorErc20Address: errorAddress,
    });
  };

  handleBlurAmount = () => {
    const amount = parseFloat(this.state.amount);

    this.setState({
      errorAmount: amount <= 0 ? 'Please enter a valid number greater than 0' : ''
    });
  };

  handleAddNew = () => {
    const address = this.state.address;
    const amount = parseFloat(this.state.amount);
    let errorAddress = '';
    let errorAmount = '';

    let hasError = false;
    if (address === '' || !isValidAddress(address)) {
      errorAddress = 'The inserted address is invalid';
      hasError = true;
    } else
      errorAddress = '';

    if (amount <= 0) {
      errorAmount = 'Please enter a valid number greater than 0';
      hasError = true;
    } else
      errorAmount = '';

    this.setState({
      errorAddress,
      errorAmount
    });

    if (!hasError) {
      this.setState({
        airdroplist: [...this.state.airdroplist, {address, amount}]
      })
    }
  };

  handleUploadCSV = event => {
    const file = event.target.files[0];
    if (file) {
      let fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        this.setState({
          airdroplist: []
        })
        let csv = Papa.parse(fileReader.result);
        let airdroplist = [];
        for (const idx in csv.data) {
          let addr = csv.data[idx][0]
          let amount = parseFloat(csv.data[idx][1])
          if (isValidAddress(addr) && amount > 0) {
            airdroplist.push({address: addr, amount: amount});
          }
        }
        this.setState({
          airdroplist
        });
      };
      fileReader.readAsText(file);
      event.target.value = null;
    }
  };

  airdropWithMetamask = () => {
    preCheckMetaMask()
    let metamaskNet = getNetworkName()
    if (metamaskNet.toLowerCase() !== 'rinkeby' && metamaskNet.toLowerCase() !== 'mainnet' ) {
      swal("Please use Rinkeby or Mainnet", `Your current Metamask network (${metamaskNet}) is not supported.`, "warning");
      return
    }

    if (getMetamaskAddress()) {
      this.handleToggleModal()
    }
  }

  handleToggleModal = () => {
    const { showModal } = this.state
    this.setState({
      showModal: !showModal,
      resourceHandleErr: false,
      isProcessing: false
    })
  }

  setResourceHandleErr = (val) => {
    this.setState({
      resourceHandleErr: val
    })
  }

  setIsProcessing = (val) => {
    this.setState({
      isProcessing: val
    })
  }

  render() {
    return (
      <div>
        <AirdropModal 
          showModal={this.state.showModal}
          handleToggleModal={this.handleToggleModal}
          setResourceHandleErr={this.setResourceHandleErr}
          resourceHandleErr={this.state.resourceHandleErr}
          setIsProcessing={this.setIsProcessing}
          isProcessing={this.state.isProcessing}

          erc20Address={this.state.erc20Address}
          airdroplist={this.state.airdroplist}
        />
        <div className='container step-widget widget-2'>
          <div className='widget-header'>
            <div>
              <p className='title'>Airdrop Tool</p>
              <p className='description'>
                This tool is used to airdrop a specified ERC20 token to thousands of wallet addresses that are provided by uploading a CSV file or by adding manually.
              </p>
              <p className='description'>
                <b> Either Rinkeby testnet or Mainnet is supported. </b>
              </p>
            </div>
          </div>
          {
            this.state.spinnerShow ?
              <div>
                <Spinner 
                  className='justify-content-center align-items-center mx-auto' 
                  name='three-bounce' color='#00B1EF' style={{ width: 100, margin: 250 }}
                  noFadeIn
                />
              </div>
              :
              <div className='wg-content'>
                <div>
                  <Row>
                    <Col md={5}>
                      <InputField id='erc20Address' nameLabel='ERC20 Token Address' tooltip='This is the address of the token for airdrop' type='text' onChange={this.handleChange} value={this.state.erc20Address}
                                  onBlur={this.handleBlurERC20Address} hasError={this.state.errorErc20Address}/>
                    </Col>
                  </Row>
                </div>
                <br></br>
                <div>
                  <p className='wg-label fs-22px'>Recipient List</p>
                  <Row>
                    <Col md={5}>
                      <InputField id='address' nameLabel='Address' type='text' onChange={this.handleChange} value={this.state.address}
                                  onBlur={this.handleBlurAddress} hasError={this.state.errorAddress}/>
                    </Col>
                    <Col md={3}>
                      <InputField id='amount' nameLabel='Amount' type='number' onChange={this.handleChange} value={this.state.amount}
                                  onBlur={this.handleBlurAmount} hasError={this.state.errorAmount}/>
                    </Col>
                    <Col md={1}>
                      <IconButton component='span' className='add-whitelist' onClick={this.handleAddNew}><i className='fas fa-plus'/></IconButton>
                    </Col>
                  </Row>
                </div>
                <div>
                  <input id='upload-csv' className='upload-csv' multiple type='file' accept=".csv" onChange={this.handleUploadCSV}/>
                  <label htmlFor='upload-csv'>
                    <Button variant="contained" component='span' className='upload-btn'>
                      <i className='fas fa-upload'/>
                      &nbsp; Upload CSV
                    </Button>
                  </label>
                  <a className='float-right' href='/airdrop_sample.csv'>Download Sample CSV</a>
                </div>
                <br></br>
                {
                  this.state.airdroplist.length !== 0 &&
                  <div>
                    <table className='table table-striped table-bordered'>
                      <thead>
                      <tr>
                        <th>Address</th>
                        <th>Amount</th>
                      </tr>
                      </thead>
                      <tbody>
                      {
                        this.state.airdroplist.map((val, key) => (
                          <tr key={key}>
                            <td>{val.address}</td>
                            <td>{val.amount}</td>
                          </tr>
                        ))
                      }
                      </tbody>
                    </table>
                    <Row>
                      <Col className='float-left'>
                        <Button
                          onClick={this.airdropWithMetamask}
                          variant='contained' size='large' color="primary"
                        >
                            Airdrop with Metamask
                        </Button>
                      </Col>
                      { this.state.doneShow &&
                          <Col className='float-right' md={4}>
                            <Button
                              onClick={this.onDone}
                              variant='contained' size='large' color="primary"
                            >
                                Done
                            </Button>
                          </Col>
                      }
                    </Row>
                  </div>
                }
                <SweetAlert show={this.state.alertShow} type='success' title={this.state.alertTitle} text={this.state.alertText} onConfirm={() => this.setState({alertShow: false})}/>
              </div>
          }
        </div>
      </div>
    );
  }
}

AirdropList.propTypes = {
  id: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    step3: state.rootReducer.step3,
    error: state.rootReducer.error,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setStep3: bindActionCreators(setStep3, dispatch),
    setError: bindActionCreators(setError, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AirdropList);
