import React, { useState, useEffect } from 'react';
import { getAllProducts, updateProduct, deleteProduct as deleteProductApi } from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleEditPrice = async (e, productId, currentPrice) => {
    e.stopPropagation();
    const newPrice = prompt('Новая цена:', currentPrice);
    if (newPrice !== null && !isNaN(newPrice)) {
      try {
        await updateProduct(productId, {price: parseFloat(newPrice)});
        loadProducts();
      } catch (err) {
        alert('Ошибка');
      }
    }
  };

  const handleEditName = async (e, productId, currentName) => {
    e.stopPropagation();
    const newName = prompt('Новое название:', currentName);
    if (newName !== null) {
      try {
        await updateProduct(productId, {name: newName});
        loadProducts();
      } catch (err) {
        alert('Ошибка');
      }
    }
  };

  const handleToggle = async (e, productId, currentStatus) => {
    e.stopPropagation();
    try {
      await updateProduct(productId, {is_available: !currentStatus});
      loadProducts();
    } catch (err) {
      alert('Ошибка');
    }
  };

  const handleDelete = async (e, productId) => {
    e.stopPropagation();
    if (window.confirm('Удалить товар?')) {
      try {
        await deleteProductApi(productId);
        loadProducts();
      } catch (err) {
        alert('Ошибка');
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
      <h1 className="page-title">📦 Товары</h1>

      <div className="data-table">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Список товаров ({products.length})</h2>
          <button onClick={downloadCSV} className="btn btn-verify">📥 Скачать CSV</button>
        </div>
        
        {loading ? (
          <div className="loading">⏳ Загрузка...</div>
        ) : products.length === 0 ? (
          <div className="loading">Нет товаров</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Категория</th>
                <th>Ресторан</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td><strong>{product.name}</strong></td>
                  <td style={{color: '#FF6B35', fontWeight: '600'}}>{product.price} с</td>
                  <td><span className="badge badge-blue">{product.category || 'main'}</span></td>
                  <td>{product.seller_phone}</td>
                  <td>
                    <span className={`badge ${product.is_available ? 'badge-green' : 'badge-red'}`}>
                      {product.is_available ? '✅ Доступен' : '❌ Скрыт'}
                    </span>
                  </td>
                  <td>{product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <button className="btn" style={{background: '#dbeafe', color: '#2563eb'}} onClick={(e) => handleEditName(e, product.id, product.name)}>✏️ Имя</button>
                    <button className="btn" style={{background: '#fef3c7', color: '#d97706'}} onClick={(e) => handleEditPrice(e, product.id, product.price)}>💰 Цена</button>
                    <button className="btn" style={{background: product.is_available ? '#fee2e2' : '#d1fae5', color: product.is_available ? '#dc2626' : '#059669'}} onClick={(e) => handleToggle(e, product.id, product.is_available)}>
                      {product.is_available ? '🔇 Скрыть' : '✅ Показать'}
                    </button>
                    <button className="btn btn-block" onClick={(e) => handleDelete(e, product.id)}>🗑️</button>
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

export default Products;