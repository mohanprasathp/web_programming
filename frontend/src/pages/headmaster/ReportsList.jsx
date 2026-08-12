import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { headmasterService } from '../../services/api'

const ReportsList = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await headmasterService.getReports()
      setReports(response.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Inspection Reports</h1>
        <button
          onClick={() => navigate('/headmaster')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No reports received yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Inspection Report
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>School:</strong> {report.schoolId?.name || '-'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Plan:</strong> {report.inspectionPlanId?.title || '-'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Inspector:</strong> {report.inspectorId?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Submitted:</strong> {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/headmaster/view-report/${report._id}`)}
                  className="btn btn-primary"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReportsList
