import { useEffect, useState } from 'react';
import api from '../../api';

export default function CustomersPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/customers/').then((res) => setRows(res.data)).catch(() => setRows([]));
  }, []);

  return (
    <div>
      <div className="page-header"><h2>Customers</h2><p>Khách hàng và điểm tích lũy.</p></div>
      <div className="table-lite">{rows.map((row) => <div className="cart-row" key={row.id}><strong>{row.full_name}</strong><span>{row.loyalty_points} points</span></div>)}</div>
    </div>
  );
}
