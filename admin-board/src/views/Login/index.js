import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {
  Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row,
  FormFeedback, Alert
} from 'reactstrap';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {setAuth, setAlert} from "../../redux/actions";
import validator from '../../containers/Utils/Validator';
import axios from "axios";
import {setAuthorizationHeader} from "../../containers/Utils/Util";
import {
  isUiEnabled
} from "../../containers/Utils/blockchainHelper";

class Login extends Component {

  state = {
    email: '',
    password: '',
    visible: true,
  };

  validator = validator(this, {
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
  });

  componentDidMount() {
    setTimeout(() => this.props.setAlert(""), 3000);
  };

  handleInputChange = (e, id) => {
    this.setState({
      [id]: e.target.value,
    });
    this.validator.validatePair(e.target.value, id);
  };

  handleLogin = () => {
    const {setAuth, auth} = this.props;
    const {email, password} = this.state;
    if (this.validator.validateFields(['email', 'password'])) {
      axios.post("/admin/auth/login", {
        email, password
      }).then(response => {

        localStorage.setItem('token', response.data.token.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setAuth({
          token: response.data.token.accessToken,
          user: response.data.user
        });

        setAuthorizationHeader(response.data.token.accessToken);
        
        this.props.history.push('/dashboard');
      }).catch(err => {

        console.log(`Login Error: ${err}`);
      });
    }
  };

  handleForgotPassword = () => {
    this.props.history.push("/forgot-password");
  };

  onDismiss = () => {
    this.setState({ visible: false });
    this.props.setAlert("");
  };

  render() {
    const {alert} = this.props;
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              {alert.message != "" &&
                <Alert color="primary" isOpen={this.state.visible} toggle={this.onDismiss}>
                  {alert.message}
                </Alert>
              }
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form>
                      <h1 className="text-primary">Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"/>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="Email" autoComplete="email"
                               onChange={e => this.handleInputChange(e, 'email')}
                               invalid={this.validator.hasError('email')}/>
                        <FormFeedback
                          valid={!this.validator.hasError('email')}>{this.validator.getError('email')}</FormFeedback>
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"/>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Password" autoComplete="password"
                               onChange={e => this.handleInputChange(e, 'password')}
                               invalid={this.validator.hasError('password')}/>
                        <FormFeedback
                          valid={!this.validator.hasError('password')}>{this.validator.getError('password')}</FormFeedback>
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button color="primary" className="px-4" onClick={this.handleLogin}>Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0" onClick={this.handleForgotPassword}>Forgot password?</Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                <Card className="text-white bg-primary py-5 d-md-down-none" style={{width: '44%'}}>
                  <CardBody className="text-center">
                    <div>
                      <h1 className="text-white">Register</h1>
                      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.</p>
                      <Link to="/register">
                        <Button color="primary" className="mt-3" active tabIndex={-1}>Register Now!</Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.rootReducer.auth,
    alert: state.rootReducer.alert,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setAuth: bindActionCreators(setAuth, dispatch),
    setAlert: bindActionCreators(setAlert, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
