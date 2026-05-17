import { useEffect, useState } from 'react';
import api from '../../api';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ';
}

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const meRes = await api.get('/accounts/me/');
        setUser(meRes.data);

        const customerId = meRes.data.customer_id;
        if (customerId) {
          const [profileRes, ordersRes] = await Promise.all([
            api.get(`/customers/${customerId}/profile/`),
            api.get(`/customers/${customerId}/orders/`),
          ]);
          setCustomer(profileRes.data);
          setOrders(ordersRes.data);
          setSelectedOrder(ordersRes.data[0] || null);
        }
      } catch (error) {
        setUser(null);
        setCustomer(null);
        setOrders([]);
        setSelectedOrder(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Purchase History</h2>
          <p>Lịch sử mua hàng đã đồng bộ từ backend theo tài khoản đang đăng nhập.</p>
        </div>
        <span className="pill">{customer?.full_name || user?.full_name || 'Guest'}</span>
      </div>

      <div className="grid grid-2">
        <div className="card section-card">
          <div className="table-lite">
            {loading && <div className="cart-row"><strong>Đang tải dữ liệu...</strong></div>}
            {!loading && orders.map((order) => (
              <button
                type="button"
                className="cart-row"
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                style={{ textAlign: 'left', width: '100%' }}
              >
                <div>
                  <strong>{order.order_code}</strong>
                  <p>{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                  <p>{order.items?.length || 0} sản phẩm</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{formatCurrency(order.total_amount)}</strong>
                  <p>{order.status}</p>
                </div>
              </button>
            ))}
            {!loading && !orders.length && <div className="cart-row"><strong>Chưa có dữ liệu lịch sử mua hàng</strong></div>}
          </div>
        </div>

        <div className="card section-card">
          <h3 className="section-title">Chi tiết hóa đơn</h3>
          {!selectedOrder ? (
            <div className="cart-row" style={{ marginTop: 14 }}>
              <strong>Chọn một hóa đơn để xem chi tiết</strong>
            </div>
          ) : (
            <div className="grid" style={{ marginTop: 14 }}>
              <div className="summary">
                <div><span>Mã hóa đơn</span><strong>{selectedOrder.order_code}</strong></div>
                <div><span>Ngày mua</span><strong>{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</strong></div>
                <div><span>Tạm tính</span><strong>{formatCurrency(selectedOrder.subtotal)}</strong></div>
                <div><span>Giảm giá</span><strong>{formatCurrency(selectedOrder.discount_amount)}</strong></div>
                <div><span>Thuế</span><strong>{formatCurrency(selectedOrder.tax_amount)}</strong></div>
                <div><span>Tổng thanh toán</span><strong>{formatCurrency(selectedOrder.total_amount)}</strong></div>
                <div><span>Phương thức</span><strong>{selectedOrder.payment_method}</strong></div>
                <div><span>Trạng thái</span><strong>{selectedOrder.status}</strong></div>
              </div>

              <div className="card section-card" style={{ marginTop: 0, background: '#f8fbff' }}>
                <h4 className="section-title">Items trong hóa đơn</h4>
                <div className="table-lite" style={{ marginTop: 12 }}>
                  {selectedOrder.items?.map((item) => (
                    <div className="cart-row" key={item.id}>
                      <div>
                        <strong>{item.product_name || `Product #${item.product}`}</strong>
                        <p>Số lượng: {item.quantity}</p>
                        <p>Đơn giá: {formatCurrency(item.unit_price)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>{formatCurrency(item.line_total)}</strong>
                        <p>Giảm: {formatCurrency(item.discount_amount)}</p>
                      </div>
                    </div>
                  ))}
                  {!selectedOrder.items?.length && <div className="cart-row"><strong>Không có item chi tiết</strong></div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
