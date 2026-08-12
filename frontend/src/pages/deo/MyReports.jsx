import { useState, useEffect } from 'react'
import { deoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const MyReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await deoService.getInspections()
      // Filter only submitted/completed inspections
      const submitted = (response.data || []).filter((i) => i.status === 'COMPLETED')
      setReports(submitted)
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="DEO/BEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="DEO/BEO" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Submitted Reports</h1>

            {loading ? (
              <p className="text-gray-600">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-gray-600">No submitted reports yet</p>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">School Name</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Plan</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Submitted Date</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-700">{report.schoolId?.name || '-'}</td>
                        <td className="px-6 py-4 text-gray-700">{report.inspectionPlanId?.title || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            report.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{report.issues?.length || 0}</td>
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

export default MyReports
