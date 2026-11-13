import { Link } from 'react-router'
import "../styles/AdminSidebar.css"

function AdminSidebar({ handleLogout, isOpen, onToggle }) {
  return (
    <div>
      <button
        className={isOpen ? 'adminSidebarToggle' : 'adminSidebarToggle adminSidebarToggleClosed'}
        onClick={onToggle}
        aria-label={isOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {isOpen ? '❮' : '☰'}
      </button>
      <div className={isOpen ? 'adminSidebar' : 'adminSidebar adminSidebarHidden'}>
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
