import React, {Component} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
// import { renderRoutes } from 'react-router-config';
import Loadable from 'react-loadable';
import './App.scss';

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const DefaultLayout = Loadable({
  loader: () => import('./containers/DefaultLayout'),
  loading
});

// Pages
const Login = Loadable({
  loader: () => import('./views/Login'),
  loading
});

const ForgotPassword = Loadable({
  loader: () => import('./views/ForgotPassword'),
  loading
});

const EmailConfirmation = Loadable({
  loader: () => import('./views/EmailConfirmation'),
  loading
});

const ResetPassword = Loadable({
  loader: () => import('./views/ResetPassword'),
  loading
});

const Register = Loadable({
  loader: () => import('./views/Register'),
  loading
});

const Page404 = Loadable({
  loader: () => import('./views/Page404'),
  loading
});

const Page500 = Loadable({
  loader: () => import('./views/Page500'),
  loading
});

class App extends Component {

  render() {
    return (
      <Switch>
        <Route exact path="/login" name="Login Page" component={Login}/>
        <Route exact path="/forgot-password" name="Forgot Password Page" component={ForgotPassword}/>
        <Route exact path="/email-confirmation/:token" name="Email Confirmation Page" component={EmailConfirmation}/>
        <Route exact path="/reset-password/:token" name="Reset Password Page" component={ResetPassword}/>
        <Route exact path="/register" name="Register Page" component={Register}/>
        <Route exact path="/404" name="Page 404" component={Page404}/>
        <Route exact path="/500" name="Page 500" component={Page500}/>
        <Route path="/" name="Home" component={DefaultLayout}/>
      </Switch>
    );
  }
}

export default App;
