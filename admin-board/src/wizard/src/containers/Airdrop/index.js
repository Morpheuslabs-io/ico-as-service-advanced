import React, {Component} from 'react';
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Alert
} from 'reactstrap';
import dotenv from 'dotenv';
import {bindActionCreators} from "redux";
// import {setAlert, setAuth, setStep} from "../../redux/actions";
import connect from "react-redux/es/connect/connect";
import axios from "axios";
import {Popconfirm, Table} from 'antd';
import moment from "moment";

import 'antd/dist/antd.css';
import { Link, Redirect } from "react-router-dom";

import swal from "sweetalert2";
import { isUiEnabled } from "../../../../containers/Utils/blockchainHelper"
import {
  validMetamask,
  preCheckMetaMask
} from "./blockchainHelperAirDrop";

import AirdropList from '../../components/wizard/airdrop/AirdropList';

dotenv.config('.env');

class Airdrop extends Component {

  state = {
    data: [],
    contracts: []
  };

  async componentDidMount() {
    const net = this.props.net.type
    await this.initData(net);
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.net.type !== nextProps.net.type) {
      await this.initData(nextProps.net.type);
    }
  }

  initData = async (net) => {
    console.log('Airdrop - initData - net:', net);
    try {
      let response = await axios.get(`/admin/contract/list/${net}`);
      this.setState({
        contracts: response.data
      });
      let data = [];
      for(let i=0; i<response.data.length; i++) {
        const obj = {
          id: response.data[i]._id,
          name: response.data[i].token.name,
          symbol: response.data[i].token.symbol,
          totalSupply: response.data[i].token.totalSupply,
          decimal: response.data[i].token.decimal,
          network: response.data[i].network,
          createdAt: moment(response.data[i].createdAt).format('YYYY/MM/DD HH:mm:ss'),
        };
        data.push(obj);
      }
      this.setState({
        data: data
      });
    } catch(err) {
      console.log(err);
    }
  };

  removeContract = id => {
    axios.delete("/admin/contract/"+id).then(response => {
      this.initData(this.props.net.type);
    }).catch(err => console.log(err));
  };

  handleStartICO = () => {
    this.props.setStep(1);
    this.props.history.push('/startico');
  };

  // preCheckMetaMask = () => {
  //   if (validMetamask() === 0) {
  //     swal("Metamask is not available. Please install Metamask extension and sign in.", "", "warning");
  //     return false
  //   } else if (validMetamask() === 1) {
  //     swal("Please open and sign in Metamask.", "", "warning");
  //     return false
  //   } else {
  //     return true
  //   }
  // }

  render() {
    if (!isUiEnabled(this.props.auth.user.uiconfig, 'airdrop')) {
      return <Redirect to="/uisetting"/>
    }

    preCheckMetaMask()

    return (
      <div className='page-content wizard'>
        <div className='page-wrapper d-flex flex-column'>
          <div className='step-content'>
            <div className='container step-widget pt-0'>
              <AirdropList
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.rootReducer.auth,
    alert: state.rootReducer.alert,
    net: state.rootReducer.net,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    // setAuth: bindActionCreators(setAuth, dispatch),
    // setAlert: bindActionCreators(setAlert, dispatch),
    // setStep: bindActionCreators(setStep, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Airdrop);
