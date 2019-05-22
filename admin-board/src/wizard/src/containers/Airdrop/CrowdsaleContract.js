import React, {Component} from "react";
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Jumbotron,
  Input
} from 'reactstrap';
import moment from "moment";
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import connect from "react-redux/es/connect/connect";
import swal from "sweetalert2";
import axios from "axios";

import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';

import {Table} from "antd";
import 'antd/dist/antd.css';

import {setToken} from "../../redux/actions";
import {
  addWhitelist, distributeReservedToken,
  finazlieCrowdsale,
  getCrowdsaleDetails,
  getMetamaskAddress,
  isContractOwner,
  getPricingStrategyDetails,
  isValidAddress, updateBeneficiary,
  updateEndTime,
  updateHaltStatus,
  updateRate,
  updateStartTime, formatAddress
} from "../../containers/Utils/blockchainHelper";
import HelpPopover from "../../containers/Components/HelpPopover";
import Widget02 from "../../containers/Components/Widget02";

class CrowdsaleContract extends Component {

  state = {
    newBeneficiary: '',
    dashboard: {
      weiRaised: 0,
      tokensSold: 0,
      investorCount: 0,
    },
    crowdsales: [
      {
        name: "",
        startsAt: 0,
        endsAt: 0,
        multisigWallet: "",
        minimumFundingGoal: 0,
        isWhiteListed: false,
        isMinimumGoalReached: false,
        isCrowdsaleFull: false,
        investorCount: 0,
        halted: false,
        finalized: false,
        canDistributeReservedTokens: false,
        areReservedTokensDistributed: false,
        supply: 0,
        weiRaised: 0,
        tokensSold: 0,
        owner:''
      },
    ],
    pricingStrategies: [
      {
        oneTokenInWei: 0,
      },
    ],
    oneTokenInWeiNew: 0,
    whitelists: [{
      w_address: "",
      w_min: 0,
      w_max: 0,
    }],
    tiers: []
  };

  componentDidMount() {
    this.initTiers();
  }

  componentDidUpdate(prevProps) {
    const {crowdsale, pricingStrategy} = this.props.contractAddress;
    const {token} = this.props;
    if (prevProps.contractAddress.crowdsale.length != crowdsale.length || prevProps.token != token) {
      crowdsale.map((cs, key) => {
        getCrowdsaleDetails(cs).then(_cs => {
          let _crowdsales = this.state.crowdsales;
          _crowdsales[key] = _cs;
          this.setState({
            crowdsales: _crowdsales
          });

          this.updateDashboardInfo();
          this.updateWhitelists(_crowdsales.length);
        });
      });
    }

    if (prevProps.contractAddress.pricingStrategy.length != pricingStrategy.length || prevProps.token != token) {
      const {token} = this.props;
      pricingStrategy.map((ps, key) => {
        getPricingStrategyDetails(ps).then(_pricingStrategy => {
          const ps = this.state.pricingStrategies;
          ps[key] = _pricingStrategy;
          this.setState({
            pricingStrategies: ps,
            oneTokenInWeiNew: ps.oneTokenInWei
          });
        });
      })
    }
  }

  updateDashboardInfo = () => {
    let weiRaised = 0;
    let tokensSold = 0;
    let investorCount = 0;
    for (const crowdsale of this.state.crowdsales) {
      weiRaised += crowdsale.weiRaised;
      tokensSold += crowdsale.tokensSold;
      investorCount += crowdsale.investorCount;
    }

    const {token} = this.props;
    weiRaised = weiRaised / 10**18;
    tokensSold = tokensSold / (10**token.decimals);
    this.setState({
      dashboard: {
        weiRaised,
        tokensSold,
        investorCount,
      }
    })
  };

  handleChangeCrowdsaleDateTime = (key, id, date) => {
    const {crowdsales} = this.state;
    crowdsales[key][id] = moment(date).unix();
    this.setState({
      crowdsales
    });
  };

