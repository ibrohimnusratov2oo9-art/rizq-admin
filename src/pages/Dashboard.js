import React, { useState, useEffect } from 'react';
import { getStats, getTodayStats, getAllOrders, getAllUsers } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 15000); // Обновляем каждые 15 секунд
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, todayRes, ordersRes, usersRes] = await Promise.all([
        getStats(),
        getTodayStats(),
        getAllOrders(),
        getAllUsers()
      ]);
      setStats(statsRes.data);
      setTodayStats(todayRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">⏳ Загрузка данных...</div>;
  }

  // Данные для круговой диаграммы пользователей
  const usersPieData = [
    { name: 'Клиенты', value: stats?.users?.customers || 0, color: '#3B82F6' },
    { name: 'Продавцы', value: stats?.users?.sellers || 0, color: '#8B5CF6' },
    { name: 'Курьеры', value: stats?.users?.couriers || 0, color: '#14B8A6' },
  ];

  // Данные для графика статусов заказов
  const orderStatusData = [
    { name: 'Создан', count: orders.filter(o => o.status === 'создан').length, color: '#F59E0B' },
    { name: 'Готов', count: orders.filter(o => o.status === 'готов').length, color: '#3B82F6' },
    { name: 'Принят', count: orders.filter(o => o.status === 'принят').length, color: '#8B5CF6' },
    { name: 'Забран', count: orders.filter(o => o.status === 'забран').length, color: '#6366F1' },
    { name: 'Доставлен', count: orders.filter(o => o.status === 'доставлен').length, color: '#10B981' },
  ];

  // Данные для графика финансов
  const financeData = [
    { name: 'Доход RIZQ', value: stats?.money?.rizq_income || 0 },
    { name: 'Курьерам', value: stats?.money?.courier_paid || 0 },
    { name: 'Оборот', value: stats?.money?.total_turnover || 0 },
  ];

  // Последние 5 заказов
  const recentOrders = orders.slice(0, 5);

  // Последние 5 пользователей
  const recentUsers = users.slice(0, 5);

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>📊 Dashboard</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{
            background: '#d1fae5',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            color: '#059669',
            fontWeight: '600',
            animation: 'pulse 2s infinite'
          }}>
            🟢 LIVE
          </div>
          <span style={{fontSize: '13px', color: '#6c757d'}}>
            Обновлено: {lastUpdate.toLocaleTimeString()}
          </span>
          <button onClick={loadData} style={{
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            🔄 Обновить
          </button>
        </div>
      </div>
      
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
          <div className="label">Доставлено</div>
          <div className="value">{todayStats?.delivered || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#ede9fe'}}>👥</div>
          <div className="label">Новых пользователей</div>
          <div className="value">{todayStats?.new_users || 0}</div>
        </div>
      </div>

      {/* Графики */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px'}}>
        
        {/* Круговая диаграмма пользователей */}
        <div className="data-table">
          <h2>👥 Пользователи по ролям</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={usersPieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({name, value}) => `${name}: ${value}`}
              >
                {usersPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* График статусов заказов */}
        <div className="data-table">
          <h2>📦 Заказы по статусам</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B35" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Финансы */}
      <div className="data-table" style={{marginBottom: '30px'}}>
        <h2>💰 Финансы</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={financeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} сомони`} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {financeData.map((entry, index) => (
                <Cell key={index} fill={['#10B981', '#3B82F6', '#F59E0B'][index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Общая статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon" style={{background: '#dbeafe'}}>👥</div>
          <div className="label">Всего пользователей</div>
          <div className="value">{stats?.users?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#d1fae5'}}>🏪</div>
          <div className="label">Ресторанов</div>
          <div className="value">{stats?.business?.restaurants || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#fef3c7'}}>📦</div>
          <div className="label">Товаров</div>
          <div className="value">{stats?.business?.products || 0}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#ede9fe'}}>📋</div>
          <div className="label">Всего заказов</div>
          <div className="value">{stats?.business?.orders || 0}</div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px'}}>
        
        {/* Последние заказы */}
        <div className="data-table">
          <h2>🆕 Последние заказы</h2>
          {recentOrders.length === 0 ? (
            <div className="loading">Нет заказов</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Статус</th>
                  <th>Цена</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.code}</strong></td>
                    <td>
                      <span className={`badge ${
                        order.status === 'доставлен' ? 'badge-green' :
                        order.status === 'готов' ? 'badge-blue' : 'badge-yellow'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.delivery_price || 0} с</td>
                    <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Последние пользователи */}
        <div className="data-table">
          <h2>🆕 Новые пользователи</h2>
          {recentUsers.length === 0 ? (
            <div className="loading">Нет пользователей</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Телефон</th>
                  <th>Роль</th>
                  <th>Имя</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(user => (
                  <tr key={user.id}>
                    <td><strong>{user.phone}</strong></td>
                    <td>
                      <span className={`badge ${
                        user.role === 'customer' ? 'badge-blue' :
                        user.role === 'seller' ? 'badge-purple' : 'badge-green'
                      }`}>
                        {user.role === 'customer' ? '🛒' : user.role === 'seller' ? '🏪' : '🚚'} {user.role}
                      </span>
                    </td>
                    <td>{user.full_name || '-'}</td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;