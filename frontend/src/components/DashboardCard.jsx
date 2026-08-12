import { TrendingUp } from 'lucide-react'

const DashboardCard = ({ title, value, icon, color }) => {
  const colorConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-600',
      icon: 'bg-blue-100 text-blue-600',
      trend: 'text-blue-600'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-600',
      icon: 'bg-green-100 text-green-600',
      trend: 'text-green-600'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      icon: 'bg-yellow-100 text-yellow-600',
      trend: 'text-yellow-600'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      border: 'border-red-200',
      text: 'text-red-600',
      icon: 'bg-red-100 text-red-600',
      trend: 'text-red-600'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-600',
      icon: 'bg-purple-100 text-purple-600',
      trend: 'text-purple-600'
    }
  }

  const config = colorConfig[color] || colorConfig.blue

  return (
    <div className={`card-elevated border-t-4 ${config.border} ${config.bg} group overflow-hidden relative`}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-surface-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-4xl font-bold ${config.text}`}>{value}</p>
              <div className={`flex items-center gap-1 text-xs font-semibold ${config.trend}`}>
                <TrendingUp size={14} />
                <span>+12%</span>
              </div>
            </div>
          </div>
          <div className={`w-14 h-14 ${config.icon} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-md`}>
            {icon}
          </div>
        </div>
        
        <div className="pt-4 border-t border-white/50">
          <p className="text-xs text-surface-600">Last 30 days</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardCard

