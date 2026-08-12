import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { issueService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const ViewIssueDetails = () => {
  const { issueId } = useParams()
  const navigate = useNavigate()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await issueService.getIssue(issueId)
        setIssue(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load issue details')
      } finally {
        setLoading(false)
      }
    }

    fetchIssue()
  }, [issueId])

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="HEADMASTER" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="HEADMASTER" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Issue Details</h1>
              <button onClick={() => navigate('/headmaster/issues')} className="btn btn-secondary">
                Back
              </button>
            </div>

            {loading ? (
              <p className="text-gray-600">Loading issue details...</p>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
            ) : !issue ? (
              <p className="text-gray-600">Issue not found</p>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Issue Information</h2>
                  <div className="space-y-3">
                    <p className="text-gray-800"><strong className="text-gray-900">School:</strong> {issue.schoolId?.name || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Title:</strong> {issue.title || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Type:</strong> {issue.issueType || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Priority:</strong> {issue.priority || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Status:</strong> {issue.status || '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Deadline:</strong> {issue.deadline ? new Date(issue.deadline).toLocaleDateString() : '-'}</p>
                    <p className="text-gray-800"><strong className="text-gray-900">Description:</strong> {issue.description || '-'}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Corrective Actions</h2>
                  {issue.correctiveActions?.length ? (
                    <ul className="space-y-3">
                      {issue.correctiveActions.map((action, idx) => (
                        <li key={idx} className="border border-gray-200 rounded p-3 bg-gray-50">
                          <p className="text-gray-800"><strong className="text-gray-900">Action:</strong> {action.actionDescription || '-'}</p>
                          <p className="text-gray-800"><strong className="text-gray-900">Status:</strong> {action.status || '-'}</p>
                          <p className="text-gray-800"><strong className="text-gray-900">Target Date:</strong> {action.targetDate ? new Date(action.targetDate).toLocaleDateString() : '-'}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No corrective actions yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewIssueDetails
