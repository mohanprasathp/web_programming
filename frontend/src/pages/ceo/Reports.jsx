import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ceoService } from '../../services/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { Eye } from 'lucide-react'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await ceoService.getReports()
      setReports(response.data)
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userRole="CEO" />
      <div className="flex-1 flex flex-col">
        <Navbar userRole="CEO" />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Inspection Reports</h1>
            
            {loading ? (
              <p className="text-gray-600">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-gray-600">No reports available</p>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">School</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Inspection Plan</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Date</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-700 font-semibold">{report.schoolName}</td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">{report.planTitle}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">
                          {new Date(report.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/ceo/report/${report._id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                          >
                            <Eye size={16} />
                            View
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

export default Reports
