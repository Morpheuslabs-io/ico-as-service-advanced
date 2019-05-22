import React, {Component, Fragment} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import connect from "react-redux/es/connect/connect";

import defaultKYC from "../../assets/img/kyc_default.png";
import axios from "axios";
import moment from "moment";
import {Link} from "react-router-dom";
import ReactDropzone from "react-dropzone";
import swal from "sweetalert2";
import {getMetamaskAddress, isValidAddress, validateEmail} from "../../containers/Utils/Util";

import "react-image-gallery/styles/css/image-gallery.css";
import id_front from "../../assets/img/id_front.png";
import photo_id_front from "../../assets/img/photo_id_front.png";
import aml_form from "../../assets/img/aml_form.jpg";

class KYC_AML extends Component {

  state = {
    data: [],
    contracts: [],
    fullName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    ethAddress: '',
    contractId: '',
    poiDocType: 'ID',       // ID, PASSPORT, DRIVER
    pofDocType: 'BANK',     // BANK, TAX
    id1: [],
    url_id1: '',
    id2: [],
    url_id2: '',
    id3: [],
    url_id3: '',
  };

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
    console.log('initData - net:', net);
    this.setState({
      ethAddress: getMetamaskAddress(),
    });
    try {
      let contracts = await axios.get(`/contract/list/${net}`);
      console.log('initData - contracts:', contracts);
      if (contracts.data && contracts.data.length > 0) {
        this.setState({
          contracts: contracts.data,
          contractId: contracts.data[0]._id
        });
      } else {
        this.setState({
          contracts: [],
          contractId: ''
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  onPreview1 = (files) => {
    this.previewDrop("id1", files);
  };

  onPreview2 = (files) => {
    this.previewDrop("id2", files);
  };

  onPreview3 = (files) => {
    this.previewDrop("id3", files);
  };

  previewDrop = (id, files) => {
    if (files && files[0]) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.setState({
          [id]: files,
          ['url_' + id]: e.target.result,
        });
      };
      reader.readAsDataURL(files[0]);
    }
  };

  handleChangeField = (e) => {
    const id = e.target.id;
    this.setState({
      [id]: e.target.value,
    });
  };

  handleSubmitKYC = () => {
    const {fullName, email, address, city, country, phone, ethAddress, contractId, poiDocType, pofDocType, id1, id2, id3} = this.state;
    if (!fullName) {
      swal("Full Name should not be empty", "", "error");
      return;
    }
    if (!email || !validateEmail(email)) {
      swal("Email is not valid", "", "error");
      return;
    }
    if (!address) {
      swal("Address should not be empty", "", "error");
      return;
    }
    if (!city) {
      swal("City should not be empty", "", "error");
      return;
    }
    if (!country) {
      swal("Country should not be empty", "", "error");
      return;
    }
    if (!phone) {
      swal("Phone should not be empty", "", "error");
      return;
    }
    if (!ethAddress) {
      this.setState({
        ethAddress: getMetamaskAddress(),
      });
    }
    if (!isValidAddress(ethAddress)) {
      swal("Ether address is not valid", "", "error");
      return;
    }
    if (!id1 || !id1.length) {
      swal("Upload front page of your ID", "", "error");
      return;
    }
    if (!id2 || !id2.length) {
      swal("Upload your photo + front page of your ID", "", "error");
      return;
    }
    if (!id3 || !id3.length) {
      swal("Upload AML documentation", "", "error");
      return;
    }
    swal({
      title: 'Are you sure?',
      text: "Submit this KYC/AML data?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit now!'
    }).then((result) => {
      if (result.value) {
        const formData = new FormData();
        formData.append("photoK1", id1[0]);
        formData.append("photoK2", id2[0]);
        formData.append("photoA", id3[0]);
        formData.append("doctypeA", pofDocType);
        formData.append("doctypeK", poiDocType);
        formData.append("fullName", fullName);
        formData.append("email", email);
        formData.append("address", address);
        formData.append("city", city);
        formData.append("country", country);
        formData.append("phone", phone);
        formData.append("ethAddress", ethAddress);
        formData.append("contractId", contractId);
        axios.post('kyc-aml', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(ok => {
          swal(
            'Submitted!',
            'Your data has been submitted.',
            'success'
          );
        });
      }
    });
  };

  render() {
    const {fullName, email, address, city, country, phone, ethAddress, contractId, poiDocType, pofDocType, url_id1, url_id2, url_id3, contracts} = this.state;
    const previewStyle = {
      display: 'inline',
      width: '100%',
      height: '100%'
    };

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12">
            <Card>
              <CardHeader>
                <div className="font-2xl mb-2">Personal Information</div>
              </CardHeader>
              <CardBody>
                <FormGroup row className="m-2">
                  <Col xs="6">
                    <FormGroup>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input type="text" id="fullName" placeholder="Enter your full name" value={fullName} onChange={this.handleChangeField} />
                    </FormGroup>
                  </Col>
                  <Col xs="6">
                    <FormGroup>
                      <Label htmlFor="email">Email</Label>
                      <Input type="email" id="email" placeholder="Enter your email" value={email} onChange={this.handleChangeField} />
                    </FormGroup>
                  </Col>
                </FormGroup>
                <FormGroup row className="m-2">
                  <Col xs="6">
                    <FormGroup>
                      <Label htmlFor="address">Address</Label>
                      <Input type="text" id="address" placeholder="Enter your address line" value={address} onChange={this.handleChangeField} />
                    </FormGroup>
                  </Col>
                  <Col xs="6">
                    <FormGroup>
                      <Label htmlFor="city">City</Label>
                      <Input type="text" id="city" placeholder="Enter your city" value={city} onChange={this.handleChangeField} />
                    </FormGroup>
                  </Col>
                </FormGroup>
                <FormGroup row className="m-2">
                  <Col xs="6">
                    <FormGroup>
                      <Label htmlFor="country">Country</Label>
                      <Input type="text" id="country" placeholder="Enter your country" value={country} onChange={this.handleChangeField} />
                    </FormGroup>
                  </Col>
                  <Col xs="6">
                    <FormGroup>
                      <Label htmlFor="phone">Phone</Label>
                      <Input type="text" id="phone" placeholder="Enter your phone" value={phone} onChange={this.handleChangeField} />
                    </FormGroup>
                  </Col>
                </FormGroup>
                <FormGroup row className="m-2">
                  <Col xs="6">
                    <FormGroup>
                      <Label htmlFor="ethAddress">ETH Wallet Address</Label>
                      <Input type="text" id="ethAddress" placeholder="Enter your ETH wallet address" value={ethAddress} onChange={this.handleChangeField} />
                      <label>* I will pay from this ETH wallet address and receive tokens with this address as well.</label>
                    </FormGroup>
                  </Col>
                  <Col xs="6">
                    <FormGroup>
                      <Label htmlFor="contractId">Contract Address</Label>
                      <Input type="select" id="contractId" placeholder="Choose the contract address" value={contractId} onChange={this.handleChangeField} >
                        {contracts.map((item, key) => <option key={key} value={item._id}>{item.token.name} ({item.contractAddress.token})</option>)}
                      </Input>
                    </FormGroup>
                  </Col>
                </FormGroup>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <div className="font-2xl mb-2">Upload Documentations</div>
              </CardHeader>
              <CardBody>
                <FormGroup row className="m-2">
                  <Col xs={12}>
                    <p>You can upload one of the following government issued ID documents: Passport, National ID Card, Driver's License.</p>
                    <p>Please ensure the picture of your government issued ID document is very well visible and identifiable. You must hide your unique identification number on
                      your ID when submitting the images.
                      Please use tape to cover your driver's license number, passport number, and any sensitive information on your national identification (digits other than your
                      date of birth).
                      If your ID is not readable or otherwise unable to be verified as a legitimately issued government ID, you will NOT be able to proceed with our improved
                      identity verification process, and your KYC registration will not be processed.
                    </p>
                  </Col>
                </FormGroup>
                <FormGroup row className="m-2">
                  <Col sm="3">
                    <FormGroup>
                      <Label htmlFor="poiDocType">Identity Doc Type</Label>
                      <Input type="select" id="poiDocType" placeholder="Choose your Doc type" value={poiDocType} onChange={this.handleChangeField} >
                        <option value="ID">National ID</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="DRIVE">Driver's License</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </FormGroup>
                <FormGroup row className="m-2">
                  <Col xs="12">
                    <FormGroup>
                      <Label className="font-weight-bold">1. Upload front page of your ID:</Label>
                      <FormGroup row>
                        <Col sm={4}>
                          <ReactDropzone
                            accept="image/*"
                            onDrop={this.onPreview1}
                          >
                            {url_id1 == "" ?
                              "Drag & Drop an image!" :
                              <img
                                src={url_id1}
                                style={previewStyle}
                              />
                            }
                          </ReactDropzone>
                        </Col>
                        <Col sm={4}>
                          <p>
                            Requirements for your ID:<br/>
                            - entire ID is visible<br/>
                            - ID is clear and easy to read<br/>
                            - front side (if submitting National ID Card or Driver's License)<br/>
                            - passport personal information page (if submitting passport)<br/>
                            - JPG, JPEG OR PNG (max size 10MB)
                          </p>
                        </Col>
                        <Col sm={4}>
                          <img src={id_front} style={{height: 150}}/>
                        </Col>
                      </FormGroup>
                    </FormGroup>
                  </Col>
                </FormGroup>
                <FormGroup row className="m-2">
                  <Col xs="12">
                    <FormGroup>
                      <Label className="font-weight-bold">2. Upload your photo + front page of your ID:</Label>
                      <FormGroup row>
                        <Col sm={4}>
                          <ReactDropzone
                            accept="image/*"
                            onDrop={this.onPreview2}
                          >
                            {url_id2 == "" ?
                              "Drag & Drop an image!" :
                              <img
                                src={url_id2}
                                style={previewStyle}
                              />
                            }
                          </ReactDropzone>
                        </Col>
                        <Col sm={4}>
                          <p>
                            Requirements for photo + ID:<br/>
                            - face clearly visible, holding ID and note next to face<br/>
                            - ID clearly visible<br/>
                            - JPG, JPEG OR PNG (max size 10MB)
                          </p>
                        </Col>
                        <Col sm={4}>
                          <img src={photo_id_front} style={{height: 150}}/>
                        </Col>
                      </FormGroup>
                    </FormGroup>
                  </Col>
                </FormGroup>
                <hr/>
                <FormGroup row className="m-2">
                  <Col xs="3">
                    <FormGroup>
                      <Label htmlFor="pofDocType">AML Doc Type</Label>
                      <Input type="select" id="pofDocType" placeholder="Choose your Doc type" value={pofDocType} onChange={this.handleChangeField}>
                        <option value="BANK">Bank Transaction</option>
                        <option value="TAX">Tax Information</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </FormGroup>
                <FormGroup row className="m-2">
                  <Col xs="12">
                    <FormGroup>
                      <Label className="font-weight-bold">3. Upload AML documentation:</Label>
                      <FormGroup row>
                        <Col sm={4}>
                          <ReactDropzone
                            accept="image/*"
                            onDrop={this.onPreview3}
                          >
                            {url_id3 == "" ?
                              "Drag & Drop an image!" :
                              <img
                                src={url_id3}
                                style={previewStyle}
                              />
                            }
                          </ReactDropzone>
                        </Col>
                        <Col sm={4}>
                          <p>
                            Requirements for AML:<br/>
                            - entire document is visible<br/>
                            - document is clear and easy to read<br/>
                            - readable front side<br/>
                            - JPG, JPEG OR PNG (max size 10MB)
                          </p>
                        </Col>
                        <Col sm={4}>
                          <img src={aml_form} style={{height: 200}}/>
                        </Col>
                      </FormGroup>
                    </FormGroup>
                  </Col>
                </FormGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col xs={12} className="text-center">
            <Button color="success" onClick={this.handleSubmitKYC}>SUBMIT KYC</Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(KYC_AML);