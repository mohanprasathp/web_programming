import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/api'
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react'

const LoginPage = ({ setIsAuthenticated, setUserRole }) => {
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(employeeId, password)

      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userRole', response.data.role)
        localStorage.setItem('userId', response.data.userId)
        
        // Update App state
        setIsAuthenticated(true)
        setUserRole(response.data.role)
        
        // Navigate to appropriate dashboard based on role
        const roleRoute = response.data.role === 'DEO/BEO' ? 'deo' : response.data.role.toLowerCase()
        navigate(`/${roleRoute}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-200 rounded-full opacity-10 translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="card-glass border border-white/30 overflow-hidden">
          {/* Header with Gradient Background */}
          <div className="bg-gradient-primary p-8 text-center text-white relative overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-white/0 to-white/10"></div>
            
            <div className="relative">
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden border border-white/30 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="/tn-logo.png"
                    alt="TN Logo"
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2">EduScope</h1>
              <p className="text-white/90 text-sm">School Inspection Monitoring System</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger">
                  <div className="text-sm">{error}</div>
                </div>
              )}

              {/* Employee ID Field */}
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input
                    type="text"
                    value={   employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="input-field pl-12"
                    placeholder="        Enter your employee ID"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12 pr-12"
                    placeholder="       Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-950 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 font-semibold text-base mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-surface-600">
            © 2024 EduScope. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

