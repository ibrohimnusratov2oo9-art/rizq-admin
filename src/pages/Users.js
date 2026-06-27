import React, { useState, useEffect } from 'react';
import { getAllUsers, blockUser, unblockUser, verifyCourier } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const role = filter === 'all' ? null : filter;
      const res = await getAllUsers(role);
      setUsers(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId) => {
    try {
      await blockUser(userId);
      loadUsers();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await unblockUser(userId);
      loadUsers();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await verifyCourier(userId);
      loadUsers();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">👥 Пользователи</h1>
      
      <div className="filter-bar">
        {['all', 'customer', 'seller', 'courier'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '👥 Все' : f === 'customer' ? '🛒 Клиенты' : f === 'seller' ? '🏪 Продавцы' : '🚚 Курьеры'}
          </button>
        ))}
      </div>

      <div className="data-table">
        <h2>Список пользователей ({users.length})</h2>
        
        {loading ? (
          <div className="loading">⏳ Загрузка...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Телефон</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.phone}</strong></td>
                  <td>{user.full_name || '-'}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'customer' ? 'badge-blue' : 
                      user.role === 'seller' ? 'badge-purple' : 'badge-green'
                    }`}>
                      {user.role === 'customer' ? '🛒 Клиент' : 
                       user.role === 'seller' ? '🏪 Продавец' : '🚚 Курьер'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                      {user.is_active ? '✅ Активен' : '❌ Заблокирован'}
                    </span>
                  </td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    {user.is_active ? (
                      <button className="btn btn-block" onClick={() => handleBlock(user.id)}>
                        Заблокировать
                      </button>
                    ) : (
                      <button className="btn btn-unblock" onClick={() => handleUnblock(user.id)}>
                        Разблокировать
                      </button>
                    )}
                    {user.role === 'courier' && !user.is_verified && (
                      <button className="btn btn-verify" onClick={() => handleVerify(user.id)}>
                        ✅ Верифицировать
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Users;