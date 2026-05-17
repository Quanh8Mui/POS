import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import ConfirmModal from '../../components/ConfirmModal';

const emptyStaff = {
  username: '',
  full_name: '',
  role: 'cashier',
  branch: '',
  is_active: true,
};

function roleLabel(role) {
  if (role === 'admin') return 'Admin';
  if (role === 'cashier') return 'Cashier';
  if (role === 'customer') return 'Customer';
  return role || 'N/A';
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyStaff);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const defaultPassword = '12345678';

  const load = async () => {
    try {
      const [staffRes, branchRes] = await Promise.all([api.get('/accounts/users/'), api.get('/branches/')]);
      setStaff(staffRes.data);
      setBranches(branchRes.data);
    } catch (error) {
      setStaff([]);
      setBranches([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter((item) => {
      const isStaffRole = item.role === 'cashier';
      const matchSearch = `${item.username} ${item.full_name} ${item.role}`.toLowerCase().includes(q);
      return isStaffRole && matchSearch;
    });
  }, [staff, search]);

  const resetForm = () => {
    setForm(emptyStaff);
    setEditingId(null);
    setMessage('');
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      username: item.username || '',
      full_name: item.full_name || '',
      role: item.role || 'cashier',
      branch: item.branch || '',
      is_active: item.is_active,
    });
  };

  const saveStaff = async () => {
    if (!form.username || !form.full_name) {
      setMessage('Vui lòng nhập username và họ tên.');
      return;
    }

    setMessage('Đang lưu...');
    try {
      const payload = {
        username: form.username,
        full_name: form.full_name,
        role: form.role,
        branch: form.branch ? Number(form.branch) : null,
        is_active: form.is_active,
      };

      if (editingId) {
        await api.patch(`/accounts/users/${editingId}/`, payload);
        setMessage('Cập nhật nhân viên thành công');
      } else {
        await api.post('/accounts/users/', { ...payload, password: defaultPassword });
        setMessage(`Đã tạo nhân viên và cấp mật khẩu mặc định: ${defaultPassword}`);
      }

      resetForm();
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Lưu thất bại');
    }
  };

  const deleteStaff = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/accounts/users/${deleteTarget.id}/`);
      setDeleteTarget(null);
      setMessage('Đã xóa nhân viên');
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Xóa thất bại');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Staff Management</h2>
          <p>Quản lý nhân viên</p>
        </div>
        <span className="pill">{filtered.length} nhân viên</span>
      </div>

      <div className="grid grid-2">
        <div className="card section-card">
          <h3 className="section-title">Bộ lọc</h3>
          <input className="input" style={{ marginTop: 14 }} placeholder="Tìm theo username, họ tên, vai trò" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="summary" style={{ marginTop: 16 }}>
            <div><span>Tổng user</span><strong>{staff.length}</strong></div>
            <div><span>Đang hiển thị</span><strong>{filtered.length}</strong></div>
          </div>
        </div>

        <div className="card section-card">
          <div className="pos-bottom-header">
            <div>
              <h3 className="section-title">{editingId ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h3>
              <p>Mật khẩu mặc định khi tạo mới: <strong>{defaultPassword}</strong></p>
            </div>
            {editingId && <span className="pill muted">Editing #{editingId}</span>}
          </div>
          <div className="grid" style={{ marginTop: 14 }}>
            <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm((cur) => ({ ...cur, username: e.target.value }))} />
            <input className="input" placeholder="Họ tên" value={form.full_name} onChange={(e) => setForm((cur) => ({ ...cur, full_name: e.target.value }))} />
            <select className="input" value={form.role} onChange={(e) => setForm((cur) => ({ ...cur, role: e.target.value }))}>
              <option value="cashier">Cashier</option>
            </select>
            <select className="input" value={form.branch} onChange={(e) => setForm((cur) => ({ ...cur, branch: e.target.value }))}>
              <option value="">Chọn chi nhánh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            <label className="pill-row" style={{ alignItems: 'center' }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((cur) => ({ ...cur, is_active: e.target.checked }))} />
              <span>Hoạt động</span>
            </label>
            <div className="pill-row">
              <button type="button" className="button primary" onClick={saveStaff}>{editingId ? 'Cập nhật' : 'Tạo nhân viên'}</button>
              <button type="button" className="button ghost" onClick={resetForm}>Làm mới</button>
            </div>
          </div>
          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      </div>

      <div className="card section-card" style={{ marginTop: 18 }}>
        <div className="pos-bottom-header">
          <div>
            <h3 className="section-title">Danh sách nhân viên</h3>
            <p>Admin có thể xem, sửa hoặc xóa từng nhân viên.</p>
          </div>
        </div>

        <div className="table-lite">
          {filtered.map((item) => (
            <div className="cart-row" key={item.id}>
              <div>
                <strong>{item.full_name}</strong>
                <p>@{item.username} · {roleLabel(item.role)}</p>
                <p>Branch: {branches.find((branch) => String(branch.id) === String(item.branch))?.name || 'N/A'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className={item.is_active ? 'pill muted' : 'pill low-stock-pill'} style={{ display: 'inline-block' }}>{item.is_active ? 'Active' : 'Inactive'}</p>
                <div className="pill-row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="button secondary" onClick={() => startEdit(item)}>Sửa</button>
                  <button type="button" className="button ghost" onClick={() => setDeleteTarget(item)}>Xóa</button>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="cart-row"><strong>Không có nhân viên</strong></div>}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa nhân viên"
        description={`Bạn có chắc chắn muốn xóa ${deleteTarget?.full_name || 'nhân viên này'} không?`}
        confirmLabel="Xóa"
        onConfirm={deleteStaff}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
