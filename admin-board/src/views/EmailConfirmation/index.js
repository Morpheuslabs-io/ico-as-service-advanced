import React, {Component} from 'react';
import axios from "axios";
import {bindActionCreators} from "redux";
import {setAlert} from "../../redux/actions";
import connect from "react-redux/es/connect/connect";

class EmailConfirmation extends Component {

  componentDidMount() {
    const {setAlert} = this.props;
    axios.post("/admin/auth/email-confirmation", {
      token:this.props.match.params.token
    }).then(response => {
      setAlert("Your email is verified successfully");
      this.props.history.push("/login");
    }).catch(err => {
      setAlert(err.message);
      this.props.history.push("/login");
    });
  };

  render() {
    return (
      <div/>
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

export default connect(mapStateToProps, mapDispatchToProps)(EmailConfirmation);
