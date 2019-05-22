import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import axios from "axios";
import moment from "moment";
import _ from "lodash";
import {Table} from "antd"
import {Link} from "react-router-dom";

class User extends Component {

  state = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    wallets: [],
    payments: [],
    orders: [],
  };

  componentDidMount() {
    this.initData();
  }

  initData = () => {
    const id = this.props.match.params.id;
    axios.get("/admin/users/getinfo/"+id).then(response => {
      this.setState({
        fullName: response.data.user.fullName,
        email:  response.data.user.email,
        phone:  response.data.user.phone,
        address:  response.data.user.address,
        city:  response.data.user.city,
        country:  response.data.user.country,
        wallets:  response.data.user.wallets,
        payments:  response.data.user.payments,
        orders:  response.data.user.orders,
        createdAt: response.data.user.createdAt,
      });
    }).catch(err => {
      console.log(err.message);
    });
  };

  render() {

    const {fullName, email, phone, address, city, country, createdAt, wallets, payments, orders} = this.state;

    const {data} = this.state;
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
    ];

    return (
      <div className="animated fadeIn">
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <h2 className="mb-0 text-dark">{_.startCase(_.toLower(fullName))}</h2>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs={12} sm={4}>
                    <span>Email: </span><span className="lead font-weight-normal"><a href={"mailto:"+email}>{email}</a></span>
                  </Col>
                  <Col xs={12} sm={4}>
                    <span>Address: </span><span className="lead font-weight-normal">{address}</span>
                  </Col>
                  <Col xs={12} sm={4}>
                    <span>City: </span><span className="lead font-weight-normal">{city}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={4}>
                    <span>Phone: </span><span className="lead font-weight-normal">{_.isEmpty(phone)?"None":phone}</span>
                  </Col>
                  <Col xs={12} sm={4}>
                    <span>Country: </span><span className="lead font-weight-normal">{country}</span>
                  </Col>
                  <Col xs={12} sm={4}>
                    <span>Created At: </span><span className="lead font-weight-normal">{moment(createdAt).format("YYYY/MM/DD HH:mm:ss")}</span>
                  </Col>
                </Row>
                <div className="font-2xl mb-2 mt-3">Transaction History</div>
                <Row>
                  <Col xs={12}>
                    <Table />
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

export default User;
