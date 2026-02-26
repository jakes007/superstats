import { useEffect, useState } from 'react';
import { db } from './firebase';
import { getCountFromServer, collection } from 'firebase/firestore';
import './App.css';

function App() {
  // Stats state
  const [stats, setStats] = useState({
    leagues: 0,
    competitions: 0,
    associations: 0,
    clubs: 0,
    players: 0
  });
  
  const [loading, setLoading] = useState(true);

  // Fetch counts using efficient count query (FAST!)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use getCountFromServer - much faster than fetching all docs
        const [leagues, competitions, associations, clubs, players] = await Promise.all([
          getCountFromServer(collection(db, 'leagues')),
          getCountFromServer(collection(db, 'competitions')),
          getCountFromServer(collection(db, 'associations')),
          getCountFromServer(collection(db, 'clubs')),
          getCountFromServer(collection(db, 'players'))
        ]);

        setStats({
          leagues: leagues.data().count,
          competitions: competitions.data().count,
          associations: associations.data().count,
          clubs: clubs.data().count,
          players: players.data().count
        });
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Rolling number animation
  const RollingNumber = ({ value, label, color }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = value;
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth slowdown
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * end);
        
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [value]);

    return (
      <div className="stat-tile" style={{ borderColor: color }}>
        <div className="stat-glow" style={{ background: color }}></div>
        <div className="stat-number">{displayValue}</div>
        <div className="stat-label">{label}</div>
      </div>
    );
  };

  const statConfig = [
    { key: 'leagues', label: 'Active Leagues', color: '#00D9FF' },
    { key: 'competitions', label: 'Active Competitions', color: '#FF006E' },
    { key: 'associations', label: 'Total Associations', color: '#FFBE0B' },
    { key: 'clubs', label: 'Total Clubs', color: '#8338EC' },
    { key: 'players', label: 'Total Players', color: '#06FFA5' }
  ];

  return (
    <div className="app">
      {/* Neon Grid Background */}
      <div className="grid-bg"></div>
      
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">SUPERSTATS</span>
        </div>
        <div className="auth-buttons">
          <button className="btn-glow">Sign In</button>
          <button className="btn-glow primary">Register</button>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Hero */}
        <div className="hero">
          <h1 className="neon-text">FIND YOUR GAME</h1>
          <p className="subtitle">The ultimate darts competition platform</p>
          
          {/* Search */}
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search associations, clubs, teams, players..."
              className="search-input"
            />
            <button className="search-btn">🎯</button>
          </div>

          {/* Filters */}
          <div className="filters">
            {['All', 'Associations', 'Clubs', 'Teams', 'Players'].map((f, i) => (
              <button key={f} className={`filter-pill ${i === 0 ? 'active' : ''}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-container">
          <h2 className="section-title">LIVE STATS</h2>
          {loading ? (
            <div className="loading-pulse">Loading...</div>
          ) : (
            <div className="stats-grid">
              {statConfig.map(stat => (
                <RollingNumber 
                  key={stat.key}
                  value={stats[stat.key]}
                  label={stat.label}
                  color={stat.color}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <button className="admin-login">Admin Login</button>
      </footer>
    </div>
  );
}

export default App;