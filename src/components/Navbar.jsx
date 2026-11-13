import { Link } from 'react-router'
import '../styles/Navbar.css'
function Navbar({ user, handleLogout }) {
  if (user && user.isAdmin === true) {
    return null
  }
  return (
      <nav className='navbar'>
      <div className='navLogo'>
        <Link to='/' className='logo'></Link>
      </div>

      <div className='navLink'>
        <Link to='/'>Homepage</Link>
        <Link to='/cases'>Cases</Link>

        {user ? (<>
         <Link to='/dashboard'>Dashboard</Link>
         <Link to='/teams'>Teams</Link>
        
        </>)
        
        : null}
      </div>


      <div className='navAccount'>

      {user 
      ? 
      (<>
      <button onClick={handleLogout}>Sign Out</button>
      </>) : 
      (<>
        <Link to='/sign-up'>Sign Up</Link>
        <Link to='/sign-in'>Sign In</Link>
      </>)}
      </div>
    </nav>
  )
}

export default Navbar