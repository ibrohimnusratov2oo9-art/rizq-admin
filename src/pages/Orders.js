import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders(filter);
      setOrders(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'создан': return 'badge-yellow';
      case 'готов': return 'badge-blue';
      case 'принят': return 'badge-purple';
      case 'забран': return 'badge-blue';
      case 'доставлен': return 'badge-green';
      default: return 'badge-yellow';
    }
  };

  const downloadCSV = () => {
    const csv = orders.map(o => 
      `${o.code},${o.customer_phone},${o.seller_phone || ''},${o.courier || ''},${o.status},${o.distance_km || 0},${o.delivery_price || 0},${o.rizq_fee || 0},${o.courier_earn || 0},${o.created_at || ''}`
    ).join('\n');
    const header = 'Код,Клиент,Ресторан,Курьер,Статус,Расстояние,Цена,RIZQ Fee,Курьер$,Дата\n';
    const blob = new Blob([header + csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rizq_orders.csv';
    a.click();
  };

  return (
    <div>
      <h1 className="page-title">📦 Заказы</h1>

      <div className="filter-bar">
        {[null, 'создан', 'готов', 'принят', 'забран', 'доставлен'].map(f => (
          <button
            key={f || 'all'}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === null ? '📋 Все' : 
             f === 'создан' ? '🆕 Создан' :
             f === 'готов' ? '✅ Готов' :
             f === 'принят' ? '🚚 Принят' :
             f === 'забран' ? '📦 Забран' : '🎉 Доставлен'}
          </button>
        ))}
      </div>

      <div className="data-table">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Список заказов ({orders.length})</h2>
          <button onClick={downloadCSV} className="btn btn-verify">
            📥 Скачать CSV
          </button>
        </div>
        
        {loading ? (
          <div className="loading">⏳ Загрузка...</div>
        ) : orders.length === 0 ? (
          <div className="loading">Нет заказов</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Клиент</th>
                <th>Ресторан</th>
                <th>Курьер</th>
                <th>Статус</th>
                <th>Расстояние</th>
                <th>Цена</th>
                <th>RIZQ Fee</th>
                <th>Курьер $</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)} style={{cursor: 'pointer'}}>
                  <td><strong>#{order.code}</strong></td>
                  <td>{order.customer_phone}</td>
                  <td>{order.seller_phone || '-'}</td>
                  <td>{order.courier || '-'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.distance_km || 0} км</td>
                  <td>{order.delivery_price || 0} с</td>
                  <td style={{color: '#059669', fontWeight: '600'}}>{order.rizq_fee || 0} с</td>
                  <td style={{color: '#2563eb', fontWeight: '600'}}>{order.courier_earn || 0} с</td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Orders;