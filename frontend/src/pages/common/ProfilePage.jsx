import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { User, Mail, Shield, Briefcase } from 'lucide-react'

const ProfilePage = ({ userRole }) => {
  const employeeId = localStorage.getItem('userId')

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Navbar userRole={userRole} />
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-surface-950 mb-2">My Profile</h1>
              <p className="text-surface-900 font-semibold">Manage your account information and settings</p>
            </div>

            {/* Profile Card */}
            <div className="card-elevated">
              {/* Profile Header */}
              <div className="bg-gradient-primary p-8 text-white rounded-t-xl -m-6 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                      <User size={40} />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Welcome back</p>
                      <h2 className="text-2xl font-bold">{userRole}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-xs">Employee ID</p>
                    <p className="font-mono text-lg font-semibold">{employeeId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-surface-950 mb-4">Account Information</h3>
                  <div className="space-y-4">
                    {/* User Type */}
                    <div className="flex items-center gap-3 p-4 bg-surface-100 rounded-lg border border-surface-200 hover:border-primary-200 transition-colors">
                      <Briefcase className="text-primary-600 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <p className="text-xs text-surface-600 font-medium">Position</p>
                        <p className="text-surface-950 font-semibold">{userRole || 'Not assigned'}</p>
                      </div>
                    </div>

                    {/* Employee ID */}
                    <div className="flex items-center gap-3 p-4 bg-surface-100 rounded-lg border border-surface-200 hover:border-primary-200 transition-colors">
                      <Shield className="text-secondary-600 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <p className="text-xs text-surface-600 font-medium">Employee ID</p>
                        <p className="text-surface-950 font-mono font-semibold">{employeeId || 'Not available'}</p>
                      </div>
                    </div>

                    {/* Account Status */}
                    <div className="flex items-center gap-3 p-4 bg-surface-100 rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                      <div className="w-3 h-3 bg-green-600 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-xs text-surface-600 font-medium">Account Status</p>
                        <p className="text-green-600 font-semibold">Active</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="pt-4 border-t border-surface-200">
                  <h3 className="text-lg font-semibold text-surface-950 mb-4">Security & Access</h3>
                  <div className="space-y-3">
                    <button className="w-full p-4 bg-surface-100 rounded-lg border border-surface-200 hover:border-primary-200 transition-colors text-left group">
                      <p className="text-xs text-surface-600 font-medium group-hover:text-primary-600 transition-colors">Password</p>
                      <p className="text-surface-950 font-semibold">Change your password</p>
                    </button>
                    <button className="w-full p-4 bg-surface-100 rounded-lg border border-surface-200 hover:border-primary-200 transition-colors text-left group">
                      <p className="text-xs text-surface-600 font-medium group-hover:text-primary-600 transition-colors">Two-Factor Authentication</p>
                      <p className="text-surface-950 font-semibold">Not enabled</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Note */}
            <div className="alert alert-info p-4">
              <p className="text-sm">
                <strong>Note:</strong> Profile editing can be extended with additional fields like name, email, phone number, and more based on your requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

