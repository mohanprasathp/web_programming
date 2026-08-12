import { useState, useEffect } from 'react'
import { headmasterService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const CorrectiveActions = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [actionText, setActionText] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const handleAddAction = async () => {
    if (!selectedIssue || !actionText.trim() || !targetDate) {
      alert('Please fill in all required fields: action and target date')
      return
    }

    setSubmitting(true)
    try {
      await headmasterService.addCorrectiveAction({
        issueId: selectedIssue._id,
        actionDescription: actionText,
        targetDate: targetDate,
      })
      setActionText('')
      setTargetDate('')
      setSelectedIssue(null)
      fetchIssues()
    } catch (err) {
      console.error('Error adding action:', err)
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Corrective Actions</h1>

            {issues.length === 0 ? (
              <p className="text-gray-600">No pending issues</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issues List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Pending Issues</h2>
                  </div>
                  <div className="divide-y">
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
                        <div className="mt-2 flex gap-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {issue.priority}
                          </span>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            {issue.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  {selectedIssue ? (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Add Action for Issue</h2>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-700"><strong>Issue:</strong> {selectedIssue.title}</p>
                        <p className="text-gray-700 mt-2"><strong>Description:</strong> {selectedIssue.description}</p>
                        <p className="text-gray-700 mt-2">
                          <strong>Deadline:</strong> {new Date(selectedIssue.deadline).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Corrective Action</label>
                        <textarea
                          value={actionText}
                          onChange={(e) => setActionText(e.target.value)}
                          placeholder="Describe the corrective action taken..."
                          rows="6"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Target Date *</label>
                        <input
                          type="date"
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <button
                        onClick={handleAddAction}
                        disabled={submitting || !actionText.trim() || !targetDate}
                        className={`w-full px-6 py-2 rounded-lg font-bold text-white transition ${
                          submitting || !actionText.trim() || !targetDate
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {submitting ? 'Submitting...' : 'Submit Action'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-gray-600">Select an issue to add a corrective action</p>
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

export default CorrectiveActions
