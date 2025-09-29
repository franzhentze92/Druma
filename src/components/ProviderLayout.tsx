import React from 'react'
import ProviderDashboard from './ProviderDashboard'

const ProviderLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <main className="pb-10">
        <ProviderDashboard />
      </main>
    </div>
  )
}

export default ProviderLayout
