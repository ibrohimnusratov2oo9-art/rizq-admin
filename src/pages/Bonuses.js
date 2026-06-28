import React, { useState, useEffect } from 'react';
import { getAllBonuses } from '../services/api';

function Bonuses() {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBonuses();
  }, []);

  const loadBonuses = async () => {
    try {
      const res = await getAllBonuses();
      setBonuses(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const csv = bonuses.map(b => 
      `${b.id},${b.courier_phone},${b.amount},${b.reason},${b.deliveries_count},${b.created_at || ''}`
    ).join('\n');
    const header = 'ID,Курьер,Сумма,Причина,Доставок,Дата\n';
    const blob = new Blob([header + csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rizq_bonuses.csv';
    a.click();
  };

  const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div>
      <h1 className="page-title">🎁 Бонусы курьеров</h1>

      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px'}}>
        <div className="stat-card">
          <div className="icon" style={{background: '#fef3c7'}}>🎁</div>
          <div className="label">Всего бонусов выдано</div>
          <div className="value">{bonuses.length}</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#d1fae5'}}>💰</div>
          <div className="label">Общая сумма</div>
          <div className="value" style={{color: '#059669'}}>{totalBonuses} с</div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: '#dbeafe'}}>🏆</div>
          <div className="label">Типы бонусов</div>
          <div className="value">100 / 500</div>
        </div>
      </div>

      <div className="data-table">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Список бонусов ({bonuses.length})</h2>
          <button onClick={downloadCSV} className="btn btn-verify">📥 Скачать CSV</button>
        </div>
        
        {loading ? (
          <div className="loading">⏳ Загрузка...</div>
        ) : bonuses.length === 0 ? (
          <div className="loading">Нет бонусов</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Курьер</th>
                <th>Сумма</th>
                <th>Причина</th>
                <th>Доставок</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {bonuses.map(bonus => (
                <tr key={bonus.id}>
                  <td>{bonus.id}</td>
                  <td><strong>{bonus.courier_phone}</strong></td>
                  <td style={{color: '#059669', fontWeight: '600'}}>{bonus.amount} с</td>
                  <td>
                    <span className={`badge ${bonus.reason === '100_deliveries' ? 'badge-blue' : 'badge-purple'}`}>
                      {bonus.reason === '100_deliveries' ? '🎯 100 доставок' : '🏆 500 доставок'}
                    </span>
                  </td>
                  <td>{bonus.deliveries_count}</td>
                  <td>{bonus.created_at ? new Date(bonus.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Bonuses;