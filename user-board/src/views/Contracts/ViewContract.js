import React, {Component} from 'react';
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Label,
  Input,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Jumbotron
} from 'reactstrap';
import connect from "react-redux/es/connect/connect";
import axios from "axios";
import moment from "moment";
import swal from "sweetalert2";
import {Table} from 'antd';

import 'antd/dist/antd.css';
import {Link} from "react-router-dom";
import {getMetamaskAddress, numberWithCommas} from "../../containers/Utils/Util";
import HelpPopover from "../../containers/Utils/HelpPopover";
import {balanceOfToken, buyTokens, getCrowdsaleDetails, getInvestmentStatus, getPricingStrategyDetails, getTokenDetails, formatAddress} from "../../containers/Utils/BlockchainHelper";
import MINTED_TOKEN_CAPPED_CROWDSALE_EXT_CONTRACT from "../../artifacts/MintedTokenCappedCrowdsaleExt";
import Web3 from "web3";

class ViewContract extends Component {

  state = {
    contracts: [],
    contractId: '',
    selectedContract: 0,
    paidEther: 0,
    boughtToken: 0,
    token: {
      name: "",
      symbol: "",
      decimals: 0,
      totalSupply: 0,
      ownerAddress: "",
      mintingFinished: false,
      mincap: 0,
    },
    crowdsales: [],
    pricingStrategy: [],
    buyAmountETH: 0
  };

