import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { Clock, Bell, Eye, Lock, Zap } from 'lucide-react'

const SettingsPage = ({ userRole }) => {
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(30)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSave = () => {
    // Add save logic here
    console.log('Settings saved')
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Navbar userRole={userRole} />
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-surface-950 mb-2">Settings</h1>
              <p className="text-surface-900 font-semibold">Manage your preferences and application settings</p>
            </div>

            {/* Security Settings */}
            <div className="card-elevated">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-surface-200">
                <Lock className="text-primary-600" size={24} />
                <h2 className="text-lg font-semibold text-surface-950">Security</h2>
              </div>

              <div className="space-y-6">
                {/* Auto Logout Setting */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="text-secondary-600" size={18} />
                    <label className="form-label mb-0">Auto Logout Duration</label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="5"
                      max="240"
                      value={autoLogoutMinutes}
                      onChange={(e) => setAutoLogoutMinutes(Number(e.target.value))}
                      className="input-field max-w-[150px]"
                    />
                    <span className="text-surface-600 text-sm">minutes</span>
                  </div>
                  <p className="form-hint mt-2">Sessions will automatically log out after this period of inactivity</p>
                </div>

                {/* Password Change */}
                <button className="w-full p-4 bg-surface-100 rounded-lg border border-surface-200 hover:border-primary-200 transition-colors text-left group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-surface-600 font-medium group-hover:text-primary-600">Password</p>
                      <p className="text-surface-950 font-semibold mt-1">Change your password</p>
                    </div>
                    <span className="text-surface-500">→</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="card-elevated">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-surface-200">
                <Bell className="text-accent-600" size={24} />
                <h2 className="text-lg font-semibold text-surface-950">Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-100 rounded-lg border border-surface-200">
                  <div>
                    <p className="text-surface-950 font-medium">Email Notifications</p>
                    <p className="text-surface-600 text-sm">Receive important updates via email</p>
                  </div>
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-5' : ''}`}></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-100 rounded-lg border border-surface-200">
                  <div>
                    <p className="text-surface-950 font-medium">SMS Alerts</p>
                    <p className="text-surface-600 text-sm">Receive urgent alerts via SMS</p>
                  </div>
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only"
                    />
                    <div className="w-11 h-6 bg-primary-600 rounded-full transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform translate-x-5"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="card-elevated">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-surface-200">
                <Eye className="text-secondary-600" size={24} />
                <h2 className="text-lg font-semibold text-surface-950">Display</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-100 rounded-lg border border-surface-200">
                  <div>
                    <p className="text-surface-950 font-medium">Dark Mode</p>
                    <p className="text-surface-600 text-sm">Use dark theme for better visibility</p>
                  </div>
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-5' : ''}`}></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 sticky bottom-0 bg-white p-4 -m-6 mt-0 pt-6">
              <button onClick={handleSave} className="flex-1 btn btn-primary py-3">
                <Zap size={18} className="mr-2" />
                Save Settings
              </button>
              <button className="flex-1 btn btn-ghost py-3">
                Reset to Default
              </button>
            </div>

            {/* Help Section */}
            <div className="alert alert-info p-4">
              <p className="text-sm font-medium mb-2">Settings Information</p>
              <p className="text-sm text-info">
                Additional settings can be extended here for user preferences, language selection, timezone, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

