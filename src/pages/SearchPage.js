import React, { useState } from 'react';
import { getAllUsers } from '../services/api';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      const res = await getAllUsers();
      const filtered = res.data.filter(user => 
        (user.phone && user.phone.includes(query)) ||
        (user.full_name && user.full_name.toLowerCase().includes(query.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">🔍 Поиск</h1>

      <div className="data-table" style={{marginBottom: '24px'}}>
        <div style={{display: 'flex', gap: '12px'}}>
          <input
            type="text"
            className="login-input"
            placeholder="Поиск по телефону, имени или email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{marginBottom: 0, flex: 1}}
          />
          <button 
            onClick={handleSearch}
            style={{
              background: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0 30px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔍 Найти
          </button>
        </div>
      </div>

      {loading && <div className="loading">⏳ Поиск...</div>}

      {searched && !loading && (
        <div className="data-table">
          <h2>Результаты ({results.length})</h2>
          
          {results.length === 0 ? (
            <div className="loading">Ничего не найдено</div>
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
                  <th>Подписка</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {results.map(user => (
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
                        {user.is_active ? '✅' : '❌'}
                      </span>
                    </td>
                    <td>
                      {user.subscription_type && user.subscription_type !== 'none' ? (
                        <span className="badge badge-purple">
                          {user.subscription_type === 'plus' ? '⭐ Plus' : '👑 Premium'}
                        </span>
                      ) : '-'}
                    </td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchPage;