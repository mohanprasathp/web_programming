import { useState, useEffect } from 'react'
import { headmasterService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const RequestExtension = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [newDeadline, setNewDeadline] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const response = await headmasterService.getIssues()
      setIssues(response.data.filter(i => i.status !== 'resolved'))
    } catch (err) {
      console.error('Error fetching issues:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestExtension = async () => {
    if (!selectedIssue || !newDeadline || !reason.trim()) {
      setMessage('Please fill all fields')
      return
    }

    setSubmitting(true)
    try {
      await headmasterService.requestExtension({
        issueId: selectedIssue._id,
        newDeadline,
        reason,
      })
      setMessage('Extension requested successfully!')
      setNewDeadline('')
      setReason('')
      setSelectedIssue(null)
      setTimeout(() => fetchIssues(), 1500)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error requesting extension')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar userRole="HEADMASTER" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading issues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="HEADMASTER" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="HEADMASTER" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Request Deadline Extension</h1>

            {message && (
              <div className={`mb-6 px-4 py-3 rounded ${
                message.includes('successfully')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {issues.length === 0 ? (
              <p className="text-gray-600">No pending issues</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issues List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Issues</h2>
                  </div>
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {issues.map((issue) => (
                      <button
                        key={issue._id}
                        onClick={() => setSelectedIssue(issue)}
                        className={`w-full text-left p-4 transition ${
                          selectedIssue?._id === issue._id
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <h3 className="font-bold text-gray-800">{issue.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                        <div className="mt-2">
                          <p className="text-xs text-red-600">
                            <strong>Current Deadline:</strong> {new Date(issue.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extension Request Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  {selectedIssue ? (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Request Extension</h2>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-700"><strong>Issue:</strong> {selectedIssue.title}</p>
                        <p className="text-gray-700 mt-1">
                          <strong>Current Deadline:</strong> {new Date(selectedIssue.deadline).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">New Deadline</label>
                        <input
                          type="date"
                          value={newDeadline}
                          onChange={(e) => setNewDeadline(e.target.value)}
                          min={new Date(selectedIssue.deadline).toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Reason for Extension</label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Explain why extension is needed..."
                          rows="5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <button
                        onClick={handleRequestExtension}
                        disabled={submitting || !newDeadline || !reason.trim()}
                        className={`w-full px-6 py-2 rounded-lg font-bold text-white transition ${
                          submitting || !newDeadline || !reason.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {submitting ? 'Submitting...' : 'Request Extension'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-gray-600">Select an issue to request extension</p>
                    </div>
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

export default RequestExtension
