import { Link, Outlet } from 'react-router-dom';
import { useState, type ChangeEvent, type MouseEvent } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLES = ['ADMIN', 'USER', 'GUEST'];
const embedded = window.self !== window.top;

export default function Layout() {
  const { user, login, logout } = useAuth();
  const [rolePick, setRolePick] = useState(localStorage.getItem('auth_role') || 'GUEST');
  const [userPick, setUserPick] = useState(localStorage.getItem('auth_user') || '');

  function handleRoleSwitch(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    login(userPick || rolePick.toLowerCase(), rolePick);
  }

  function handleLogout(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setRolePick('GUEST');
    setUserPick('');
    logout();
  }

  if (embedded) {
    return <Outlet />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-xl font-semibold">Vision4 React</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="username"
              value={userPick}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUserPick(e.target.value)}
              className="header-input"
            />
            <select
              value={rolePick}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setRolePick(e.target.value)}
              className="header-select"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button onClick={handleRoleSwitch} className="btn btn-sm">Switch</button>
            <button onClick={handleLogout} className="btn btn-sm btn-secondary">Logout</button>
            {user && (
              <span className="role-badge">
                {user.username} ({user.role})
              </span>
            )}
          </div>
        </div>
        <nav className="mt-2 flex gap-4">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/persons" className="nav-link">People</Link>
          <Link to="/locations" className="nav-link">Locations</Link>
          <a href="/vision4-seam/home.seam" className="nav-link">Vision</a>
          <Link to="/about" className="nav-link">About</Link>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        Vision4 Demo &mdash; Seam 2 + React
      </footer>
    </div>
  );
}
