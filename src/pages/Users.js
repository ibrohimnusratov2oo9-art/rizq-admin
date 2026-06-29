import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, blockUser, unblockUser, verifyCourier } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
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

  const handleBlock = async (e, userId) => {
    e.stopPropagation();
    try {
      await blockUser(userId);
      loadUsers();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleUnblock = async (e, userId) => {
    e.stopPropagation();
    try {
      await unblockUser(userId);
      loadUsers();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleVerify = async (e, userId) => {
    e.stopPropagation();
    try {
      await verifyCourier(userId);
      loadUsers();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const downloadCSV = () => {
    const csv = users.map(u => 
      `${u.id},${u.phone},${u.full_name || ''},${u.email || ''},${u.role},${u.is_active ? 'Active' : 'Blocked'},${u.created_at || ''}`
    ).join('\n');
    const header = 'ID,Телефон,Имя,Email,Роль,Статус,Дата\n';
    const blob = new Blob([header + csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rizq_users.csv';
    a.click();
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
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Список пользователей ({users.length})</h2>
          <button onClick={downloadCSV} className="btn btn-verify">
            📥 Скачать CSV
          </button>
        </div>
        
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
                <tr key={user.id} onClick={() => navigate(`/users/${user.id}`)} style={{cursor: 'pointer'}}>
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
                      <button className="btn btn-block" onClick={(e) => handleBlock(e, user.id)}>
                        Заблокировать
                      </button>
                    ) : (
                      <button className="btn btn-unblock" onClick={(e) => handleUnblock(e, user.id)}>
                        Разблокировать
                      </button>
                    )}
                    {user.role === 'courier' && !user.is_verified && (
                      <button className="btn btn-verify" onClick={(e) => handleVerify(e, user.id)}>
                        ✅ Верифицировать
                      </button>
                    )}
                    <button className="btn" style={{background: '#fef3c7', color: '#d97706'}} onClick={(e) => {
  e.stopPropagation();
  const newName = prompt('Новое имя:', user.full_name || '');
  if (newName !== null) {
    import('../services/api').then(({updateUser}) => {
      updateUser(user.id, {full_name: newName}).then(() => loadUsers());
    });
  }
}}>
  ✏️
</button>
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