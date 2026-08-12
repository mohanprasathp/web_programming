import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { headmasterService } from '../../services/api'

const IssuesList = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedIssue, setSelectedIssue] = useState(null)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const response = await headmasterService.getIssues()
      setIssues(response.data)
    } catch (err) {
      console.error('Error fetching issues:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredIssues =
    filter === 'all' ? issues : issues.filter((issue) => issue.status === filter)

  const handleMarkResolved = async (issueId) => {
    try {
      await headmasterService.markIssueResolved({ issueId })
      fetchIssues()
      setSelectedIssue(null)
    } catch (err) {
      console.error('Error marking issue as resolved:', err)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="HEADMASTER" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="HEADMASTER" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
            {/* Issues List */}
            <div className="col-span-2">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Issues</h1>

              {/* Filter */}
              <div className="mb-6 flex gap-2 flex-wrap">
                {['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded font-semibold transition ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Issues List */}
              {loading ? (
                <p className="text-gray-600">Loading issues...</p>
              ) : filteredIssues.length === 0 ? (
                <p className="text-gray-600">No issues found</p>
              ) : (
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue._id}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-4 rounded cursor-pointer border-l-4 transition ${
                        selectedIssue?._id === issue._id
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-' +
                            (issue.priority === 'CRITICAL'
                              ? 'red'
                              : issue.priority === 'HIGH'
                              ? 'orange'
                              : issue.priority === 'MEDIUM'
                              ? 'yellow'
                              : 'green')
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800">{issue.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            issue.status === 'OPEN'
                              ? 'bg-red-100 text-red-800'
                              : issue.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{issue.issueType}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Issue Details */}
            {selectedIssue && (
              <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                <h2 className="text-xl font-bold mb-4">Issue Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm">Title</p>
                    <p className="font-semibold">{selectedIssue.title}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Description</p>
                    <p>{selectedIssue.description}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Priority</p>
                    <span
                      className={`inline-block px-3 py-1 font-semibold rounded ${
                        selectedIssue.priority === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : selectedIssue.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : selectedIssue.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {selectedIssue.priority}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Deadline</p>
                    <p>
                      {new Date(selectedIssue.deadline).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedIssue.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleMarkResolved(selectedIssue._id)}
                      className="w-full btn btn-success mt-6"
                    >
                      Mark as Resolved
                    </button>
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

export default IssuesList
