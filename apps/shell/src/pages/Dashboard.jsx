import React from 'react'

export function Dashboard() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Edu RAG Platform - Educational Resource Answering System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Total Users', value: '1,234', icon: '👥' },
            { title: 'Active Sessions', value: '567', icon: '🔄' },
            { title: 'Success Rate', value: '98.5%', icon: '✅' }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}