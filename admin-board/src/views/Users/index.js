import React, {Component} from 'react';
import {Link, Redirect} from 'react-router-dom';
import {Card, CardBody, CardHeader, Col, Row, Input, Label} from 'reactstrap';

import axios from "axios";
import moment from "moment";
import {Popconfirm, Table} from "antd";
import '../../../node_modules/antd/dist/antd.css';

import connect from "react-redux/es/connect/connect";

import {
  isUiEnabled
} from "../../containers/Utils/blockchainHelper";

class Users extends Component {

  state = {
    data: [],
    contracts: []
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
    const reqUrl = "/admin/users" + (contractId != "" ? "?contractId=" + contractId : "");
    try {
      let response = await axios.get(reqUrl)
      let data = [];
      for (let i = 0; i < response.data.length; i++) {
        const obj = {
          id: response.data[i]._id,
          fullName: response.data[i].fullName,
          email: response.data[i].email,
          address: response.data[i].address,
          city: response.data[i].city,
          country: response.data[i].country,
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

  handleChangeContract = async (evt) => {
    await this.initData(evt.target.value, this.props.net.type);
  };

  removeUser = async (id) => {
    try {
      await axios.delete("/admin/users/" + id)
      await this.initData("", this.props.net.type);
    } catch(err) {
      console.log(err)
    }
  };

  render() {
    if (!isUiEnabled(this.props.auth.user.uiconfig, 'investors')) {
      return <Redirect to="/uisetting"/>
    }

    const {data, contracts} = this.state;
    const columns = [
      {
        title: 'Full Name',
        dataIndex: 'fullName',
        sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        render: (text, record) => <Link to={"/investors/" + record.id}>{text}</Link>
      },
      {
        title: 'Email',
        dataIndex: 'email',
        sorter: (a, b) => a.email.localeCompare(b.email),
        render: (text, record) => <Link to={"/investors/" + record.id}>{text}</Link>
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
      // {
      //   title: 'Action',
      //   key: 'action',
      //   render: (text, record) => (
      //     <Popconfirm title="Sure to delete?" onConfirm={() => this.removeUser(record.id)}>
      //       <Button className="icon btn-sm" color="secondary"><i className="icon-trash"/></Button>
      //     </Popconfirm>
      //   ),
      // }
    ];

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h2 className="mb-0 text-dark">Investors</h2>
              </CardHeader>
              <CardBody>
                <Row className="mb-2">
                  <Col xs={12} md={3} className="form-inline">
                    <div className="position-relative form-group">
                      <Label for="contracts" className="mr-2">Contracts: </Label>
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
                  <Col xs={12}>
                    <Table columns={columns} dataSource={data} pagination={{pageSize: 10}}/>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(Users);