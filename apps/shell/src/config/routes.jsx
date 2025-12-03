import React, { Suspense } from 'react'
import { ErrorBoundary } from '@workspace/shared-util'
import { Dashboard } from '../pages/Dashboard'
import { Settings } from '../pages/Settings'
import { RobotChat } from '../pages/RobotChat'
import KnowledgeManger from '../pages/KnowledgeManger'

const remoteDevUrl = 'http://localhost:5002/src/eduAdminEntry.jsx'
const remoteProdUrl = 'http://localhost:5002/assets/eduAdminEntry.js'
const remoteUrl = import.meta.env.DEV ? remoteDevUrl : remoteProdUrl

const EduAdmin = React.lazy(() => import(/* @vite-ignore */ remoteUrl))

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading Admin Module...</p>
    </div>
  </div>
)

export function createRoutes() {
  return [
    { path: '/', element: <Dashboard />, errorKey: 'dashboard' },
    { path: '/dashboard', element: <Dashboard />, errorKey: 'dashboard' },
    {
      path: '/admin',
      element: (
        <ErrorBoundary key="admin-module">
          <Suspense fallback={<LoadingFallback />}>
            <EduAdmin />
          </Suspense>
        </ErrorBoundary>
      ),
      errorKey: 'admin-module'
    },
    {
      path: '/robot',
      element: <RobotChat />,
      errorKey: 'robot'
    },
    {
      path: '/klg_magement',
      element: <KnowledgeManger />,
      errorKey: 'klgmagement'
    },
    { path: '/settings', element: <Settings />, errorKey: 'settings' }
  ]
}