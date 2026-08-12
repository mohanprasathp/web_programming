import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { inspectionService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const ViewReportDetails = () => {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await inspectionService.getInspection(reportId)
        setReport(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report details')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId])

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="HEADMASTER" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="HEADMASTER" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Report Details</h1>
              <button onClick={() => navigate('/headmaster/reports')} className="btn btn-secondary">
                Back
              </button>
            </div>

            {loading ? (
              <p className="text-gray-600">Loading report details...</p>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
            ) : !report ? (
              <p className="text-gray-600">Report not found</p>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                  <div className="space-y-3">
                    <p className="text-gray-800"><strong className="text-gray-900">School:</strong> {report.schoolId?.name || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Inspector:</strong> {report.inspectorId?.name || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Status:</strong> {report.status}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Submitted:</strong> {report.submittedAt ? new Date(report.submittedAt).toLocaleString() : '-'}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Checklist</h2>
                  <div className="space-y-3">
                    <p className="text-gray-800"><strong className="text-gray-900">Infrastructure:</strong> {report.checklist?.infrastructure || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Academic:</strong> {report.checklist?.academic || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Government Schemes:</strong> {report.checklist?.governmentSchemes || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Safety:</strong> {report.checklist?.safety || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Remarks:</strong> {report.remarks || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewReportDetails
