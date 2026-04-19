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

const teamAccent = (teamName) => {
  const value = String(teamName || '').toLowerCase();
  if (value.includes('dc')) {
    return { border: 'rgba(59,130,246,0.7)', badge: 'badge-blue' };
  }
  if (value.includes('marvel')) {
    return { border: 'rgba(239,68,68,0.7)', badge: 'badge-red' };
  }
  return { border: 'rgba(148,163,184,0.7)', badge: 'badge-purple' };
};

function Teams() {
  const [teams, setTeams] = useState([]);
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [activities, setActivities] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState(null);

  const baseApi = useMemo(() => {
    const codespace = process.env.REACT_APP_CODESPACE_NAME;
    return codespace ? `https://${codespace}-8000.app.github.dev/api` : 'http://localhost:8000/api';
  }, []);

  const endpoint = `${baseApi}/teams/`;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Teams] Fetch endpoint:', endpoint);
      console.log('[Teams] Fetch endpoint:', `${baseApi}/leaderboard/`);
      console.log('[Teams] Fetch endpoint:', `${baseApi}/activities/`);

      const [teamsResponse, leaderboardResponse, activitiesResponse] = await Promise.all([
        fetch(endpoint),
        fetch(`${baseApi}/leaderboard/`),
        fetch(`${baseApi}/activities/`),
      ]);

      if (!teamsResponse.ok || !leaderboardResponse.ok || !activitiesResponse.ok) {
        throw new Error('One or more endpoints failed.');
      }

      const [teamsPayload, leaderboardPayload, activitiesPayload] = await Promise.all([
        teamsResponse.json(),
        leaderboardResponse.json(),
        activitiesResponse.json(),
      ]);

      console.log('[Teams] Fetched data:', teamsPayload);
      console.log('[Teams] Fetched data:', leaderboardPayload);
      console.log('[Teams] Fetched data:', activitiesPayload);

      setTeams(normalizeResponse(teamsPayload));
      setLeaderboardEntries(normalizeResponse(leaderboardPayload));
      setActivities(normalizeResponse(activitiesPayload));
    } catch (fetchError) {
      console.error('[Teams] Failed to fetch teams data:', fetchError);
      setError('Unable to load teams.');
    } finally {
      setLoading(false);
    }
  }, [baseApi, endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const teamInsights = useMemo(() => {
    const membersByTeam = new Map();
    const scoreByTeam = new Map();
    const topPerformerByTeam = new Map();

    activities.forEach((activity) => {
      const teamName = String(activity.team_name || '').toLowerCase();
      if (!teamName) {
        return;
      }

      if (!membersByTeam.has(teamName)) {
        membersByTeam.set(teamName, new Set());
      }
      membersByTeam.get(teamName).add(activity.user_email);
    });

    leaderboardEntries.forEach((entry) => {
      const teamName = String(entry.team_name || '').toLowerCase();
      if (!teamName) {
        return;
      }

      const score = Number(entry.score || 0);
      scoreByTeam.set(teamName, (scoreByTeam.get(teamName) || 0) + score);

      const currentTop = topPerformerByTeam.get(teamName);
      if (!currentTop || score > currentTop.score) {
        topPerformerByTeam.set(teamName, { user: entry.user_email, score });
      }
    });

    return { membersByTeam, scoreByTeam, topPerformerByTeam };
  }, [activities, leaderboardEntries]);

  const teamCards = useMemo(() => {
    return teams.map((team) => {
      const key = String(team.name || '').toLowerCase();
      const members = Array.from(teamInsights.membersByTeam.get(key) || []);
      const totalScore = teamInsights.scoreByTeam.get(key) || 0;
      const topPerformer = teamInsights.topPerformerByTeam.get(key);

      return {
        ...team,
        memberCount: members.length,
        totalScore,
        topPerformer: topPerformer ? `${topPerformer.user} (${topPerformer.score})` : 'No score data',
        members,
      };
    });
  }, [teams, teamInsights]);

  const filteredTeams = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return teamCards;
    }

    return teamCards.filter((team) => {
      return (
        String(team.name || '').toLowerCase().includes(term) ||
        String(team.description || '').toLowerCase().includes(term) ||
        String(team.topPerformer || '').toLowerCase().includes(term)
      );
    });
  }, [teamCards, query]);

  const stats = useMemo(() => {
    const totalTeams = teamCards.length;
    const totalMembers = teamCards.reduce((sum, team) => sum + team.memberCount, 0);
    const avgTeamSize = totalTeams ? (totalMembers / totalTeams).toFixed(1) : '0.0';
    const topTeam = [...teamCards].sort((a, b) => b.totalScore - a.totalScore)[0];
    const topTeamScore = topTeam ? `${topTeam.name} (${topTeam.totalScore})` : 'N/A';
    return { totalTeams, avgTeamSize, topTeamScore };
  }, [teamCards]);

  return (
    <section className="card page-card">
      <div className="card-body">
        <div className="page-header-row">
          <div>
            <h2 className="page-title">Teams</h2>
            <p className="page-subtitle mb-0">Team performance, member distribution, and top contributors.</p>
          </div>
          <button type="button" className="btn btn-primary">Create Team</button>
        </div>

        <div className="metrics-grid">
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Total Teams</p>
                <p className="metric-value">{stats.totalTeams}</p>
              </div>
              <span className="metric-icon">T</span>
            </div>
          </article>
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Avg Team Size</p>
                <p className="metric-value">{stats.avgTeamSize}</p>
              </div>
              <span className="metric-icon">A</span>
            </div>
          </article>
          <article className="metric-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="metric-label">Top Team Score</p>
                <p className="metric-value" style={{ fontSize: '1rem' }}>{stats.topTeamScore}</p>
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
                placeholder="Search by team name, performer, or description"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4 d-flex gap-2">
              <button type="button" className="btn btn-primary" onClick={fetchData}>Refresh</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQuery('')}>Clear</button>
            </div>
          </div>
        </form>

        <a className="endpoint-link d-inline-block mb-2" href={endpoint} target="_blank" rel="noreferrer">
          API: {endpoint}
        </a>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="alert alert-info">Loading teams...</div> : null}

        <div className="surface-list">
          {filteredTeams.map((team) => {
            const accent = teamAccent(team.name);
            const expanded = expandedTeam === team.id;
            return (
              <article key={team.id} className="surface-list-row" style={{ borderLeftColor: accent.border }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                  <div>
                    <div className="fw-semibold mb-1">{team.name}</div>
                    <div className="small" style={{ color: 'var(--text-secondary)' }}>{team.description || 'No description'}</div>
                  </div>

                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <span className="badge-pill badge-blue">Members {team.memberCount}</span>
                    <span className="badge-pill badge-green">Score {team.totalScore}</span>
                    <span className={`badge-pill ${accent.badge}`}>{team.topPerformer}</span>
                  </div>

                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Expand ${team.name}`}
                    onClick={() => setExpandedTeam(expanded ? null : team.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.7" />
                    </svg>
                  </button>
                </div>

                {expanded ? (
                  <div className="mt-3 p-3" style={{ borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-page)' }}>
                    <div className="label-caps mb-2">Member list</div>
                    {team.members.length ? (
                      <ul className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {team.members.map((member) => (
                          <li key={`${team.id}-${member}`}>{member}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-0" style={{ color: 'var(--text-muted)' }}>No members detected from activity data.</p>
                    )}
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

export default Teams;
