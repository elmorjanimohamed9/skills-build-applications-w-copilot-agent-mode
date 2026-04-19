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

const difficultyFromWorkout = (workout) => {
  const intensity = String(workout.intensity || '').toLowerCase();
  const duration = Number(workout.duration_minutes || 0);

  if (intensity.includes('high') || intensity.includes('hard') || duration >= 45) {
    return 'Hard';
  }
  if (intensity.includes('medium') || duration >= 30) {
    return 'Medium';
  }
  return 'Easy';
};

const difficultyBadgeClass = (difficulty) => {
  if (difficulty === 'Easy') {
    return 'badge-pill badge-green';
  }
  if (difficulty === 'Medium') {
    return 'badge-pill badge-amber';
  }
  return 'badge-pill badge-red';
};

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const endpoint = useMemo(() => {
    const codespace = process.env.REACT_APP_CODESPACE_NAME;
    const baseUrl = codespace
      ? `https://${codespace}-8000.app.github.dev/api`
      : 'http://localhost:8000/api';

    return `${baseUrl}/workouts/`;
  }, []);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Workouts] Fetch endpoint:', endpoint);
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      console.log('[Workouts] Fetched data:', payload);
      setWorkouts(normalizeResponse(payload));
    } catch (fetchError) {
      console.error('[Workouts] Failed to fetch workouts:', fetchError);
      setError('Unable to load workouts.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const workoutCards = useMemo(() => {
    return workouts.map((workout) => {
      const difficulty = difficultyFromWorkout(workout);
      const exerciseCount = Math.max(4, Math.round(Number(workout.duration_minutes || 0) / 8));
      const completionRate = difficulty === 'Easy' ? 86 : difficulty === 'Medium' ? 68 : 49;
      return { ...workout, difficulty, exerciseCount, completionRate };
    });
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return workoutCards;
    }

    return workoutCards.filter((workout) => {
      return (
        String(workout.name || '').toLowerCase().includes(term) ||
        String(workout.category || '').toLowerCase().includes(term) ||
        String(workout.difficulty || '').toLowerCase().includes(term)
      );
    });
  }, [workoutCards, query]);

  const stats = useMemo(() => {
    const totalWorkouts = workoutCards.length;
    const totalDuration = workoutCards.reduce((sum, workout) => sum + Number(workout.duration_minutes || 0), 0);
    const avgDuration = totalWorkouts ? Math.round(totalDuration / totalWorkouts) : 0;
    const avgCompletionRate = totalWorkouts
      ? Math.round(workoutCards.reduce((sum, workout) => sum + workout.completionRate, 0) / totalWorkouts)
      : 0;

    return { totalWorkouts, avgDuration, avgCompletionRate };
  }, [workoutCards]);

  return (
    <section className="card page-card">
      <div className="card-body">
        <div className="page-header-row">
          <div>
            <h2 className="page-title">Workouts</h2>
            <p className="page-subtitle mb-0">Programs, duration targets, and difficulty-based completion trends.</p>
          </div>
          <button type="button" className="btn btn-primary">Add Workout</button>
        </div>

        <div className="metrics-grid">
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Total Workouts</p>
                <p className="metric-value">{stats.totalWorkouts}</p>
              </div>
              <span className="metric-icon">W</span>
            </div>
          </article>
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Avg Duration</p>
                <p className="metric-value">{stats.avgDuration} min</p>
              </div>
              <span className="metric-icon">D</span>
            </div>
          </article>
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Completion Rate</p>
                <p className="metric-value">{stats.avgCompletionRate}%</p>
              </div>
              <span className="metric-icon">C</span>
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
                placeholder="Search workout name, category, or difficulty"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4 d-flex gap-2">
              <button type="button" className="btn btn-primary" onClick={fetchWorkouts}>Refresh</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQuery('')}>Clear</button>
            </div>
          </div>
        </form>

        <a className="endpoint-link d-inline-block mb-2" href={endpoint} target="_blank" rel="noreferrer">
          API: {endpoint}
        </a>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="alert alert-info">Loading workouts...</div> : null}

        <div className="grid-two">
          {filteredWorkouts.map((workout) => (
            <article
              key={workout.id}
              className="surface-list-row"
              style={{ borderLeftColor: 'rgba(59,130,246,0.55)', transform: 'translateY(0)' }}
            >
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <div className="fw-semibold">{workout.name}</div>
                  <div className="small" style={{ color: 'var(--text-secondary)' }}>{workout.category}</div>
                </div>
                <span className={difficultyBadgeClass(workout.difficulty)}>{workout.difficulty}</span>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge-pill badge-blue">Duration {workout.duration_minutes} min</span>
                <span className="badge-pill badge-purple">Exercises {workout.exerciseCount}</span>
                <span className="badge-pill badge-green">Completion {workout.completionRate}%</span>
              </div>

              <button type="button" className="btn btn-primary">Start Workout</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Workouts;
