import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const Dashboard = React.lazy(() => import('./views/Dashboard'));

const Contracts = React.lazy(() => import('./views/Contracts'));
const ViewContract = React.lazy(() => import('./views/Contracts/ViewContract'));
const WizardICO = React.lazy(() => import('./wizard/src/containers/wizard'));

const Airdrop = React.lazy(() => import('./wizard/src/containers/Airdrop'));

const TokenVesting = React.lazy(() => import('./views/TokenVesting'));
const WizardTokenVesting = React.lazy(() => import('./wizard/src/containers/tokenvesting'));

const WizardLanding = React.lazy(() => import('./wizard/src/containers/landing'));

const KYC_AML = React.lazy(() => import('./views/KYC_AML'));
const ViewKYCAML = React.lazy(() => import('./views/KYC_AML/ViewKYCAML'));
const Users = React.lazy(() => import('./views/Users'));
const User = React.lazy(() => import('./views/Users/User'));

const UiSetting = React.lazy(() => import('./views/UiSetting'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/contracts', exact: true, name: 'ICO', component: Contracts },
  { path: '/contracts/:id', exact: true, name: 'Contract', component: ViewContract },
  { path: '/tokenvesting', exact: true, name: 'Token Vesting', component: TokenVesting },
  { path: '/tokenvesting/:id', exact: true, name: 'View Vesting', component: TokenVesting },
  { path: '/airdrop', exact: true, name: 'Airdrop', component: Airdrop },
  { path: '/landing', exact: true, name: 'Wizard', component: WizardLanding },
  { path: '/startico', exact: true, name: 'ICO Wizard', component: WizardICO },
  { path: '/startvesting', exact: true, name: 'Token Vesting Wizard', component: WizardTokenVesting },
  { path: '/kyc-aml', exact: true, name: 'KYC & AML', component: KYC_AML },
  { path: '/kyc-aml/:id', exact: true, name: 'View', component: ViewKYCAML },
  { path: '/investors', exact: true,  name: 'Investors', component: Users },
  { path: '/investors/:id', exact: true, name: 'Investor Details', component: User },
  { path: '/uisetting', exact: true,  name: 'UI Setting', component: UiSetting },
];

export default routes;
