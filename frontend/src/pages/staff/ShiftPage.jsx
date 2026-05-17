import { useEffect, useState } from 'react';
import api from '../../api';

export default function ShiftPage() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    api.get('/accounts/me/').then((res) => setCurrentUser(res.data)).catch(() => setCurrentUser(null));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Shifts</h2>
          <p>Thông tin ca làm việc và người dùng đang đăng nhập.</p>
        </div>
        <span className="pill">{currentUser?.full_name || 'Unknown'}</span>
      </div>
      <div className="grid grid-2">
        <div className="card section-card">
          <h3 className="section-title">Thông tin nhân viên</h3>
          <div className="summary" style={{ marginTop: 14 }}>
            <div><span>Username</span><strong>{currentUser?.username || 'N/A'}</strong></div>
            <div><span>Vai trò</span><strong>{currentUser?.role || 'N/A'}</strong></div>
            <div><span>Chi nhánh</span><strong>{currentUser?.branch || 'N/A'}</strong></div>
          </div>
        </div>
        <div className="card section-card">
          <h3 className="section-title">Ca hiện tại</h3>
          <div className="cart-row" style={{ marginTop: 14 }}>
            <strong>Chưa triển khai quản lý ca chi tiết</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
