import { useEffect, useState } from 'react';
import api from '../../api';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    api.get('/sales/orders/').then((res) => {
      setOrders(res.data);
      setSelectedOrder(res.data[0] || null);
    }).catch(() => {
      setOrders([]);
      setSelectedOrder(null);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p>Lịch sử hóa đơn</p>
        </div>
        <span className="pill">{orders.length} hóa đơn</span>
      </div>

      <div className="grid grid-2">
        <div className="card section-card">
          <div className="table-lite">
            {orders.map((order) => (
              <button key={order.id} type="button" className="cart-row" onClick={() => setSelectedOrder(order)} style={{ width: '100%', textAlign: 'left' }}>
                <div>
                  <strong>{order.order_code}</strong>
                  <p>{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                  <p>{order.customer_name || 'Khách lẻ'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{formatCurrency(order.total_amount)}</strong>
                  <p>{order.status}</p>
                </div>
              </button>
            ))}
            {!orders.length && <div className="cart-row"><strong>Chưa có hóa đơn</strong></div>}
          </div>
        </div>

        <div className="card section-card">
          <h3 className="section-title">Chi tiết hóa đơn</h3>
          {!selectedOrder ? (
            <div className="cart-row" style={{ marginTop: 14 }}><strong>Chọn một hóa đơn để xem chi tiết</strong></div>
          ) : (
            <div className="summary" style={{ marginTop: 14 }}>
              <div><span>Mã hóa đơn</span><strong>{selectedOrder.order_code}</strong></div>
              <div><span>Ngày tạo</span><strong>{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</strong></div>
              <div><span>Khách hàng</span><strong>{selectedOrder.customer_name || 'Khách lẻ'}</strong></div>
              <div><span>Tổng tiền</span><strong>{formatCurrency(selectedOrder.total_amount)}</strong></div>
              <div><span>Trạng thái</span><strong>{selectedOrder.status}</strong></div>
              <div><span>Item</span><strong>{selectedOrder.items?.length || 0}</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
