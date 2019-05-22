import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const ViewContract = React.lazy(() => import('./views/Contracts/ViewContract'));
const KYC_AML = React.lazy(() => import('./views/KYC_AML'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
  { path: '/invest', exact: true, name: 'Invest', component: ViewContract },
  { path: '/kyc-aml', exact: true, name: 'KYC & AML', component: KYC_AML },
];

export default routes;
