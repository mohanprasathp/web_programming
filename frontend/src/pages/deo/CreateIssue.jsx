import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { deoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const CreateIssue = () => {
  const { inspectionId } = useParams()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [issuesCount, setIssuesCount] = useState(0)
  const [formData, setFormData] = useState({
    issueType: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const title = formData.title.trim()
      const description = formData.description.trim()

      if (!formData.issueType || !title || !description) {
        setError('Please fill all required fields')
        setSubmitting(false)
        return
      }

      if (title.length < 3) {
        setError('Issue title must be at least 3 characters (after trimming spaces).')
        setSubmitting(false)
        return
      }

      if (description.length < 10) {
        setError(
          'Detailed description must be at least 10 characters — the server needs enough detail to record the issue.'
        )
        setSubmitting(false)
        return
      }

      await deoService.createIssue({
        inspectionId,
        issueType: formData.issueType,
        title,
        description,
        priority: formData.priority,
      })

      setSuccess('✅ Issue created successfully!')
      setIssuesCount((prev) => prev + 1)

      // Reset form for next issue
      setFormData({
        issueType: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
      })
    } catch (err) {
      const data = err.response?.data
      const details = data?.details
      const base = data?.message || 'Failed to create issue'
      if (Array.isArray(details) && details.length > 0) {
        setError(`${base}\n\n• ${details.join('\n• ')}`)
      } else {
        setError(base)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = () => {
    navigate(`/deo/upload-photos/${inspectionId}`, {
      state: { issuesCreated: issuesCount },
    })
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="DEO/BEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="DEO/BEO" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🔍 Create Issue Report
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 whitespace-pre-line">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}

            {/* Issues Count Card */}
            <div className="card mb-6 bg-blue-50 border-l-4 border-blue-500">
              <p className="text-lg font-semibold text-gray-800">
                Issues Created: <span className="text-blue-600">{issuesCount}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Add issues found during inspection or continue without adding more
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card">
                <label className="block text-gray-700 font-bold text-lg mb-3">
                  Issue Category *
                </label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                >
                  <option value="">-- Select Issue Category --</option>
                  <option value="INFRASTRUCTURE">
                    🏗️ Infrastructure Issue
                  </option>
                  <option value="ACADEMIC">📚 Academic Issue</option>
                  <option value="SAFETY">🛡️ Safety Issue</option>
                  <option value="GOVERNMENT_SCHEME">
                    🏛️ Government Scheme Implementation
                  </option>
                  <option value="OTHER">📋 Other Issue</option>
                </select>
              </div>

              <div className="card">
                <label className="block text-gray-700 font-bold text-lg mb-3">
                  Issue Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Brief, concise title of the issue"
                  maxLength={200}
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  At least 3 characters, max 200 characters.
                </p>
              </div>

              <div className="card">
                <label className="block text-gray-700 font-bold text-lg mb-3">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Provide detailed explanation of the issue, observations, and impact..."
                  rows="5"
                  maxLength={2000}
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  Minimum 10 characters required. {formData.description.length}/2000 characters
                </p>
              </div>

              <div className="card">
                <label className="block text-gray-700 font-bold text-lg mb-3">
                  Priority Level *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'LOW', label: '🟢 Low', description: 'Minor issue' },
                    {
                      value: 'MEDIUM',
                      label: '🟡 Medium',
                      description: 'Moderate issue',
                    },
                    { value: 'HIGH', label: '🔴 High', description: 'Serious issue' },
                    {
                      value: 'CRITICAL',
                      label: '🔴 Critical',
                      description: 'Urgent issue',
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: option.value,
                        }))
                      }
                      className={`p-3 rounded border-2 text-left transition ${
                        formData.priority === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn btn-success font-semibold py-3 disabled:opacity-50"
                >
                  {submitting ? '⏳ Creating...' : '✅ Add Issue'}
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex-1 btn btn-primary font-semibold py-3"
                >
                  ➜ Skip & Continue
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>💡 Tip:</strong> Create separate issues for each problem found. You can
                add multiple issues before submitting the report.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateIssue
