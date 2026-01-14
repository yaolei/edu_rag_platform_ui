// shell/config/routes.jsx
import React, { Suspense } from 'react';
import { RequireAuth } from '../components/RequireAuth.jsx';
import { LayoutWithErrorBoundary } from '../components/LayoutWithErrorBoundary.jsx';

// 修复的懒加载函数
function lazyNamed(importFn, exportName) {
  return React.lazy(async () => {
    const module = await importFn();
    const component = module[exportName] || module.default;
    
    if (!component) {
      throw new Error(`组件 ${exportName} 加载失败`);
    }
    
    return { default: component };
  });
}

// 修复所有懒加载
const KnowledgeManger = lazyNamed(() => import('../pages/KnowledgeManger'), 'KnowledgeManger');
const Dashboard = lazyNamed(() => import('../pages/Dashboard'), 'Dashboard');
const Settings = lazyNamed(() => import('../pages/Settings'), 'Settings');
const RobotChat = lazyNamed(() => import('../pages/RobotChat'), 'RobotChat');
const Login = lazyNamed(() => import('../pages/Login'), 'Login');
const EduAdmin = React.lazy(() => import('eduAdmin/AdminApp'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// 简化的Suspense包装
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

export function createRoutes() {
  return [
    { 
      path: '/login', 
      element: withSuspense(Login)
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
          element: withSuspense(Dashboard)
        },
        { 
          path: 'dashboard', 
          element: withSuspense(Dashboard)
        },
        { 
          path: 'admin',    
          element: withSuspense(EduAdmin)
        },
        { 
          path: 'robot',    
          element: withSuspense(RobotChat)
        },
        { 
          path: 'klg_magement', 
          element: withSuspense(KnowledgeManger)
        },
        { 
          path: 'settings', 
          element: withSuspense(Settings)
        },
      ],
    },
  ];
}