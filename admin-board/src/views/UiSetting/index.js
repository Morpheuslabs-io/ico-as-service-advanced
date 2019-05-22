import React, { Component } from 'react';
import Checkbox from './Checkbox';
import {bindActionCreators} from "redux";
import connect from "react-redux/es/connect/connect";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
} from 'reactstrap';
import axios from "axios";
import swal from "sweetalert2";
import {setAuthorizationHeader} from "../../containers/Utils/Util";
import {setAuth} from "../../redux/actions";

const uiItemList = [
  'Dashboard',
  'ICO',
  'Token Vesting',
  'Airdrop',
  'KYC & AML',
  'Investors'
]

class UiSetting extends Component {
  state = {
    uiItemCheckBoxList: []
  }
  componentWillMount = () => {
    this.selectedCheckboxes = new Set();
  }

  toggleCheckbox = label => {
    if (this.selectedCheckboxes.has(label)) {
      this.selectedCheckboxes.delete(label);
    } else {
      this.selectedCheckboxes.add(label);
    }
  }

  handleFormSubmit = () => {
    let uiconfig = 'ui setting';
    for (const checkbox of this.selectedCheckboxes) {
      uiconfig += ',' + checkbox.toLowerCase()
    }
    console.log('handleFormSubmit - uiconfig:', uiconfig);

    const id = this.props.auth.user.id;
    axios.post("/admin/users/setui/"+id, {uiconfig}).then(response => {
      swal("UI setting done", "You will be logged out", "success");
      setTimeout(() => window.location.reload(), 3000);
      this.signOut()
    }).catch(err => swal("UI setting failed", "", "error"));
  }

  signOut() {
    const {setAuth} = this.props;
    setAuth({token: null, user: {}});
    localStorage.clear();
    setAuthorizationHeader();
    this.props.history.push('/login')
  }

  componentDidMount() {
    const {auth} = this.props;
    let uiConfigData = auth.user.uiconfig;
    
    let uiItemCheckBoxList = [];
    for (let i=0; i<uiItemList.length; i++) {
      let uiLabel = uiItemList[i];
      if (uiConfigData.indexOf(uiLabel.toLowerCase()) === -1) {
        uiItemCheckBoxList.push({label: uiLabel, checked: false});
      } else {
        uiItemCheckBoxList.push({label: uiLabel, checked: true});
        this.selectedCheckboxes.add(uiLabel);
      }
    }

    this.setState({
      uiItemCheckBoxList
    })
  };

  render() {
    const {uiItemCheckBoxList} = this.state
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" lg="12">
            <Card>
              <CardHeader>
                <h2 className="mb-0 text-dark">Setting of UI components</h2>
              </CardHeader>
              <CardBody>
                <form>
                  {
                    uiItemCheckBoxList.map(({label,checked}) => {
                      return (
                        <Checkbox
                          label={label}
                          checked={checked}
                          handleCheckboxChange={this.toggleCheckbox}
                          key={label}
                        />
                      )
                    })
                  }
                </form>
                <br></br>  
                <Button 
                  className="btn btn-default" type="submit" color="primary"
                  onClick={this.handleFormSubmit}>
                  Save
                </Button>
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
    auth: state.rootReducer.auth,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setAuth: bindActionCreators(setAuth, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UiSetting);
