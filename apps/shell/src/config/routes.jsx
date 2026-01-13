// shell/config/routes.jsx
import React, { Suspense } from 'react';
import { RequireAuth } from '../components/RequireAuth.jsx';
import { LayoutWithErrorBoundary } from '../components/LayoutWithErrorBoundary.jsx';

const KnowledgeManger = React.lazy(() => import('../pages/KnowledgeManger'));

const Dashboard = React.lazy(() => 
  import('../pages/Dashboard').then(module => ({ default: module.Dashboard }))
);
const Settings = React.lazy(() => 
  import('../pages/Settings').then(module => ({ default: module.Settings }))
);
const RobotChat = React.lazy(() => 
  import('../pages/RobotChat').then(module => ({ default: module.RobotChat }))
);
const Login = React.lazy(() => 
  import('../pages/Login').then(module => ({ default: module.Login }))
);

const EduAdmin = React.lazy(() => import('eduAdmin/AdminApp'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

const LazyComponent = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

export function createRoutes() {
  return [
    { 
      path: '/login', 
      element: (
        <LazyComponent>
          <Login />
        </LazyComponent>
      ) 
    },
    {
      path: '/',
      element: (
        <RequireAuth>
          <LayoutWithErrorBoundary />
        </RequireAuth>
      ),
      children: [
        { 
          index: true, 
          element: (
            <LazyComponent>
              <Dashboard />
            </LazyComponent>
          ) 
        },
        { 
          path: 'dashboard', 
          element: (
            <LazyComponent>
              <Dashboard />
            </LazyComponent>
          ) 
        },
        { 
          path: 'admin',    
          element: (
            <LazyComponent>
              <EduAdmin />
            </LazyComponent>
          ) 
        },
        { 
          path: 'robot',    
          element: (
            <LazyComponent>
              <RobotChat />
            </LazyComponent>
          ) 
        },
        { 
          path: 'klg_magement', 
          element: (
            <LazyComponent>
              <KnowledgeManger />
            </LazyComponent>
          ) 
        },
        { 
          path: 'settings', 
          element: (
            <LazyComponent>
              <Settings />
            </LazyComponent>
          ) 
        },
      ],
    },
  ];
}