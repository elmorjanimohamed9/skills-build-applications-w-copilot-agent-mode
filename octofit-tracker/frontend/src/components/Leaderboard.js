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

const avatarColor = (seed) => {
  const palette = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
  const hash = String(seed || '')
    .split('')
    .reduce((acc, character) => acc + character.charCodeAt(0), 0);
  return palette[hash % palette.length];
};

const getInitials = (email) => {
  const source = String(email || '').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  return (source.slice(0, 2) || 'NA').toUpperCase();
};

const teamClassName = (teamName) => {
  const normalized = String(teamName || '').toLowerCase();
  if (normalized.includes('dc')) {
    return 'badge-pill badge-blue';
  }
  if (normalized.includes('marvel')) {
    return 'badge-pill badge-red';
  }
  return 'badge-pill badge-purple';
};

function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

  const endpoint = useMemo(() => {
    const codespace = process.env.REACT_APP_CODESPACE_NAME;
    const baseUrl = codespace
      ? `https://${codespace}-8000.app.github.dev/api`
      : 'http://localhost:8000/api';

    return `${baseUrl}/leaderboard/`;
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Leaderboard] Fetch endpoint:', endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      console.log('[Leaderboard] Fetched data:', payload);
      setEntries(normalizeResponse(payload));
    } catch (fetchError) {
      console.error('[Leaderboard] Failed to fetch leaderboard:', fetchError);
      setError('Unable to load leaderboard.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const filteredEntries = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return entries;
    }

    return entries.filter((entry) => {
      return (
        String(entry.user_email || '').toLowerCase().includes(term) ||
        String(entry.team_name || '').toLowerCase().includes(term)
      );
    });
  }, [entries, query]);

  const maxScore = useMemo(() => {
    if (!entries.length) {
      return 0;
    }
    return Math.max(...entries.map((entry) => Number(entry.score || 0)));
  }, [entries]);

  const stats = useMemo(() => {
    const totalUsers = new Set(entries.map((entry) => entry.user_email)).size;
    const activeTeams = new Set(entries.map((entry) => entry.team_name)).size;
    return { totalUsers, activeTeams, topScore: maxScore };
  }, [entries, maxScore]);

  const scorePercent = (score) => {
    if (!maxScore) {
      return 0;
    }
    return Math.max(0, Math.min(100, (Number(score || 0) / maxScore) * 100));
  };

  const rowRankColor = (rank) => {
    if (rank === 1) {
      return '#f59e0b';
    }
    if (rank === 2) {
      return '#94a3b8';
    }
    if (rank === 3) {
      return '#b45309';
    }
    return 'rgba(255,255,255,0.3)';
  };

  return (
    <section className="card page-card">
      <div className="card-body">
        <div className="page-header-row">
          <div>
            <h2 className="page-title">Leaderboard</h2>
            <p className="page-subtitle mb-0">Competitive ranking with score momentum and team context.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={fetchLeaderboard}>Refresh Rankings</button>
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
                <p className="metric-label">Active Teams</p>
                <p className="metric-value">{stats.activeTeams}</p>
              </div>
              <span className="metric-icon">T</span>
            </div>
          </article>
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Top Score</p>
                <p className="metric-value">{stats.topScore}</p>
              </div>
              <span className="metric-icon">S</span>
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
                placeholder="Search by user email or team"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4 d-flex gap-2">
              <button type="button" className="btn btn-primary" onClick={fetchLeaderboard}>Refresh</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQuery('')}>Clear</button>
            </div>
          </div>
        </form>

        <a className="endpoint-link d-inline-block mb-2" href={endpoint} target="_blank" rel="noreferrer">
          API: {endpoint}
        </a>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="alert alert-info">Loading leaderboard...</div> : null}

        <div className="surface-list">
          {filteredEntries.map((entry) => (
            <article key={entry.id} className="surface-list-row" style={{ borderLeftColor: rowRankColor(entry.rank) }}>
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                <div className="d-flex align-items-center gap-2" style={{ minWidth: '86px' }}>
                  <div>
                    <div className="label-caps">Rank</div>
                    <div className="rank-value">{entry.rank}</div>
                  </div>
                  {entry.rank === 1 ? (
                    <span style={{ color: '#f59e0b' }}>
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path d="M2 12.6h12l-1-6-3 2.2L8 4.7 6 8.8 3 6.6l-1 6z" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    </span>
                  ) : null}
                </div>

                <div className="d-flex align-items-center gap-2" style={{ minWidth: '220px' }}>
                  <span className="avatar-circle" style={{ backgroundColor: avatarColor(entry.user_email) }}>
                    {getInitials(entry.user_email)}
                  </span>
                  <div>
                    <div className="label-caps">User</div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{entry.user_email}</div>
                  </div>
                </div>

                <div>
                  <div className="label-caps mb-1">Team</div>
                  <span className={teamClassName(entry.team_name)}>{entry.team_name}</span>
                </div>

                <div style={{ minWidth: '210px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="label-caps">Score</span>
                    <span className="fw-semibold">{entry.score}</span>
                  </div>
                  <div className="progress score-progress">
                    <div className="progress-bar" style={{ width: `${scorePercent(entry.score)}%` }} />
                  </div>
                </div>

                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Open details for ${entry.user_email}`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>

        {selectedEntry ? (
          <>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
              <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Leaderboard Entry</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedEntry(null)} />
                  </div>
                  <div className="modal-body">
                    <pre className="json-preview p-3 mb-0">{JSON.stringify(selectedEntry, null, 2)}</pre>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedEntry(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" onClick={() => setSelectedEntry(null)} />
          </>
        ) : null}
      </div>
    </section>
  );
}

export default Leaderboard;
