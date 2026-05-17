import { useEffect, useState } from 'react';
import api from '../../api';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loyalty, setLoyalty] = useState([]);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await api.get('/accounts/me/');
        setUser(meRes.data);

        const customerId = meRes.data.customer_id;
        if (!customerId) return;

        const [profileRes, ordersRes, loyaltyRes, promotionsRes] = await Promise.allSettled([
          api.get(`/customers/${customerId}/profile/`),
          api.get(`/customers/${customerId}/orders/`),
          api.get(`/customers/${customerId}/loyalty/`),
          api.get('/sales/promotions/'),
        ]);

        setCustomer(profileRes.status === 'fulfilled' ? profileRes.value.data : null);
        setOrders(ordersRes.status === 'fulfilled' ? ordersRes.value.data.slice(0, 3) : []);
        setLoyalty(loyaltyRes.status === 'fulfilled' ? loyaltyRes.value.data.slice(0, 3) : []);
        setPromotions(promotionsRes.status === 'fulfilled' ? promotionsRes.value.data.filter((item) => item.is_active).slice(0, 3) : []);
      } catch (error) {
        setUser(null);
        setCustomer(null);
      }
    };

    load();
  }, []);

  const summaryCards = [
    { label: 'Điểm hiện tại', value: customer?.loyalty_points ?? 0 },
    { label: 'Tổng đơn hàng', value: orders.length },
    { label: 'Đơn gần nhất', value: orders[0]?.order_code || 'N/A' },
    { label: 'Trạng thái', value: user?.is_active ? 'Active' : 'Inactive' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Customer Home</h2>
          <p>Trang tổng quan cá nhân của khách hàng đang đăng nhập.</p>
        </div>
        <span className="pill">{customer?.full_name || user?.full_name || 'Customer'}</span>
      </div>

      <div className="grid grid-4">
        {summaryCards.map((card) => (
          <div className="card stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="card section-card" style={{ marginTop: 18 }}>
        <h3 className="section-title">Thông tin cá nhân</h3>
        <div className="summary" style={{ marginTop: 14 }}>
          <div><span>Họ tên</span><strong>{customer?.full_name || user?.full_name || 'N/A'}</strong></div>
          <div><span>Username</span><strong>{user?.username || 'N/A'}</strong></div>
          <div><span>Số điện thoại</span><strong>{customer?.phone || user?.phone || 'N/A'}</strong></div>
          <div><span>Email</span><strong>{customer?.email || user?.email_address || 'N/A'}</strong></div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card section-card">
          <h3 className="section-title">Khuyến mãi đang có</h3>
          <div className="table-lite" style={{ marginTop: 14 }}>
            {promotions.map((promotion) => (
              <div className="cart-row" key={promotion.id}>
                <div>
                  <strong>{promotion.name}</strong>
                  <p>{promotion.type === 'percent' ? `${promotion.value}%` : `${Number(promotion.value).toLocaleString('vi-VN')} đ`}</p>
                </div>
                <span className="pill muted">Active</span>
              </div>
            ))}
            {!promotions.length && <div className="cart-row"><strong>Chưa có khuyến mãi</strong></div>}
          </div>
        </div>

        <div className="card section-card">
          <h3 className="section-title">Lịch sử điểm gần đây</h3>
          <div className="table-lite" style={{ marginTop: 14 }}>
            {loyalty.map((item) => (
              <div className="cart-row" key={item.id}>
                <div>
                  <strong>{item.transaction_type}</strong>
                  <p>{new Date(item.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{item.balance_after} pts</strong>
                  <p>+{item.points_earned} / -{item.points_used}</p>
                </div>
              </div>
            ))}
            {!loyalty.length && <div className="cart-row"><strong>Chưa có lịch sử điểm</strong></div>}
          </div>
        </div>
      </div>

      <div className="card section-card" style={{ marginTop: 18 }}>
        <h3 className="section-title">Lịch sử mua hàng gần đây</h3>
        <div className="table-lite" style={{ marginTop: 14 }}>
          {orders.map((order) => (
            <div className="cart-row" key={order.id}>
              <div>
                <strong>{order.order_code}</strong>
                <p>{new Date(order.created_at).toLocaleString('vi-VN')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{Number(order.total_amount).toLocaleString('vi-VN')} đ</strong>
                <p>{order.status}</p>
              </div>
            </div>
          ))}
          {!orders.length && <div className="cart-row"><strong>Chưa có dữ liệu hóa đơn</strong></div>}
        </div>
      </div>
    </div>
  );
}
