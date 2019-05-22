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
import {setAlert, setAuth} from "../../redux/actions";
import connect from "react-redux/es/connect/connect";
import axios from "axios";
import {Popconfirm, Table} from 'antd';
import moment from "moment";

import 'antd/dist/antd.css';
import { Link, Redirect } from "react-router-dom";

import {
  formatAddress,
  isUiEnabled
} from "../../containers/Utils/blockchainHelper";

dotenv.config('.env');

class TokenVesting extends Component {

  state = {
    data: [],
    tokenvestings: [],
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
    try {
      let response = await axios.get(`/admin/tokenvesting/list/${net}`)
      this.setState({
        tokenvestings: response.data
      });
      console.log('TokenVesting - initData - response.data:', response.data);
      let data = [];
      for(let i=0; i<response.data.length; i++) {
        let dataEntry = response.data[i];
        for(let j=0; j<dataEntry.vestingArray.length; j++) {
          let vestingEntry = dataEntry.vestingArray[j];
          let addrVesting = dataEntry.addrVestingList[j];

          const obj = {
            id: dataEntry._id,
            tokenAddress: vestingEntry.tokenAddress,
            beneficiaryAddress: vestingEntry.beneficiaryAddress,
            startVesting: vestingEntry.startVesting,
            cliffVesting: vestingEntry.cliffVesting,
            endVesting: vestingEntry.endVesting,
            createdAt: moment(dataEntry.createdAt).format('YYYY/MM/DD HH:mm:ss'),
            addrVesting: addrVesting
          };

          data.push(obj);
        }
      }
      this.setState({
        data: data
      });
    } catch(err) {
      console.log(err);
    }
  }

  removeTokenVesting = async (id) => {
    try {
      let response = await axios.delete("/admin/tokenvesting/"+id)
      await this.initData(this.props.net.type);
    } catch(err) {
      console.log(err)
    }
  }

  handleStartVesting = () => {
    this.props.history.push('/startvesting');
  };

  render() {

    if (!isUiEnabled(this.props.auth.user.uiconfig, 'token vesting')) {
      return <Redirect to="/uisetting"/>
    }

    let tokenVestingLink = this.props.net.type === 'rinkeby' ? process.env.REACT_APP_TOKEN_VESTING_LINK_RINKEBY : process.env.REACT_APP_TOKEN_VESTING_LINK_MAINNET;
    
    if (process.env.REACT_APP_DEV_LOCAL === 1) {
      tokenVestingLink = process.env.REACT_APP_TOKEN_VESTING_LINK_LOCALHOST
    }

    console.log('tokenVestingLink:', tokenVestingLink);
    
    const columns = [
      {
        title: 'Vesting Contract',
        dataIndex: 'addrVesting',
        sorter: (a, b) => a.addrVesting.localeCompare( b.addrVesting),
        render: (text, record) => <a href={`${tokenVestingLink}/${record.addrVesting}/${record.tokenAddress}`} target="_blank">{record.addrVesting && formatAddress(record.addrVesting)}</a>,
      },
      {
        title: 'Beneficiary',
        dataIndex: 'beneficiaryAddress',
        sorter: (a, b) => a.beneficiaryAddress.localeCompare( b.beneficiaryAddress),
        render: (text, record) => <span>{record.beneficiaryAddress && formatAddress(record.beneficiaryAddress)}</span>
      },
      {
        title: 'Token',
        dataIndex: 'tokenAddress',
        sorter: (a, b) => a.tokenAddress.localeCompare(b.tokenAddress),
        render: (text, record) => <span>{record.tokenAddress && formatAddress(record.tokenAddress)}</span>
      },
      {
        title: 'Start Vesting',
        dataIndex: 'startVesting',
        sorter: (a, b) => moment(a.startVesting).subtract(moment(b.startVesting)),
        render: (text, record) => <span>{record.startVesting && moment(record.startVesting).format('YYYY/MM/DD')}</span>
      },
      {
        title: 'Cliff Vesting',
        dataIndex: 'cliffVesting',
        sorter: (a, b) => moment(a.cliffVesting).subtract(moment(b.cliffVesting)),
        render: (text, record) => <span>{record.cliffVesting && moment(record.cliffVesting).format('YYYY/MM/DD')}</span>
      },
      {
        title: 'End Vesting',
        dataIndex: 'endVesting',
        sorter: (a, b) => moment(a.endVesting).subtract(moment(b.endVesting)),
        render: (text, record) => <span>{record.endVesting && moment(record.endVesting).format('YYYY/MM/DD')}</span>
      },
      {
        title: 'Created Date',
        dataIndex: 'createdAt',
        sorter: (a, b) => moment(a.createdAt).subtract(moment(b.createdAt)),
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Popconfirm title="Sure to delete?" onConfirm={async () => await this.removeTokenVesting(record.id)}>
            <Button className="icon btn-sm" color="secondary"><i className="icon-trash"/></Button>
          </Popconfirm>
        ),
      }
    ];

    const {data} = this.state;

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" lg="12">
            <Card>
              <CardHeader>
                <h2 className="mb-0 text-dark">Token Vesting</h2>
              </CardHeader>
              <CardBody>
                <Button
                  className="btn btn-primary mb-3"
                  onClick={this.handleStartVesting} variant='contained' size='large' color="primary" 
                >
                  Start Wizard
                </Button>
                <Table scroll={{ x: true}} columns={columns} dataSource={data} pagination={{pageSize: 10}}/>
              </CardBody>
            </Card>
          </Col>
        </Row>
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
    setAuth: bindActionCreators(setAuth, dispatch),
    setAlert: bindActionCreators(setAlert, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TokenVesting);
