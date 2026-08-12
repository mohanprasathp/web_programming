import React, { useState, useEffect } from 'react'
import { Download, BarChart3, TrendingUp, AlertCircle } from 'lucide-react'
import { analyticsService } from '../../services/api'
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const AdvancedAnalytics = ({ userRole }) => {
  const [metrics, setMetrics] = useState(null)
  const [trends, setTrends] = useState(null)
  const [compliance, setCompliance] = useState(null)
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('inspections')
  const [exportFormat, setExportFormat] = useState('json')

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [metricsRes, trendsRes, complianceRes, schoolsRes] = await Promise.all([
        analyticsService.getInspectionMetrics(),
        analyticsService.getTrends({ days: 30 }),
        analyticsService.getCompliance(),
        analyticsService.getSchoolPerformance(),
      ])

      setMetrics(metricsRes.data)
      setTrends(trendsRes.data)
      setCompliance(complianceRes.data)
      setSchools(schoolsRes.data || [])
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await analyticsService.exportReport(exportFormat)
      
      if (exportFormat === 'csv') {
        const blob = new Blob([response], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
      } else {
        const element = document.createElement('a')
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(response, null, 2)))
        element.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.json`)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading analytics...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-surface-950">Advanced Analytics</h1>
          <p className="text-surface-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Download size={18} />
          Export ({exportFormat.toUpperCase()})
        </button>
      </div>

      {/* Export Format Selector */}
      <div className="bg-white rounded-lg p-4 border border-surface-200">
        <label className="block text-sm font-medium text-surface-950 mb-2">
          Export Format
        </label>
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Inspections"
            value={metrics.total}
            icon="📋"
          />
          <MetricCard
            label="Completed"
            value={metrics.completed}
            sublabel={`${metrics.completionRate}%`}
            icon="✅"
          />
          <MetricCard
            label="In Progress"
            value={metrics.inProgress}
            icon="⏳"
          />
          <MetricCard
            label="Pending"
            value={metrics.pending}
            icon="⏸️"
          />
        </div>
      )}

      {/* Compliance Score */}
      {compliance && (
        <div className="bg-white rounded-lg p-6 border border-surface-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-surface-950">Compliance Status</h2>
            <AlertCircle size={24} className="text-blue-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${(compliance.complianceScore / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {compliance.complianceScore}%
                    </div>
                    <div className="text-xs text-surface-600">Compliance</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-surface-700">Total Issues:</span>
                <span className="font-semibold">{compliance.totalIssues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-700">Resolved:</span>
                <span className="font-semibold text-green-600">{compliance.resolvedIssues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-700">Unresolved:</span>
                <span className="font-semibold text-red-600">{compliance.unresolvedIssues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-700">Critical Issues:</span>
                <span className="font-semibold text-red-600">{compliance.criticalUnresolved}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Charts */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border border-surface-200 shadow-md">
            <h2 className="text-lg font-bold text-surface-950 mb-4">Inspection Trend (30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.inspectionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg p-6 border border-surface-200 shadow-md">
            <h2 className="text-lg font-bold text-surface-950 mb-4">Issue Trend (30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.issueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* School Performance Ranking */}
      {schools.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-surface-200 shadow-md">
          <h2 className="text-xl font-bold text-surface-950 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            School Performance Ranking
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-100 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-surface-950">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-surface-950">School Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-surface-950">District</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-surface-950">Inspections</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-surface-950">Issues</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-surface-950">Critical</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-surface-950">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {schools.slice(0, 10).map((school, idx) => (
                  <tr key={school._id} className="border-b hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-semibold text-surface-950">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-surface-950">{school.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{school.district}</td>
                    <td className="px-4 py-3 text-center text-sm text-surface-950">{school.completedInspections}/{school.totalInspections}</td>
                    <td className="px-4 py-3 text-center text-sm text-surface-950">{school.totalIssues}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${school.criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {school.criticalIssues}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-12 bg-surface-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              school.complianceScore >= 80
                                ? 'bg-green-600'
                                : school.complianceScore >= 60
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${school.complianceScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{school.complianceScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const MetricCard = ({ label, value, sublabel, icon }) => (
  <div className="bg-white rounded-lg p-6 border border-surface-200 shadow-md hover:shadow-lg transition">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-surface-600 font-medium text-sm">{label}</h3>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <div className="text-3xl font-bold text-surface-950">{value}</div>
      {sublabel && <div className="text-sm text-green-600 font-semibold">{sublabel}</div>}
    </div>
  </div>
)

export default AdvancedAnalytics
