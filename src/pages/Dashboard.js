import React, { useState, useEffect } from 'react';
import { getStats, getTodayStats } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Обновляем каждые 30 секунд
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, todayRes] = await Promise.all([
        getStats(),
        getTodayStats()
      ]);
      setStats(statsRes.data);
      setTodayStats(todayRes.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">⏳ Загрузка...</div>;
  }

  return (
    <div>
      <h1 className="page-title">📊 Dashboard</h1>
      
      {/* Статистика за сегодня */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon" style={{background: '#dbeafe'}}>📦</div>
          <div className="label">Заказов сегодня</div>
          <div className="value">{todayStats?.orders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#d1fae5'}}>💰</div>
          <div className="label">Доход сегодня</div>
          <div className="value">{todayStats?.revenue || 0} с</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#fef3c7'}}>✅</div>
          <div className="label">Доставлено сегодня</div>
          <div className="value">{todayStats?.delivered || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#ede9fe'}}>👥</div>
          <div className="label">Новых пользователей</div>
          <div className="value">{todayStats?.new_users || 0}</div>
        </div>
      </div>

      {/* Общая статистика */}
      <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px'}}>📈 Общая статистика</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon" style={{background: '#dbeafe'}}>👥</div>
          <div className="label">Всего пользователей</div>
          <div className="value">{stats?.users?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#fce7f3'}}>🛒</div>
          <div className="label">Клиентов</div>
          <div className="value">{stats?.users?.customers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#d1fae5'}}>🏪</div>
          <div className="label">Ресторанов</div>
          <div className="value">{stats?.users?.sellers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#fef3c7'}}>🚚</div>
          <div className="label">Курьеров</div>
          <div className="value">{stats?.users?.couriers || 0}</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon" style={{background: '#dbeafe'}}>🏪</div>
          <div className="label">Ресторанов в системе</div>
          <div className="value">{stats?.business?.restaurants || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#d1fae5'}}>📦</div>
          <div className="label">Товаров</div>
          <div className="value">{stats?.business?.products || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#fef3c7'}}>📋</div>
          <div className="label">Всего заказов</div>
          <div className="value">{stats?.business?.orders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#ede9fe'}}>✅</div>
          <div className="label">Доставлено</div>
          <div className="value">{stats?.business?.delivered || 0}</div>
        </div>
      </div>

      {/* Финансы */}
      <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', marginTop: '10px'}}>💰 Финансы</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon" style={{background: '#d1fae5'}}>💵</div>
          <div className="label">Доход RIZQ</div>
          <div className="value" style={{color: '#059669'}}>{stats?.money?.rizq_income || 0} с</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#dbeafe'}}>🚚</div>
          <div className="label">Выплачено курьерам</div>
          <div className="value" style={{color: '#2563eb'}}>{stats?.money?.courier_paid || 0} с</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#fef3c7'}}>📊</div>
          <div className="label">Общий оборот</div>
          <div className="value" style={{color: '#d97706'}}>{stats?.money?.total_turnover || 0} с</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#fce7f3'}}>🔄</div>
          <div className="label">Обновляется каждые</div>
          <div className="value" style={{fontSize: '18px'}}>30 сек</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;