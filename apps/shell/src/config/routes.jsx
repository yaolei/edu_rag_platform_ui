// shell/config/routes.jsx
import React, { Suspense } from 'react';
import { Dashboard } from '../pages/Dashboard';
import { RobotChat } from '../pages/RobotChat';
import KnowledgeManger from '../pages/KnowledgeManger';
import Login from '../pages/Login';
import { RequireAuth } from '../components/RequireAuth.jsx';
import { LayoutWithErrorBoundary } from '../components/LayoutWithErrorBoundary.jsx';

const EduAdmin = React.lazy(() => import('eduAdmin/AdminApp'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Start Loading Admin Module...</p>
    </div>
  </div>
);

export function createRoutes() {
  return [
    { path: '/login', element: <Login /> },
    {
      path: '/',
      element: (
        <RequireAuth>
            <LayoutWithErrorBoundary />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'admin',    element: <Suspense fallback={<LoadingFallback />}><EduAdmin /></Suspense> },
        { path: 'robot',    element: <RobotChat /> },
        { path: 'klg_magement', element: <KnowledgeManger /> },
      ],
    },
  ];
}