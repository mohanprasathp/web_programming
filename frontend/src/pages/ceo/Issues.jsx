import { useState, useEffect } from 'react'
import { ceoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const Issues = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const response = await ceoService.getIssues()
      setIssues(response.data)
    } catch (err) {
      console.error('Error fetching issues:', err)
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
      <Sidebar userRole="CEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="CEO" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Issues Reported</h1>
            
            {loading ? (
              <p className="text-gray-600">Loading issues...</p>
            ) : issues.length === 0 ? (
              <p className="text-gray-600">No issues reported</p>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-900 font-bold">School</th>
                      <th className="px-6 py-3 text-left text-gray-900 font-bold">Issue Description</th>
                      <th className="px-6 py-3 text-left text-gray-900 font-bold">Priority</th>
                      <th className="px-6 py-3 text-left text-gray-900 font-bold">Date Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 font-semibold">{issue.schoolId?.name || '-'}</td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">{issue.description}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : '-'}
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

export default Issues
