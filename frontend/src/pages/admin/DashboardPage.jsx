import api from '../../api';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ branches: 0, users: 0, products: 0, customers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [branchesRes, usersRes, productsRes, customersRes] = await Promise.all([
          api.get('/branches/'),
          api.get('/accounts/users/'),
          api.get('/catalog/products/'),
          api.get('/customers/'),
        ]);
        setStats({
          branches: branchesRes.data.length,
          users: usersRes.data.length,
          products: productsRes.data.length,
          customers: customersRes.data.length,
        });
      } catch (error) {
        setStats({ branches: 0, users: 0, products: 0, customers: 0 });
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Quản lý vận hành tổng thể của hệ thống POS siêu thị mini.</p>
        </div>
        <span className="pill">Realtime overview</span>
      </div>
      <div className="grid grid-4">
        <div className="card stat-card"><span>Chi nhánh</span><strong>{stats.branches}</strong><small>Stores active</small></div>
        <div className="card stat-card"><span>Người dùng</span><strong>{stats.users}</strong><small>Staff & admin</small></div>
        <div className="card stat-card"><span>Sản phẩm</span><strong>{stats.products}</strong><small>Catalog items</small></div>
        <div className="card stat-card"><span>Khách hàng</span><strong>{stats.customers}</strong><small>Loyalty members</small></div>
      </div>
      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card section-card">
          <h3 className="section-title">Tổng quan hệ thống</h3>
          <p>Giao diện sáng, trực quan, tối ưu cho quản trị nhanh trên desktop.</p>
          <div className="pill-row" style={{ marginTop: 14 }}>
            <span className="pill">Branches</span>
            <span className="pill">Products</span>
            <span className="pill">Customers</span>
            <span className="pill">Reports</span>
          </div>
        </div>
        <div className="card section-card">
          <h3 className="section-title">Cần làm tiếp</h3>
          <p>Biểu đồ doanh thu, top sản phẩm và cảnh báo tồn kho thấp.</p>
        </div>
      </div>
    </>
  );
}
