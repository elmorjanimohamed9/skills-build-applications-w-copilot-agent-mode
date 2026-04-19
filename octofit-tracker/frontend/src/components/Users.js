import { useCallback, useEffect, useMemo, useState } from 'react';

const normalizeResponse = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return [];
};

const daysFromNow = (dateValue) => {
  if (!dateValue) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = new Date(dateValue).getTime();
  if (Number.isNaN(parsed)) {
    return Number.POSITIVE_INFINITY;
  }

  return (Date.now() - parsed) / (1000 * 60 * 60 * 24);
};

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString();
};

const initialsFromName = (fullName, email) => {
  const source = String(fullName || '').trim();
  if (source) {
    const pieces = source.split(/\s+/).slice(0, 2);
    return pieces.map((chunk) => chunk[0]).join('').toUpperCase();
  }

  return String(email || 'NA').slice(0, 2).toUpperCase();
};

const avatarColor = (seed) => {
  const palette = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
  const hash = String(seed || '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
};

function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);

  const endpoint = useMemo(() => {
    const codespaceEndpoint = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/users/`;
    const localEndpoint = 'http://localhost:8000/api/users/';
    return process.env.REACT_APP_CODESPACE_NAME ? codespaceEndpoint : localEndpoint;
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Users] Fetch endpoint:', endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      console.log('[Users] Fetched data:', payload);
      setUsers(normalizeResponse(payload));
    } catch (fetchError) {
      console.error('[Users] Failed to fetch users:', fetchError);
      setError('Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return users;
    }

    return users.filter((user) => {
      return (
        String(user.full_name || '').toLowerCase().includes(term) ||
        String(user.email || '').toLowerCase().includes(term) ||
        String(user.hero_universe || '').toLowerCase().includes(term) ||
        String(user.fitness_level || '').toLowerCase().includes(term)
      );
    });
  }, [users, query]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeThisWeek = users.filter((user) => daysFromNow(user.updated_at || user.created_at) <= 7).length;
    const currentDate = new Date();
    const newThisMonth = users.filter((user) => {
      if (!user.created_at) {
        return false;
      }

      const created = new Date(user.created_at);
      return (
        !Number.isNaN(created.getTime()) &&
        created.getFullYear() === currentDate.getFullYear() &&
        created.getMonth() === currentDate.getMonth()
      );
    }).length;

    return { totalUsers, activeThisWeek, newThisMonth };
  }, [users]);

  return (
    <section className="card page-card">
      <div className="card-body">
        <div className="page-header-row">
          <div>
            <h2 className="page-title">Users</h2>
            <p className="page-subtitle mb-0">Athlete profiles, engagement, and role visibility.</p>
          </div>
          <button type="button" className="btn btn-primary">Add User</button>
        </div>

        <div className="metrics-grid">
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Total Users</p>
                <p className="metric-value">{stats.totalUsers}</p>
              </div>
              <span className="metric-icon">U</span>
            </div>
          </article>
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Active This Week</p>
                <p className="metric-value">{stats.activeThisWeek}</p>
              </div>
              <span className="metric-icon">W</span>
            </div>
          </article>
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">New This Month</p>
                <p className="metric-value">{stats.newThisMonth}</p>
              </div>
              <span className="metric-icon">M</span>
            </div>
          </article>
        </div>

        <form className="search-filter-shell" onSubmit={(event) => event.preventDefault()}>
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-8 search-shell">
              <span className="search-icon" aria-hidden="true" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, email, role, or universe"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4 d-flex gap-2">
              <button type="button" className="btn btn-primary" onClick={fetchUsers}>Refresh</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQuery('')}>Clear</button>
            </div>
          </div>
        </form>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <a className="endpoint-link" href={endpoint} target="_blank" rel="noreferrer">
            API: {endpoint}
          </a>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="alert alert-info">Loading users...</div> : null}

        <div className="surface-list">
          {filteredUsers.map((user) => {
            const expanded = expandedUserId === user.id;
            return (
              <article key={user.id} className="surface-list-row" style={{ borderLeftColor: 'rgba(59,130,246,0.55)' }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="avatar-circle" style={{ backgroundColor: avatarColor(user.email) }}>
                      {initialsFromName(user.full_name, user.email)}
                    </span>
                    <div>
                      <div className="fw-semibold">{user.full_name || 'Unknown User'}</div>
                      <div className="small" style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge-pill badge-blue">{user.fitness_level || 'Athlete'}</span>
                    <span className="badge-pill badge-purple">{user.hero_universe || 'Unknown'}</span>
                    <span className="small" style={{ color: 'var(--text-secondary)' }}>Joined {formatDate(user.created_at)}</span>
                  </div>

                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`View profile details for ${user.email}`}
                    onClick={() => setExpandedUserId(expanded ? null : user.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.7" />
                    </svg>
                  </button>
                </div>

                {expanded ? (
                  <div className="mt-3 p-3" style={{ borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-page)' }}>
                    <div className="row g-2">
                      <div className="col-12 col-md-4">
                        <div className="label-caps">User ID</div>
                        <div>{user.id}</div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="label-caps">Role</div>
                        <div>{user.fitness_level || 'N/A'}</div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="label-caps">Last update</div>
                        <div>{formatDate(user.updated_at || user.created_at)}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Users;
