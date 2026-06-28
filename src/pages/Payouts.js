import React, { useState, useEffect } from 'react';
import { getAllPayouts } from '../services/api';

function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const res = await getAllPayouts();
      setPayouts(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const csv = payouts.map(p => 
      `${p.id},${p.courier_phone},${p.amount},${p.status},${p.note || ''},${p.created_at || ''}`
    ).join('\n');
    const header = 'ID,Курьер,Сумма,Статус,Заметка,Дата\n';
    const blob = new Blob([header + csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rizq_payouts.csv';
    a.click();
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return 'badge-yellow';
      case 'paid': return 'badge-green';
      case 'rejected': return 'badge-red';
      default: return 'badge-yellow';
    }
  };

  return (
    <div>
      <h1 className="page-title">💰 Выплаты курьерам</h1>

      <div className="data-table">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Запросы на выплату ({payouts.length})</h2>
          <button onClick={downloadCSV} className="btn btn-verify">📥 Скачать CSV</button>
        </div>
        
        {loading ? (
          <div className="loading">⏳ Загрузка...</div>
        ) : payouts.length === 0 ? (
          <div className="loading">Нет запросов на выплату</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Курьер</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Заметка</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(payout => (
                <tr key={payout.id}>
                  <td>{payout.id}</td>
                  <td><strong>{payout.courier_phone}</strong></td>
                  <td style={{color: '#2563eb', fontWeight: '600'}}>{payout.amount} с</td>
                  <td>
                    <span className={`badge ${getStatusBadge(payout.status)}`}>
                      {payout.status === 'pending' ? '⏳ Ожидает' : payout.status === 'paid' ? '✅ Оплачено' : '❌ Отклонено'}
                    </span>
                  </td>
                  <td>{payout.note || '-'}</td>
                  <td>{payout.created_at ? new Date(payout.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Payouts;