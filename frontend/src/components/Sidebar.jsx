import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LayoutDashboard, FileText, School, PenTool, BarChart3, AlertCircle, Clipboard, MapPin, MapPinned, FileCheck, BookOpen, CheckCircle2, Calendar } from 'lucide-react'

const Sidebar = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = {
    'CEO': [
      { label: 'Dashboard', path: '/ceo', icon: LayoutDashboard },
      { label: 'Create Plan', path: '/ceo/create-plan', icon: FileText },
      { label: 'Assign Schools', path: '/ceo/assign-schools', icon: School },
      { label: 'Sign Plans', path: '/ceo/sign-plans', icon: PenTool },
      { label: 'Reports', path: '/ceo/reports', icon: BarChart3 },
      { label: 'Issues', path: '/ceo/issues', icon: AlertCircle }
    ],
    'DEO/BEO': [
      { label: 'Dashboard', path: '/deo', icon: LayoutDashboard },
      { label: 'Inspections', path: '/deo/inspections', icon: Clipboard },
      { label: 'Start Inspection', path: '/deo/start-inspection', icon: MapPinned },
      { label: 'GPS Check-in', path: '/deo/gps-checkin', icon: MapPin },
      { label: 'Location Tracking', path: '/deo/location-tracking', icon: MapPinned },
      { label: 'Submit Report', path: '/deo/submit-report', icon: FileCheck },
      { label: 'My Reports', path: '/deo/my-reports', icon: BookOpen }
    ],
    'HEADMASTER': [
      { label: 'Dashboard', path: '/headmaster', icon: LayoutDashboard },
      { label: 'Reports', path: '/headmaster/reports', icon: FileCheck },
      { label: 'Issues', path: '/headmaster/issues', icon: AlertCircle },
      { label: 'Corrective Actions', path: '/headmaster/actions', icon: CheckCircle2 },
      { label: 'Request Extension', path: '/headmaster/extensions', icon: Calendar }
    ]
  }

  const items = menuItems[userRole] || []

  // Role home paths must match exactly; otherwise `/deo/...` would always activate Dashboard (`/deo`).
  const normalizePath = (p) => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p)
  const pathnameNorm = normalizePath(location.pathname) || '/'
  const dashboardRoots = ['/ceo', '/deo', '/headmaster']

  const isActive = (path) => {
    const menuPath = normalizePath(path)
    if (dashboardRoots.includes(menuPath)) {
      return pathnameNorm === menuPath
    }
    return pathnameNorm === menuPath || pathnameNorm.startsWith(`${menuPath}/`)
  }

  return (
    <aside className={`bg-gradient-primary text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} border-r border-primary-700 shadow-lg flex flex-col h-screen`}>
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-primary-600">
        {isOpen && <h2 className="text-lg font-bold">Navigation</h2>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="mt-4 flex-1 overflow-y-auto space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                active
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              title={!isOpen ? item.label : ''}
            >
              <Icon size={20} className={`flex-shrink-0 transition-transform ${active ? 'scale-110' : ''}`} />
              {isOpen && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  {active && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      {isOpen && (
        <div className="p-4 border-t border-primary-600">
          <p className="text-xs text-white/60 text-center">EduScope v2.0</p>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

