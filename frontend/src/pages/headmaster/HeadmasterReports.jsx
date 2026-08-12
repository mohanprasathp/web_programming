import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { headmasterService } from '../../services/api'

const HeadmasterReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await headmasterService.getReports()
      setReports(response.data)
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="HEADMASTER" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="HEADMASTER" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Inspection Reports</h1>

            {/* Filter */}
            <div className="mb-6 flex gap-2">
              {['all', 'DRAFT', 'SUBMITTED', 'REVIEWED'].map((status) => (
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

            {/* Reports List */}
            {loading ? (
              <p className="text-gray-600">Loading reports...</p>
            ) : filteredReports.length === 0 ? (
              <p className="text-gray-600">No reports found</p>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report._id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{report.schoolId?.name}</h3>
                        <p className="text-gray-600 text-sm">
                          Inspector: {report.inspectorId?.name}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-white font-semibold ${
                          report.status === 'SUBMITTED'
                            ? 'bg-yellow-500'
                            : report.status === 'REVIEWED'
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{report.findings}</p>
                    <button className="text-blue-600 hover:text-blue-800 font-semibold">
                      View Full Report →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeadmasterReports
