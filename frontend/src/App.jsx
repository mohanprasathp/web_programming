import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/auth/LoginPage'
import OTPVerification from './pages/auth/OTPVerification'
// CEO Pages
import CEODashboard from './pages/ceo/CEODashboard'
import CreateInspectionPlan from './pages/ceo/CreateInspectionPlan'
import AssignSchools from './pages/ceo/AssignSchools'
import SelectPlan from './pages/ceo/SelectPlan'
import Reports from './pages/ceo/Reports'
import ViewCEOReportDetails from './pages/ceo/ViewCEOReportDetails'
import Issues from './pages/ceo/Issues'
import SignPlans from './pages/ceo/SignPlans'
import LiveInspectorLocations from './pages/ceo/LiveInspectorLocations'
import InspectionPhotos from './pages/ceo/InspectionPhotos'
// DEO Pages
import DEODashboard from './pages/deo/DEODashboard'
import InspectionsList from './pages/deo/InspectionsList'
import SelectInspection from './pages/deo/SelectInspection'
import StartInspection from './pages/deo/StartInspection'
import InspectionForm from './pages/deo/InspectionForm'
import PhotoUpload from './pages/deo/PhotoUpload'
import CreateIssue from './pages/deo/CreateIssue'
import GPSCheckin from './pages/deo/GPSCheckin'
import LocationTracking from './pages/deo/LocationTracking'
import SelectReport from './pages/deo/SelectReport'
import SubmitReport from './pages/deo/SubmitReport'
import MyReports from './pages/deo/MyReports'
// Headmaster Pages
import HeadmasterDashboard from './pages/headmaster/HeadmasterDashboard'
import ReportsList from './pages/headmaster/ReportsList'
import HeadmasterIssues from './pages/headmaster/HeadmasterIssues'
import CorrectiveActions from './pages/headmaster/CorrectiveActions'
import RequestExtension from './pages/headmaster/RequestExtension'
import ViewReportDetails from './pages/headmaster/ViewReportDetails'
import ViewIssueDetails from './pages/headmaster/ViewIssueDetails'
import ProfilePage from './pages/common/ProfilePage'
import SettingsPage from './pages/common/SettingsPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const syncAuthFromStorage = () => {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('userRole')
      if (token && role) {
        setIsAuthenticated(true)
        setUserRole(role)
      } else {
        setIsAuthenticated(false)
        setUserRole(null)
      }
    }

    // Check if user is already logged in
    syncAuthFromStorage()
    setLoading(false)

    // Keep auth state in sync after explicit logout/login events
    window.addEventListener('auth-changed', syncAuthFromStorage)
    window.addEventListener('storage', syncAuthFromStorage)

    return () => {
      window.removeEventListener('auth-changed', syncAuthFromStorage)
      window.removeEventListener('storage', syncAuthFromStorage)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={userRole === 'DEO/BEO' ? '/deo' : `/${userRole.toLowerCase()}`} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
        />
        <Route 
          path="/verify-otp" 
          element={<OTPVerification />} 
        />

        <Route
          path="/profile"
          element={<PrivateRoute userRole={userRole}><ProfilePage userRole={userRole} /></PrivateRoute>}
        />
        <Route
          path="/settings"
          element={<PrivateRoute userRole={userRole}><SettingsPage userRole={userRole} /></PrivateRoute>}
        />
        
        {/* CEO Routes */}
        <Route 
          path="/ceo" 
          element={<PrivateRoute role="CEO" userRole={userRole}><CEODashboard /></PrivateRoute>} 
        />
        <Route 
          path="/ceo/create-plan" 
          element={<PrivateRoute role="CEO" userRole={userRole}><CreateInspectionPlan /></PrivateRoute>} 
        />
        <Route 
          path="/ceo/assign-schools" 
          element={<PrivateRoute role="CEO" userRole={userRole}><SelectPlan /></PrivateRoute>} 
        />
        <Route 
          path="/ceo/assign-schools/:planId" 
          element={<PrivateRoute role="CEO" userRole={userRole}><AssignSchools /></PrivateRoute>} 
        />
        <Route 
          path="/ceo/reports" 
          element={<PrivateRoute role="CEO" userRole={userRole}><Reports /></PrivateRoute>} 
        />
        <Route 
          path="/ceo/report/:inspectionId" 
          element={<PrivateRoute role="CEO" userRole={userRole}><ViewCEOReportDetails /></PrivateRoute>} 
        />
        <Route 
          path="/ceo/issues" 
          element={<PrivateRoute role="CEO" userRole={userRole}><Issues /></PrivateRoute>} 
        />
        <Route 
          path="/ceo/sign-plans" 
          element={<PrivateRoute role="CEO" userRole={userRole}><SignPlans /></PrivateRoute>} 
        />
        <Route 
          path="/ceo/live-locations" 
          element={<PrivateRoute role="CEO" userRole={userRole}><LiveInspectorLocations /></PrivateRoute>} 
        />
        <Route 
          path="/ceo/photos" 
          element={<PrivateRoute role="CEO" userRole={userRole}><InspectionPhotos /></PrivateRoute>} 
        />
        
        {/* DEO Routes */}
        <Route 
          path="/deo" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><DEODashboard /></PrivateRoute>} 
        />
        <Route 
          path="/deo/inspections" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><InspectionsList /></PrivateRoute>} 
        />
        <Route 
          path="/deo/start-inspection" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><SelectInspection /></PrivateRoute>} 
        />
        <Route 
          path="/deo/start-inspection/:inspectionId" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><StartInspection /></PrivateRoute>} 
        />
        <Route 
          path="/deo/inspection-form/:inspectionId" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><InspectionForm /></PrivateRoute>} 
        />
        <Route 
          path="/deo/upload-photos/:inspectionId" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><PhotoUpload /></PrivateRoute>} 
        />
        <Route 
          path="/deo/create-issues/:inspectionId" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><CreateIssue /></PrivateRoute>} 
        />
        <Route 
          path="/deo/gps-checkin" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><GPSCheckin /></PrivateRoute>} 
        />
        <Route 
          path="/deo/location-tracking" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><LocationTracking /></PrivateRoute>} 
        />
        <Route 
          path="/deo/submit-report" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><SelectReport /></PrivateRoute>} 
        />
        <Route 
          path="/deo/submit-report/:inspectionId" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><SubmitReport /></PrivateRoute>} 
        />
        <Route 
          path="/deo/my-reports" 
          element={<PrivateRoute role="DEO/BEO" userRole={userRole}><MyReports /></PrivateRoute>} 
        />
        
        {/* Headmaster Routes */}
        <Route 
          path="/headmaster" 
          element={<PrivateRoute role="HEADMASTER" userRole={userRole}><HeadmasterDashboard /></PrivateRoute>} 
        />
        <Route 
          path="/headmaster/reports" 
          element={<PrivateRoute role="HEADMASTER" userRole={userRole}><ReportsList /></PrivateRoute>} 
        />
        <Route 
          path="/headmaster/issues" 
          element={<PrivateRoute role="HEADMASTER" userRole={userRole}><HeadmasterIssues /></PrivateRoute>} 
        />
        <Route 
          path="/headmaster/actions" 
          element={<PrivateRoute role="HEADMASTER" userRole={userRole}><CorrectiveActions /></PrivateRoute>} 
        />
        <Route 
          path="/headmaster/extensions" 
          element={<PrivateRoute role="HEADMASTER" userRole={userRole}><RequestExtension /></PrivateRoute>} 
        />
        <Route
          path="/headmaster/view-report/:reportId"
          element={<PrivateRoute role="HEADMASTER" userRole={userRole}><ViewReportDetails /></PrivateRoute>}
        />
        <Route
          path="/headmaster/view-issue/:issueId"
          element={<PrivateRoute role="HEADMASTER" userRole={userRole}><ViewIssueDetails /></PrivateRoute>}
        />
        
        <Route path="/" element={<Navigate to={isAuthenticated ? (userRole === 'DEO/BEO' ? '/deo' : `/${userRole.toLowerCase()}`) : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App