  handleUpdateStartDateTime = (no) => {
    const {crowdsales} = this.state;
    const {crowdsale} = this.props.contractAddress;
    updateStartTime(crowdsale[no], crowdsales[no].startsAt)
      .then(response => swal("Updated start time", "", "success"))
      .catch(e => swal("Failed to update start time", "", "error"));
  };

  handleUpdateEndDateTime = (no) => {
    const {crowdsales} = this.state;
    const {crowdsale} = this.props.contractAddress;
    updateEndTime(crowdsale[no], crowdsales[no].endsAt)
      .then(response => swal("Updated end time", "", "success"))
      .catch(e => swal("Failed to update end time", "", "error"));
  };

  handleChangeRate = (no, e) => {
    let {oneTokenInWeiNew, pricingStrategies} = this.state;
    oneTokenInWeiNew = e.target.value;
    this.setState({
      oneTokenInWeiNew
    });
  };

  handleUpdateRate = (no, contractOwner) => {
    if (!isContractOwner(contractOwner)) {
      return;
    }
    const {crowdsale} = this.props.contractAddress;
    const {oneTokenInWeiNew} = this.state;
    updateRate(crowdsale[no], oneTokenInWeiNew)
      .then(response => {
        const {pricingStrategies} = this.state;
        pricingStrategies[no].oneTokenInWei = oneTokenInWeiNew;
        this.setState({
          pricingStrategies
        });
        swal("Updated rate successfully", "", "success")
      })
      .catch(err => swal("Failed to update rate", "", "error"));
  };

  handleHalt = (no, contractOwner) => {
    if (!isContractOwner(contractOwner)) {
      return;
    }
    const {crowdsale} = this.props.contractAddress;
    const {crowdsales} = this.state;
    crowdsales[no].halted = !crowdsales[no].halted;
    updateHaltStatus(crowdsale[no], crowdsales[no].halted)
      .then(response => {
        if (crowdsales[no].halted) {
          swal("Halted crowdsale successfully", "", "success");
        } else {
          swal("Unhalted crowdsale successfully", "", "success");
        }
        this.setState({
          crowdsales
        });
      })
      .catch(err => swal("Failed to update halt state", "", "error"));
  };

  handleFinalize = (no, contractOwner) => {
    if (!isContractOwner(contractOwner)) {
      return;
    }
    const {crowdsale} = this.props.contractAddress;
    const {crowdsales} = this.state;
    finazlieCrowdsale(crowdsale[no])
      .then(response => swal("Finalized crowdsale successfully", "", "success"))
      .catch(err => swal("Failed to finalize crowdsale", "", "error"));
  };

  handleChangeBeneficiary = (e) => {
    this.setState({
      newBeneficiary: e.target.value,
    });
  };

  handleUpdateBeneficiary = (contractOwner) => {
    if (!isContractOwner(contractOwner)) {
      return;
    }
    const {newBeneficiary, crowdsales} = this.state;
    const {crowdsale} = this.props.contractAddress;
    if (!isValidAddress(newBeneficiary)) {
      swal("Address is not valid", "", "error");
      return;
    } else {
      updateBeneficiary(crowdsale, newBeneficiary)
        .then(response => {
          swal("Updated beneficiary address", "", "success");
          for (let i = 0; i < crowdsales.length; i++) {
            crowdsales[i].multisigWallet = newBeneficiary;
          }
          this.setState({
            crowdsales
          });
        })
        .catch(err => swal("Failed to update beneficiary address", "", "error"));
    }
  };

  updateWhitelists = (count) => {
    const whitelists = [];
    for (let i = 0; i < count; i++) {
      whitelists.push({
        w_address: "",
        w_min: 0,
        w_max: 0,
      });
    }
    this.setState({
      whitelists
    })
  };

  handleChangeWAddress = (no, e) => {
    const {whitelists} = this.state;
    whitelists[no].w_address = e.target.value;
    this.setState({
      whitelists
    });
  };

