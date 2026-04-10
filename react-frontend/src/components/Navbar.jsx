import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        TASKFLOW <span>/ mgmt</span>
      </div>
      <div className="navbar-right">
        <span className="user-chip">
          {user?.name} · {isAdmin() ? '⬡ admin' : '◎ member'}
        </span>
        <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
