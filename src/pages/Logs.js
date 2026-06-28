import React, { useState, useEffect } from 'react';
import { getActivityLogs } from '../services/api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const res = await getActivityLogs(200);
      setLogs(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const csv = logs.map(l => 
      `${l.id},${l.user_phone || ''},${l.action},${l.details || ''},${l.device || ''},${l.ip_address || ''},${l.created_at || ''}`
    ).join('\n');
    const header = 'ID,Телефон,Действие,Детали,Устройство,IP,Дата\n';
    const blob = new Blob([header + csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rizq_logs.csv';
    a.click();
  };

  const getActionEmoji = (action) => {
    switch(action) {
      case 'register': return '🆕';
      case 'login': return '🔑';
      case 'order_created': return '🛒';
      case 'order_ready': return '✅';
      case 'order_accepted': return '🚚';
      case 'order_delivered': return '🎉';
      case 'product_added': return '📦';
      default: return '📋';
    }
  };

  return (
    <div>
      <h1 className="page-title">📋 Логи активности</h1>

      <div className="data-table">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>
            Последние действия ({logs.length}) 
            <span style={{fontSize: '13px', color: '#6c757d', marginLeft: '12px'}}>
              🔄 Обновляется каждые 10 сек
            </span>
          </h2>
          <button onClick={downloadCSV} className="btn btn-verify">📥 Скачать CSV</button>
        </div>
        
        {loading ? (
          <div className="loading">⏳ Загрузка...</div>
        ) : logs.length === 0 ? (
          <div className="loading">Нет логов</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Время</th>
                <th>Действие</th>
                <th>Пользователь</th>
                <th>Детали</th>
                <th>Устройство</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td style={{fontSize: '12px'}}>{log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</td>
                  <td>
                    <span className="badge badge-blue">
                      {getActionEmoji(log.action)} {log.action}
                    </span>
                  </td>
                  <td><strong>{log.user_phone || '-'}</strong></td>
                  <td style={{fontSize: '12px'}}>{log.details || '-'}</td>
                  <td style={{fontSize: '12px'}}>{log.device || '-'}</td>
                  <td style={{fontSize: '12px'}}>{log.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Logs;