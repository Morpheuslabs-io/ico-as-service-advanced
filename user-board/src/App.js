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
        <Route exact path="/404" name="Page 404" component={Page404}/>
        <Route exact path="/500" name="Page 500" component={Page500}/>
        <Route path="/" name="Home" component={DefaultLayout}/>
      </Switch>
    );
  }
}

export default App;
