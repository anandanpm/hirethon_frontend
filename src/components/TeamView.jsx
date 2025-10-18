import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers, getUserPresence } from '../services/rocketchat';
import './TeamView.css';

const TeamView = () => {
  const { authToken, userId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, online, away, busy, offline
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!authToken || !userId) return;

      try {
        setLoading(true);
        const result = await getAllUsers(authToken, userId);
        
        if (result.success) {
          // Filter out bots and inactive users, get only active team members
          const activeUsers = result.users.filter(user => 
            user.active && 
            user.type === 'user' && 
            user._id !== userId // Exclude current user
          );
          
          // Add mock presence data for demonstration
          const usersWithPresence = activeUsers.map(user => ({
            ...user,
            status: getRandomStatus(),
            lastSeen: getRandomLastSeen(),
            currentRoom: getRandomCurrentRoom(),
            statusMessage: getRandomStatusMessage()
          }));
          
          setUsers(usersWithPresence);
          setLastUpdated(new Date());
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (users.length > 0) {
        // Simulate real-time status updates
        setUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            status: Math.random() > 0.8 ? getRandomStatus() : user.status,
            lastSeen: Math.random() > 0.9 ? getRandomLastSeen() : user.lastSeen,
            currentRoom: Math.random() > 0.9 ? getRandomCurrentRoom() : user.currentRoom,
            statusMessage: Math.random() > 0.95 ? getRandomStatusMessage() : user.statusMessage
          }))
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [authToken, userId, users.length]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers(authToken, userId);
      if (result.success) {
        const activeUsers = result.users.filter(user => 
          user.active && 
          user.type === 'user' && 
          user._id !== userId
        );
        
        const usersWithPresence = activeUsers.map(user => ({
          ...user,
          status: getRandomStatus(),
          lastSeen: getRandomLastSeen(),
          currentRoom: getRandomCurrentRoom(),
          statusMessage: getRandomStatusMessage()
        }));
        
        setUsers(usersWithPresence);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError('Failed to refresh team members');
    } finally {
      setLoading(false);
    }
  };

  // Mock functions for demonstration - replace with real API calls
  const getRandomStatus = () => {
    const statuses = ['online', 'away', 'busy', 'offline'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getRandomLastSeen = () => {
    const times = ['2 min ago', '5 min ago', '1 hour ago', '2 hours ago', 'Yesterday'];
    return times[Math.floor(Math.random() * times.length)];
  };

  const getRandomCurrentRoom = () => {
    const rooms = ['#general', '#dev-team', '#support', '#design', '#marketing', '-'];
    return rooms[Math.floor(Math.random() * rooms.length)];
  };

  const getRandomStatusMessage = () => {
    const messages = ['Working on new features', 'In a meeting', 'Lunch break', 'Focus time', 'Available for calls', ''];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'away':
        return '🟡';
      case 'busy':
        return '🔴';
      case 'offline':
        return '⚪';
      default:
        return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#00c851';
      case 'away':
        return '#ffbb33';
      case 'busy':
        return '#ff4444';
      case 'offline':
        return '#9ca3af';
      default:
        return '#9ca3af';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Do Not Disturb';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.status === filter;
  });

  const getStatusCounts = () => {
    return {
      online: users.filter(u => u.status === 'online').length,
      away: users.filter(u => u.status === 'away').length,
      busy: users.filter(u => u.status === 'busy').length,
      offline: users.filter(u => u.status === 'offline').length,
      total: users.length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="team-view">
        <div className="team-view-header">
          <h3>Team View</h3>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-view">
        <div className="team-view-header">
          <h3>Team View</h3>
        </div>
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-view">
      <div className="team-view-header">
        <div className="header-left">
          <h3>Team View</h3>
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        <div className="header-right">
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh team status"
          >
            {loading ? '⟳' : '↻'}
          </button>
          <div className="team-stats">
            <span className="stat-item online">
              🟢 {statusCounts.online}
            </span>
            <span className="stat-item away">
              🟡 {statusCounts.away}
            </span>
            <span className="stat-item busy">
              🔴 {statusCounts.busy}
            </span>
            <span className="stat-item offline">
              ⚪ {statusCounts.offline}
            </span>
          </div>
        </div>
      </div>

      <div className="team-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({statusCounts.total})
        </button>
        <button 
          className={`filter-btn ${filter === 'online' ? 'active' : ''}`}
          onClick={() => setFilter('online')}
        >
          Online ({statusCounts.online})
        </button>
        <button 
          className={`filter-btn ${filter === 'away' ? 'active' : ''}`}
          onClick={() => setFilter('away')}
        >
          Away ({statusCounts.away})
        </button>
        <button 
          className={`filter-btn ${filter === 'busy' ? 'active' : ''}`}
          onClick={() => setFilter('busy')}
        >
          DND ({statusCounts.busy})
        </button>
        <button 
          className={`filter-btn ${filter === 'offline' ? 'active' : ''}`}
          onClick={() => setFilter('offline')}
        >
          Offline ({statusCounts.offline})
        </button>
      </div>

      <div className="team-members">
        {filteredUsers.length === 0 ? (
          <div className="no-members">
            <p>No team members found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="team-member">
              <div className="member-avatar">
                <div 
                  className="avatar-circle"
                  style={{ backgroundColor: getStatusColor(user.status) }}
                >
                  {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(user.status) }}
                ></div>
              </div>
              
              <div className="member-info">
                <div className="member-name">
                  {user.name || user.username || 'Unknown User'}
                </div>
                <div className="member-status">
                  <span className="status-icon">{getStatusIcon(user.status)}</span>
                  <span className="status-text">{getStatusText(user.status)}</span>
                </div>
                {user.statusMessage && (
                  <div className="status-message">
                    {user.statusMessage}
                  </div>
                )}
              </div>
              
              <div className="member-details">
                <div className="last-active">
                  {user.lastSeen}
                </div>
                <div className="current-room">
                  {user.currentRoom}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamView;
