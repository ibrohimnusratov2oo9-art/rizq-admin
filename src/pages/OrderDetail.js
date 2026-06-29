import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail, updateOrderStatus, cancelOrder } from '../services/api';

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await getOrderDetail(orderId);
      setData(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrder();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Отменить заказ?')) {
      try {
        await cancelOrder(orderId);
        navigate('/orders');
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    }
  };

  if (loading) return <div className="loading">⏳ Загрузка...</div>;
  if (!data) return <div className="loading">Заказ не найден</div>;

  const order = data.order;
  const customer = data.customer;
  const restaurant = data.restaurant;
  const courier = data.courier;

  const statuses = ['создан', 'готов', 'принят', 'забран', 'доставлен'];
  const currentIndex = statuses.indexOf(order.status);

  const getStatusColor = (status) => {
    switch(status) {
      case 'создан': return '#F59E0B';
      case 'готов': return '#3B82F6';
      case 'принят': return '#8B5CF6';
      case 'забран': return '#6366F1';
      case 'доставлен': return '#10B981';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
        <button onClick={() => navigate('/orders')} style={{
          background: 'none', border: '2px solid #e5e7eb', borderRadius: '12px',
          padding: '10px 16px', cursor: 'pointer', fontSize: '14px'
        }}>← Назад</button>
        <h1 className="page-title" style={{marginBottom: 0}}>
          📦 Заказ #{order.code}
        </h1>
        <span className="badge" style={{
          background: getStatusColor(order.status) + '20',
          color: getStatusColor(order.status),
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {order.status}
        </span>
      </div>

      {/* Timeline статусов */}
      <div className="user-detail-card">
        <h2 style={{marginBottom: '20px'}}>📊 Статус заказа</h2>
        <div style={{display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 20px'}}>
          <div style={{
            position: 'absolute', top: '20px', left: '40px', right: '40px',
            height: '4px', background: '#e5e7eb', zIndex: 0
          }}></div>
          <div style={{
            position: 'absolute', top: '20px', left: '40px',
            height: '4px', background: '#FF6B35', zIndex: 1,
            width: `${(currentIndex / (statuses.length - 1)) * 100}%`,
            maxWidth: 'calc(100% - 80px)',
            transition: 'width 0.5s'
          }}></div>
          
          {statuses.map((s, i) => (
            <div key={s} style={{textAlign: 'center', zIndex: 2, position: 'relative'}}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: i <= currentIndex ? '#FF6B35' : '#e5e7eb',
                color: i <= currentIndex ? 'white' : '#6c757d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', margin: '0 auto',
                boxShadow: i <= currentIndex ? '0 4px 10px rgba(255,107,53,0.3)' : 'none'
              }}>
                {i <= currentIndex ? '✓' : i + 1}
              </div>
              <div style={{
                marginTop: '8px', fontSize: '12px', fontWeight: '600',
                color: i <= currentIndex ? '#FF6B35' : '#6c757d'
              }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Кнопки управления */}
        <div style={{marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          {statuses.map(s => (
            <button key={s} onClick={() => handleStatusChange(s)}
              className={`filter-btn ${order.status === s ? 'active' : ''}`}
              style={{fontSize: '13px'}}
            >
              {s}
            </button>
          ))}
          <button onClick={handleCancel} className="btn btn-block" style={{marginLeft: 'auto'}}>
            ❌ Отменить заказ
          </button>
        </div>
      </div>

      {/* Информация */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px'}}>
        
        {/* Клиент */}
        <div className="user-detail-card" onClick={() => navigate(`/users/${customer.id || ''}`)} style={{cursor: 'pointer'}}>
          <h3 style={{marginBottom: '16px'}}>🛒 Клиент</h3>
          <div className="user-info-item" style={{marginBottom: '8px'}}>
            <div className="label">📱 Телефон</div>
            <div className="value">{customer.phone || '-'}</div>
          </div>
          <div className="user-info-item" style={{marginBottom: '8px'}}>
            <div className="label">👤 Имя</div>
            <div className="value">{customer.full_name || '-'}</div>
          </div>
          <div className="user-info-item">
            <div className="label">💎 Подписка</div>
            <div className="value">
              {customer.subscription && customer.subscription !== 'none' 
                ? customer.subscription === 'plus' ? '⭐ Plus' : '👑 Premium'
                : 'Нет'}
            </div>
          </div>
        </div>

        {/* Ресторан */}
        <div className="user-detail-card">
          <h3 style={{marginBottom: '16px'}}>🏪 Ресторан</h3>
          <div className="user-info-item" style={{marginBottom: '8px'}}>
            <div className="label">🏪 Название</div>
            <div className="value">{restaurant.name || '-'}</div>
          </div>
          <div className="user-info-item" style={{marginBottom: '8px'}}>
            <div className="label">📱 Телефон</div>
            <div className="value">{restaurant.phone || '-'}</div>
          </div>
          <div className="user-info-item">
            <div className="label">📍 Адрес</div>
            <div className="value">{restaurant.address || '-'}</div>
          </div>
        </div>

        {/* Курьер */}
        <div className="user-detail-card">
          <h3 style={{marginBottom: '16px'}}>🚚 Курьер</h3>
          <div className="user-info-item" style={{marginBottom: '8px'}}>
            <div className="label">📱 Телефон</div>
            <div className="value">{courier.phone || 'Не назначен'}</div>
          </div>
          <div className="user-info-item" style={{marginBottom: '8px'}}>
            <div className="label">👤 Имя</div>
            <div className="value">{courier.full_name || '-'}</div>
          </div>
          <div className="user-info-item">
            <div className="label">✅ Верифицирован</div>
            <div className="value">{courier.is_verified ? '✅ Да' : '❌ Нет'}</div>
          </div>
        </div>
      </div>

      {/* Детали заказа */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px'}}>
        
        {/* Финансы */}
        <div className="user-detail-card">
          <h3 style={{marginBottom: '16px'}}>💰 Финансы</h3>
          <div className="user-info-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
            <div className="user-info-item">
              <div className="label">💵 Цена доставки</div>
              <div className="value">{order.delivery_price || 0} с</div>
            </div>
            <div className="user-info-item">
              <div className="label">🏢 RIZQ Fee</div>
              <div className="value" style={{color: '#059669'}}>{order.rizq_fee || 0} с</div>
            </div>
            <div className="user-info-item">
              <div className="label">🚚 Курьер получит</div>
              <div className="value" style={{color: '#2563eb'}}>{order.courier_earn || 0} с</div>
            </div>
            <div className="user-info-item">
              <div className="label">🛣️ Расстояние</div>
              <div className="value">{order.distance_km || 0} км</div>
            </div>
            <div className="user-info-item">
              <div className="label">🌙 Доплата время</div>
              <div className="value">{order.time_surcharge || 0} с</div>
            </div>
            <div className="user-info-item">
              <div className="label">🤫 Service Fee</div>
              <div className="value">{order.service_fee || 0} с</div>
            </div>
          </div>
        </div>

        {/* Коды и товары */}
        <div className="user-detail-card">
          <h3 style={{marginBottom: '16px'}}>🔐 Коды и товары</h3>
          <div className="user-info-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
            <div className="user-info-item">
              <div className="label">🏪 Pickup код</div>
              <div className="value" style={{fontSize: '24px', color: '#FF6B35'}}>{order.pickup_code || '-'}</div>
            </div>
            <div className="user-info-item">
              <div className="label">📦 Delivery код</div>
              <div className="value" style={{fontSize: '24px', color: '#3B82F6'}}>{order.delivery_code || '-'}</div>
            </div>
          </div>
          <div style={{marginTop: '16px'}}>
            <div className="label" style={{marginBottom: '8px'}}>📋 Товары:</div>
            {order.products && order.products.map((p, i) => (
              <div key={i} style={{
                padding: '8px 12px', background: '#f8f9fa', borderRadius: '8px',
                marginBottom: '4px', fontSize: '14px'
              }}>
                {typeof p === 'string' ? p : JSON.stringify(p)}
              </div>
            ))}
          </div>
          
          {/* Рейтинги */}
          {(order.product_rating || order.courier_rating) && (
            <div style={{marginTop: '16px'}}>
              <div className="label" style={{marginBottom: '8px'}}>⭐ Рейтинги:</div>
              <div style={{display: 'flex', gap: '16px'}}>
                {order.product_rating && (
                  <div>🍽️ Еда: {'⭐'.repeat(order.product_rating)}</div>
                )}
                {order.courier_rating && (
                  <div>🚚 Курьер: {'⭐'.repeat(order.courier_rating)}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Даты */}
      <div className="user-detail-card" style={{marginTop: '20px'}}>
        <h3 style={{marginBottom: '12px'}}>📅 Время</h3>
        <div style={{display: 'flex', gap: '24px'}}>
          <div>
            <span style={{color: '#6c757d', fontSize: '13px'}}>Создан: </span>
            <strong>{order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</strong>
          </div>
          <div>
            <span style={{color: '#6c757d', fontSize: '13px'}}>Обновлён: </span>
            <strong>{order.updated_at ? new Date(order.updated_at).toLocaleString() : '-'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;