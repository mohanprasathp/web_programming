import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { deoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const IssueCreation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { inspectionId } = location.state || {}

  const [formData, setFormData] = useState({
    issueType: 'OTHER',
    title: '',
    description: '',
    priority: 'MEDIUM',
  })
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddIssue = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await deoService.createIssue({
        inspectionId,
        schoolId: 'dummy', // Will be set from inspection
        ...formData,
      })

      if (response.data.success) {
        setIssues([...issues, response.data.issue])
        setFormData({
          issueType: 'OTHER',
          title: '',
          description: '',
          priority: 'MEDIUM',
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating issue')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveIssue = (index) => {
    setIssues(issues.filter((_, i) => i !== index))
  }

  const handleContinue = () => {
    navigate('/deo/submit-report', {
      state: { inspectionId, issuesCreated: issues.length },
    })
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="DEO/BEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="DEO/BEO" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Issues</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Issue Form */}
            <form onSubmit={handleAddIssue} className="card mb-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Issue Type</label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="INFRASTRUCTURE">Infrastructure</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="SAFETY">Safety</option>
                  <option value="GOVERNMENT_SCHEME">Government Scheme</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Issue Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Brief title of the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                  placeholder="Detailed description of the issue..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary font-semibold py-2"
              >
                {loading ? 'Adding Issue...' : 'Add Issue'}
              </button>
            </form>

            {/* Issues List */}
            {issues.length > 0 && (
              <div className="card mb-6">
                <h2 className="text-lg font-bold mb-4">Issues Created ({issues.length})</h2>
                <div className="space-y-3">
                  {issues.map((issue, index) => (
                    <div
                      key={index}
                      className="p-4 border-l-4 border-orange-400 bg-orange-50 rounded flex justify-between items-start"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{issue.title}</p>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {issue.issueType}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              issue.priority === 'CRITICAL'
                                ? 'bg-red-100 text-red-800'
                                : issue.priority === 'HIGH'
                                ? 'bg-orange-100 text-orange-800'
                                : issue.priority === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {issue.priority}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIssue(index)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleContinue}
                className="flex-1 btn btn-success font-semibold py-3"
              >
                Continue to Submit Report
              </button>
              <button
                onClick={() => navigate('/deo')}
                className="flex-1 btn btn-secondary font-semibold py-3"
              >
                Cancel
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm mt-4">
              You can add multiple issues. Press "Continue" when done.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueCreation
