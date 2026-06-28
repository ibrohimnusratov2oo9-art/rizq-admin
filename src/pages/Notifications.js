import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, getAllOrders, getAllUsers } from '../services/api';

function Notifications() {
  const [allNotifs, setAllNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const audioRef = useRef(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(checkNewNotifications, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  const loadAllData = async () => {
    try {
      const [ordersRes, usersRes] = await Promise.all([
        getAllOrders(),
        getAllUsers()
      ]);

      const notifications = [];

      // Все пользователи как уведомления
      usersRes.data.forEach(user => {
        notifications.push({
          id: `user_${user.id}`,
          type: 'new_user',
          sound: true,
          icon: user.role === 'customer' ? '🛒' : user.role === 'seller' ? '🏪' : '🚚',
          title: '🆕 Новый пользователь',
          message: `${user.phone} (${user.role === 'customer' ? 'Клиент' : user.role === 'seller' ? 'Продавец' : 'Курьер'})${user.full_name ? ' - ' + user.full_name : ''}`,
          time: user.created_at,
          badge: 'badge-green'
        });
      });

      // Все заказы как уведомления
      ordersRes.data.forEach(order => {
        let icon, title, badge;
        
        switch(order.status) {
          case 'создан':
          case 'готов':
            icon = '🛒';
            title = '🆕 Новый заказ';
            badge = 'badge-yellow';
            break;
          case 'принят':
            icon = '🚚';
            title = '🚚 Заказ принят курьером';
            badge = 'badge-blue';
            break;
          case 'забран':
            icon = '📦';
            title = '📦 Заказ забран';
            badge = 'badge-purple';
            break;
          case 'доставлен':
            icon = '✅';
            title = '✅ Заказ доставлен';
            badge = 'badge-green';
            break;
          default:
            icon = '📋';
            title = '📋 Заказ';
            badge = 'badge-yellow';
        }

        notifications.push({
          id: `order_${order.id}`,
          type: 'order',
          sound: order.status === 'создан' || order.status === 'готов',
          icon: icon,
          title: title,
          message: `Заказ #${order.code} | ${order.customer_phone} | ${order.delivery_price || 0} с | ${order.status}`,
          time: order.created_at,
          badge: badge,
          status: order.status
        });
      });

      // Сортируем по времени
      notifications.sort((a, b) => {
        const dateA = a.time ? new Date(a.time) : new Date(0);
        const dateB = b.time ? new Date(b.time) : new Date(0);
        return dateB - dateA;
      });

      setAllNotifs(notifications);
      setLoading(false);

    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const checkNewNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.data.count > 0 && res.data.count !== lastCountRef.current) {
        lastCountRef.current = res.data.count;
        
        // Звук для новых
        const hasSound = res.data.notifications.some(n => n.sound);
        if (hasSound && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
        
        // Перезагружаем все данные
        loadAllData();
      }
    } catch (err) {
      // ignore
    }
  };

  const downloadCSV = () => {
    const csv = filteredNotifs.map(n => 
      `${n.type},${n.title},${n.message},${n.time || ''}`
    ).join('\n');
    const header = 'Тип,Заголовок,Сообщение,Время\n';
    const blob = new Blob([header + csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rizq_notifications.csv';
    a.click();
  };

  const filteredNotifs = filter === 'all' 
    ? allNotifs 
    : filter === 'users' 
      ? allNotifs.filter(n => n.type === 'new_user')
      : filter === 'orders'
        ? allNotifs.filter(n => n.type === 'order')
        : filter === 'delivered'
          ? allNotifs.filter(n => n.status === 'доставлен')
          : allNotifs;

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>🔔 Уведомления</h1>
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
            Обновляется каждые 10 сек
          </span>
        </div>
      </div>

      <div className="filter-bar">
        {[
          {id: 'all', label: '📋 Все'},
          {id: 'users', label: '👥 Пользователи'},
          {id: 'orders', label: '🛒 Заказы'},
          {id: 'delivered', label: '✅ Доставлено'},
        ].map(f => (
          <button
            key={f.id}
            className={`filter-btn ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="data-table">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Все события ({filteredNotifs.length})</h2>
          <button onClick={downloadCSV} className="btn btn-verify">📥 Скачать CSV</button>
        </div>

        {loading ? (
          <div className="loading">⏳ Загрузка...</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="loading">Нет уведомлений</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Время</th>
                <th>Тип</th>
                <th>Событие</th>
                <th>Детали</th>
                <th>Звук</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifs.map(notif => (
                <tr key={notif.id}>
                  <td style={{fontSize: '12px', whiteSpace: 'nowrap'}}>
                    {notif.time ? new Date(notif.time).toLocaleString() : '-'}
                  </td>
                  <td>
                    <span className={`badge ${notif.badge}`}>
                      {notif.icon} {notif.type === 'new_user' ? 'Пользователь' : 'Заказ'}
                    </span>
                  </td>
                  <td><strong>{notif.title}</strong></td>
                  <td style={{fontSize: '13px'}}>{notif.message}</td>
                  <td>{notif.sound ? '🔊' : '🔇'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
    </div>
  );
}

export default Notifications;
