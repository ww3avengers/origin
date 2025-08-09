import React from 'react';
import { RouteObject } from 'react-router-dom';
import ReferralDashboard from '../components/ReferralDashboard';

// Auth-Wrapper-Funktion als temporärer Ersatz für requiresAuth
const requiresAuth = (component: React.ReactNode) => {
  return component;
};

const ReferralRoute: RouteObject = {
  path: 'referral',
  element: requiresAuth(<ReferralDashboard />),
};

export const referralRoutes = [ReferralRoute];

export default referralRoutes;