  handleChangeWMin = (no, e) => {
    const {whitelists} = this.state;
    whitelists[no].w_min = parseFloat(e.target.value);
    this.setState({
      whitelists
    });
  };

  handleChangeWMax = (no, e) => {
    const {whitelists} = this.state;
    whitelists[no].w_max = parseFloat(e.target.value);
    this.setState({
      whitelists
    });
  };

  handleAddWhitelist = (no, contractOwner) => {
    if (!isContractOwner(contractOwner)) {
      return;
    }
    const {whitelists} = this.state;
    const {crowdsale} = this.props.contractAddress;
    const contractId = this.props.contractId;

    if (!isValidAddress(whitelists[no].w_address)) {
      swal("Address is not valid", "", "error");
      return;
    }
    if (parseFloat(whitelists[no].w_min) <= 0) {
      swal("Minimum amount should be great than 0", "", "error");
      return;
    }
    if (parseFloat(whitelists[no].w_max) <= 0) {
      swal("Maximum amount should be great than 0", "", "error");
      return;
    }
    addWhitelist(crowdsale[no], whitelists[no])
      .then(res => {
        axios.post("/contract/update-whitelist", {contractId: contractId, no: no, ...whitelists[no]}).then(res => {
          if (res.status == 200) {
            swal("Added to whitelist successfully", "", "success").then(() => {
              this.initTiers();
            });
          }
        });
      })
      .catch(err => swal("Failed to add whitelist address", "", "error"));
  };

  initTiers = () => {
    const contractId = this.props.contractId;
    axios.get("/contract/tiers?contractId=" + contractId).then(res => {
      this.setState({
        tiers: res.data
      });
    });
  };

  handleDistributeReservedToken = (contractOwner) => {
    if (!isContractOwner(contractOwner)) {
      return;
    }
    const {crowdsale} = this.props.contractAddress;
    distributeReservedToken(crowdsale[0]).then(res => {
      swal("Distributed tokens to 20 reserved addresses", "", "success");
    });
  };

