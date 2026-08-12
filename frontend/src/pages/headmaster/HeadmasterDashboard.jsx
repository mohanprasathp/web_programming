import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { headmasterService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import DashboardCard from '../../components/DashboardCard'
import { Eye, AlertCircle } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const HeadmasterDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    schoolName: '',
    reportsReceived: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    extensionRequests: 0
  })
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setFetchError('')
    try {
      const [dashboardRes, issuesRes] = await Promise.all([
        headmasterService.getDashboard(),
        headmasterService.getIssues(),
      ])
      setDashboardData(dashboardRes.data)
      setIssues(issuesRes.data || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      const msg = err.response?.data?.message || err.message || 'Could not load dashboard'
      setFetchError(msg)
      setIssues([])
      setDashboardData({
        schoolName: '',
        reportsReceived: 0,
        pendingIssues: 0,
        resolvedIssues: 0,
        extensionRequests: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const issueSplitData = [
    { name: 'Pending', value: issues.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length, fill: '#ef4444' },
    { name: 'Resolved', value: issues.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length, fill: '#10b981' },
  ]

  const pendingIssues = issues.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS').slice(0, 6)

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'LOW': 'badge-success',
      'MEDIUM': 'badge-warning',
      'HIGH': 'badge-danger',
      'CRITICAL': 'badge-danger',
    }
    return priorityMap[priority] || 'badge-info'
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="HEADMASTER" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="HEADMASTER" />
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="spinner-lg border-primary-600"></div>
                <p className="text-surface-950 font-semibold">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <div className="p-6 lg:p-8 space-y-8">
              {fetchError && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
                  <strong>Could not load headmaster data.</strong> {fetchError}
                  {fetchError.includes('not configured') && (
                    <span className="block mt-2 text-amber-800">
                      Link your account to a school: set the user&apos;s <code className="bg-amber-100 px-1 rounded">school</code>{' '}
                      field to the exact school name, UDISE code, or school MongoDB id in the database, then refresh. If
                      you use seed data, run <code className="bg-amber-100 px-1 rounded">node backend/seed.js</code> after
                      pulling the latest seed (hm001 is tied to Habitat Hostel).
                    </span>
                  )}
                </div>
              )}
              {/* School Header Card */}
              <div className="card-elevated bg-gradient-cool border-l-4 border-primary-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-surface-600 mb-1">Your School</p>
                    <p className="text-2xl font-bold text-surface-950">
                      {dashboardData.schoolName || 'School not configured'}
                    </p>
                  </div>
                  <div className="text-5xl opacity-20">🏫</div>
                </div>
              </div>

              {/* Dashboard Stats */}
              <div>
                <h1 className="text-3xl font-bold text-surface-950 mb-2">Headmaster Dashboard</h1>
                <p className="text-surface-900 font-semibold mb-6">Monitor inspection reports and manage issues.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <DashboardCard
                    title="Reports Received"
                    value={dashboardData.reportsReceived}
                    icon="📄"
                    color="blue"
                  />
                  <DashboardCard
                    title="Pending Issues"
                    value={dashboardData.pendingIssues}
                    icon="⏳"
                    color="yellow"
                  />
                  <DashboardCard
                    title="Resolved Issues"
                    value={dashboardData.resolvedIssues}
                    icon="✅"
                    color="green"
                  />
                  <DashboardCard
                    title="Extension Requests"
                    value={dashboardData.extensionRequests}
                    icon="📅"
                    color="purple"
                  />
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Issue Distribution Chart */}
                <div className="lg:col-span-1 card-elevated">
                  <h2 className="text-lg font-bold text-surface-950 mb-6">Issue Status Distribution</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={issueSplitData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {issueSplitData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e8eaef',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {issueSplitData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          ></div>
                          <span className="text-surface-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-surface-950">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Issues Table */}
                <div className="lg:col-span-2 card-elevated">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-surface-950 flex items-center gap-2">
                      <AlertCircle size={20} className="text-yellow-600" />
                      Pending Issues
                    </h2>
                    <button
                      onClick={() => navigate('/headmaster/issues')}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Issue</th>
                          <th>Priority</th>
                          <th>Deadline</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingIssues.length === 0 ? (
                          <tr>
                            <td className="table-cell" colSpan={4}>
                              <div className="text-center py-8">
                                <p className="text-surface-600">No pending issues</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          pendingIssues.map((issue) => (
                            <tr key={issue._id}>
                              <td className="table-cell font-medium">{issue.title || '-'}</td>
                              <td className="table-cell">
                                <span className={`badge ${getPriorityBadge(issue.priority)}`}>
                                  {issue.priority || '-'}
                                </span>
                              </td>
                              <td className="table-cell text-surface-600">
                                {issue.deadline ? new Date(issue.deadline).toLocaleDateString() : '-'}
                              </td>
                              <td className="table-cell">
                                <button
                                  onClick={() => navigate(`/headmaster/view-issue/${issue._id}`)}
                                  className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                                >
                                  <Eye size={16} />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeadmasterDashboard

