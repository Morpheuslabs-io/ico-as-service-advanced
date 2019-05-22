import React, {Component} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
  FormFeedback
} from 'reactstrap';
import Swal from 'sweetalert2';
import validator from '../../containers/Utils/Validator';
import axios from "axios";
import swal from "sweetalert2";

class Register extends Component {

  state = {
    fullName: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    country: '',
    city: '',
    address: '',

    errors: {},
  };

  validator = validator(this, {
    'fullName': [
      {
        test: (val) => {
          return val.length > 0;
        },
        message: 'Please enter full name'
      },
    ],
    'email': [
      {
        test: (val) => {
          return val.length > 0;
        },
        message: 'Please enter email address'
      },
      {
        test: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,
        message: 'Email is not in valid format'
      },
    ],
    'password': [
      {
        test: (val) => {
          return val.length >= 6;
        },
        message: 'Please enter over 6 characters'
      }
    ],
    'confirm_password': [
      {
        test: (val) => {
          return val.length >= 6;
        },
        message: 'Please enter over 6 characters'
      },
      {
        test: (val) => {
          return val === this.state.password;
        },
        message: 'Password is not matched'
      }
    ],
    'country': [
      {
        test: (val) => {
          return val.length > 0;
        },
        message: 'Please enter country'
      }
    ],
    'address': [
      {
        test: (val) => {
          return val.length > 0;
        },
        message: 'Please enter address'
      }
    ],
    'city': [
      {
        test: (val) => {
          return val.length > 0;
        },
        message: 'Please enter city'
      }
    ],
  });

  handleInputChange = (e, id) => {
    this.setState({
      [id]: e.target.value,
    });
    this.validator.validatePair(e.target.value, id);
  };

  handleLogin = () => {
    this.props.history.push("/login");
  };

  handleRegister = () => {
    const {fullName, email, password, phone, country, city, address} = this.state;
    if (this.validator.validateFields(['fullName', 'email', 'password', 'confirm_password', 'country', 'address', 'city'])) {
      axios.post("/admin/auth/register", {
        email, password, fullName, phone, country, city, address, role: 'Admin'
      }).then(response => {
        swal("Success", "Created account successfully. Please check your email to verify", "info").then(ok => {
          this.props.history.push("/login");
        });
      }).catch(err => {
        console.log(`Register Error: ${err}`);
        swal("", "Registeration Error", "error");
      });
    }
  };

  render() {
    const {fullName, email, password, confirmed_password, phone, country, city, address} = this.state;

    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="12" lg="12" xl="10">
              <Card className="mx-4">
                <CardBody className="p-4">
                  <Form>
                    <h1 className="text-center text-primary">Register</h1>
                    <Row>
                      <Col xs="12" sm="6">
                        <InputGroup className="mt-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="icon-user"></i>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input value={fullName} type="text" placeholder="Full Name" autoComplete="fullName"
                                 onChange={e => this.handleInputChange(e, 'fullName')}
                                 invalid={this.validator.hasError('fullName')}/>
                          <FormFeedback
                            valid={!this.validator.hasError('fullName')}>{this.validator.getError('fullName')}</FormFeedback>
                        </InputGroup>
                      </Col>
                      <Col xs="12" sm="6">
                        <InputGroup className="mt-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>@</InputGroupText>
                          </InputGroupAddon>
                          <Input type="text" placeholder="Email" autoComplete="email"
                                 onChange={e => this.handleInputChange(e, 'email')}
                                 invalid={this.validator.hasError('email')}/>
                          <FormFeedback
                            valid={!this.validator.hasError('email')}>{this.validator.getError('email')}</FormFeedback>
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs="12" sm="6">
                        <InputGroup className="mt-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="icon-lock"></i>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input type="password" placeholder="Password" autoComplete="password"
                                 onChange={e => this.handleInputChange(e, 'password')}
                                 invalid={this.validator.hasError('password')}/>
                          <FormFeedback
                            valid={!this.validator.hasError('password')}>{this.validator.getError('password')}</FormFeedback>
                        </InputGroup>
                      </Col>
                      <Col xs="12" sm="6">
                        <InputGroup className="mt-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="icon-lock"></i>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input type="password" placeholder="Confirm password" autoComplete="confirm_password"
                                 onChange={e => this.handleInputChange(e, 'confirm_password')}
                                 invalid={this.validator.hasError('confirm_password')}/>
                          <FormFeedback
                            valid={!this.validator.hasError('confirm_password')}>{this.validator.getError('confirm_password')}</FormFeedback>
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs="12" sm="6">
                        <InputGroup className="mt-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="icon-phone"/>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input type="text" placeholder="Phone Number (Optional)" autoComplete="phone" name="phone"
                                 onChange={e => this.handleInputChange(e, 'phone')}/>
                        </InputGroup>
                      </Col>
                      <Col xs="12" sm="6">
                        <InputGroup className="mt-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="icon-location-pin"/>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input type="text" placeholder="Country" autoComplete="country" name="country"
                                 onChange={e => this.handleInputChange(e, 'country')}
                                 invalid={this.validator.hasError('country')}/>
                          <FormFeedback
                            valid={!this.validator.hasError('country')}>{this.validator.getError('country')}</FormFeedback>
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs="12" sm="6">
                        <InputGroup className="mt-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="icon-home"/>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input type="text" placeholder="Address" autoComplete="address" name="address"
                                 onChange={e => this.handleInputChange(e, 'address')}
                                 invalid={this.validator.hasError('address')}/>
                          <FormFeedback
                            valid={!this.validator.hasError('address')}>{this.validator.getError('address')}</FormFeedback>
                        </InputGroup>
                      </Col>
                      <Col xs="12" sm="6">
                        <InputGroup className="mt-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="icon-layers"/>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input type="text" placeholder="City" autoComplete="city" name="city"
                                 onChange={e => this.handleInputChange(e, 'city')}
                                 invalid={this.validator.hasError('city')}/>
                          <FormFeedback
                            valid={!this.validator.hasError('city')}>{this.validator.getError('city')}</FormFeedback>
                        </InputGroup>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-center mt-3">
                      <Button className="m-2" color="default" onClick={this.handleLogin}>Login</Button>
                      <Button className="m-2" color="primary" onClick={this.handleRegister}>Submit</Button>
                    </div>
                  </Form>
                </CardBody>
                <CardFooter className="p-4 d-none">
                  <Row>
                    <Col xs="12" sm="6">
                      <Button className="btn-facebook mb-1" block><span>facebook</span></Button>
                    </Col>
                    <Col xs="12" sm="6">
                      <Button className="btn-twitter mb-1" block><span>twitter</span></Button>
                    </Col>
                  </Row>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Register;
