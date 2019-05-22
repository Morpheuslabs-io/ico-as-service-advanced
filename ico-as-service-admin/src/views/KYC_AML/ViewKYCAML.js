import React, {Component} from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row, Jumbotron
} from 'reactstrap';
import {Table} from 'antd';
import '../../../node_modules/antd/dist/antd.css';

import defaultKYC from "../../assets/img/kyc_default.png";
import axios from "axios";
import moment from "moment";
import ImageGallery from 'react-image-gallery';
import swal from "sweetalert2";

import "react-image-gallery/styles/css/image-gallery.css";

const KYCURL = process.env.REACT_APP_KYCAML_PHOTO;

class ViewKYCAML extends Component {

  state = {
    fullName: "",
    email: "",
    address: "",
    onlineVerified: "",
    adminVerified: "",
    poiDocType: "",
    pofDocType: "",
    createdAt: "",
    images: []
  };

  componentDidMount() {
    const id = this.props.match.params.id;
    axios.get("/admin/kyc-aml/"+id).then(response => {

      let images = [];
      images = images.concat(response.data.poi.photos.map(item => {
        return {
          original: KYCURL+'/'+item,
          thumbnail: KYCURL+'/'+item,
        }
      }));
      images = images.concat(response.data.pof.photos.map(item => {
        return {
          original: KYCURL+'/'+item,
          thumbnail: KYCURL+'/'+item,
        }
      }));
      this.setState({
        fullName: response.data.userId.fullName,
        email: response.data.userId.email,
        address: response.data.userId.address,
        onlineVerified: response.data.onlineVerified,
        adminVerified: response.data.adminVerified,
        poiDocType: response.data.poi.doctype,
        pofDocType: response.data.pof.doctype ,
        createdAt: response.data.createdAt ,
        images: images
      })
    }).catch(err => {
      console.log(err.message);
    });
  }

  handleApproveKYC = () => {
    const id = this.props.match.params.id;
    swal({
      title: 'Approve this KYC?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve this!'
    }).then((result) => {
      if (result.value) {
        axios.post("/admin/kyc-aml/"+id, {adminVerified: "Verified"}).then(response => {
          this.setState({
            adminVerified: "Verified"
          });
          swal("Approved by you successfully.", "", "success");
        }).catch(err => console.log(err));
      }
    });
  };

  handleDenyKYC = () => {
    const id = this.props.match.params.id;
    swal({
      title: 'Deny this KYC?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, deny this!'
    }).then((result) => {
      if (result.value) {
        axios.post("/admin/kyc-aml/"+id, {adminVerified: "Denied"}).then(response => {
          this.setState({
            adminVerified: "Denied"
          });
          swal("Denied by you successfully.", "", "success");
        }).catch(err => console.log(err));
      }
    });
  };

  handleOnlineKYC = () => {
    const id = this.props.match.params.id;
    swal({
      title: 'Request to verify this KYC?',
      text: "Your request will be proceeded in 3rd Services.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, request this!'
    }).then((result) => {
      if (result.value) {
        axios.post("/admin/kyc-aml/online/"+id).then(response => {
          this.setState({
            onlineVerified: response.data.onlineVerified
          });
        });
      }
    });
  };

  render() {
    const {fullName, email, address, onlineVerified, adminVerified, poiDocType, pofDocType, images, createdAt} = this.state;

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12">
            <Card>
              <CardHeader>
                <div className="font-2xl mb-2">Information</div>
              </CardHeader>
              <CardBody>
                {images.length == 0?
                  <div className="text-center"><img src={defaultKYC} style={{maxHeight: "500px"}}/></div>
                  :
                  <ImageGallery items={images} autoPlay={true} defaultImage={defaultKYC} />
                }
                <Jumbotron className="p-4">
                  <Row>
                    <Col xs={12} sm={4}>
                      <span>Name: </span><span className="lead font-weight-normal">{fullName}</span>
                    </Col>
                    <Col xs={12} sm={4}>
                      <span>Email: </span><span className="lead font-weight-normal">{email}</span>
                    </Col>
                    <Col xs={12} sm={4}>
                      <span>Address: </span><span className="lead font-weight-normal">{address}</span>
                    </Col>
                    <Col xs={12} sm={4}>
                      <span>Online Verified: </span><span className="lead font-weight-normal">
                      <Badge color={onlineVerified=="Pending"?"secondary":onlineVerified=="Verified"?"success":"danger"}>
                        {onlineVerified}</Badge>
                    </span>
                    </Col>
                    <Col xs={12} sm={4}>
                      <span>Admin Verified: </span><span className="lead font-weight-normal">
                      <Badge color={adminVerified=="Pending"?"secondary":adminVerified=="Verified"?"success":"danger"}>
                        {adminVerified}</Badge>
                    </span>
                    </Col>
                    <Col xs={12} sm={4}>
                      <span>Doc Type(Proof of Identity): </span><span className="lead font-weight-normal">{poiDocType}</span>
                    </Col>
                    <Col xs={12} sm={4}>
                      <span>Doc Type(Proof of Funds): </span><span className="lead font-weight-normal">{pofDocType}</span>
                    </Col>
                    <Col xs={12} sm={4}>
                      <span>Reported At: </span><span className="lead font-weight-normal">{moment(createdAt).format('YYYY/MM/DD HH:mm:ss')}</span>
                    </Col>
                  </Row>
                  <div className="lead mt-4 text-center">
                    <Button disabled={adminVerified!="Pending"} color="primary" onClick={this.handleApproveKYC}>Approve This KYC&AML</Button> &nbsp;&nbsp;
                    <Button disabled={adminVerified!="Pending"} onClick={this.handleDenyKYC}>Deny This KYC&AML</Button> &nbsp;&nbsp;
                    <Button disabled={onlineVerified!="Pending"} onClick={this.handleOnlineKYC}>Try Online Verify Manually</Button>
                  </div>
                </Jumbotron>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ViewKYCAML;
