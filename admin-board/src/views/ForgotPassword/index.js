import React, {Component} from 'react';
import {
  Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row,
  FormFeedback, Alert
} from 'reactstrap';
import axios from "axios";
import validator from '../../containers/Utils/Validator';

class ForgotPassword extends Component {

  state = {
    email: "",
    alert: ""
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
  });

  handleInputChange = (e, id) => {
    this.setState({
      [id]: e.target.value,
    });
    this.validator.validatePair(e.target.value, id);
  };

  handleSend = () => {
    if (this.validator.validateFields(['email'])) {
      axios.post("/admin/auth/request-reset-password", {
        email: this.state.email
      }).then(response => {
        this.setState({
          ...this.state,
          alert: response.data.message
        })
      });
    }
  };

  handleBack = () => {
    this.props.history.push('/login');
  };

  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              {this.state.alert != "" &&
              <Alert color="primary">{this.state.alert}</Alert>
              }
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form>
                      <h1 className="text-primary">Forgot Password</h1>
                      <p className="text-muted">Please enter your email</p>
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
                      <Row>
                        <Col xs="12" className="text-right">
                          <Button color="default" className="px-4 mx-2" onClick={this.handleBack}>Back</Button>
                          <Button color="primary" className="px-4 mx-2" onClick={this.handleSend}>Send</Button>
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

export default ForgotPassword;
