import React from 'react';
import { Outlet, useLocation} from 'react-router';
import { ErrorBoundary } from '@workspace/shared-util';
import { Layout } from './Layout';

export function LayoutWithErrorBoundary() {
    const location = useLocation();
    const errorKey = `error-${location.pathname}-${Date.now()}`;
    
    return (
      <Layout>
        <ErrorBoundary key={errorKey}>
          <Outlet />
        </ErrorBoundary>
      </Layout>
    );
}