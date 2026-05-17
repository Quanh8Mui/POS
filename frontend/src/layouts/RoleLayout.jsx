import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StaffProfileModal from '../components/StaffProfileModal';

export default function RoleLayout({ title, subtitle, navItems, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-mark">P</div>
          <div className="brand-copy">
            <strong>{title}</strong>
            <span>{subtitle}</span>
          </div>
        </div>

        <button className="staff-chip" onClick={() => setShowProfile(true)} type="button">
          <div>
            <strong>{user?.full_name || 'Guest'}</strong>
            <span>{user?.branch ? 'Branch · Cashier One' : user?.role || 'unknown'}</span>
          </div>
          <span className="staff-chip-arrow">›</span>
        </button>

        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} className="nav-link" to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-divider" />
          <button className="button secondary full" type="button" style={{ marginBottom: 10 }} onClick={() => navigate('/change-password')}>
            Đổi mật khẩu
          </button>
          <button className="button ghost full" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>

      <StaffProfileModal open={showProfile} user={user} onClose={() => setShowProfile(false)} />
    </div>
  );
}
