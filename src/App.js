import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Sellers from './pages/Sellers';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Bonuses from './pages/Bonuses';
import Payouts from './pages/Payouts';
import SearchPage from './pages/SearchPage';
import UserDetail from './pages/UserDetail';
import Logs from './pages/Logs';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import { getNotifications } from './services/api';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkTheme]);

  // Проверяем уведомления каждые 15 секунд
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const checkNotifications = async () => {
      try {
        const res = await getNotifications();
        const data = res.data;
        
        if (data.count > 0) {
          setNotifCount(data.count);
          setNotifs(data.notifications);
          
          // Звук для новых заказов и пользователей
          const hasSound = data.notifications.some(n => n.sound);
          if (hasSound && audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        // ignore
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:userId" element={<UserDetail />} />
            <Route path="/sellers" element={<Sellers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/bonuses" element={<Bonuses />} />
            <Route path="/payouts" element={<Payouts />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {/* Тёмная тема */}
        <button className="theme-toggle" onClick={() => setDarkTheme(!darkTheme)}>
          {darkTheme ? '☀️' : '🌙'}
        </button>

        {/* Уведомления */}
        {notifCount > 0 && (
          <div 
            className="notification-badge" 
            onClick={() => setShowNotifs(!showNotifs)}
          >
            🔔 {notifCount}
          </div>
        )}

        {/* Панель уведомлений */}
        {showNotifs && (
          <div style={{
            position: 'fixed',
            top: '70px',
            right: '20px',
            width: '350px',
            maxHeight: '500px',
            background: darkTheme ? '#1e293b' : 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            zIndex: 1001,
            overflow: 'auto',
            padding: '20px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
              <h3>🔔 Уведомления</h3>
              <button onClick={() => {setShowNotifs(false); setNotifCount(0);}} style={{
                background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer'
              }}>✕</button>
            </div>
            {notifs.map((n, i) => (
              <div key={i} style={{
                padding: '12px',
                background: darkTheme ? '#0f172a' : '#f8f9fa',
                borderRadius: '10px',
                marginBottom: '8px',
                borderLeft: `4px solid ${n.sound ? '#FF6B35' : '#3B82F6'}`
              }}>
                <div style={{fontWeight: '600', fontSize: '14px'}}>{n.title}</div>
                <div style={{fontSize: '13px', color: '#6c757d', marginTop: '4px'}}>{n.message}</div>
                <div style={{fontSize: '11px', color: '#9ca3af', marginTop: '4px'}}>
                  {n.time ? new Date(n.time).toLocaleTimeString() : ''}
                  {n.sound ? ' 🔊' : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Звук уведомления */}
        <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      </div>
    </Router>
  );
}

export default App;