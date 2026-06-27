import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../services/api';

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

  return (
    <div>
      <h1 className="page-title">📦 Товары</h1>

      <div className="data-table">
        <h2>Список товаров ({products.length})</h2>
        
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
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td><strong>{product.name}</strong></td>
                  <td style={{color: '#FF6B35', fontWeight: '600'}}>{product.price} с</td>
                  <td>
                    <span className="badge badge-blue">{product.category || 'main'}</span>
                  </td>
                  <td>{product.seller_phone}</td>
                  <td>
                    <span className={`badge ${product.is_available ? 'badge-green' : 'badge-red'}`}>
                      {product.is_available ? '✅ Доступен' : '❌ Скрыт'}
                    </span>
                  </td>
                  <td>{product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}</td>
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