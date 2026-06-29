import React, { useState, useEffect } from 'react';
import { getAllProducts, updateProduct, deleteProduct as deleteProductApi } from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setEditData({
      name: product.name,
      price: product.price,
      category: product.category || 'main',
      description: product.description || '',
      is_available: product.is_available
    });
  };

  const saveEdit = async () => {
    try {
      const params = {};
      if (editData.name !== editProduct.name) params.name = editData.name;
      if (editData.price !== editProduct.price) params.price = editData.price;
      if (editData.is_available !== editProduct.is_available) params.is_available = editData.is_available;
      
      if (Object.keys(params).length > 0) {
        await updateProduct(editProduct.id, params);
      }
      setEditProduct(null);
      loadProducts();
    } catch (err) {
      alert('Ошибка сохранения');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Удалить товар навсегда?')) {
      try {
        await deleteProductApi(productId);
        loadProducts();
      } catch (err) {
        alert('Ошибка удаления');
      }
    }
  };

  const downloadCSV = () => {
    const csv = products.map(p => 
      `${p.id},${p.name},${p.price},${p.category || 'main'},${p.description || ''},${p.seller_phone},${p.is_available ? 'Available' : 'Hidden'},${p.created_at || ''}`
    ).join('\n');
    const header = 'ID,Название,Цена,Категория,Описание,Ресторан,Статус,Дата\n';
    const blob = new Blob([header + csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rizq_products.csv';
    a.click();
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>📦 Товары ({products.length})</h1>
        <button onClick={downloadCSV} className="btn btn-verify">📥 Скачать CSV</button>
      </div>

      {loading ? (
        <div className="loading">⏳ Загрузка...</div>
      ) : products.length === 0 ? (
        <div className="loading">Нет товаров</div>
      ) : (
        <div className="card-grid">
          {products.map(product => (
            <div key={product.id} className="item-card">
              <div className="item-card-header">
                <div className="item-card-icon" style={{background: '#FFF7ED'}}>
                  🍽️
                </div>
                <div className="item-card-info">
                  <h3>{product.name}</h3>
                  <p>{product.seller_phone}</p>
                </div>
                <span className={`badge ${product.is_available ? 'badge-green' : 'badge-red'}`}>
                  {product.is_available ? '✅' : '❌'}
                </span>
              </div>
              
              <div className="item-card-details">
                <div className="item-card-detail">
                  <div className="label">💰 Цена</div>
                  <div className="value" style={{color: '#FF6B35'}}>{product.price} с</div>
                </div>
                <div className="item-card-detail">
                  <div className="label">📂 Категория</div>
                  <div className="value">{product.category || 'main'}</div>
                </div>
                <div className="item-card-detail">
                  <div className="label">📝 Описание</div>
                  <div className="value" style={{fontSize: '12px'}}>{product.description || '-'}</div>
                </div>
                <div className="item-card-detail">
                  <div className="label">📅 Добавлен</div>
                  <div className="value" style={{fontSize: '12px'}}>{product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}</div>
                </div>
              </div>
              
              <div className="item-card-actions">
                <button style={{background: '#dbeafe', color: '#2563eb'}} onClick={() => openEdit(product)}>
                  ✏️ Редактировать
                </button>
                <button style={{background: '#fee2e2', color: '#dc2626'}} onClick={() => handleDelete(product.id)}>
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно редактирования */}
      {editProduct && (
        <div className="modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Редактировать товар</h2>
              <button className="modal-close" onClick={() => setEditProduct(null)}>✕</button>
            </div>
            
            <div className="modal-field">
              <label>📝 Название</label>
              <input 
                type="text" 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})}
              />
            </div>
            
            <div className="modal-field">
              <label>💰 Цена (сомони)</label>
              <input 
                type="number" 
                value={editData.price} 
                onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
              />
            </div>

            <div className="modal-field">
              <label>📂 Категория</label>
              <select 
                value={editData.category}
                onChange={(e) => setEditData({...editData, category: e.target.value})}
              >
                <option value="main">🍔 Основное</option>
                <option value="snacks">🍟 Закуски</option>
                <option value="drinks">🥤 Напитки</option>
                <option value="desserts">🍰 Десерты</option>
                <option value="salads">🥗 Салаты</option>
              </select>
            </div>

            <div className="modal-field">
              <label>📋 Описание</label>
              <textarea 
                rows="3"
                value={editData.description} 
                onChange={(e) => setEditData({...editData, description: e.target.value})}
              />
            </div>

            <div className="modal-field">
              <label>✅ Статус</label>
              <select 
                value={editData.is_available ? 'true' : 'false'}
                onChange={(e) => setEditData({...editData, is_available: e.target.value === 'true'})}
              >
                <option value="true">✅ Доступен</option>
                <option value="false">❌ Скрыт</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setEditProduct(null)}>Отмена</button>
              <button className="modal-btn modal-btn-primary" onClick={saveEdit}>💾 Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;