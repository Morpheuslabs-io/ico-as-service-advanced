import React, {Component} from "react";
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Input,
} from 'reactstrap';
import swal from "sweetalert2";
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import connect from "react-redux/es/connect/connect";
import {setToken} from "../../redux/actions";
import {
  getTokenDetails, getMetamaskAddress, isValidAddress, 
  transferOwnershipOfToken, balanceOfToken, claimTokens,
  isContractOwner, formatAddress
} from "../../containers/Utils/blockchainHelper";
import HelpPopover from "../../containers/Components/HelpPopover";

class TokenContract extends Component {

  state = {
    newOwner: '',
    investorAddress: "",
    gotBalance: 0,
    claimTokenAddress: "",
  };

  componentDidMount() {
    const {contractAddress, setToken} = this.props;
    getTokenDetails(contractAddress).then(token => {
      setToken({
        ...token,
        totalSupply: token.totalSupply / 10**token.decimals
      });
    });
  }

  handleChangeInput = e => {
    this.setState({
      [e.target.id]: e.target.value
    })
  };

  handleTransferOwnership = (contractOwner) => {
    if (!isContractOwner(contractOwner)) {
      return;
    }
    const {newOwner} = this.state;
    const {contractAddress} = this.props;
    if (!isValidAddress(newOwner)) {
      swal("Please input valid ethereum address", "", "warning");
      return;
    }
    transferOwnershipOfToken(contractAddress, newOwner)
      .then(() => swal("Transferred ownership to ", newOwner, "success"))
      .catch(err => swal("Error on transferring ownership", "", "error"));
  };

  handleBalanceOf = () => {
    const {investorAddress} = this.state;
    const {contractAddress, token} = this.props;
    if (!isValidAddress(investorAddress)) {
      swal("Please input valid ethereum address", "", "warning");
      return;
    }
    balanceOfToken(contractAddress, investorAddress)
      .then(balance => {
        this.setState({
          gotBalance: balance / 10**token.decimals
        });
      })
      .catch(err => swal("Error on transferring ownership", "", "error"));
  };

  handleClaimTokens = (contractOwner) => {
    if (!isContractOwner(contractOwner)) {
      return;
    }
    const {claimTokenAddress} = this.state;
    const {contractAddress} = this.props;
    if (!isValidAddress(claimTokenAddress)) {
      swal("Please input valid ethereum address", "", "warning");
      return;
    }
    claimTokens(contractAddress, claimTokenAddress)
      .then(() => swal("Claimed tokens successfully", "", "success"))
      .catch(err => swal("Error on claiming tokens", "", "error"));
  };

  render() {
    const {newOwner, investorAddress, gotBalance, claimTokenAddress} = this.state;
    const {token, network, contractAddress} = this.props;
    let etherscan = network === 'rinkeby' ? "https://rinkeby.etherscan.io/address" : "https://etherscan.io/address";

    return (
      <Card>
        <CardHeader>
          <h2 className="mb-0 text-dark">Token</h2>
        </CardHeader>
        <CardBody>
          <div className="font-2xl">Information:</div>
          <div className="p-3">
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
            <hr/>
            <Row className="mt-3">
              <Col xs="12" className="text-truncate">
                <span className="font-weight-bold">Owner Address: </span>&nbsp;
                <span className="float-left">
                  <a href={etherscan + "/" + token.ownerAddress} target="_blank">
                    {formatAddress(token.ownerAddress)}
                  </a>
                </span>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col xs="12" className="text-truncate">
                <span className="font-weight-bold">Token Address: </span>&nbsp;<span className="float-left">
                  <a href={etherscan + "/" + contractAddress} target="_blank">{formatAddress(contractAddress)}</a></span>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col xs="12" className="text-truncate">
                <span className="font-weight-bold">Release Agent
                  <HelpPopover placement="top" title="What's this?" content="The finalizer contract that allows unlift the transfer limits on this token." id="help4"/>: </span><span className="float-left">
                  <a href={etherscan + "/" + token.releaseAgent} target="_blank">{formatAddress(token.releaseAgent)}</a></span>
              </Col>
            </Row>
            <hr/>
            <Row className="mt-3">
              <Col sm={12} className="font-weight-bold mb-1">
                Get balance of address
                <HelpPopover placement="top" title="What's this?" content="Get the token balances of investor's ethereum address." id="help2"/>:</Col>
              <Col sm={12} className="mb-1"><Input type="text" id="investorAddress" value={investorAddress} onChange={this.handleChangeInput} placeholder="Investor address"/></Col>
              <Col sm={12} className="mb-1 d-flex justify-content-between align-items-center">
                <div className="float-left">
                  {gotBalance + " " + token.symbol}
                </div>
                <Button className="float-right" color="primary" onClick={this.handleBalanceOf}>Get Balance</Button>
              </Col>
            </Row>
            <hr/>
            <Row className="mt-3">
              <Col sm={12} className="font-weight-bold mb-1">
                Transfer ownership to new address
                <HelpPopover placement="top" title="What's this?" content="Transfer ownership of token contract to new owner ethereum address." id="help1"/>:</Col>
              <Col sm={12} className="mb-1">
                <Input type="text" id="newOwner" value={newOwner} onChange={this.handleChangeInput} placeholder="New owner address"
                       title="Transfer ownership to new address"/></Col>
              <Col sm={12} className="mb-1">
                <Button className="float-right" color="primary" 
                        onClick={() => {this.handleTransferOwnership(token.ownerAddress)}}>Transfer Ownership</Button></Col>
            </Row>
            <hr/>
            <Row className="mt-3">
              <Col sm={12} className="font-weight-bold mb-1">
                Claim Tokens:
                <HelpPopover placement="top" title="What's this?" content="Claim tokens that were accidentally sent to this token contract." id="help3"/>:</Col>
              <Col sm={12} className="mb-1"><Input type="text" id="claimTokenAddress" value={claimTokenAddress} onChange={this.handleChangeInput}
                                                   placeholder="Token contract address that you want to recover"/></Col>
              <Col sm={12} className="mb-1">
                <Button className="float-right" color="primary" onClick={this.handleClaimTokens}>Claim Tokens</Button>
              </Col>
            </Row>
          </div>
        </CardBody>
      </Card>
    );
  }
}

TokenContract.propTypes = {
  contractAddress: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(TokenContract);
