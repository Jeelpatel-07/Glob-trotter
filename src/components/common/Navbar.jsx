import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="navbar-brand">
          <Globe size={24} className="navbar-logo-icon" />
          <span className="navbar-logo-text">GlobeTrotter</span>
        </Link>

        {isAuthenticated && (
          <>
            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              <Link to="/dashboard" className="navbar-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/trips" className="navbar-link" onClick={() => setMenuOpen(false)}>My Trips</Link>
              <Link to="/search/cities" className="navbar-link" onClick={() => setMenuOpen(false)}>Explore</Link>
              <Link to="/community" className="navbar-link" onClick={() => setMenuOpen(false)}>Community</Link>
            </div>

            <div className="navbar-right">
              <Link to="/profile" className="navbar-avatar" title="Profile">
                {user?.photo ? (
                  <img src={user.photo} alt={user.firstName} className="navbar-avatar-img" />
                ) : (
                  <User size={18} />
                )}
              </Link>
              <button onClick={handleLogout} className="navbar-logout" title="Logout">
                <LogOut size={18} />
              </button>
              <button className="navbar-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
