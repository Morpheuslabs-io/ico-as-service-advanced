import React, {Component, Suspense} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Container} from 'reactstrap';

import {
  AppAside,
  AppBreadcrumb,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav,
} from '@coreui/react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import {setAuth} from "../../redux/actions";
import {setAuthorizationHeader} from "../Utils/Util";

const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

class DefaultLayout extends Component {

  state = {
    uiItems: navigation
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  signOut(e) {
    e.preventDefault();
    const {setAuth} = this.props;
    setAuth({token: null, user: {}});
    localStorage.clear();
    setAuthorizationHeader();
    this.props.history.push('/login')
  }

  componentDidMount() {
    const {auth} = this.props;
    if (!auth || !auth.user) return;
    let uiConfigData = auth.user.uiconfig;
    console.log('auth.user.uiconfig:', auth.user.uiconfig);
    if (!uiConfigData || uiConfigData === '') {
      return;
    }
    let uiItems = navigation.items
    for (let i=0; i<uiItems.length; i++) {
      let item = uiItems[i];
      if (uiConfigData.indexOf(item.name.toLowerCase()) === -1) {
        uiItems[i].variant = 'secondary';
        uiItems[i].attributes = { disabled: true };
      }
    }
    uiItems.items = uiItems
    this.setState({
      uiItems
    })
  };

  render() {
    const {auth} = this.props;
    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader onLogout={e => this.signOut(e)} history={this.props.history}  />
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader/>
            <AppSidebarForm/>
            <Suspense>
              <AppSidebarNav navConfig={this.state.uiItems} {...this.props} />
            </Suspense>
            <AppSidebarFooter/>
            <AppSidebarMinimizer/>
          </AppSidebar>
          <main className="main">
            <AppBreadcrumb appRoutes={routes}/>
            <Container fluid>
              <Suspense fallback={this.loading()}>
                <Switch>
                  {
                    !auth.token && <Redirect to="/login"/>
                  }
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        render={props => (
                          <route.component {...props} />
                        )}/>
                    ) : (null);
                  })}
                  <Redirect from="/" to="/dashboard"/>
                </Switch>
              </Suspense>
            </Container>
          </main>
        </div>
        <AppFooter>
          <Suspense fallback={this.loading()}>
            <DefaultFooter/>
          </Suspense>
        </AppFooter>
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

export default connect(mapStateToProps, mapDispatchToProps)(DefaultLayout);
