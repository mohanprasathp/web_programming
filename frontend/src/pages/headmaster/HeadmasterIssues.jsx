import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { headmasterService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const HeadmasterIssues = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    setFetchError('')
    try {
      const response = await headmasterService.getIssues()
      setIssues(response.data)
    } catch (err) {
      console.error('Error fetching issues:', err)
      setFetchError(err.response?.data?.message || err.message || 'Could not load issues')
      setIssues([])
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="HEADMASTER" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="HEADMASTER" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Issues Reported</h1>

            {fetchError && (
              <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
                {fetchError}
              </div>
            )}

            {loading ? (
              <p className="text-gray-600">Loading issues...</p>
            ) : issues.length === 0 ? (
              <p className="text-gray-600">No issues reported for your school</p>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">School</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Issue</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Priority</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Deadline</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-700">{issue.schoolId?.name || '-'}</td>
                        <td className="px-6 py-4 text-gray-700">{issue.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{issue.status}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(issue.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/headmaster/view-issue/${issue._id}`)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeadmasterIssues
