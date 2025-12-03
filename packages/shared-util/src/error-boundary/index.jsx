import React from 'react'

const ErrorFallback = ({ error, resetError }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0a2 2 0 110-4 2 2 0 010 4zm0-12a9 9 0 110 18 9 9 0 010-18z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-3">
          Oops! Something Went Wrong
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          模块加载失败。你可以关闭错误提示以尝试重新渲染当前界面，或重新加载页面。
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-red-200 dark:border-red-800">
          <p className="text-sm font-mono text-red-600 dark:text-red-400 break-words">
            {error?.message || 'Unknown error'}
          </p>
          {error?.stack && (
            <details className="mt-3 cursor-pointer">
              <summary className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                查看堆栈信息
              </summary>
              <pre className="mt-2 text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-40 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetError}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            关闭错误提示（尝试恢复）
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            重新加载页面
          </button>
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-4">
          若问题持续存在，请查看控制台或联系开发人员。
        </p>
      </div>
    </div>
  )
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误（不做路由依赖）
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState({ errorInfo })
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />
    }
    return this.props.children
  }
}

export default ErrorBoundary