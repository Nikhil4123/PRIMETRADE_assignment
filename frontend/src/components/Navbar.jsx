import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (globalThis.innerWidth > 900) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    globalThis.addEventListener('resize', onResize);
    globalThis.addEventListener('keydown', onKeyDown);

    return () => {
      globalThis.removeEventListener('resize', onResize);
      globalThis.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className="nav-wrap">
      <div className="container nav-inner">
        <Link to="/dashboard" className="brand-link">
          PrimeTrade Tasks
        </Link>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="main-nav-actions"
        >
          Menu
        </button>

        {isAuthenticated() && (
          <div id="main-nav-actions" className={`nav-actions ${menuOpen ? 'open' : ''}`}>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `text-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              Dashboard
            </NavLink>
            {isAdmin() && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `text-link ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                Admin
              </NavLink>
            )}
            <span className="user-pill">{user?.name || user?.email}</span>
            <span className={`role-pill ${isAdmin() ? 'admin' : 'user'}`}>
              {user?.role}
            </span>
            <button onClick={handleLogout} className="btn btn-outline" type="button">
              Logout
            </button>
          </div>
        )}

        {!isAuthenticated() && (
          <div id="main-nav-actions" className={`nav-actions ${menuOpen ? 'open' : ''}`}>
            <NavLink
              to="/login"
              className={({ isActive }) => `text-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => `text-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
