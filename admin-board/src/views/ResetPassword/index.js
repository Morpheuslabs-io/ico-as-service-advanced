import React, {Component} from 'react';
import {
  Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row,
  FormFeedback
} from 'reactstrap';
import validator from '../../containers/Utils/Validator';
import axios from "axios";
import {bindActionCreators} from "redux";
import {setAlert} from "../../redux/actions";
import connect from "react-redux/es/connect/connect";

class ResetPassword extends Component {

  state = {
    password: '',
    confirm_password: '',
  };

  validator = validator(this, {
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
        message: 'Confirm password is not matched'
      }
    ],
  });

  handleInputChange = (e, id) => {
    this.setState({
      [id]: e.target.value,
    });
    this.validator.validatePair(e.target.value, id);
  };

  handleSubmit = () => {
    const {setAlert} = this.props;
    if (this.validator.validateFields(['password', 'confirm_password'])) {
      axios.post("/admin/auth/reset-password", {
        token:this.props.match.params.token,
        password: this.state.password
      }).then(response => {
        setAlert(response.data.message);
      }).catch(err => {
        setAlert(err.message);
      });
      this.props.history.push('/login');
    }
  };

  handleBack = () => {
    this.props.history.push('/forgot-password');
  };

  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form>
                      <h1 className="text-primary">Reset Password</h1>
                      <p className="text-muted">Please enter your new password</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Password" autoComplete="password"
                               onChange={e => this.handleInputChange(e, 'password')}
                               invalid={this.validator.hasError('password')}/>
                        <FormFeedback
                          valid={!this.validator.hasError('password')}>{this.validator.getError('password')}</FormFeedback>
                      </InputGroup>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Confirm Password" autoComplete="confirm_password"
                               onChange={e => this.handleInputChange(e, 'confirm_password')}
                               invalid={this.validator.hasError('confirm_password')}/>
                        <FormFeedback
                          valid={!this.validator.hasError('confirm_password')}>{this.validator.getError('confirm_password')}</FormFeedback>
                      </InputGroup>
                      <Row>
                        <Col xs="12" className="text-right">
                          <Button color="default" className="px-4 mx-2" onClick={this.handleBack}>Back</Button>
                          <Button color="primary" className="px-4 mx-2" onClick={this.handleSubmit}>Submit</Button>
                        </Col>
                      </Row>
                    </Form>
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
    alert: state.rootReducer.alert,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setAlert: bindActionCreators(setAlert, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
