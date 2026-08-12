import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children, role, userRole }) => {
  if (!userRole) {
    return <Navigate to="/login" />
  }

  if (role && userRole.toUpperCase() !== role.toUpperCase()) {
    return <Navigate to="/login" />
  }

  return children
}

export default PrivateRoute
