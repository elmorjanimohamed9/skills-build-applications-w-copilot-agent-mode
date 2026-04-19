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

const classifyActivityType = (workoutName) => {
  const value = String(workoutName || '').toLowerCase();
  if (value.includes('run') || value.includes('sprint') || value.includes('cardio')) {
    return 'Running';
  }
  if (value.includes('cycle') || value.includes('bike') || value.includes('spin')) {
    return 'Cycling';
  }
  if (value.includes('strength') || value.includes('lift') || value.includes('hiit') || value.includes('amazon')) {
    return 'Strength';
  }
  return 'Other';
};

const typeBadgeClass = (type) => {
  if (type === 'Running') {
    return 'badge-pill badge-green';
  }
  if (type === 'Cycling') {
    return 'badge-pill badge-amber';
  }
  if (type === 'Strength') {
    return 'badge-pill badge-purple';
  }
  return 'badge-pill badge-blue';
};

const typeIconStyle = (type) => {
  if (type === 'Running') {
    return { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.35)' };
  }
  if (type === 'Cycling') {
    return { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.35)' };
  }
  if (type === 'Strength') {
    return { background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.35)' };
  }
  return { background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.35)' };
};

const avatarColor = (seed) => {
  const palette = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
  const hash = String(seed || '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
};

const initialsFromEmail = (email) => String(email || 'NA').slice(0, 2).toUpperCase();

const formatDateTime = (activityDate) => {
  if (!activityDate) {
    return 'Unknown time';
  }
  const parsed = new Date(activityDate);
  if (Number.isNaN(parsed.getTime())) {
    return activityDate;
  }
  return parsed.toLocaleDateString();
};

function Activities() {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState('All');

  const endpoint = useMemo(() => {
    const codespaceEndpoint = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/activities/`;
    const localEndpoint = 'http://localhost:8000/api/activities/';
    return process.env.REACT_APP_CODESPACE_NAME ? codespaceEndpoint : localEndpoint;
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Activities] Fetch endpoint:', endpoint);
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      console.log('[Activities] Fetched data:', payload);
      setActivities(normalizeResponse(payload));
    } catch (fetchError) {
      console.error('[Activities] Failed to fetch activities:', fetchError);
      setError('Unable to load activities.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const normalizedActivities = useMemo(() => {
    return activities.map((item) => ({ ...item, type: classifyActivityType(item.workout_name) }));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const term = query.trim().toLowerCase();

    return normalizedActivities.filter((activity) => {
      const typeMatch = activeType === 'All' || activity.type === activeType;
      if (!typeMatch) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        String(activity.user_email || '').toLowerCase().includes(term) ||
        String(activity.workout_name || '').toLowerCase().includes(term) ||
        String(activity.team_name || '').toLowerCase().includes(term)
      );
    });
  }, [normalizedActivities, activeType, query]);

  const stats = useMemo(() => {
    const totalActivities = normalizedActivities.length;
    const caloriesBurned = normalizedActivities.reduce((sum, activity) => sum + Number(activity.calories_burned || 0), 0);
    const thisWeek = normalizedActivities.filter((activity) => {
      if (!activity.activity_date) {
        return false;
      }
      const parsed = new Date(activity.activity_date);
      if (Number.isNaN(parsed.getTime())) {
        return false;
      }
      return (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    }).length;

    return { totalActivities, thisWeek, caloriesBurned };
  }, [normalizedActivities]);

  const tabs = ['All', 'Running', 'Cycling', 'Strength'];

  return (
    <section className="card page-card">
      <div className="card-body">
        <div className="page-header-row">
          <div>
            <h2 className="page-title">Activities</h2>
            <p className="page-subtitle mb-0">Live timeline of athlete sessions and earned points.</p>
          </div>
          <button type="button" className="btn btn-primary">Log Activity</button>
        </div>

        <div className="metrics-grid">
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Total Activities</p>
                <p className="metric-value">{stats.totalActivities}</p>
              </div>
              <span className="metric-icon">A</span>
            </div>
          </article>
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">This Week</p>
                <p className="metric-value">{stats.thisWeek}</p>
              </div>
              <span className="metric-icon">W</span>
            </div>
          </article>
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Calories Burned</p>
                <p className="metric-value">{stats.caloriesBurned}</p>
              </div>
              <span className="metric-icon">C</span>
            </div>
          </article>
        </div>

        <form className="search-filter-shell" onSubmit={(event) => event.preventDefault()}>
          <div className="row g-2 align-items-center mb-2">
            <div className="col-12 col-md-8 search-shell">
              <span className="search-icon" aria-hidden="true" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by user, team, or activity"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4 d-flex gap-2">
              <button type="button" className="btn btn-primary" onClick={fetchActivities}>Refresh</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQuery('')}>Clear</button>
            </div>
          </div>

          <div className="pill-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`pill-tab ${activeType === tab ? 'active' : ''}`}
                onClick={() => setActiveType(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </form>

        <a className="endpoint-link d-inline-block mb-2" href={endpoint} target="_blank" rel="noreferrer">
          API: {endpoint}
        </a>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="alert alert-info">Loading activities...</div> : null}

        <div className="timeline">
          {filteredActivities.map((activity) => {
            const points = Math.round(Number(activity.calories_burned || 0) / 10);
            const iconStyle = typeIconStyle(activity.type);
            return (
              <article key={activity.id} className="surface-list-row" style={{ borderLeftColor: iconStyle.color }}>
                <div className="timeline-item">
                  <span className="timeline-icon" style={iconStyle}>
                    {activity.type.slice(0, 1)}
                  </span>

                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="avatar-circle" style={{ backgroundColor: avatarColor(activity.user_email) }}>
                        {initialsFromEmail(activity.user_email)}
                      </span>
                      <div>
                        <div className="fw-semibold">{activity.user_email}</div>
                        <div className="small" style={{ color: 'var(--text-secondary)' }}>{activity.workout_name}</div>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <span className={typeBadgeClass(activity.type)}>{activity.type}</span>
                      <span className="badge-pill badge-blue">{activity.duration_minutes} min</span>
                      <span className="badge-pill badge-green">{points} pts</span>
                    </div>
                  </div>

                  <div className="small" style={{ color: 'var(--text-secondary)' }}>
                    {formatDateTime(activity.activity_date)}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Activities;
