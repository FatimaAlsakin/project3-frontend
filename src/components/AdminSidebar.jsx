import { Link } from 'react-router'
import "../styles/AdminSidebar.css"

function AdminSidebar({handleLogout}) {
  return (
    <div>
      <div className="adminSidebar">
        <Link to="/" className="adminLogo"></Link>
        <p>GAME MASTER</p>
            <div className="adminSidebarLinks">
                <Link to="/">Homepage</Link>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/cases">All Cases</Link>

            </div>
            <button onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  )
}

export default AdminSidebar
