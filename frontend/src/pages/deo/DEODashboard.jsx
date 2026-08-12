import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { deoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import DashboardCard from '../../components/DashboardCard'
import { Eye, MapPin, Plus } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const DEODashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    assignedInspections: 0,
    completedInspections: 0,
    pendingInspections: 0,
    issuesCreated: 0
  })
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, inspectionsRes] = await Promise.all([
        deoService.getDashboard(),
        deoService.getInspections(),
      ])
      setDashboardData(dashboardRes.data)
      setInspections(inspectionsRes.data || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = [
    { name: 'Pending', value: inspections.filter((i) => i.status === 'PENDING').length, fill: '#f59e0b' },
    { name: 'In Progress', value: inspections.filter((i) => i.status === 'IN_PROGRESS').length, fill: '#0d8eff' },
    { name: 'Completed', value: inspections.filter((i) => i.status === 'COMPLETED').length, fill: '#10b981' },
  ]

  const recentInspections = [...inspections]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'badge-warning'
      case 'IN_PROGRESS':
        return 'badge-info'
      case 'COMPLETED':
        return 'badge-success'
      default:
        return 'badge-secondary'
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="DEO/BEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="DEO/BEO" />
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
              {/* Welcome Header */}
              <div>
                <h1 className="text-3xl font-bold text-surface-950 mb-2">DEO/BEO Dashboard</h1>
                <p className="text-surface-900 font-semibold">Manage and track school inspections in real-time.</p>
              </div>

              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                  title="Assigned Inspections"
                  value={dashboardData.assignedInspections}
                  icon="📋"
                  color="blue"
                />
                <DashboardCard
                  title="Completed"
                  value={dashboardData.completedInspections}
                  icon="✅"
                  color="green"
                />
                <DashboardCard
                  title="Pending"
                  value={dashboardData.pendingInspections}
                  icon="⏳"
                  color="yellow"
                />
                <DashboardCard
                  title="Issues Created"
                  value={dashboardData.issuesCreated}
                  icon="⚠️"
                  color="red"
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1 space-y-4">
                  <h2 className="text-lg font-bold text-surface-950">Quick Actions</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/deo/inspections')}
                      className="w-full btn btn-primary flex items-center justify-center gap-2 py-3"
                    >
                      <Eye size={18} />
                      View Inspections
                    </button>
                    <button
                      onClick={() => navigate('/deo/start-inspection')}
                      className="w-full btn btn-secondary flex items-center justify-center gap-2 py-3"
                    >
                      <MapPin size={18} />
                      Start Inspection
                    </button>
                    <button
                      onClick={() => navigate('/deo/submit-report')}
                      className="w-full btn btn-accent flex items-center justify-center gap-2 py-3"
                    >
                      <Plus size={18} />
                      Submit Report
                    </button>
                  </div>
                </div>

                {/* Chart */}
                <div className="lg:col-span-2 card-elevated">
                  <h2 className="text-lg font-bold text-surface-950 mb-6">Inspection Status</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8eaef" vertical={false} />
                      <XAxis dataKey="name" stroke="#8b96a8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#8b96a8" style={{ fontSize: '12px' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e8eaef',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={600}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Inspections Table */}
              <div className="card-elevated">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-surface-950">Recent Inspections</h2>
                  <button
                    onClick={() => navigate('/deo/inspections')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>School Name</th>
                        <th>Assigned Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInspections.length === 0 ? (
                        <tr>
                          <td className="table-cell" colSpan={4}>
                            <div className="text-center py-8">
                              <p className="text-surface-600">No inspections assigned yet</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        recentInspections.map((inspection) => (
                          <tr key={inspection._id}>
                            <td className="table-cell font-medium">{inspection.schoolId?.name || '-'}</td>
                            <td className="table-cell text-surface-600">
                              {inspection.createdAt ? new Date(inspection.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="table-cell">
                              <span className={`badge ${getStatusBadgeClass(inspection.status)}`}>
                                {inspection.status}
                              </span>
                            </td>
                            <td className="table-cell">
                              <button
                                onClick={() =>
                                  inspection.status === 'PENDING'
                                    ? navigate(`/deo/start-inspection/${inspection._id}`)
                                    : navigate(`/deo/inspection-form/${inspection._id}`)
                                }
                                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                              >
                                View Details
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
          )}
        </div>
      </div>
    </div>
  )
}

export default DEODashboard

