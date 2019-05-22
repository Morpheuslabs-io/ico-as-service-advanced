import React, {Component} from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
} from 'reactstrap';
import {bindActionCreators} from "redux";
import {setAlert, setAuth} from "../../redux/actions/index";
import connect from "react-redux/es/connect/connect";
import axios from "axios";
import moment from "moment";
import {Table} from 'antd';

import 'antd/dist/antd.css';

import TokenContract from "./TokenContract";
import CrowdsaleContract from "./CrowdsaleContract";
import {
  formatAddress
} from "../../containers/Utils/blockchainHelper";

class ViewContract extends Component {

  state = {
    token: {
      name: "",
      symbol: "",
      decimal: "",
      totalSupply: "",
    },
    reservedTokens: [],
    ownerAddress: "",
    network: "",
    mincap: 0,
    whitelisted: false,
    tiers: [],
    vestings: [],
    contractAddress: {
      token: "",
      crowdsale: [],
      pricingStrategy: [],
      finalizeAgent: [],
    }
  };

  componentDidMount() {
    const id = this.props.match.params.id;
    axios.get("/admin/contract/" + id).then(response => {
      this.setState({
        ...response.data
      });
    }).catch(err => {
      console.log(err.message);
    });
  }

  render() {
    const {network, token, contractAddress, ownerAddress, reservedTokens, mincap, whitelisted, tiers, vestings} = this.state;
    const contractId = this.props.match.params.id;

    let etherscan = ""
    let badge = "";
    if (this.props.net.type === 'rinkeby') {
      etherscan = "https://rinkeby.etherscan.io/address"
      badge = "success";
    } else {
      etherscan = "https://etherscan.io/address";
      badge = "primary";
    }

    const reservedTokenColumns = [
      {
        title: 'Address',
        dataIndex: 'address',
        sorter: (a, b) => a.address.localeCompare(b.address),
        render: (text) => <a href={etherscan + "/" + text} target="_blank">{formatAddress(text)}</a>,
      },
      {
        title: 'Dimension',
        dataIndex: 'dimension',
        sorter: (a, b) => a.dimension.localeCompare(b.dimension),
      },
      {
        title: 'Token Amount',
        dataIndex: 'tokenAmount',
        sorter: (a, b) => a.tokenAmount - b.tokenAmount,
        render: (text) => <span>{text + " " + token.symbol}</span>,
      }
    ];

    const vestingColumns = [
      {
        title: 'Address',
        dataIndex: 'startVesting',
        sorter: (a, b) => moment(a.startVesting).subtract(moment(b.startVesting)),
        render: (text) => <span>{moment(text).format("YYYY/MM/DD")}</span>,
      },
      {
        title: 'Minimum',
        dataIndex: 'endVesting',
        sorter: (a, b) => moment(a.endVesting).subtract(moment(b.endVesting)),
        render: (text) => <span>{moment(text).format("YYYY/MM/DD")}</span>,
      },
      {
        title: 'Token Amount',
        dataIndex: 'amount',
        sorter: (a, b) => a.amount - b.amount,
        render: (text) => <span>{text + " " + token.symbol}</span>,
      }
    ];

    return (
      <div className="animated fadeIn">
        <Row>
          <Col sm="8">
            <Row>
              <Col sm={12}>
                <CrowdsaleContract contractId={contractId} contractAddress={contractAddress} network={network} tiers={tiers}/>
              </Col>
            </Row>
            <Card>
              <CardHeader>
                <h2 className="mb-0 text-dark">Reserved Tokens</h2>
              </CardHeader>
              <CardBody>

                {reservedTokens.length != 0 && <div>
                  <div className="font-2xl mb-2">Reserved Token ({reservedTokens.length}):</div>
                  <Table columns={reservedTokenColumns} size="middle" bordered dataSource={reservedTokens} pagination={{pageSize: 5}}/>
                </div>
                }

                {vestings.length != 0 && <div>
                  <div className="font-2xl mb-2">Vestings:</div>
                  <Table bordered columns={vestingColumns} size="middle" dataSource={vestings} pagination={{pageSize: 5}}/>
                </div>
                }

              </CardBody>
            </Card>
          </Col>
          <Col sm="4">
            {contractAddress.token != "" &&
              <TokenContract contractAddress={contractAddress.token} network={network}/>
            }
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewContract);