  render() {
    const {network, token} = this.props;
    const {crowdsales, pricingStrategies, oneTokenInWeiNew, newBeneficiary, whitelists, tiers} = this.state;

    console.log('CrowsaleContract render - pricingStrategies:', pricingStrategies);

    let etherscan = network === 'rinkeby' ? "https://rinkeby.etherscan.io/address" : "https://etherscan.io/address";

    const whitelistColumns = [
      {
        title: 'Address',
        dataIndex: 'w_address',
        sorter: (a, b) => a.w_address.localeCompare(b.w_address),
        render: (text) => <a href={etherscan + "/" + text} target="_blank">{formatAddress(text)}</a>,
      },
      {
        title: 'Minimum',
        dataIndex: 'w_min',
        sorter: (a, b) => a.w_min - b.w_min,
        render: (text) => <span>{text + " " + token.symbol}</span>,
      },
      {
        title: 'Maximum',
        dataIndex: 'w_max',
        sorter: (a, b) => a.w_max - b.w_max,
        render: (text) => <span>{text + " " + token.symbol}</span>,
      }
    ];
    return (
      <div>
        <Row>
          <Col sm={4}>
            <Widget02 header={this.state.dashboard.investorCount + ""} mainText="Investors" icon="fa fa-user-plus" color="primary" variant="1"/>
          </Col>
          <Col sm={4}>
            <Widget02 header={this.state.dashboard.weiRaised + ""} mainText="Raised Ether" icon="fa fa-money" color="success" variant="1"/>
          </Col>
          <Col sm={4}>
            <Widget02 header={this.state.dashboard.tokensSold + ""} mainText="Tokens Sold" icon="fa fa-credit-card" color="info" variant="1"/>
          </Col>
        </Row>
        <Card>
          <CardHeader>
            <h2 className="mb-0 text-dark">Crowdsale</h2>
          </CardHeader>
          <CardBody>
            <div className="font-2xl mb-3">Information:</div>
            <Jumbotron className="p-3">
              <Row className="ml-1 mb-3 mt-3">
                <Col sm={6}>
                <span className="font-weight-bold">Owner Address
                  <HelpPopover placement="top" title="What's this?" content="Wallet address used to deploy the contract." id="help1"/> </span>
                </Col>
                <Col sm={6}>
                <span>
                  <a href={etherscan + "/" + crowdsales[0].owner} target="_blank">{formatAddress(crowdsales[0].owner)}</a></span>
                </Col>
              </Row>
              <Row className="ml-1 mb-3 mt-3">
                <Col sm={6}>
                <span className="font-weight-bold">Beneficiary Address
                  <HelpPopover placement="top" title="What's this?" content="Wallet address of the ICO owner." id="help1"/> </span>
                </Col>
                <Col sm={6}>
                <span>
                  <a href={etherscan + "/" + crowdsales[0].multisigWallet} target="_blank">{formatAddress(crowdsales[0].multisigWallet)}</a></span>
                </Col>
              </Row>
              <Row className="ml-1 mb-3">
                <Col xs="12" md="6">
                  <span className="font-weight-bold">Min Cap<HelpPopover placement="top" title="What's this?" content="Minimum ammount of tokens every buyer can buy." id="help2"/>: </span>
                  <span>{token.mincap} {token.symbol}</span>
                </Col>
                <Col xs="12" md="6">
                  <span className="font-weight-bold">Whitelisted: </span>
                  <span>{crowdsales[0].isWhiteListed ? <Badge color="success">YES</Badge> : <Badge color="secondary">NO</Badge>}</span>
                </Col>
              </Row>
              <Row className="ml-1 mb-3">
                <Col xs="12" md="6">
                  <span className="font-weight-bold">Reserved Token Distributed: </span>
                  <span>{crowdsales[0].areReservedTokensDistributed ? <Badge color="success">YES</Badge> : <Badge color="secondary">NO</Badge>}</span>
                </Col>
                <Col xs="12" md="6">
                  <span className="font-weight-bold">Can Distribute Reserved Token: </span>
                  <span>{crowdsales[0].canDistributeReservedTokens ? <Badge color="success">YES</Badge> : <Badge color="secondary">NO</Badge>}</span>
                </Col>
              </Row>
              <hr/>
              <Row className="ml-1 mb-3">
                <Col xs="12" md="6">
                <span className="font-weight-bold">Set Beneficiary Address
                  <HelpPopover placement="top" title="What's this?" content="Change the Beneficiary wallet address." id="help2"/>: </span>
                  <div className="d-flex mt-1">
                    <Input className="mr-2" type="text" value={newBeneficiary} onChange={this.handleChangeBeneficiary}
                           title="Beneficiary Address"/>
                    <Button className="float-right" color="primary" 
                            onClick={() => {this.handleUpdateBeneficiary(crowdsales[0].owner)}}>Update</Button>
                  </div>
                </Col>
                {crowdsales[0].canDistributeReservedTokens &&
                <Col xs="12" md="6">
                <span className="font-weight-bold">Distribute Reserved Token
                  <HelpPopover placement="top" title="What's this?" content="Distributes reserved tokens to 20 reserved addresses. Should be called before finalization" id="help9"/>: </span>
                  <div className="mt-1">
                    <Button className="float-right" color="primary" onClick={() => {this.handleDistributeReservedToken(crowdsales[0].owner)}}>Distribute</Button>
                  </div>
                </Col>}
              </Row>
            </Jumbotron>

            <div className="font-2xl mb-3">Number of Tiers: {crowdsales.length}</div>
            {crowdsales.length != 0 &&
            crowdsales.map((item, key) =>
              <Jumbotron key={key} className="p-3">
                <h4 className="ml-1 mb-3">{item.name}</h4>
                <Row className="ml-1 mb-3">
                  <Col sm={6}>
                    <span className="font-weight-bold">Crowdsale Address </span>
                  </Col>
                  <Col sm={6}>
                    <span><a href={etherscan + "/" + this.props.contractAddress.crowdsale[key]} target="_blank">{this.props.contractAddress.crowdsale[key] && formatAddress(this.props.contractAddress.crowdsale[key])}</a></span>
                  </Col>
                </Row>
                <Row className="ml-1 mb-3">
                  <Col sm={6}>
                  <span className="font-weight-bold">Rate<HelpPopover placement="top" title="What's this?" content="How many Wei per one token (1 ETH = 10^18 Wei)"
                                                                      id={"help6-" + key}/>: </span>
                    {pricingStrategies[key] && <span>{pricingStrategies[key].oneTokenInWei} Wei per {token.symbol}</span>}
                  </Col>
                  <Col sm={6}>
                    <span className="font-weight-bold">Supply: </span>
                    <span>{item.supply} {token.symbol}</span>
                  </Col>
                </Row>
                <Row className="ml-1 mb-3">
                  <Col sm={6}></Col>
                  <Col sm={6}>
                    <span className="font-weight-bold">Allowed to Modify: </span>
                    <span>{tiers[key] && tiers[key].allowModifying == "yes" ? <Badge color="success">YES</Badge> : <Badge color="secondary">NO</Badge>}</span>
                  </Col>
                </Row>
                <Row className="ml-1 mb-3">
                  <Col xs={12} md={6}>
                    <span className="font-weight-bold">Start: </span>
                    <span>{tiers[key] && moment(tiers[key].startDate).format("YYYY/MM/DD HH:mm:ss")}</span>
                  </Col>
                  <Col xs={12} md={6}>
                    <span className="font-weight-bold">Lock: </span>
                    <span>{tiers[key] && moment(tiers[key].lockDate).format("YYYY/MM/DD")}</span>
                  </Col>
                </Row>
                <Row className="ml-1 mb-3">
                  <Col xs={12} md={6}>
                    <span className="font-weight-bold">End: </span>
                    <span>{tiers[key] && moment(tiers[key].endDate).format("YYYY/MM/DD HH:mm:ss")}</span>
                  </Col>
                  <Col xs={12} md={6}>
                    <span className="font-weight-bold">Unlock: </span>
                    <span>{tiers[key] && moment(tiers[key].unlockDate).format("YYYY/MM/DD")}</span>
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
                <hr/>
                <h5 className="ml-1 mb-3">Operations</h5>
                {
                  tiers[key] && tiers[key].allowModifying == "yes" &&
                  <Row className="ml-1 mb-3">
                    <Col sm={6}>
                      <Row>
                        <Col sm={12} className="font-weight-bold mb-1">
                          Update StartTime
                          <HelpPopover placement="top" title="What's this?" content="Update the start date time of current crowdsale." id={"help4-" + key}/>: </Col>
                        <Col sm={12} className="mb-1">
                          <DatePicker
                            className="form-control"
                            selected={moment.unix(item.startsAt)}
                            onChange={(date) => this.handleChangeCrowdsaleDateTime(key, "startsAt", date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="YYYY-MM-DD HH:mm a"
                            timeCaption="Time" dropdownMode="select"/>
                          <Button className="float-right" color="primary" onClick={(e) => this.handleUpdateStartDateTime(key)}>Update</Button>
                        </Col>
                      </Row>
                    </Col>
                    <Col sm={6}>
                      <Row>
                        <Col sm={12} className="font-weight-bold mb-1">
                          Update EndTime
                          <HelpPopover placement="top" title="What's this?" content="Update the end date time of current crowdsale." id={"help5-" + key}/>: </Col>
                        <Col sm={12} className="mb-1">
                          <DatePicker
                            className="form-control"
                            selected={moment.unix(item.endsAt)}
                            onChange={(date) => this.handleChangeCrowdsaleDateTime(key, "endsAt", date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="YYYY-MM-DD HH:mm a"
                            timeCaption="Time" dropdownMode="select"/>
                          <Button className="float-right" color="primary" onClick={(e) => this.handleUpdateEndDateTime(key)}>Update</Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                }
                <Row className="ml-1 mb-3">
                  <Col sm={6}>
                    <Row>
                      <Col sm={12} className="font-weight-bold mb-1">
                        Update Rate
                        <HelpPopover placement="top" title="What's this?" content="Update the rate of current crowdsale." id={"help3-" + key}/>: </Col>
                      <Col sm={12} className="mb-1 d-flex">
                        <Input className="mr-2" type="number" value={oneTokenInWeiNew} onChange={e => this.handleChangeRate(key, e)}
                               placeholder="Rate"
                               title="Rate"/>
                        <Button className="float-right" color="primary" onClick={(e) => this.handleUpdateRate(key, crowdsales[0].owner)}>Update</Button>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={6}>
                    <Row>
                      <Col sm={12} className="font-weight-bold mb-1">
                        {crowdsales[0].halted ? `Crowdsale is being halted` : `Crowdsale is running`}
                        <HelpPopover placement="top" title="What's this?" content="Emergency stop and resume crowdsale." id={"help7-" + key}/>: </Col>
                      <Col sm={12} className="mb-1">
                        <Button className="float-right" color="primary" onClick={(e) => this.handleHalt(key, crowdsales[0].owner)}>{item.halted ? "Unhalt" : "Halt"} Crowdsale</Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="ml-1 mb-3">
                  <Col sm={6}>
                    <Row>
                      <Col sm={12} className="mb-1">
                        <Button className="float-left" color="success" onClick={(e) => this.handleFinalize(key, crowdsales[0].owner)}>Finalize Crowdsale</Button>
                        <HelpPopover placement="top" title="What's this?" content="Finalize a succcesful crowdsale." id={"help8-" + key}/>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <hr/>
                <Row className="ml-1 mt-2">
                  <Col xs={12}>
                    {tiers[key] && tiers[key].whitelist.length != 0 && <div className="ml-1">
                      <div className="font-xl mb-2 mt-2">Whitelist ({tiers[key].whitelist.length})</div>
                      <Table size="middle" columns={whitelistColumns} dataSource={tiers[key].whitelist} pagination={{pageSize: 5}}
                             style={{background: "#FFF", color: "#888", borderColor: "#FFF"}} bordered/>
                      <hr/>
                      <div className="d-flex justify-content-between">
                        <Input className="col-sm-4" type="text" value={whitelists[key] && whitelists[key].w_address} onChange={e => this.handleChangeWAddress(key, e)}
                               placeholder="Whitelist address" title="Address"/>
                        <Input className="col-sm-2" type="text" value={whitelists[key] && whitelists[key].w_min} onChange={e => this.handleChangeWMin(key, e)}
                               placeholder="Min Amount" title="Minimum amount"/>
                        <Input className="col-sm-2" type="text" value={whitelists[key] && whitelists[key].w_max} onChange={e => this.handleChangeWMax(key, e)}
                               placeholder="Max Amount" title="Maximum amount"/>
                        <Button className="float-right" color="primary" onClick={(e) => this.handleAddWhitelist(key, crowdsales[0].owner)}>Add to whitelist</Button>
                      </div>
                      <hr/>
                    </div>
                    }
                  </Col>
                </Row>
              </Jumbotron>
            )
            }
          </CardBody>
        </Card>
      </div>
    );
  }
}

CrowdsaleContract.propTypes = {
  network: PropTypes.string.isRequired,
  contractAddress: PropTypes.object.isRequired,
  tiers: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return {
    token: state.rootReducer.token,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setToken: bindActionCreators(setToken, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CrowdsaleContract);
