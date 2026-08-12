import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts'
import { Activity, TrendingUp } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const buildInspectionData = (reports = []) => {
  const currentYear = new Date().getFullYear()
  const base = MONTHS.map((month) => ({ month, completed: 0, pending: 0 }))

  reports.forEach((report) => {
    const dateValue = report.date || report.submittedAt || report.createdAt
    if (!dateValue) return
    const d = new Date(dateValue)
    if (Number.isNaN(d.getTime()) || d.getFullYear() !== currentYear) return
    const monthIndex = d.getMonth()
    if (monthIndex >= 0 && monthIndex < MONTHS.length) {
      base[monthIndex].completed += 1
    }
  })

  return base
}

const buildIssueData = (issues = []) => {
  const buckets = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  }

  issues.forEach((issue) => {
    if (issue?.priority && buckets[issue.priority] !== undefined) {
      buckets[issue.priority] += 1
    }
  })

  return [
    { priority: 'LOW', count: buckets.LOW, fill: '#10b981' },
    { priority: 'MEDIUM', count: buckets.MEDIUM, fill: '#f59e0b' },
    { priority: 'HIGH', count: buckets.HIGH, fill: '#ef4444' },
    { priority: 'CRITICAL', count: buckets.CRITICAL, fill: '#7f1d1d' },
  ]
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-surface-200">
        <p className="text-sm font-semibold text-surface-950">{`${payload[0].payload.month || payload[0].payload.priority}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const Analytics = ({ type, reports = [], issues = [], loading = false }) => {
  const inspectionData = buildInspectionData(reports)
  const issueData = buildIssueData(issues)

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-200">
        <div>
          <h3 className="text-lg font-bold text-surface-950 flex items-center gap-2">
            {type === 'inspections' ? (
              <>
                <TrendingUp size={20} className="text-primary-600" />
                Inspection Progress
              </>
            ) : (
              <>
                <Activity size={20} className="text-red-600" />
                Issues by Priority
              </>
            )}
          </h3>
          <p className="text-xs text-surface-600 mt-1">Last 6 months data</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner-lg border-primary-600"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          {type === 'inspections' ? (
            <AreaChart data={inspectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d8eff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d8eff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaef" vertical={false} />
              <XAxis dataKey="month" stroke="#8b96a8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8b96a8" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#0d8eff"
                fillOpacity={0.3}
                fill="url(#colorCompleted)"
                name="Completed"
                dot={{ fill: '#0d8eff', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="pending"
                stroke="#f59e0b"
                fillOpacity={0.2}
                fill="url(#colorPending)"
                name="Pending"
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={issueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d8eff" />
                  <stop offset="100%" stopColor="#0058b3" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaef" vertical={false} />
              <XAxis dataKey="priority" stroke="#8b96a8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8b96a8" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                fill="url(#barGradient)"
                name="Count"
                animationDuration={600}
              >
                {issueData.map((entry, index) => (
                  <Bar key={`bar-${index}`} dataKey="count" fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default Analytics

