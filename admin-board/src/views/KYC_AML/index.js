import React, {Component} from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Input,
  Label
} from 'reactstrap';
import {Table, Popconfirm} from 'antd';
import '../../../node_modules/antd/dist/antd.css';

import defaultKYC from "../../assets/img/kyc_default.png";
import axios from "axios";
import moment from "moment";
import {Link, Redirect} from "react-router-dom";

import "react-image-gallery/styles/css/image-gallery.css";
import connect from "react-redux/es/connect/connect";
import swal from "sweetalert2";

import {
  formatAddress,
  getCrowdsaleDetails,
  setWhiteListMultiple,
  isContractOwner,
  isUiEnabled
} from "../../containers/Utils/blockchainHelper";

class KYC_AML extends Component {

  state = {
    data: [],
    contracts: [],
    currContractId: '0'
  };

  async componentDidMount() {
    const net = this.props.net.type
    await this.initData("", net);
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.net.type !== nextProps.net.type) {
      await this.initData("", nextProps.net.type);
    }
  }

  initData = async (contractId = "", net) => {
    const reqUrl = "/admin/kyc-aml/list" + (contractId != "" ? "?contractId=" + contractId : "");
    try {
      let response = await axios.get(reqUrl)
      let data = [];
      for (let i = 0; i < response.data.length; i++) {
        const obj = {
          id: response.data[i]._id,
          fullName: response.data[i].userId.fullName,
          ethAddress: response.data[i].userId.ethAddress,
          whitelisted: response.data[i].userId.whitelisted,
          email: response.data[i].userId.email,
          address: response.data[i].userId.address,
          city: response.data[i].userId.city,
          country: response.data[i].userId.country,
          adminVerified: response.data[i].adminVerified,
          onlineVerified: response.data[i].onlineVerified,
          poi: response.data[i].poi.status,
          poiDocType: response.data[i].poi.doctype,
          poiPhotos: response.data[i].poi.photos,
          pof: response.data[i].pof.status,
          pofDocType: response.data[i].pof.doctype,
          pofPhotos: response.data[i].pof.photos,
          createdAt: moment(response.data[i].createdAt).format('YYYY/MM/DD HH:mm:ss'),
        };
        data.push(obj);
      }
      this.setState({
        ...this.state,
        data: data
      });
    } catch(err) {
      console.log(err);
    }

    try {
      let contracts = await axios.get(`/admin/contract/list/${net}`)
      this.setState({
        ...this.state,
        contracts: contracts.data
      })
    } catch (err) {
      console.log(err);
    }
  }

  handleChangeContract = evt => {
    let contractId = evt.target.value;
    this.setState({
      currContractId: contractId
    })
    this.initData(contractId, this.props.net.type);
  };

  handleWhitelist = async () => {
    const {data} = this.state;
    let unwhitelisted = [];
    let status = [];
    let cap = [];
    for (let i=0; i<data.length; i++) {
      if (data[i].whitelisted == 'no') {
        unwhitelisted.push(data[i].ethAddress);
        status.push(true);
        cap.push(1);
      }
    }
    console.log('handleWhitelist:', unwhitelisted);
    if (unwhitelisted.length === 0) {
      swal("No any un-whitelisted entries", "", "warning");
      return;
    }
    let currContractData = this.state.contracts[this.state.currContractId];
    let crowdsale = currContractData.contractAddress.crowdsale;

    let allCrowdSaleHalted = true;
    for (let i=0; i<crowdsale.length; i++) {
      let crowdsaleAddr = crowdsale[i];
      let crowdsaleData = await getCrowdsaleDetails(crowdsaleAddr);
      
      if (!isContractOwner(crowdsaleData.owner)) {
        return;
      }

      if (crowdsaleData.halted) {
        continue;
      }

      allCrowdSaleHalted = false;

      try {
          await setWhiteListMultiple(crowdsaleAddr, unwhitelisted, status, cap, cap)
          swal("Whitelist submitted successfully", "", "success")
      } catch (err) {
        swal("Whitelist submitted error", "", "error")
      }
    }

    if (allCrowdSaleHalted) {
      swal("No open crowdsale at the moment", "", "warning");
      return;
    }
  }

  removeKYC = id => {
    axios.delete("/admin/kyc-aml/" + id).then(response => {
      this.initData("", this.props.net.type);
    }).catch(err => console.log(err));
  };

  render() {

    if (!isUiEnabled(this.props.auth.user.uiconfig, 'kyc & aml')) {
      return <Redirect to="/uisetting"/>
    }

    const {data, contracts} = this.state;
    const net = this.props.net.type
    let etherscan = net === 'rinkeby' ? "https://rinkeby.etherscan.io/address" : "https://etherscan.io/address";
    const columns = [
      {
        title: 'Full Name',
        dataIndex: 'fullName',
        sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        render: (text, record) => <Link to={"/kyc-aml/" + record.id}>{text}</Link>
      },
      {
        title: 'Email',
        dataIndex: 'email',
        sorter: (a, b) => a.email.localeCompare(b.email),
      },
      {
        title: 'Wallet address',
        dataIndex: 'ethAddress',
        sorter: (a, b) => a.ethAddress.localeCompare(b.ethAddress),
        render: (text, record) => <a href={etherscan + "/" + text} target="_blank">{formatAddress(text)}</a>
      },
      {
        title: 'Whitelisted',
        dataIndex: 'whitelisted',
        sorter: (a, b) => a.whitelisted.localeCompare(b.whitelisted),
        render: val => <Badge
          color={val == "yes" ? "success" : "danger"}> {val} </Badge>
      },
      {
        title: 'Admin Verified',
        dataIndex: 'adminVerified',
        sorter: (a, b) => a.adminVerified.localeCompare(b.adminVerified),
        render: val => <Badge
          color={val == "Pending" ? "secondary" : val == "Verified" ? "success" : "danger"}>{val}</Badge>
      },
      {
        title: 'Online Verified',
        dataIndex: 'onlineVerified',
        sorter: (a, b) => a.onlineVerified.localeCompare(b.onlineVerified),
        render: val => <Badge
          color={val == "Pending" ? "secondary" : val == "Verified" ? "success" : "danger"}>{val}</Badge>
      },
      {
        title: 'Proof of Identity',
        dataIndex: 'poi',
        sorter: (a, b) => a.poi.localeCompare(b.poi),
        render: val => <Badge
          color={val == "Pending" ? "secondary" : val == "Verified" ? "success" : "danger"}>{val}</Badge>
      },
      {
        title: 'Proof of Funds',
        dataIndex: 'pof',
        sorter: (a, b) => a.pof.localeCompare(b.pof),
        render: val => <Badge
          color={val == "Pending" ? "secondary" : val == "Verified" ? "success" : "danger"}>{val}</Badge>
      },
      {
        title: 'Address',
        dataIndex: 'address',
        sorter: (a, b) => a.address.localeCompare(b.address),
      },
      {
        title: 'City',
        dataIndex: 'city',
        sorter: (a, b) => a.city.localeCompare(b.city),
      },
      {
        title: 'Country',
        dataIndex: 'country',
        sorter: (a, b) => a.country.localeCompare(b.country),
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        sorter: (a, b) => moment(a.createdAt).subtract(moment(b.createdAt)),
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Popconfirm title="Sure to delete?" onConfirm={() => this.removeKYC(record.id)}>
            <Button className="icon btn-sm" color="secondary"><i className="icon-trash"/></Button>
          </Popconfirm>
        ),
      }
    ];

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12">
            <Card>
              <CardHeader>
                <h2 className="mb-0 text-dark">KYC & AML</h2>
              </CardHeader>
              <CardBody>
                <Row className="mb-2">
                  <Col xs={12} md={3} className="form-inline">
                    <div className="position-relative form-group">
                      <Label for="contracts" className="mr-2">Token Contracts: </Label>
                      {contracts.length != 0 ?
                      <Input type="select" name="contracts" id="contracts" onChange={this.handleChangeContract}>
                        {contracts.map((item, key) => <option key={key} value={item._id}>
                            {item.token.name + " (" + item.token.symbol + ") - " + moment(item.createdAt).format("YYYY/MM/DD")}
                          </option>
                        )}
                      </Input>
                        :
                        ("None")
                      }
                    </div>
                  </Col>
                </Row>
                <Row>
                  { contracts.length != 0 && 
                    <Col xs={12}>
                      <Table scroll={{ x: true}} columns={columns} dataSource={data} pagination={{pageSize: 10}}/>
                    </Col>
                  }
                </Row>
                <Row className="mb-2">
                  { contracts.length != 0 && 
                    <Col xs={12} md={3}>
                      <Button className="float-left" color="primary" 
                        onClick={this.handleWhitelist}>
                        Submit un-whitelisted entries
                      </Button>
                    </Col>
                  }
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
    auth: state.rootReducer.auth,
  }
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(KYC_AML);