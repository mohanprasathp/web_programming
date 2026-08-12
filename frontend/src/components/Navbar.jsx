import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, LogOut, Settings, User, ChevronDown, Bell } from 'lucide-react'

const Navbar = ({ userRole }) => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    sessionStorage.removeItem('tempEmployeeId')
    sessionStorage.removeItem('tempUserId')
    window.dispatchEvent(new Event('auth-changed'))
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-surface-200 shadow-sm sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
              <img
                src="/tn-logo.png"
                alt="TN Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">EduScope</h1>
              <p className="text-xs text-surface-600">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-10 border border-surface-200">
                <div className="p-4 border-b border-surface-200">
                  <h3 className="font-semibold text-surface-950">Notifications</h3>
                </div>
                <div className="p-4 text-center text-surface-600">
                  <p className="text-sm">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors group"
            >
              <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center text-white group-hover:shadow-md transition-shadow">
                <User size={16} />
              </div>
              <span className="text-sm font-medium text-surface-950 hidden sm:inline">{userRole}</span>
              <ChevronDown size={16} className={`text-surface-600 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-10 border border-surface-200 overflow-hidden">
                <div className="p-4 border-b border-surface-200 bg-gradient-cool">
                  <p className="text-sm font-semibold text-surface-950">{userRole}</p>
                  <p className="text-xs text-surface-600 mt-1">school.system@eduscope.edu</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-surface-950 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings')
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-surface-950 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                </div>
                <div className="border-t border-surface-200 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