  cleanup = () => {
    this.setState({
      contracts: [],
      contractId: '',
      selectedContract: 0,
      paidEther: 0,
      boughtToken: 0,
      token: {
        name: "",
        symbol: "",
        decimals: 0,
        totalSupply: 0,
        ownerAddress: "",
        mintingFinished: false,
        mincap: 0,
      },
      crowdsales: [],
      pricingStrategy: [],
      buyAmountETH: 0
    })
  }

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
    const {selectedContract} = this.state;
    try {
      let contracts = await axios.get(`/contract/list/${net}`);
      if (contracts.data && contracts.data.length > 0) {
        this.setState({
          contracts: contracts.data,
          contractId: contracts.data[selectedContract]._id,
        });
      } else {
        this.cleanup();
      }
    } catch (err) {
      console.log(err);
    }
  };

  handleChangeContract = (e) => {
    const id = e.target.id;
    this.setState({
      [id]: e.target.value,
    });
  };

  handleChangeField = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  componentDidUpdate(prevProps, prevState) {
    const {contracts, contractId} = this.state;
    if (prevState.contractId != contractId) {
      this.refreshData();
    }
  }

  refreshData = () => {
    const {contracts, contractId} = this.state;
    let contract = null;
    let selectedContract = 0;
    contracts.forEach(item => {
      if (item._id == contractId) {
        contract = item;
        this.setState({
          selectedContract: selectedContract
        })
      }
      selectedContract++;
    });
    if (contract) {
      const decimals = contract.token.decimal;
      getInvestmentStatus(contract.contractAddress.crowdsale).then(weiAmount => {
        this.setState({
          paidEther: weiAmount / 10 ** decimals,
        });
      });

      const tokenAddress = contract.contractAddress.token;
      balanceOfToken(tokenAddress, getMetamaskAddress()).then(balance => {
        this.setState({
          boughtToken: balance / 10**decimals
        });
      });

      getTokenDetails(tokenAddress).then(token => {
        this.setState({
          token: {
            ...token,
            totalSupply: token.totalSupply / 10**token.decimals
          }
        });
      });

      this.setState({
        crowdsales: []
      });
      contract.contractAddress.crowdsale.map((item, key) => {
        getCrowdsaleDetails(item).then(details => {
          const _crowdsales = this.state.crowdsales;
          _crowdsales[key] = {
            ...details,
            tokensSold: details.tokensSold / 10**decimals
          };
          this.setState({
            crowdsales: _crowdsales
          });
        });
      });

      this.setState({
        pricingStrategy: []
      });
      contract.contractAddress.pricingStrategy.map((item, key) => {
        getPricingStrategyDetails(item).then(_pricingStrategy => {
          const ps = this.state.pricingStrategy;
          ps[key] = _pricingStrategy;
          this.setState({
            pricingStrategy: ps,
          });
        });
      });
    }
  };

  handleBuyTokens = (crowdsaleAddress, buyAmountETH) => {
    buyTokens(crowdsaleAddress, buyAmountETH).then(res => {
      swal("You bought tokens successfully", "", "success").then(res => {
        this.refreshData();
      });
    });
  };

  render() {
    const {contracts, contractId, paidEther, boughtToken, token, crowdsales, pricingStrategy, buyAmountETH} = this.state;
    console.log('pricingStrategy:', pricingStrategy);
    let network = "";
    let contract = null;
    contracts.forEach(item => {
      if (item._id == contractId) {
        contract = item;
      }
    });
    if (!!contract) {
      network = contract.network;
    }

    let etherscan, badge;
    if (network === 'rinkeby') {
      etherscan = "https://rinkeby.etherscan.io/address";
      badge = "success";
    } else {
      etherscan = "https://etherscan.io/address";
      badge = "primary";
    }

    let currAddr = getMetamaskAddress();

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs={12} md={6}>
            <FormGroup>
              <Label className="font-weight-bold" htmlFor="contractId">Tokens for Crowdsale: </Label>
              <Input type="select" id="contractId" placeholder="Choose the contract address" value={contractId} onChange={this.handleChangeContract}>
                {contracts.map((item, key) => <option key={key} value={item._id}>{item.token.name} ({item.contractAddress.token})</option>)}
              </Input>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col xs="12" sm="8">
            <Card>
              <CardBody>
                <Row>
                  <Col md={6} className="d-flex justify-content-center align-items-center flex-column mt-3">
                    <div className="font-xl text-uppercase">Ether You Invested</div>
                    <div className="font-4xl">{paidEther}</div>
                  </Col>
                  <Col md={6} className="d-flex justify-content-center align-items-center flex-column mt-3">
                    <div className="font-xl text-uppercase">Tokens You Bought</div>
                    <div className="font-4xl">{numberWithCommas(boughtToken)}</div>
                  </Col>
                </Row>
                
              </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Row>
                    <Col md={8} className="d-flex justify-content-center align-items-center flex-column mt-3">
                      <div className="font-xl text-uppercase">Number of Crowdsales: {crowdsales.length}</div>
                    </Col>
                  </Row>
                  {crowdsales.length != 0 && crowdsales.map((item, key) =>
                    <Jumbotron key={key} className="p-3">
                      <h4 className="ml-1 mb-3">{item.name}</h4>
                      <Row className="ml-1 mb-3">
                        <Col sm={6}>
                          <span className="font-weight-bold">Crowdsale Address </span>
                        </Col>
                        <Col sm={6}>
                          <span><a href={etherscan + "/" + item.address} target="_blank">{item.address && formatAddress(item.address)}</a></span>
                        </Col>
                      </Row>
                      <Row className="ml-1 mb-3">
                        <Col sm={6}>
                        <span className="font-weight-bold">Rate<HelpPopover placement="top" title="What's this?" content="How many Wei per one token (1 ETH = 10^18 Wei)"
                                                                            id={"help6-" + key}/>: </span>
                          {pricingStrategy[key] && <span>{pricingStrategy[key].rate} Wei per {token.symbol}</span>}
                        </Col>
                        <Col sm={6}>
                          <span className="font-weight-bold">Supply: </span>
                          <span>{item.supply} {token.symbol}</span>
                        </Col>
                      </Row>
                      <Row className="ml-1 mb-3">
                        <Col xs={12} md={6}>
                          <span className="font-weight-bold">Start: </span>
                          <span>{moment.unix(item.startsAt).format("YYYY-MM-DD HH:mm")}</span>
                        </Col>
                        <Col xs={12} md={6}>
                          <span className="font-weight-bold">End: </span>
                          <span>{moment.unix(item.endsAt).format("YYYY-MM-DD HH:mm")}</span>
                        </Col>
                      </Row>
                      <Row className="ml-1 mb-3">
                        <Col xs={12} md={6}>
                          <span className="font-weight-bold">Finalized: </span>
                          <span>{item.finalized ? <Badge color="success">YES</Badge> : <Badge color="secondary">NO</Badge>}</span>
                        </Col>
                        <Col xs={12} md={6}>
                          <span className="font-weight-bold">Halted: </span>
                          <span>{item.halted ? <Badge color="warning">YES</Badge> : <Badge color="success">NO</Badge>}</span>
                        </Col>
                      </Row>
                      { !item.halted && (
                        <div>
                          <Row className="ml-1 mb-3">
                            <Col xs={12} md={6}>
                              <span className="font-weight-bold">Enter Ether Amount:</span>
                            </Col>
                            <Col xs={12} md={6}>
                              <span className="font-weight-bold">To buy: </span>
                              {
                                pricingStrategy[key] && (
                                  buyAmountETH > 0 && (
                                    <span>
                                      <Badge color="success">{(buyAmountETH * 10**18) / pricingStrategy[key].rate}</Badge> {token.symbol} 
                                    </span>
                                  )
                                )
                              }
                            </Col>
                          </Row>
                          <Row className="ml-1 mb-3">
                            <Col xs={12} md={6}>
                              <span>
                                <FormGroup>
                                  <InputGroup>
                                    <Input className="text-left" type="number" id="buyAmountETH" value={buyAmountETH} onChange={this.handleChangeField}/>
                                    <InputGroupAddon addonType="append">
                                      <InputGroupText>ETH</InputGroupText>
                                    </InputGroupAddon>
                                  </InputGroup>
                                </FormGroup>
                              </span>
                            </Col>
                            <Col xs={12} md={6}>
                              <Button
                                disabled={buyAmountETH <= 0}
                                color="success" 
                                onClick={() => {this.handleBuyTokens(item.address, buyAmountETH)}}>
                                Buy
                              </Button>
                            </Col>
                          </Row>
                        </div>
                        )
                      }
                    </Jumbotron>
                  )
                  }
                </CardBody>
              </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card>
              <CardHeader>
                <div className="font-2xl mb-2">Token Information</div>
              </CardHeader>
              <CardBody>
                <Row className="mt-3">
                  <Col xs="12">
                    <span className="font-weight-bold">Name: </span><span className="float-right">{token.name}</span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs="12">
                    <span className="font-weight-bold">Symbol: </span><span className="float-right">{token.symbol}</span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs="12">
                    <span className="font-weight-bold">Decimals: </span><span className="float-right">{token.decimals}</span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs="12">
                    <span className="font-weight-bold">Total Supply: </span><span className="float-right">{token.totalSupply} {token.symbol}</span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs="12">
                    <span className="font-weight-bold">Mintable: </span><span className="float-right">{(!token.mintingFinished + "").toUpperCase()}</span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs="12">
                    <span className="font-weight-bold">Network: </span><span className="float-right"><Badge color={badge}>{network}</Badge></span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={12}>
                    <Label className="font-weight-bold" htmlFor="contractId">Token Address: </Label>
                    <span className="ml-3">
                      <a className="ml-3 float-left" href={etherscan + "/" + (contracts.length != 0 && contracts[0].contractAddress.token)} target="_blank">{contracts.length != 0 && formatAddress(contracts[0].contractAddress.token)}</a>
                    </span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={12}>
                    <Label className="font-weight-bold" htmlFor="contractId">Owner Address: </Label>
                    <span className="ml-3">
                      <a className="ml-3 float-left" href={etherscan + "/" + token.ownerAddress} target="_blank">{formatAddress(token.ownerAddress)}</a>
                    </span>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={12}>
                    <Label className="font-weight-bold" htmlFor="contractId">Current Wallet Address: </Label>
                    {currAddr && (
                      <span className="ml-3">
                        <a className="ml-3 float-left" href={etherscan + "/" + currAddr} target="_blank">{formatAddress(currAddr)}</a>
                      </span>
                      )
                    }
                  </Col>
                </Row>
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
    net: state.rootReducer.net,
  }
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewContract);
