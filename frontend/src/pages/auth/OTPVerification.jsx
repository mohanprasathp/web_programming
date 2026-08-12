import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/api'
import { Shield, Archive, Loader, ArrowLeft } from 'lucide-react'

const OTPVerification = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const userId = sessionStorage.getItem('tempUserId')
      const response = await authService.verifyOTP(userId, otp)

      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userRole', response.data.role)
        localStorage.setItem('userId', response.data.userId)
        
        // Clear temp session
        sessionStorage.removeItem('tempEmployeeId')
        sessionStorage.removeItem('tempUserId')

        // Navigate based on role
        navigate(`/${response.data.role.toLowerCase()}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full opacity-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200 rounded-full opacity-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="card-glass border border-white/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-secondary p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-white/0 to-white/10"></div>
            
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                  <Shield size={32} />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Verify Identity</h1>
              <p className="text-white/90 text-sm">Enter the 6-digit OTP sent to your phone</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger">
                  <div className="text-sm">{error}</div>
                </div>
              )}

              {/* OTP Input Field */}
              <div className="form-group">
                <label className="form-label">One-Time Password</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength="6"
                  className="input-field text-center text-3xl tracking-[0.5em] font-bold text-primary-600"
                  placeholder="• • • • • •"
                  required
                />
                <p className="form-hint">Enter the 6-digit code</p>
              </div>

              {/* OTP Indicator */}
              <div className="flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i < otp.length ? 'bg-secondary-600 scale-100' : 'bg-border scale-75'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn btn-secondary py-3 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 btn btn-ghost py-2.5 text-base"
              >
                <ArrowLeft size={18} />
                Back to Login
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-surface-600">Test OTP</span>
                </div>
              </div>

              {/* Test OTP Info */}
              <div className="p-4 bg-surface-100 rounded-lg border border-surface-200 text-center">
                <p className="text-xs text-surface-600 mb-2">Use this code for testing:</p>
                <div className="bg-white rounded p-3 font-mono text-xl font-bold text-primary-600">
                  123456
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-surface-600">
            Didn't receive the code? Check spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OTPVerification

