import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import Activities from './components/Activities';
import Leaderboard from './components/Leaderboard';
import Teams from './components/Teams';
import Users from './components/Users';
import Workouts from './components/Workouts';
import './App.css';

function App() {
  const codespace = process.env.REACT_APP_CODESPACE_NAME;
  const apiRootLink = codespace
    ? `https://${codespace}-8000.app.github.dev/api/`
    : 'http://localhost:8000/api/';

  return (
    <BrowserRouter>
      <div className="container app-shell py-4 py-lg-5">
        <header className="app-hero mb-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <img className="app-brand-logo" src={`${process.env.PUBLIC_URL}/octofitapp-small.png`} alt="OctoFit" />
              <div>
                <h1 className="display-6 fw-bold app-title mb-1">OctoFit Tracker</h1>
                <p className="page-subtitle mb-0">Performance and team fitness analytics in one focused dashboard.</p>
              </div>
            </div>
            <a className="btn api-ghost-btn" href={apiRootLink} target="_blank" rel="noreferrer">
              Open Backend API
            </a>
          </div>
        </header>

        <nav className="navbar navbar-expand-lg rounded-pill px-3 mb-4 octofit-navbar sticky-top">
          <span className="navbar-brand fw-semibold nav-title">Navigate</span>
          <div className="navbar-nav gap-2 flex-wrap ms-lg-2">
            <NavLink to="/users" className={({ isActive }) => `nav-link octofit-nav-link ${isActive ? 'active fw-semibold' : ''}`}>
              Users
            </NavLink>
            <NavLink to="/teams" className={({ isActive }) => `nav-link octofit-nav-link ${isActive ? 'active fw-semibold' : ''}`}>
              Teams
            </NavLink>
            <NavLink to="/activities" className={({ isActive }) => `nav-link octofit-nav-link ${isActive ? 'active fw-semibold' : ''}`}>
              Activities
            </NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => `nav-link octofit-nav-link ${isActive ? 'active fw-semibold' : ''}`}>
              Leaderboard
            </NavLink>
            <NavLink to="/workouts" className={({ isActive }) => `nav-link octofit-nav-link ${isActive ? 'active fw-semibold' : ''}`}>
              Workouts
            </NavLink>
          </div>
        </nav>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/activities" replace />} />
            <Route path="/users" element={<Users />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/workouts" element={<Workouts />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
