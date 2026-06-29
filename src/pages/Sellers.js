import React, { useState, useEffect } from 'react';
import { getAllSellers, updateSeller } from '../services/api';

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSeller, setEditSeller] = useState(null);
  const [editData, setEditData] = useState({});

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

  const openEdit = (seller) => {
    setEditSeller(seller);
    setEditData({
      name: seller.name,
      address: seller.address || '',
      is_active: seller.is_active
    });
  };

  const saveEdit = async () => {
    try {
      const params = {};
      if (editData.name !== editSeller.name) params.name = editData.name;
      if (editData.address !== (editSeller.address || '')) params.address = editData.address;
      if (editData.is_active !== editSeller.is_active) params.is_active = editData.is_active;
      
      if (Object.keys(params).length > 0) {
        await updateSeller(editSeller.id, params);
      }
      setEditSeller(null);
      loadSellers();
    } catch (err) {
      alert('Ошибка сохранения');
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

  const getTypeInfo = (type) => {
    switch(type) {
      case 'restaurant': return {icon: '🍽️', name: 'Ресторан', color: '#ede9fe'};
      case 'cafe': return {icon: '☕', name: 'Кафе', color: '#fef3c7'};
      case 'fastfood': return {icon: '🍔', name: 'Fast Food', color: '#fee2e2'};
      default: return {icon: '🏪', name: type, color: '#dbeafe'};
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>🏪 Рестораны ({sellers.length})</h1>
        <button onClick={downloadCSV} className="btn btn-verify">📥 Скачать CSV</button>
      </div>

      {loading ? (
        <div className="loading">⏳ Загрузка...</div>
      ) : sellers.length === 0 ? (
        <div className="loading">Нет ресторанов</div>
      ) : (
        <div className="card-grid">
          {sellers.map(seller => {
            const typeInfo = getTypeInfo(seller.seller_type);
            return (
              <div key={seller.id} className="item-card">
                <div className="item-card-header">
                  <div className="item-card-icon" style={{background: typeInfo.color}}>
                    {typeInfo.icon}
                  </div>
                  <div className="item-card-info">
                    <h3>{seller.name}</h3>
                    <p>{typeInfo.name} • {seller.phone}</p>
                  </div>
                  <span className={`badge ${seller.is_active ? 'badge-green' : 'badge-red'}`}>
                    {seller.is_active ? '✅' : '❌'}
                  </span>
                </div>
                
                <div className="item-card-details">
                  <div className="item-card-detail">
                    <div className="label">📍 Адрес</div>
                    <div className="value" style={{fontSize: '12px'}}>{seller.address || 'Не указан'}</div>
                  </div>
                  <div className="item-card-detail">
                    <div className="label">📦 Товаров</div>
                    <div className="value">{seller.products_count || 0}</div>
                  </div>
                  <div className="item-card-detail">
                    <div className="label">📋 Заказов</div>
                    <div className="value">{seller.orders_count || 0}</div>
                  </div>
                  <div className="item-card-detail">
                    <div className="label">📅 Добавлен</div>
                    <div className="value" style={{fontSize: '12px'}}>{seller.created_at ? new Date(seller.created_at).toLocaleDateString() : '-'}</div>
                  </div>
                </div>
                
                <div className="item-card-actions">
                  <button style={{background: '#dbeafe', color: '#2563eb'}} onClick={() => openEdit(seller)}>
                    ✏️ Редактировать
                  </button>
                  <button style={{
                    background: seller.is_active ? '#fee2e2' : '#d1fae5',
                    color: seller.is_active ? '#dc2626' : '#059669'
                  }} onClick={async () => {
                    await updateSeller(seller.id, {is_active: !seller.is_active});
                    loadSellers();
                  }}>
                    {seller.is_active ? '❌ Закрыть' : '✅ Открыть'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно */}
      {editSeller && (
        <div className="modal-overlay" onClick={() => setEditSeller(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Редактировать ресторан</h2>
              <button className="modal-close" onClick={() => setEditSeller(null)}>✕</button>
            </div>
            
            <div className="modal-field">
              <label>🏪 Название</label>
              <input 
                type="text" 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})}
              />
            </div>
            
            <div className="modal-field">
              <label>📍 Адрес</label>
              <input 
                type="text" 
                value={editData.address} 
                onChange={(e) => setEditData({...editData, address: e.target.value})}
              />
            </div>

            <div className="modal-field">
              <label>✅ Статус</label>
              <select 
                value={editData.is_active ? 'true' : 'false'}
                onChange={(e) => setEditData({...editData, is_active: e.target.value === 'true'})}
              >
                <option value="true">✅ Активен</option>
                <option value="false">❌ Закрыт</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setEditSeller(null)}>Отмена</button>
              <button className="modal-btn modal-btn-primary" onClick={saveEdit}>💾 Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sellers;