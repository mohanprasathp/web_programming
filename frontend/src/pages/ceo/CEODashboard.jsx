import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ceoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import DashboardCard from '../../components/DashboardCard'
import Analytics from '../../components/Analytics'
import { Settings, RefreshCw, Calendar, School, MapPin, Camera } from 'lucide-react'

const CEODashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSchools: 0,
    inspectionsCompleted: 0,
    pendingInspections: 0,
    criticalIssues: 0
  })
  const [reportsData, setReportsData] = useState([])
  const [issuesData, setIssuesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, reportsRes, issuesRes] = await Promise.all([
        ceoService.getDashboard(),
        ceoService.getReports(),
        ceoService.getIssues(),
      ])
      setDashboardData(dashboardRes.data)
      setReportsData(reportsRes.data || [])
      setIssuesData(issuesRes.data || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="CEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="CEO" />
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-surface-950 mb-2">CEO Dashboard</h1>
                  <p className="text-surface-900 font-semibold">Welcome back! Here's your school inspection overview.</p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="mt-4 sm:mt-0 flex items-center gap-2 btn btn-primary-outline"
                >
                  <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {/* Dashboard Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                  title="Total Schools"
                  value={dashboardData.totalSchools}
                  icon="🏫"
                  color="blue"
                />
                <DashboardCard
                  title="Inspections Completed"
                  value={dashboardData.inspectionsCompleted}
                  icon="✅"
                  color="green"
                />
                <DashboardCard
                  title="Pending Inspections"
                  value={dashboardData.pendingInspections}
                  icon="⏳"
                  color="yellow"
                />
                <DashboardCard
                  title="Critical Issues"
                  value={dashboardData.criticalIssues}
                  icon="⚠️"
                  color="red"
                />
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Analytics type="inspections" reports={reportsData} loading={loading} />
                <Analytics type="issues" issues={issuesData} loading={loading} />
              </div>

              {/* Quick Actions Section */}
              <div>
                <h2 className="text-lg font-bold text-surface-950 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <button
                    onClick={() => navigate('/ceo/create-plan')}
                    className="btn btn-primary w-full h-auto py-4 flex flex-col items-center justify-center gap-2 group"
                  >
                    <Calendar size={24} className="group-hover:-translate-y-1 transition-transform" />
                    <span>Create Inspection Plan</span>
                  </button>
                  <button
                    onClick={() => navigate('/ceo/assign-schools')}
                    className="btn btn-secondary w-full h-auto py-4 flex flex-col items-center justify-center gap-2 group"
                  >
                    <School size={24} className="group-hover:-translate-y-1 transition-transform" />
                    <span>Assign Schools</span>
                  </button>
                  <button
                    onClick={() => navigate('/ceo/reports')}
                    className="btn btn-accent w-full h-auto py-4 flex flex-col items-center justify-center gap-2 group"
                  >
                    <Settings size={24} className="group-hover:-translate-y-1 transition-transform" />
                    <span>View Reports</span>
                  </button>
                  <button
                    onClick={() => navigate('/ceo/live-locations')}
                    className="btn btn-primary w-full h-auto py-4 flex flex-col items-center justify-center gap-2 group bg-blue-600 hover:bg-blue-700"
                  >
                    <MapPin size={24} className="group-hover:-translate-y-1 transition-transform" />
                    <span>Live Locations</span>
                  </button>
                  <button
                    onClick={() => navigate('/ceo/photos')}
                    className="btn btn-primary w-full h-auto py-4 flex flex-col items-center justify-center gap-2 group bg-purple-600 hover:bg-purple-700"
                  >
                    <Camera size={24} className="group-hover:-translate-y-1 transition-transform" />
                    <span>View Photos</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CEODashboard

