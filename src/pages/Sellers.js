import React, { useState, useEffect } from 'react';
import { getAllSellers } from '../services/api';

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const res = await getAllSellers();
      setSellers(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const csv = sellers.map(s => 
      `${s.id},${s.name},${s.seller_type},${s.phone},${s.address || ''},${s.products_count || 0},${s.orders_count || 0},${s.is_active ? 'Active' : 'Closed'},${s.created_at || ''}`
    ).join('\n');
    const header = 'ID,Название,Тип,Телефон,Адрес,Товаров,Заказов,Статус,Дата\n';
    const blob = new Blob([header + csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rizq_sellers.csv';
    a.click();
  };

  return (
    <div>
      <h1 className="page-title">🏪 Рестораны</h1>

      <div className="data-table">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Список ресторанов ({sellers.length})</h2>
          <button onClick={downloadCSV} className="btn btn-verify">
            📥 Скачать CSV
          </button>
        </div>
        
        {loading ? (
          <div className="loading">⏳ Загрузка...</div>
        ) : sellers.length === 0 ? (
          <div className="loading">Нет ресторанов</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Тип</th>
                <th>Телефон</th>
                <th>Адрес</th>
                <th>Товаров</th>
                <th>Заказов</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map(seller => (
                <tr key={seller.id}>
                  <td>{seller.id}</td>
                  <td><strong>{seller.name}</strong></td>
                  <td>
                    <span className="badge badge-purple">
                      {seller.seller_type === 'restaurant' ? '🍽️ Ресторан' : 
                       seller.seller_type === 'cafe' ? '☕ Кафе' : '🍔 Fast Food'}
                    </span>
                  </td>
                  <td>{seller.phone}</td>
                  <td>{seller.address || '-'}</td>
                  <td>{seller.products_count || 0}</td>
                  <td>{seller.orders_count || 0}</td>
                  <td>
                    <span className={`badge ${seller.is_active ? 'badge-green' : 'badge-red'}`}>
                      {seller.is_active ? '✅ Активен' : '❌ Закрыт'}
                    </span>
                  </td>
                  <td>{seller.created_at ? new Date(seller.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Sellers;