import { useEffect, useState } from 'react';
import api from '../../api';

export default function ProductsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/catalog/products/').then((res) => setRows(res.data)).catch(() => setRows([]));
  }, []);

  return (
    <div>
      <div className="page-header"><h2>Products</h2><p>Danh sách sản phẩm đang bán.</p></div>
      <div className="table-lite">{rows.map((row) => <div className="cart-row" key={row.id}><strong>{row.name}</strong><span>{Number(row.sale_price).toLocaleString('vi-VN')} đ</span></div>)}</div>
    </div>
  );
}
