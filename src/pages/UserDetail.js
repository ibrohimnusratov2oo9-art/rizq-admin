import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetail, blockUser, unblockUser, verifyCourier, resetPassword } from '../services/api';

function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, [userId]);

  const loadUser = async () => {
    try {
      const res = await getUserDetail(userId);
      setUser(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    await blockUser(userId);
    loadUser();
  };

  const handleUnblock = async () => {
    await unblockUser(userId);
    loadUser();
  };

  const handleVerify = async () => {
    await verifyCourier(userId);
    loadUser();
  };

  const handleResetPassword = async () => {
    const newPass = prompt('Введите новый пароль:', 'rizq12345');
    if (newPass) {
      await resetPassword(userId, newPass);
      alert('Пароль сброшен на: ' + newPass);
    }
  };

  if (loading) return <div className="loading">⏳ Загрузка...</div>;
  if (!user) return <div className="loading">Пользователь не найден</div>;

  const getRoleColor = () => {
    switch(user.role) {
      case 'customer': return '#3B82F6';
      case 'seller': return '#8B5CF6';
      case 'courier': return '#14B8A6';
      default: return '#6c757d';
    }
  };

  const getRoleEmoji = () => {
    switch(user.role) {
      case 'customer': return '🛒';
      case 'seller': return '🏪';
      case 'courier': return '🚚';
      default: return '👤';
    }
  };

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
        <button 
          onClick={() => navigate('/users')}
          style={{
            background: 'none',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Назад
        </button>
        <h1 className="page-title" style={{marginBottom: 0}}>
          {getRoleEmoji()} Профиль пользователя
        </h1>
      </div>

      {/* Основная информация */}
      <div className="user-detail-card">
        <div className="user-detail-header">
          <div className="user-avatar" style={{background: getRoleColor()}}>
            {getRoleEmoji()}
          </div>
          <div>
            <h2 style={{fontSize: '24px', marginBottom: '4px'}}>{user.full_name || 'Без имени'}</h2>
            <p style={{color: '#6c757d', fontSize: '16px'}}>{user.phone}</p>
            <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
              <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                {user.is_active ? '✅ Активен' : '❌ Заблокирован'}
              </span>
              <span className={`badge badge-blue`}>
                {user.role === 'customer' ? '🛒 Клиент' : user.role === 'seller' ? '🏪 Продавец' : '🚚 Курьер'}
              </span>
              {user.subscription_type && user.subscription_type !== 'none' && (
                <span className="badge badge-purple">
                  {user.subscription_type === 'plus' ? '⭐ Plus' : '👑 Premium'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="user-info-grid">
          <div className="user-info-item">
            <div className="label">📱 Телефон</div>
            <div className="value">{user.phone}</div>
          </div>
          <div className="user-info-item">
            <div className="label">📧 Email</div>
            <div className="value">{user.email || 'Не указан'}</div>
          </div>
          <div className="user-info-item">
            <div className="label">📧 Email верифицирован</div>
            <div className="value">{user.email_verified ? '✅ Да' : '❌ Нет'}</div>
          </div>
          <div className="user-info-item">
            <div className="label">🔐 Хэш пароля</div>
            <div className="value" style={{fontSize: '12px', wordBreak: 'break-all'}}>{user.password_hash || '-'}</div>
          </div>
          <div className="user-info-item">
            <div className="label">📅 Дата регистрации</div>
            <div className="value">{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</div>
          </div>
          <div className="user-info-item">
            <div className="label">✅ Верифицирован</div>
            <div className="value">{user.is_verified ? '✅ Да' : '❌ Нет'}</div>
          </div>
        </div>

        {/* Действия */}
        <div style={{marginTop: '20px', display: 'flex', gap: '12px'}}>
          {user.is_active ? (
            <button className="btn btn-block" onClick={handleBlock}>❌ Заблокировать</button>
          ) : (
            <button className="btn btn-unblock" onClick={handleUnblock}>✅ Разблокировать</button>
          )}
          {user.role === 'courier' && !user.is_verified && (
            <button className="btn btn-verify" onClick={handleVerify}>✅ Верифицировать</button>
          )}
          <button 
            onClick={handleResetPassword}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#fef3c7',
              color: '#d97706',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔐 Сбросить пароль
          </button>
        </div>
      </div>

      {/* Паспорт курьера */}
      {user.role === 'courier' && (
        <div className="user-detail-card">
          <h2 style={{marginBottom: '16px'}}>🆔 Документы курьера</h2>
          <div className="user-info-grid">
            <div className="user-info-item">
              <div className="label">📄 Фото паспорта</div>
              <div className="value">{user.passport_photo ? '✅ Загружено' : '❌ Нет'}</div>
            </div>
            <div className="user-info-item">
              <div className="label">🤳 Селфи</div>
              <div className="value">{user.selfie_photo ? '✅ Загружено' : '❌ Нет'}</div>
            </div>
            <div className="user-info-item">
              <div className="label">🤳📄 Селфи с паспортом</div>
              <div className="value">{user.selfie_with_passport ? '✅ Загружено' : '❌ Нет'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Статистика */}
      {user.courier_stats && (
        <div className="user-detail-card">
          <h2 style={{marginBottom: '16px'}}>📊 Статистика курьера</h2>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
            <div className="stat-card">
              <div className="icon" style={{background: '#dbeafe'}}>📦</div>
              <div className="label">Доставок</div>
              <div className="value">{user.courier_stats.deliveries}</div>
            </div>
            <div className="stat-card">
              <div className="icon" style={{background: '#d1fae5'}}>💰</div>
              <div className="label">Заработал</div>
              <div className="value" style={{color: '#059669'}}>{user.courier_stats.total_earned} с</div>
            </div>
            <div className="stat-card">
              <div className="icon" style={{background: '#fef3c7'}}>⭐</div>
              <div className="label">Рейтинг</div>
              <div className="value">{user.courier_stats.avg_rating || '-'}</div>
            </div>
            <div className="stat-card">
              <div className="icon" style={{background: '#ede9fe'}}>🎁</div>
              <div className="label">Бонусы</div>
              <div className="value" style={{color: '#8B5CF6'}}>{user.courier_stats.total_bonus} с</div>
            </div>
          </div>

          {/* Прогресс к бонусу */}
          {user.courier_stats.progress && (
            <div style={{marginTop: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span>Прогресс: {user.courier_stats.progress.current} / {user.courier_stats.progress.next_milestone || '✅'}</span>
                <span>🎁 {user.courier_stats.progress.next_bonus || 'Все получены'} с</span>
              </div>
              <div style={{background: '#e5e7eb', borderRadius: '10px', height: '12px', overflow: 'hidden'}}>
                <div style={{
                  background: '#FF6B35',
                  height: '100%',
                  borderRadius: '10px',
                  width: `${user.courier_stats.progress.next_milestone ? (user.courier_stats.progress.current / user.courier_stats.progress.next_milestone * 100) : 100}%`
                }}></div>
              </div>
              <div style={{marginTop: '8px', fontSize: '13px', color: '#6c757d'}}>
                Осталось: {user.courier_stats.progress.remaining} доставок
              </div>
            </div>
          )}

          {/* Бонусы */}
          {user.courier_stats.bonuses && user.courier_stats.bonuses.length > 0 && (
            <div style={{marginTop: '16px'}}>
              <h3>🎁 Полученные бонусы:</h3>
              {user.courier_stats.bonuses.map((b, i) => (
                <div key={i} style={{padding: '12px', background: '#f0fdf4', borderRadius: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between'}}>
                  <span>{b.reason === '100_deliveries' ? '🎯 100 доставок' : '🏆 500 доставок'}</span>
                  <span style={{color: '#059669', fontWeight: '600'}}>{b.amount} с</span>
                  <span style={{color: '#6c757d'}}>{new Date(b.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user.customer_stats && (
        <div className="user-detail-card">
          <h2 style={{marginBottom: '16px'}}>📊 Статистика клиента</h2>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(2, 1fr)'}}>
            <div className="stat-card">
              <div className="icon" style={{background: '#dbeafe'}}>📦</div>
              <div className="label">Заказов</div>
              <div className="value">{user.customer_stats.orders_count}</div>
            </div>
            <div className="stat-card">
              <div className="icon" style={{background: '#d1fae5'}}>💰</div>
              <div className="label">Потратил</div>
              <div className="value">{user.customer_stats.total_spent} с</div>
            </div>
          </div>
        </div>
      )}

      {user.seller_stats && (
        <div className="user-detail-card">
          <h2 style={{marginBottom: '16px'}}>📊 Статистика продавца</h2>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div className="stat-card">
              <div className="icon" style={{background: '#ede9fe'}}>🏪</div>
              <div className="label">Ресторан</div>
              <div className="value" style={{fontSize: '16px'}}>{user.seller_stats.restaurant_name}</div>
            </div>
            <div className="stat-card">
              <div className="icon" style={{background: '#dbeafe'}}>📦</div>
              <div className="label">Товаров</div>
              <div className="value">{user.seller_stats.products_count}</div>
            </div>
            <div className="stat-card">
              <div className="icon" style={{background: '#fef3c7'}}>📋</div>
              <div className="label">Заказов</div>
              <div className="value">{user.seller_stats.orders_count}</div>
            </div>
          </div>
        </div>
      )}

      {/* Заказы пользователя */}
      {user.orders && user.orders.length > 0 && (
        <div className="data-table">
          <h2>📦 Заказы пользователя ({user.orders.length})</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Статус</th>
                <th>Цена</th>
                <th>RIZQ Fee</th>
                <th>Расстояние</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {user.orders.map((order, i) => (
                <tr key={i}>
                  <td><strong>#{order.code}</strong></td>
                  <td>
                    <span className={`badge ${
                      order.status === 'доставлен' ? 'badge-green' : 
                      order.status === 'готов' ? 'badge-blue' : 'badge-yellow'
                    }`}>{order.status}</span>
                  </td>
                  <td>{order.delivery_price || 0} с</td>
                  <td style={{color: '#059669'}}>{order.rizq_fee || 0} с</td>
                  <td>{order.distance_km || 0} км</td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserDetail;