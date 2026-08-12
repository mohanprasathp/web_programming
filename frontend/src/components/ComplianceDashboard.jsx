import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import axiosInstance from '../services/api'

const ComplianceDashboard = ({ schoolId }) => {
  const [compliance, setCompliance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompliance()
  }, [schoolId])

  const fetchCompliance = async () => {
    try {
      const response = await axiosInstance.get('/api/analytics/compliance', {
        params: schoolId ? { schoolId } : {},
      })
      setCompliance(response.data.data)
    } catch (err) {
      console.error('Error fetching compliance:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading compliance data...</div>
  }

  if (!compliance) {
    return <div className="p-6 text-center text-surface-600">No compliance data available</div>
  }

  const scoreColor =
    compliance.complianceScore >= 80
      ? 'text-green-600'
      : compliance.complianceScore >= 60
      ? 'text-yellow-600'
      : 'text-red-600'

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 border border-primary-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-surface-950 mb-2">Compliance Score</h2>
            <p className="text-surface-600">Overall compliance with inspection standards</p>
          </div>
          <TrendingUp size={40} className="text-primary-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                />
                {/* Progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={
                    compliance.complianceScore >= 80
                      ? '#10b981'
                      : compliance.complianceScore >= 60
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                  strokeWidth="10"
                  strokeDasharray={`${(compliance.complianceScore / 100) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${scoreColor}`}>
                    {compliance.complianceScore}%
                  </div>
                  <div className="text-xs text-surface-600">Compliance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="space-y-3">
            <ComplianceMetricCard
              icon={<AlertCircle size={20} />}
              label="Total Issues"
              value={compliance.totalIssues}
              color="text-blue-600"
            />
            <ComplianceMetricCard
              icon={<CheckCircle size={20} />}
              label="Resolved Issues"
              value={compliance.resolvedIssues}
              color="text-green-600"
            />
          </div>

          <div className="space-y-3">
            <ComplianceMetricCard
              icon={<Clock size={20} />}
              label="Unresolved Issues"
              value={compliance.unresolvedIssues}
              color="text-orange-600"
            />
            <ComplianceMetricCard
              icon={<AlertCircle size={20} />}
              label="Critical Unresolved"
              value={compliance.criticalUnresolved}
              color="text-red-600"
            />
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resolution Rate */}
        <div className="bg-white rounded-lg p-6 border border-surface-200">
          <h3 className="font-semibold text-surface-950 mb-4">Resolution Rate</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-surface-700">Resolved</span>
                <span className="text-sm font-semibold text-green-600">
                  {compliance.totalIssues > 0
                    ? Math.round((compliance.resolvedIssues / compliance.totalIssues) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-surface-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{
                    width: `${compliance.totalIssues > 0 ? (compliance.resolvedIssues / compliance.totalIssues) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-surface-700">Unresolved</span>
                <span className="text-sm font-semibold text-red-600">
                  {compliance.totalIssues > 0
                    ? Math.round((compliance.unresolvedIssues / compliance.totalIssues) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-surface-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full"
                  style={{
                    width: `${compliance.totalIssues > 0 ? (compliance.unresolvedIssues / compliance.totalIssues) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Status */}
        <div className="bg-white rounded-lg p-6 border border-surface-200">
          <h3 className="font-semibold text-surface-950 mb-4">Inspection Coverage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-700">Total Inspections</span>
              <span className="text-2xl font-bold text-surface-950">
                {compliance.inspectionCount}
              </span>
            </div>
            <div className="h-px bg-surface-200" />
            <p className="text-xs text-surface-600">
              Indicates the number of inspections conducted for this{' '}
              {schoolId ? 'school' : 'district'}.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Status Legend */}
      <div className="bg-white rounded-lg p-6 border border-surface-200">
        <h3 className="font-semibold text-surface-950 mb-4">Compliance Status Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <div>
              <p className="text-sm font-medium text-surface-950">Excellent (80-100%)</p>
              <p className="text-xs text-surface-600">School compliant with standards</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-600" />
            <div>
              <p className="text-sm font-medium text-surface-950">Good (60-79%)</p>
              <p className="text-xs text-surface-600">Needs improvement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <div>
              <p className="text-sm font-medium text-surface-950">Poor (&lt;60%)</p>
              <p className="text-xs text-surface-600">Urgent action required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ComplianceMetricCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-lg p-4 border border-surface-200">
    <div className="flex items-center gap-3">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-xs text-surface-600">{label}</p>
        <p className="text-2xl font-bold text-surface-950">{value}</p>
      </div>
    </div>
  </div>
)

export default ComplianceDashboard
