export default function StaffProfileModal({ open, user, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h3>Thông tin nhân viên</h3>
            <p>Chi tiết tài khoản đang đăng nhập</p>
          </div>
          <button className="button ghost" onClick={onClose}>Đóng</button>
        </div>

        <div className="summary" style={{ marginTop: 14 }}>
          <div><span>Họ tên</span><strong>{user?.full_name || 'N/A'}</strong></div>
          <div><span>Username</span><strong>{user?.username || 'N/A'}</strong></div>
          <div><span>Vai trò</span><strong>{user?.role || 'N/A'}</strong></div>
          <div><span>Chi nhánh</span><strong>{user?.branch || 'N/A'}</strong></div>
          <div><span>Trạng thái</span><strong>{user?.is_active ? 'Active' : 'Inactive'}</strong></div>
        </div>
      </div>
    </div>
  );
}
